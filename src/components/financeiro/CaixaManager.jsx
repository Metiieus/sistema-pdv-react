import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Minus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const CaixaManager = () => {
  const [caixaStatus, setCaixaStatus] = useState('fechado'); // 'aberto', 'fechado'
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [movimentacoesDia, setMovimentacoesDia] = useState([]);
  const [showSaldo, setShowSaldo] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalSangria, setModalSangria] = useState(false);
  const [modalFechamento, setModalFechamento] = useState(false);
  
  const [formAbertura, setFormAbertura] = useState({
    valor_inicial: '',
    observacoes: ''
  });
  
  const [formSangria, setFormSangria] = useState({
    valor: '',
    descricao: '',
    motivo: 'sangria'
  });

  useEffect(() => {
    verificarStatusCaixa();
    carregarMovimentacoesDia();
  }, []);

  const verificarStatusCaixa = async () => {
    // Simular verificação do status do caixa
    // Em produção, isso viria da API
    const hoje = new Date().toISOString().split('T')[0];
    // Verificar se há abertura de caixa hoje
    setCaixaStatus('fechado');
    setSaldoAtual(1250.75);
  };

  const carregarMovimentacoesDia = async () => {
    // Simular carregamento das movimentações do dia
    const movimentacoes = [
      {
        id: 1,
        tipo: 'entrada',
        categoria: 'venda',
        valor: 45.50,
        descricao: 'Venda 20241221001',
        hora: '09:15'
      },
      {
        id: 2,
        tipo: 'entrada',
        categoria: 'venda',
        valor: 78.90,
        descricao: 'Venda 20241221002',
        hora: '10:30'
      },
      {
        id: 3,
        tipo: 'saida',
        categoria: 'sangria',
        valor: 200.00,
        descricao: 'Sangria para banco',
        hora: '11:45'
      }
    ];
    setMovimentacoesDia(movimentacoes);
  };

  const abrirCaixa = async () => {
    try {
      const dados = {
        valor_inicial: parseFloat(formAbertura.valor_inicial),
        observacoes: formAbertura.observacoes,
        usuario_id: 1
      };

      // Simular abertura do caixa
      console.log('Abrindo caixa:', dados);
      
      setCaixaStatus('aberto');
      setSaldoAtual(dados.valor_inicial);
      setModalAberto(false);
      setFormAbertura({ valor_inicial: '', observacoes: '' });
      
      alert('Caixa aberto com sucesso!');
    } catch (error) {
      alert('Erro ao abrir caixa: ' + error.message);
    }
  };

  const realizarSangria = async () => {
    try {
      const dados = {
        valor: parseFloat(formSangria.valor),
        descricao: formSangria.descricao,
        conta_id: 1,
        usuario_id: 1
      };

      if (dados.valor > saldoAtual) {
        alert('Valor da sangria maior que o saldo disponível!');
        return;
      }

      // Simular sangria
      console.log('Realizando sangria:', dados);
      
      setSaldoAtual(prev => prev - dados.valor);
      setModalSangria(false);
      setFormSangria({ valor: '', descricao: '', motivo: 'sangria' });
      
      // Adicionar à lista de movimentações
      const novaMovimentacao = {
        id: Date.now(),
        tipo: 'saida',
        categoria: 'sangria',
        valor: dados.valor,
        descricao: dados.descricao,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMovimentacoesDia(prev => [...prev, novaMovimentacao]);
      
      alert('Sangria realizada com sucesso!');
    } catch (error) {
      alert('Erro ao realizar sangria: ' + error.message);
    }
  };

  const fecharCaixa = async () => {
    try {
      const dados = {
        conta_id: 1,
        usuario_id: 1
      };

      // Simular fechamento do caixa
      console.log('Fechando caixa:', dados);
      
      setCaixaStatus('fechado');
      setModalFechamento(false);
      
      alert('Caixa fechado com sucesso!');
    } catch (error) {
      alert('Erro ao fechar caixa: ' + error.message);
    }
  };

  const calcularResumo = () => {
    const entradas = movimentacoesDia
      .filter(mov => mov.tipo === 'entrada')
      .reduce((acc, mov) => acc + mov.valor, 0);
    
    const saidas = movimentacoesDia
      .filter(mov => mov.tipo === 'saida')
      .reduce((acc, mov) => acc + mov.valor, 0);

    return { entradas, saidas, saldo: entradas - saidas };
  };

  const resumo = calcularResumo();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Caixa</h1>
            <p className="text-gray-600">Controle de abertura, fechamento e movimentações</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            caixaStatus === 'aberto' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {caixaStatus === 'aberto' ? 'Caixa Aberto' : 'Caixa Fechado'}
          </div>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Saldo Atual */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">
                  {showSaldo ? `R$ ${saldoAtual.toFixed(2)}` : 'R$ •••••'}
                </p>
                <button
                  onClick={() => setShowSaldo(!showSaldo)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showSaldo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Entradas do Dia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entradas Hoje</p>
              <p className="text-2xl font-bold text-green-600">R$ {resumo.entradas.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Saídas do Dia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saídas Hoje</p>
              <p className="text-2xl font-bold text-red-600">R$ {resumo.saidas.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Movimento Líquido */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Movimento Líquido</p>
              <p className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {resumo.saldo.toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              resumo.saldo >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Calendar className={`w-6 h-6 ${resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Ações do Caixa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações do Caixa</h2>
        <div className="flex flex-wrap gap-3">
          {caixaStatus === 'fechado' ? (
            <button
              onClick={() => setModalAberto(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Caixa</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setModalSangria(true)}
                className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
                <span>Realizar Sangria</span>
              </button>
              <button
                onClick={() => setModalFechamento(true)}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Fechar Caixa</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Movimentações do Dia */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Movimentações do Dia</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimentacoesDia.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{mov.hora}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mov.tipo === 'entrada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mov.tipo === 'entrada' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {mov.categoria}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{mov.descricao}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mov.tipo === 'entrada' ? '+' : '-'}R$ {mov.valor.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Abertura de Caixa */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Abrir Caixa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Inicial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formAbertura.valor_inicial}
                  onChange={(e) => setFormAbertura(prev => ({ ...prev, valor_inicial: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formAbertura.observacoes}
                  onChange={(e) => setFormAbertura(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Observações sobre a abertura do caixa..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setModalAberto(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={abrirCaixa}
                disabled={!formAbertura.valor_inicial}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Abrir Caixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sangria */}
      {modalSangria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Realizar Sangria</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formSangria.valor}
                  onChange={(e) => setFormSangria(prev => ({ ...prev, valor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saldo disponível: R$ {saldoAtual.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formSangria.descricao}
                  onChange={(e) => setFormSangria(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Motivo da sangria..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setModalSangria(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={realizarSangria}
                disabled={!formSangria.valor || !formSangria.descricao}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Realizar Sangria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fechamento */}
      {modalFechamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechar Caixa</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Tem certeza que deseja fechar o caixa? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entradas do dia:</span>
                <span className="font-medium text-green-600">R$ {resumo.entradas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saídas do dia:</span>
                <span className="font-medium text-red-600">R$ {resumo.saidas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-900">Saldo final:</span>
                <span className="font-bold text-blue-600">R$ {resumo.saldo.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setModalFechamento(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={fecharCaixa}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Fechar Caixa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaixaManager;

