import { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download,
  BarChart3,
  PieChart,
  DollarSign,
  Target,
  AlertCircle
} from 'lucide-react';

const DRE = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [dadosDRE, setDadosDRE] = useState({});
  const [comparativo, setComparativo] = useState(false);
  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: ''
  });

  useEffect(() => {
    carregarDRE();
  }, [periodo, filtros]);

  const carregarDRE = async () => {
    // Simular carregamento dos dados do DRE
    const dreSimulado = {
      periodo: {
        inicio: '2024-12-01',
        fim: '2024-12-21',
        descricao: 'Dezembro 2024'
      },
      receita_bruta: 15750.00,
      deducoes: {
        impostos: 945.00, // 6% da receita bruta
        devolucoes: 157.50, // 1% da receita bruta
        descontos: 315.00 // 2% da receita bruta
      },
      receita_liquida: 14332.50,
      custo_vendas: 8820.00, // 56% da receita bruta
      lucro_bruto: 5512.50,
      despesas_operacionais: {
        vendas: {
          comissoes: 472.50,
          marketing: 200.00,
          total: 672.50
        },
        administrativas: {
          salarios: 2800.00,
          aluguel: 1200.00,
          energia: 450.75,
          telefone: 280.00,
          material_escritorio: 150.00,
          total: 4880.75
        },
        financeiras: {
          juros_pagos: 125.30,
          tarifas_bancarias: 45.20,
          total: 170.50
        }
      },
      total_despesas_operacionais: 5723.75,
      resultado_operacional: -211.25, // Lucro bruto - despesas operacionais
      outras_receitas: {
        receitas_financeiras: 89.40,
        outras: 0
      },
      outras_despesas: {
        multas: 25.00,
        outras: 0
      },
      resultado_antes_ir: -146.85,
      imposto_renda: 0, // Não há IR sobre prejuízo
      lucro_liquido: -146.85,
      // Indicadores
      margem_bruta: 35.0, // (lucro_bruto / receita_liquida) * 100
      margem_operacional: -1.47, // (resultado_operacional / receita_liquida) * 100
      margem_liquida: -1.02, // (lucro_liquido / receita_liquida) * 100
      // Comparativo com período anterior (simulado)
      periodo_anterior: {
        receita_bruta: 14200.00,
        lucro_liquido: 850.00,
        margem_liquida: 6.0
      }
    };

    setDadosDRE(dreSimulado);
  };

  const calcularVariacao = (atual, anterior) => {
    if (!anterior || anterior === 0) return 0;
    return ((atual - anterior) / anterior) * 100;
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPercentual = (valor) => {
    return `${valor.toFixed(2)}%`;
  };

  const exportarDRE = () => {
    alert('DRE exportado com sucesso!');
  };

  const getIndicadorColor = (valor) => {
    if (valor > 0) return 'text-green-600';
    if (valor < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DRE - Demonstrativo de Resultado</h1>
            <p className="text-gray-600">Análise de lucros e prejuízos do período</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setComparativo(!comparativo)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              comparativo 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Comparativo
          </button>
          <button
            onClick={exportarDRE}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mes">Este Mês</option>
              <option value="trimestre">Este Trimestre</option>
              <option value="semestre">Este Semestre</option>
              <option value="ano">Este Ano</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={periodo !== 'personalizado'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={periodo !== 'personalizado'}
            />
          </div>
          
          <div className="flex items-end">
            <div className="bg-blue-50 rounded-lg p-3 w-full">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {dadosDRE.periodo?.descricao || 'Período Selecionado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Bruta</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatarMoeda(dadosDRE.receita_bruta || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Bruto</p>
              <p className={`text-2xl font-bold ${getIndicadorColor(dadosDRE.lucro_bruto)}`}>
                {formatarMoeda(dadosDRE.lucro_bruto || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
              <p className={`text-2xl font-bold ${getIndicadorColor(dadosDRE.lucro_liquido)}`}>
                {formatarMoeda(dadosDRE.lucro_liquido || 0)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              dadosDRE.lucro_liquido >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Target className={`w-6 h-6 ${dadosDRE.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Margem Líquida</p>
              <p className={`text-2xl font-bold ${getIndicadorColor(dadosDRE.margem_liquida)}`}>
                {formatarPercentual(dadosDRE.margem_liquida || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* DRE Detalhado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Demonstrativo Detalhado</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Receitas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">RECEITAS</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-900">Receita Bruta de Vendas</span>
                  <span className="font-bold text-blue-600">{formatarMoeda(dadosDRE.receita_bruta || 0)}</span>
                </div>
                
                <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">(-) Impostos sobre Vendas</span>
                    <span className="text-red-600">({formatarMoeda(dadosDRE.deducoes?.impostos || 0)})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">(-) Devoluções</span>
                    <span className="text-red-600">({formatarMoeda(dadosDRE.deducoes?.devolucoes || 0)})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">(-) Descontos Concedidos</span>
                    <span className="text-red-600">({formatarMoeda(dadosDRE.deducoes?.descontos || 0)})</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">Receita Líquida</span>
                  <span className="text-blue-600">{formatarMoeda(dadosDRE.receita_liquida || 0)}</span>
                </div>
              </div>
            </div>

            {/* Custos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CUSTOS</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">(-) Custo das Mercadorias Vendidas</span>
                  <span className="text-red-600">({formatarMoeda(dadosDRE.custo_vendas || 0)})</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">Lucro Bruto</span>
                  <span className={getIndicadorColor(dadosDRE.lucro_bruto)}>
                    {formatarMoeda(dadosDRE.lucro_bruto || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Despesas Operacionais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">DESPESAS OPERACIONAIS</h3>
              <div className="space-y-3">
                {/* Despesas de Vendas */}
                <div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-800">Despesas de Vendas</span>
                    <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.vendas?.total || 0)})</span>
                  </div>
                  <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Comissões</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.vendas?.comissoes || 0)})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Marketing</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.vendas?.marketing || 0)})</span>
                    </div>
                  </div>
                </div>

                {/* Despesas Administrativas */}
                <div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-800">Despesas Administrativas</span>
                    <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.administrativas?.total || 0)})</span>
                  </div>
                  <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Salários</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.administrativas?.salarios || 0)})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Aluguel</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.administrativas?.aluguel || 0)})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Energia Elétrica</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.administrativas?.energia || 0)})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Telefone</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.administrativas?.telefone || 0)})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Material de Escritório</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.administrativas?.material_escritorio || 0)})</span>
                    </div>
                  </div>
                </div>

                {/* Despesas Financeiras */}
                <div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-800">Despesas Financeiras</span>
                    <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.financeiras?.total || 0)})</span>
                  </div>
                  <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Juros Pagos</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.financeiras?.juros_pagos || 0)})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tarifas Bancárias</span>
                      <span className="text-red-600">({formatarMoeda(dadosDRE.despesas_operacionais?.financeiras?.tarifas_bancarias || 0)})</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">Resultado Operacional</span>
                  <span className={getIndicadorColor(dadosDRE.resultado_operacional)}>
                    {formatarMoeda(dadosDRE.resultado_operacional || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Outras Receitas e Despesas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">OUTRAS RECEITAS E DESPESAS</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Receitas Financeiras</span>
                  <span className="text-green-600">{formatarMoeda(dadosDRE.outras_receitas?.receitas_financeiras || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">(-) Multas e Outras Despesas</span>
                  <span className="text-red-600">({formatarMoeda(dadosDRE.outras_despesas?.multas || 0)})</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t border-gray-200 font-semibold">
                  <span className="text-gray-900">Resultado Antes do IR</span>
                  <span className={getIndicadorColor(dadosDRE.resultado_antes_ir)}>
                    {formatarMoeda(dadosDRE.resultado_antes_ir || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">(-) Imposto de Renda</span>
                  <span className="text-red-600">({formatarMoeda(dadosDRE.imposto_renda || 0)})</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 text-lg font-bold">
                  <span className="text-gray-900">LUCRO LÍQUIDO DO PERÍODO</span>
                  <span className={getIndicadorColor(dadosDRE.lucro_liquido)}>
                    {formatarMoeda(dadosDRE.lucro_liquido || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análise de Margens */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Análise de Margens</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Margem Bruta</h3>
              <p className={`text-2xl font-bold ${getIndicadorColor(dadosDRE.margem_bruta)}`}>
                {formatarPercentual(dadosDRE.margem_bruta || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Lucro Bruto / Receita Líquida
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Margem Operacional</h3>
              <p className={`text-2xl font-bold ${getIndicadorColor(dadosDRE.margem_operacional)}`}>
                {formatarPercentual(dadosDRE.margem_operacional || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Resultado Operacional / Receita Líquida
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Margem Líquida</h3>
              <p className={`text-2xl font-bold ${getIndicadorColor(dadosDRE.margem_liquida)}`}>
                {formatarPercentual(dadosDRE.margem_liquida || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Lucro Líquido / Receita Líquida
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas e Observações */}
      {dadosDRE.lucro_liquido < 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Atenção: Prejuízo no Período</h3>
          </div>
          <p className="text-red-800 mt-2">
            O resultado do período apresentou prejuízo de {formatarMoeda(Math.abs(dadosDRE.lucro_liquido))}.
            Recomenda-se revisar as despesas operacionais e estratégias de vendas.
          </p>
        </div>
      )}
    </div>
  );
};

export default DRE;

