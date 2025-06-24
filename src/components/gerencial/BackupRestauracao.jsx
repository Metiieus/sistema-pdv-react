import { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Shield,
  Archive,
  Calendar,
  FileText
} from 'lucide-react';

const BackupRestauracao = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [criandoBackup, setCriandoBackup] = useState(false);
  const [nomeBackup, setNomeBackup] = useState('');
  const [modalBackup, setModalBackup] = useState(false);
  const [modalRestaurar, setModalRestaurar] = useState(false);
  const [backupSelecionado, setBackupSelecionado] = useState(null);

  useEffect(() => {
    carregarBackups();
  }, []);

  const carregarBackups = async () => {
    setLoading(true);
    try {
      // Simular dados para demonstração
      const backupsSimulados = [
        {
          id: 1,
          nome_arquivo: 'backup_2024-12-21T15-30-00.db',
          caminho_arquivo: '/backups/backup_2024-12-21T15-30-00.db',
          tamanho_bytes: 2048576,
          tamanho_formatado: '2.0 MB',
          data_criacao: '2024-12-21 15:30:00',
          arquivo_existe: true
        },
        {
          id: 2,
          nome_arquivo: 'backup_2024-12-20T18-45-00.db',
          caminho_arquivo: '/backups/backup_2024-12-20T18-45-00.db',
          tamanho_bytes: 1945600,
          tamanho_formatado: '1.9 MB',
          data_criacao: '2024-12-20 18:45:00',
          arquivo_existe: true
        },
        {
          id: 3,
          nome_arquivo: 'backup_manual_dezembro.db',
          caminho_arquivo: '/backups/backup_manual_dezembro.db',
          tamanho_bytes: 2150400,
          tamanho_formatado: '2.1 MB',
          data_criacao: '2024-12-19 10:15:00',
          arquivo_existe: false
        }
      ];
      setBackups(backupsSimulados);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarBackup = async () => {
    setCriandoBackup(true);
    try {
      // Simular criação de backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const novoBackup = {
        id: Date.now(),
        nome_arquivo: nomeBackup || `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`,
        caminho_arquivo: `/backups/${nomeBackup || `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`}`,
        tamanho_bytes: 2100000,
        tamanho_formatado: '2.1 MB',
        data_criacao: new Date().toLocaleString('pt-BR'),
        arquivo_existe: true
      };
      
      setBackups(prev => [novoBackup, ...prev]);
      setModalBackup(false);
      setNomeBackup('');
      alert('Backup criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar backup: ' + error.message);
    } finally {
      setCriandoBackup(false);
    }
  };

  const restaurarBackup = async () => {
    if (!backupSelecionado) return;
    
    setLoading(true);
    try {
      // Simular restauração
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setModalRestaurar(false);
      setBackupSelecionado(null);
      alert('Backup restaurado com sucesso! O sistema será reiniciado.');
    } catch (error) {
      alert('Erro ao restaurar backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const excluirBackup = async (backup) => {
    if (!confirm(`Deseja realmente excluir o backup "${backup.nome_arquivo}"?`)) {
      return;
    }
    
    try {
      setBackups(prev => prev.filter(b => b.id !== backup.id));
      alert('Backup excluído com sucesso!');
    } catch (error) {
      alert('Erro ao excluir backup: ' + error.message);
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const obterIdadeBackup = (data) => {
    const agora = new Date();
    const dataBackup = new Date(data);
    const diffMs = agora - dataBackup;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return 'Hoje';
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    if (diffDias < 30) return `${Math.floor(diffDias / 7)} semanas atrás`;
    return `${Math.floor(diffDias / 30)} meses atrás`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backup e Restauração</h1>
            <p className="text-gray-600">Gerencie backups do sistema e restaure dados</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={carregarBackups}
            disabled={loading}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => setModalBackup(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Criar Backup</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Backups</p>
              <p className="text-2xl font-bold text-blue-600">{backups.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Archive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Espaço Utilizado</p>
              <p className="text-2xl font-bold text-green-600">
                {(backups.reduce((acc, b) => acc + b.tamanho_bytes, 0) / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Backups Válidos</p>
              <p className="text-2xl font-bold text-purple-600">
                {backups.filter(b => b.arquivo_existe).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Último Backup</p>
              <p className="text-2xl font-bold text-orange-600">
                {backups.length > 0 ? obterIdadeBackup(backups[0]?.data_criacao) : 'Nunca'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Backups */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Backups Disponíveis ({backups.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-500">Carregando backups...</span>
                    </div>
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <Database className="w-12 h-12 text-gray-300" />
                      <span>Nenhum backup encontrado</span>
                      <span className="text-sm">Crie seu primeiro backup clicando no botão acima</span>
                    </div>
                  </td>
                </tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.id} className="bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{backup.nome_arquivo}</div>
                          <div className="text-sm text-gray-500">{backup.caminho_arquivo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{formatarData(backup.data_criacao)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.tamanho_formatado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {backup.arquivo_existe ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Disponível</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Arquivo Perdido</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {obterIdadeBackup(backup.data_criacao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {backup.arquivo_existe && (
                          <button
                            onClick={() => {
                              setBackupSelecionado(backup);
                              setModalRestaurar(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Restaurar"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => excluirBackup(backup)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Backup */}
      {modalBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Criar Novo Backup</h3>
                  <p className="text-sm text-gray-600">Faça uma cópia de segurança dos dados</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Backup (opcional)
                </label>
                <input
                  type="text"
                  value={nomeBackup}
                  onChange={(e) => setNomeBackup(e.target.value)}
                  placeholder="backup_personalizado.db"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se não informado, será gerado automaticamente com data/hora
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setModalBackup(false);
                    setNomeBackup('');
                  }}
                  disabled={criandoBackup}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarBackup}
                  disabled={criandoBackup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {criandoBackup ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Criando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Criar Backup</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Restaurar Backup */}
      {modalRestaurar && backupSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirmar Restauração</h3>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Atenção!</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Todos os dados atuais serão substituídos pelos dados do backup selecionado.
                      Um backup de segurança será criado automaticamente antes da restauração.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Backup Selecionado:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Arquivo:</strong> {backupSelecionado.nome_arquivo}</p>
                  <p><strong>Data:</strong> {formatarData(backupSelecionado.data_criacao)}</p>
                  <p><strong>Tamanho:</strong> {backupSelecionado.tamanho_formatado}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setModalRestaurar(false);
                    setBackupSelecionado(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={restaurarBackup}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Restaurando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Confirmar Restauração</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestauracao;

