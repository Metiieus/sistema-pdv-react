const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const DatabaseManager = require('./database.cjs');
const PDVServices = require('./services.cjs');
const PrinterService = require('./printer.cjs');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let database;
let pdvServices;
let printerService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    titleBarStyle: 'default',
    show: false
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  database = new DatabaseManager();
  pdvServices = new PDVServices(database);
  printerService = new PrinterService();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// DB handlers
ipcMain.handle('db-query', async (event, sql, params) => {
  try {
    return database.query(sql, params);
  } catch (error) {
    console.error('Erro na consulta:', error);
    throw error;
  }
});

ipcMain.handle('db-run', async (event, sql, params) => {
  try {
    return database.run(sql, params);
  } catch (error) {
    console.error('Erro na execução:', error);
    throw error;
  }
});

ipcMain.handle('db-get', async (event, sql, params) => {
  try {
    return database.get(sql, params);
  } catch (error) {
    console.error('Erro na consulta:', error);
    throw error;
  }
});

// PDV: Produtos
ipcMain.handle('pdv-get-produtos', async (event, filtros) => {
  return pdvServices.getProdutos(filtros);
});

ipcMain.handle('pdv-get-produto-por-id', async (event, id) => {
  return pdvServices.getProdutoPorId(id);
});

ipcMain.handle('pdv-get-produto-por-codigo', async (event, codigo) => {
  return pdvServices.getProdutoPorCodigoBarras(codigo);
});

ipcMain.handle('pdv-adicionar-produto', async (event, produto) => {
  const resultado = await pdvServices.adicionarProduto(produto);
  if (mainWindow) {
    mainWindow.webContents.send('produtos-atualizados');
  }
  return resultado;
});

ipcMain.handle('pdv-atualizar-produto', async (event, produto) => {
  const resultado = await pdvServices.atualizarProduto(produto);
  if (mainWindow) {
    mainWindow.webContents.send('produtos-atualizados');
  }
  return resultado;
});

ipcMain.handle('pdv-deletar-produto', async (event, id) => {
  const resultado = await pdvServices.deletarProduto(id);
  if (mainWindow) {
    mainWindow.webContents.send('produtos-atualizados');
  }
  return resultado;
});

// PDV: Categorias
ipcMain.handle('pdv-get-categorias', async (event) => {
  return pdvServices.getCategorias();
});

ipcMain.handle('pdv-adicionar-categoria', async (event, categoria) => {
  return pdvServices.adicionarCategoria(categoria);
});

// PDV: Clientes
ipcMain.handle('pdv-get-clientes', async (event, filtros) => {
  return pdvServices.getClientes(filtros);
});

ipcMain.handle('pdv-adicionar-cliente', async (event, cliente) => {
  return pdvServices.adicionarCliente(cliente);
});

// PDV: Vendas
ipcMain.handle('pdv-criar-venda', async (event, venda) => {
  return pdvServices.criarVenda(venda);
});

ipcMain.handle('pdv-get-vendas', async (event, filtros) => {
  return pdvServices.getVendas(filtros);
});

ipcMain.handle('pdv-get-venda-por-id', async (event, id) => {
  return pdvServices.getVendaPorId(id);
});

ipcMain.handle('pdv-get-relatorio-vendas', async (event, periodo) => {
  return pdvServices.getRelatorioVendas(periodo);
});

// Relatórios
ipcMain.handle('relatorio-vendas-por-vendedor', async (event, filtros) => {
  return pdvServices.getRelatorioVendasPorVendedor(filtros);
});

ipcMain.handle('relatorio-vendas-por-cliente', async (event, filtros) => {
  return pdvServices.getRelatorioVendasPorCliente(filtros);
});

ipcMain.handle('relatorio-vendas-por-produto', async (event, filtros) => {
  return pdvServices.getRelatorioVendasPorProduto(filtros);
});

ipcMain.handle('relatorio-vendas-por-categoria', async (event, filtros) => {
  return pdvServices.getRelatorioVendasPorCategoria(filtros);
});

ipcMain.handle('relatorio-vendas-por-forma-pagamento', async (event, filtros) => {
  return pdvServices.getRelatorioVendasPorFormaPagamento(filtros);
});

ipcMain.handle('relatorio-margem-lucro', async (event, filtros) => {
  return pdvServices.getRelatorioMargemLucro(filtros);
});

ipcMain.handle('resumo-vendas-mensal', async (event, ano) => {
  return pdvServices.getResumoVendasMensal(ano);
});

ipcMain.handle('resumo-vendas-diario', async (event, filtros) => {
  return pdvServices.getResumoVendasDiario(filtros);
});

