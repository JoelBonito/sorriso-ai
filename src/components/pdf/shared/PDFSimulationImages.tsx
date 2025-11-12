/**
 * Componente de imagens da simulação (antes/depois)
 * Usado em todos os PDFs (orçamento e relatório técnico)
 */

import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { commonStyles } from './styles';
import { SimulationImages } from './types';

interface PDFSimulationImagesProps {
  /**
   * URLs das imagens da simulação
   */
  simulationImages: SimulationImages;

  /**
   * Título da seção (opcional)
   * @default "SIMULAÇÃO DO TRATAMENTO"
   */
  title?: string;

  /**
   * Mostrar bordas nas imagens
   * @default true
   */
  showBorders?: boolean;
}

/**
 * Renderiza as imagens antes/depois da simulação lado a lado:
 * - Imagem "ANTES" à esquerda
 * - Imagem "DEPOIS" à direita
 * - Labels acima de cada imagem
 * - Bordas opcionais
 *
 * Se as imagens não estiverem disponíveis, não renderiza nada
 */
export const PDFSimulationImages: React.FC<PDFSimulationImagesProps> = ({
  simulationImages,
  title = 'SIMULAÇÃO DO TRATAMENTO',
  showBorders = true,
}) => {
  // Não renderizar se não houver imagens
  const hasBeforeImage = simulationImages.beforeImageUrl && simulationImages.beforeImageUrl.trim() !== '';
  const hasAfterImage = simulationImages.afterImageUrl && simulationImages.afterImageUrl.trim() !== '';

  if (!hasBeforeImage && !hasAfterImage) {
    return null;
  }

  return (
    <View style={commonStyles.simulationContainer}>
      {/* Título da seção */}
      <Text style={commonStyles.simulationTitle}>
        {title}
      </Text>

      {/* Imagens lado a lado */}
      <View style={commonStyles.simulationImagesRow}>
        {/* Imagem ANTES */}
        {hasBeforeImage && (
          <View style={commonStyles.simulationImageContainer}>
            <Text style={commonStyles.simulationImageLabel}>
              ANTES
            </Text>
            <Image
              src={simulationImages.beforeImageUrl!}
              style={[
                commonStyles.simulationImage,
                !showBorders && { border: 'none' },
              ]}
            />
          </View>
        )}

        {/* Imagem DEPOIS */}
        {hasAfterImage && (
          <View style={commonStyles.simulationImageContainer}>
            <Text style={commonStyles.simulationImageLabel}>
              DEPOIS
            </Text>
            <Image
              src={simulationImages.afterImageUrl!}
              style={[
                commonStyles.simulationImage,
                !showBorders && { border: 'none' },
              ]}
            />
          </View>
        )}
      </View>

      {/* Nota: Se houver apenas uma imagem, ela ocupará todo o espaço disponível */}
      {(hasBeforeImage && !hasAfterImage) || (!hasBeforeImage && hasAfterImage) ? (
        <Text style={{ fontSize: 8, textAlign: 'center', marginTop: 5, color: '#6B7280' }}>
          * Apenas {hasBeforeImage ? 'imagem inicial' : 'imagem processada'} disponível
        </Text>
      ) : null}
    </View>
  );
};
