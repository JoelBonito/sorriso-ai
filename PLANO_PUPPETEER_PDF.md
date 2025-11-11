# Plano de Implementação: Puppeteer para Geração de PDFs

## 📋 RESUMO EXECUTIVO

**Objetivo:** Substituir a conversão HTML→PDF temporária por uma solução profissional usando Puppeteer

**Status Atual:**
- ❌ Edge Function retorna HTML como bytes (não é PDF real)
- ⚠️ Funciona para visualização mas não para download/impressão
- 🎯 Precisa de conversão real para produção

**Solução Proposta:**
- ✅ Integrar API externa de conversão PDF (recomendado)
- 🔄 Ou implementar servidor Puppeteer separado
- 📊 Comparação de 4 opções diferentes

---

## 🎯 OPÇÕES DE IMPLEMENTAÇÃO

### Opção 1: API Externa (RECOMENDADO) ⭐

**Serviço:** PDFShift ou API2PDF

**Vantagens:**
- ✅ Implementação em 30 minutos
- ✅ Sem infraestrutura adicional
- ✅ Mantém arquitetura atual
- ✅ Alta qualidade (usa Chromium)
- ✅ Suporte a CSS print, imagens, fontes
- ✅ Escala automaticamente

**Desvantagens:**
- ❌ Custo mensal (~$9-$19/mês)
- ❌ Dependência de serviço externo
- ❌ Limite de PDFs por mês

**Custo:**
- PDFShift: $9/mês (1.000 PDFs)
- API2PDF: $10/mês (1.000 PDFs)
- DocRaptor: $15/mês (125 PDFs)

**Cenário:** Ideal para 90% dos casos. Clínicas geram ~10-50 PDFs/mês.

---

### Opção 2: Servidor Puppeteer Separado

**Arquitetura:** Edge Function → API Puppeteer → S3/Storage

**Vantagens:**
- ✅ Controle total sobre renderização
- ✅ Sem custos recorrentes (após setup)
- ✅ Sem limites de uso
- ✅ Pode adicionar features customizadas

**Desvantagens:**
- ❌ Requer servidor dedicado (VPS/AWS)
- ❌ Manutenção de infraestrutura
- ❌ Complexidade maior
- ❌ Custo de servidor (~$5-10/mês)

**Custo:**
- VPS Básico: $5-10/mês (DigitalOcean, Linode)
- AWS Lambda + Chromium: ~$0-5/mês (low volume)

---

### Opção 3: Puppeteer em Edge Function (NÃO RECOMENDADO)

**Problema:** Supabase Edge Functions (Deno) têm limitações:
- Limite de memória (512MB)
- Limite de tempo (60s)
- Sem suporte nativo a Chromium

**Status:** ❌ Tecnicamente possível mas não prático

---

### Opção 4: Migrar para AWS Lambda

**Arquitetura:** Lambda + Puppeteer + Chromium Layer

**Vantagens:**
- ✅ Serverless (paga por uso)
- ✅ Escala automaticamente
- ✅ Chromium otimizado disponível

**Desvantagens:**
- ❌ Requer reescrever Edge Function
- ❌ Configuração complexa
- ❌ Mudança de infraestrutura

**Custo:** ~$0-2/mês para baixo volume

---

## 🚀 IMPLEMENTAÇÃO RECOMENDADA: API EXTERNA

### Por que escolher API externa?

1. **Tempo de implementação:** 30 min vs 4-8 horas
2. **Manutenção:** Zero vs contínua
3. **Qualidade:** Garantida vs "depends"
4. **Custo real:** $9/mês é aceitável para produto pago
5. **Escala:** Automática vs manual

### Escolha do Serviço

**🏆 Recomendado: PDFShift**

| Critério | PDFShift | API2PDF | DocRaptor |
|----------|----------|---------|-----------|
| **Preço/mês** | $9 | $10 | $15 |
| **PDFs/mês** | 1.000 | 1.000 | 125 |
| **Qualidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **API Simples** | ✅ | ✅ | ✅ |
| **Support CSS** | ✅ | ✅ | ✅ |
| **Webhook** | ✅ | ❌ | ✅ |
| **Free Trial** | 50 PDFs | 7 dias | 7 dias |

