/**
 * Funções geradoras de PDF com React-PDF
 * Arquivo .tsx para permitir sintaxe JSX
 */

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { BudgetPDFDocument, BudgetItem, PaymentConditions, BudgetPDFProps } from '@/components/pdf/BudgetPDFDocument';
import { TechnicalReportPDFDocument, TechnicalReportPDFProps } from '@/components/pdf/TechnicalReportPDFDocument';

/**
 * Gera blob do PDF de orçamento
 */
export async function generateBudgetPDFBlob(props: BudgetPDFProps): Promise<Blob> {
  return await pdf(<BudgetPDFDocument {...props} />).toBlob();
}

/**
 * Gera blob do PDF de relatório técnico
 */
export async function generateTechnicalReportPDFBlob(props: TechnicalReportPDFProps): Promise<Blob> {
  return await pdf(<TechnicalReportPDFDocument {...props} />).toBlob();
}

// Re-export types para facilitar uso
export type { BudgetPDFProps, TechnicalReportPDFProps, BudgetItem, PaymentConditions };
