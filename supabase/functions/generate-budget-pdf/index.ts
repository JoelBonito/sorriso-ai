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

function processConditionals(template: string, data: Record<string, string>): string {
  let processed = template

  // Definir condições e suas validações
  const conditions = {
    IF_HAS_LOGO: () => data.CLINIC_LOGO_URL && data.CLINIC_LOGO_URL.trim() !== '',
    IF_HAS_SIMULATION: () =>
      (data.SIMULATION_BEFORE_IMAGE && data.SIMULATION_BEFORE_IMAGE.trim() !== '') ||
      (data.SIMULATION_AFTER_IMAGE && data.SIMULATION_AFTER_IMAGE.trim() !== ''),
  }

  // Processar cada tipo de condicional
  Object.entries(conditions).forEach(([conditionName, validator]) => {
    const startTag = `{{${conditionName}}}`
    const endTag = `{{END_${conditionName}}}`
    const regex = new RegExp(`${startTag}([\\s\\S]*?)${endTag}`, 'g')

    processed = processed.replace(regex, (match, content) => {
      return validator() ? content : ''
    })
  })

  return processed
}

function fillTemplate(template: string, data: Record<string, string>): string {
  let filled = template

  // Substituir placeholders
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    filled = filled.replace(regex, value)
  })

  // Processar condicionais
  filled = processConditionals(filled, data)

  // Remover linhas vazias de procedimentos
  filled = filled.replace(/^\|.*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|.*$/gm, '')

  return filled
}

async function loadTemplate(): Promise<string> {
  // Template inline simplificado para Edge Function
  // TODO: Carregar template completo de storage ou usar o do repositório
  return `# ORÇAMENTO ODONTOLÓGICO

---

{{IF_HAS_LOGO}}
<div style="text-align: center; page-break-inside: avoid;">
  <img src="{{CLINIC_LOGO_URL}}" alt="Logo" style="max-height: 80px; margin-bottom: 15px;">
</div>
{{END_IF_HAS_LOGO}}

## {{CLINIC_NAME}}

**CNPJ:** {{CLINIC_CNPJ}}
**Endereço:** {{CLINIC_ADDRESS}}
**CEP:** {{CLINIC_ZIP_CODE}} - {{CLINIC_CITY}}/{{CLINIC_STATE}}
**Telefone:** {{CLINIC_PHONE}} | **E-mail:** {{CLINIC_EMAIL}}

---

{{IF_HAS_SIMULATION}}
## SIMULAÇÃO DO TRATAMENTO

<div style="display: flex; justify-content: space-around; margin: 20px 0;">
  <div style="text-align: center; flex: 1;">
    <img src="{{SIMULATION_BEFORE_IMAGE}}" alt="Antes" style="max-width: 350px; height: auto;">
    <p><strong>ANTES</strong></p>
  </div>
  <div style="text-align: center; flex: 1;">
    <img src="{{SIMULATION_AFTER_IMAGE}}" alt="Depois" style="max-width: 350px; height: auto;">
    <p><strong>DEPOIS</strong></p>
  </div>
</div>

---
{{END_IF_HAS_SIMULATION}}

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

| Cód. | Procedimento | Dente(s) | Qtd | Valor Unit. | Subtotal |
|:----:|-------------|:--------:|:---:|------------:|---------:|
| 001 | {{PROCEDURE_1_NAME}} | {{PROCEDURE_1_TEETH}} | {{PROCEDURE_1_QTY}} | R$ {{PROCEDURE_1_PRICE}} | R$ {{PROCEDURE_1_TOTAL}} |
| 002 | {{PROCEDURE_2_NAME}} | {{PROCEDURE_2_TEETH}} | {{PROCEDURE_2_QTY}} | R$ {{PROCEDURE_2_PRICE}} | R$ {{PROCEDURE_2_TOTAL}} |
| 003 | {{PROCEDURE_3_NAME}} | {{PROCEDURE_3_TEETH}} | {{PROCEDURE_3_QTY}} | R$ {{PROCEDURE_3_PRICE}} | R$ {{PROCEDURE_3_TOTAL}} |
| 004 | {{PROCEDURE_4_NAME}} | {{PROCEDURE_4_TEETH}} | {{PROCEDURE_4_QTY}} | R$ {{PROCEDURE_4_PRICE}} | R$ {{PROCEDURE_4_TOTAL}} |
| 005 | {{PROCEDURE_5_NAME}} | {{PROCEDURE_5_TEETH}} | {{PROCEDURE_5_QTY}} | R$ {{PROCEDURE_5_PRICE}} | R$ {{PROCEDURE_5_TOTAL}} |
| 006 | {{PROCEDURE_6_NAME}} | {{PROCEDURE_6_TEETH}} | {{PROCEDURE_6_QTY}} | R$ {{PROCEDURE_6_PRICE}} | R$ {{PROCEDURE_6_TOTAL}} |
| 007 | {{PROCEDURE_7_NAME}} | {{PROCEDURE_7_TEETH}} | {{PROCEDURE_7_QTY}} | R$ {{PROCEDURE_7_PRICE}} | R$ {{PROCEDURE_7_TOTAL}} |
| 008 | {{PROCEDURE_8_NAME}} | {{PROCEDURE_8_TEETH}} | {{PROCEDURE_8_QTY}} | R$ {{PROCEDURE_8_PRICE}} | R$ {{PROCEDURE_8_TOTAL}} |
| 009 | {{PROCEDURE_9_NAME}} | {{PROCEDURE_9_TEETH}} | {{PROCEDURE_9_QTY}} | R$ {{PROCEDURE_9_PRICE}} | R$ {{PROCEDURE_9_TOTAL}} |
| 010 | {{PROCEDURE_10_NAME}} | {{PROCEDURE_10_TEETH}} | {{PROCEDURE_10_QTY}} | R$ {{PROCEDURE_10_PRICE}} | R$ {{PROCEDURE_10_TOTAL}} |

---

## RESUMO FINANCEIRO

**Subtotal:** R$ {{SUBTOTAL}}
**Desconto:** R$ {{DISCOUNT}}
**VALOR TOTAL:** **R$ {{TOTAL}}**

---

## CONDIÇÕES DE PAGAMENTO

**Formas de Pagamento:** Dinheiro ({{DISCOUNT_CASH}}% desc.) | PIX ({{DISCOUNT_PIX}}% desc.) | Cartão (até {{MAX_INSTALLMENTS}}x)

**À vista:** R$ {{CASH_PRICE}} | **Parcelado:** {{MAX_INSTALLMENTS}}x de R$ {{INSTALLMENT_VALUE}}

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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Reset e configuração básica */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Configuração A4 */
        @page {
          size: A4;
          margin: 2cm 1.5cm;
        }

        body {
          font-family: Arial, 'Helvetica Neue', sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #333;
          background: white;
          padding: 20px;
          max-width: 210mm;
          margin: 0 auto;
        }

        /* Tipografia */
        h1 {
          font-size: 24pt;
          color: #2c3e50;
          margin-bottom: 15px;
          text-align: center;
          page-break-after: avoid;
        }

        h2 {
          font-size: 14pt;
          color: #34495e;
          margin: 20px 0 10px 0;
          border-bottom: 2px solid #3498db;
          padding-bottom: 5px;
          page-break-after: avoid;
        }

        h3 {
          font-size: 12pt;
          color: #555;
          margin: 15px 0 8px 0;
          page-break-after: avoid;
        }

        p {
          margin: 8px 0;
        }

        /* Tabelas */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 10pt;
          page-break-inside: avoid;
        }

        td, th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #2c3e50;
        }

        /* Imagens */
        img {
          max-width: 100%;
          height: auto;
          display: block;
          page-break-inside: avoid;
        }

        /* Divisores */
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 20px 0;
        }

        /* Listas */
        ul, ol {
          margin: 10px 0 10px 20px;
        }

        li {
          margin: 5px 0;
        }

        /* Impressão */
        @media print {
          body {
            padding: 0;
          }

          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
          }

          table, img, div {
            page-break-inside: avoid;
          }

          a {
            color: #000;
            text-decoration: none;
          }
        }

        /* Cores e destaques */
        strong {
          font-weight: 600;
          color: #2c3e50;
        }

        /* Grid de 2 colunas */
        .grid-2-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `
}

