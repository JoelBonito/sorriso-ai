// Edge Function para gerar PDF de orçamento
// Fase 3: Serviço de Geração de PDF

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { budgetId } = await req.json()

    if (!budgetId) {
      throw new Error('budgetId é obrigatório')
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Buscar budget com relacionamentos
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select(`
        *,
        patient:patients(*),
        simulation:simulations(*)
      `)
      .eq('id', budgetId)
      .single()

    if (budgetError) throw budgetError

    // 2. Buscar configurações do usuário
    const { data: userConfig, error: configError } = await supabase
      .from('user_configs')
      .select('*')
      .eq('user_id', budget.user_id)
      .single()

    if (configError) throw configError

    // 3. Gerar dados do template
    const templateData = generateTemplateData(budget, userConfig)

    // 4. Carregar template
    const template = await loadTemplate()

    // 5. Preencher template
    const filledMarkdown = fillTemplate(template, templateData)

    // 6. Converter Markdown para HTML
    const html = markdownToHtml(filledMarkdown)

    // 7. Converter HTML para PDF
    // NOTA: Esta é uma implementação simplificada
    // Em produção, você usaria uma biblioteca como puppeteer ou uma API externa
    const pdfBuffer = await htmlToPdf(html)

    // 8. Upload para storage
    const fileName = `${budget.user_id}/${budgetId}-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('budget-pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw uploadError

    // 9. Obter URL pública
    const { data: urlData } = supabase.storage
      .from('budget-pdfs')
      .getPublicUrl(fileName)

    const pdfUrl = urlData.publicUrl

    // 10. Atualizar budget com pdf_url
    const { error: updateError } = await supabase
      .from('budgets')
      .update({ pdf_url: pdfUrl })
      .eq('id', budgetId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: pdfUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Helper functions

function generateTemplateData(budget: any, userConfig: any): Record<string, string> {
  const paymentConfig = userConfig.payment_config || {
    discount_cash: 10,
    discount_pix: 5,
    max_installments: 12
  }

  const paymentConditions = {
    discount_cash: paymentConfig.discount_cash,
    discount_pix: paymentConfig.discount_pix,
    max_installments: paymentConfig.max_installments,
    installment_value: budget.final_price / paymentConfig.max_installments,
    cash_price: budget.final_price * (1 - paymentConfig.discount_cash / 100),
  }

  const data: Record<string, string> = {
    CLINIC_NAME: userConfig.clinic_name || '-',
    CLINIC_CNPJ: userConfig.clinic_cnpj || '-',
    CLINIC_ADDRESS: userConfig.clinic_address || '-',
    CLINIC_PHONE: userConfig.clinic_phone || '-',
    CLINIC_EMAIL: userConfig.clinic_email || '-',
    CLINIC_LOGO_URL: userConfig.clinic_logo_url || '',
    CLINIC_ZIP_CODE: userConfig.clinic_zip_code || '-',
    CLINIC_CITY: userConfig.clinic_city || '-',
    CLINIC_STATE: userConfig.clinic_state || '-',
    DENTIST_NAME: userConfig.clinic_dentist_name || '-',
    DENTIST_CRO: userConfig.clinic_cro || '-',

    BUDGET_NUMBER: budget.budget_number || '-',
    ISSUE_DATE: formatDate(budget.created_at),
    VALIDITY_DATE: formatDate(budget.valid_until),
    STATUS: translateStatus(budget.status),

    PATIENT_NAME: budget.patient?.name || '-',
    PATIENT_CPF: formatCPF(budget.patient?.cpf),
    PATIENT_PHONE: budget.patient?.phone || '-',
    PATIENT_EMAIL: budget.patient?.email || '-',

    SIMULATION_BEFORE_IMAGE: budget.before_image || budget.simulation?.original_image_url || '',
    SIMULATION_AFTER_IMAGE: budget.after_image || budget.simulation?.processed_image_url || '',

    SUBTOTAL: formatCurrency(budget.subtotal || 0),
    DISCOUNT: formatCurrency(budget.discount_amount || 0),
    TOTAL: formatCurrency(budget.final_price || 0),
    DISCOUNT_PERCENTAGE: (budget.discount_percentage || 0).toString(),

    DISCOUNT_CASH: paymentConditions.discount_cash.toString(),
    DISCOUNT_PIX: paymentConditions.discount_pix.toString(),
    INSTALLMENTS: paymentConditions.max_installments.toString(),
    MAX_INSTALLMENTS: paymentConditions.max_installments.toString(),
    INSTALLMENT_VALUE: formatCurrency(paymentConditions.installment_value),
    CASH_PRICE: formatCurrency(paymentConditions.cash_price),
  }

  // Mapear items
  const items = budget.items || []
  items.forEach((item: any, index: number) => {
    const num = index + 1
    const total = (item.quantidade || 0) * (item.valor_unitario || 0)

    data[`PROCEDURE_${num}_NAME`] = item.servico || '-'
    data[`PROCEDURE_${num}_TEETH`] = item.dentes || '-'
    data[`PROCEDURE_${num}_QTY`] = (item.quantidade || 0).toString()
    data[`PROCEDURE_${num}_PRICE`] = formatCurrency(item.valor_unitario || 0)
    data[`PROCEDURE_${num}_TOTAL`] = formatCurrency(total)
  })

  // Preencher vazios
  for (let i = items.length + 1; i <= 10; i++) {
    data[`PROCEDURE_${i}_NAME`] = '-'
    data[`PROCEDURE_${i}_TEETH`] = '-'
    data[`PROCEDURE_${i}_QTY`] = '-'
    data[`PROCEDURE_${i}_PRICE`] = '-'
    data[`PROCEDURE_${i}_TOTAL`] = '-'
  }

  return data
}

function fillTemplate(template: string, data: Record<string, string>): string {
  let filled = template
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    filled = filled.replace(regex, value)
  })
  // Remover linhas vazias de procedimentos
  filled = filled.replace(/^\|.*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|.*$/gm, '')
  return filled
}

async function loadTemplate(): Promise<string> {
  // Template inline por enquanto
  // TODO: Carregar de um storage ou arquivo
  return `# ORÇAMENTO ODONTOLÓGICO

## {{CLINIC_NAME}}

**CNPJ:** {{CLINIC_CNPJ}}
**Endereço:** {{CLINIC_ADDRESS}}
**Telefone:** {{CLINIC_PHONE}} | **E-mail:** {{CLINIC_EMAIL}}

---

## 📋 DADOS DO ORÇAMENTO

**Nº Orçamento:** {{BUDGET_NUMBER}}
**Data Emissão:** {{ISSUE_DATE}}
**Validade:** {{VALIDITY_DATE}}
**Status:** {{STATUS}}

## 👤 DADOS DO PACIENTE

**Nome:** {{PATIENT_NAME}}
**CPF:** {{PATIENT_CPF}}
**Telefone:** {{PATIENT_PHONE}}
**E-mail:** {{PATIENT_EMAIL}}

---

## PROCEDIMENTOS PROPOSTOS

| Procedimento | Dente(s) | Qtd | Valor Unit. | Subtotal |
|-------------|----------|-----|-------------|----------|
| {{PROCEDURE_1_NAME}} | {{PROCEDURE_1_TEETH}} | {{PROCEDURE_1_QTY}} | R$ {{PROCEDURE_1_PRICE}} | R$ {{PROCEDURE_1_TOTAL}} |
| {{PROCEDURE_2_NAME}} | {{PROCEDURE_2_TEETH}} | {{PROCEDURE_2_QTY}} | R$ {{PROCEDURE_2_PRICE}} | R$ {{PROCEDURE_2_TOTAL}} |
| {{PROCEDURE_3_NAME}} | {{PROCEDURE_3_TEETH}} | {{PROCEDURE_3_QTY}} | R$ {{PROCEDURE_3_PRICE}} | R$ {{PROCEDURE_3_TOTAL}} |

---

## RESUMO FINANCEIRO

**Subtotal:** R$ {{SUBTOTAL}}
**Desconto:** R$ {{DISCOUNT}}
**VALOR TOTAL:** **R$ {{TOTAL}}**

---

**Responsável Técnico:** {{DENTIST_NAME}} | **CRO:** {{DENTIST_CRO}}
`
}

function markdownToHtml(markdown: string): string {
  // Conversão simples de markdown para HTML
  // Em produção, use uma biblioteca como marked ou markdown-it
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/---/g, '<hr>')

  // Tables (básico)
  html = html.replace(/\|/g, '</td><td>')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `
}

async function htmlToPdf(html: string): Promise<Uint8Array> {
  // IMPLEMENTAÇÃO TEMPORÁRIA
  // Em produção, use uma API de conversão HTML->PDF ou Puppeteer

  // Por enquanto, retorna HTML como "PDF" (apenas para teste)
  // TODO: Integrar com serviço real de conversão PDF
  const encoder = new TextEncoder()
  return encoder.encode(html)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatCPF(cpf: string | null): string {
  if (!cpf) return '-'
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }
  return cpf
}

function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    pending: 'Pendente',
    sent: 'Enviado',
    viewed: 'Visualizado',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
    expired: 'Expirado',
  }
  return translations[status] || status
}