**Decisão:** PDFShift - melhor custo-benefício

---

## 📝 PLANO DE IMPLEMENTAÇÃO: PDFSHIFT

### Fase 1: Setup da Conta (5 minutos)

**Passos:**
1. Criar conta em https://pdfshift.io
2. Obter API Key
3. Adicionar ao Supabase Secrets

```bash
# Adicionar API Key aos secrets do Supabase
supabase secrets set PDFSHIFT_API_KEY=your_api_key_here
```

---

### Fase 2: Atualizar Edge Function (20 minutos)

**Arquivo:** `supabase/functions/generate-budget-pdf/index.ts`

#### 2.1. Substituir função `htmlToPdf()`

**Antes (temporário):**
```typescript
async function htmlToPdf(html: string): Promise<Uint8Array> {
  // IMPLEMENTAÇÃO TEMPORÁRIA
  const encoder = new TextEncoder()
  return encoder.encode(html)
}
```

**Depois (PDFShift):**
```typescript
async function htmlToPdf(html: string): Promise<Uint8Array> {
  const PDFSHIFT_API_KEY = Deno.env.get('PDFSHIFT_API_KEY')!

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
      // Outras opções
      wait_for: 'networkidle0', // Espera carregar imagens
      viewport: {
        width: 794,  // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PDFShift error: ${error}`)
  }

  return new Uint8Array(await response.arrayBuffer())
}
```

#### 2.2. Melhorar HTML gerado

**Adicionar meta tags para PDF:**
```typescript
function markdownToHtml(markdown: string): string {
  // ... código existente de conversão ...

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <!-- Meta tags para PDF -->
      <meta name="author" content="Sorriso AI">
      <meta name="subject" content="Orçamento Odontológico">

      <title>Orçamento Odontológico</title>

      <style>
        /* ... CSS existente ... */

        /* Garantir fontes web-safe */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                       'Helvetica Neue', Arial, sans-serif;
        }

        /* Melhorar renderização de imagens no PDF */
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `
}
```

#### 2.3. Adicionar tratamento de erros robusto

```typescript
async function htmlToPdf(html: string): Promise<Uint8Array> {
  const PDFSHIFT_API_KEY = Deno.env.get('PDFSHIFT_API_KEY')

  if (!PDFSHIFT_API_KEY) {
    throw new Error('PDFSHIFT_API_KEY não configurada')
  }

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
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
        use_print: true,
        wait_for: 'networkidle0'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('PDFShift error response:', errorText)

      // Parse error se for JSON
      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(`PDFShift: ${errorJson.error || errorText}`)
      } catch {
        throw new Error(`PDFShift HTTP ${response.status}: ${errorText}`)
      }
    }

    const pdfBuffer = await response.arrayBuffer()
    console.log('PDF gerado com sucesso, tamanho:', pdfBuffer.byteLength, 'bytes')

    return new Uint8Array(pdfBuffer)

  } catch (error) {
    console.error('Erro ao gerar PDF:', error)

    // Se for erro de rede, tentar retry
    if (error.message.includes('fetch failed') || error.message.includes('network')) {
      console.log('Tentando retry após erro de rede...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Segunda tentativa
      const retryResponse = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`api:${PDFSHIFT_API_KEY}`)}`
        },
        body: JSON.stringify({
          source: html,
          sandbox: false,
          format: 'A4',
          margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
        })
      })

      if (!retryResponse.ok) {
        throw new Error(`PDFShift retry failed: ${await retryResponse.text()}`)
      }

      return new Uint8Array(await retryResponse.arrayBuffer())
    }

    throw error
  }
}
```

---

### Fase 3: Testar Localmente (10 minutos)

#### 3.1. Configurar secrets localmente

```bash
# Criar arquivo .env local (se não existir)
echo "PDFSHIFT_API_KEY=your_test_api_key" >> supabase/.env.local
```

#### 3.2. Testar Edge Function

```bash
# Terminal 1: Iniciar Supabase local
supabase start

# Terminal 2: Servir Edge Function
supabase functions serve generate-budget-pdf --env-file supabase/.env.local

