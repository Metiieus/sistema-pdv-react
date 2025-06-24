import { useState, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  Printer, 
  Palette, 
  Globe, 
  Shield, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Monitor,
  Bell,
  Database,
  Trash2,
  RotateCcw
} from 'lucide-react';

const Configuracoes = () => {
  const [configuracoes, setConfiguracoes] = useState({});
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('empresa');
  const [alteracoesPendentes, setAlteracoesPendentes] = useState(false);

  const categorias = [
    { id: 'empresa', nome: 'Empresa', icone: Building, cor: 'blue' },
    { id: 'pdv', nome: 'PDV', icone: Monitor, cor: 'green' },
    { id: 'estoque', nome: 'Estoque', icone: Database, cor: 'purple' },
    { id: 'financeiro', nome: 'Financeiro', icone: Shield, cor: 'orange' },
    { id: 'interface', nome: 'Interface', icone: Palette, cor: 'pink' },
    { id: 'sistema', nome: 'Sistema', icone: Settings, cor: 'gray' }
  ];

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    setLoading(true);
    try {
      // Simular dados para demonstração
      const configsSimuladas = {
        empresa_nome: { valor: 'Minha Empresa Ltda', tipo: 'string', descricao: 'Nome da empresa', categoria: 'empresa' },
        empresa_cnpj: { valor: '12.345.678/0001-90', tipo: 'string', descricao: 'CNPJ da empresa', categoria: 'empresa' },
        empresa_endereco: { valor: 'Rua das Flores, 123 - Centro', tipo: 'string', descricao: 'Endereço da empresa', categoria: 'empresa' },
        empresa_telefone: { valor: '(11) 99999-9999', tipo: 'string', descricao: 'Telefone da empresa', categoria: 'empresa' },
        empresa_email: { valor: 'contato@minhaempresa.com', tipo: 'string', descricao: 'Email da empresa', categoria: 'empresa' },
        
        pdv_impressora_padrao: { valor: 'Impressora Térmica USB', tipo: 'string', descricao: 'Impressora padrão do PDV', categoria: 'pdv' },
        pdv_imprimir_automatico: { valor: true, tipo: 'boolean', descricao: 'Imprimir recibo automaticamente', categoria: 'pdv' },
        pdv_solicitar_cpf: { valor: false, tipo: 'boolean', descricao: 'Solicitar CPF na venda', categoria: 'pdv' },
        pdv_desconto_maximo: { valor: 10, tipo: 'number', descricao: 'Desconto máximo permitido (%)', categoria: 'pdv' },
        
        estoque_alerta_minimo: { valor: true, tipo: 'boolean', descricao: 'Alertar quando estoque baixo', categoria: 'estoque' },
        estoque_controle_lote: { valor: false, tipo: 'boolean', descricao: 'Controlar estoque por lote', categoria: 'estoque' },
        estoque_validade_alerta: { valor: 30, tipo: 'number', descricao: 'Alertar produtos próximos ao vencimento (dias)', categoria: 'estoque' },
        
        financeiro_backup_automatico: { valor: true, tipo: 'boolean', descricao: 'Backup automático diário', categoria: 'financeiro' },
        financeiro_juros_atraso: { valor: 2.5, tipo: 'number', descricao: 'Taxa de juros por atraso (%)', categoria: 'financeiro' },
        financeiro_multa_atraso: { valor: 10, tipo: 'number', descricao: 'Multa por atraso (R$)', categoria: 'financeiro' },
        
        sistema_tema: { valor: 'claro', tipo: 'string', descricao: 'Tema do sistema', categoria: 'interface' },
        sistema_idioma: { valor: 'pt-BR', tipo: 'string', descricao: 'Idioma do sistema', categoria: 'interface' },
        sistema_notificacoes: { valor: true, tipo: 'boolean', descricao: 'Exibir notificações', categoria: 'interface' },
        sistema_sons: { valor: true, tipo: 'boolean', descricao: 'Sons do sistema', categoria: 'interface' },
        
        sistema_logs_nivel: { valor: 'info', tipo: 'string', descricao: 'Nível de logs', categoria: 'sistema' },
        sistema_manutencao_automatica: { valor: true, tipo: 'boolean', descricao: 'Manutenção automática', categoria: 'sistema' },
        sistema_limpeza_dados: { valor: 365, tipo: 'number', descricao: 'Limpar dados antigos (dias)', categoria: 'sistema' }
      };
      
      setConfiguracoes(configsSimuladas);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setSalvando(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAlteracoesPendentes(false);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const resetarConfiguracoes = async () => {
    if (!confirm('Deseja realmente resetar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setLoading(true);
    try {
      // Simular reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await carregarConfiguracoes();
      setAlteracoesPendentes(false);
      alert('Configurações resetadas para os valores padrão!');
    } catch (error) {
      alert('Erro ao resetar configurações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const atualizarConfiguracao = (chave, valor) => {
    setConfiguracoes(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        valor: valor
      }
    }));
    setAlteracoesPendentes(true);
  };

  const obterConfiguracoesPorCategoria = (categoria) => {
    return Object.entries(configuracoes).filter(([chave, config]) => 
      config.categoria === categoria
    );
  };

  const renderCampoConfiguracao = (chave, config) => {
    const { valor, tipo, descricao } = config;
    
    switch (tipo) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">{descricao}</label>
              <p className="text-xs text-gray-500">{chave}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={valor}
                onChange={(e) => atualizarConfiguracao(chave, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        );
      
      case 'number':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{descricao}</label>
            <p className="text-xs text-gray-500 mb-2">{chave}</p>
            <input
              type="number"
              value={valor}
              onChange={(e) => atualizarConfiguracao(chave, parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      
      case 'string':
        if (chave === 'sistema_tema') {
          return (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">{descricao}</label>
              <p className="text-xs text-gray-500 mb-2">{chave}</p>
              <select
                value={valor}
                onChange={(e) => atualizarConfiguracao(chave, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="claro">Claro</option>
                <option value="escuro">Escuro</option>
                <option value="automatico">Automático</option>
              </select>
            </div>
          );
        } else if (chave === 'sistema_idioma') {
          return (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">{descricao}</label>
              <p className="text-xs text-gray-500 mb-2">{chave}</p>
              <select
                value={valor}
                onChange={(e) => atualizarConfiguracao(chave, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
          );
        } else if (chave === 'sistema_logs_nivel') {
          return (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">{descricao}</label>
              <p className="text-xs text-gray-500 mb-2">{chave}</p>
              <select
                value={valor}
                onChange={(e) => atualizarConfiguracao(chave, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="error">Apenas Erros</option>
                <option value="warn">Avisos e Erros</option>
                <option value="info">Informações</option>
                <option value="debug">Debug (Detalhado)</option>
              </select>
            </div>
          );
        } else {
          return (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">{descricao}</label>
              <p className="text-xs text-gray-500 mb-2">{chave}</p>
              <input
                type="text"
                value={valor}
                onChange={(e) => atualizarConfiguracao(chave, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          );
        }
      
      default:
        return null;
    }
  };

  const categoriaAtual = categorias.find(c => c.id === categoriaAtiva);
  const IconeCategoria = categoriaAtual?.icone || Settings;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br from-${categoriaAtual?.cor}-500 to-${categoriaAtual?.cor}-600 rounded-lg flex items-center justify-center`}>
            <IconeCategoria className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-600">Personalize o comportamento do sistema</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {alteracoesPendentes && (
            <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Alterações não salvas</span>
            </div>
          )}
          
          <button
            onClick={carregarConfiguracoes}
            disabled={loading || salvando}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Recarregar</span>
          </button>
          
          <button
            onClick={resetarConfiguracoes}
            disabled={loading || salvando}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Resetar</span>
          </button>
          
          <button
            onClick={salvarConfiguracoes}
            disabled={!alteracoesPendentes || loading || salvando}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {salvando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menu de Categorias */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Categorias</h3>
            <nav className="space-y-1">
              {categorias.map((categoria) => {
                const Icone = categoria.icone;
                const isActive = categoriaAtiva === categoria.id;
                const configsCategoria = obterConfiguracoesPorCategoria(categoria.id);
                
                return (
                  <button
                    key={categoria.id}
                    onClick={() => setCategoriaAtiva(categoria.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? `bg-${categoria.cor}-50 text-${categoria.cor}-700 border border-${categoria.cor}-200`
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icone className={`w-5 h-5 ${isActive ? `text-${categoria.cor}-600` : 'text-gray-400'}`} />
                      <span className="font-medium">{categoria.nome}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isActive ? `bg-${categoria.cor}-100 text-${categoria.cor}-600` : 'bg-gray-100 text-gray-500'
                    }`}>
                      {configsCategoria.length}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo das Configurações */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <IconeCategoria className={`w-6 h-6 text-${categoriaAtual?.cor}-600`} />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{categoriaAtual?.nome}</h2>
                  <p className="text-sm text-gray-600">
                    {obterConfiguracoesPorCategoria(categoriaAtiva).length} configurações disponíveis
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">Carregando configurações...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {obterConfiguracoesPorCategoria(categoriaAtiva).map(([chave, config]) => (
                    <div key={chave} className="p-4 border border-gray-200 rounded-lg">
                      {renderCampoConfiguracao(chave, config)}
                    </div>
                  ))}
                  
                  {obterConfiguracoesPorCategoria(categoriaAtiva).length === 0 && (
                    <div className="text-center py-12">
                      <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma configuração disponível nesta categoria</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;

