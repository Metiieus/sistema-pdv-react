import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  CreditCard,
  Calendar,
  Download,
  Filter,
  Eye,
  DollarSign,
  Target,
  ShoppingCart
} from 'lucide-react';

const RelatoriosVendas = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState('vendedor');
  const [dadosRelatorio, setDadosRelatorio] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    categoria_id: '',
    vendedor_id: ''
  });

  const tiposRelatorio = [
    { id: 'vendedor', nome: 'Por Vendedor', icone: Users, cor: 'blue' },
    { id: 'cliente', nome: 'Por Cliente', icone: Users, cor: 'green' },
    { id: 'produto', nome: 'Por Produto', icone: Package, cor: 'purple' },
    { id: 'categoria', nome: 'Por Categoria', icone: BarChart3, cor: 'orange' },
    { id: 'forma-pagamento', nome: 'Por Forma de Pagamento', icone: CreditCard, cor: 'pink' },
    { id: 'margem-lucro', nome: 'Margem de Lucro', icone: Target, cor: 'indigo' }
  ];

  useEffect(() => {
    carregarRelatorio();
  }, [tipoRelatorio, filtros]);

  const carregarRelatorio = async () => {
    setLoading(true);
    try {
      // Simular dados para demonstração
      const dadosSimulados = gerarDadosSimulados();
      setDadosRelatorio(dadosSimulados);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const gerarDadosSimulados = () => {
    switch (tipoRelatorio) {
      case 'vendedor':
        return [
          { vendedor_nome: 'João Silva', total_vendas: 45, faturamento_total: 12500.00, ticket_medio: 277.78, lucro_total: 2500.00 },
          { vendedor_nome: 'Maria Santos', total_vendas: 38, faturamento_total: 9800.00, ticket_medio: 257.89, lucro_total: 1960.00 },
          { vendedor_nome: 'Pedro Costa', total_vendas: 32, faturamento_total: 8200.00, ticket_medio: 256.25, lucro_total: 1640.00 },
          { vendedor_nome: 'Ana Oliveira', total_vendas: 28, faturamento_total: 7100.00, ticket_medio: 253.57, lucro_total: 1420.00 }
        ];
      case 'cliente':
        return [
          { cliente_nome: 'Empresa ABC Ltda', email: 'contato@abc.com', total_vendas: 12, faturamento_total: 5600.00, ticket_medio: 466.67, ultima_compra: '2024-12-20' },
          { cliente_nome: 'Loja XYZ', email: 'vendas@xyz.com', total_vendas: 8, faturamento_total: 3200.00, ticket_medio: 400.00, ultima_compra: '2024-12-19' },
          { cliente_nome: 'Comércio 123', email: 'admin@123.com', total_vendas: 6, faturamento_total: 2400.00, ticket_medio: 400.00, ultima_compra: '2024-12-18' }
        ];
      case 'produto':
        return [
          { produto_nome: 'Ceramic Vases', codigo_barras: '7891234567890', categoria_nome: 'Homeware', quantidade_vendida: 85, faturamento_total: 4250.00, lucro_total: 850.00, preco_medio: 50.00 },
          { produto_nome: 'Ceramic Vases Pink', codigo_barras: '7891234567891', categoria_nome: 'Homeware', quantidade_vendida: 72, faturamento_total: 3600.00, lucro_total: 720.00, preco_medio: 50.00 },
          { produto_nome: 'Gift Card', codigo_barras: '7891234567892', categoria_nome: 'Geral', quantidade_vendida: 45, faturamento_total: 2250.00, lucro_total: 450.00, preco_medio: 50.00 }
        ];
      case 'categoria':
        return [
          { categoria_nome: 'Homeware', categoria_cor: '#10B981', produtos_diferentes: 15, quantidade_vendida: 245, faturamento_total: 12250.00, lucro_total: 2450.00 },
          { categoria_nome: 'Bedding', categoria_cor: '#8B5CF6', produtos_diferentes: 12, quantidade_vendida: 180, faturamento_total: 9000.00, lucro_total: 1800.00 },
          { categoria_nome: 'Skincare', categoria_cor: '#F59E0B', produtos_diferentes: 8, quantidade_vendida: 120, faturamento_total: 6000.00, lucro_total: 1200.00 }
        ];
      case 'forma-pagamento':
        return [
          { forma_pagamento: 'Cartão de Crédito', quantidade_vendas: 65, faturamento_total: 18200.00, ticket_medio: 280.00, percentual: 45.5 },
          { forma_pagamento: 'PIX', quantidade_vendas: 48, faturamento_total: 12800.00, ticket_medio: 266.67, percentual: 33.6 },
          { forma_pagamento: 'Dinheiro', quantidade_vendas: 30, faturamento_total: 6000.00, ticket_medio: 200.00, percentual: 21.0 }
        ];
      case 'margem-lucro':
        return [
          { produto_nome: 'Ceramic Vases', preco_venda: 50.00, custo_produto: 30.00, margem_lucro: 40.0, quantidade_vendida: 85, faturamento_total: 4250.00, lucro_total: 1700.00, margem_real: 40.0 },
          { produto_nome: 'Gift Card', preco_venda: 50.00, custo_produto: 45.00, margem_lucro: 10.0, quantidade_vendida: 45, faturamento_total: 2250.00, lucro_total: 225.00, margem_real: 10.0 }
        ];
      default:
        return [];
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

  const exportarRelatorio = () => {
    alert('Relatório exportado com sucesso!');
  };

  const renderColunas = () => {
    switch (tipoRelatorio) {
      case 'vendedor':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vendas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro Total</th>
          </>
        );
      case 'cliente':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Vendas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
          </>
        );
      case 'produto':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Vendida</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro</th>
          </>
        );
      case 'categoria':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Vendida</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro</th>
          </>
        );
      case 'forma-pagamento':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma de Pagamento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd Vendas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentual</th>
          </>
        );
      case 'margem-lucro':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Venda</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margem %</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lucro Total</th>
          </>
        );
      default:
        return null;
    }
  };

  const renderLinhas = () => {
    return dadosRelatorio.map((item, index) => (
      <tr key={index} className="bg-white hover:bg-gray-50">
        {tipoRelatorio === 'vendedor' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.vendedor_nome}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_vendas}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatarMoeda(item.faturamento_total)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarMoeda(item.ticket_medio)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{formatarMoeda(item.lucro_total)}</td>
          </>
        )}
        {tipoRelatorio === 'cliente' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.cliente_nome}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.total_vendas}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatarMoeda(item.faturamento_total)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarData(item.ultima_compra)}</td>
          </>
        )}
        {tipoRelatorio === 'produto' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.produto_nome}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.categoria_nome}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantidade_vendida}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatarMoeda(item.faturamento_total)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{formatarMoeda(item.lucro_total)}</td>
          </>
        )}
        {tipoRelatorio === 'categoria' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.categoria_cor }}
                ></div>
                <span>{item.categoria_nome}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.produtos_diferentes}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantidade_vendida}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatarMoeda(item.faturamento_total)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{formatarMoeda(item.lucro_total)}</td>
          </>
        )}
        {tipoRelatorio === 'forma-pagamento' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.forma_pagamento}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantidade_vendas}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatarMoeda(item.faturamento_total)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarMoeda(item.ticket_medio)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-semibold">{item.percentual.toFixed(1)}%</td>
          </>
        )}
        {tipoRelatorio === 'margem-lucro' && (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.produto_nome}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarMoeda(item.preco_venda)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarMoeda(item.custo_produto)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">{item.margem_real.toFixed(1)}%</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{formatarMoeda(item.lucro_total)}</td>
          </>
        )}
      </tr>
    ));
  };

  const tipoAtual = tiposRelatorio.find(t => t.id === tipoRelatorio);
  const IconeTipo = tipoAtual?.icone || BarChart3;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br from-${tipoAtual?.cor}-500 to-${tipoAtual?.cor}-600 rounded-lg flex items-center justify-center`}>
            <IconeTipo className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios de Vendas</h1>
            <p className="text-gray-600">Análise detalhada de performance de vendas</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportarRelatorio}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Tipos de Relatório */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {tiposRelatorio.map((tipo) => {
          const Icone = tipo.icone;
          return (
            <button
              key={tipo.id}
              onClick={() => setTipoRelatorio(tipo.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                tipoRelatorio === tipo.id
                  ? `border-${tipo.cor}-500 bg-${tipo.cor}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                tipoRelatorio === tipo.id
                  ? `bg-${tipo.cor}-500 text-white`
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Icone className="w-4 h-4" />
              </div>
              <p className={`text-sm font-medium ${
                tipoRelatorio === tipo.id ? `text-${tipo.cor}-700` : 'text-gray-700'
              }`}>
                {tipo.nome}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={filtros.categoria_id}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as Categorias</option>
              <option value="1">Homeware</option>
              <option value="2">Bedding</option>
              <option value="3">Skincare</option>
              <option value="4">Fashion</option>
              <option value="5">Towels</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
            <select
              value={filtros.vendedor_id}
              onChange={(e) => setFiltros(prev => ({ ...prev, vendedor_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os Vendedores</option>
              <option value="1">João Silva</option>
              <option value="2">Maria Santos</option>
              <option value="3">Pedro Costa</option>
              <option value="4">Ana Oliveira</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Relatório: {tipoAtual?.nome}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {renderColunas()}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Carregando dados...</span>
                    </div>
                  </td>
                </tr>
              ) : dadosRelatorio.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    Nenhum dado encontrado para os filtros selecionados
                  </td>
                </tr>
              ) : (
                renderLinhas()
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo */}
      {dadosRelatorio.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Registros</p>
                <p className="text-2xl font-bold text-blue-600">{dadosRelatorio.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          {tipoRelatorio === 'vendedor' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Faturamento</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarMoeda(dadosRelatorio.reduce((acc, item) => acc + item.faturamento_total, 0))}
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
                    <p className="text-sm font-medium text-gray-600">Total Vendas</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {dadosRelatorio.reduce((acc, item) => acc + item.total_vendas, 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lucro Total</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatarMoeda(dadosRelatorio.reduce((acc, item) => acc + item.lucro_total, 0))}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RelatoriosVendas;

