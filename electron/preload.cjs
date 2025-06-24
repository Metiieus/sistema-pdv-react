const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  pdv: {
    // Funções de produtos
    getProdutos: (filtros) => ipcRenderer.invoke('pdv-get-produtos', filtros),
    getProdutoPorId: (id) => ipcRenderer.invoke('pdv-get-produto-por-id', id),
    getProdutoPorCodigoBarras: (codigo) => ipcRenderer.invoke('pdv-get-produto-por-codigo', codigo),
    adicionarProduto: (produto) => ipcRenderer.invoke('pdv-adicionar-produto', produto),
    atualizarProduto: (produto) => ipcRenderer.invoke('pdv-atualizar-produto', produto),
    deletarProduto: (id) => ipcRenderer.invoke('pdv-deletar-produto', id),

    // Funções de categorias
    getCategorias: () => ipcRenderer.invoke('pdv-get-categorias'),
    adicionarCategoria: (categoria) => ipcRenderer.invoke('pdv-adicionar-categoria', categoria),

    // Funções de vendas
    getVendas: (filtros) => ipcRenderer.invoke('pdv-get-vendas', filtros),
    criarVenda: (venda) => ipcRenderer.invoke('pdv-criar-venda', venda),
    getRelatorioVendas: (periodo) => ipcRenderer.invoke('pdv-get-relatorio-vendas', periodo),
  },

  // Eventos de atualização de produtos
  onProdutosAtualizados: (callback) => ipcRenderer.on('produtos-atualizados', callback),
  removeProdutosAtualizados: () => ipcRenderer.removeAllListeners('produtos-atualizados'),

  // Informações do app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Acesso direto ao banco de dados (opcional)
  db: {
    query: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
    run: (sql, params) => ipcRenderer.invoke('db-run', sql, params),
    get: (sql, params) => ipcRenderer.invoke('db-get', sql, params),
  },

  // Controles da janela
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
});
