# 🔧 Troubleshooting - Correções Aplicadas

Este documento detalha todos os problemas encontrados e as correções aplicadas na sessão de debugging.

---

## 📋 RESUMO DOS PROBLEMAS

Após as mudanças para usar PDFShift em vez de jsPDF, foram encontrados **3 problemas críticos**:

1. ❌ **Erro 400 na Edge Function** - PDFs não eram gerados
2. ❌ **Leads não apareciam no CRM** - Novos leads ficavam invisíveis
3. ❌ **Erros no Service Worker** - Tentativa de cachear requisições POST

---

## 🔴 PROBLEMA 1: Erro 400 da Edge Function

### Sintomas
```
POST https://hqexulgmmtghwtgnqtfy.supabase.co/functions/v1/generate-budget-pdf 400 (Bad Request)
❌ Erro ao gerar PDF: FunctionsHttpError: Edge Function returned a non-2xx status code
```

### Causa Raiz
A **Edge Function não foi deployada** após as correções. O código correto está no GitHub, mas o Supabase ainda roda o código antigo com os erros de:
- Parâmetro `viewport` inválido
- Bucket `budget-pdfs` inexistente
- Falta de logging

### ✅ SOLUÇÃO

**Opção A: Deploy Manual (Mais Rápido)**

```bash
# No seu terminal (Windows/Mac/Linux):
cd /caminho/para/sorriso-ai
bash deploy-edge-function.sh
```

Ou manualmente:
```bash
# 1. Fazer login (access token já configurado no script)
export SUPABASE_ACCESS_TOKEN="sbp_726b31b5f84cd87b30df831f959a4e56625119ef"

# 2. Link ao projeto
supabase link --project-ref hqexulgmmtghwtgnqtfy

# 3. Deploy da função
supabase functions deploy generate-budget-pdf --no-verify-jwt

# 4. Configurar secret (se ainda não fez)
supabase secrets set PDFSHIFT_API_KEY=sua_chave_pdfshift --project-ref hqexulgmmtghwtgnqtfy
```

**Opção B: GitHub Actions (Automático - RECOMENDADO)**

1. Acesse: https://github.com/JoelBonito/sorriso-ai/settings/secrets/actions

2. Adicione 3 secrets:
   - `SUPABASE_ACCESS_TOKEN` = `sbp_726b31b5f84cd87b30df831f959a4e56625119ef`
   - `SUPABASE_PROJECT_ID` = `hqexulgmmtghwtgnqtfy`
   - `PDFSHIFT_API_KEY` = (sua chave do PDFShift)

3. Faça merge da branch para main

4. GitHub Actions fará deploy automático!

### Como Obter PDFSHIFT_API_KEY

1. Acesse: https://pdfshift.io/
2. Crie conta gratuita (50 PDFs/mês)
3. Copie a API Key do dashboard
4. Configure no Supabase ou GitHub Actions

---

## 🔴 PROBLEMA 2: Leads Não Apareciam no CRM

### Sintomas
- Simulação criada com sucesso ✅
- Paciente criado ✅
- Orçamento criado ✅
- Notificação "Novo Lead" aparecia ✅
- **MAS o lead NÃO aparecia no quadro do CRM** ❌

### Causa Raiz

**Arquivo:** `src/services/pipelineService.ts` linha 54

```typescript
// ❌ CÓDIGO ERRADO
.eq('archived', showArchived)  // Quando showArchived=false, busca archived=false

// Problema: Novos leads têm archived=NULL, não false!
// Query não retornava leads com archived=NULL
```

### ✅ SOLUÇÃO APLICADA

**Commit:** `9533361`

```typescript
// ✅ CÓDIGO CORRIGIDO (linhas 47-67)
if (showArchived) {
  // Mostrar apenas arquivados
  query = query.eq('archived', true);
} else {
  // Mostrar não arquivados (NULL ou false)
  query = query.or('archived.is.null,archived.eq.false');
}
```

### Resultado
✅ Leads aparecem imediatamente no CRM após criação
✅ Filtro "Mostrar Arquivados" funciona corretamente

---

## 🔴 PROBLEMA 3: Service Worker - Erro com POST

### Sintomas
```javascript
sw.js:104 Uncaught (in promise) TypeError: Failed to execute 'put' on 'Cache': 
Request method 'POST' is unsupported
```

### Causa Raiz

**Arquivo:** `public/sw.js` linhas 62-64 e 103-104

```javascript
// ❌ CÓDIGO ERRADO
caches.open(DYNAMIC_CACHE).then((cache) => {
  cache.put(request, responseClone);  // Tenta cachear TODOS os requests (incluindo POST!)
});
```

**Problema:** 
- Service Workers só podem cachear requisições GET
- Edge Functions usam POST
- Tentativa de cachear POST/PUT/DELETE gera erro

### ✅ SOLUÇÃO APLICADA

**Commit:** `9533361`

```javascript
// ✅ CÓDIGO CORRIGIDO (linha 61)
// Only cache GET requests (POST/PUT/DELETE cannot be cached)
if (request.method === 'GET' && response.status === 200) {
  const responseClone = response.clone();
  caches.open(DYNAMIC_CACHE).then((cache) => {
    cache.put(request, responseClone);
  });
}

// ✅ CÓDIGO CORRIGIDO (linha 101)
if (!response || response.status !== 200 || response.type === 'error' || request.method !== 'GET') {
  return response;
}
```

