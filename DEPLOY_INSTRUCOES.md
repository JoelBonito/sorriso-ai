# 🚀 INSTRUÇÕES DE DEPLOY COMPLETO

## ⚠️ IMPORTANTE: Comandos para rodar NO SEU COMPUTADOR

Os comandos abaixo devem ser executados **no terminal do seu computador**, não aqui.

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ Criar Conta PDFShift (2 min)

**Se ainda não criou:**

```
1. Acesse: https://pdfshift.io/register
2. Preencha:
   - Email
   - Senha
   - Nome
3. Clique "Sign Up"
4. Confirme seu email
```

### 2️⃣ Obter API Key (1 min)

```
1. Login: https://pdfshift.io/login
2. Dashboard → API Keys
3. Copiar sua API Key (começa com "sk_")
```

**Exemplo:** `sk_abcd1234efgh5678ijkl9012mnop3456`

---

### 3️⃣ Configurar API Key no Supabase (1 min)

**No terminal do seu computador:**

```bash
# Navegar até a pasta do projeto
cd /caminho/para/sorriso-ai

# Configurar API Key como secret
supabase secrets set PDFSHIFT_API_KEY=sk_sua_api_key_aqui
```

**⚠️ IMPORTANTE:** Substitua `sk_sua_api_key_aqui` pela sua chave real do PDFShift!

**Exemplo:**
```bash
supabase secrets set PDFSHIFT_API_KEY=sk_abcd1234efgh5678ijkl9012mnop3456
```

---

### 4️⃣ Deploy da Edge Function (2 min)

**No mesmo terminal:**

```bash
# Deploy da função atualizada
supabase functions deploy generate-budget-pdf
```

**Saída esperada:**
```
Deploying function generate-budget-pdf...
✓ Deployed function generate-budget-pdf
  URL: https://seu-projeto.supabase.co/functions/v1/generate-budget-pdf
```

---

### 5️⃣ Verificar Deploy (1 min)

**Verificar que o deploy foi bem-sucedido:**

```bash
# Ver logs em tempo real
supabase functions logs generate-budget-pdf --follow
```

**Deixe esse comando rodando e vá para o próximo passo.**

---

### 6️⃣ Testar no MVP (2 min)

1. **Abra o MVP** no navegador
2. **Vá até um orçamento**
3. **Clique "Gerar PDF"**
4. **Aguarde 3-5 segundos**

**Resultado esperado:**
- ✅ PDF abre automaticamente
- ✅ É um arquivo PDF REAL (não HTML)
- ✅ Formato A4 profissional
- ✅ Imagens aparecem
- ✅ Pode fazer download

**Nos logs (terminal), você verá:**
```
Iniciando conversão HTML→PDF com PDFShift...
PDF gerado com sucesso: {
  duration_ms: 2847,
  size_bytes: 125643,
  size_kb: 123
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Depois de gerar o PDF, valide:

- [ ] PDF é arquivo válido (não HTML)
- [ ] Abre no navegador
- [ ] Formato A4 correto
- [ ] Margens adequadas
- [ ] Imagens visíveis e nítidas
- [ ] Tabelas formatadas
- [ ] Pode fazer download
- [ ] Pode imprimir

**Se todos os itens OK:** ✅ **SISTEMA FUNCIONANDO!**

---

## 🐛 TROUBLESHOOTING

### Erro: "supabase: command not found"

**Causa:** Supabase CLI não está instalado

**Solução:**
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

Depois de instalar, fazer login:
```bash
supabase login
```

---

### Erro: "PDFSHIFT_API_KEY não configurada"

**Causa:** Secret não foi configurado ou não foi aplicado

**Solução:**
```bash
# Verificar secrets existentes
supabase secrets list

# Se não aparecer PDFSHIFT_API_KEY:
supabase secrets set PDFSHIFT_API_KEY=sua_key

# Re-deploy
supabase functions deploy generate-budget-pdf
```

---

### Erro: "PDFShift HTTP 401: Unauthorized"

**Causa:** API Key inválida ou expirada

**Solução:**
1. Verificar API Key no dashboard PDFShift
2. Copiar novamente
3. Reconfigurar:
```bash
supabase secrets set PDFSHIFT_API_KEY=nova_key
supabase functions deploy generate-budget-pdf
```

---

### PDF antigo ainda aparece

**Causa:** Deploy não foi feito ou cache do navegador

**Solução:**
```bash
# 1. Fazer deploy novamente
supabase functions deploy generate-budget-pdf

# 2. Limpar cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)

# 3. Gerar novo PDF
```

---

### Erro: "Failed to deploy"

**Causa:** Não está logado no Supabase ou projeto não está linkado

**Solução:**
```bash
# 1. Login no Supabase
supabase login

# 2. Link com projeto
supabase link --project-ref seu-project-ref

# 3. Tentar deploy novamente
supabase functions deploy generate-budget-pdf
```

**Para encontrar project-ref:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings → General → Reference ID

---

## 📊 MONITORAMENTO

### Ver uso do PDFShift

1. **Dashboard:** https://pdfshift.io/dashboard
2. **Métricas:**
   - PDFs gerados este mês: X/50
   - Tempo médio de conversão
   - Taxa de sucesso

### Ver logs da Edge Function

```bash
# Logs em tempo real
supabase functions logs generate-budget-pdf --follow

# Últimas 50 linhas
supabase functions logs generate-budget-pdf --tail 50
```

---

## 🎯 RESUMO DOS COMANDOS

**Copie e cole no terminal (substituindo valores):**

```bash
# 1. Navegar para o projeto
cd /caminho/para/sorriso-ai

# 2. Configurar API Key
supabase secrets set PDFSHIFT_API_KEY=sua_key_aqui

# 3. Deploy
supabase functions deploy generate-budget-pdf

# 4. Ver logs (opcional)
supabase functions logs generate-budget-pdf --follow
```

---

## 📝 PRÓXIMOS PASSOS

Após deploy bem-sucedido:

1. ✅ **Testar** com orçamentos reais
2. ✅ **Validar** com usuários finais
3. ✅ **Monitorar** uso mensal do PDFShift
4. ✅ **Coletar feedback** para melhorias

---

## 💡 DICAS

### Economizar PDFs (50/mês FREE)

1. **Não regenere** PDFs desnecessariamente
2. **Use "Ver PDF"** para visualizar existente
3. **Durante testes:** delete PDFs de teste
4. **Produção:** gere PDF só quando finalizado

### Quando fazer Upgrade ($9/mês = 1.000 PDFs)

- Atingiu 40+ PDFs/mês
- Crescimento rápido
- Múltiplas clínicas

---

**Data de criação:** Janeiro 2025
**Status:** Pronto para deploy
**Tempo total:** ~10 minutos
