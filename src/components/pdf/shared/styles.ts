/**
 * Estilos compartilhados para PDFs
 * Usando @react-pdf/renderer StyleSheet
 */

import { StyleSheet, Font } from '@react-pdf/renderer';

/**
 * Cores do tema TruSmile
 */
export const colors = {
  // Cor principal TruSmile (turquesa)
  primary: '#47C4D8',
  primaryDark: '#3AA8BA',

  // Cores neutras
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Cores de status
  success: '#22C55E',
  warning: '#FBB020',
  warningLight: '#FEF3C7',
  error: '#EF4444',

  // Cores específicas
  blue: '#2563EB',
  blueLight: '#EFF6FF',
};

/**
 * Estilos compartilhados para todos os documentos PDF
 */
export const commonStyles = StyleSheet.create({
  // Página
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.gray[800],
    backgroundColor: colors.white,
  },

  // Header principal (logo + dados da clínica)
  headerContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    marginTop: -30,
    marginLeft: -30,
    marginRight: -30,
    marginBottom: 20,
  },

  headerLogo: {
    width: 70,
    height: 'auto',
    maxHeight: 30,
    alignSelf: 'center',
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  headerClinicName: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },

  // Seções
  section: {
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.gray[800],
    marginBottom: 5,
    paddingBottom: 3,
    borderBottom: `2 solid ${colors.primary}`,
  },

  sectionContent: {
    marginTop: 5,
  },

  // Dados da clínica
  clinicInfoContainer: {
    backgroundColor: colors.gray[50],
    padding: 12,
    marginBottom: 15,
    borderRadius: 4,
  },

  clinicInfoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  clinicInfoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.gray[600],
    width: 80,
  },

  clinicInfoValue: {
    fontSize: 9,
    color: colors.gray[800],
    flex: 1,
  },

  // Dados do paciente
  patientInfoContainer: {
    marginBottom: 15,
  },

  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },

  patientInfoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.gray[600],
    width: 60,
  },

  patientInfoValue: {
    fontSize: 9,
    color: colors.gray[800],
    flex: 1,
  },

  // Imagens de simulação (antes/depois)
  simulationContainer: {
    marginBottom: 20,
    marginTop: 10,
  },

  simulationTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: colors.gray[800],
  },

  simulationImagesRow: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'space-between',
  },

  simulationImageContainer: {
    flex: 1,
    alignItems: 'center',
  },

  simulationImageLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.gray[700],
    marginBottom: 5,
    textAlign: 'center',
  },

  simulationImage: {
    width: '100%',
    height: 'auto',
    maxHeight: 200,
    objectFit: 'contain',
    border: `1 solid ${colors.gray[300]}`,
  },

  // Footer
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    paddingTop: 10,
    borderTop: `1 solid ${colors.gray[300]}`,
  },

  footerText: {
    fontSize: 8,
    color: colors.gray[500],
    textAlign: 'center',
  },

  footerResponsible: {
    fontSize: 8,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 3,
  },

  // Utilitários
  row: {
    flexDirection: 'row',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  alignCenter: {
    alignItems: 'center',
  },

  textCenter: {
    textAlign: 'center',
  },

  textBold: {
    fontWeight: 'bold',
  },

  // Divisor
  divider: {
    borderTop: `1 solid ${colors.gray[300]}`,
    marginVertical: 10,
  },

  // Box de destaque
  highlightBox: {
    backgroundColor: colors.blueLight,
    padding: 10,
    marginVertical: 10,
    borderLeft: `3 solid ${colors.blue}`,
  },

  warningBox: {
    backgroundColor: colors.warningLight,
    padding: 10,
    marginVertical: 10,
    border: `1 solid ${colors.warning}`,
  },
});

/**
 * Estilos específicos para tabelas
 */
export const tableStyles = StyleSheet.create({
  table: {
    marginVertical: 10,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: 5,
  },

  tableHeader: {
    backgroundColor: colors.gray[100],
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    fontWeight: 'bold',
  },

  tableCell: {
    flex: 1,
    fontSize: 9,
    padding: 4,
  },

  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.gray[700],
  },

  tableCellCenter: {
    textAlign: 'center',
  },

  tableCellRight: {
    textAlign: 'right',
  },
});
