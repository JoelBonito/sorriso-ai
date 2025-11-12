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
import { commonStyles, tableStyles } from './shared/styles';
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
 * Componente interno: Tabela de Procedimentos
 */
const ProceduresTable: React.FC<{ items: BudgetItem[] }> = ({ items }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>PROCEDIMENTOS PROPOSTOS</Text>

      <View style={tableStyles.table}>
        {/* Cabeçalho da tabela */}
        <View style={[tableStyles.tableRow, tableStyles.tableHeader]}>
          <Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, { flex: 3 }]}>
            Procedimento
          </Text>
          <Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, tableStyles.tableCellCenter, { flex: 1 }]}>
            Dentes
          </Text>
          <Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, tableStyles.tableCellCenter, { flex: 0.8 }]}>
            Qtd
          </Text>
          <Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, tableStyles.tableCellRight, { flex: 1.5 }]}>
            Valor Unit.
          </Text>
          <Text style={[tableStyles.tableCell, tableStyles.tableCellHeader, tableStyles.tableCellRight, { flex: 1.5 }]}>
            Total
          </Text>
        </View>

        {/* Linhas de procedimentos */}
        {items.map((item, index) => (
          <View key={index} style={tableStyles.tableRow}>
            <Text style={[tableStyles.tableCell, { flex: 3 }]}>
              {item.servico}
            </Text>
            <Text style={[tableStyles.tableCell, tableStyles.tableCellCenter, { flex: 1 }]}>
              {item.dentes || '-'}
            </Text>
            <Text style={[tableStyles.tableCell, tableStyles.tableCellCenter, { flex: 0.8 }]}>
              {item.quantidade}
            </Text>
            <Text style={[tableStyles.tableCell, tableStyles.tableCellRight, { flex: 1.5 }]}>
              R$ {formatCurrency(item.valor_unitario)}
            </Text>
            <Text style={[tableStyles.tableCell, tableStyles.tableCellRight, { flex: 1.5 }]}>
              R$ {formatCurrency(item.valor_total)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Componente interno: Resumo Financeiro
 */
const FinancialSummary: React.FC<{
  subtotal: number;
  discount: number;
  total: number;
}> = ({ subtotal, discount, total }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>RESUMO FINANCEIRO</Text>

      <View style={{ marginTop: 10 }}>
        {/* Subtotal */}
        <View style={[commonStyles.row, commonStyles.spaceBetween, { marginBottom: 6 }]}>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>Subtotal:</Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
            R$ {formatCurrency(subtotal)}
          </Text>
        </View>

        {/* Desconto (se houver) */}
        {discount > 0 && (
          <View style={[commonStyles.row, commonStyles.spaceBetween, { marginBottom: 6 }]}>
            <Text style={{ fontSize: 10, color: '#6B7280' }}>Desconto:</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#22C55E' }}>
              - R$ {formatCurrency(discount)}
            </Text>
          </View>
        )}

        {/* Divisor */}
        <View style={commonStyles.divider} />

        {/* Total */}
        <View style={[commonStyles.row, commonStyles.spaceBetween]}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#1F2937' }}>
            VALOR TOTAL:
          </Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#47C4D8' }}>
            R$ {formatCurrency(total)}
          </Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Componente interno: Condições de Pagamento
 */
const PaymentConditionsSection: React.FC<{
  paymentConditions: PaymentConditions;
}> = ({ paymentConditions }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>CONDIÇÕES DE PAGAMENTO</Text>

      <View style={{ marginTop: 10 }}>
        {/* Formas de pagamento */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 9, color: '#4B5563', fontWeight: 'bold', marginBottom: 5 }}>
            Formas de Pagamento:
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Text style={{ fontSize: 9, color: '#6B7280' }}>
              • Dinheiro ({paymentConditions.discountCash}% desconto)
            </Text>
            <Text style={{ fontSize: 9, color: '#6B7280' }}>
              • PIX ({paymentConditions.discountPix}% desconto)
            </Text>
            <Text style={{ fontSize: 9, color: '#6B7280' }}>
              • Cartão (até {paymentConditions.maxInstallments}x)
            </Text>
          </View>
        </View>

        {/* Valores */}
        <View style={commonStyles.highlightBox}>
          <View style={[commonStyles.row, commonStyles.spaceBetween, { marginBottom: 6 }]}>
            <Text style={{ fontSize: 10, color: '#1F2937' }}>
              À vista (Dinheiro/PIX):
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#22C55E' }}>
              R$ {formatCurrency(paymentConditions.cashPrice)}
            </Text>
          </View>

          <View style={[commonStyles.row, commonStyles.spaceBetween]}>
            <Text style={{ fontSize: 10, color: '#1F2937' }}>
              Parcelado em {paymentConditions.maxInstallments}x:
            </Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2563EB' }}>
              {paymentConditions.maxInstallments}x de R$ {formatCurrency(paymentConditions.installmentValue)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * Componente de documento PDF para orçamentos
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

        {/* 4. TABELA DE PROCEDIMENTOS */}
        <ProceduresTable items={items} />

        {/* 5. RESUMO FINANCEIRO */}
        <FinancialSummary
          subtotal={subtotal}
          discount={discount}
          total={total}
        />

        {/* 6. CONDIÇÕES DE PAGAMENTO */}
        <PaymentConditionsSection paymentConditions={paymentConditions} />

        {/* 7. Rodapé */}
        <PDFFooter
          dentistName={clinicInfo.dentistName}
          cro={clinicInfo.cro}
        />
      </Page>
    </Document>
  );
};
