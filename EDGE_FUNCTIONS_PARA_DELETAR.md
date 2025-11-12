# 🗑️ EDGE FUNCTIONS PARA DELETAR - Análise Completa

## ⚠️ ALERTA: Edge Functions Órfãs Detectadas

Após análise completa, identifiquei **5 Edge Functions órfãs** deployadas no Supabase que **NÃO EXISTEM no código local** e **NÃO SÃO MAIS UTILIZADAS**.

---

## 📊 Resumo Executivo

| Status | Quantidade |
|--------|------------|
| ✅ Edge Functions ATIVAS e em uso | 2 |
| ❌ Edge Functions ÓRFÃS (podem ser deletadas) | 5 |
| 📦 Total Deployado no Supabase | 6* |

\* **Nota:** `generate-budget-pdf` existe localmente mas não aparece na lista do Supabase (pode não estar deployada ou ter nome diferente)

---

## 📋 EDGE FUNCTIONS DEPLOYADAS NO SUPABASE

### ✅ **MANTER (2 funções)**

#### 1. ✅ `process-dental-facets`
- **Status:** ✅ ATIVA E CRÍTICA
- **Invocações:** 1 (recente)
- **Existe localmente:** ✅ SIM
- **Usada no código:** ✅ SIM
  - `src/hooks/useTechnicalReport.ts` (linha 57)
  - `src/pages/simulator/SimulatorPage.tsx` (linha 167)
- **Recomendação:** **MANTER** - Função crítica do sistema

#### 2. ✅ `generate-budget-pdf`
- **Status:** ✅ ATIVA
- **Invocações:** Não aparece na lista (pode não estar deployada?)
- **Existe localmente:** ✅ SIM
- **Usada no código:** ✅ SIM
  - `src/services/budgetService.ts` (linha 554)
- **Recomendação:** **MANTER** - Função em uso
- **⚠️ ATENÇÃO:** Esta função existe localmente e é usada no código, mas não aparece na sua lista de Edge Functions deployadas. **Verifique se precisa fazer deploy dela!**

---

### ❌ **DELETAR (5 funções órfãs)**

#### 1. ❌ `get-claude-api-key`
- **Status:** 🔴 ÓRFÃ - SEM CÓDIGO LOCAL
- **URL:** https://qkygbyuzhpvujodcrbwg.supabase.co/functions/v1/get-claude-api-key
- **Invocações:** 92 (últimas 2 dias)
- **Última atividade:** 2 dias atrás
- **Existe localmente:** ❌ NÃO
- **Usada no código:** ❌ NÃO (0 referências)
- **Encontrado em migrations:** ❌ NÃO
- **Encontrado em configs:** ❌ NÃO
- **Encontrado no git history:** ❌ NÃO

**Análise:**
- ⚠️ **92 invocações** sugerem que pode ter sido muito usada no passado
- Provavelmente foi parte de uma feature descontinuada
- Código foi removido do repositório mas função permaneceu deployada
- Pode ter sido substituída por outra solução

**Recomendação:** ❌ **DELETAR** - Função completamente órfã, sem código ou referências

---

#### 2. ❌ `poll-batch-jobs`
- **Status:** 🔴 ÓRFÃ - SEM CÓDIGO LOCAL
- **URL:** https://qkygbyuzhpvujodcrbwg.supabase.co/functions/v1/poll-batch-jobs
- **Invocações:** 77 (últimas 2 dias)
- **Última atividade:** 2 dias atrás
- **Existe localmente:** ❌ NÃO
- **Usada no código:** ❌ NÃO (0 referências)
- **Encontrado em migrations:** ❌ NÃO
- **Encontrado em configs:** ❌ NÃO
- **Encontrado no git history:** ❌ NÃO

**Análise:**
- ⚠️ **77 invocações** sugerem uso recente ou automático
- Nome sugere polling de jobs em batch (processamento assíncrono)
- Pode ter sido parte de um sistema de filas que foi descontinuado
- Possível substituição por outra abordagem

**Recomendação:** ❌ **DELETAR** - Função completamente órfã, sem código ou referências

---

