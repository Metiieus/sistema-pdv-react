import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Trash2,
  Download,
  User,
  ShoppingCart
} from 'lucide-react';

const ContasReceber = () => {
  const [contas, setContas] = useState([]);
  const [filtros, setFiltros] = useState({
    status: 'todos',
    data_inicio: '',
    data_fim: '',
    busca: ''
  });
  const [modalNovaConta, setModalNovaConta] = useState(false);
  const [modalRecebimento, setModalRecebimento] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [contasBancarias, setContasBancarias] = useState([]);
  
  const [formConta, setFormConta] = useState({
    cliente_id: '',
    venda_id: '',
    descricao: '',
    valor_original: '',
    data_vencimento: '',
    documento: '',
    observacoes: ''
  });
  
  const [formRecebimento, setFormRecebimento] = useState({
    valor_recebimento: '',
    forma_pagamento: 'dinheiro',
    conta_bancaria_id: '1',
    observacoes: ''
  });

  useEffect(() => {
    carregarContas();
    carregarClientes();
    carregarContasBancarias();
  }, [filtros]);

  const carregarContas = async () => {
    // Simular carregamento das contas
    const contasSimuladas = [
      {
        id: 1,
        cliente_nome: 'João Silva',
        venda_id: 1,
        numero_venda: '20241221001',
        descricao: 'Venda a prazo - Produtos diversos',
        valor_original: 850.00,
        valor_recebido: 0,
        valor_restante: 850.00,
        data_vencimento: '2024-12-30',
        status: 'pendente',
        documento: 'VENDA-001'
      },
      {
        id: 2,
        cliente_nome: 'Maria Santos',
        venda_id: 2,
        numero_venda: '20241220005',
        descricao: 'Venda parcelada - 2/3',
        valor_original: 450.00,
        valor_recebido: 0,
        valor_restante: 450.00,
        data_vencimento: '2024-12-18',
        status: 'vencido',
        documento: 'VENDA-005'
      },
      {
        id: 3,
        cliente_nome: 'Pedro Costa',
        venda_id: 3,
        numero_venda: '20241219003',
        descricao: 'Venda a prazo - Material de escritório',
        valor_original: 320.75,
        valor_recebido: 320.75,
        valor_restante: 0,
        data_vencimento: '2024-12-15',
        status: 'recebido',
        documento: 'VENDA-003'
      },
      {
        id: 4,
        cliente_nome: 'Ana Oliveira',
        venda_id: null,
        numero_venda: null,
        descricao: 'Serviço de consultoria',
        valor_original: 1200.00,
        valor_recebido: 600.00,
        valor_restante: 600.00,
        data_vencimento: '2024-12-28',
        status: 'parcial',
        documento: 'SERV-001'
      }
    ];
    setContas(contasSimuladas);
  };

  const carregarClientes = async () => {
    const clientesSimulados = [
      { id: 1, nome: 'João Silva' },
      { id: 2, nome: 'Maria Santos' },
      { id: 3, nome: 'Pedro Costa' },
      { id: 4, nome: 'Ana Oliveira' }
    ];
    setClientes(clientesSimulados);
  };

  const carregarContasBancarias = async () => {
    const contasSimuladas = [
      { id: 1, nome: 'Caixa Principal', tipo: 'caixa' },
      { id: 2, nome: 'Banco do Brasil - CC', tipo: 'conta_corrente' }
    ];
    setContasBancarias(contasSimuladas);
  };

  const criarConta = async () => {
    try {
      const novaConta = {
        ...formConta,
        valor_original: parseFloat(formConta.valor_original),
        usuario_id: 1
      };

      console.log('Criando conta:', novaConta);
      
      // Simular criação
      const contaCriada = {
        id: Date.now(),
        ...novaConta,
        valor_recebido: 0,
        valor_restante: novaConta.valor_original,
        status: 'pendente',
        cliente_nome: clientes.find(c => c.id === parseInt(novaConta.cliente_id))?.nome || 'Cliente',
        numero_venda: novaConta.venda_id ? `VENDA-${novaConta.venda_id}` : null
      };
      
      setContas(prev => [contaCriada, ...prev]);
      setModalNovaConta(false);
      setFormConta({
        cliente_id: '',
        venda_id: '',
        descricao: '',
        valor_original: '',
        data_vencimento: '',
        documento: '',
        observacoes: ''
      });
      
      alert('Conta criada com sucesso!');
    } catch (error) {
      alert('Erro ao criar conta: ' + error.message);
    }
  };

  const realizarRecebimento = async () => {
    try {
      const dados = {
        conta_id: contaSelecionada.id,
        valor_recebimento: parseFloat(formRecebimento.valor_recebimento),
        forma_pagamento: formRecebimento.forma_pagamento,
        conta_bancaria_id: parseInt(formRecebimento.conta_bancaria_id),
        usuario_id: 1
      };

      console.log('Realizando recebimento:', dados);
      
      // Simular recebimento
      const novoValorRecebido = contaSelecionada.valor_recebido + dados.valor_recebimento;
      const novoValorRestante = contaSelecionada.valor_original - novoValorRecebido;
      const novoStatus = novoValorRestante <= 0 ? 'recebido' : 'parcial';
      
      setContas(prev => prev.map(conta => 
        conta.id === contaSelecionada.id 
          ? { 
              ...conta, 
              valor_recebido: novoValorRecebido,
              valor_restante: novoValorRestante,
              status: novoStatus,
              data_recebimento: new Date().toISOString().split('T')[0]
            }
          : conta
      ));
      
      setModalRecebimento(false);
      setContaSelecionada(null);
      setFormRecebimento({
        valor_recebimento: '',
        forma_pagamento: 'dinheiro',
        conta_bancaria_id: '1',
        observacoes: ''
      });
      
      alert('Recebimento realizado com sucesso!');
    } catch (error) {
      alert('Erro ao realizar recebimento: ' + error.message);
    }
  };

  const abrirModalRecebimento = (conta) => {
    setContaSelecionada(conta);
    setFormRecebimento(prev => ({
      ...prev,
      valor_recebimento: conta.valor_restante.toString()
    }));
    setModalRecebimento(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recebido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'parcial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'recebido':
        return <CheckCircle className="w-4 h-4" />;
      case 'vencido':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const contasFiltradas = contas.filter(conta => {
    if (filtros.status !== 'todos' && conta.status !== filtros.status) return false;
    if (filtros.busca && !conta.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) && 
        !conta.cliente_nome.toLowerCase().includes(filtros.busca.toLowerCase())) return false;
    return true;
  });

  const resumo = {
    total_contas: contasFiltradas.length,
    valor_total: contasFiltradas.reduce((acc, conta) => acc + conta.valor_original, 0),
    valor_recebido: contasFiltradas.reduce((acc, conta) => acc + conta.valor_recebido, 0),
    valor_pendente: contasFiltradas.reduce((acc, conta) => acc + conta.valor_restante, 0),
    contas_vencidas: contasFiltradas.filter(conta => conta.status === 'vencido').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contas a Receber</h1>
            <p className="text-gray-600">Gerenciamento de recebimentos e cobranças</p>
          </div>
        </div>
        
        <button
          onClick={() => setModalNovaConta(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Contas</p>
              <p className="text-2xl font-bold text-gray-900">{resumo.total_contas}</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-xl font-bold text-gray-900">R$ {resumo.valor_total.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Recebido</p>
              <p className="text-xl font-bold text-green-600">R$ {resumo.valor_recebido.toFixed(2)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Pendente</p>
              <p className="text-xl font-bold text-orange-600">R$ {resumo.valor_pendente.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contas Vencidas</p>
              <p className="text-2xl font-bold text-red-600">{resumo.contas_vencidas}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="recebido">Recebido</option>
              <option value="vencido">Vencido</option>
              <option value="parcial">Parcial</option>
            </select>
          </div>
          
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar contas..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Contas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Original</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Restante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contasFiltradas.map((conta) => (
                <tr key={conta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{conta.cliente_nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{conta.descricao}</p>
                      {conta.documento && (
                        <p className="text-xs text-gray-500">Doc: {conta.documento}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {conta.numero_venda ? (
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                        <span>{conta.numero_venda}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    R$ {conta.valor_original.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <span className={conta.valor_restante > 0 ? 'text-orange-600' : 'text-green-600'}>
                      R$ {conta.valor_restante.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conta.status)}`}>
                      {getStatusIcon(conta.status)}
                      <span className="ml-1 capitalize">{conta.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {conta.status !== 'recebido' && (
                        <button
                          onClick={() => abrirModalRecebimento(conta)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Receber"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Conta */}
      {modalNovaConta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Conta a Receber</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select
                  value={formConta.cliente_id}
                  onChange={(e) => setFormConta(prev => ({ ...prev, cliente_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID da Venda (opcional)</label>
                <input
                  type="text"
                  value={formConta.venda_id}
                  onChange={(e) => setFormConta(prev => ({ ...prev, venda_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ID da venda relacionada..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={formConta.descricao}
                  onChange={(e) => setFormConta(prev => ({ ...prev, descricao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição da conta..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formConta.valor_original}
                  onChange={(e) => setFormConta(prev => ({ ...prev, valor_original: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  value={formConta.data_vencimento}
                  onChange={(e) => setFormConta(prev => ({ ...prev, data_vencimento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                <input
                  type="text"
                  value={formConta.documento}
                  onChange={(e) => setFormConta(prev => ({ ...prev, documento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número do documento..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formConta.observacoes}
                  onChange={(e) => setFormConta(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setModalNovaConta(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={criarConta}
                disabled={!formConta.cliente_id || !formConta.descricao || !formConta.valor_original || !formConta.data_vencimento}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Recebimento */}
      {modalRecebimento && contaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Realizar Recebimento</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{contaSelecionada.descricao}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Cliente: {contaSelecionada.cliente_nome}</p>
                <p>Valor Original: R$ {contaSelecionada.valor_original.toFixed(2)}</p>
                <p>Valor Recebido: R$ {contaSelecionada.valor_recebido.toFixed(2)}</p>
                <p className="font-medium text-orange-600">Valor Restante: R$ {contaSelecionada.valor_restante.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Recebimento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formRecebimento.valor_recebimento}
                  onChange={(e) => setFormRecebimento(prev => ({ ...prev, valor_recebimento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                  value={formRecebimento.forma_pagamento}
                  onChange={(e) => setFormRecebimento(prev => ({ ...prev, forma_pagamento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="transferencia">Transferência</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                <select
                  value={formRecebimento.conta_bancaria_id}
                  onChange={(e) => setFormRecebimento(prev => ({ ...prev, conta_bancaria_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {contasBancarias.map(conta => (
                    <option key={conta.id} value={conta.id}>{conta.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setModalRecebimento(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={realizarRecebimento}
                disabled={!formRecebimento.valor_recebimento}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContasReceber;

