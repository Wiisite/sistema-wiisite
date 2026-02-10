# ===========================================
# Script de Build para Produção - ERP System
# PowerShell version for Windows
# ===========================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando build de produção..." -ForegroundColor Cyan

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto" -ForegroundColor Red
    exit 1
}

# Limpar builds anteriores
Write-Host "🧹 Limpando builds anteriores..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "node_modules/.vite") { Remove-Item -Recurse -Force "node_modules/.vite" }

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
pnpm install

# Verificar tipos TypeScript
Write-Host "🔍 Verificando tipos TypeScript..." -ForegroundColor Yellow
pnpm run check

# Build do frontend (Vite)
Write-Host "🏗️  Compilando frontend..." -ForegroundColor Yellow
pnpm exec vite build

# Build do backend (esbuild)
Write-Host "🏗️  Compilando backend..." -ForegroundColor Yellow
pnpm exec esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Copiar arquivos necessários
Write-Host "📋 Copiando arquivos de configuração..." -ForegroundColor Yellow
if (Test-Path ".htaccess") { Copy-Item ".htaccess" "dist/" -ErrorAction SilentlyContinue }
if (Test-Path "app.js") { Copy-Item "app.js" "dist/" -ErrorAction SilentlyContinue }

# Criar pasta de logs
if (-not (Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" | Out-Null }

# Verificar se o build foi bem-sucedido
if (Test-Path "dist/index.js") {
    Write-Host ""
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Arquivos gerados em ./dist/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor White
    Write-Host "  1. Configure o arquivo .env no servidor"
    Write-Host "  2. Faça upload da pasta dist/ para o servidor"
    Write-Host "  3. Execute: npm install --production"
    Write-Host "  4. Execute: npx drizzle-kit migrate"
    Write-Host "  5. Inicie a aplicação no cPanel"
} else {
    Write-Host "❌ Erro: Build falhou - dist/index.js não encontrado" -ForegroundColor Red
    exit 1
}
