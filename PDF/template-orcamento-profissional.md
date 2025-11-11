# ORÇAMENTO ODONTOLÓGICO

---

<div style="text-align: center;">
  <img src="{{CLINIC_LOGO_URL}}" alt="Logo da Clínica" style="max-height: 80px; margin-bottom: 15px;">
</div>

## {{CLINIC_NAME}}

**CNPJ:** {{CLINIC_CNPJ}}
**Endereço:** {{CLINIC_ADDRESS}}
**CEP:** {{CLINIC_ZIP_CODE}} - {{CLINIC_CITY}}/{{CLINIC_STATE}}
**Telefone:** {{CLINIC_PHONE}} | **E-mail:** {{CLINIC_EMAIL}}

---

## SIMULAÇÃO DO TRATAMENTO

<div style="display: flex; justify-content: space-around; align-items: center; margin: 20px 0;">
  <div style="text-align: center; flex: 1;">
    <img src="{{SIMULATION_BEFORE_IMAGE}}" alt="Antes" style="max-width: 280px; max-height: 200px; border: 2px solid #ddd; border-radius: 8px;">
    <p style="margin-top: 8px; font-weight: bold; color: #666;">ANTES</p>
  </div>
  <div style="text-align: center; flex: 1;">
    <img src="{{SIMULATION_AFTER_IMAGE}}" alt="Depois" style="max-width: 280px; max-height: 200px; border: 2px solid #ddd; border-radius: 8px;">
    <p style="margin-top: 8px; font-weight: bold; color: #666;">DEPOIS</p>
  </div>
</div>

---

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
  <div>
    <h3 style="margin-bottom: 10px;">📋 DADOS DO ORÇAMENTO</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Nº Orçamento:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{BUDGET_NUMBER}}</td></tr>
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Data Emissão:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{ISSUE_DATE}}</td></tr>
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Validade:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{VALIDITY_DATE}}</td></tr>
      <tr><td style="padding: 5px;"><strong>Status:</strong></td><td style="padding: 5px;">{{STATUS}}</td></tr>
    </table>
  </div>
  <div>
    <h3 style="margin-bottom: 10px;">👤 DADOS DO PACIENTE</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Nome:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{PATIENT_NAME}}</td></tr>
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>CPF:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{PATIENT_CPF}}</td></tr>
      <tr><td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Telefone:</strong></td><td style="padding: 5px; border-bottom: 1px solid #eee;">{{PATIENT_PHONE}}</td></tr>
      <tr><td style="padding: 5px;"><strong>E-mail:</strong></td><td style="padding: 5px;">{{PATIENT_EMAIL}}</td></tr>
    </table>
  </div>
</div>

---

## PROCEDIMENTOS PROPOSTOS

| Cód. | Procedimento | Dente(s) | Qtd | Valor Unit. | Subtotal |
|:----:|-------------|:--------:|:---:|------------:|---------:|
| 001 | {{PROCEDURE_1_NAME}} | {{PROCEDURE_1_TEETH}} | {{PROCEDURE_1_QTY}} | R$ {{PROCEDURE_1_PRICE}} | R$ {{PROCEDURE_1_TOTAL}} |
| 002 | {{PROCEDURE_2_NAME}} | {{PROCEDURE_2_TEETH}} | {{PROCEDURE_2_QTY}} | R$ {{PROCEDURE_2_PRICE}} | R$ {{PROCEDURE_2_TOTAL}} |
| 003 | {{PROCEDURE_3_NAME}} | {{PROCEDURE_3_TEETH}} | {{PROCEDURE_3_QTY}} | R$ {{PROCEDURE_3_PRICE}} | R$ {{PROCEDURE_3_TOTAL}} |
| 004 | {{PROCEDURE_4_NAME}} | {{PROCEDURE_4_TEETH}} | {{PROCEDURE_4_QTY}} | R$ {{PROCEDURE_4_PRICE}} | R$ {{PROCEDURE_4_TOTAL}} |

---

## RESUMO FINANCEIRO

| Descrição | Valor |
|-----------|------:|
| **Subtotal** | R$ {{SUBTOTAL}} |
| **Desconto** | R$ {{DISCOUNT}} |
| **VALOR TOTAL** | **R$ {{TOTAL}}** |

---

## CONDIÇÕES DE PAGAMENTO

**Formas de Pagamento Aceitas:**
- ✅ Dinheiro ({{DISCOUNT_CASH}}% desconto) | ✅ PIX ({{DISCOUNT_PIX}}% desconto)
- ✅ Cartão de Crédito (até {{INSTALLMENTS}}x) | ✅ Cartão de Débito | ✅ Boleto

**Parcelamento:**
- **À vista:** R$ {{CASH_PRICE}} ({{DISCOUNT_PERCENTAGE}}% desconto)
- **Parcelado:** Até {{MAX_INSTALLMENTS}}x de R$ {{INSTALLMENT_VALUE}}

---

<div style="font-size: 0.85em; line-height: 1.4;">

## ⚠️ OBSERVAÇÕES IMPORTANTES

**Sobre este Orçamento:**

**ORÇAMENTO INDICATIVO:** Este documento apresenta valores e procedimentos baseados em uma simulação prévia e análise preliminar. Os valores e tratamentos aqui descritos são aproximados e têm caráter informativo.

**AVALIAÇÃO PRESENCIAL OBRIGATÓRIA:** Para um orçamento definitivo e preciso, é INDISPENSÁVEL a realização de uma consulta técnica presencial com avaliação clínica completa.

**POSSÍVEIS VARIAÇÕES:** Os valores finais podem sofrer alterações após a avaliação presencial, considerando condições específicas da saúde bucal, necessidade de tratamentos preparatórios e complexidade identificada durante o exame clínico.

**VALIDADE:** Este orçamento tem validade de 30 dias a partir da data de envio.

**GARANTIA:** Todos os procedimentos realizados em nossa clínica contam com garantia em conformidade com as normas do Conselho Federal de Odontologia (CFO).

</div>

---

## ACEITAÇÃO DO ORÇAMENTO

Declaro que li e compreendi todas as informações contidas neste orçamento, especialmente as ressalvas sobre sua natureza indicativa e a necessidade de avaliação presencial para confirmação dos valores e procedimentos.

<div style="margin-top: 30px;">

**Data:** ___/___/______ &nbsp;&nbsp;&nbsp;&nbsp; **Assinatura do Paciente:** _________________________________

**Responsável Técnico:** {{DENTIST_NAME}} | **CRO:** {{DENTIST_CRO}}

</div>

---

<div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 0.85em; color: #666;">
  <p><strong>{{CLINIC_NAME}}</strong> | {{CLINIC_PHONE}} | {{CLINIC_EMAIL}}</p>
  <p>{{CLINIC_ADDRESS}} - {{CLINIC_CITY}}/{{CLINIC_STATE}} - CEP: {{CLINIC_ZIP_CODE}}</p>
</div>
