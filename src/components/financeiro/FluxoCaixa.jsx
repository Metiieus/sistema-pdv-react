import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter,
  Download,
  Eye,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from 'lucide-react';

const FluxoCaixa = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [contaSelecionada, setContaSelecionada] = useState('todas');
  const [tipoRelatorio, setTipoRelatorio] = useState('detalhado'); // 'detalhado' ou 'resumido'
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [resumo, setResumo] = useState({});
  const [contas, setContas] = useState([]);
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    categoria: 'todas'
  });

  useEffect(() => {
    carregarContas();
    carregarFluxoCaixa();
  }, [periodo, contaSelecionada, filtros]);

  const carregarContas = async () => {
    const contasSimuladas = [
      { id: 1, nome: 'Caixa Principal', tipo: 'caixa' },
      { id: 2, nome: 'Banco do Brasil - CC', tipo: 'conta_corrente' },
      { id: 3, nome: 'Itaú - Poupança', tipo: 'poupanca' }
    ];
    setContas(contasSimuladas);
  };

  const carregarFluxoCaixa = async () => {
    // Simular carregamento do fluxo de caixa
    const movimentacoesSimuladas = [
      {
        id: 1,
        data: '2024-12-21',
        hora: '09:15',
        tipo: 'entrada',
        categoria: 'venda',
        valor: 450.75,
        descricao: 'Venda 20241221001',
        conta_nome: 'Caixa Principal',
        usuario_nome: 'João Silva'
      },
      {
        id: 2,
        data: '2024-12-21',
        hora: '10:30',
        tipo: 'entrada',
        categoria: 'recebimento',
        valor: 850.00,
        descricao: 'Recebimento - Cliente Maria Santos',
        conta_nome: 'Banco do Brasil - CC',
        usuario_nome: 'João Silva'
      },
      {
        id: 3,
        data: '2024-12-21',
        hora: '11:45',
        tipo: 'saida',
        categoria: 'pagamento',
        valor: 320.50,
        descricao: 'Pagamento - Fornecedor ABC Ltda',
        conta_nome: 'Banco do Brasil - CC',
        usuario_nome: 'João Silva'
      },
      {
        id: 4,
        data: '2024-12-21',
        hora: '14:20',
        tipo: 'saida',
        categoria: 'sangria',
        valor: 200.00,
        descricao: 'Sangria para banco',
        conta_nome: 'Caixa Principal',
        usuario_nome: 'João Silva'
      },
      {
        id: 5,
        data: '2024-12-20',
        hora: '16:30',
        tipo: 'entrada',
        categoria: 'venda',
        valor: 125.90,
        descricao: 'Venda 20241220008',
        conta_nome: 'Caixa Principal',
        usuario_nome: 'Maria Costa'
      },
      {
        id: 6,
        data: '2024-12-20',
        hora: '17:15',
        tipo: 'saida',
        categoria: 'despesa',
        valor: 89.50,
        descricao: 'Despesa - Material de limpeza',
        conta_nome: 'Caixa Principal',
        usuario_nome: 'Maria Costa'
      }
    ];

    setMovimentacoes(movimentacoesSimuladas);

    // Calcular resumo
    const totalEntradas = movimentacoesSimuladas
      .filter(mov => mov.tipo === 'entrada')
      .reduce((acc, mov) => acc + mov.valor, 0);
    
    const totalSaidas = movimentacoesSimuladas
      .filter(mov => mov.tipo === 'saida')
      .reduce((acc, mov) => acc + mov.valor, 0);

    const saldoLiquido = totalEntradas - totalSaidas;

    // Resumo por categoria
    const resumoPorCategoria = {};
    movimentacoesSimuladas.forEach(mov => {
      if (!resumoPorCategoria[mov.categoria]) {
        resumoPorCategoria[mov.categoria] = { entradas: 0, saidas: 0 };
      }
      if (mov.tipo === 'entrada') {
        resumoPorCategoria[mov.categoria].entradas += mov.valor;
      } else {
        resumoPorCategoria[mov.categoria].saidas += mov.valor;
      }
    });

    setResumo({
      total_entradas: totalEntradas,
      total_saidas: totalSaidas,
      saldo_liquido: saldoLiquido,
      por_categoria: resumoPorCategoria,
      quantidade_movimentacoes: movimentacoesSimuladas.length
    });
  };

  const getCategoriaColor = (categoria) => {
    const cores = {
      venda: 'bg-green-100 text-green-800',
      recebimento: 'bg-blue-100 text-blue-800',
      pagamento: 'bg-red-100 text-red-800',
      despesa: 'bg-orange-100 text-orange-800',
      sangria: 'bg-purple-100 text-purple-800',
      abertura: 'bg-gray-100 text-gray-800',
      fechamento: 'bg-gray-100 text-gray-800'
    };
    return cores[categoria] || 'bg-gray-100 text-gray-800';
  };

  const exportarRelatorio = () => {
    // Simular exportação
    alert('Relatório exportado com sucesso!');
  };

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    if (contaSelecionada !== 'todas' && mov.conta_nome !== contas.find(c => c.id === parseInt(contaSelecionada))?.nome) {
      return false;
    }
    if (filtros.categoria !== 'todas' && mov.categoria !== filtros.categoria) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fluxo de Caixa</h1>
            <p className="text-gray-600">Controle detalhado de entradas e saídas</p>
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

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hoje">Hoje</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="ano">Este Ano</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
            <select
              value={contaSelecionada}
              onChange={(e) => setContaSelecionada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas as Contas</option>
              {contas.map(conta => (
                <option key={conta.id} value={conta.id}>{conta.nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas</option>
              <option value="venda">Vendas</option>
              <option value="recebimento">Recebimentos</option>
              <option value="pagamento">Pagamentos</option>
              <option value="despesa">Despesas</option>
              <option value="sangria">Sangrias</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="detalhado">Detalhado</option>
              <option value="resumido">Resumido</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Personalizada</label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={periodo !== 'personalizado'}
            />
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Entradas</p>
              <p className="text-2xl font-bold text-green-600">R$ {resumo.total_entradas?.toFixed(2) || '0,00'}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Saídas</p>
              <p className="text-2xl font-bold text-red-600">R$ {resumo.total_saidas?.toFixed(2) || '0,00'}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
              <p className={`text-2xl font-bold ${resumo.saldo_liquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {resumo.saldo_liquido?.toFixed(2) || '0,00'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              resumo.saldo_liquido >= 0 ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${resumo.saldo_liquido >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Movimentações</p>
              <p className="text-2xl font-bold text-gray-900">{resumo.quantidade_movimentacoes || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {tipoRelatorio === 'resumido' ? (
        /* Relatório Resumido */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Resumo por Categoria</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(resumo.por_categoria || {}).map(([categoria, dados]) => (
                <div key={categoria} className="bg-gray-50 rounded-lg p-4">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${getCategoriaColor(categoria)}`}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Entradas:</span>
                      <span className="font-medium text-green-600">R$ {dados.entradas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Saídas:</span>
                      <span className="font-medium text-red-600">R$ {dados.saidas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-900">Saldo:</span>
                      <span className={`font-bold ${(dados.entradas - dados.saidas) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        R$ {(dados.entradas - dados.saidas).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Relatório Detalhado */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Movimentações Detalhadas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conta</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoesFiltradas.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{new Date(mov.data).toLocaleDateString('pt-BR')}</p>
                          <p className="text-xs text-gray-500">{mov.hora}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mov.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {mov.tipo === 'entrada' ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {mov.tipo}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoriaColor(mov.categoria)}`}>
                        {mov.categoria}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{mov.descricao}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mov.conta_nome}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {mov.tipo === 'entrada' ? '+' : '-'}R$ {mov.valor.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mov.usuario_nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FluxoCaixa;

