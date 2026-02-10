#!/bin/bash

# ===========================================
# Script de Build para Produção - ERP System
# ===========================================

set -e

echo "🚀 Iniciando build de produção..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto${NC}"
    exit 1
fi

# Limpar builds anteriores
echo -e "${YELLOW}🧹 Limpando builds anteriores...${NC}"
rm -rf dist
rm -rf node_modules/.vite

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
pnpm install

# Verificar tipos TypeScript
echo -e "${YELLOW}🔍 Verificando tipos TypeScript...${NC}"
pnpm run check

# Build do frontend (Vite)
echo -e "${YELLOW}🏗️  Compilando frontend...${NC}"
pnpm exec vite build

# Build do backend (esbuild)
echo -e "${YELLOW}🏗️  Compilando backend...${NC}"
pnpm exec esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Copiar arquivos necessários
echo -e "${YELLOW}📋 Copiando arquivos de configuração...${NC}"
cp .htaccess dist/ 2>/dev/null || true
cp app.js dist/ 2>/dev/null || true

# Criar pasta de logs
mkdir -p logs

# Verificar se o build foi bem-sucedido
if [ -f "dist/index.js" ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
    echo ""
    echo "📁 Arquivos gerados em ./dist/"
    echo ""
    echo "Próximos passos:"
    echo "  1. Configure o arquivo .env no servidor"
    echo "  2. Faça upload da pasta dist/ para o servidor"
    echo "  3. Execute: npm install --production"
    echo "  4. Execute: npx drizzle-kit migrate"
    echo "  5. Inicie a aplicação no cPanel"
else
    echo -e "${RED}❌ Erro: Build falhou - dist/index.js não encontrado${NC}"
    exit 1
fi
