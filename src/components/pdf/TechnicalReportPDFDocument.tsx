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
 * Componente interno: Conteúdo do Relatório
 */
const ReportContent: React.FC<{ reportContent: string; teethCount?: number }> = ({
  reportContent,
  teethCount
}) => {
  // Quebrar o conteúdo em parágrafos (linhas vazias separam parágrafos)
  const paragraphs = reportContent
    .split('\n\n')
    .filter(p => p.trim().length > 0);

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>RELATÓRIO CLÍNICO DETALHADO</Text>

      {teethCount && (
        <View style={{ marginTop: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 9, color: '#6B7280' }}>
            Número de dentes analisados: <Text style={{ fontWeight: 'bold', color: '#1F2937' }}>{teethCount}</Text>
          </Text>
        </View>
      )}

      <View style={{ marginTop: 10 }}>
        {paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            style={{
              fontSize: 9,
              lineHeight: 1.6,
              textAlign: 'justify',
              marginBottom: 8,
              color: '#374151'
            }}
          >
            {paragraph.trim()}
          </Text>
        ))}
      </View>
    </View>
  );
};

/**
 * Componente interno: Página de Disclaimers Legais
 */
const DisclaimersPage: React.FC = () => {
  const disclaimers = [
    'Este relatório é baseado em análise de imagem e tem caráter orientativo',
    'Avaliação clínica presencial é OBRIGATÓRIA antes de qualquer procedimento',
    'Exames complementares podem ser necessários (radiografias, modelos de estudo)',
    'O planejamento definitivo pode variar após avaliação completa do paciente',
    'Este documento não substitui consulta odontológica presencial'
  ];

  return (
    <View>
      <View style={commonStyles.warningBox}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 8, color: '#92400E' }}>
          IMPORTANTE - DISCLAIMER PROFISSIONAL
        </Text>

        {disclaimers.map((disclaimer, index) => (
          <View key={index} style={{ flexDirection: 'row', marginBottom: 5 }}>
            <Text style={{ fontSize: 9, color: '#78350F', marginRight: 5 }}>•</Text>
            <Text style={{ fontSize: 9, color: '#78350F', flex: 1, lineHeight: 1.5 }}>
              {disclaimer}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 10, color: '#1F2937' }}>
          OBSERVAÇÕES TÉCNICAS
        </Text>

        <Text style={{ fontSize: 9, lineHeight: 1.6, textAlign: 'justify', color: '#4B5563', marginBottom: 8 }}>
          A análise foi realizada utilizando inteligência artificial treinada especificamente para
          avaliação de tratamentos estéticos dentários com facetas. Os resultados apresentados
          consideram fatores como simetria, proporção, alinhamento e coloração dentária.
        </Text>

        <Text style={{ fontSize: 9, lineHeight: 1.6, textAlign: 'justify', color: '#4B5563', marginBottom: 8 }}>
          É fundamental que o profissional dentista realize uma avaliação presencial completa,
          incluindo anamnese detalhada, exame clínico, fotografias intraorais e extraorais,
          moldagens quando necessário, e análise radiográfica para confirmar a viabilidade e
          segurança do tratamento proposto.
        </Text>

        <Text style={{ fontSize: 9, lineHeight: 1.6, textAlign: 'justify', color: '#4B5563' }}>
          Este relatório tem função exclusivamente educativa e de planejamento preliminar,
          servindo como ferramenta auxiliar para a comunicação entre profissional e paciente
          sobre as possibilidades de tratamento estético dental.
        </Text>
      </View>
    </View>
  );
};

/**
 * Componente de documento PDF para relatórios técnicos
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

        {/* 4. CONTEÚDO DO RELATÓRIO */}
        <ReportContent
          reportContent={reportContent}
          teethCount={teethCount}
        />

        {/* 5. Rodapé */}
        <PDFFooter
          dentistName={clinicInfo.dentistName}
          cro={clinicInfo.cro}
          additionalText="Relatório gerado automaticamente por Facet.AI | Documento técnico para uso profissional"
        />
      </Page>

      {/* PÁGINA 2: DISCLAIMERS LEGAIS */}
      <Page size="A4" style={commonStyles.page}>
        <DisclaimersPage />

        {/* Rodapé na página de disclaimers */}
        <PDFFooter
          dentistName={clinicInfo.dentistName}
          cro={clinicInfo.cro}
        />
      </Page>
    </Document>
  );
};
