# PLANO DE IMPLEMENTAÇÃO - Sistema Completo de Orçamentos

## 📊 ANÁLISE DA ESTRUTURA ATUAL

### ✅ O QUE JÁ EXISTE

#### Backend (Banco de Dados)
- ✅ **Tabela `budgets`** com campos:
  - Identificação: `budget_number`, `created_at`, `status`
  - Relacionamentos: `patient_id`, `simulation_id`, `user_id`
  - Valores: `subtotal`, `discount_percentage`, `discount_amount`, `final_price`
  - Dados adicionais: `items` (JSONB), `payment_conditions` (JSONB)
  - Tipo: `budget_type` (automatic/manual), `treatment_type` (facetas/clareamento)
  - Imagens: `before_image`, `after_image`
  - Outros: `valid_until`, `pdf_url`

- ✅ **Tabela `services`** (catálogo de serviços):
  - Campos: `name`, `description`, `tipo_servico`, `categoria`, `price`, `observacoes`
  - Controles: `active`, `required`, `base`
  - Já implementado no frontend com UI completa

- ✅ **Tabela `patients`** com campo `cpf`

- ✅ **Tabela `user_configs`** com dados da clínica:
  - `clinic_name`, `clinic_address`, `clinic_cnpj`
  - `clinic_dentist_name`, `clinic_cro`
  - `clinic_phone`, `clinic_email`, `clinic_logo_url`
  - `clinic_zip_code`, `clinic_city`, `clinic_state`

- ✅ **Tabela `simulations`** com `treatment_type` e imagens

#### Frontend
- ✅ **BudgetFormModal**: UI para criar/editar orçamentos
- ✅ **ServicesPage**: Gerenciamento de serviços
- ✅ **PatientModal**: Formulário de paciente com CPF
- ✅ **ConfigForm**: Configurações da clínica com CNPJ, dentista e CRO

#### Template
- ✅ **template-orcamento-profissional.md**: Template Markdown com todos os placeholders

### ❌ O QUE ESTÁ FALTANDO

#### 1. **Estrutura de Payment Conditions** (JSONB)
Atualmente `payment_conditions` é JSONB sem estrutura definida. Precisa:
```typescript
interface PaymentConditions {
  discount_cash: number;      // Ex: 10 (%)
  discount_pix: number;        // Ex: 5 (%)
  max_installments: number;    // Ex: 12
  installment_value: number;   // Calculado: total / max_installments
  cash_price: number;          // Calculado: total - desconto
}
```

#### 2. **Campo "Dentes" nos Items do Orçamento**
Estrutura atual do items JSONB:
```typescript
{
  servico: string;
  categoria?: string;
  quantidade: number;
  valor_unitario: number;
  observacoes?: string;
}
```

Falta adicionar:
```typescript
{
  ...campos_existentes,
  dentes?: string;  // Ex: "11, 12, 13" ou "Superior"
}
```

#### 3. **Serviço de Geração de PDF**
- Não existe função para:
  - Pegar dados do budget
  - Preencher template com placeholders
  - Gerar PDF
  - Fazer upload e salvar URL em `budgets.pdf_url`

#### 4. **UI para Configurar Payment Conditions**
- Falta interface para dentista configurar:
  - Descontos (dinheiro, PIX)
  - Número máximo de parcelas
  - Pode ser na tela de Configurações ou ao criar orçamento

#### 5. **Integração Template ↔ Banco de Dados**
- Função para mapear dados do banco → placeholders do template
- Tratamento de items JSONB → linhas da tabela de procedimentos
- Cálculos automáticos (subtotal, desconto, parcelas)

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Estruturação de Payment Conditions**

#### 1.1. Migration: Adicionar Payment Config em user_configs
**Arquivo**: `supabase/migrations/[timestamp]_add_payment_config.sql`
```sql
-- Adicionar configurações de pagamento padrão na clínica
ALTER TABLE public.user_configs
ADD COLUMN IF NOT EXISTS payment_config JSONB DEFAULT '{
  "discount_cash": 10,
  "discount_pix": 5,
  "max_installments": 12,
  "allow_credit_card": true,
  "allow_debit_card": true,
  "allow_boleto": true
}'::jsonb;

COMMENT ON COLUMN public.user_configs.payment_config IS 'Configurações padrão de pagamento da clínica';
```

#### 1.2. TypeScript: Atualizar Interface Config
**Arquivo**: `src/utils/storage.ts`
```typescript
export interface PaymentConfig {
  discount_cash: number;
  discount_pix: number;
  max_installments: number;
  allow_credit_card: boolean;
  allow_debit_card: boolean;
  allow_boleto: boolean;
}

export interface Config {
  // ...campos existentes
  paymentConfig?: PaymentConfig;
}
```

