/**
 * Exports centralizados dos componentes PDF
 * Facilita importações no código
 */

// Documentos principais
export { BudgetPDFDocument } from './BudgetPDFDocument';
export type { BudgetPDFProps, BudgetItem, PaymentConditions } from './BudgetPDFDocument';

export { TechnicalReportPDFDocument } from './TechnicalReportPDFDocument';
export type { TechnicalReportPDFProps } from './TechnicalReportPDFDocument';

// Componentes compartilhados
export { PDFClinicHeader } from './shared/PDFClinicHeader';
export { PDFPatientInfo } from './shared/PDFPatientInfo';
export { PDFSimulationImages } from './shared/PDFSimulationImages';
export { PDFFooter } from './shared/PDFFooter';

// Estilos e tipos
export { commonStyles, tableStyles, colors } from './shared/styles';
export type { ClinicInfo, PatientInfo, SimulationImages, BasePDFProps } from './shared/types';
