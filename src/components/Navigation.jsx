import { useState } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  FileText, 
  Search, 
  Settings,
  CreditCard,
  TrendingUp,
  PieChart,
  Calculator,
  Wallet,
  Receipt,
  Users,
  Package, // Importado corretamente
  BarChart3,
  Calendar,
  Database
} from 'lucide-react';

const Navigation = ({ activeSection, onSectionChange }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const menuSections = [
    {
      id: 'pdv',
      title: 'PDV',
      icon: ShoppingCart,
      color: 'bg-blue-500',
      items: []
    },

    {
      id: 'cadastros',
      title: 'Cadastros',
      icon: Package, // Ícone para a seção de Cadastros
      color: 'bg-indigo-500', // Uma cor diferente para a nova seção
      items: [
        // === LINHA MODIFICADA AQUI ===
        { id: 'produtos', title: 'Produtos', icon: Package }, // AGORA É SÓ 'produtos'
        // === FIM DA LINHA MODIFICADA ===
        // Futuramente: { id: 'clientes', title: 'Clientes', icon: Users },
        // Futuramente: { id: 'fornecedores', title: 'Fornecedores', icon: Truck },
      ],
    },

    {
      id: 'financeiro',
      title: 'Financeiro',
      icon: DollarSign,
      color: 'bg-green-500',
      items: [
        { id: 'caixa', title: 'Caixa', icon: Wallet },
        { id: 'contas-pagar', title: 'Contas a Pagar', icon: CreditCard },
        { id: 'contas-receber', title: 'Contas a Receber', icon: Receipt },
        { id: 'fluxo-caixa', title: 'Fluxo de Caixa', icon: TrendingUp },
        { id: 'dre', title: 'DRE', icon: Calculator },
        { id: 'contas-bancarias', title: 'Contas Bancárias', icon: PieChart }
      ]
    },
    {
      id: 'relatorios',
      title: 'Relatórios',
      icon: FileText,
      color: 'bg-purple-500',
      items: [
        { id: 'rel-vendas', title: 'Vendas', icon: BarChart3 },
        { id: 'rel-estoque', title: 'Estoque', icon: Package },
        { id: 'rel-financeiro', title: 'Financeiro', icon: DollarSign },
        { id: 'rel-clientes', title: 'Clientes', icon: Users },
        { id: 'rel-graficos', title: 'Gráficos', icon: PieChart }
      ]
    },
    {
      id: 'consultas',
      title: 'Consultas',
      icon: Search,
      color: 'bg-orange-500',
      items: [
        { id: 'cons-produtos', title: 'Produtos', icon: Package },
        { id: 'cons-clientes', title: 'Clientes', icon: Users },
        { id: 'cons-aniversariantes', title: 'Aniversariantes', icon: Calendar },
        { id: 'cons-estoque', title: 'Estoque Financeiro', icon: DollarSign },
        { id: 'cons-inadimplentes', title: 'Clientes em Atraso', icon: CreditCard }
      ]
    },
    {
      id: 'gerencial',
      title: 'Gerencial',
      icon: Settings,
      color: 'bg-gray-500',
      items: [
        { id: 'backup', title: 'Backup', icon: Database },
        { id: 'configuracoes', title: 'Configurações', icon: Settings }
      ]
    }
  ];

  const handleSectionClick = (section) => {
    if (section.items && section.items.length > 0) {
      setExpandedSection(expandedSection === section.id ? null : section.id);
    } else {
      onSectionChange(section.id);
      setExpandedSection(null);
    }
  };

  const handleItemClick = (sectionId, itemId) => {
    onSectionChange(`${sectionId}-${itemId}`); // Isso vai gerar 'cadastros-produtos'
    setExpandedSection(null);
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Sistema PDV</h1>
            <p className="text-xs text-gray-500">Gestão Completa</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {menuSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;
            const isActive = activeSection === section.id || activeSection.startsWith(`${section.id}-`);

            return (
              <div key={section.id}>
                {/* Section Header */}
                <button
                  onClick={() => handleSectionClick(section)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${section.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  {section.items && section.items.length > 0 && (
                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Submenu */}
                {section.items && section.items.length > 0 && (
                  <div className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const itemId = `${section.id}-${item.id}`; // Isso gera 'cadastros-produtos'
                      const isItemActive = activeSection === itemId;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(section.id, item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                            isItemActive
                              ? 'bg-blue-100 text-blue-700 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <ItemIcon className="w-4 h-4" />
                          <span className="text-sm">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>SoftPDV v2.0</p>
          <p>© 2025 - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Navigation;