#### 1.3. Frontend: Adicionar seção em ConfigForm
**Arquivo**: `src/components/ConfigForm.tsx`
- Adicionar seção "Condições de Pagamento"
- Inputs para: discount_cash, discount_pix, max_installments
- Switches para formas de pagamento aceitas

**Estimativa**: 2-3 horas

---

### **FASE 2: Melhorar Estrutura de Items (adicionar campo "dentes")**

#### 2.1. TypeScript: Atualizar Interface BudgetItem
**Arquivo**: `src/components/BudgetFormModal.tsx`
```typescript
interface BudgetItem {
  servico: string;
  categoria?: string;
  quantidade: number;
  valor_unitario: number;
  observacoes?: string;
  dentes?: string;  // NOVO
}
```

#### 2.2. Frontend: Adicionar campo "Dentes" na tabela de items
**Arquivo**: `src/components/BudgetFormModal.tsx`
- Adicionar coluna "Dentes" na tabela de items
- Input para editar dentes de cada item
- Placeholder: "11, 12, 21, 22" ou "Superior completo"

**Estimativa**: 1-2 horas

---

### **FASE 3: Serviço de Geração de PDF**

#### 3.1. Criar serviço de template filling
**Arquivo**: `src/services/budgetTemplateService.ts`
```typescript
interface BudgetTemplateData {
  // Clinic data
  clinicName: string;
  clinicCnpj: string;
  clinicAddress: string;
  // ... todos os campos

  // Budget data
  budgetNumber: string;
  issueDate: string;
  // ... todos os campos

  // Items
  items: BudgetItem[];

  // Payment
  paymentConditions: PaymentConditions;
}

async function fillBudgetTemplate(budgetId: string): Promise<string> {
  // 1. Buscar budget completo com relacionamentos
  // 2. Buscar dados da clínica
  // 3. Buscar payment config
  // 4. Preencher todos os placeholders
  // 5. Retornar markdown preenchido
}
```

#### 3.2. Integração com serviço de PDF
**Opções**:
1. **Biblioteca local** (jsPDF + markdown-to-html): Gerar PDF no browser
2. **API externa** (Gotenberg, Puppeteer): Converter Markdown → PDF
3. **Edge Function Supabase**: Serverless para geração

**Recomendação**: Edge Function com Puppeteer para melhor controle de layout A4

**Arquivo**: `supabase/functions/generate-budget-pdf/index.ts`
```typescript
import { serve } from "https://deno.land/std/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js"

serve(async (req) => {
  const { budgetId } = await req.json()

  // 1. Buscar dados do budget
  // 2. Preencher template
  // 3. Converter markdown → HTML → PDF (Puppeteer/wkhtmltopdf)
  // 4. Upload para storage
  // 5. Atualizar budgets.pdf_url
  // 6. Retornar URL do PDF

  return new Response(JSON.stringify({ pdf_url }))
})
```

#### 3.3. Storage bucket para PDFs
**Arquivo**: Migration ou via Supabase Dashboard
```sql
-- Criar bucket 'budgets' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('budgets', 'budgets', true)
ON CONFLICT DO NOTHING;

-- RLS policies
CREATE POLICY "Users can upload own budget PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'budgets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read budget PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'budgets');
```

**Estimativa**: 4-6 horas

---

### **FASE 4: UI para Gerar e Visualizar PDF**

#### 4.1. Botão "Gerar PDF" em BudgetDetailModal
**Arquivo**: `src/components/BudgetDetailModal.tsx` (ou criar se não existe)
```typescript
<Button onClick={handleGeneratePDF}>
  <FileText className="w-4 h-4 mr-2" />
  Gerar PDF
</Button>
```

#### 4.2. Função de geração
```typescript
const handleGeneratePDF = async () => {
  setGenerating(true);
  try {
    const { data } = await supabase.functions.invoke('generate-budget-pdf', {
      body: { budgetId: budget.id }
    });

    // Atualizar estado com novo pdf_url
    toast.success('PDF gerado com sucesso!');
    window.open(data.pdf_url, '_blank');
  } catch (error) {
    toast.error('Erro ao gerar PDF');
  } finally {
    setGenerating(false);
  }
}
```

**Estimativa**: 2-3 horas

---

### **FASE 5: Integração Template ↔ Dados (Função de Mapeamento)**

