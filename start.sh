#!/bin/bash

echo "🚀 Iniciando Sistema PDV..."
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 20+ primeiro."
    exit 1
fi

# Verificar se o pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm não encontrado. Instalando..."
    npm install -g pnpm
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    pnpm install
    
    echo "🔧 Configurando builds..."
    echo "a" | pnpm approve-builds
    echo "y" | pnpm approve-builds
fi

echo ""
echo "✅ Sistema PDV pronto!"
echo ""
echo "Escolha uma opção:"
echo "1) Executar no navegador (desenvolvimento)"
echo "2) Executar como aplicação desktop (Electron)"
echo "3) Fazer build para produção"
echo ""
read -p "Opção (1-3): " opcao

case $opcao in
    1)
        echo "🌐 Iniciando servidor de desenvolvimento..."
        pnpm run dev
        ;;
    2)
        echo "🖥️  Iniciando aplicação Electron..."
        NODE_ENV=development pnpm run electron-dev
        ;;
    3)
        echo "🏗️  Fazendo build para produção..."
        pnpm run build
        echo "✅ Build concluído! Arquivos em ./dist/"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

