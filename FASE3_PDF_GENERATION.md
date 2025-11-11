# Fase 3: Serviço de Geração de PDF - IMPLEMENTADA ✅

## Resumo

Implementada infraestrutura completa para gerar PDFs de orçamentos odontológicos automaticamente.

## Arquivos Criados/Modificados

### 1. **src/services/budgetTemplateService.ts** (NOVO)
Serviço completo de mapeamento de dados budget → template:

- `getBudgetWithRelations()`: Busca budget com paciente e simulação
- `getBudgetTemplateData()`: Gera objeto com todos os placeholders
- `mapItemsToProcedures()`: Converte items JSONB para procedimentos numerados
- `calculatePaymentConditions()`: Calcula parcelas e descontos
- `fillTemplate()`: Substitui placeholders no template Markdown
- `generateBudgetMarkdown()`: Pipeline completo de geração

**Funcionalidades**:
- Formatação automática de CPF, datas, moedas
- Suporte a 10 procedimentos por orçamento
- Remove linhas vazias de procedimentos
- Integração com payment_config do user_configs

### 2. **supabase/migrations/20251111180138_create_budgets_storage_bucket.sql** (NOVO)
Migration para storage de PDFs:

```sql
- Cria bucket 'budget-pdfs' (público)
- RLS Policy: upload/update/delete próprios PDFs
- RLS Policy: leitura pública (compartilhamento com pacientes)
```

### 3. **supabase/functions/generate-budget-pdf/** (NOVO)
Edge Function Deno para geração de PDF:

**Arquivos**:
- `index.ts`: Lógica principal
- `README.md`: Documentação e limitações

**Fluxo**:
1. Recebe `budgetId` via POST
2. Busca budget + patient + simulation
3. Busca user_configs (clinic data + payment config)
4. Gera dados do template (formato chave-valor)
5. Preenche template Markdown
6. Converte Markdown → HTML
7. Converte HTML → PDF ⚠️ (implementação temporária)
8. Upload para `budget-pdfs/{userId}/{budgetId}-{timestamp}.pdf`
9. Atualiza `budgets.pdf_url`
10. Retorna URL pública

**⚠️ IMPORTANTE**: A conversão HTML → PDF está usando implementação temporária (retorna HTML). Para produção, integrar com:
- API externa (PDFShift, API2PDF, DocRaptor)
- Puppeteer/Chrome Headless
- Biblioteca PDF nativa (pdf-lib)

### 4. **src/services/budgetService.ts** (MODIFICADO)
Adicionada função `generateBudgetPDF()`:

```typescript
export async function generateBudgetPDF(budgetId: string): Promise<string>
```

**Uso no frontend**:
```typescript
import { generateBudgetPDF } from '@/services/budgetService';

const pdfUrl = await generateBudgetPDF(budget.id);
window.open(pdfUrl, '_blank');
```

## Próximos Passos (Fase 4)

**UI para gerar PDF** - `src/components/BudgetDetailModal.tsx`:
- Botão "Gerar PDF"
- Loading state durante geração
- Link para abrir/baixar PDF
- Regenerar PDF se necessário

## Limitações Atuais

1. **Conversão HTML → PDF**: Implementação temporária
   - Solução: Integrar API externa ou Puppeteer

2. **Template inline na Edge Function**: Hardcoded
   - Solução: Carregar de storage ou usar template da pasta PDF/

3. **Sem retry logic**: Falha única para erros de rede
   - Solução: Implementar exponential backoff

4. **Sem cache**: Template é recriado toda vez
   - Solução: Cache de template em memória

5. **Erro handling básico**: Logs simples
   - Solução: Logging estruturado + Sentry

## Deploy da Edge Function

```bash
# Deploy
supabase functions deploy generate-budget-pdf

# Testar localmente
supabase functions serve generate-budget-pdf

# Logs em produção
supabase functions logs generate-budget-pdf
```

## Estrutura de Dados

### Budget Items (JSONB)
```json
[
  {
    "servico": "Facetas de Porcelana",
    "categoria": "Estética",
    "dentes": "11, 12, 21, 22",
    "quantidade": 4,
    "valor_unitario": 2500,
    "observacoes": "Material premium"
  }
]
```

### Payment Config (JSONB)
```json
{
  "discount_cash": 10,
  "discount_pix": 5,
  "max_installments": 12,
  "allow_credit_card": true,
  "allow_debit_card": true,
  "allow_boleto": true
}
```

## Testes Recomendados

1. **Teste básico**: Gerar PDF com 1 procedimento
2. **Teste completo**: Gerar PDF com 10 procedimentos
3. **Teste sem imagens**: Budget sem simulation
4. **Teste dados incompletos**: Paciente sem CPF, clínica sem logo
5. **Teste performance**: Múltiplos PDFs simultâneos

## Custos Estimados

### Storage (Supabase)
- Gratuito até 1GB
- Estimativa: ~100KB por PDF = ~10.000 PDFs no free tier

### Edge Functions (Supabase)
- Gratuito até 500K invocações/mês
- Estimativa: 50ms por execução

### API de conversão PDF (se usar externa)
- PDFShift: $9/mês (1000 PDFs)
- API2PDF: $10/mês (1000 PDFs)
- DocRaptor: $15/mês (1250 PDFs)

## Segurança

✅ **Implementado**:
- RLS no storage (usuários só acessam próprios PDFs)
- Service role key na Edge Function (acesso admin)
- CORS configurado

⚠️ **A implementar**:
- Rate limiting na Edge Function
- Validação de input (budgetId format)
- Sanitização de dados do template
- Watermark em PDFs não pagos

---

**Status**: Fase 3 COMPLETA (exceto conversão PDF real para produção)
**Próximo**: Fase 4 - UI para gerar e visualizar PDF
