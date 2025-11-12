# 📊 Análise das Edge Functions do Supabase

## 📋 Resumo Executivo

**Total de Edge Functions Encontradas:** 2
- ✅ **Ativas e em uso:** 2
- ❌ **Obsoletas/Não utilizadas:** 0

**Recomendação:** ✅ **TODAS as Edge Functions estão sendo utilizadas ativamente**. Nenhuma pode ser deletada.

---

## 🔍 Edge Functions Identificadas

### 1. ✅ `process-dental-facets`
**Status:** ✅ **ATIVA E CRÍTICA**
**Localização:** `supabase/functions/process-dental-facets/index.ts`

#### 📝 Descrição
Edge Function principal para processamento de análise dental com Google Gemini. Usa a API oficial do Google Gemini diretamente (não depende do gateway Lovable AI).

#### 🎯 Funcionalidades
Oferece **3 ações principais**:
1. **`analyze`** - Análise de imagem dental
2. **`generate-report`** - Geração de relatório técnico
3. **`generate`** - Geração de imagem simulada (facetas ou clareamento)

#### 🔗 Onde é Usada
- ✅ **`src/pages/simulator/SimulatorPage.tsx`** (linha 167)
  - Ação: `generate`
  - Propósito: Gerar imagem simulada de facetas/clareamento

- ✅ **`src/hooks/useTechnicalReport.ts`** (linha 57)
  - Ação: `generate-report`
  - Propósito: Gerar relatório técnico em texto

- ✅ **`src/pages/simulator/SimulatorLegacyPage.tsx`**
  - Uso similar ao SimulatorPage

- ✅ **`src/services/technicalReportService.ts`**
  - Comentário indica migração para esta Edge Function

#### 🔑 Dependências/Recursos
- API Google Gemini (`GEMINI_API_KEY`)
- Modelos utilizados:
  - Análise: `gemini-2.5-flash-lite`
  - Geração: `gemini-2.5-flash-image` (fallback: `gemini-2.0-flash-exp`)
- Arquivo de prompts modulares: `./prompts.ts`
- Autenticação Supabase (RLS)
- Verifica permissões para clareamento (`whitening_simulator_enabled`)

#### 📊 Uso Estimado
**MUITO ALTO** - Função essencial do sistema, usada em:
- Simulação de facetas dentárias
- Simulação de clareamento dental
- Geração de relatórios técnicos
- Análise de imagens

#### ⚠️ Recomendação
**MANTER - FUNÇÃO CRÍTICA**
Esta é a função principal do sistema. Deletá-la quebraria completamente as funcionalidades de simulação.

---

### 2. ✅ `generate-budget-pdf`
**Status:** ✅ **ATIVA E EM USO**
**Localização:** `supabase/functions/generate-budget-pdf/index.ts`

#### 📝 Descrição
Edge Function para gerar PDF de orçamentos odontológicos usando PDFShift.

#### 🎯 Funcionalidades
1. Busca dados do orçamento (budget)
2. Busca configurações do usuário (clinic info, payment config)
3. Gera template Markdown com dados
4. Converte Markdown → HTML
5. Converte HTML → PDF usando PDFShift
6. Faz upload do PDF para Storage (bucket `budgets`)
7. Atualiza budget com `pdf_url`

#### 🔗 Onde é Usada
- ✅ **`src/services/budgetService.ts`** (linha 554)
  - Função `generateBudgetPDF(budgetId: string)`
  - Chamada na criação de orçamentos manuais (linha 444)

#### 🔑 Dependências/Recursos
- API PDFShift (`PDFSHIFT_API_KEY`)
- Supabase Storage (bucket `budgets`)
- Acesso à tabela `budgets`
- Acesso à tabela `user_configs`
- Acesso à tabela `patients`
- Acesso à tabela `simulations`

#### 📊 Uso Estimado
**MÉDIO** - Função importante para geração de orçamentos, usada em:
- Criação de orçamentos manuais
- Geração de PDF para apresentação ao paciente

#### ⚠️ Recomendação
**MANTER - FUNÇÃO EM USO**
Esta função é utilizada no fluxo de orçamentos. Deletá-la quebraria a funcionalidade de geração de PDF de orçamentos.

---

## 📁 Diretório `_shared`

**Conteúdo:** `cors.ts` - Arquivo com headers CORS compartilhados

**Status:** ✅ **ARQUIVO UTILITÁRIO**
Provavelmente usado pelas Edge Functions para configurar CORS.

---

## 🔍 Análise de Código Morto/Obsoleto

### ❌ Nenhuma Edge Function Obsoleta Encontrada

Todas as Edge Functions encontradas estão **ativamente sendo usadas** no código frontend.

---

## 📈 Análise de Uso por Referências

