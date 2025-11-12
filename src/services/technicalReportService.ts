import { supabase } from '@/integrations/supabase/client';
import { generateTechnicalReportPDFBlob } from './pdfGenerators';
import { getClinicInfo, formatSimulationImages } from './pdfHelpers';

export interface TechnicalReportData {
  reportNumber: string;
  patientName: string;
  patientPhone?: string;
  date: Date;
  teethCount: number;
  reportContent: string;
  simulationId?: string;
  beforeImage?: string;
  afterImage?: string;
}

export function generateReportNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `REL-${year}${month}-${random}`;
}

/**
 * Gera relatório técnico usando React-PDF no frontend
 * @param data - Dados do relatório técnico
 * @returns URL do PDF gerado
 */
export async function generateTechnicalReportPDF(data: TechnicalReportData): Promise<string> {
  console.log('📄 Gerando relatório técnico com React-PDF...');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // 1. Buscar informações da clínica
  const clinicInfo = await getClinicInfo();

  // 2. Preparar dados do paciente
  const patientInfo = {
    name: data.patientName,
    cpf: '-',
    phone: data.patientPhone || '-',
    email: '-'
  };

  // 3. Preparar imagens de simulação (se disponível)
  const simulationImages = formatSimulationImages(
    data.beforeImage,
    data.afterImage
  );

  // 4. Gerar PDF com React-PDF
  console.log('🎨 Renderizando PDF com React-PDF...');
  const blob = await generateTechnicalReportPDFBlob({
    clinicInfo,
    patientInfo,
    simulationImages,
    date: data.date,
    reportNumber: data.reportNumber,
    reportContent: data.reportContent,
    teethCount: data.teethCount
  });

  console.log('✅ PDF gerado, tamanho:', (blob.size / 1024).toFixed(2), 'KB');

  // 5. Upload para Supabase Storage
  const fileName = `${user.id}/technical-report-${data.reportNumber}.pdf`;

  console.log('📤 Fazendo upload do PDF para:', fileName);
  const { error: uploadError } = await supabase.storage
    .from('technical-reports')
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    console.error('❌ Erro ao fazer upload do PDF:', uploadError);
    throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
  }

  // 6. Obter URL pública
  const { data: urlData } = supabase.storage
    .from('technical-reports')
    .getPublicUrl(fileName);

  const publicUrl = urlData.publicUrl;
  console.log('✅ PDF disponível em:', publicUrl);

  return publicUrl;
}


export async function saveTechnicalReportToSimulation(
  simulationId: string,
  reportUrl: string,
  reportNumber: string
): Promise<void> {
  const { error } = await supabase
    .from('simulations')
    .update({
      technical_report_url: reportUrl,
      technical_notes: reportNumber
    })
    .eq('id', simulationId);
  
  if (error) {
    console.error('Erro ao salvar relatório na simulação:', error);
    throw error;
  }
}
