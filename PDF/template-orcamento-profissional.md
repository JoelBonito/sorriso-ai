# ORÇAMENTO ODONTOLÓGICO

---

<div style="text-align: center;">
  <img src="{{CLINIC_LOGO_URL}}" alt="Logo da Clínica" style="max-height: 100px; margin-bottom: 20px;">
</div>

## {{CLINIC_NAME}}

**Endereço:** {{CLINIC_ADDRESS}}
**CEP:** {{CLINIC_ZIP_CODE}} - {{CLINIC_CITY}}/{{CLINIC_STATE}}
**Telefone:** {{CLINIC_PHONE}}
**E-mail:** {{CLINIC_EMAIL}}

---

## DADOS DO ORÇAMENTO

| Item | Informação |
|------|------------|
| **Nº do Orçamento** | {{BUDGET_NUMBER}} |
| **Data de Emissão** | {{ISSUE_DATE}} |
| **Validade** | {{VALIDITY_DATE}} |
| **Status** | {{STATUS}} |

---

## DADOS DO PACIENTE

| Item | Informação |
|------|------------|
| **Nome Completo** | {{PATIENT_NAME}} |
| **CPF** | {{PATIENT_CPF}} |
| **Telefone** | {{PATIENT_PHONE}} |
| **E-mail** | {{PATIENT_EMAIL}} |

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

### Formas de Pagamento Aceitas:
- ✅ Dinheiro ({{DISCOUNT_CASH}}% de desconto)
- ✅ PIX ({{DISCOUNT_PIX}}% de desconto)
- ✅ Cartão de Crédito (até {{INSTALLMENTS}}x)
- ✅ Cartão de Débito
- ✅ Boleto Bancário

### Parcelamento:
- **À vista:** R$ {{CASH_PRICE}} ({{DISCOUNT_PERCENTAGE}}% desconto)
- **Parcelado:** Até {{MAX_INSTALLMENTS}}x de R$ {{INSTALLMENT_VALUE}}

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

### Sobre este Orçamento:

1. **ORÇAMENTO INDICATIVO:** Este documento apresenta valores e procedimentos baseados em uma **simulação prévia e análise preliminar**. Os valores e tratamentos aqui descritos são aproximados e têm caráter informativo.

2. **AVALIAÇÃO PRESENCIAL OBRIGATÓRIA:** Para um orçamento definitivo e preciso, é **INDISPENSÁVEL** a realização de uma **consulta técnica presencial** com avaliação clínica completa, incluindo:
   - Exame clínico detalhado
   - Análise radiográfica (quando necessário)
   - Moldagem e planejamento digital (se aplicável)
   - Avaliação individualizada do caso

3. **POSSÍVEIS VARIAÇÕES:** Os valores finais podem sofrer alterações após a avaliação presencial, considerando:
   - Condições específicas da saúde bucal do paciente
   - Necessidade de tratamentos preparatórios não previstos
   - Escolha de materiais e técnicas após discussão com o dentista
   - Complexidade identificada durante o exame clínico

4. **VALIDADE:** Este orçamento tem validade de {{VALIDITY_DAYS}} dias a partir da data de emissão.

5. **TRATAMENTOS ADICIONAIS:** Procedimentos complementares que se façam necessários após avaliação clínica serão orçados separadamente.

6. **GARANTIA:** Todos os procedimentos realizados em nossa clínica contam com garantia conforme normas do Conselho Federal de Odontologia (CFO).

---

## ACEITAÇÃO DO ORÇAMENTO

Declaro que li e compreendi todas as informações contidas neste orçamento, especialmente as ressalvas sobre sua natureza indicativa e a necessidade de avaliação presencial para confirmação dos valores e procedimentos.

**Data:** ___/___/______

**Assinatura do Paciente:** _________________________________

**Nome do Responsável Técnico:** {{DENTIST_NAME}}
**CRO:** {{DENTIST_CRO}}

---

<div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 0.9em; color: #666;">
  <p>{{CLINIC_NAME}} - {{CLINIC_PHONE}} - {{CLINIC_EMAIL}}</p>
  <p>{{CLINIC_ADDRESS}} - {{CLINIC_CITY}}/{{CLINIC_STATE}} - CEP: {{CLINIC_ZIP_CODE}}</p>
</div>