### `process-dental-facets`
**Total de Referências:** 8 arquivos
- ✅ Código TypeScript/React: 3 arquivos
- 📄 Documentação: 5 arquivos

**Arquivos de Código:**
- `src/pages/simulator/SimulatorPage.tsx`
- `src/hooks/useTechnicalReport.ts`
- `src/pages/simulator/SimulatorLegacyPage.tsx`
- `src/services/technicalReportService.ts`

**Arquivos de Documentação:**
- `DEPLOY_EDGE_FUNCTION.md`
- `INSTRUCOES_REBUILD.md`
- `MIGRACAO_SUPABASE.md`
- `SOLUCAO_RAPIDA_GEMINI_KEY.md`

### `generate-budget-pdf`
**Total de Referências:** 14 arquivos
- ✅ Código TypeScript: 1 arquivo
- 📄 Documentação: 12 arquivos
- 🔧 CI/CD: 1 arquivo

**Arquivos de Código:**
- `src/services/budgetService.ts`

**Arquivos de Documentação:**
- `.github/DEPLOY_SETUP.md`
- `DEPLOY_INSTRUCOES.md`
- `FASE3_PDF_GENERATION.md`
- `FASE6_TEMPLATE_DINAMICO.md`
- `FASE7_TESTES_VALIDACAO.md`
- `GUIA_RAPIDO_PDFSHIFT.md`
- `PLANO_IMPLEMENTACAO_ORCAMENTO.md`
- `PLANO_PUPPETEER_PDF.md`
- `PROJETO_ORCAMENTOS_COMPLETO.md`
- `TROUBLESHOOTING.md`
- `supabase/functions/generate-budget-pdf/README.md`
- `deploy-edge-function.sh`

**CI/CD:**
- `.github/workflows/deploy-edge-functions.yml`

---

## 🎯 Recomendações Finais

### ✅ Edge Functions a MANTER (TODAS)

1. **`process-dental-facets`**
   - ✅ CRÍTICA - Coração do sistema
   - ✅ Múltiplas referências ativas
   - ✅ 3 ações essenciais (analyze, generate-report, generate)
   - ✅ Usada em simulação de facetas e clareamento

2. **`generate-budget-pdf`**
   - ✅ EM USO - Geração de PDFs de orçamento
   - ✅ Usada em orçamentos manuais
   - ✅ Essencial para apresentação profissional ao paciente

### ❌ Edge Functions a DELETAR

**NENHUMA** - Todas as Edge Functions estão em uso ativo.

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Total de Edge Functions | 2 |
| Edge Functions Ativas | 2 (100%) |
| Edge Functions Obsoletas | 0 (0%) |
| Arquivos compartilhados (_shared) | 1 |
| Total de referências no código | 11 arquivos .ts/.tsx |
| Total de referências em docs | 17 arquivos .md |

---

## 🔐 Verificações de Segurança

### ✅ Autenticação
- **`process-dental-facets`**: ✅ Verifica token de autenticação Supabase
- **`generate-budget-pdf`**: ✅ Usa Service Role Key (server-side)

### ✅ Autorização
- **`process-dental-facets`**: ✅ Verifica permissão para clareamento (`whitening_simulator_enabled`)
- **`generate-budget-pdf`**: ✅ Filtra por `user_id` ao buscar dados

### ✅ Proteção contra Duplicatas
- **`process-dental-facets`**: ✅ Idempotência via `idempotency_key`

---

## 🚀 Oportunidades de Melhoria (NÃO relacionadas a deleção)

1. **Consolidação de Documentação**
   - Há muita documentação redundante sobre `generate-budget-pdf`
   - Considerar consolidar em um único guia principal

2. **Monitoramento**
   - Adicionar logs de métricas de uso (tempo de execução, taxa de sucesso)
   - Configurar alertas para erros recorrentes

3. **Testes**
   - Adicionar testes unitários para as Edge Functions
   - Configurar testes de integração end-to-end

4. **Cache**
   - Considerar cache de análises repetidas (mesma imagem)
   - Avaliar custo-benefício do cache no Gemini

---

## ✅ Conclusão

**RESULTADO:** ✅ **Nenhuma Edge Function pode ser deletada**

Ambas as Edge Functions (`process-dental-facets` e `generate-budget-pdf`) são **essenciais e ativamente utilizadas** pelo sistema. Deletar qualquer uma delas **quebraria funcionalidades críticas**.

### Resumo das Funções:
- **`process-dental-facets`**: Coração do sistema - simulação dental e relatórios
- **`generate-budget-pdf`**: Geração profissional de PDFs de orçamentos

**Recomendação Final:** MANTER TODAS AS EDGE FUNCTIONS

---

**Data da Análise:** 2025-11-12
**Versão do Sistema:** Branch `claude/delete-user-configs-table-011CV47sDR95BdbtrgZ6DHwj`