#### 5.1. Criar função de mapeamento completo
**Arquivo**: `src/services/budgetTemplateService.ts`
```typescript
import { Budget } from '@/services/budgetService';
import { formatCurrency } from '@/utils/formatters';

export async function getBudgetTemplateData(budgetId: string): Promise<Record<string, string>> {
  // Buscar budget com todos os relacionamentos
  const budget = await getBudgetWithRelations(budgetId);
  const userConfig = await getUserConfig();

  // Calcular valores de pagamento
  const paymentConditions = calculatePaymentConditions(
    budget.final_price,
    userConfig.payment_config
  );

  // Mapear items para procedimentos numerados
  const procedurePlaceholders = mapItemsToProcedures(budget.items);

  return {
    // Clinic
    CLINIC_NAME: userConfig.clinicName || '',
    CLINIC_CNPJ: userConfig.clinicCnpj || '',
    CLINIC_ADDRESS: userConfig.clinicAddress || '',
    CLINIC_PHONE: userConfig.clinicPhone || '',
    CLINIC_EMAIL: userConfig.clinicEmail || '',
    CLINIC_LOGO_URL: userConfig.clinicLogoUrl || '',
    CLINIC_ZIP_CODE: userConfig.clinicZipCode || '',
    CLINIC_CITY: userConfig.clinicCity || '',
    CLINIC_STATE: userConfig.clinicState || '',
    DENTIST_NAME: userConfig.clinicDentistName || '',
    DENTIST_CRO: userConfig.clinicCro || '',

    // Budget
    BUDGET_NUMBER: budget.budget_number,
    ISSUE_DATE: formatDate(budget.created_at),
    VALIDITY_DATE: formatDate(budget.valid_until),
    STATUS: translateStatus(budget.status),

    // Patient
    PATIENT_NAME: budget.patient?.name || '',
    PATIENT_CPF: formatCPF(budget.patient?.cpf) || '',
    PATIENT_PHONE: budget.patient?.phone || '',
    PATIENT_EMAIL: budget.patient?.email || '',

    // Simulation images
    SIMULATION_BEFORE_IMAGE: budget.before_image || budget.simulation?.original_image_url || '',
    SIMULATION_AFTER_IMAGE: budget.after_image || budget.simulation?.processed_image_url || '',

    // Procedures (dinâmico baseado em items)
    ...procedurePlaceholders,

    // Financial
    SUBTOTAL: formatCurrency(budget.subtotal),
    DISCOUNT: formatCurrency(budget.discount_amount),
    TOTAL: formatCurrency(budget.final_price),
    DISCOUNT_PERCENTAGE: budget.discount_percentage.toString(),

    // Payment conditions
    DISCOUNT_CASH: paymentConditions.discount_cash.toString(),
    DISCOUNT_PIX: paymentConditions.discount_pix.toString(),
    INSTALLMENTS: paymentConditions.max_installments.toString(),
    MAX_INSTALLMENTS: paymentConditions.max_installments.toString(),
    INSTALLMENT_VALUE: formatCurrency(paymentConditions.installment_value),
    CASH_PRICE: formatCurrency(paymentConditions.cash_price),
  };
}

function mapItemsToProcedures(items: BudgetItem[]): Record<string, string> {
  const placeholders: Record<string, string> = {};

  items.forEach((item, index) => {
    const num = index + 1;
    const total = item.quantidade * item.valor_unitario;

    placeholders[`PROCEDURE_${num}_NAME`] = item.servico;
    placeholders[`PROCEDURE_${num}_TEETH`] = item.dentes || '-';
    placeholders[`PROCEDURE_${num}_QTY`] = item.quantidade.toString();
    placeholders[`PROCEDURE_${num}_PRICE`] = formatCurrency(item.valor_unitario);
    placeholders[`PROCEDURE_${num}_TOTAL`] = formatCurrency(total);
  });

  // Preencher procedimentos vazios se houver menos de 4 items
  for (let i = items.length + 1; i <= 10; i++) {
    placeholders[`PROCEDURE_${i}_NAME`] = '-';
    placeholders[`PROCEDURE_${i}_TEETH`] = '-';
    placeholders[`PROCEDURE_${i}_QTY`] = '-';
    placeholders[`PROCEDURE_${i}_PRICE`] = '-';
    placeholders[`PROCEDURE_${i}_TOTAL`] = '-';
  }

  return placeholders;
}

function calculatePaymentConditions(totalPrice: number, config: PaymentConfig) {
  const cashDiscount = config.discount_cash / 100;
  const pixDiscount = config.discount_pix / 100;

  return {
    discount_cash: config.discount_cash,
    discount_pix: config.discount_pix,
    max_installments: config.max_installments,
    installment_value: totalPrice / config.max_installments,
    cash_price: totalPrice * (1 - cashDiscount),
  };
}

export function fillTemplate(template: string, data: Record<string, string>): string {
  let filled = template;

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    filled = filled.replace(regex, value);
  });

  return filled;
}
```