#### 3. ❌ `notify-on-insert`
- **Status:** 🔴 ÓRFÃ - SEM CÓDIGO LOCAL
- **URL:** https://qkygbyuzhpvujodcrbwg.supabase.co/functions/v1/notify-on-insert
- **Invocações:** 2 (últimas 5 dias)
- **Última atividade:** 5 dias atrás
- **Existe localmente:** ❌ NÃO
- **Usada no código:** ❌ NÃO (0 referências)
- **Encontrado em migrations:** ❌ NÃO
- **Encontrado em configs:** ❌ NÃO
- **Encontrado no git history:** ❌ NÃO

**Análise:**
- Poucas invocações (2)
- Nome sugere notificações em inserts de banco de dados
- Provavelmente era trigger automático que foi desativado
- Pode ter sido substituída por outra lógica de notificação

**Recomendação:** ❌ **DELETAR** - Função órfã com uso mínimo

---

#### 4. ❌ `generate-report-pdf`
- **Status:** 🔴 ÓRFÃ - SEM CÓDIGO LOCAL
- **URL:** https://qkygbyuzhpvujodcrbwg.supabase.co/functions/v1/generate-report-pdf
- **Invocações:** 1 (últimas 5 dias)
- **Última atividade:** 5 dias atrás
- **Existe localmente:** ❌ NÃO
- **Usada no código:** ❌ NÃO (0 referências)
- **Encontrado em migrations:** ❌ NÃO
- **Encontrado em configs:** ❌ NÃO
- **Encontrado no git history:** ❌ NÃO

**Análise:**
- Apenas 1 invocação
- Nome similar a funcionalidade atual, mas não é a mesma
- Provavelmente versão antiga/teste de geração de PDFs
- Funcionalidade foi incorporada em outras funções

**Recomendação:** ❌ **DELETAR** - Função órfã, praticamente sem uso

---

#### 5. ❌ `generate-document`
- **Status:** 🔴 ÓRFÃ - SEM CÓDIGO LOCAL
- **URL:** https://qkygbyuzhpvujodcrbwg.supabase.co/functions/v1/generate-document
- **Invocações:** 1 (últimas 5 dias)
- **Última atividade:** 5 dias atrás
- **Existe localmente:** ❌ NÃO
- **Usada no código:** ❌ NÃO (0 referências)
- **Encontrado em migrations:** ❌ NÃO
- **Encontrado em configs:** ❌ NÃO
- **Encontrado no git history:** ❌ NÃO

**Análise:**
- Apenas 1 invocação
- Nome genérico sugere geração de documentos
- Provavelmente teste ou feature descontinuada
- Funcionalidade pode ter sido mesclada em outras funções

**Recomendação:** ❌ **DELETAR** - Função órfã, praticamente sem uso

---

## 🎯 RECOMENDAÇÕES FINAIS

### ✅ **Edge Functions a MANTER**

| Função | Motivo |
|--------|--------|
| `process-dental-facets` | ✅ Função crítica, múltiplas referências ativas |
| `generate-budget-pdf` | ✅ Usada em orçamentos (verificar se está deployada) |

### ❌ **Edge Functions a DELETAR**

| Função | Prioridade | Invocações | Risco |
|--------|-----------|------------|-------|
| `get-claude-api-key` | 🔴 ALTA | 92 | ⚠️ MÉDIO |
| `poll-batch-jobs` | 🔴 ALTA | 77 | ⚠️ MÉDIO |
| `notify-on-insert` | 🟡 MÉDIA | 2 | ✅ BAIXO |
| `generate-report-pdf` | 🟢 BAIXA | 1 | ✅ BAIXO |
| `generate-document` | 🟢 BAIXA | 1 | ✅ BAIXO |

**Prioridade de Deleção:**
1. **Primeiro:** `generate-report-pdf` e `generate-document` (baixíssimo uso)
2. **Segundo:** `notify-on-insert` (uso mínimo)
3. **Terceiro:** `get-claude-api-key` e `poll-batch-jobs` (⚠️ cuidado - muitas invocações recentes)

---

## ⚠️ ATENÇÃO: Invocações Altas

As funções `get-claude-api-key` (92) e `poll-batch-jobs` (77) têm **muitas invocações recentes** (últimos 2 dias).

