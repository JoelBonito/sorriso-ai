/**
 * Componente de rodapé do PDF
 * Usado em todos os PDFs (orçamento e relatório técnico)
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { commonStyles } from './styles';

interface PDFFooterProps {
  /**
   * Nome do responsável técnico
   */
  dentistName: string;

  /**
   * Número do CRO
   */
  cro: string;

  /**
   * Texto adicional no rodapé (opcional)
   * @default "Documento gerado automaticamente por Facet.AI"
   */
  additionalText?: string;
}

/**
 * Renderiza o rodapé do PDF:
 * - Linha superior com responsável técnico e CRO
 * - Linha inferior com texto de geração automática
 * - Posicionamento fixo na parte inferior da página
 */
export const PDFFooter: React.FC<PDFFooterProps> = ({
  dentistName,
  cro,
  additionalText = 'Documento gerado automaticamente por Facet.AI',
}) => {
  return (
    <View style={commonStyles.footerContainer} fixed>
      {/* Responsável técnico */}
      <Text style={commonStyles.footerResponsible}>
        Responsável Técnico: {dentistName || '-'} | CRO: {cro || '-'}
      </Text>

      {/* Texto de geração automática */}
      <Text style={commonStyles.footerText}>
        {additionalText}
      </Text>
    </View>
  );
};