**Estimativa**: 3-4 horas

---

### **FASE 6: Template Dinâmico (Suportar Número Variável de Procedimentos)**

O template atual tem procedimentos fixos (PROCEDURE_1, PROCEDURE_2, etc.). Precisamos:

#### 6.1. Atualizar template para usar loop/geração dinâmica
**Opção 1**: Manter placeholders fixos (1-10) e ocultar linhas vazias no PDF
**Opção 2**: Usar template engine (Handlebars, Mustache) para loops

**Recomendação**: Opção 1 (mais simples)
- Gerar placeholders de 1 a 10
- Remover linhas com "| - | - | - |" antes de gerar PDF

**Arquivo**: Atualizar `fillTemplate` para limpar linhas vazias
```typescript
export function fillTemplate(template: string, data: Record<string, string>): string {
  let filled = template;

  // Substituir placeholders
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    filled = filled.replace(regex, value);
  });

  // Remover linhas de procedimentos vazios
  filled = filled.replace(/^\|.*\|\s*-\s*\|.*$/gm, '');

  return filled;
}
```

**Estimativa**: 1-2 horas

---

### **FASE 7: Testes e Validação**

#### 7.1. Teste de geração de PDF
- Criar orçamento de teste
- Gerar PDF
- Validar todos os placeholders preenchidos
- Verificar layout A4
- Testar com 1, 3, 5, 10 procedimentos

#### 7.2. Teste de configurações de pagamento
- Alterar descontos
- Verificar cálculos de parcelas
- Validar valores no PDF

#### 7.3. Teste de imagens
- Verificar carregamento de before/after
- Validar dimensões (280x200px)
- Testar com e sem imagens

**Estimativa**: 2-3 horas

---

## 📋 RESUMO DAS IMPLEMENTAÇÕES

| Fase | Descrição | Arquivos Afetados | Tempo Estimado |
|------|-----------|-------------------|----------------|
| 1 | Payment Conditions Config | Migration, storage.ts, ConfigForm.tsx | 2-3h |
| 2 | Campo "Dentes" em Items | BudgetFormModal.tsx | 1-2h |
| 3 | Serviço de Geração PDF | budgetTemplateService.ts, Edge Function | 4-6h |
| 4 | UI Gerar/Visualizar PDF | BudgetDetailModal.tsx | 2-3h |
| 5 | Mapeamento Template ↔ DB | budgetTemplateService.ts | 3-4h |
| 6 | Template Dinâmico | fillTemplate function | 1-2h |
| 7 | Testes e Validação | - | 2-3h |
| **TOTAL** | | | **15-23h** |

---

## 🔄 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **FASE 1** → Payment config (base para cálculos)
2. **FASE 2** → Campo dentes (melhoria simples)
3. **FASE 5** → Mapeamento template (core da funcionalidade)
4. **FASE 6** → Template dinâmico (ajuste do template)
5. **FASE 3** → Geração de PDF (integração)
6. **FASE 4** → UI (interface final)
7. **FASE 7** → Testes (validação completa)

---

## ⚠️ DECISÕES TÉCNICAS NECESSÁRIAS

### 1. Método de Geração de PDF
- [ ] **Opção A**: Biblioteca browser (jsPDF) - Mais simples, menos controle
- [ ] **Opção B**: Edge Function + Puppeteer - Melhor qualidade, mais complexo
- [ ] **Opção C**: API externa (Gotenberg) - Custo adicional

**Recomendação**: Opção B (Edge Function)

### 2. Template Engine
- [ ] **Opção A**: Replace simples com regex (atual)
- [ ] **Opção B**: Handlebars/Mustache (mais poder)

**Recomendação**: Opção A (suficiente para necessidades atuais)

### 3. Storage de PDFs
- [x] Supabase Storage (gratuito até 1GB)
- [ ] S3/CloudFlare R2 (mais escalável)

**Recomendação**: Supabase Storage (já integrado)

---

## ✅ CHECKLIST PRÉ-IMPLEMENTAÇÃO

- [ ] Aprovar estrutura de Payment Conditions
- [ ] Aprovar método de geração de PDF
- [ ] Definir número máximo de procedimentos no template (10? 20?)
- [ ] Confirmar se todas as informações necessárias estão no template
- [ ] Validar se há campos adicionais que devem ser configuráveis

---

## 📝 PRÓXIMOS PASSOS

Após aprovação deste plano:
1. Criar branch específica para implementação
2. Implementar fases na ordem recomendada
3. Fazer commits pequenos e testáveis
4. Revisar e testar cada fase antes de prosseguir
5. Deploy gradual: backend → serviço → UI

---

**Aguardando aprovação ou solicitação de modificações no plano.**