ipcMain.handle('relatorio-estoque', async (event, filtros) => {
  return pdvServices.getRelatorioEstoque(filtros);
});

ipcMain.handle('relatorio-estoque-minimo', async (event) => {
  return pdvServices.getRelatorioEstoqueMinimo();
});

ipcMain.handle('relatorio-inventario', async (event, filtros) => {
  return pdvServices.getRelatorioInventario(filtros);
});

ipcMain.handle('relatorio-produtos-vencimento', async (event, dias) => {
  return pdvServices.getRelatorioProdutosVencimento(dias);
});

// Relatórios de compras
ipcMain.handle('relatorio-compras-por-periodo', async (event, filtros) => {
  return pdvServices.getRelatorioComprasPorPeriodo(filtros);
});

// Consultas
ipcMain.handle('consultar-produtos', async (event, filtros) => {
  return pdvServices.consultarProdutos(filtros);
});

ipcMain.handle('consultar-aniversariantes', async (event, mes) => {
  return pdvServices.consultarAniversariantes(mes);
});

ipcMain.handle('consultar-estoque-financeiro', async (event, filtros) => {
  return pdvServices.consultarEstoqueFinanceiro(filtros);
});

ipcMain.handle('consultar-clientes-inadimplentes', async (event) => {
  return pdvServices.consultarClientesInadimplentes();
});

ipcMain.handle('consultar-historico-vendas-cliente', async (event, clienteId) => {
  return pdvServices.consultarHistoricoVendasCliente(clienteId);
});

ipcMain.handle('consultar-situacao-cliente', async (event, clienteId) => {
  return pdvServices.consultarSituacaoCliente(clienteId);
});

// Comissão
ipcMain.handle('relatorio-comissao-vendedores', async (event, filtros) => {
  return pdvServices.getRelatorioComissaoVendedores(filtros);
});

// Gráficos
ipcMain.handle('dados-grafico-vendas-por-dia', async (event, dias) => {
  return pdvServices.getDadosGraficoVendasPorDia(dias);
});

ipcMain.handle('dados-grafico-vendas-por-categoria', async (event, filtros) => {
  return pdvServices.getDadosGraficoVendasPorCategoria(filtros);
});

ipcMain.handle('dados-grafico-forma-pagamento', async (event, filtros) => {
  return pdvServices.getDadosGraficoFormaPagamento(filtros);
});

ipcMain.handle('pdv-verificar-estoque-baixo', async (event) => {
  return pdvServices.getRelatorioEstoqueMinimo();
});

// Backup e configuração
ipcMain.handle('gerencial-criar-backup', async (event, nomeBackup) => {
  return pdvServices.criarBackup(nomeBackup);
});

ipcMain.handle('gerencial-restaurar-backup', async (event, caminhoBackup) => {
  return pdvServices.restaurarBackup(caminhoBackup);
});

ipcMain.handle('gerencial-listar-backups', async (event) => {
  return pdvServices.listarBackups();
});

ipcMain.handle('gerencial-excluir-backup', async (event, backupId) => {
  return pdvServices.excluirBackup(backupId);
});

ipcMain.handle('gerencial-obter-configuracoes', async (event) => {
  return pdvServices.obterConfiguracoes();
});

ipcMain.handle('gerencial-salvar-configuracao', async (event, chave, valor, tipo, descricao, categoria) => {
  return pdvServices.salvarConfiguracao(chave, valor, tipo, descricao, categoria);
});

ipcMain.handle('gerencial-obter-configuracao', async (event, chave, valorPadrao) => {
  return pdvServices.obterConfiguracao(chave, valorPadrao);
});

ipcMain.handle('gerencial-resetar-configuracoes', async (event) => {
  return pdvServices.resetarConfiguracoes();
});

ipcMain.handle('gerencial-obter-estatisticas', async (event) => {
  return pdvServices.obterEstatisticasSistema();
});

ipcMain.handle('gerencial-limpar-dados-antigos', async (event, diasParaManter) => {
  return pdvServices.limparDadosAntigos(diasParaManter);
});

// Impressão
ipcMain.handle('print-receipt', async (event, dadosVenda) => {
  return printerService.imprimirRecibo(dadosVenda);
});

ipcMain.handle('print-report', async (event, dadosRelatorio) => {
  return printerService.imprimirRelatorio(dadosRelatorio);
});

ipcMain.handle('print-test', async (event) => {
  return printerService.testarImpressora();
});

ipcMain.handle('printer-status', async (event) => {
  return printerService.obterStatusImpressora();
});

// Fechar banco ao sair
app.on('before-quit', () => {
  if (database) {
    database.close();
  }
});
