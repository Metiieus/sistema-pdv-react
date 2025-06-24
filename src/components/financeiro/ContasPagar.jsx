import { useState, useEffect } from 'react';
import { 
  CreditCard, 
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
  Download
} from 'lucide-react';

const ContasPagar = () => {
  const [contas, setContas] = useState([]);
  const [filtros, setFiltros] = useState({
    status: 'todos',
    data_inicio: '',
    data_fim: '',
    busca: ''
  });
  const [modalNovaConta, setModalNovaConta] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [contasBancarias, setContasBancarias] = useState([]);
  
  const [formConta, setFormConta] = useState({
    fornecedor_id: '',
    descricao: '',
    categoria: 'despesa',
    valor_original: '',
    data_vencimento: '',
    documento: '',
    observacoes: ''
  });
  
  const [formPagamento, setFormPagamento] = useState({
    valor_pagamento: '',
    forma_pagamento: 'dinheiro',
    conta_bancaria_id: '1',
    observacoes: ''
  });

  useEffect(() => {
    carregarContas();
    carregarFornecedores();
    carregarContasBancarias();
  }, [filtros]);

  const carregarContas = async () => {
    // Simular carregamento das contas
    const contasSimuladas = [
      {
        id: 1,
        fornecedor_nome: 'Fornecedor ABC Ltda',
        descricao: 'Compra de mercadorias',
        categoria: 'compra',
        valor_original: 1500.00,
        valor_pago: 0,
        valor_restante: 1500.00,
        data_vencimento: '2024-12-25',
        status: 'pendente',
        documento: 'NF-001234'
      },
      {
        id: 2,
        fornecedor_nome: 'Energia Elétrica S.A.',
        descricao: 'Conta de energia elétrica',
        categoria: 'despesa',
        valor_original: 450.75,
        valor_pago: 0,
        valor_restante: 450.75,
        data_vencimento: '2024-12-20',
        status: 'vencido',
        documento: 'CONTA-12/2024'
      },
      {
        id: 3,
        fornecedor_nome: 'Telefonia Móvel Ltda',
        descricao: 'Plano de telefonia empresarial',
        categoria: 'servico',
        valor_original: 280.00,
        valor_pago: 280.00,
        valor_restante: 0,
        data_vencimento: '2024-12-15',
        status: 'pago',
        documento: 'FAT-789456'
      }
    ];
    setContas(contasSimuladas);
  };

  const carregarFornecedores = async () => {
    const fornecedoresSimulados = [
      { id: 1, nome: 'Fornecedor ABC Ltda' },
      { id: 2, nome: 'Energia Elétrica S.A.' },
      { id: 3, nome: 'Telefonia Móvel Ltda' }
    ];
    setFornecedores(fornecedoresSimulados);
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
        valor_pago: 0,
        valor_restante: novaConta.valor_original,
        status: 'pendente',
        fornecedor_nome: fornecedores.find(f => f.id === parseInt(novaConta.fornecedor_id))?.nome || 'Fornecedor'
      };
      
      setContas(prev => [contaCriada, ...prev]);
      setModalNovaConta(false);
      setFormConta({
        fornecedor_id: '',
        descricao: '',
        categoria: 'despesa',
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

  const realizarPagamento = async () => {
    try {
      const dados = {
        conta_id: contaSelecionada.id,
        valor_pagamento: parseFloat(formPagamento.valor_pagamento),
        forma_pagamento: formPagamento.forma_pagamento,
        conta_bancaria_id: parseInt(formPagamento.conta_bancaria_id),
        usuario_id: 1
      };

      console.log('Realizando pagamento:', dados);
      
      // Simular pagamento
      const novoValorPago = contaSelecionada.valor_pago + dados.valor_pagamento;
      const novoValorRestante = contaSelecionada.valor_original - novoValorPago;
      const novoStatus = novoValorRestante <= 0 ? 'pago' : 'parcial';
      
      setContas(prev => prev.map(conta => 
        conta.id === contaSelecionada.id 
          ? { 
              ...conta, 
              valor_pago: novoValorPago,
              valor_restante: novoValorRestante,
              status: novoStatus,
              data_pagamento: new Date().toISOString().split('T')[0]
            }
          : conta
      ));
      
      setModalPagamento(false);
      setContaSelecionada(null);
      setFormPagamento({
        valor_pagamento: '',
        forma_pagamento: 'dinheiro',
        conta_bancaria_id: '1',
        observacoes: ''
      });
      
      alert('Pagamento realizado com sucesso!');
    } catch (error) {
      alert('Erro ao realizar pagamento: ' + error.message);
    }
  };

  const abrirModalPagamento = (conta) => {
    setContaSelecionada(conta);
    setFormPagamento(prev => ({
      ...prev,
      valor_pagamento: conta.valor_restante.toString()
    }));
    setModalPagamento(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pago':
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
      case 'pago':
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
        !conta.fornecedor_nome.toLowerCase().includes(filtros.busca.toLowerCase())) return false;
    return true;
  });

  const resumo = {
    total_contas: contasFiltradas.length,
    valor_total: contasFiltradas.reduce((acc, conta) => acc + conta.valor_original, 0),
    valor_pago: contasFiltradas.reduce((acc, conta) => acc + conta.valor_pago, 0),
    valor_pendente: contasFiltradas.reduce((acc, conta) => acc + conta.valor_restante, 0),
    contas_vencidas: contasFiltradas.filter(conta => conta.status === 'vencido').length
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contas a Pagar</h1>
            <p className="text-gray-600">Gerenciamento de contas e pagamentos</p>
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
            <CreditCard className="w-8 h-8 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Valor Pago</p>
              <p className="text-xl font-bold text-green-600">R$ {resumo.valor_pago.toFixed(2)}</p>
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
              <option value="pago">Pago</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {conta.fornecedor_nome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{conta.descricao}</p>
                      {conta.documento && (
                        <p className="text-xs text-gray-500">Doc: {conta.documento}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {conta.categoria}
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
                    <span className={conta.valor_restante > 0 ? 'text-red-600' : 'text-green-600'}>
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
                      {conta.status !== 'pago' && (
                        <button
                          onClick={() => abrirModalPagamento(conta)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Pagar"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nova Conta a Pagar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                <select
                  value={formConta.fornecedor_id}
                  onChange={(e) => setFormConta(prev => ({ ...prev, fornecedor_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map(fornecedor => (
                    <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formConta.categoria}
                  onChange={(e) => setFormConta(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="compra">Compra</option>
                  <option value="despesa">Despesa</option>
                  <option value="servico">Serviço</option>
                </select>
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
                disabled={!formConta.descricao || !formConta.valor_original || !formConta.data_vencimento}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Criar Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagamento */}
      {modalPagamento && contaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Realizar Pagamento</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{contaSelecionada.descricao}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Fornecedor: {contaSelecionada.fornecedor_nome}</p>
                <p>Valor Original: R$ {contaSelecionada.valor_original.toFixed(2)}</p>
                <p>Valor Pago: R$ {contaSelecionada.valor_pago.toFixed(2)}</p>
                <p className="font-medium text-red-600">Valor Restante: R$ {contaSelecionada.valor_restante.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Pagamento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formPagamento.valor_pagamento}
                  onChange={(e) => setFormPagamento(prev => ({ ...prev, valor_pagamento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                  value={formPagamento.forma_pagamento}
                  onChange={(e) => setFormPagamento(prev => ({ ...prev, forma_pagamento: e.target.value }))}
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
                  value={formPagamento.conta_bancaria_id}
                  onChange={(e) => setFormPagamento(prev => ({ ...prev, conta_bancaria_id: e.target.value }))}
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
                onClick={() => setModalPagamento(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={realizarPagamento}
                disabled={!formPagamento.valor_pagamento}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContasPagar;

