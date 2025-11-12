/**
 * Funções auxiliares para geração de PDFs com React-PDF
 * Mapeia dados do Supabase para props dos componentes PDF
 */

import { supabase } from '@/integrations/supabase/client';
import { ClinicInfo, PatientInfo, SimulationImages } from '@/components/pdf/shared/types';

/**
 * Converte uma URL de imagem para base64
 * Necessário porque React-PDF tem problemas com URLs externas (CORS)
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Erro ao converter imagem para base64:', error);
    return ''; // Retorna vazio se falhar
  }
}

/**
 * Busca e formata informações da clínica do usuário logado
 * Cria user_configs automaticamente se não existir
 */
export async function getClinicInfo(): Promise<ClinicInfo> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Buscar configurações do usuário
  let { data: userConfig } = await supabase
    .from('user_configs')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Se não existir, criar com valores padrão
  if (!userConfig) {
    console.log('📝 Criando user_configs para o usuário:', user.id);

    const { data: newConfig, error } = await supabase
      .from('user_configs')
      .insert({
        user_id: user.id,
        user_email: user.email,
        clinic_name: 'Clínica Odontológica',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar user_configs:', error);
      // Continuar com valores padrão
    } else {
      userConfig = newConfig;
    }
  }

  // Se ainda não houver configuração (erro na criação), usar valores padrão
  if (!userConfig) {
    console.warn('⚠️ Usando valores padrão para clínica');
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

  // Converter logo para base64 se existir
  let logoBase64 = '';
  if (userConfig.clinic_logo_url && userConfig.clinic_logo_url.trim() !== '') {
    console.log('🖼️ Convertendo logo da clínica para base64...');
    logoBase64 = await imageUrlToBase64(userConfig.clinic_logo_url);
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
    logoUrl: logoBase64, // Já em base64
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
 * Formata URLs de imagens de simulação e converte para base64
 * Necessário porque React-PDF tem problemas com URLs externas (CORS)
 */
export async function formatSimulationImages(
  beforeUrl?: string | null,
  afterUrl?: string | null
): Promise<SimulationImages | undefined> {
  if (!beforeUrl && !afterUrl) {
    return undefined;
  }

  console.log('🖼️ Convertendo imagens de simulação para base64...');

  // Converter imagens para base64 em paralelo
  const [beforeBase64, afterBase64] = await Promise.all([
    beforeUrl ? imageUrlToBase64(beforeUrl) : Promise.resolve(''),
    afterUrl ? imageUrlToBase64(afterUrl) : Promise.resolve('')
  ]);

  // Se nenhuma das duas conversões funcionou, retornar undefined
  if (!beforeBase64 && !afterBase64) {
    return undefined;
  }

  return {
    beforeUrl: beforeBase64,
    afterUrl: afterBase64
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
