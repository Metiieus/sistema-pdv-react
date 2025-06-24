import { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  Barcode, 
  Tag, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const ConsultaProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    codigo: '',
    descricao: '',
    categoria_id: '',
    nivel_estoque: '',
    apenas_ativos: true
  });

  const categorias = [
    { id: 1, nome: 'Homeware', cor: '#10B981' },
    { id: 2, nome: 'Bedding', cor: '#8B5CF6' },
    { id: 3, nome: 'Skincare', cor: '#F59E0B' },
    { id: 4, nome: 'Fashion', cor: '#EF4444' },
    { id: 5, nome: 'Towels', cor: '#EC4899' }
  ];

  useEffect(() => {
    consultarProdutos();
  }, [filtros]);

  const consultarProdutos = async () => {
    setLoading(true);
    try {
      // Simular dados para demonstração
      const produtosSimulados = [
        {
          id: 1,
          nome: 'Ceramic Vases',
          codigo_barras: '7891234567890',
          referencia: 'CV001',
          categoria_nome: 'Homeware',
          categoria_cor: '#10B981',
          preco: 50.00,
          custo: 30.00,
          estoque_atual: 25,
          estoque_minimo: 10,
          valor_estoque: 750.00,
          ativo: true,
          data_cadastro: '2024-01-15',
          fornecedor_nome: 'Fornecedor ABC'
        },
        {
          id: 2,
          nome: 'Ceramic Vases Pink',
          codigo_barras: '7891234567891',
          referencia: 'CV002',
          categoria_nome: 'Homeware',
          categoria_cor: '#10B981',
          preco: 55.00,
          custo: 32.00,
          estoque_atual: 8,
          estoque_minimo: 15,
          valor_estoque: 256.00,
          ativo: true,
          data_cadastro: '2024-01-20',
          fornecedor_nome: 'Fornecedor ABC'
        },
        {
          id: 3,
          nome: 'Gift Card',
          codigo_barras: '7891234567892',
          referencia: 'GC001',
          categoria_nome: 'Geral',
          categoria_cor: '#6B7280',
          preco: 50.00,
          custo: 45.00,
          estoque_atual: 100,
          estoque_minimo: 20,
          valor_estoque: 4500.00,
          ativo: true,
          data_cadastro: '2024-02-01',
          fornecedor_nome: 'Interno'
        },
        {
          id: 4,
          nome: 'Bedding Set Premium',
          codigo_barras: '7891234567893',
          referencia: 'BS001',
          categoria_nome: 'Bedding',
          categoria_cor: '#8B5CF6',
          preco: 120.00,
          custo: 80.00,
          estoque_atual: 0,
          estoque_minimo: 5,
          valor_estoque: 0.00,
          ativo: true,
          data_cadastro: '2024-02-10',
          fornecedor_nome: 'Fornecedor XYZ'
        }
      ];

      // Aplicar filtros
      let produtosFiltrados = produtosSimulados;

      if (filtros.codigo) {
        produtosFiltrados = produtosFiltrados.filter(p => 
          p.codigo_barras.includes(filtros.codigo) || 
          p.referencia.toLowerCase().includes(filtros.codigo.toLowerCase())
        );
      }

      if (filtros.descricao) {
        produtosFiltrados = produtosFiltrados.filter(p => 
          p.nome.toLowerCase().includes(filtros.descricao.toLowerCase())
        );
      }

      if (filtros.categoria_id) {
        const categoriaSelecionada = categorias.find(c => c.id.toString() === filtros.categoria_id);
        if (categoriaSelecionada) {
          produtosFiltrados = produtosFiltrados.filter(p => 
            p.categoria_nome === categoriaSelecionada.nome
          );
        }
      }

      if (filtros.nivel_estoque) {
        produtosFiltrados = produtosFiltrados.filter(p => {
          if (filtros.nivel_estoque === 'baixo') {
            return p.estoque_atual <= p.estoque_minimo;
          } else if (filtros.nivel_estoque === 'zero') {
            return p.estoque_atual === 0;
          } else if (filtros.nivel_estoque === 'normal') {
            return p.estoque_atual > p.estoque_minimo;
          }
          return true;
        });
      }

      if (filtros.apenas_ativos) {
        produtosFiltrados = produtosFiltrados.filter(p => p.ativo);
      }

      setProdutos(produtosFiltrados);
    } catch (error) {
      console.error('Erro ao consultar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusEstoque = (produto) => {
    if (produto.estoque_atual === 0) {
      return { status: 'Sem Estoque', cor: 'red', icone: AlertTriangle };
    } else if (produto.estoque_atual <= produto.estoque_minimo) {
      return { status: 'Estoque Baixo', cor: 'yellow', icone: AlertTriangle };
    } else {
      return { status: 'Normal', cor: 'green', icone: CheckCircle };
    }
  };

  const limparFiltros = () => {
    setFiltros({
      codigo: '',
      descricao: '',
      categoria_id: '',
      nivel_estoque: '',
      apenas_ativos: true
    });
  };

  const exportarConsulta = () => {
    alert('Consulta exportada com sucesso!');
  };

  const visualizarProduto = (produto) => {
    alert(`Visualizando produto: ${produto.nome}`);
  };

  const editarProduto = (produto) => {
    alert(`Editando produto: ${produto.nome}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Consulta de Produtos</h1>
            <p className="text-gray-600">Busque produtos por código, descrição ou referência</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={consultarProdutos}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
          <button
            onClick={exportarConsulta}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros de Busca</h3>
          </div>
          <button
            onClick={limparFiltros}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Barcode className="w-4 h-4 inline mr-1" />
              Código/Referência
            </label>
            <input
              type="text"
              value={filtros.codigo}
              onChange={(e) => setFiltros(prev => ({ ...prev, codigo: e.target.value }))}
              placeholder="Código de barras ou referência"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Descrição
            </label>
            <input
              type="text"
              value={filtros.descricao}
              onChange={(e) => setFiltros(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Nome do produto"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="w-4 h-4 inline mr-1" />
              Categoria
            </label>
            <select
              value={filtros.categoria_id}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as Categorias</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Estoque</label>
            <select
              value={filtros.nivel_estoque}
              onChange={(e) => setFiltros(prev => ({ ...prev, nivel_estoque: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os Níveis</option>
              <option value="normal">Estoque Normal</option>
              <option value="baixo">Estoque Baixo</option>
              <option value="zero">Sem Estoque</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filtros.apenas_ativos}
                onChange={(e) => setFiltros(prev => ({ ...prev, apenas_ativos: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-sm text-gray-700">Apenas Ativos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-bold text-blue-600">{produtos.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total Estoque</p>
              <p className="text-2xl font-bold text-green-600">
                {formatarMoeda(produtos.reduce((acc, p) => acc + p.valor_estoque, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-yellow-600">
                {produtos.filter(p => p.estoque_atual <= p.estoque_minimo).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
              <p className="text-2xl font-bold text-red-600">
                {produtos.filter(p => p.estoque_atual === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Produtos Encontrados ({produtos.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código/Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Carregando produtos...</span>
                    </div>
                  </td>
                </tr>
              ) : produtos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Nenhum produto encontrado para os filtros selecionados
                  </td>
                </tr>
              ) : (
                produtos.map((produto) => {
                  const statusEstoque = getStatusEstoque(produto);
                  const IconeStatus = statusEstoque.icone;
                  
                  return (
                    <tr key={produto.id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                          <div className="text-sm text-gray-500">{produto.fornecedor_nome}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{produto.codigo_barras}</div>
                          <div className="text-sm text-gray-500">Ref: {produto.referencia}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: produto.categoria_cor }}
                          ></div>
                          <span className="text-sm text-gray-900">{produto.categoria_nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatarMoeda(produto.preco)}</div>
                          <div className="text-sm text-gray-500">Custo: {formatarMoeda(produto.custo)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{produto.estoque_atual}</div>
                          <div className="text-sm text-gray-500">Mín: {produto.estoque_minimo}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 text-${statusEstoque.cor}-600`}>
                          <IconeStatus className="w-4 h-4" />
                          <span className="text-sm font-medium">{statusEstoque.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatarMoeda(produto.valor_estoque)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => visualizarProduto(produto)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => editarProduto(produto)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsultaProdutos;

