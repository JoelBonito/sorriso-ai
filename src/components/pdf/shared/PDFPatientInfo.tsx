/**
 * Componente de informações do paciente
 * Usado em todos os PDFs (orçamento e relatório técnico)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { commonStyles } from './styles';
import { PatientInfo } from './types';

interface PDFPatientInfoProps {
  /**
   * Informações do paciente
   */
  patientInfo: PatientInfo;

  /**
   * Data do documento (emissão do orçamento ou relatório)
   */
  date: Date;

  /**
   * Número do documento (opcional - ex: "ORCAM-202511-1234")
   */
  documentNumber?: string;
}

/**
 * Formata CPF no padrão XXX.XXX.XXX-XX
 */
function formatCPF(cpf: string | undefined): string {
  if (!cpf) return '-';

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  return cpf;
}

/**
 * Formata data no padrão brasileiro (dd/MM/yyyy)
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

/**
 * Renderiza seção com dados do paciente:
 * - Nome
 * - CPF (se disponível)
 * - Telefone (se disponível)
 * - Data do documento
 * - Número do documento (se disponível)
 */
export const PDFPatientInfo: React.FC<PDFPatientInfoProps> = ({
  patientInfo,
  date,
  documentNumber,
}) => {
  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>DADOS DO PACIENTE</Text>

      <View style={commonStyles.patientInfoContainer}>
        {/* Nome do paciente */}
        <View style={commonStyles.patientInfoRow}>
          <Text style={commonStyles.patientInfoLabel}>Nome:</Text>
          <Text style={commonStyles.patientInfoValue}>
            {patientInfo.name}
          </Text>
        </View>

        {/* CPF (se disponível) */}
        {patientInfo.cpf && (
          <View style={commonStyles.patientInfoRow}>
            <Text style={commonStyles.patientInfoLabel}>CPF:</Text>
            <Text style={commonStyles.patientInfoValue}>
              {formatCPF(patientInfo.cpf)}
            </Text>
          </View>
        )}

        {/* Telefone (se disponível) */}
        {patientInfo.phone && (
          <View style={commonStyles.patientInfoRow}>
            <Text style={commonStyles.patientInfoLabel}>Telefone:</Text>
            <Text style={commonStyles.patientInfoValue}>
              {patientInfo.phone}
            </Text>
          </View>
        )}

        {/* Email (se disponível) */}
        {patientInfo.email && (
          <View style={commonStyles.patientInfoRow}>
            <Text style={commonStyles.patientInfoLabel}>E-mail:</Text>
            <Text style={commonStyles.patientInfoValue}>
              {patientInfo.email}
            </Text>
          </View>
        )}

        {/* Data do documento */}
        <View style={[commonStyles.patientInfoRow, { marginTop: 5 }]}>
          <Text style={commonStyles.patientInfoLabel}>Data:</Text>
          <Text style={commonStyles.patientInfoValue}>
            {formatDate(date)}
          </Text>
        </View>

        {/* Número do documento (se disponível) */}
        {documentNumber && (
          <View style={commonStyles.patientInfoRow}>
            <Text style={commonStyles.patientInfoLabel}>Documento:</Text>
            <Text style={commonStyles.patientInfoValue}>
              {documentNumber}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