# Terminal 3: Testar com curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-budget-pdf' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"budgetId":"test-budget-id"}'
```

#### 3.3. Validar PDF gerado

```bash
# Baixar PDF da URL retornada
curl -o test.pdf "URL_DO_PDF_GERADO"

# Abrir e verificar
open test.pdf  # macOS
xdg-open test.pdf  # Linux
```

**Checklist de Validação:**
- [ ] PDF é um arquivo válido (não HTML)
- [ ] Formato A4 correto
- [ ] Margens adequadas
- [ ] Imagens carregadas e visíveis
- [ ] Fontes renderizadas corretamente
- [ ] Tabelas bem formatadas
- [ ] Sem quebras de página incorretas

---

### Fase 4: Deploy para Produção (5 minutos)

#### 4.1. Configurar secret em produção

```bash
# Adicionar API Key de produção
supabase secrets set PDFSHIFT_API_KEY=your_production_api_key --project-ref your-project-ref
```

#### 4.2. Deploy da função

```bash
# Deploy
supabase functions deploy generate-budget-pdf --project-ref your-project-ref

# Verificar logs
supabase functions logs generate-budget-pdf --project-ref your-project-ref
```

#### 4.3. Testar em produção

```bash
# Usar URL de produção
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/generate-budget-pdf' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"budgetId":"real-budget-id"}'
```

---

### Fase 5: Monitoramento (Contínuo)

#### 5.1. Métricas para monitorar

```typescript
// Adicionar logging na Edge Function
const startTime = Date.now()

// ... código de geração ...

const endTime = Date.now()
const duration = endTime - startTime

console.log('PDF Generation Metrics:', {
  budgetId,
  duration_ms: duration,
  pdf_size_bytes: pdfBuffer.byteLength,
  timestamp: new Date().toISOString()
})
```

#### 5.2. Dashboard PDFShift

- Acessar: https://pdfshift.io/dashboard
- Monitorar:
  - PDFs gerados no mês
  - Taxa de erro
  - Tempo médio de conversão
  - Uso da API

#### 5.3. Alertas

```typescript
// Adicionar alerta se PDF muito grande
if (pdfBuffer.byteLength > 5 * 1024 * 1024) { // 5MB
  console.warn('PDF muito grande:', pdfBuffer.byteLength, 'bytes')
}

// Alertar se demorar muito
if (duration > 10000) { // 10 segundos
  console.warn('Geração de PDF demorada:', duration, 'ms')
}
```

---

## 🎨 OPÇÕES AVANÇADAS DO PDFSHIFT

### Melhorias Opcionais

#### 1. Watermark (para orçamentos não aprovados)

```typescript
body: JSON.stringify({
  source: html,
  format: 'A4',
  // Adicionar watermark se status != 'accepted'
  watermark: budget.status !== 'accepted' ? {
    image: 'https://yoursite.com/watermark.png',
    opacity: 0.3,
    rotate: 45
  } : undefined
})
```

#### 2. Headers e Footers customizados

```typescript
body: JSON.stringify({
  source: html,
  format: 'A4',
  header: {
    source: '<div style="text-align: right; font-size: 10px;">{{CLINIC_NAME}}</div>',
    height: '10mm'
  },
  footer: {
    source: '<div style="text-align: center; font-size: 10px;">Página {{page}} de {{total}}</div>',
    height: '10mm'
  }
})
```

#### 3. Proteção com senha

```typescript
body: JSON.stringify({
  source: html,
  format: 'A4',
  protection: {
    user_password: 'senha123',
    owner_password: 'admin123',
    no_print: false,
    no_modify: true
  }
})
```

#### 4. Compressão para reduzir tamanho

```typescript
body: JSON.stringify({
  source: html,
  format: 'A4',
  image_quality: 90, // 0-100, menor = mais compressão
  compress: true
})
```

---

## 📊 COMPARAÇÃO DE CUSTOS

### Cenário 1: Clínica Pequena (20 PDFs/mês)

| Solução | Custo/Mês | Setup | Manutenção |
|---------|-----------|-------|------------|
| **PDFShift** | $9 | 30 min | 0h |
| **VPS + Puppeteer** | $5 | 4h | 1h/mês |
| **AWS Lambda** | ~$0 | 6h | 0.5h/mês |

**Recomendado:** PDFShift

### Cenário 2: Clínica Média (100 PDFs/mês)

| Solução | Custo/Mês | Setup | Manutenção |
|---------|-----------|-------|------------|
| **PDFShift** | $9 | 30 min | 0h |
| **VPS + Puppeteer** | $5 | 4h | 1h/mês |
| **AWS Lambda** | ~$1 | 6h | 0.5h/mês |

**Recomendado:** PDFShift

### Cenário 3: Rede de Clínicas (1.500 PDFs/mês)

| Solução | Custo/Mês | Setup | Manutenção |
|---------|-----------|-------|------------|
| **PDFShift** | $29 (plano 2.500) | 30 min | 0h |
| **VPS + Puppeteer** | $10 | 4h | 1h/mês |
| **AWS Lambda** | ~$5 | 6h | 0.5h/mês |

**Recomendado:** VPS + Puppeteer (melhor ROI)

---

## 🛠️ ALTERNATIVA: VPS + PUPPETEER

### Quando usar?

- Volume > 2.000 PDFs/mês
- Precisa de features muito customizadas
- Quer controle total
- Não quer dependência externa

### Arquitetura

```
Frontend → Edge Function → API Puppeteer (VPS) → S3 Storage
                                ↓
                         Chromium Headless
