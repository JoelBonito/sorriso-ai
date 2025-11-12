/**
 * Documento PDF de Relatório Técnico
 *
 * Estrutura:
 * 1. Logomarca da clínica
 * 2. Dados da clínica
 * 3. Dados do paciente
 * 4. Simulação (antes/depois)
 * 5. Conteúdo do relatório técnico (texto descritivo)
 * 6. Disclaimers legais
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
 * Props do documento de relatório técnico
 */
export interface TechnicalReportPDFProps extends BasePDFProps {
  /**
   * Número do relatório (ex: "REL-202511-123")
   */
  reportNumber: string;

  /**
   * Conteúdo do relatório técnico (texto descritivo da análise)
   */
  reportContent: string;

  /**
   * Número de dentes analisados (opcional)
   */
  teethCount?: number;
}

/**
 * Componente de documento PDF para relatórios técnicos
 *
 * NOTA: Esta é a versão STUB - implementação completa será feita na Fase 3
 * Por enquanto, apenas mostra a estrutura básica com os componentes compartilhados
 */
export const TechnicalReportPDFDocument: React.FC<TechnicalReportPDFProps> = ({
  clinicInfo,
  patientInfo,
  simulationImages,
  date,
  reportNumber,
  reportContent,
  teethCount,
}) => {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        {/* 1. Header com logo e dados da clínica */}
        <PDFClinicHeader
          title="RELATÓRIO TÉCNICO DE FACETAS DENTÁRIAS"
          clinicInfo={clinicInfo}
        />

        {/* 2. Dados do paciente */}
        <PDFPatientInfo
          patientInfo={patientInfo}
          date={date}
          documentNumber={reportNumber}
        />

        {/* 3. Simulação (antes/depois) - se disponível */}
        {simulationImages && (
          <PDFSimulationImages
            simulationImages={simulationImages}
            title="ANÁLISE VISUAL COMPARATIVA"
          />
        )}

        {/* 4. CONTEÚDO DO RELATÓRIO - será implementado na Fase 3 */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>RELATÓRIO CLÍNICO DETALHADO</Text>
          <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 10 }}>
            [CONTEÚDO DO RELATÓRIO - será implementado na Fase 3]
          </Text>
          <Text style={{ fontSize: 8, marginTop: 5 }}>
            Dentes analisados: {teethCount || 'N/A'}
          </Text>
          <Text style={{ fontSize: 8, marginTop: 3 }}>
            Tamanho do conteúdo: {reportContent.length} caracteres
          </Text>
        </View>

        {/* 5. Rodapé */}
        <PDFFooter
          dentistName={clinicInfo.dentistName}
          cro={clinicInfo.cro}
          additionalText="Relatório gerado automaticamente por Facet.AI | Documento técnico para uso profissional"
        />
      </Page>

      {/* PÁGINA 2: DISCLAIMERS - será implementado na Fase 3 */}
      <Page size="A4" style={commonStyles.page}>
        <View style={commonStyles.warningBox}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8 }}>
            IMPORTANTE - DISCLAIMER PROFISSIONAL
          </Text>
          <Text style={{ fontSize: 8 }}>
            [DISCLAIMERS LEGAIS - será implementado na Fase 3]
          </Text>
        </View>
      </Page>
    </Document>
  );
};
