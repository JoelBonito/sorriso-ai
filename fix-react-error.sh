#!/bin/bash

# Script para corrigir erro "Cannot read properties of null (reading 'useEffect')"
# Após merge/pull que causa cache corrompido do Vite

echo "🔧 Corrigindo erro de React após merge..."
echo ""

# 1. Parar servidor se estiver rodando
echo "1️⃣ Parando servidor (se estiver rodando)..."
pkill -f "vite" 2>/dev/null || true

# 2. Limpar cache do Vite
echo "2️⃣ Limpando cache do Vite..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

# 3. Limpar node_modules (força reinstalação limpa)
echo "3️⃣ Removendo node_modules..."
rm -rf node_modules

# 4. Limpar lock files
echo "4️⃣ Limpando lock files..."
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# 5. Reinstalar dependências
echo "5️⃣ Reinstalando dependências..."
npm install

# 6. Limpar cache do navegador (instruções)
echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. No Lovable, clique em 'Restart Dev Server'"
echo "2. OU execute: npm run dev"
echo "3. Limpe o cache do navegador (Ctrl+Shift+Delete ou Cmd+Shift+Delete)"
echo "4. Recarregue a página (Ctrl+F5 ou Cmd+Shift+R)"
echo ""
echo "🎉 O erro deve estar resolvido!"