```

### Implementação Resumida

#### 1. Servidor Node.js + Puppeteer

```javascript
// server.js
const express = require('express')
const puppeteer = require('puppeteer')

const app = express()
app.use(express.json())

let browser

async function initBrowser() {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
}

app.post('/generate-pdf', async (req, res) => {
  const { html } = req.body

  const page = await browser.newPage()

  await page.setContent(html, { waitUntil: 'networkidle0' })

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  })

  await page.close()

  res.contentType('application/pdf')
  res.send(pdf)
})

initBrowser().then(() => {
  app.listen(3000, () => console.log('Server running on :3000'))
})
```

#### 2. Docker para facilitar deploy

```dockerfile
FROM node:18

# Instalar dependências do Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 3. Deploy no DigitalOcean

```bash
# Criar droplet
doctl compute droplet create pdf-generator \
  --image docker-20-04 \
  --size s-1vcpu-1gb \
  --region nyc1

# Deploy
docker build -t pdf-generator .
docker run -d -p 3000:3000 pdf-generator
```

#### 4. Atualizar Edge Function

```typescript
async function htmlToPdf(html: string): Promise<Uint8Array> {
  const PDF_SERVER_URL = Deno.env.get('PDF_SERVER_URL')! // http://your-vps:3000

  const response = await fetch(`${PDF_SERVER_URL}/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html })
  })

  if (!response.ok) {
    throw new Error(`PDF Server error: ${await response.text()}`)
  }

  return new Uint8Array(await response.arrayBuffer())
}
```

**Custo:** ~$5-10/mês (DigitalOcean Droplet)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Preparação
- [ ] Decidir entre PDFShift ou VPS
- [ ] Criar conta no serviço escolhido
- [ ] Obter API key / configurar servidor
- [ ] Adicionar secrets ao Supabase

### Desenvolvimento
- [ ] Atualizar função `htmlToPdf()`
- [ ] Adicionar tratamento de erros
- [ ] Melhorar HTML gerado (meta tags, CSS)
- [ ] Adicionar logging/métricas
- [ ] Testar localmente

### Testes
- [ ] PDF é válido (não HTML)
- [ ] Formato A4 correto
- [ ] Margens adequadas
- [ ] Imagens carregadas
- [ ] Tabelas formatadas
- [ ] Fontes corretas
- [ ] Sem quebras incorretas
- [ ] Tamanho razoável (<2MB)

### Deploy
- [ ] Configurar secrets em produção
- [ ] Deploy da Edge Function
- [ ] Teste em produção com budget real
- [ ] Validar PDF gerado

### Pós-Deploy
- [ ] Configurar monitoramento
- [ ] Verificar dashboard do serviço
- [ ] Documentar troubleshooting
- [ ] Treinar usuários

---

## 🐛 TROUBLESHOOTING

### Problema 1: "PDFSHIFT_API_KEY não configurada"

**Solução:**
```bash
# Verificar secrets
supabase secrets list --project-ref your-project-ref

