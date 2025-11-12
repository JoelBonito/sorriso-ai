/**
 * Componente de cabeçalho com logomarca e dados da clínica
 * Usado em todos os PDFs (orçamento e relatório técnico)
 */

import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { commonStyles, colors } from './styles';
import { ClinicInfo } from './types';

interface PDFClinicHeaderProps {
  /**
   * Título do documento (ex: "ORÇAMENTO ODONTOLÓGICO" ou "RELATÓRIO TÉCNICO")
   */
  title: string;

  /**
   * Informações da clínica
   */
  clinicInfo: ClinicInfo;
}

/**
 * Renderiza o cabeçalho completo do PDF:
 * - Fundo turquesa TruSmile
 * - Logomarca da clínica (se disponível)
 * - Nome da clínica (se não houver logo)
 * - Título do documento
 * - Dados completos da clínica em box cinza
 */
export const PDFClinicHeader: React.FC<PDFClinicHeaderProps> = ({
  title,
  clinicInfo,
}) => {
  return (
    <>
      {/* Header com fundo turquesa */}
      <View style={commonStyles.headerContainer}>
        {/* Logo da clínica (se disponível) */}
        {clinicInfo.logoUrl && clinicInfo.logoUrl.trim() !== '' ? (
          <Image
            src={clinicInfo.logoUrl}
            style={commonStyles.headerLogo}
          />
        ) : (
          // Fallback: Nome da clínica se não houver logo
          <Text style={commonStyles.headerClinicName}>
            {clinicInfo.name}
          </Text>
        )}

        {/* Título do documento */}
        <Text style={commonStyles.headerTitle}>
          {title}
        </Text>
      </View>

      {/* Dados da clínica em box cinza */}
      <View style={commonStyles.clinicInfoContainer}>
        {/* Linha 1: Nome e CNPJ */}
        <View style={commonStyles.clinicInfoRow}>
          <Text style={commonStyles.clinicInfoLabel}>Clínica:</Text>
          <Text style={commonStyles.clinicInfoValue}>
            {clinicInfo.name}
          </Text>
        </View>

        <View style={commonStyles.clinicInfoRow}>
          <Text style={commonStyles.clinicInfoLabel}>CNPJ:</Text>
          <Text style={commonStyles.clinicInfoValue}>
            {clinicInfo.cnpj || '-'}
          </Text>
        </View>

        {/* Linha 2: Endereço */}
        <View style={commonStyles.clinicInfoRow}>
          <Text style={commonStyles.clinicInfoLabel}>Endereço:</Text>
          <Text style={commonStyles.clinicInfoValue}>
            {clinicInfo.address || '-'}
            {clinicInfo.city && clinicInfo.state && (
              <Text>
                {', '}
                {clinicInfo.city}/{clinicInfo.state}
                {clinicInfo.zipCode && ` - CEP: ${clinicInfo.zipCode}`}
              </Text>
            )}
          </Text>
        </View>

        {/* Linha 3: Contato */}
        <View style={commonStyles.clinicInfoRow}>
          <Text style={commonStyles.clinicInfoLabel}>Telefone:</Text>
          <Text style={commonStyles.clinicInfoValue}>
            {clinicInfo.phone || '-'}
          </Text>
        </View>

        <View style={commonStyles.clinicInfoRow}>
          <Text style={commonStyles.clinicInfoLabel}>E-mail:</Text>
          <Text style={commonStyles.clinicInfoValue}>
            {clinicInfo.email || '-'}
          </Text>
        </View>

        {/* Linha 4: Responsável técnico */}
        <View style={[commonStyles.clinicInfoRow, { marginTop: 5, paddingTop: 5, borderTop: `1 solid ${colors.gray[300]}` }]}>
          <Text style={commonStyles.clinicInfoLabel}>Responsável:</Text>
          <Text style={commonStyles.clinicInfoValue}>
            {clinicInfo.dentistName || '-'}
            {clinicInfo.cro && ` | CRO: ${clinicInfo.cro}`}
          </Text>
        </View>
      </View>
    </>
  );
};