**Possíveis causas:**
1. 🤖 Chamadas automáticas de triggers/webhooks antigos
2. 🔄 Polling/retry loops de sistemas externos
3. 📊 Testes ou scripts executados recentemente
4. 🐛 Bug causando chamadas em loop
5. 👻 Código em outra branch/ambiente

**⚠️ ANTES DE DELETAR essas duas:**
1. Monitore o painel do Supabase por 24-48h
2. Verifique logs de erros após possível deleção
3. Considere desativar antes de deletar
4. Verifique se há webhooks configurados

---

## 📋 PASSO A PASSO PARA DELEÇÃO

### Opção 1: Deleção Individual (Recomendado)

```bash
# No dashboard do Supabase:
# 1. Ir para Edge Functions
# 2. Selecionar a função
# 3. Clicar em "Delete"

# Ordem sugerida:
# 1º - generate-document (1 invocação)
# 2º - generate-report-pdf (1 invocação)
# 3º - notify-on-insert (2 invocações)
# 4º - Aguardar 24-48h e monitorar
# 5º - get-claude-api-key (92 invocações) ⚠️
# 6º - poll-batch-jobs (77 invocações) ⚠️
```

### Opção 2: Via CLI do Supabase

```bash
# Instalar CLI se necessário
npm install -g supabase

# Autenticar
supabase login

# Listar funções deployadas
supabase functions list

# Deletar função individual
supabase functions delete generate-document
supabase functions delete generate-report-pdf
supabase functions delete notify-on-insert

# ⚠️ Aguardar monitoramento antes de deletar estas:
# supabase functions delete get-claude-api-key
# supabase functions delete poll-batch-jobs
```

---

## 🔍 VERIFICAÇÃO PÓS-DELEÇÃO

Após deletar cada função, verifique:

1. ✅ Sistema continua funcionando normalmente
2. ✅ Logs não mostram erros 404 para a função deletada
3. ✅ Usuários não reportam problemas
4. ✅ Testes automatizados passam (se houver)

**Se aparecerem erros:**
- Verifique qual parte do código está chamando a função deletada
- Pode ser código em produção que não está no repositório
- Considere fazer rollback temporário

---

## 📊 ESTATÍSTICAS FINAIS

| Métrica | Valor |
|---------|-------|
| Edge Functions no Supabase | 6 |
| Edge Functions no Código Local | 2 |
| Edge Functions Órfãs | 5 (83%) |
| Total de Invocações (órfãs) | 173 |
| Pode Deletar com Segurança | 3 funções |
| Deletar com Monitoramento | 2 funções |
| Economia de Recursos | ~83% das funções |

---

## ⚡ BENEFÍCIOS DA LIMPEZA

Ao deletar essas 5 Edge Functions órfãs:

1. ✅ **Redução de custos** - Menos funções ativas = menos cobrança
2. ✅ **Clareza no dashboard** - Apenas funções realmente usadas
3. ✅ **Segurança** - Menos endpoints expostos
4. ✅ **Manutenção** - Menos confusão sobre o que está ativo
5. ✅ **Performance** - Menos recursos alocados

---

## 🚨 PROBLEMA DETECTADO

### ⚠️ `generate-budget-pdf` NÃO está na lista do Supabase!

A função `generate-budget-pdf`:
- ✅ Existe localmente: `supabase/functions/generate-budget-pdf/`
- ✅ É usada no código: `src/services/budgetService.ts:554`
- ❌ **NÃO** aparece na lista de funções deployadas

**Ação Necessária:**
```bash
# Deploy da função faltante
cd supabase/functions
supabase functions deploy generate-budget-pdf
```

---

## ✅ CONCLUSÃO

**PODE DELETAR COM SEGURANÇA (3):**
- ✅ `generate-document`
- ✅ `generate-report-pdf`
- ✅ `notify-on-insert`

**DELETAR COM MONITORAMENTO (2):**
- ⚠️ `get-claude-api-key` (monitorar por 24-48h primeiro)
- ⚠️ `poll-batch-jobs` (monitorar por 24-48h primeiro)

**TOTAL QUE PODE SER DELETADO:** 5 funções (83% das deployadas)

---

**Data da Análise:** 2025-11-12
**Versão do Sistema:** Branch `claude/delete-user-configs-table-011CV47sDR95BdbtrgZ6DHwj`
**Projeto:** Sorriso AI - Sistema de Simulação Dental
