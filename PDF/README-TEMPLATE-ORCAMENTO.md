# 📋 Template de Orçamento Profissional

## Arquivos Criados

1. **template-orcamento-profissional.md** - Template com placeholders para preenchimento automático
2. **exemplo-orcamento-preenchido.md** - Exemplo de como ficará o orçamento final

---

## 🎯 Características do Template

### ✅ Elementos Incluídos:

- **Cabeçalho profissional** com logo e dados da clínica
- **Informações do orçamento** (número, data, validade)
- **Dados do paciente** completos
- **Tabela detalhada de procedimentos** com colunas para:
  - Código do procedimento
  - Nome do procedimento
  - Dentes envolvidos
  - Quantidade
  - Valor unitário
  - Subtotal
- **Resumo financeiro** com subtotal, desconto e total
- **Condições de pagamento** detalhadas
- **Ressalvas importantes** ⚠️ sobre:
  - Natureza indicativa do orçamento
  - Obrigatoriedade de avaliação presencial
  - Possíveis variações de valores
  - Validade e garantias

---

## 🔧 Como Usar o Template

### Placeholders Disponíveis:

#### Dados da Clínica (do banco `user_configs`):
- `{{CLINIC_NAME}}` - Nome da clínica
- `{{CLINIC_CNPJ}}` - CNPJ da clínica
- `{{CLINIC_ADDRESS}}` - Endereço completo
- `{{CLINIC_ZIP_CODE}}` - CEP
- `{{CLINIC_CITY}}` - Cidade
- `{{CLINIC_STATE}}` - Estado (sigla)
- `{{CLINIC_PHONE}}` - Telefone
- `{{CLINIC_EMAIL}}` - E-mail
- `{{CLINIC_LOGO_URL}}` - URL da logomarca

#### Dados do Orçamento:
- `{{BUDGET_NUMBER}}` - Número do orçamento (ex: ORCAM-2025-001)
- `{{ISSUE_DATE}}` - Data de emissão
- `{{VALIDITY_DATE}}` - Data de validade
- `{{VALIDITY_DAYS}}` - Dias de validade (ex: 30)
- `{{STATUS}}` - Status do orçamento

#### Dados do Paciente:
- `{{PATIENT_NAME}}` - Nome completo
- `{{PATIENT_CPF}}` - CPF
- `{{PATIENT_PHONE}}` - Telefone
- `{{PATIENT_EMAIL}}` - E-mail

#### Procedimentos (até 4, expandir conforme necessário):
- `{{PROCEDURE_X_NAME}}` - Nome do procedimento
- `{{PROCEDURE_X_TEETH}}` - Dentes envolvidos
- `{{PROCEDURE_X_QTY}}` - Quantidade
- `{{PROCEDURE_X_PRICE}}` - Preço unitário
- `{{PROCEDURE_X_TOTAL}}` - Total

#### Valores:
- `{{SUBTOTAL}}` - Subtotal
- `{{DISCOUNT}}` - Desconto
- `{{TOTAL}}` - Valor total

#### Pagamento:
- `{{DISCOUNT_CASH}}` - % desconto à vista/dinheiro
- `{{DISCOUNT_PIX}}` - % desconto PIX
- `{{INSTALLMENTS}}` - Número de parcelas
- `{{MAX_INSTALLMENTS}}` - Máximo de parcelas
- `{{INSTALLMENT_VALUE}}` - Valor da parcela
- `{{CASH_PRICE}}` - Preço à vista com desconto
- `{{DISCOUNT_PERCENTAGE}}` - Percentual de desconto

#### Profissional (do banco `user_configs`):
- `{{DENTIST_NAME}}` - Nome do dentista responsável técnico (campo: `clinic_dentist_name`)
- `{{DENTIST_CRO}}` - CRO do responsável técnico (campo: `clinic_cro`)

---

## 💻 Integração com o Sistema

### Opção 1: Função JavaScript

