const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer');
const fs = require('fs');
const path = require('path');

class PrinterService {
  constructor() {
    this.printer = null;
    this.initializePrinter();
  }

  initializePrinter() {
    try {
      this.printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'printer:auto',
        characterSet: CharacterSet.PC850_MULTILINGUAL,
        removeSpecialCharacters: false,
        lineCharacter: "-",
        breakLine: BreakLine.WORD,
        options:{
          timeout: 5000,
        }
      });
    } catch (error) {
      console.log('Impressora não conectada, usando modo simulação');
      this.printer = null;
    }
  }

  async imprimirRecibo(dadosVenda) {
    try {
      const recibo = this.gerarReciboTexto(dadosVenda);
      
      if (this.printer) {
        // Impressão real
        this.printer.clear();
        this.printer.println(recibo);
        await this.printer.execute();
        return { sucesso: true, mensagem: 'Recibo impresso com sucesso!' };
      } else {
        // Modo simulação - salvar em arquivo
        const nomeArquivo = `recibo_${dadosVenda.numero_venda}.txt`;
        const caminhoArquivo = path.join(process.cwd(), 'recibos', nomeArquivo);
        
        // Criar diretório se não existir
        const dirRecibos = path.dirname(caminhoArquivo);
        if (!fs.existsSync(dirRecibos)) {
          fs.mkdirSync(dirRecibos, { recursive: true });
        }
        
        fs.writeFileSync(caminhoArquivo, recibo, 'utf8');
        
        return { 
          sucesso: true, 
          mensagem: `Recibo salvo em: ${caminhoArquivo}`,
          arquivo: caminhoArquivo
        };
      }
    } catch (error) {
      console.error('Erro ao imprimir recibo:', error);
      return { sucesso: false, mensagem: 'Erro ao imprimir recibo: ' + error.message };
    }
  }

  gerarReciboTexto(dadosVenda) {
    const data = new Date().toLocaleString('pt-BR');
    const linha = '================================';
    
    let recibo = `
${linha}
        SISTEMA PDV
${linha}
Data: ${data}
Venda: ${dadosVenda.numero_venda}
${dadosVenda.cliente_nome ? `Cliente: ${dadosVenda.cliente_nome}` : 'Cliente: Não informado'}
${linha}

ITENS:
`;

    // Adicionar itens
    dadosVenda.itens.forEach(item => {
      const subtotal = (item.preco_unitario * item.quantidade).toFixed(2);
      recibo += `${item.produto_nome}\n`;
      recibo += `${item.quantidade}x R$ ${item.preco_unitario.toFixed(2)} = R$ ${subtotal}\n\n`;
    });

    recibo += `${linha}
SUBTOTAL: R$ ${dadosVenda.subtotal.toFixed(2)}`;

    if (dadosVenda.desconto > 0) {
      recibo += `\nDESCONTO: R$ ${dadosVenda.desconto.toFixed(2)}`;
    }

    recibo += `\nTOTAL: R$ ${dadosVenda.total.toFixed(2)}
PAGAMENTO: ${dadosVenda.forma_pagamento.toUpperCase()}

${linha}
    Obrigado pela preferência!
${linha}
`;

    return recibo;
  }

  async imprimirRelatorio(dadosRelatorio) {
    try {
      const relatorio = this.gerarRelatorioTexto(dadosRelatorio);
      
      if (this.printer) {
        // Impressão real
        this.printer.clear();
        this.printer.println(relatorio);
        await this.printer.execute();
        return { sucesso: true, mensagem: 'Relatório impresso com sucesso!' };
      } else {
        // Modo simulação - salvar em arquivo
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const nomeArquivo = `relatorio_${timestamp}.txt`;
        const caminhoArquivo = path.join(process.cwd(), 'relatorios', nomeArquivo);
        
        // Criar diretório se não existir
        const dirRelatorios = path.dirname(caminhoArquivo);
        if (!fs.existsSync(dirRelatorios)) {
          fs.mkdirSync(dirRelatorios, { recursive: true });
        }
        
        fs.writeFileSync(caminhoArquivo, relatorio, 'utf8');
        
        return { 
          sucesso: true, 
          mensagem: `Relatório salvo em: ${caminhoArquivo}`,
          arquivo: caminhoArquivo
        };
      }
    } catch (error) {
      console.error('Erro ao imprimir relatório:', error);
      return { sucesso: false, mensagem: 'Erro ao imprimir relatório: ' + error.message };
    }
  }

  gerarRelatorioTexto(dados) {
    const data = new Date().toLocaleString('pt-BR');
    const linha = '================================';
    
    let relatorio = `
${linha}
      RELATÓRIO DE VENDAS
${linha}
Data: ${data}
Período: ${dados.periodo || 'Não especificado'}
${linha}

RESUMO:
Total de Vendas: ${dados.resumo.total_vendas}
Faturamento: R$ ${dados.resumo.faturamento_total.toFixed(2)}
Ticket Médio: R$ ${dados.resumo.ticket_medio.toFixed(2)}

${linha}
VENDAS POR FORMA DE PAGAMENTO:
`;

    dados.vendas_por_forma_pagamento.forEach(forma => {
      relatorio += `${forma.forma_pagamento}: ${forma.quantidade} vendas - R$ ${forma.valor_total.toFixed(2)}\n`;
    });

    relatorio += `\n${linha}
PRODUTOS MAIS VENDIDOS:
`;

    dados.produtos_mais_vendidos.forEach((produto, index) => {
      relatorio += `${index + 1}. ${produto.nome}\n`;
      relatorio += `   Qtd: ${produto.quantidade_vendida} - R$ ${produto.valor_total.toFixed(2)}\n\n`;
    });

    relatorio += `${linha}
Relatório gerado pelo Sistema PDV
${linha}
`;

    return relatorio;
  }

  async testarImpressora() {
    try {
      if (this.printer) {
        this.printer.clear();
        this.printer.println('Teste de impressão');
        this.printer.println('Sistema PDV funcionando!');
        this.printer.cut();
        await this.printer.execute();
        return { sucesso: true, mensagem: 'Teste de impressão realizado com sucesso!' };
      } else {
        return { sucesso: false, mensagem: 'Impressora não conectada - modo simulação ativo' };
      }
    } catch (error) {
      console.error('Erro no teste de impressão:', error);
      return { sucesso: false, mensagem: 'Erro no teste: ' + error.message };
    }
  }

  obterStatusImpressora() {
    return {
      conectada: this.printer !== null,
      tipo: this.printer ? 'Térmica EPSON' : 'Simulação',
      status: this.printer ? 'Pronta' : 'Desconectada'
    };
  }
}

module.exports = PrinterService;

