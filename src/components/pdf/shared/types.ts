/**
 * Interfaces compartilhadas para geração de PDFs
 * Usadas por BudgetPDFDocument e TechnicalReportPDFDocument
 */

/**
 * Informações da clínica odontológica
 * Obtidas da tabela user_configs
 */
export interface ClinicInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  zipCode: string;
  city: string;
  state: string;
  dentistName: string;
  cro: string;
}

/**
 * Informações do paciente
 * Obtidas da tabela patients
 */
export interface PatientInfo {
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
}

/**
 * Imagens da simulação (antes/depois)
 * Obtidas da tabela simulations
 */
export interface SimulationImages {
  beforeImageUrl?: string;
  afterImageUrl?: string;
}

/**
 * Props compartilhadas entre todos os documentos PDF
 */
export interface BasePDFProps {
  clinicInfo: ClinicInfo;
  patientInfo: PatientInfo;
  simulationImages?: SimulationImages;
  date: Date;
}
