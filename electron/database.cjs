const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'sistema-pdv.db');
    
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
  }

  initializeTables() {
    // Tabela de usuários
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo TEXT DEFAULT 'vendedor',
        comissao DECIMAL(5,2) DEFAULT 0,
        ativo BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de categorias
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        cor TEXT DEFAULT '#6B7280',
        ativo BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de fornecedores
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS fornecedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        razao_social TEXT,
        cnpj TEXT UNIQUE,
        email TEXT,
        telefone TEXT,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        contato TEXT,
        observacoes TEXT,
        ativo BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de produtos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        codigo_barras TEXT UNIQUE,
        referencia TEXT,
        preco DECIMAL(10,2) NOT NULL,
        custo DECIMAL(10,2),
        margem_lucro DECIMAL(5,2),
        estoque_atual INTEGER DEFAULT 0,
        estoque_minimo INTEGER DEFAULT 0,
        data_validade DATE,
        categoria_id INTEGER,
        fornecedor_id INTEGER,
        imagem TEXT,
        ativo BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id),
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id)
      )
    `);

    // Tabela de clientes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        cpf TEXT UNIQUE,
        data_nascimento DATE,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        limite_credito DECIMAL(10,2) DEFAULT 0,
        bloqueado BOOLEAN DEFAULT 0,
        observacoes TEXT,
        ativo BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de vendas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_venda TEXT UNIQUE NOT NULL,
        cliente_id INTEGER,
        usuario_id INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        desconto DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        forma_pagamento TEXT NOT NULL,
        status TEXT DEFAULT 'concluida',
        observacoes TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    // Tabela de itens da venda
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS itens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,
        custo_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        lucro DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (venda_id) REFERENCES vendas (id),
        FOREIGN KEY (produto_id) REFERENCES produtos (id)
      )
    `);

    // Tabela de compras
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS compras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_compra TEXT UNIQUE NOT NULL,
        fornecedor_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        desconto DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        forma_pagamento TEXT NOT NULL,
        status TEXT DEFAULT 'concluida',
        data_entrega DATE,
        observacoes TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    // Tabela de itens da compra
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS itens_compra (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        compra_id INTEGER NOT NULL,
        produto_id INTEGER NOT NULL,
        quantidade INTEGER NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (compra_id) REFERENCES compras (id),
        FOREIGN KEY (produto_id) REFERENCES produtos (id)
      )
    `);

    // Tabela de movimentações de estoque
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER NOT NULL,
        tipo TEXT NOT NULL, -- 'entrada', 'saida', 'ajuste'
        quantidade INTEGER NOT NULL,
        quantidade_anterior INTEGER NOT NULL,
        quantidade_atual INTEGER NOT NULL,
        motivo TEXT,
        usuario_id INTEGER NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produto_id) REFERENCES produtos (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    // Tabela de contas bancárias/caixas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contas_bancarias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        tipo TEXT NOT NULL, -- 'caixa', 'conta_corrente', 'poupanca'
        banco TEXT,
        agencia TEXT,
        conta TEXT,
        saldo_inicial DECIMAL(10,2) DEFAULT 0,
        saldo_atual DECIMAL(10,2) DEFAULT 0,
        ativo BOOLEAN DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de movimentações de caixa
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS movimentacoes_caixa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conta_id INTEGER NOT NULL,
        tipo TEXT NOT NULL, -- 'entrada', 'saida', 'transferencia'
        categoria TEXT NOT NULL, -- 'venda', 'compra', 'despesa', 'receita', 'sangria', 'suprimento'
        valor DECIMAL(10,2) NOT NULL,
        descricao TEXT NOT NULL,
        documento TEXT,
        usuario_id INTEGER NOT NULL,
        data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conta_id) REFERENCES contas_bancarias (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    // Tabela de contas a pagar
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contas_pagar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fornecedor_id INTEGER,
        descricao TEXT NOT NULL,
        categoria TEXT NOT NULL, -- 'compra', 'despesa', 'servico'
        valor_original DECIMAL(10,2) NOT NULL,
        valor_pago DECIMAL(10,2) DEFAULT 0,
        valor_restante DECIMAL(10,2) NOT NULL,
        data_vencimento DATE NOT NULL,
        data_pagamento DATE,
        status TEXT DEFAULT 'pendente', -- 'pendente', 'pago', 'vencido', 'cancelado'
        forma_pagamento TEXT,
        conta_id INTEGER,
        documento TEXT,
        observacoes TEXT,
        usuario_id INTEGER NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id),
        FOREIGN KEY (conta_id) REFERENCES contas_bancarias (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    // Tabela de contas a receber
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contas_receber (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        venda_id INTEGER,
        descricao TEXT NOT NULL,
        valor_original DECIMAL(10,2) NOT NULL,
        valor_recebido DECIMAL(10,2) DEFAULT 0,
        valor_restante DECIMAL(10,2) NOT NULL,
        data_vencimento DATE NOT NULL,
        data_recebimento DATE,
        status TEXT DEFAULT 'pendente', -- 'pendente', 'recebido', 'vencido', 'cancelado'
        forma_pagamento TEXT,
        conta_id INTEGER,
        documento TEXT,
        observacoes TEXT,
        usuario_id INTEGER NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id),
        FOREIGN KEY (venda_id) REFERENCES vendas (id),
        FOREIGN KEY (conta_id) REFERENCES contas_bancarias (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    // Tabela de cheques
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cheques (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero TEXT NOT NULL,
        banco TEXT NOT NULL,
        agencia TEXT,
        conta TEXT,
        valor DECIMAL(10,2) NOT NULL,
        data_emissao DATE NOT NULL,
        data_vencimento DATE NOT NULL,
        data_compensacao DATE,
        emissor TEXT NOT NULL,
        beneficiario TEXT,
        status TEXT DEFAULT 'pendente', -- 'pendente', 'compensado', 'devolvido', 'cancelado'
        tipo TEXT NOT NULL, -- 'recebido', 'emitido'
        conta_id INTEGER,
        observacoes TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conta_id) REFERENCES contas_bancarias (id)
      )
    `);

    // Tabela de despesas
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS despesas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria TEXT NOT NULL, -- 'aluguel', 'energia', 'telefone', 'material', 'salario', 'outros'
        subcategoria TEXT,
        descricao TEXT NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        data_despesa DATE NOT NULL,
        forma_pagamento TEXT NOT NULL,
        conta_id INTEGER,
        documento TEXT,
        observacoes TEXT,
        usuario_id INTEGER NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conta_id) REFERENCES contas_bancarias (id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    // Tabela de configurações
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chave TEXT UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        descricao TEXT,
        tipo TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
        categoria TEXT DEFAULT 'geral',
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir dados iniciais
    this.insertInitialData();
  }

  insertInitialData() {
    // Verificar se já existem dados
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
    
    if (userCount.count === 0) {
      // Inserir usuário administrador padrão
      this.db.prepare(`
        INSERT INTO usuarios (nome, email, senha, tipo) 
        VALUES (?, ?, ?, ?)
      `).run('Administrador', 'admin@sistema.com', 'admin123', 'admin');

      // Inserir categorias padrão
      const categorias = [
        ['Homeware', 'Utensílios domésticos', '#8DD3C7'],
        ['Bedding', 'Roupas de cama', '#FFFFB3'],
        ['Skincare', 'Produtos de cuidados com a pele', '#BEBADA'],
        ['Fashion', 'Roupas e acessórios', '#FB8072'],
        ['Towels', 'Toalhas e produtos de banho', '#80B1D3']
      ];

      const insertCategoria = this.db.prepare(`
        INSERT INTO categorias (nome, descricao, cor) VALUES (?, ?, ?)
      `);

      categorias.forEach(categoria => {
        insertCategoria.run(...categoria);
      });

      // Inserir produtos de exemplo
      const produtos = [
        ['Ceramic Vases', 'Vasos cerâmicos decorativos', null, 4.60, 2.30, 10, 2, 1],
        ['Ceramic Vases Pink', 'Vasos cerâmicos rosa', null, 29.00, 14.50, 5, 1, 1],
        ['Gift Card', 'Cartão presente', 'GIFT001', 50.00, 0, 100, 10, null]
      ];

      const insertProduto = this.db.prepare(`
        INSERT INTO produtos (nome, descricao, codigo_barras, preco, custo, estoque_atual, estoque_minimo, categoria_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      produtos.forEach(produto => {
        insertProduto.run(...produto);
      });
    }
  }

  // Métodos de consulta
  query(sql, params = []) {
    try {
      return this.db.prepare(sql).all(params);
    } catch (error) {
      console.error('Erro na consulta:', error);
      throw error;
    }
  }

  get(sql, params = []) {
    try {
      return this.db.prepare(sql).get(params);
    } catch (error) {
      console.error('Erro na consulta:', error);
      throw error;
    }
  }

  run(sql, params = []) {
    try {
      return this.db.prepare(sql).run(params);
    } catch (error) {
      console.error('Erro na execução:', error);
      throw error;
    }
  }

  transaction(callback) {
    const transaction = this.db.transaction(callback);
    return transaction();
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;

