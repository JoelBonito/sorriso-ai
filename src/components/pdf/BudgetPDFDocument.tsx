/**
 * Documento PDF de Orçamento Odontológico
 *
 * Estrutura:
 * 1. Logomarca da clínica
 * 2. Dados da clínica
 * 3. Dados do paciente
 * 4. Simulação (antes/depois)
 * 5. Tabela de procedimentos e valores
 * 6. Condições de pagamento
 * 7. Rodapé com responsável técnico
 */

import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { PDFClinicHeader } from './shared/PDFClinicHeader';
import { PDFPatientInfo } from './shared/PDFPatientInfo';
import { PDFSimulationImages } from './shared/PDFSimulationImages';
import { PDFFooter } from './shared/PDFFooter';
import { commonStyles } from './shared/styles';
import { BasePDFProps } from './shared/types';

/**
 * Item de procedimento no orçamento
 */
export interface BudgetItem {
  servico: string;
  dentes?: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

/**
 * Condições de pagamento
 */
export interface PaymentConditions {
  discountCash: number; // Percentual
  discountPix: number; // Percentual
  maxInstallments: number;
  installmentValue: number; // Valor de cada parcela
  cashPrice: number; // Preço à vista com desconto
}

/**
 * Props do documento de orçamento
 */
export interface BudgetPDFProps extends BasePDFProps {
  /**
   * Número do orçamento (ex: "ORCAM-202511-1234")
   */
  budgetNumber: string;

  /**
   * Lista de procedimentos
   */
  items: BudgetItem[];

  /**
   * Valores totais
   */
  subtotal: number;
  discount: number;
  total: number;

  /**
   * Condições de pagamento
   */
  paymentConditions: PaymentConditions;
}

/**
 * Componente de documento PDF para orçamentos
 *
 * NOTA: Esta é a versão STUB - implementação completa será feita na Fase 2
 * Por enquanto, apenas mostra a estrutura básica com os componentes compartilhados
 */
export const BudgetPDFDocument: React.FC<BudgetPDFProps> = ({
  clinicInfo,
  patientInfo,
  simulationImages,
  date,
  budgetNumber,
  items,
  subtotal,
  discount,
  total,
  paymentConditions,
}) => {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        {/* 1. Header com logo e dados da clínica */}
        <PDFClinicHeader
          title="ORÇAMENTO ODONTOLÓGICO"
          clinicInfo={clinicInfo}
        />

        {/* 2. Dados do paciente */}
        <PDFPatientInfo
          patientInfo={patientInfo}
          date={date}
          documentNumber={budgetNumber}
        />

        {/* 3. Simulação (antes/depois) - se disponível */}
        {simulationImages && (
          <PDFSimulationImages
            simulationImages={simulationImages}
            title="SIMULAÇÃO DO TRATAMENTO"
          />
        )}

        {/* 4. TABELA DE PROCEDIMENTOS - será implementado na Fase 2 */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>PROCEDIMENTOS PROPOSTOS</Text>
          <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 10 }}>
            [TABELA DE PROCEDIMENTOS - será implementada na Fase 2]
          </Text>
          <Text style={{ fontSize: 8, marginTop: 5 }}>
            Items: {items.length} | Subtotal: R$ {subtotal.toFixed(2)} | Total: R$ {total.toFixed(2)}
          </Text>
        </View>

        {/* 5. CONDIÇÕES DE PAGAMENTO - será implementado na Fase 2 */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>CONDIÇÕES DE PAGAMENTO</Text>
          <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 10 }}>
            [CONDIÇÕES DE PAGAMENTO - será implementada na Fase 2]
          </Text>
        </View>

        {/* 6. Rodapé */}
        <PDFFooter
          dentistName={clinicInfo.dentistName}
          cro={clinicInfo.cro}
        />
      </Page>
    </Document>
  );
};