```javascript
function preencherOrcamento(template, dados) {
  let orcamento = template;

  // Substituir todos os placeholders
  for (const [key, value] of Object.entries(dados)) {
    const placeholder = `{{${key}}}`;
    orcamento = orcamento.replaceAll(placeholder, value || '');
  }

  return orcamento;
}

// Exemplo de uso:
const template = await fetch('/PDF/template-orcamento-profissional.md').then(r => r.text());
const orcamentoPreenchido = preencherOrcamento(template, {
  CLINIC_NAME: config.clinicName,
  CLINIC_CNPJ: config.clinicCnpj,
  CLINIC_ADDRESS: config.clinicAddress,
  CLINIC_PHONE: config.clinicPhone,
  CLINIC_EMAIL: config.clinicEmail,
  DENTIST_NAME: config.clinicDentistName,
  DENTIST_CRO: config.clinicCro,
  // ... demais dados
});
```

### Opção 2: Integrar ao Serviço de PDF

Adicionar ao arquivo `src/services/pdfService.ts`:

```typescript
import templateOrcamento from '@/PDF/template-orcamento-profissional.md?raw';

export async function gerarOrcamento(
  dadosClinica: ClinicData,
  dadosPaciente: PatientData,
  procedimentos: Procedure[],
  valores: BudgetValues
) {
  let orcamento = templateOrcamento;

  // Preencher dados da clínica
  orcamento = orcamento
    .replaceAll('{{CLINIC_NAME}}', dadosClinica.name)
    .replaceAll('{{CLINIC_ADDRESS}}', dadosClinica.address)
    // ... demais substituições

  // Converter para PDF usando biblioteca (ex: jsPDF, puppeteer)
  return converterMarkdownParaPDF(orcamento);
}
```

---

## 📦 Conversão para PDF

### Opções de Bibliotecas:

1. **markdown-pdf** (Node.js)
   ```bash
   npm install markdown-pdf
   ```

2. **puppeteer** (mais controle)
   ```bash
   npm install puppeteer
   ```

3. **jsPDF + markdown-it** (frontend)
   ```bash
   npm install jspdf markdown-it
   ```

4. **Supabase Edge Function** (recomendado)
   - Criar função edge que recebe os dados
   - Preenche o template
   - Gera PDF usando Deno

---

## 🎨 Customização

### Adicionar mais procedimentos:

Basta adicionar mais linhas na tabela:

```markdown
| 005 | {{PROCEDURE_5_NAME}} | {{PROCEDURE_5_TEETH}} | {{PROCEDURE_5_QTY}} | R$ {{PROCEDURE_5_PRICE}} | R$ {{PROCEDURE_5_TOTAL}} |
```

### Modificar layout:

O template usa Markdown com HTML inline. Você pode:
- Adicionar CSS customizado
- Incluir imagens adicionais
- Modificar cores e fontes
- Adicionar QR Code para pagamento

### Adicionar novos campos:

1. Adicione o placeholder no template: `{{NOVO_CAMPO}}`
2. Passe o valor ao preencher o template

---

## 📝 Próximos Passos

1. **Configurar dados da clínica** em: Configurações > Dados da Clínica
2. **Criar tabela de preços** dos procedimentos
3. **Implementar geração automática** ao finalizar simulação
4. **Testar conversão para PDF**
5. **Integrar com sistema de envio** (email, WhatsApp)

---

## 🔒 Aspectos Legais

O template inclui ressalvas importantes que protegem a clínica:

✅ Deixa claro que é um orçamento INDICATIVO
✅ Exige avaliação presencial para orçamento definitivo
✅ Explica possíveis variações de valores
✅ Define validade do orçamento
✅ Menciona garantias do CFO
✅ Requer assinatura do paciente

**Importante:** Consulte um advogado para adequar às leis locais e necessidades específicas da clínica.

---

## 📞 Suporte

Para dúvidas sobre o template, consulte a documentação do projeto ou entre em contato com o desenvolvedor.
