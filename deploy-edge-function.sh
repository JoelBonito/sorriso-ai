#!/bin/bash

# Script de deploy manual da Edge Function
# Use este script se o GitHub Actions não estiver configurado

echo "🚀 Deploy da Edge Function generate-budget-pdf"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI não encontrado!${NC}"
    echo ""
    echo "Instale com:"
    echo "  macOS/Linux: brew install supabase/tap/supabase"
    echo "  Windows: scoop install supabase"
    echo "  Ou via npm: npm install -g supabase"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI encontrado${NC}"
echo ""

# Configurar variáveis
PROJECT_ID="hqexulgmmtghwtgnqtfy"
ACCESS_TOKEN="sbp_726b31b5f84cd87b30df831f959a4e56625119ef"

echo "📋 Configurações:"
echo "  Project ID: $PROJECT_ID"
echo "  Function: generate-budget-pdf"
echo ""

# Fazer login (usando access token)
echo "🔑 Autenticando com Supabase..."
export SUPABASE_ACCESS_TOKEN="$ACCESS_TOKEN"

# Link ao projeto
echo "🔗 Linkando ao projeto..."
supabase link --project-ref "$PROJECT_ID" 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao linkar projeto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Projeto linkado${NC}"
echo ""

# Deploy da função
echo "📦 Fazendo deploy da função generate-budget-pdf..."
supabase functions deploy generate-budget-pdf --no-verify-jwt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no deploy da função${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""

# Instruções para configurar secrets
echo "🔑 IMPORTANTE: Configure os secrets necessários"
echo "==============================================="
echo ""
echo "Se você ainda não configurou o PDFSHIFT_API_KEY, rode:"
echo ""
echo -e "${YELLOW}  supabase secrets set PDFSHIFT_API_KEY=sua_chave_aqui --project-ref $PROJECT_ID${NC}"
echo ""
echo "Para obter a chave PDFShift:"
echo "  1. Acesse: https://pdfshift.io/"
echo "  2. Crie conta gratuita (50 PDFs/mês)"
echo "  3. Copie a API Key do dashboard"
echo ""
echo "✅ Deploy finalizado! Teste agora no MVP."
