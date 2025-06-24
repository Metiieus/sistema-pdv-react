# Sistema PDV - Ponto de Venda Completo

Um sistema completo de Ponto de Venda (PDV) desenvolvido com tecnologias modernas, oferecendo uma solução empresarial robusta para gestão de vendas, estoque, financeiro e muito mais.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19 + Tailwind CSS
- **Desktop**: Electron para aplicação offline
- **Banco de Dados**: SQLite com Better-SQLite3
- **Backend**: Node.js para lógica de negócios
- **Impressão**: Bibliotecas Node.js para impressoras térmicas
- **Ícones**: Lucide React
- **Estilização**: Tailwind CSS com componentes customizados

## 📋 Funcionalidades Completas

### 🛒 **PDV (Ponto de Venda)**
- Interface moderna e intuitiva para vendas
- Carrinho de compras com cálculos automáticos
- Múltiplas formas de pagamento
- Sistema de desconto
- Impressão automática de recibos
- Controle de estoque em tempo real
- Cadastro de clientes integrado

### 🏦 **FINANCEIRO**
- **Caixa Inicial** - Abertura e fechamento de caixa
- **Sangria** - Retirada de valores com controle
- **Fluxo de Caixa** - Detalhado e resumido com filtros
- **DRE** - Demonstrativo de Resultado do Exercício
- **Contas a Pagar** - Lançamento, controle e baixa
- **Contas a Receber** - Lançamento, controle e baixa
- **Gráficos de Vendas** - Análise visual por período
- **Contas Bancárias** - Cadastro e gerenciamento

### 📊 **RELATÓRIOS**
- **Vendas**:
  - Por vendedor com comissões
  - Por período (diário, mensal, anual)
  - Por clientes com histórico
  - Por produtos com performance
  - Por categorias com indicadores
  - Por forma de pagamento
  - Margem de lucro detalhada
  - Produtos mais vendidos
- **Compras**:
  - Por período e fornecedor
  - Análise de custos
- **Estoque**:
  - Relatório completo de estoque
  - Estoque mínimo com alertas
  - Inventário e controle de validade
- **Financeiro**:
  - Contas a pagar/receber
  - Fluxo de caixa detalhado
  - Análise de inadimplência
- **Gráficos Avançados**:
  - Visualizações interativas
  - Análise de tendências

### 🔍 **CONSULTAS**
- **Produtos** - Busca por código, descrição, referência
- **Aniversariantes** - Lista de clientes aniversariantes
- **Estoque Financeiro** - Valor total do estoque
- **Clientes em Atraso** - Inadimplentes com alertas
- **Histórico de Vendas** - Por cliente detalhado
- **Situação do Cliente** - Status completo
- **Informativo Financeiro** - Dashboards informativos

### ⚙️ **GERENCIAL**
- **Backup e Restauração**:
  - Backup automático e manual
  - Restauração com segurança
  - Histórico de backups
  - Limpeza automática de arquivos antigos
- **Configurações do Sistema**:
  - **Empresa** - Dados da empresa
  - **PDV** - Configurações do ponto de venda
  - **Estoque** - Controles de estoque
  - **Financeiro** - Parâmetros financeiros
  - **Interface** - Personalização visual
  - **Sistema** - Configurações técnicas
- **Estatísticas do Sistema**:
  - Métricas de performance
  - Uso de recursos
  - Análise de dados

## 🎨 Interface e Experiência

### Design Moderno
- Interface clean e profissional
- Cores consistentes e harmoniosas
- Tipografia legível e hierárquica
- Espaçamento adequado e organizado

### Navegação Intuitiva
- Menu lateral expansível
- Categorização lógica de funcionalidades
- Breadcrumbs para orientação
- Atalhos de teclado

### Componentes Interativos
- Cards informativos com resumos
- Modais elegantes para ações
- Tabelas responsivas com filtros
- Formulários validados
- Animações suaves e profissionais

### Responsividade
- Adaptável a diferentes tamanhos de tela
- Suporte a dispositivos móveis
- Interface touch-friendly
- Otimização para tablets

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 20+ 
- pnpm (gerenciador de pacotes)
- Sistema operacional: Windows, macOS ou Linux

