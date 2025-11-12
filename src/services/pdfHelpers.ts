/**
 * Funções auxiliares para geração de PDFs com React-PDF
 * Mapeia dados do Supabase para props dos componentes PDF
 */

import { supabase } from '@/integrations/supabase/client';
import { ClinicInfo, PatientInfo, SimulationImages } from '@/components/pdf/shared/types';

/**
 * Busca e formata informações da clínica do usuário logado
 */
export async function getClinicInfo(): Promise<ClinicInfo> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Buscar configurações do usuário
  const { data: userConfig } = await supabase
    .from('user_configs')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Retornar valores padrão se não houver configuração
  if (!userConfig) {
    console.warn('⚠️ user_configs não encontrado, usando valores padrão');
    return {
      name: 'Clínica Odontológica',
      cnpj: '-',
      address: '-',
      phone: '-',
      email: '-',
      zipCode: '-',
      city: '-',
      state: '-',
      logoUrl: '',
      dentistName: 'Dentista Responsável',
      cro: '-'
    };
  }

  return {
    name: userConfig.clinic_name || 'Clínica Odontológica',
    cnpj: userConfig.clinic_cnpj || '-',
    address: userConfig.clinic_address || '-',
    phone: userConfig.clinic_phone || '-',
    email: userConfig.clinic_email || '-',
    zipCode: userConfig.clinic_zip_code || '-',
    city: userConfig.clinic_city || '-',
    state: userConfig.clinic_state || '-',
    logoUrl: userConfig.clinic_logo_url || '',
    dentistName: userConfig.clinic_dentist_name || 'Dentista Responsável',
    cro: userConfig.clinic_cro || '-'
  };
}

/**
 * Formata informações do paciente
 */
export function formatPatientInfo(patient: any): PatientInfo {
  return {
    name: patient?.name || 'Paciente',
    cpf: patient?.cpf || '-',
    phone: patient?.phone || '-',
    email: patient?.email || '-'
  };
}

/**
 * Formata URLs de imagens de simulação
 */
export function formatSimulationImages(
  beforeUrl?: string | null,
  afterUrl?: string | null
): SimulationImages | undefined {
  if (!beforeUrl || !afterUrl) {
    return undefined;
  }

  return {
    beforeUrl,
    afterUrl
  };
}

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '-';

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  return cpf;
}

/**
 * Formata número de telefone para exibição ((XX) XXXXX-XXXX)
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}
