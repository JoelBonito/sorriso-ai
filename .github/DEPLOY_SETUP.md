# 🚀 Setup de Deploy Automático - GitHub Actions

Este guia explica como configurar o deploy automático das Edge Functions do Supabase via GitHub Actions.

## ✅ O que este workflow faz?

Sempre que você fizer **push/merge para main/master** com alterações em `supabase/functions/`, o GitHub Actions automaticamente:

1. ✅ Faz deploy da Edge Function `generate-budget-pdf`
2. ✅ Atualiza os secrets (PDFSHIFT_API_KEY)
3. ✅ Notifica se houver erro

---

## 🔧 Configuração Inicial (Uma Vez Apenas)

### Passo 1: Adicionar Secrets no GitHub

Vá para o seu repositório no GitHub:

```
https://github.com/JoelBonito/sorriso-ai/settings/secrets/actions
```

Clique em **"New repository secret"** e adicione os seguintes secrets:

#### Secret 1: `SUPABASE_ACCESS_TOKEN`

**Valor:**
```
sbp_726b31b5f84cd87b30df831f959a4e56625119ef
```

**Como criar (se precisar de um novo):**
1. Acesse: https://supabase.com/dashboard/account/tokens
2. Clique em "Generate new token"
3. Copie o token gerado

---

#### Secret 2: `SUPABASE_PROJECT_ID`

**Valor:**
```
hqexulgmmtghwtgnqtfy
```

**Como encontrar:**
- Vá em: https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/settings/general
- Está em "Reference ID" ou "Project ID"

---

#### Secret 3: `PDFSHIFT_API_KEY` (Opcional)

**Valor:** Sua chave da API do PDFShift

**Como obter:**
1. Acesse: https://pdfshift.io/
2. Faça login ou crie conta gratuita (50 PDFs/mês)
3. Copie a API Key do dashboard

**Nota:** Se você já configurou este secret via CLI antes, não é obrigatório adicionar aqui. Mas adicionar aqui permite atualizar automaticamente se você mudar a chave.

---

## 📋 Como Usar

### Deploy Automático

Após configurar os secrets, o deploy é automático:

```bash
# No seu computador
git add .
git commit -m "Atualiza Edge Function"
git push origin main

# GitHub Actions vai:
# ✅ Detectar alteração em supabase/functions/
# ✅ Fazer deploy automático
# ✅ Você verá o status na aba "Actions" do GitHub
```

### Deploy Manual (On-Demand)

Você também pode disparar o deploy manualmente:

1. Vá em: https://github.com/JoelBonito/sorriso-ai/actions
2. Clique em "Deploy Edge Functions" (workflow)
3. Clique em "Run workflow"
4. Selecione a branch e clique "Run workflow"

---

## 🔍 Verificar Status do Deploy

Após fazer push:

1. Vá em: https://github.com/JoelBonito/sorriso-ai/actions
2. Clique no workflow mais recente
3. Veja os logs de cada step
4. Se tudo estiver verde ✅, o deploy foi bem-sucedido!

---

## ⚠️ Troubleshooting

### Erro: "Authentication failed"

**Causa:** Access token inválido ou expirado

**Solução:**
1. Gere novo token em: https://supabase.com/dashboard/account/tokens
2. Atualize o secret `SUPABASE_ACCESS_TOKEN` no GitHub

---

### Erro: "Project not found"

**Causa:** Project ID incorreto

**Solução:**
1. Verifique o ID em: https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/settings/general
2. Atualize o secret `SUPABASE_PROJECT_ID` no GitHub

---

### Erro: "Function deploy failed"

**Causa:** Erro no código da Edge Function

**Solução:**
1. Veja os logs detalhados na aba Actions
2. Corrija o erro no código
3. Faça commit e push novamente

---

## 📝 Notas Importantes

1. **O workflow só roda em push para main/master**
   - Branches de desenvolvimento não fazem deploy automático
   - Você pode testar localmente antes de fazer merge

2. **Alterações em `supabase/functions/` disparam o deploy**
   - Se você alterar apenas o frontend, o workflow não roda
   - Isso economiza minutos do GitHub Actions

3. **Logs detalhados**
   - Todos os logs estão disponíveis na aba Actions
   - Útil para debugar problemas

---

## 🎉 Pronto!

Agora você tem deploy automático configurado! 🚀

**Próximos passos:**
1. ✅ Adicione os 3 secrets no GitHub
2. ✅ Faça push de qualquer alteração para testar
3. ✅ Verifique o deploy na aba Actions

---

**Criado em:** 2025-11-11
**Workflow:** `.github/workflows/deploy-edge-functions.yml`