# Adicionar se não existir
supabase secrets set PDFSHIFT_API_KEY=your_key
```

### Problema 2: PDF vazio ou com imagens quebradas

**Causa:** Imagens não carregadas antes da conversão

**Solução:**
```typescript
// Adicionar wait_for
body: JSON.stringify({
  source: html,
  format: 'A4',
  wait_for: 'networkidle0', // Espera carregar todas as imagens
  delay: 1000 // Delay adicional de 1s
})
```

### Problema 3: Fontes não renderizam corretamente

**Solução:**
```css
/* Usar fontes web-safe no CSS */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
}

/* Ou incluir Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
```

### Problema 4: Timeout na geração

**Solução:**
```typescript
// Aumentar timeout da Edge Function
// Em supabase/functions/generate-budget-pdf/index.ts
serve(async (req) => {
  // ... código ...
}, {
  timeout: 120 // 2 minutos
})
```

### Problema 5: PDF muito grande

**Solução:**
```typescript
// Comprimir imagens no HTML antes de enviar
// Ou usar opção de compressão
body: JSON.stringify({
  source: html,
  format: 'A4',
  image_quality: 85, // Reduzir qualidade das imagens
  compress: true
})
```

---

## 📚 RECURSOS

### Documentação
- PDFShift: https://docs.pdfshift.io
- Puppeteer: https://pptr.dev
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

### Exemplos
- PDFShift Examples: https://github.com/pdfshift/examples
- Puppeteer Examples: https://github.com/puppeteer/examples

### Suporte
- PDFShift Support: support@pdfshift.io
- Supabase Discord: https://discord.supabase.com

---

## 🎯 PRÓXIMOS PASSOS

### Implementação Imediata (Hoje)
1. **Criar conta PDFShift** (5 min)
2. **Configurar API Key** (2 min)
3. **Atualizar Edge Function** (20 min)
4. **Testar localmente** (10 min)
5. **Deploy** (5 min)

**Total: ~45 minutos**

### Melhorias Futuras (Próximas Semanas)
1. Adicionar watermark para orçamentos não aprovados
2. Implementar headers/footers customizados
3. Adicionar proteção com senha (opcional)
4. Otimizar compressão de imagens
5. Implementar cache de PDFs gerados

### Migração (Se Necessário)
- Quando atingir >2.000 PDFs/mês: considerar VPS
- Quando precisar features muito customizadas: Puppeteer
- Quando custo ficar alto: AWS Lambda

---

## 💰 ESTIMATIVA DE INVESTIMENTO

### Setup Inicial
- **Tempo:** 45 minutos - 1 hora
- **Custo:** $0 (50 PDFs grátis para testar)

### Operacional (Mensal)
- **PDFShift:** $9/mês (até 1.000 PDFs)
- **Manutenção:** ~0 horas/mês
- **Monitoramento:** 15 min/mês

### ROI
- **Antes:** Sistema não funcional em produção
- **Depois:** PDFs profissionais, prontos para impressão
- **Valor:** Essencial para negócio (impossível vender sem)

**Conclusão:** $9/mês é investimento mínimo e necessário

---

## ✅ RECOMENDAÇÃO FINAL

**Para 90% dos casos:** Use **PDFShift**

**Razões:**
1. ✅ Implementação em 45 minutos
2. ✅ Zero manutenção
3. ✅ Qualidade profissional garantida
4. ✅ Custo acessível ($9/mês)
5. ✅ Escala automaticamente
6. ✅ Mantém arquitetura atual

**Quando migrar para VPS:**
- Volume > 2.000 PDFs/mês
- Precisa features muito específicas
- Quer eliminar dependências externas

---

**Status:** Plano pronto para execução
**Próximo passo:** Criar conta PDFShift e começar implementação
**Tempo estimado:** 45 minutos do início ao fim
