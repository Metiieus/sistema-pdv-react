import { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import PDVMain from './components/PDVMain';
import CaixaManager from './components/financeiro/CaixaManager';
import ContasPagar from './components/financeiro/ContasPagar';
import ContasReceber from './components/financeiro/ContasReceber';
import FluxoCaixa from './components/financeiro/FluxoCaixa';
import DRE from './components/financeiro/DRE';
import RelatoriosVendas from './components/relatorios/RelatoriosVendas';
import ConsultaProdutos from './components/consultas/ConsultaProdutos';
import BackupRestauracao from './components/gerencial/BackupRestauracao';
import Configuracoes from './components/gerencial/Configuracoes';
import CadastroProdutos from './components/cadastros/CadastroProdutos'; // Já importado, perfeito!


function App() {
  const [activeSection, setActiveSection] = useState('pdv');
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Verificar se está rodando no Electron
    setIsElectron(typeof window !== 'undefined' && window.electronAPI);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'pdv':
        return <PDVMain isElectron={isElectron} />;
      case 'financeiro-caixa':
        return <CaixaManager />;
      case 'financeiro-contas-pagar':
        return <ContasPagar />;
      case 'financeiro-contas-receber':
        return <ContasReceber />;
      case 'financeiro-fluxo-caixa':
        return <FluxoCaixa />;
      case 'financeiro-dre':
        return <DRE />;
      case 'financeiro-contas-bancarias':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contas Bancárias</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'relatorios-rel-vendas':
        return <RelatoriosVendas />;
      case 'relatorios-rel-estoque':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Relatórios de Estoque</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'relatorios-rel-financeiro':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Relatórios Financeiros</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'relatorios-rel-clientes':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Relatórios de Clientes</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'relatorios-rel-graficos':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Gráficos e Dashboards</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'consulta-produtos': // Mantendo seu ID existente
        return <ConsultaProdutos />;
      case 'consultas-cons-clientes':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Consulta de Clientes</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'consultas-cons-aniversariantes':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Aniversariantes</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'consultas-cons-estoque':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Estoque Financeiro</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'consultas-cons-inadimplentes':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Clientes em Atraso</h2>
              <p className="text-gray-600">Módulo em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'gerencial-backup': // Ajustando para o ID do Navigation
        return <BackupRestauracao />;
      case 'gerencial-configuracoes': // Ajustando para o ID do Navigation
        return <Configuracoes />;
      // === NOVO CASE PARA O CADASTRO DE PRODUTOS ===
      case 'cadastros-produtos': // ID que definimos em Navigation.jsx
        return <CadastroProdutos />;
      // === FIM NOVO CASE ===
      default:
        return <PDVMain isElectron={isElectron} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;