class PDVServices {
  constructor(database) {
    this.db = database;
  }

  // ==================== PRODUTOS ====================
  criarProduto(produto) {
    const stmt = this.db.prepare(`
      INSERT INTO produtos (nome, descricao, codigo_barras, referencia, preco, custo, margem_lucro, 
                           estoque_atual, estoque_minimo, data_validade, categoria_id, fornecedor_id, imagem)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const margem = produto.custo ? ((produto.preco - produto.custo) / produto.custo * 100) : 0;
    
    return stmt.run(
      produto.nome, produto.descricao, produto.codigo_barras, produto.referencia,
      produto.preco, produto.custo, margem, produto.estoque_atual || 0,
      produto.estoque_minimo || 0, produto.data_validade, produto.categoria_id,
      produto.fornecedor_id, produto.imagem
    );
  }

  listarProdutos(filtros = {}) {
    let query = `
      SELECT p.*, c.nome as categoria_nome, c.cor as categoria_cor,
             f.nome as fornecedor_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.ativo = 1
    `;
    
    const params = [];
    
    if (filtros.categoria_id) {
      query += ` AND p.categoria_id = ?`;
      params.push(filtros.categoria_id);
    }
    
    if (filtros.busca) {
      query += ` AND (p.nome LIKE ? OR p.codigo_barras LIKE ? OR p.referencia LIKE ?)`;
      params.push(`%${filtros.busca}%`, `%${filtros.busca}%`, `%${filtros.busca}%`);
    }
    
    query += ` ORDER BY p.nome`;
    
    return this.db.prepare(query).all(params);
  }

  // ==================== VENDAS ====================
  criarVenda(venda) {
    const transaction = this.db.transaction(() => {
      // Gerar número da venda
      const numeroVenda = this.gerarNumeroVenda();
      
      // Inserir venda
      const stmtVenda = this.db.prepare(`
        INSERT INTO vendas (numero_venda, cliente_id, usuario_id, subtotal, desconto, total, forma_pagamento, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const resultVenda = stmtVenda.run(
        numeroVenda, venda.cliente_id, venda.usuario_id,
        venda.subtotal, venda.desconto, venda.total,
        venda.forma_pagamento, venda.observacoes
      );
      
      // Inserir itens da venda
      const stmtItem = this.db.prepare(`
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, custo_unitario, subtotal, lucro)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      venda.itens.forEach(item => {
        const produto = this.db.prepare('SELECT custo FROM produtos WHERE id = ?').get(item.produto_id);
        const custo = produto?.custo || 0;
        const lucro = (item.preco_unitario - custo) * item.quantidade;
        
        stmtItem.run(
          resultVenda.lastInsertRowid, item.produto_id, item.quantidade,
          item.preco_unitario, custo, item.subtotal, lucro
        );
        
        // Atualizar estoque
        this.atualizarEstoque(item.produto_id, -item.quantidade, 'Venda', venda.usuario_id);
      });
      
      // Registrar movimentação de caixa
      this.registrarMovimentacaoCaixa({
        conta_id: 1, // Caixa principal
        tipo: 'entrada',
        categoria: 'venda',
        valor: venda.total,
        descricao: `Venda ${numeroVenda}`,
        usuario_id: venda.usuario_id
      });
      
      return { id: resultVenda.lastInsertRowid, numero_venda: numeroVenda };
    });
    
    return transaction();
  }

  getVendaPorId(id) {
    const venda = this.db.prepare(`
      SELECT v.*, c.nome as cliente_nome, u.nome as usuario_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?
    `).get(id);
    
    if (venda) {
      const itens = this.db.prepare(`
        SELECT iv.*, p.nome as produto_nome
        FROM itens_venda iv
        JOIN produtos p ON iv.produto_id = p.id
        WHERE iv.venda_id = ?
      `).all(id);
      
      venda.itens = itens;
    }
    
    return venda;
  }

  // ==================== FINANCEIRO - CAIXA ====================
  abrirCaixa(dados) {
    const transaction = this.db.transaction(() => {
      // Verificar se já existe caixa aberto hoje
      const caixaAberto = this.db.prepare(`
        SELECT id FROM movimentacoes_caixa 
        WHERE categoria = 'abertura' AND DATE(data_movimentacao) = DATE('now')
      `).get();
      
      if (caixaAberto) {
        throw new Error('Caixa já foi aberto hoje');
      }
      
      // Registrar abertura do caixa
      this.registrarMovimentacaoCaixa({
        conta_id: dados.conta_id || 1,
        tipo: 'entrada',
        categoria: 'abertura',
        valor: dados.valor_inicial,
        descricao: 'Abertura do caixa',
        usuario_id: dados.usuario_id
      });
      
      // Atualizar saldo da conta
      this.atualizarSaldoConta(dados.conta_id || 1, dados.valor_inicial);
      
      return { sucesso: true, mensagem: 'Caixa aberto com sucesso' };
    });
    
    return transaction();
  }

  fecharCaixa(dados) {
    const transaction = this.db.transaction(() => {
      // Calcular movimento do dia
      const movimentoDia = this.db.prepare(`
        SELECT 
          SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
          SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas
        FROM movimentacoes_caixa 
        WHERE conta_id = ? AND DATE(data_movimentacao) = DATE('now')
      `).get(dados.conta_id || 1);
      
      const saldoFinal = (movimentoDia.entradas || 0) - (movimentoDia.saidas || 0);
      
      // Registrar fechamento
      this.registrarMovimentacaoCaixa({
        conta_id: dados.conta_id || 1,
        tipo: 'saida',
        categoria: 'fechamento',
        valor: 0,
        descricao: `Fechamento do caixa - Saldo: R$ ${saldoFinal.toFixed(2)}`,
        usuario_id: dados.usuario_id
      });
      
      return { 
        sucesso: true, 
        saldo_final: saldoFinal,
        entradas: movimentoDia.entradas || 0,
        saidas: movimentoDia.saidas || 0
      };
    });
    
    return transaction();
  }

  realizarSangria(dados) {
    const transaction = this.db.transaction(() => {
      // Verificar saldo disponível
      const conta = this.db.prepare('SELECT saldo_atual FROM contas_bancarias WHERE id = ?').get(dados.conta_id);
      
      if (conta.saldo_atual < dados.valor) {
        throw new Error('Saldo insuficiente para sangria');
      }
      
      // Registrar sangria
      this.registrarMovimentacaoCaixa({
        conta_id: dados.conta_id,
        tipo: 'saida',
        categoria: 'sangria',
        valor: dados.valor,
        descricao: dados.descricao || 'Sangria do caixa',
        usuario_id: dados.usuario_id
      });
      
      // Atualizar saldo
      this.atualizarSaldoConta(dados.conta_id, -dados.valor);
      
      return { sucesso: true, mensagem: 'Sangria realizada com sucesso' };
    });
    
    return transaction();
  }

  // ==================== CONTAS A PAGAR ====================
  criarContaPagar(conta) {
    const stmt = this.db.prepare(`
      INSERT INTO contas_pagar (fornecedor_id, descricao, categoria, valor_original, valor_restante,
                               data_vencimento, documento, observacoes, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      conta.fornecedor_id, conta.descricao, conta.categoria,
      conta.valor_original, conta.valor_original, conta.data_vencimento,
      conta.documento, conta.observacoes, conta.usuario_id
    );
  }

  pagarConta(dados) {
    const transaction = this.db.transaction(() => {
      // Buscar conta
      const conta = this.db.prepare('SELECT * FROM contas_pagar WHERE id = ?').get(dados.conta_id);
      
      if (!conta) {
        throw new Error('Conta não encontrada');
      }
      
      if (conta.status === 'pago') {
        throw new Error('Conta já foi paga');
      }
      
      const valorPago = dados.valor_pagamento;
      const novoValorPago = conta.valor_pago + valorPago;
      const novoValorRestante = conta.valor_original - novoValorPago;
      const novoStatus = novoValorRestante <= 0 ? 'pago' : 'parcial';
      
      // Atualizar conta
      const stmtUpdate = this.db.prepare(`
        UPDATE contas_pagar 
        SET valor_pago = ?, valor_restante = ?, status = ?, 
            data_pagamento = ?, forma_pagamento = ?, conta_id = ?
        WHERE id = ?
      `);
      
      stmtUpdate.run(
        novoValorPago, novoValorRestante, novoStatus,
        new Date().toISOString().split('T')[0],
        dados.forma_pagamento, dados.conta_bancaria_id, dados.conta_id
      );
      
      // Registrar movimentação de caixa
      this.registrarMovimentacaoCaixa({
        conta_id: dados.conta_bancaria_id,
        tipo: 'saida',
        categoria: 'pagamento',
        valor: valorPago,
        descricao: `Pagamento: ${conta.descricao}`,
        documento: conta.documento,
        usuario_id: dados.usuario_id
      });
      
      // Atualizar saldo
      this.atualizarSaldoConta(dados.conta_bancaria_id, -valorPago);
      
      return { sucesso: true, mensagem: 'Pagamento realizado com sucesso' };
    });
    
    return transaction();
  }

  listarContasPagar(filtros = {}) {
    let query = `
      SELECT cp.*, f.nome as fornecedor_nome, cb.nome as conta_nome
      FROM contas_pagar cp
      LEFT JOIN fornecedores f ON cp.fornecedor_id = f.id
      LEFT JOIN contas_bancarias cb ON cp.conta_id = cb.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.status) {
      query += ` AND cp.status = ?`;
      params.push(filtros.status);
    }
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND cp.data_vencimento BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` ORDER BY cp.data_vencimento`;
    
    return this.db.prepare(query).all(params);
  }

  // ==================== CONTAS A RECEBER ====================
  criarContaReceber(conta) {
    const stmt = this.db.prepare(`
      INSERT INTO contas_receber (cliente_id, venda_id, descricao, valor_original, valor_restante,
                                 data_vencimento, documento, observacoes, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      conta.cliente_id, conta.venda_id, conta.descricao,
      conta.valor_original, conta.valor_original, conta.data_vencimento,
      conta.documento, conta.observacoes, conta.usuario_id
    );
  }

  receberConta(dados) {
    const transaction = this.db.transaction(() => {
      // Buscar conta
      const conta = this.db.prepare('SELECT * FROM contas_receber WHERE id = ?').get(dados.conta_id);
      
      if (!conta) {
        throw new Error('Conta não encontrada');
      }
      
      if (conta.status === 'recebido') {
        throw new Error('Conta já foi recebida');
      }
      
      const valorRecebido = dados.valor_recebimento;
      const novoValorRecebido = conta.valor_recebido + valorRecebido;
      const novoValorRestante = conta.valor_original - novoValorRecebido;
      const novoStatus = novoValorRestante <= 0 ? 'recebido' : 'parcial';
      
      // Atualizar conta
      const stmtUpdate = this.db.prepare(`
        UPDATE contas_receber 
        SET valor_recebido = ?, valor_restante = ?, status = ?, 
            data_recebimento = ?, forma_pagamento = ?, conta_id = ?
        WHERE id = ?
      `);
      
      stmtUpdate.run(
        novoValorRecebido, novoValorRestante, novoStatus,
        new Date().toISOString().split('T')[0],
        dados.forma_pagamento, dados.conta_bancaria_id, dados.conta_id
      );
      
      // Registrar movimentação de caixa
      this.registrarMovimentacaoCaixa({
        conta_id: dados.conta_bancaria_id,
        tipo: 'entrada',
        categoria: 'recebimento',
        valor: valorRecebido,
        descricao: `Recebimento: ${conta.descricao}`,
        documento: conta.documento,
        usuario_id: dados.usuario_id
      });
      
      // Atualizar saldo
      this.atualizarSaldoConta(dados.conta_bancaria_id, valorRecebido);
      
      return { sucesso: true, mensagem: 'Recebimento realizado com sucesso' };
    });
    
    return transaction();
  }

  listarContasReceber(filtros = {}) {
    let query = `
      SELECT cr.*, c.nome as cliente_nome, cb.nome as conta_nome
      FROM contas_receber cr
      LEFT JOIN clientes c ON cr.cliente_id = c.id
      LEFT JOIN contas_bancarias cb ON cr.conta_id = cb.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.status) {
      query += ` AND cr.status = ?`;
      params.push(filtros.status);
    }
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND cr.data_vencimento BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` ORDER BY cr.data_vencimento`;
    
    return this.db.prepare(query).all(params);
  }

  // ==================== RELATÓRIOS FINANCEIROS ====================
  getFluxoCaixa(filtros = {}) {
    let query = `
      SELECT 
        mc.*,
        cb.nome as conta_nome,
        u.nome as usuario_nome,
        DATE(mc.data_movimentacao) as data
      FROM movimentacoes_caixa mc
      LEFT JOIN contas_bancarias cb ON mc.conta_id = cb.id
      LEFT JOIN usuarios u ON mc.usuario_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(mc.data_movimentacao) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    if (filtros.conta_id) {
      query += ` AND mc.conta_id = ?`;
      params.push(filtros.conta_id);
    }
    
    query += ` ORDER BY mc.data_movimentacao DESC`;
    
    const movimentacoes = this.db.prepare(query).all(params);
    
    // Calcular resumo
    const resumo = {
      total_entradas: 0,
      total_saidas: 0,
      saldo_liquido: 0
    };
    
    movimentacoes.forEach(mov => {
      if (mov.tipo === 'entrada') {
        resumo.total_entradas += mov.valor;
      } else {
        resumo.total_saidas += mov.valor;
      }
    });
    
    resumo.saldo_liquido = resumo.total_entradas - resumo.total_saidas;
    
    return { movimentacoes, resumo };
  }

  getDRE(periodo) {
    const { data_inicio, data_fim } = this.calcularPeriodo(periodo);
    
    // Receitas (Vendas)
    const receitas = this.db.prepare(`
      SELECT 
        SUM(total) as total_vendas,
        COUNT(*) as quantidade_vendas,
        AVG(total) as ticket_medio
      FROM vendas 
      WHERE DATE(criado_em) BETWEEN ? AND ?
    `).get(data_inicio, data_fim);
    
    // Custos dos produtos vendidos
    const custos = this.db.prepare(`
      SELECT SUM(custo_unitario * quantidade) as custo_total
      FROM itens_venda iv
      JOIN vendas v ON iv.venda_id = v.id
      WHERE DATE(v.criado_em) BETWEEN ? AND ?
    `).get(data_inicio, data_fim);
    
    // Despesas
    const despesas = this.db.prepare(`
      SELECT 
        categoria,
        SUM(valor) as total
      FROM despesas 
      WHERE DATE(data_despesa) BETWEEN ? AND ?
      GROUP BY categoria
    `).all(data_inicio, data_fim);
    
    const totalDespesas = despesas.reduce((acc, desp) => acc + desp.total, 0);
    
    // Cálculos do DRE
    const receitaBruta = receitas.total_vendas || 0;
    const custoVendas = custos.custo_total || 0;
    const lucroBruto = receitaBruta - custoVendas;
    const lucroLiquido = lucroBruto - totalDespesas;
    
    return {
      periodo: { data_inicio, data_fim },
      receita_bruta: receitaBruta,
      custo_vendas: custoVendas,
      lucro_bruto: lucroBruto,
      despesas: despesas,
      total_despesas: totalDespesas,
      lucro_liquido: lucroLiquido,
      margem_bruta: receitaBruta > 0 ? (lucroBruto / receitaBruta * 100) : 0,
      margem_liquida: receitaBruta > 0 ? (lucroLiquido / receitaBruta * 100) : 0
    };
  }

  // ==================== RELATÓRIOS DE VENDAS ====================
  getRelatorioVendasDetalhado(filtros = {}) {
    let query = `
      SELECT 
        v.*,
        c.nome as cliente_nome,
        u.nome as vendedor_nome,
        COUNT(iv.id) as total_itens,
        SUM(iv.lucro) as lucro_total
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN itens_venda iv ON v.id = iv.venda_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(v.criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    if (filtros.vendedor_id) {
      query += ` AND v.usuario_id = ?`;
      params.push(filtros.vendedor_id);
    }
    
    if (filtros.cliente_id) {
      query += ` AND v.cliente_id = ?`;
      params.push(filtros.cliente_id);
    }
    
    query += ` GROUP BY v.id ORDER BY v.criado_em DESC`;
    
    return this.db.prepare(query).all(params);
  }

  getRelatorioVendas(periodo) {
    const { data_inicio, data_fim } = this.calcularPeriodo(periodo);
    
    // Resumo de vendas
    const resumo = this.db.prepare(`
      SELECT 
        COUNT(*) as total_vendas,
        SUM(total) as faturamento_total,
        AVG(total) as ticket_medio
      FROM vendas 
      WHERE DATE(criado_em) BETWEEN ? AND ?
    `).get(data_inicio, data_fim);
    
    // Vendas por forma de pagamento
    const vendasPorFormaPagamento = this.db.prepare(`
      SELECT 
        forma_pagamento,
        COUNT(*) as quantidade,
        SUM(total) as valor_total
      FROM vendas 
      WHERE DATE(criado_em) BETWEEN ? AND ?
      GROUP BY forma_pagamento
    `).all(data_inicio, data_fim);
    
    // Produtos mais vendidos
    const produtosMaisVendidos = this.db.prepare(`
      SELECT 
        p.nome,
        SUM(iv.quantidade) as quantidade_vendida,
        SUM(iv.subtotal) as valor_total
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE DATE(v.criado_em) BETWEEN ? AND ?
      GROUP BY p.id, p.nome
      ORDER BY quantidade_vendida DESC
      LIMIT 10
    `).all(data_inicio, data_fim);
    
    return {
      periodo: { inicio: data_inicio, fim: data_fim },
      resumo,
      vendas_por_forma_pagamento: vendasPorFormaPagamento,
      produtos_mais_vendidos: produtosMaisVendidos
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================
  registrarMovimentacaoCaixa(dados) {
    const stmt = this.db.prepare(`
      INSERT INTO movimentacoes_caixa (conta_id, tipo, categoria, valor, descricao, documento, usuario_id, data_movimentacao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      dados.conta_id, dados.tipo, dados.categoria, dados.valor,
      dados.descricao, dados.documento, dados.usuario_id,
      dados.data_movimentacao || new Date().toISOString()
    );
  }

  atualizarSaldoConta(contaId, valor) {
    const stmt = this.db.prepare(`
      UPDATE contas_bancarias 
      SET saldo_atual = saldo_atual + ? 
      WHERE id = ?
    `);
    
    return stmt.run(valor, contaId);
  }

  atualizarEstoque(produtoId, quantidade, motivo, usuarioId) {
    const produto = this.db.prepare('SELECT estoque_atual FROM produtos WHERE id = ?').get(produtoId);
    const novoEstoque = produto.estoque_atual + quantidade;
    
    // Atualizar produto
    this.db.prepare('UPDATE produtos SET estoque_atual = ? WHERE id = ?').run(novoEstoque, produtoId);
    
    // Registrar movimentação
    this.db.prepare(`
      INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, quantidade_anterior, quantidade_atual, motivo, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      produtoId, quantidade > 0 ? 'entrada' : 'saida', Math.abs(quantidade),
      produto.estoque_atual, novoEstoque, motivo, usuarioId
    );
  }

  gerarNumeroVenda() {
    const hoje = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const ultimaVenda = this.db.prepare(`
      SELECT numero_venda FROM vendas 
      WHERE numero_venda LIKE ? 
      ORDER BY id DESC LIMIT 1
    `).get(`${hoje}%`);
    
    let sequencial = 1;
    if (ultimaVenda) {
      const ultimoSequencial = parseInt(ultimaVenda.numero_venda.slice(-4));
      sequencial = ultimoSequencial + 1;
    }
    
    return `${hoje}${sequencial.toString().padStart(4, '0')}`;
  }

  calcularPeriodo(periodo) {
    const hoje = new Date();
    let data_inicio, data_fim;
    
    switch (periodo) {
      case 'hoje':
        data_inicio = data_fim = hoje.toISOString().split('T')[0];
        break;
      case 'mes':
        data_inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        data_fim = hoje.toISOString().split('T')[0];
        break;
      case 'ano':
        data_inicio = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
        data_fim = hoje.toISOString().split('T')[0];
        break;
      default:
        data_inicio = data_fim = hoje.toISOString().split('T')[0];
    }
    
    return { data_inicio, data_fim };
  }

  // ==================== RELATÓRIOS DE VENDAS ====================
  getRelatorioVendasPorVendedor(filtros = {}) {
    let query = `
      SELECT 
        u.nome as vendedor_nome,
        COUNT(v.id) as total_vendas,
        SUM(v.total) as faturamento_total,
        AVG(v.total) as ticket_medio,
        SUM(iv.lucro) as lucro_total
      FROM vendas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN itens_venda iv ON v.id = iv.venda_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(v.criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` GROUP BY u.id, u.nome ORDER BY faturamento_total DESC`;
    
    return this.db.prepare(query).all(params);
  }

  getRelatorioVendasPorCliente(filtros = {}) {
    let query = `
      SELECT 
        c.nome as cliente_nome,
        c.email,
        c.telefone,
        COUNT(v.id) as total_vendas,
        SUM(v.total) as faturamento_total,
        AVG(v.total) as ticket_medio,
        MAX(v.criado_em) as ultima_compra
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(v.criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` GROUP BY c.id, c.nome ORDER BY faturamento_total DESC`;
    
    return this.db.prepare(query).all(params);
  }

  getRelatorioVendasPorProduto(filtros = {}) {
    let query = `
      SELECT 
        p.nome as produto_nome,
        p.codigo_barras,
        c.nome as categoria_nome,
        SUM(iv.quantidade) as quantidade_vendida,
        SUM(iv.subtotal) as faturamento_total,
        SUM(iv.lucro) as lucro_total,
        AVG(iv.preco_unitario) as preco_medio
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      JOIN vendas v ON iv.venda_id = v.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(v.criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    if (filtros.categoria_id) {
      query += ` AND p.categoria_id = ?`;
      params.push(filtros.categoria_id);
    }
    
    query += ` GROUP BY p.id, p.nome ORDER BY quantidade_vendida DESC`;
    
    return this.db.prepare(query).all(params);
  }

  getRelatorioVendasPorCategoria(filtros = {}) {
    let query = `
      SELECT 
        c.nome as categoria_nome,
        c.cor as categoria_cor,
        COUNT(DISTINCT p.id) as produtos_diferentes,
        SUM(iv.quantidade) as quantidade_vendida,
        SUM(iv.subtotal) as faturamento_total,
        SUM(iv.lucro) as lucro_total
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      JOIN vendas v ON iv.venda_id = v.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(v.criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` GROUP BY c.id, c.nome ORDER BY faturamento_total DESC`;
    
    return this.db.prepare(query).all(params);
  }

  getRelatorioVendasPorFormaPagamento(filtros = {}) {
    let query = `
      SELECT 
        forma_pagamento,
        COUNT(*) as quantidade_vendas,
        SUM(total) as faturamento_total,
        AVG(total) as ticket_medio,
        (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM vendas WHERE DATE(criado_em) BETWEEN ? AND ?)) as percentual
      FROM vendas 
      WHERE DATE(criado_em) BETWEEN ? AND ?
      GROUP BY forma_pagamento
      ORDER BY faturamento_total DESC
    `;
    
    const { data_inicio, data_fim } = this.calcularPeriodo(filtros.periodo || 'mes');
    
    return this.db.prepare(query).all(data_inicio, data_fim, data_inicio, data_fim);
  }

  getRelatorioMargemLucro(filtros = {}) {
    let query = `
      SELECT 
        p.nome as produto_nome,
        p.preco as preco_venda,
        p.custo as custo_produto,
        p.margem_lucro,
        SUM(iv.quantidade) as quantidade_vendida,
        SUM(iv.subtotal) as faturamento_total,
        SUM(iv.lucro) as lucro_total,
        (SUM(iv.lucro) / SUM(iv.subtotal) * 100) as margem_real
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(v.criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` GROUP BY p.id, p.nome ORDER BY margem_real DESC`;
    
    return this.db.prepare(query).all(params);
  }

  getResumoVendasMensal(ano) {
    const query = `
      SELECT 
        strftime('%m', criado_em) as mes,
        COUNT(*) as total_vendas,
        SUM(total) as faturamento_total,
        AVG(total) as ticket_medio
      FROM vendas 
      WHERE strftime('%Y', criado_em) = ?
      GROUP BY strftime('%m', criado_em)
      ORDER BY mes
    `;
    
    return this.db.prepare(query).all(ano.toString());
  }

  getResumoVendasDiario(filtros = {}) {
    let query = `
      SELECT 
        DATE(criado_em) as data,
        COUNT(*) as total_vendas,
        SUM(total) as faturamento_total,
        AVG(total) as ticket_medio
      FROM vendas 
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` GROUP BY DATE(criado_em) ORDER BY data DESC`;
    
    return this.db.prepare(query).all(params);
  }

  // ==================== RELATÓRIOS DE ESTOQUE ====================
  getRelatorioEstoque(filtros = {}) {
    let query = `
      SELECT 
        p.*,
        c.nome as categoria_nome,
        f.nome as fornecedor_nome,
        (p.estoque_atual * p.custo) as valor_estoque,
        CASE 
          WHEN p.estoque_atual <= p.estoque_minimo THEN 'baixo'
          WHEN p.estoque_atual <= (p.estoque_minimo * 2) THEN 'medio'
          ELSE 'alto'
        END as nivel_estoque
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.ativo = 1
    `;
    
    const params = [];
    
    if (filtros.categoria_id) {
      query += ` AND p.categoria_id = ?`;
      params.push(filtros.categoria_id);
    }
    
    if (filtros.nivel_estoque) {
      if (filtros.nivel_estoque === 'baixo') {
        query += ` AND p.estoque_atual <= p.estoque_minimo`;
      } else if (filtros.nivel_estoque === 'medio') {
        query += ` AND p.estoque_atual > p.estoque_minimo AND p.estoque_atual <= (p.estoque_minimo * 2)`;
      }
    }
    
    query += ` ORDER BY p.nome`;
    
    return this.db.prepare(query).all(params);
  }

  getRelatorioEstoqueMinimo() {
    const query = `
      SELECT 
        p.*,
        c.nome as categoria_nome,
        f.nome as fornecedor_nome,
        (p.estoque_atual * p.custo) as valor_estoque
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.ativo = 1 AND p.estoque_atual <= p.estoque_minimo
      ORDER BY (p.estoque_atual - p.estoque_minimo) ASC
    `;
    
    return this.db.prepare(query).all();
  }

  getRelatorioInventario(filtros = {}) {
    let query = `
      SELECT 
        p.nome as produto_nome,
        p.codigo_barras,
        p.estoque_atual,
        p.custo,
        (p.estoque_atual * p.custo) as valor_total,
        c.nome as categoria_nome,
        p.data_validade
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.ativo = 1
    `;
    
    const params = [];
    
    if (filtros.categoria_id) {
      query += ` AND p.categoria_id = ?`;
      params.push(filtros.categoria_id);
    }
    
    query += ` ORDER BY valor_total DESC`;
    
    const produtos = this.db.prepare(query).all(params);
    
    const resumo = {
      total_produtos: produtos.length,
      valor_total_estoque: produtos.reduce((acc, p) => acc + p.valor_total, 0),
      produtos_sem_estoque: produtos.filter(p => p.estoque_atual === 0).length,
      produtos_estoque_baixo: produtos.filter(p => p.estoque_atual <= p.estoque_minimo).length
    };
    
    return { produtos, resumo };
  }

  getRelatorioProdutosVencimento(dias = 30) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);
    
    const query = `
      SELECT 
        p.*,
        c.nome as categoria_nome,
        f.nome as fornecedor_nome,
        (p.estoque_atual * p.custo) as valor_estoque,
        julianday(p.data_validade) - julianday('now') as dias_para_vencer
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.ativo = 1 
        AND p.data_validade IS NOT NULL 
        AND p.data_validade <= ?
      ORDER BY p.data_validade ASC
    `;
    
    return this.db.prepare(query).all(dataLimite.toISOString().split('T')[0]);
  }

  // ==================== RELATÓRIOS DE COMPRAS ====================
  getRelatorioComprasPorPeriodo(filtros = {}) {
    // Assumindo que temos uma tabela de compras
    let query = `
      SELECT 
        c.*,
        f.nome as fornecedor_nome,
        COUNT(ic.id) as total_itens,
        SUM(ic.quantidade) as quantidade_total,
        SUM(ic.subtotal) as valor_total
      FROM compras c
      JOIN fornecedores f ON c.fornecedor_id = f.id
      LEFT JOIN itens_compra ic ON c.id = ic.compra_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(c.data_compra) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    if (filtros.fornecedor_id) {
      query += ` AND c.fornecedor_id = ?`;
      params.push(filtros.fornecedor_id);
    }
    
    query += ` GROUP BY c.id ORDER BY c.data_compra DESC`;
    
    return this.db.prepare(query).all(params);
  }

  // ==================== CONSULTAS ====================
  consultarProdutos(filtros = {}) {
    let query = `
      SELECT 
        p.*,
        c.nome as categoria_nome,
        f.nome as fornecedor_nome,
        (p.estoque_atual * p.custo) as valor_estoque
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.ativo = 1
    `;
    
    const params = [];
    
    if (filtros.codigo) {
      query += ` AND (p.codigo_barras LIKE ? OR p.referencia LIKE ?)`;
      params.push(`%${filtros.codigo}%`, `%${filtros.codigo}%`);
    }
    
    if (filtros.descricao) {
      query += ` AND p.nome LIKE ?`;
      params.push(`%${filtros.descricao}%`);
    }
    
    if (filtros.categoria_id) {
      query += ` AND p.categoria_id = ?`;
      params.push(filtros.categoria_id);
    }
    
    query += ` ORDER BY p.nome`;
    
    return this.db.prepare(query).all(params);
  }

  consultarAniversariantes(mes = null) {
    let query = `
      SELECT 
        nome,
        email,
        telefone,
        data_nascimento,
        strftime('%d/%m', data_nascimento) as aniversario
      FROM clientes 
      WHERE ativo = 1 AND data_nascimento IS NOT NULL
    `;
    
    const params = [];
    
    if (mes) {
      query += ` AND strftime('%m', data_nascimento) = ?`;
      params.push(mes.toString().padStart(2, '0'));
    }
    
    query += ` ORDER BY strftime('%m-%d', data_nascimento)`;
    
    return this.db.prepare(query).all(params);
  }

  consultarEstoqueFinanceiro(filtros = {}) {
    let query = `
      SELECT 
        p.nome as produto_nome,
        p.codigo_barras,
        p.estoque_atual,
        p.custo,
        p.preco,
        (p.estoque_atual * p.custo) as valor_custo_total,
        (p.estoque_atual * p.preco) as valor_venda_total,
        ((p.estoque_atual * p.preco) - (p.estoque_atual * p.custo)) as lucro_potencial,
        c.nome as categoria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.ativo = 1 AND p.estoque_atual > 0
    `;
    
    const params = [];
    
    if (filtros.categoria_id) {
      query += ` AND p.categoria_id = ?`;
      params.push(filtros.categoria_id);
    }
    
    query += ` ORDER BY valor_venda_total DESC`;
    
    const produtos = this.db.prepare(query).all(params);
    
    const resumo = {
      valor_total_custo: produtos.reduce((acc, p) => acc + p.valor_custo_total, 0),
      valor_total_venda: produtos.reduce((acc, p) => acc + p.valor_venda_total, 0),
      lucro_potencial_total: produtos.reduce((acc, p) => acc + p.lucro_potencial, 0)
    };
    
    return { produtos, resumo };
  }

  consultarClientesInadimplentes() {
    const query = `
      SELECT 
        c.nome as cliente_nome,
        c.email,
        c.telefone,
        COUNT(cr.id) as contas_em_atraso,
        SUM(cr.valor_restante) as valor_total_em_atraso,
        MIN(cr.data_vencimento) as vencimento_mais_antigo,
        MAX(cr.data_vencimento) as ultimo_vencimento
      FROM clientes c
      JOIN contas_receber cr ON c.id = cr.cliente_id
      WHERE cr.status IN ('pendente', 'parcial') 
        AND cr.data_vencimento < DATE('now')
      GROUP BY c.id, c.nome
      ORDER BY valor_total_em_atraso DESC
    `;
    
    return this.db.prepare(query).all();
  }

  consultarHistoricoVendasCliente(clienteId) {
    const query = `
      SELECT 
        v.*,
        COUNT(iv.id) as total_itens,
        SUM(iv.quantidade) as quantidade_total
      FROM vendas v
      LEFT JOIN itens_venda iv ON v.id = iv.venda_id
      WHERE v.cliente_id = ?
      GROUP BY v.id
      ORDER BY v.criado_em DESC
    `;
    
    const vendas = this.db.prepare(query).all(clienteId);
    
    // Buscar detalhes de cada venda
    vendas.forEach(venda => {
      const itens = this.db.prepare(`
        SELECT 
          iv.*,
          p.nome as produto_nome
        FROM itens_venda iv
        JOIN produtos p ON iv.produto_id = p.id
        WHERE iv.venda_id = ?
      `).all(venda.id);
      
      venda.itens = itens;
    });
    
    return vendas;
  }

  consultarSituacaoCliente(clienteId) {
    const cliente = this.db.prepare('SELECT * FROM clientes WHERE id = ?').get(clienteId);
    
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }
    
    // Histórico de vendas
    const totalVendas = this.db.prepare(`
      SELECT 
        COUNT(*) as quantidade,
        SUM(total) as valor_total,
        AVG(total) as ticket_medio,
        MAX(criado_em) as ultima_compra
      FROM vendas 
      WHERE cliente_id = ?
    `).get(clienteId);
    
    // Contas em aberto
    const contasEmAberto = this.db.prepare(`
      SELECT 
        COUNT(*) as quantidade,
        SUM(valor_restante) as valor_total
      FROM contas_receber 
      WHERE cliente_id = ? AND status IN ('pendente', 'parcial')
    `).get(clienteId);
    
    // Contas vencidas
    const contasVencidas = this.db.prepare(`
      SELECT 
        COUNT(*) as quantidade,
        SUM(valor_restante) as valor_total
      FROM contas_receber 
      WHERE cliente_id = ? 
        AND status IN ('pendente', 'parcial')
        AND data_vencimento < DATE('now')
    `).get(clienteId);
    
    return {
      cliente,
      vendas: totalVendas,
      contas_em_aberto: contasEmAberto,
      contas_vencidas: contasVencidas,
      status_credito: contasVencidas.quantidade > 0 ? 'bloqueado' : 'liberado'
    };
  }

  // ==================== RELATÓRIOS DE COMISSÃO ====================
  getRelatorioComissaoVendedores(filtros = {}) {
    let query = `
      SELECT 
        u.nome as vendedor_nome,
        COUNT(v.id) as total_vendas,
        SUM(v.total) as faturamento_total,
        SUM(iv.lucro) as lucro_total,
        (SUM(iv.lucro) * 0.05) as comissao_5_porcento,
        (SUM(v.total) * 0.02) as comissao_2_porcento_faturamento
      FROM vendas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN itens_venda iv ON v.id = iv.venda_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(v.criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    if (filtros.vendedor_id) {
      query += ` AND v.usuario_id = ?`;
      params.push(filtros.vendedor_id);
    }
    
    query += ` GROUP BY u.id, u.nome ORDER BY faturamento_total DESC`;
    
    return this.db.prepare(query).all(params);
  }

  // ==================== GRÁFICOS E DASHBOARDS ====================
  getDadosGraficoVendasPorDia(dias = 30) {
    const query = `
      SELECT 
        DATE(criado_em) as data,
        COUNT(*) as quantidade_vendas,
        SUM(total) as faturamento
      FROM vendas 
      WHERE DATE(criado_em) >= DATE('now', '-${dias} days')
      GROUP BY DATE(criado_em)
      ORDER BY data
    `;
    
    return this.db.prepare(query).all();
  }

  getDadosGraficoVendasPorCategoria(filtros = {}) {
    let query = `
      SELECT 
        c.nome as categoria,
        c.cor,
        SUM(iv.quantidade) as quantidade,
        SUM(iv.subtotal) as faturamento
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(v.criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` GROUP BY c.id, c.nome ORDER BY faturamento DESC`;
    
    return this.db.prepare(query).all(params);
  }

  getDadosGraficoFormaPagamento(filtros = {}) {
    let query = `
      SELECT 
        forma_pagamento,
        COUNT(*) as quantidade,
        SUM(total) as faturamento
      FROM vendas 
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filtros.data_inicio && filtros.data_fim) {
      query += ` AND DATE(criado_em) BETWEEN ? AND ?`;
      params.push(filtros.data_inicio, filtros.data_fim);
    }
    
    query += ` GROUP BY forma_pagamento ORDER BY faturamento DESC`;
    
    return this.db.prepare(query).all(params);
  }

  // ==================== CATEGORIAS ====================
  criarCategoria(categoria) {
    const stmt = this.db.prepare(`
      INSERT INTO categorias (nome, descricao, cor)
      VALUES (?, ?, ?)
    `);
    
    return stmt.run(categoria.nome, categoria.descricao, categoria.cor);
  }

  listarCategorias() {
    return this.db.prepare('SELECT * FROM categorias WHERE ativo = 1 ORDER BY nome').all();
  }

  // ==================== CLIENTES ====================
  criarCliente(cliente) {
    const stmt = this.db.prepare(`
      INSERT INTO clientes (nome, email, telefone, cpf, data_nascimento, endereco, cidade, estado, cep, limite_credito, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      cliente.nome, cliente.email, cliente.telefone, cliente.cpf, cliente.data_nascimento,
      cliente.endereco, cliente.cidade, cliente.estado, cliente.cep, 
      cliente.limite_credito || 0, cliente.observacoes
    );
  }

  listarClientes(filtros = {}) {
    let query = 'SELECT * FROM clientes WHERE ativo = 1';
    const params = [];
    
    if (filtros.busca) {
      query += ` AND (nome LIKE ? OR email LIKE ? OR cpf LIKE ?)`;
      params.push(`%${filtros.busca}%`, `%${filtros.busca}%`, `%${filtros.busca}%`);
    }
    
    query += ' ORDER BY nome';
    
    return this.db.prepare(query).all(params);
  }

  // ==================== FORNECEDORES ====================
  criarFornecedor(fornecedor) {
    const stmt = this.db.prepare(`
      INSERT INTO fornecedores (nome, razao_social, cnpj, email, telefone, endereco, cidade, estado, cep, contato, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      fornecedor.nome, fornecedor.razao_social, fornecedor.cnpj, fornecedor.email,
      fornecedor.telefone, fornecedor.endereco, fornecedor.cidade, fornecedor.estado,
      fornecedor.cep, fornecedor.contato, fornecedor.observacoes
    );
  }

  listarFornecedores(filtros = {}) {
    let query = 'SELECT * FROM fornecedores WHERE ativo = 1';
    const params = [];
    
    if (filtros.busca) {
      query += ` AND (nome LIKE ? OR razao_social LIKE ? OR cnpj LIKE ?)`;
      params.push(`%${filtros.busca}%`, `%${filtros.busca}%`, `%${filtros.busca}%`);
    }
    
    query += ' ORDER BY nome';
    
    return this.db.prepare(query).all(params);
  }

  // ==================== CONTAS BANCÁRIAS ====================
  criarContaBancaria(conta) {
    const stmt = this.db.prepare(`
      INSERT INTO contas_bancarias (nome, tipo, banco, agencia, conta, saldo_inicial, saldo_atual)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      conta.nome, conta.tipo, conta.banco, conta.agencia,
      conta.conta, conta.saldo_inicial, conta.saldo_inicial
    );
  }

  listarContasBancarias() {
    return this.db.prepare('SELECT * FROM contas_bancarias WHERE ativo = 1 ORDER BY nome').all();
  }

  // ==================== FUNCIONALIDADES GERENCIAIS ====================

  // Backup do banco de dados
  criarBackup(nomeBackup = null) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = nomeBackup || `backup_${timestamp}.db`;
      const backupPath = path.join(__dirname, '..', 'backups', backupName);
      
      // Criar diretório de backups se não existir
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Copiar arquivo do banco de dados
      const dbPath = this.db.name;
      fs.copyFileSync(dbPath, backupPath);
      
      // Registrar backup na tabela
      const stmt = this.db.prepare(`
        INSERT INTO backups (nome_arquivo, caminho_arquivo, tamanho_bytes, data_criacao)
        VALUES (?, ?, ?, datetime('now'))
      `);
      
      const stats = fs.statSync(backupPath);
      stmt.run(backupName, backupPath, stats.size);
      
      return {
        sucesso: true,
        mensagem: 'Backup criado com sucesso',
        arquivo: backupName,
        caminho: backupPath,
        tamanho: stats.size
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao criar backup: ${error.message}`
      };
    }
  }

  // Restaurar backup
  restaurarBackup(caminhoBackup) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(caminhoBackup)) {
        return {
          sucesso: false,
          mensagem: 'Arquivo de backup não encontrado'
        };
      }
      
      // Criar backup atual antes de restaurar
      const backupAtual = this.criarBackup(`backup_pre_restore_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
      
      // Fechar conexão atual
      this.db.close();
      
      // Substituir arquivo do banco
      const dbPath = path.join(__dirname, 'pdv_database.db');
      fs.copyFileSync(caminhoBackup, dbPath);
      
      // Reabrir conexão
      const Database = require('better-sqlite3');
      this.db = new Database(dbPath);
      
      return {
        sucesso: true,
        mensagem: 'Backup restaurado com sucesso',
        backup_seguranca: backupAtual.arquivo
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao restaurar backup: ${error.message}`
      };
    }
  }

  // Listar backups disponíveis
  listarBackups() {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM backups 
        ORDER BY data_criacao DESC
      `);
      
      const backups = stmt.all();
      const fs = require('fs');
      
      // Verificar se arquivos ainda existem
      return backups.map(backup => ({
        ...backup,
        arquivo_existe: fs.existsSync(backup.caminho_arquivo),
        tamanho_formatado: this.formatarTamanhoArquivo(backup.tamanho_bytes)
      }));
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  }

  // Excluir backup
  excluirBackup(backupId) {
    try {
      const fs = require('fs');
      
      // Buscar informações do backup
      const stmt = this.db.prepare('SELECT * FROM backups WHERE id = ?');
      const backup = stmt.get(backupId);
      
      if (!backup) {
        return {
          sucesso: false,
          mensagem: 'Backup não encontrado'
        };
      }
      
      // Excluir arquivo físico
      if (fs.existsSync(backup.caminho_arquivo)) {
        fs.unlinkSync(backup.caminho_arquivo);
      }
      
      // Remover registro do banco
      const deleteStmt = this.db.prepare('DELETE FROM backups WHERE id = ?');
      deleteStmt.run(backupId);
      
      return {
        sucesso: true,
        mensagem: 'Backup excluído com sucesso'
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao excluir backup: ${error.message}`
      };
    }
  }

  // Configurações do sistema
  obterConfiguracoes() {
    try {
      const stmt = this.db.prepare('SELECT * FROM configuracoes');
      const configs = stmt.all();
      
      const configuracoes = {};
      configs.forEach(config => {
        configuracoes[config.chave] = {
          valor: config.valor,
          tipo: config.tipo,
          descricao: config.descricao,
          categoria: config.categoria
        };
      });
      
      return configuracoes;
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return {};
    }
  }

  // Salvar configuração
  salvarConfiguracao(chave, valor, tipo = 'string', descricao = '', categoria = 'geral') {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO configuracoes (chave, valor, tipo, descricao, categoria, data_atualizacao)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);
      
      stmt.run(chave, valor, tipo, descricao, categoria);
      
      return {
        sucesso: true,
        mensagem: 'Configuração salva com sucesso'
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao salvar configuração: ${error.message}`
      };
    }
  }

  // Obter configuração específica
  obterConfiguracao(chave, valorPadrao = null) {
    try {
      const stmt = this.db.prepare('SELECT valor, tipo FROM configuracoes WHERE chave = ?');
      const config = stmt.get(chave);
      
      if (!config) {
        return valorPadrao;
      }
      
      // Converter valor baseado no tipo
      switch (config.tipo) {
        case 'boolean':
          return config.valor === 'true';
        case 'number':
          return parseFloat(config.valor);
        case 'json':
          return JSON.parse(config.valor);
        default:
          return config.valor;
      }
    } catch (error) {
      console.error('Erro ao obter configuração:', error);
      return valorPadrao;
    }
  }

  // Resetar configurações para padrão
  resetarConfiguracoes() {
    try {
      // Backup das configurações atuais
      const configsAtuais = this.obterConfiguracoes();
      const backupConfigs = this.criarBackup(`backup_configs_${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
      
      // Limpar configurações
      this.db.prepare('DELETE FROM configuracoes').run();
      
      // Inserir configurações padrão
      this.inserirConfiguracoesPadrao();
      
      return {
        sucesso: true,
        mensagem: 'Configurações resetadas para padrão',
        backup_criado: backupConfigs.arquivo
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro ao resetar configurações: ${error.message}`
      };
    }
  }

  // Inserir configurações padrão
  inserirConfiguracoesPadrao() {
    const configsPadrao = [
      { chave: 'empresa_nome', valor: 'Minha Empresa', tipo: 'string', descricao: 'Nome da empresa', categoria: 'empresa' },
      { chave: 'empresa_cnpj', valor: '', tipo: 'string', descricao: 'CNPJ da empresa', categoria: 'empresa' },
      { chave: 'empresa_endereco', valor: '', tipo: 'string', descricao: 'Endereço da empresa', categoria: 'empresa' },
      { chave: 'empresa_telefone', valor: '', tipo: 'string', descricao: 'Telefone da empresa', categoria: 'empresa' },
      { chave: 'pdv_impressora_padrao', valor: '', tipo: 'string', descricao: 'Impressora padrão do PDV', categoria: 'pdv' },
      { chave: 'pdv_imprimir_automatico', valor: 'true', tipo: 'boolean', descricao: 'Imprimir recibo automaticamente', categoria: 'pdv' },
      { chave: 'estoque_alerta_minimo', valor: 'true', tipo: 'boolean', descricao: 'Alertar quando estoque baixo', categoria: 'estoque' },
      { chave: 'financeiro_backup_automatico', valor: 'true', tipo: 'boolean', descricao: 'Backup automático diário', categoria: 'financeiro' },
      { chave: 'sistema_tema', valor: 'claro', tipo: 'string', descricao: 'Tema do sistema', categoria: 'interface' },
      { chave: 'sistema_idioma', valor: 'pt-BR', tipo: 'string', descricao: 'Idioma do sistema', categoria: 'interface' }
    ];
    
    const stmt = this.db.prepare(`
      INSERT INTO configuracoes (chave, valor, tipo, descricao, categoria, data_atualizacao)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);
    
    configsPadrao.forEach(config => {
      stmt.run(config.chave, config.valor, config.tipo, config.descricao, config.categoria);
    });
  }

  // Estatísticas do sistema
  obterEstatisticasSistema() {
    try {
      const stats = {};
      
      // Estatísticas de vendas
      stats.vendas = {
        total_vendas: this.db.prepare('SELECT COUNT(*) as count FROM vendas').get().count,
        faturamento_total: this.db.prepare('SELECT SUM(valor_total) as total FROM vendas').get().total || 0,
        venda_hoje: this.db.prepare("SELECT COUNT(*) as count FROM vendas WHERE date(data_venda) = date('now')").get().count,
        faturamento_hoje: this.db.prepare("SELECT SUM(valor_total) as total FROM vendas WHERE date(data_venda) = date('now')").get().total || 0
      };
      
      // Estatísticas de produtos
      stats.produtos = {
        total_produtos: this.db.prepare('SELECT COUNT(*) as count FROM produtos WHERE ativo = 1').get().count,
        produtos_estoque_baixo: this.db.prepare('SELECT COUNT(*) as count FROM produtos WHERE ativo = 1 AND estoque_atual <= estoque_minimo').get().count,
        produtos_sem_estoque: this.db.prepare('SELECT COUNT(*) as count FROM produtos WHERE ativo = 1 AND estoque_atual = 0').get().count,
        valor_total_estoque: this.db.prepare('SELECT SUM(estoque_atual * custo) as total FROM produtos WHERE ativo = 1').get().total || 0
      };
      
      // Estatísticas de clientes
      stats.clientes = {
        total_clientes: this.db.prepare('SELECT COUNT(*) as count FROM clientes WHERE ativo = 1').get().count,
        clientes_inadimplentes: this.db.prepare("SELECT COUNT(DISTINCT cliente_id) as count FROM contas_receber WHERE status = 'pendente' AND data_vencimento < date('now')").get().count
      };
      
      // Estatísticas financeiras
      stats.financeiro = {
        contas_pagar_pendentes: this.db.prepare("SELECT COUNT(*) as count FROM contas_pagar WHERE status = 'pendente'").get().count,
        valor_contas_pagar: this.db.prepare("SELECT SUM(valor) as total FROM contas_pagar WHERE status = 'pendente'").get().total || 0,
        contas_receber_pendentes: this.db.prepare("SELECT COUNT(*) as count FROM contas_receber WHERE status = 'pendente'").get().count,
        valor_contas_receber: this.db.prepare("SELECT SUM(valor) as total FROM contas_receber WHERE status = 'pendente'").get().total || 0
      };
      
      // Estatísticas do banco de dados
      const fs = require('fs');
      const dbPath = this.db.name;
      const dbStats = fs.statSync(dbPath);
      
      stats.sistema = {
        tamanho_banco: dbStats.size,
        tamanho_banco_formatado: this.formatarTamanhoArquivo(dbStats.size),
        data_criacao_banco: dbStats.birthtime,
        ultima_modificacao: dbStats.mtime,
        total_backups: this.db.prepare('SELECT COUNT(*) as count FROM backups').get().count
      };
      
      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {};
    }
  }

  // Função auxiliar para formatar tamanho de arquivo
  formatarTamanhoArquivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Limpeza de dados antigos
  limparDadosAntigos(diasParaManter = 365) {
    try {
      const resultado = {
        vendas_removidas: 0,
        logs_removidos: 0,
        backups_removidos: 0
      };
      
      // Remover vendas antigas (manter apenas X dias)
      const vendasStmt = this.db.prepare(`
        DELETE FROM vendas 
        WHERE data_venda < date('now', '-${diasParaManter} days')
      `);
      resultado.vendas_removidas = vendasStmt.run().changes;
      
      // Remover logs antigos
      const logsStmt = this.db.prepare(`
        DELETE FROM logs 
        WHERE data_log < date('now', '-${diasParaManter} days')
      `);
      resultado.logs_removidos = logsStmt.run().changes;
      
      // Remover backups antigos (manter apenas 30 dias)
      const backupsAntigos = this.db.prepare(`
        SELECT * FROM backups 
        WHERE data_criacao < date('now', '-30 days')
      `).all();
      
      const fs = require('fs');
      backupsAntigos.forEach(backup => {
        try {
          if (fs.existsSync(backup.caminho_arquivo)) {
            fs.unlinkSync(backup.caminho_arquivo);
          }
          this.db.prepare('DELETE FROM backups WHERE id = ?').run(backup.id);
          resultado.backups_removidos++;
        } catch (error) {
          console.error('Erro ao remover backup:', error);
        }
      });
      
      return {
        sucesso: true,
        mensagem: 'Limpeza concluída com sucesso',
        detalhes: resultado
      };
    } catch (error) {
      return {
        sucesso: false,
        mensagem: `Erro na limpeza: ${error.message}`
      };
    }
  }
}

module.exports = PDVServices;

