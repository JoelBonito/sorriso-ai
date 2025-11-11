# ORÇAMENTO ODONTOLÓGICO

---

{{IF_HAS_LOGO}}
<div style="text-align: center; page-break-inside: avoid;">
  <img src="{{CLINIC_LOGO_URL}}" alt="Logo da Clínica" style="max-height: 80px; margin-bottom: 15px; object-fit: contain;">
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

<div style="display: flex; justify-content: space-around; align-items: center; margin: 20px 0; page-break-inside: avoid;">
  <div style="text-align: center; flex: 1; max-width: 48%;">
    <img src="{{SIMULATION_BEFORE_IMAGE}}" alt="Antes" style="width: 100%; max-width: 350px; height: auto; max-height: 240px; border: 2px solid #ddd; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto;">
    <p style="margin-top: 8px; font-weight: bold; color: #666; font-size: 0.9em;">ANTES</p>
  </div>
  <div style="text-align: center; flex: 1; max-width: 48%;">
    <img src="{{SIMULATION_AFTER_IMAGE}}" alt="Depois" style="width: 100%; max-width: 350px; height: auto; max-height: 240px; border: 2px solid #ddd; border-radius: 8px; object-fit: cover; display: block; margin: 0 auto;">
    <p style="margin-top: 8px; font-weight: bold; color: #666; font-size: 0.9em;">DEPOIS</p>
  </div>
</div>

---
{{END_IF_HAS_SIMULATION}}

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; page-break-inside: avoid;">
  <div>
    <h3 style="margin-bottom: 10px; font-size: 1em;">📋 DADOS DO ORÇAMENTO</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Nº Orçamento:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{BUDGET_NUMBER}}</td></tr>
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Data Emissão:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{ISSUE_DATE}}</td></tr>
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Validade:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{VALIDITY_DATE}}</td></tr>
      <tr><td style="padding: 5px;"><strong>Status:</strong></td><td style="padding: 5px;">{{STATUS}}</td></tr>
    </table>
  </div>
  <div>
    <h3 style="margin-bottom: 10px; font-size: 1em;">👤 DADOS DO PACIENTE</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Nome:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{PATIENT_NAME}}</td></tr>
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>CPF:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{PATIENT_CPF}}</td></tr>
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Telefone:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{PATIENT_PHONE}}</td></tr>
      <tr><td style="padding: 5px;"><strong>E-mail:</strong></td><td style="padding: 5px;">{{PATIENT_EMAIL}}</td></tr>
    </table>
  </div>
</div>

---

## PROCEDIMENTOS PROPOSTOS

<div style="page-break-inside: avoid;">

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

</div>

---

## RESUMO FINANCEIRO

<div style="page-break-inside: avoid;">

| Descrição | Valor |
|-----------|------:|
| **Subtotal** | R$ {{SUBTOTAL}} |
| **Desconto** | R$ {{DISCOUNT}} |
| **VALOR TOTAL** | **R$ {{TOTAL}}** |

</div>

---

## CONDIÇÕES DE PAGAMENTO

<div style="page-break-inside: avoid;">

**Formas de Pagamento Aceitas:**
- ✅ Dinheiro ({{DISCOUNT_CASH}}% desconto) | ✅ PIX ({{DISCOUNT_PIX}}% desconto)
- ✅ Cartão de Crédito (até {{INSTALLMENTS}}x) | ✅ Cartão de Débito | ✅ Boleto

**Parcelamento:**
- **À vista:** R$ {{CASH_PRICE}} ({{DISCOUNT_PERCENTAGE}}% desconto)
- **Parcelado:** Até {{MAX_INSTALLMENTS}}x de R$ {{INSTALLMENT_VALUE}}

</div>

---

<div style="font-size: 0.82em; line-height: 1.35; page-break-inside: avoid;">

## ⚠️ OBSERVAÇÕES IMPORTANTES

**Sobre este Orçamento:**

**ORÇAMENTO INDICATIVO:** Este documento apresenta valores e procedimentos baseados em uma simulação prévia e análise preliminar. Os valores e tratamentos aqui descritos são aproximados e têm caráter informativo.

**AVALIAÇÃO PRESENCIAL OBRIGATÓRIA:** Para um orçamento definitivo e preciso, é INDISPENSÁVEL a realização de uma consulta técnica presencial com avaliação clínica completa.

**POSSÍVEIS VARIAÇÕES:** Os valores finais podem sofrer alterações após a avaliação presencial, considerando condições específicas da saúde bucal, necessidade de tratamentos preparatórios e complexidade identificada durante o exame clínico.

**VALIDADE:** Este orçamento tem validade de 30 dias a partir da data de envio.

**GARANTIA:** Todos os procedimentos realizados em nossa clínica contam com garantia em conformidade com as normas do Conselho Federal de Odontologia (CFO).

</div>

---

<div style="page-break-inside: avoid;">

## ACEITAÇÃO DO ORÇAMENTO

Declaro que li e compreendi todas as informações contidas neste orçamento, especialmente as ressalvas sobre sua natureza indicativa e a necessidade de avaliação presencial para confirmação dos valores e procedimentos.

<div style="margin-top: 30px;">

**Data:** ___/___/______ &nbsp;&nbsp;&nbsp;&nbsp; **Assinatura do Paciente:** _________________________________

**Responsável Técnico:** {{DENTIST_NAME}} | **CRO:** {{DENTIST_CRO}}

</div>

</div>

---

<div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 0.8em; color: #666; page-break-inside: avoid;">
  <p><strong>{{CLINIC_NAME}}</strong> | {{CLINIC_PHONE}} | {{CLINIC_EMAIL}}</p>
  <p>{{CLINIC_ADDRESS}} - {{CLINIC_CITY}}/{{CLINIC_STATE}} - CEP: {{CLINIC_ZIP_CODE}}</p>
</div>