async function htmlToPdf(html: string): Promise<Uint8Array> {
  // Conversão HTML para PDF usando PDFShift
  const PDFSHIFT_API_KEY = Deno.env.get('PDFSHIFT_API_KEY')

  if (!PDFSHIFT_API_KEY) {
    console.error('PDFSHIFT_API_KEY não configurada')
    throw new Error('PDFSHIFT_API_KEY não está configurada. Configure usando: supabase secrets set PDFSHIFT_API_KEY=your_key')
  }

  console.log('Iniciando conversão HTML→PDF com PDFShift...')
  const startTime = Date.now()

  try {
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`api:${PDFSHIFT_API_KEY}`)}`
      },
      body: JSON.stringify({
        source: html,
        sandbox: false,
        landscape: false,
        format: 'A4',
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm'
        },
        use_print: true,
        wait_for: 'networkidle0', // Espera todas as imagens carregarem
        viewport: {
          width: 794,  // A4 width em pixels (96 DPI)
          height: 1123 // A4 height em pixels (96 DPI)
        }
      })
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PDFShift error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })

      // Parse error JSON se possível
      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(`PDFShift: ${errorJson.error || errorJson.message || errorText}`)
      } catch {
        throw new Error(`PDFShift HTTP ${response.status}: ${errorText}`)
      }
    }

    const pdfBuffer = await response.arrayBuffer()
    const pdfArray = new Uint8Array(pdfBuffer)

    console.log('PDF gerado com sucesso:', {
      duration_ms: duration,
      size_bytes: pdfArray.byteLength,
      size_kb: Math.round(pdfArray.byteLength / 1024)
    })

    return pdfArray

  } catch (error) {
    console.error('Erro ao gerar PDF:', error)

    // Se for erro de rede, tentar retry uma vez
    if (error.message && (error.message.includes('fetch failed') || error.message.includes('network'))) {
      console.log('Tentando retry após erro de rede...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      const retryResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`api:${PDFSHIFT_API_KEY}`)}`
        },
        body: JSON.stringify({
          source: html,
          format: 'A4',
          margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
          use_print: true,
          wait_for: 'networkidle0'
        })
      })

      if (!retryResponse.ok) {
        throw new Error(`PDFShift retry failed: ${await retryResponse.text()}`)
      }

      const retryBuffer = await retryResponse.arrayBuffer()
      console.log('PDF gerado com sucesso no retry')
      return new Uint8Array(retryBuffer)
    }

    throw error
  }
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