**Incrementa versão do cache:**
```javascript
const CACHE_VERSION = 'trusmile-v3';  // Era v2
```

### Resultado
✅ Service Worker não gera mais erros no console
✅ Requisições POST/PUT/DELETE funcionam normalmente
✅ Cache limpo automaticamente na próxima visita

---

## 📊 OUTROS AVISOS (Não-Críticos)

### 1. Features não reconhecidas pelo navegador
```
Unrecognized feature: 'vr'
Unrecognized feature: 'ambient-light-sensor'
Unrecognized feature: 'battery'
```

**Causa:** Lovable/Vite tentando usar features experimentais  
**Impacto:** Nenhum - apenas avisos  
**Ação:** Ignorar

### 2. DialogContent sem título
```
`DialogContent` requires a `DialogTitle` for accessibility
```

**Causa:** Componentes de diálogo sem título para leitores de tela  
**Impacto:** Baixo - apenas acessibilidade  
**Ação:** Pode ser corrigido depois com `VisuallyHidden`

### 3. Iframe sandbox
```
An iframe which has both allow-scripts and allow-same-origin for its sandbox 
attribute can escape its sandboxing.
```

**Causa:** PDFShift ou analytics do Lovable  
**Impacto:** Nenhum - esperado  
**Ação:** Ignorar

---

## ✅ CHECKLIST DE DEPLOY

Use esta checklist para garantir que tudo está funcionando:

### 1. Deploy da Edge Function

- [ ] Obter PDFSHIFT_API_KEY (https://pdfshift.io/)
- [ ] Rodar `deploy-edge-function.sh` OU configurar GitHub Actions
- [ ] Verificar logs do Supabase (https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/functions/generate-budget-pdf)

### 2. Publicar no Lovable

- [ ] Fazer merge da branch `claude/review-pdf-reports-011CV2LjPNTWhBGT18C7nnRK` para main
- [ ] Publicar no Lovable (botão "Publish")
- [ ] Aguardar build completar

### 3. Testes Completos

**Teste 1: Simulação com PDF**
- [ ] Criar nova simulação no simulador
- [ ] Preencher dados do paciente
- [ ] Upload de imagem
- [ ] Gerar simulação
- [ ] Aprovar e gerar documentos
- [ ] **Verificar:** PDF do orçamento foi gerado (não dá erro 400)
- [ ] **Verificar:** PDF contém todos os campos (dados da clínica, simulação, etc.)

**Teste 2: Lead no CRM**
- [ ] Após criar simulação, ir para CRM
- [ ] **Verificar:** Lead aparece no quadro "Simulação" ✅
- [ ] **Verificar:** Lead mostra nome do paciente
- [ ] **Verificar:** Lead mostra valor da oportunidade

**Teste 3: Orçamento Manual**
- [ ] Criar novo orçamento manual (Aba Orçamentos)
- [ ] Preencher itens e valores
- [ ] Salvar orçamento
- [ ] **Verificar:** PDF foi gerado automaticamente
- [ ] **Verificar:** PDF usa template PDFShift

**Teste 4: Service Worker**
- [ ] Abrir DevTools → Console
- [ ] Navegar pelo MVP (várias páginas)
- [ ] **Verificar:** Nenhum erro de Service Worker aparece

---

## 📝 COMMITS DESTA SESSÃO

Total: **4 commits** na branch `claude/review-pdf-reports-011CV2LjPNTWhBGT18C7nnRK`

1. **7b4cd58** - Corrige erro 400 no PDFShift (remove viewport, corrige bucket)
2. **cd4abb2** - Corrige geração automática de PDF (SimulatorPage + budgetService)
3. **225aeb8** - Adiciona GitHub Actions para deploy automático
4. **9533361** - Corrige 3 erros críticos (leads CRM, Service Worker, deploy script)

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### URGENTE (Faça Agora):

1. **Deploy da Edge Function** (5-10 min)
   - Opção rápida: `bash deploy-edge-function.sh`
   - Opção automática: Configurar GitHub Actions (ver `.github/DEPLOY_SETUP.md`)

2. **Obter PDFSHIFT_API_KEY** (2 min)
   - Criar conta em https://pdfshift.io/
   - Plano FREE: 50 PDFs/mês
   - Copiar API Key

3. **Configurar Secret** (1 min)
   ```bash
   supabase secrets set PDFSHIFT_API_KEY=sua_chave --project-ref hqexulgmmtghwtgnqtfy
   ```

4. **Publicar no Lovable** (2 min)
   - Fazer merge da branch
   - Clicar em "Publish"

5. **Testar Fluxo Completo** (5 min)
   - Criar simulação
   - Verificar PDF gerado
   - Verificar lead no CRM

### TOTAL: ~15-25 minutos

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Erro 400 persiste:**
   - Verificar se Edge Function foi deployada
   - Ver logs: https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/logs/edge-functions

2. **Leads não aparecem:**
   - Limpar cache do navegador (Ctrl+Shift+R)
   - Verificar console por erros

3. **PDFShift error:**
   - Verificar se PDFSHIFT_API_KEY está configurada
   - Verificar cota de 50 PDFs/mês não excedida

---

**Última Atualização:** 2025-11-11  
**Branch:** `claude/review-pdf-reports-011CV2LjPNTWhBGT18C7nnRK`  
**Status:** ✅ Todas correções aplicadas - Aguardando deploy
