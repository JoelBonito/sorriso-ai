# 🚨 ERRO: generate-budget-pdf retornando 400

## ❌ Problema Identificado

```
POST https://hqexulgmmtghwtgnqtfy.supabase.co/functions/v1/generate-budget-pdf 400 (Bad Request)
Edge Function returned a non-2xx status code
```

### 🔍 Causa Raiz

A Edge Function `generate-budget-pdf` está **falhando ao buscar dados da tabela `user_configs`**.

**Código da Edge Function (linha 44-50):**
```typescript
const { data: userConfig, error: configError } = await supabase
  .from('user_configs')
  .select('*')
  .eq('user_id', budget.user_id)
  .single()

if (configError) throw configError  // ❌ ERRO AQUI!
```

### ⚠️ Por que isso está acontecendo?

**Você deletou a tabela `user_configs` do Supabase!**

A Edge Function precisa dessa tabela para:
1. ✅ Dados da clínica (nome, endereço, CNPJ, etc.)
2. ✅ Dados do dentista responsável (nome, CRO)
3. ✅ Configurações de pagamento (descontos, parcelas)
4. ✅ Logo da clínica

**Sem esses dados, o PDF não pode ser gerado!**

---

## ✅ SOLUÇÃO URGENTE

### Passo 1: Executar a Migration que Recria a Tabela

**Você PRECISA executar a migration que criamos:**

1. **Acesse o SQL Editor do Supabase:**
   ```
   https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/sql
   ```

2. **Copie TODO o conteúdo do arquivo:**
   ```
   supabase/migrations/20251112120000_recreate_user_configs_table.sql
   ```

3. **Cole no SQL Editor e clique em "Run"**

4. **Aguarde a confirmação de sucesso**

### Passo 2: Preencher as Configurações

Depois de executar a migration:

1. **Vá para a aba "Configurações" no sistema**
2. **Preencha os dados da clínica:**
   - Nome da clínica
   - CNPJ
   - Endereço completo
   - Telefone
   - E-mail
   - Nome do dentista responsável
   - CRO

3. **Configure condições de pagamento:**
   - Desconto à vista
   - Desconto PIX
   - Parcelas máximas

4. **Clique em "Salvar Configuração"**

### Passo 3: Testar Novamente

1. Faça uma nova simulação
2. Tente gerar o orçamento
3. ✅ O PDF deve ser gerado com sucesso!

---

## 🔍 VERIFICAÇÃO - A Tabela Existe?

Para verificar se a tabela `user_configs` existe no Supabase:

### Opção 1: Via SQL Editor

```sql
-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'user_configs'
);

-- Se existir, verificar se há dados
SELECT COUNT(*) FROM user_configs;

-- Ver estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_configs'
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Opção 2: Via Table Editor

1. No Supabase Dashboard → Table Editor
2. Procure pela tabela `user_configs`
3. Se não existir → **Execute a migration agora!**
4. Se existir mas estiver vazia → **Preencha as configurações!**

---

## 📋 CHECKLIST DE CORREÇÃO

- [ ] **Migration executada:** Tabela `user_configs` recriada
- [ ] **Configurações preenchidas:** Dados da clínica salvos
- [ ] **Teste realizado:** Nova simulação + geração de PDF
- [ ] **PDF gerado:** Arquivo criado com sucesso
- [ ] **Dados corretos:** PDF contém informações da clínica

---

## 🔍 LOGS PARA VERIFICAR

### No Console do Navegador (F12):

Se ainda estiver dando erro, verifique:

```javascript
// Erro esperado se tabela não existe:
"relation 'user_configs' does not exist"

// Erro esperado se tabela existe mas está vazia:
"JSON object requested, multiple (or no) rows returned"
```

### No Dashboard do Supabase:

1. **Edge Functions → generate-budget-pdf → Logs**
2. Procure por erros recentes
3. Verifique qual linha está falhando

---

## 🛠️ SOLUÇÃO ALTERNATIVA (Temporária)

Se você não puder executar a migration agora, pode **desabilitar temporariamente** a geração de PDF:

### Opção 1: Comentar no Código

Em `src/services/budgetService.ts` (linha 442-450):

```typescript
// Temporariamente desabilitado - aguardando migration
/*
try {
  await generateBudgetPDF(data.id);
  console.log('✓ PDF do orçamento manual gerado com sucesso');
} catch (pdfError) {
  console.error('❌ Erro ao gerar PDF do orçamento manual:', pdfError);
}
*/
```

**Mas você PERDERÁ a funcionalidade de PDF até executar a migration!**

---

## 📊 IMPACTO DO PROBLEMA

### Funcionalidades Afetadas:

- ❌ **Geração de PDF de orçamentos** (CRÍTICO)
- ❌ **Apresentação profissional ao paciente**
- ❌ **Envio de orçamentos por e-mail**
- ⚠️ **Dados da clínica não aparecem em relatórios**

### Funcionalidades NÃO Afetadas:

- ✅ Simulações de facetas/clareamento
- ✅ Criação de orçamentos (sem PDF)
- ✅ Gestão de pacientes
- ✅ CRM e leads

---

## 🎯 RESUMO - FAÇA AGORA

### 1️⃣ EXECUTE A MIGRATION (OBRIGATÓRIO)

```
Supabase Dashboard → SQL Editor → Colar migration → Run
```

Arquivo: `supabase/migrations/20251112120000_recreate_user_configs_table.sql`

### 2️⃣ PREENCHA AS CONFIGURAÇÕES

```
Sistema → Configurações → Preencher dados → Salvar
```

### 3️⃣ TESTE

```
Nova simulação → Gerar orçamento → Verificar PDF
```

---

## 🆘 SE O ERRO PERSISTIR

### Verificar se a migration foi executada:

```sql
-- Verificar tabela
SELECT * FROM user_configs LIMIT 1;
```

### Verificar se os dados foram salvos:

```sql
-- Ver seus dados
SELECT
  clinic_name,
  clinic_cnpj,
  clinic_dentist_name,
  clinic_cro,
  payment_config
FROM user_configs
WHERE user_id = auth.uid();
```

### Verificar RLS (Row Level Security):

```sql
-- Ver policies da tabela
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_configs';
```

Se alguma dessas queries falhar, **a migration não foi executada corretamente**.

---

## 📞 CHECKLIST FINAL

Antes de tentar novamente:

1. ✅ Migration executada com sucesso
2. ✅ Tabela `user_configs` existe
3. ✅ Configurações preenchidas e salvas
4. ✅ Dados da clínica visíveis na aba Configurações
5. ✅ Nenhum erro no console ao salvar configurações

**Só então faça uma nova simulação!**

---

**Última atualização:** 2025-11-12
**Arquivo da migration:** `supabase/migrations/20251112120000_recreate_user_configs_table.sql`
**Instruções completas:** `INSTRUCOES_RECUPERACAO_USER_CONFIGS.md`
