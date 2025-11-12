# ⚡ AÇÕES URGENTES - Resolver Erro de PDF

## 🚨 PROBLEMA ATUAL

Erro ao gerar PDF de orçamentos:
```
POST generate-budget-pdf 400 (Bad Request)
Edge Function returned a non-2xx status code
```

**Causa:** Tabela `user_configs` foi deletada do Supabase.

---

## ✅ SOLUÇÃO EM 3 PASSOS

### 1️⃣ EXECUTAR MIGRATION NO SUPABASE (OBRIGATÓRIO)

**Tempo:** ~2 minutos

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/sql
   ```

2. **Abra o arquivo no seu editor:**
   ```
   supabase/migrations/20251112120000_recreate_user_configs_table.sql
   ```

3. **Copie TODO o conteúdo do arquivo**

4. **Cole no SQL Editor do Supabase**

5. **Clique em "Run"**

6. **Aguarde mensagem de sucesso**

✅ **Verificação:**
```sql
-- Cole isso no SQL Editor para verificar
SELECT COUNT(*) FROM user_configs;
-- Deve retornar um número (mesmo que 0) sem erro
```

---

### 2️⃣ DEPLOY DA EDGE FUNCTION CORRIGIDA

**Tempo:** ~1 minuto

**Opção A: Automático (Lovable)**
- ✅ Se você está no Lovable, o deploy já foi feito automaticamente
- ✅ Aguarde 1-2 minutos
- ✅ Vá para o passo 3

**Opção B: Manual (se necessário)**
```bash
# Instalar CLI (primeira vez)
npm install -g supabase

# Login
supabase login

# Deploy
supabase functions deploy generate-budget-pdf
```

---

### 3️⃣ PREENCHER CONFIGURAÇÕES DA CLÍNICA

**Tempo:** ~3 minutos

1. **No sistema, vá para: Configurações**

2. **Preencha os dados da clínica:**
   - ✅ Nome da clínica
   - ✅ CNPJ
   - ✅ Endereço completo (rua, CEP, cidade, estado)
   - ✅ Telefone
   - ✅ E-mail

3. **Preencha dados do dentista:**
   - ✅ Nome do dentista responsável
   - ✅ CRO (Conselho Regional)

4. **Configure pagamento (opcional):**
   - Desconto à vista: 10% (padrão)
   - Desconto PIX: 5% (padrão)
   - Parcelas máximas: 12x (padrão)

5. **Clique em "Salvar Configuração"**

6. **Verifique se salvou sem erros**

---

## 🧪 TESTE FINAL

Após fazer os 3 passos:

1. ✅ Faça uma **nova simulação** (facetas ou clareamento)
2. ✅ Tente gerar o **orçamento**
3. ✅ Verifique se o **PDF é gerado**
4. ✅ Abra o PDF e **confira se os dados da clínica aparecem**

---

## 📊 RESULTADO ESPERADO

### ✅ APÓS PASSO 1 (Migration):
- Tabela `user_configs` existe
- Sem erro ao tentar acessar a tabela
- Possível salvar configurações

### ✅ APÓS PASSO 2 (Deploy):
- PDF gerado (mesmo com dados padrão)
- Sem erro 400
- Funcionalidade funcionando

### ✅ APÓS PASSO 3 (Configurações):
- PDF com dados reais da clínica
- Informações profissionais completas
- Pronto para apresentar ao paciente

---

## 🚨 SE AINDA DER ERRO

### Erro: "relation 'user_configs' does not exist"
➡️ **Passo 1 não foi executado** - Execute a migration

### Erro: "400 Bad Request" persiste
➡️ **Passo 2 não foi feito** - Aguarde deploy automático ou faça manual

### PDF gerado mas com dados "-"
➡️ **Passo 3 não foi feito** - Preencha as configurações

### Erro ao salvar configurações
➡️ **Passo 1 falhou** - Verifique logs do SQL Editor

---

## 📞 VERIFICAÇÕES RÁPIDAS

### Verificar se migration foi executada:
```sql
-- No SQL Editor do Supabase
SELECT * FROM user_configs LIMIT 1;
```
- ✅ Retorna dados ou "no rows" → OK
- ❌ Erro "relation does not exist" → Executar migration

### Verificar se configurações foram salvas:
```sql
-- No SQL Editor do Supabase
SELECT clinic_name, clinic_cnpj FROM user_configs
WHERE user_id = auth.uid();
```
- ✅ Retorna seus dados → OK
- ❌ Retorna vazio → Preencher configurações

### Verificar se Edge Function está deployada:
```bash
# Via CLI
supabase functions list | grep generate-budget-pdf
```
- ✅ Aparece na lista → OK
- ❌ Não aparece → Fazer deploy

---

## ⏱️ TEMPO TOTAL ESTIMADO

| Passo | Tempo | Obrigatório |
|-------|-------|-------------|
| 1. Migration | 2 min | ✅ SIM |
| 2. Deploy | 1 min | ✅ SIM |
| 3. Configurações | 3 min | ⚠️ Recomendado |
| **TOTAL** | **~6 min** | |

---

## 📋 CHECKLIST FINAL

Execute nesta ordem:

- [ ] **Passo 1:** Migration executada no SQL Editor
- [ ] **Verificação 1:** Query `SELECT * FROM user_configs` funciona
- [ ] **Passo 2:** Edge Function deployada (automático ou manual)
- [ ] **Verificação 2:** Aguardar 1-2 minutos para deploy
- [ ] **Passo 3:** Configurações preenchidas e salvas
- [ ] **Verificação 3:** Dados visíveis na aba Configurações
- [ ] **Teste Final:** Nova simulação + geração de PDF
- [ ] **Verificação 4:** PDF gerado com dados corretos

---

## 📄 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, consulte:

- **`INSTRUCOES_RECUPERACAO_USER_CONFIGS.md`** - Detalhes da migration
- **`ERRO_GENERATE_BUDGET_PDF.md`** - Troubleshooting completo
- **`DEPLOY_FIX_BUDGET_PDF.md`** - Instruções de deploy
- **`FIX_ERRO_REACT.md`** - Se tiver erro no frontend

---

## 🎯 RESUMO EXECUTIVO

**Problema:**
- ❌ Tabela `user_configs` foi deletada
- ❌ Edge Function quebrou ao tentar buscar configs
- ❌ Geração de PDF não funciona

**Solução:**
1. ✅ Recriar tabela via migration
2. ✅ Deploy da Edge Function corrigida (com fallback)
3. ✅ Preencher configurações da clínica

**Resultado:**
- ✅ PDFs gerados normalmente
- ✅ Dados profissionais da clínica
- ✅ Sistema 100% funcional

---

**FAÇA AGORA:** Comece pelo Passo 1 (Migration) 👆

**Tempo total:** ~6 minutos
**Dificuldade:** Baixa
**Impacto:** Alto (resolve completamente o problema)

---

**Última atualização:** 2025-11-12
**Status:** ⚠️ AÇÃO NECESSÁRIA