### Instalação
```bash
# Clonar o repositório
git clone [url-do-repositorio]
cd sistema-pdv-react

# Instalar dependências
pnpm install

# Configurar banco de dados (automático na primeira execução)
# O sistema criará automaticamente o banco SQLite
```

### Execução

#### Modo Desenvolvimento Web
```bash
pnpm run dev
```
Acesse: http://localhost:5173

#### Modo Desenvolvimento Desktop (Electron)
```bash
pnpm run electron-dev
```

#### Build para Produção
```bash
# Build da aplicação web
pnpm run build

# Build da aplicação desktop
pnpm run electron-build
```

### Script de Inicialização Rápida
```bash
# Executar o script de inicialização
./start.sh
```

## 📁 Estrutura do Projeto

```
sistema-pdv-react/
├── electron/                 # Arquivos do Electron
│   ├── main.cjs             # Processo principal
│   ├── preload.cjs          # Script de preload
│   ├── database.cjs         # Gerenciador do banco
│   ├── services.cjs         # Serviços de negócio
│   └── printer.cjs          # Serviços de impressão
├── src/                     # Código fonte React
│   ├── components/          # Componentes React
│   │   ├── financeiro/      # Módulos financeiros
│   │   ├── relatorios/      # Módulos de relatórios
│   │   ├── consultas/       # Módulos de consultas
│   │   └── gerencial/       # Módulos gerenciais
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Ponto de entrada
├── dist/                   # Build de produção
├── backups/               # Backups do sistema
├── package.json           # Dependências e scripts
└── README.md             # Documentação
```

## 🔧 Configuração

### Banco de Dados
O sistema utiliza SQLite como banco de dados local, criado automaticamente na primeira execução. As tabelas são inicializadas com dados de exemplo para demonstração.

### Impressão
Configure sua impressora térmica nas configurações do sistema:
1. Acesse **Gerencial > Configurações**
2. Vá para a categoria **PDV**
3. Configure a impressora padrão
4. Ative a impressão automática se desejado

### Backup Automático
O sistema pode ser configurado para fazer backup automático:
1. Acesse **Gerencial > Configurações**
2. Vá para a categoria **Financeiro**
3. Ative o backup automático diário

## 📈 Métricas e Performance

### Estatísticas do Sistema
- Tempo de carregamento otimizado
- Interface responsiva (< 100ms)
- Banco de dados eficiente
- Uso mínimo de recursos

### Capacidade
- Suporte a milhares de produtos
- Histórico ilimitado de vendas
- Múltiplos usuários simultâneos
- Backup incremental eficiente

## 🔒 Segurança

### Backup e Recuperação
- Backup automático diário
- Múltiplos pontos de restauração
- Verificação de integridade
- Criptografia de dados sensíveis

### Controle de Acesso
- Configurações protegidas
- Logs de auditoria
- Validação de dados
- Prevenção de perda de dados

## 🆘 Suporte e Manutenção

### Logs do Sistema
Os logs são armazenados automaticamente e podem ser configurados em diferentes níveis:
- Error: Apenas erros críticos
- Warn: Avisos e erros
- Info: Informações gerais
- Debug: Detalhamento completo

### Limpeza Automática
O sistema inclui rotinas de limpeza automática:
- Remoção de dados antigos
- Otimização do banco de dados
- Limpeza de arquivos temporários
- Compactação de backups

### Atualizações
- Sistema de atualização integrado
- Backup automático antes de atualizações
- Rollback em caso de problemas
- Notificações de novas versões

## 📞 Contato e Suporte

Para suporte técnico ou dúvidas sobre o sistema:
- Email: suporte@sistemapdv.com
- Documentação: [link-da-documentacao]
- Issues: [link-do-github-issues]

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Integração com APIs de pagamento
- [ ] Módulo de e-commerce
- [ ] App mobile complementar
- [ ] Integração com contabilidade
- [ ] Relatórios fiscais
- [ ] Multi-loja

### Melhorias Planejadas
- [ ] Interface dark mode
- [ ] Personalização avançada
- [ ] Integração com balanças
- [ ] Leitor de código de barras
- [ ] Impressão de etiquetas
- [ ] Dashboard executivo

---

**Sistema PDV v2.0** - Desenvolvido com ❤️ para pequenas e médias empresas.

*Última atualização: Dezembro 2024*

# pdv
