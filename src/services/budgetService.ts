import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { notifyBudgetStatusChanged } from './notificationService';
import { generateBudgetPDFBlob, BudgetItem, PaymentConditions } from './pdfGenerators';
import { getClinicInfo, formatPatientInfo, formatSimulationImages } from './pdfHelpers';

/**
 * Gera número único de orçamento no formato ORCAM-YYYYMM-XXXX
 */
export function generateBudgetNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `ORCAM-${year}${month}-${random}`;
}

// FASE 3: Definir type union explícito para BudgetStatus
export type BudgetStatus = 
  | 'pending' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'rejected' 
  | 'expired' 
  | 'archived';

export interface Budget {
  id: string;
  created_at: string;
  updated_at: string;
  budget_number: string;
  patient_id: string | null;
  simulation_id: string | null;
  lead_id?: string | null;
  teeth_count: number;
  price_per_tooth: number;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  final_price: number;
  payment_conditions: any;
  valid_until: string | null;
  status: BudgetStatus;
  pdf_url: string | null;
  user_id: string;
  budget_type?: 'automatic' | 'manual';
  treatment_type: 'facetas' | 'clareamento';
  items?: any[];
  simulation_count?: number;
  patient?: {
    name: string;
    phone: string;
  };
  simulation?: any;
}

export interface CreateBudgetData {
  budget_number: string;
  patient_id?: string;
  simulation_id?: string;
  teeth_count: number;
  price_per_tooth?: number;
  subtotal: number;
  discount_percentage?: number;
  discount_amount?: number;
  final_price: number;
  payment_conditions?: any;
  valid_until?: Date;
  pdf_url?: string;
  status?: BudgetStatus;
  budget_type?: 'automatic' | 'manual';
  treatment_type?: 'facetas' | 'clareamento';
  items?: any[];
}

export interface BudgetFilters {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export async function getAllBudgets(filters?: BudgetFilters): Promise<Budget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('budgets')
    .select(`
      *,
      patient:patients(name, phone)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Aplicar filtros
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom.toISOString());
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo.toISOString());
  }

  if (filters?.search) {
    query = query.or(
      `budget_number.ilike.%${filters.search}%,patient.name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erro ao buscar orçamentos:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      filters
    });
    throw error;
  }

  // Count simulations for each budget
  const budgetsWithCounts = await Promise.all(
    (data || []).map(async (budget) => {
      if (budget.patient_id && budget.treatment_type) {
        const { count } = await supabase
          .from('simulations')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', budget.patient_id)
          .eq('treatment_type', budget.treatment_type)
          .eq('status', 'completed');
        
        return { 
          ...budget,
          simulation_count: count || 0,
          patient: (budget.patient as any) || null,
          status: budget.status as Budget['status'],
          budget_type: (budget.budget_type as 'automatic' | 'manual') || 'automatic',
          treatment_type: (budget.treatment_type as 'facetas' | 'clareamento') || 'facetas',
          items: Array.isArray(budget.items) ? budget.items : (budget.items ? [budget.items] : [])
        };
      }
      return { 
        ...budget,
        simulation_count: 0,
        patient: (budget.patient as any) || null,
        status: budget.status as Budget['status'],
        budget_type: (budget.budget_type as 'automatic' | 'manual') || 'automatic',
        treatment_type: (budget.treatment_type as 'facetas' | 'clareamento') || 'facetas',
        items: Array.isArray(budget.items) ? budget.items : (budget.items ? [budget.items] : [])
      };
    })
  );

  return budgetsWithCounts;
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      patient:patients(name, phone, email),
      simulation:simulations(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar orçamento por ID:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      budgetId: id
    });
    throw error;
  }
  if (!data) return null;

  return {
    ...data,
    patient: data.patient?.[0] || null,
    simulation: data.simulation?.[0] || null,
    status: data.status as Budget['status'],
    budget_type: (data.budget_type as 'automatic' | 'manual') || 'automatic',
    treatment_type: (data.treatment_type as 'facetas' | 'clareamento') || 'facetas',
    items: Array.isArray(data.items) ? data.items : (data.items ? [data.items] : [])
  };
}

export async function createBudget(budgetData: CreateBudgetData): Promise<Budget> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .insert([
      {
        ...budgetData,
        user_id: user.id,
        valid_until: budgetData.valid_until 
          ? budgetData.valid_until.toISOString().split('T')[0]
          : addDays(new Date(), 30).toISOString().split('T')[0],
        status: budgetData.status || 'pending'
      }
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao criar orçamento:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
  if (!data) throw new Error('Falha ao criar orçamento');
  return {
    ...data,
    status: data.status as Budget['status'],
    budget_type: (data.budget_type as 'automatic' | 'manual') || 'automatic',
    treatment_type: (data.treatment_type as 'facetas' | 'clareamento') || 'facetas',
    items: Array.isArray(data.items) ? data.items : (data.items ? [data.items] : [])
  };
}

export async function updateBudgetStatus(
  id: string,
  status: Budget['status']
): Promise<Budget> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Buscar orçamento com informações do paciente antes de atualizar
  const { data: budgetBefore } = await supabase
    .from('budgets')
    .select(`
      *,
      patient:patients(name)
    `)
    .eq('id', id)
    .maybeSingle();

  const { data, error } = await supabase
    .from('budgets')
    .update({ status })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao atualizar status do orçamento:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      budgetId: id,
      newStatus: status
    });
    throw error;
  }
  if (!data) throw new Error('Orçamento não encontrado');

  // Criar notificação persistente quando orçamento é aceito ou rejeitado
  if ((status === 'accepted' || status === 'rejected') && budgetBefore) {
    const patientData = budgetBefore.patient as any;
    const patientName = patientData?.[0]?.name || patientData?.name;

    await notifyBudgetStatusChanged(
      user.id,
      budgetBefore.budget_number,
      id,
      status,
      patientName
    );
  }

  return {
    ...data,
    status: data.status as Budget['status'],
    budget_type: (data.budget_type as 'automatic' | 'manual') || 'automatic',
    treatment_type: (data.treatment_type as 'facetas' | 'clareamento') || 'facetas',
    items: Array.isArray(data.items) ? data.items : (data.items ? [data.items] : [])
  };
}

export async function searchBudgets(query: string): Promise<Budget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      patient:patients(name, phone)
    `)
    .eq('user_id', user.id)
    .or(`budget_number.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar orçamentos:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      query
    });
    throw error;
  }

  return (data || []).map(budget => ({
    ...budget,
    patient: budget.patient?.[0] || null,
    status: budget.status as Budget['status'],
    budget_type: (budget.budget_type as 'automatic' | 'manual') || 'automatic',
    treatment_type: (budget.treatment_type as 'facetas' | 'clareamento') || 'facetas',
    items: Array.isArray(budget.items) ? budget.items : (budget.items ? [budget.items] : [])
  }));
}

export async function getBudgetStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('status')
    .eq('user_id', user.id);

  if (error) throw error;

  const total = budgets?.length || 0;
  const pending = budgets?.filter(b => 
    ['pending', 'sent', 'viewed'].includes(b.status)
  ).length || 0;
  const accepted = budgets?.filter(b => b.status === 'accepted').length || 0;
  const rejected = budgets?.filter(b => b.status === 'rejected').length || 0;
  const conversionRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';

  return {
    total,
    pending,
    accepted,
    rejected,
    conversionRate: parseFloat(conversionRate)
  };
}

export async function markExpiredBudgets(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('budgets')
    .update({ status: 'expired' })
    .lt('valid_until', today)
    .in('status', ['pending', 'sent', 'viewed'])
    .select();

  if (error) throw error;
  return data?.length || 0;
}

// FASE 4: Criar orçamento manual
export async function createManualBudget(
  patientId: string,
  items: Array<{
    servico: string;
    quantidade: number;
    valor_unitario: number;
    observacoes?: string;
  }>,
  discount: number = 10
): Promise<Budget> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Buscar dados do paciente
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('name, phone')
    .eq('id', patientId)
    .maybeSingle();

  if (patientError) {
    console.error('❌ Erro ao buscar paciente:', {
      code: patientError.code,
      message: patientError.message,
      details: patientError.details,
      hint: patientError.hint,
      patientId
    });
    throw patientError;
  }
  if (!patient) throw new Error('Paciente não encontrado');

  // Calcular valores
  const itemsWithTotals = items.map(item => ({
    ...item,
    valor_total: item.quantidade * item.valor_unitario
  }));

  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.valor_total, 0);
  const discountAmount = subtotal * (discount / 100);
  const finalPrice = subtotal - discountAmount;

  // Gerar número de orçamento
  const budgetNumber = generateBudgetNumber();

  // Salvar no banco de dados primeiro (sem PDF)
  const { data, error } = await supabase
    .from('budgets')
    .insert([
      {
        user_id: user.id,
        patient_id: patientId,
        budget_number: budgetNumber,
        budget_type: 'manual',
        items: itemsWithTotals,
        teeth_count: 0, // Não aplicável para orçamento manual
        price_per_tooth: 0,
        subtotal,
        discount_percentage: discount,
        discount_amount: discountAmount,
        final_price: finalPrice,
        valid_until: addDays(new Date(), 30).toISOString().split('T')[0],
        status: 'pending'
      }
    ])
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao criar orçamento manual:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
  if (!data) throw new Error('Falha ao criar orçamento manual');

  // Gerar PDF usando Edge Function (PDFShift)
  console.log('→ Gerando PDF do orçamento manual via Edge Function (PDFShift)...');
  try {
    await generateBudgetPDF(data.id);
    console.log('✓ PDF do orçamento manual gerado com sucesso');
  } catch (pdfError) {
    console.error('❌ Erro ao gerar PDF do orçamento manual:', pdfError);
    // Não falhar a criação do orçamento se o PDF falhar
    // O PDF pode ser gerado manualmente depois
  }

  return {
    ...data,
    status: data.status as Budget['status'],
    budget_type: data.budget_type as 'automatic' | 'manual',
    treatment_type: (data.treatment_type as 'facetas' | 'clareamento') || 'facetas',
    items: Array.isArray(data.items) ? data.items : []
  };
}

// Atualizar orçamento existente
export async function updateBudget(
  budgetId: string,
  updates: {
    items?: any[];
    discount_percentage?: number;
    discount_amount?: number;
    final_price?: number;
    subtotal?: number;
    valid_until?: Date;
    treatment_type?: 'facetas' | 'clareamento';
  }
): Promise<Budget> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateData: any = { ...updates };
  
  if (updates.valid_until) {
    updateData.valid_until = updates.valid_until.toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from('budgets')
    .update(updateData)
    .eq('id', budgetId)
    .eq('user_id', user.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao atualizar orçamento:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      budgetId
    });
    throw error;
  }
  if (!data) throw new Error('Orçamento não encontrado');

  return {
    ...data,
    status: data.status as Budget['status'],
    budget_type: (data.budget_type as 'automatic' | 'manual') || 'automatic',
    treatment_type: (data.treatment_type as 'facetas' | 'clareamento') || 'facetas',
    items: Array.isArray(data.items) ? data.items : []
  };
}

// Arquivar orçamento
export async function archiveBudget(budgetId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('budgets')
    .update({ status: 'archived' })
    .eq('id', budgetId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getPatientBudgets(patientId: string): Promise<Budget[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(budget => ({
    ...budget,
    status: budget.status as Budget['status'],
    budget_type: (budget.budget_type as 'automatic' | 'manual') || 'automatic',
    treatment_type: (budget.treatment_type as 'facetas' | 'clareamento') || 'facetas',
    items: Array.isArray(budget.items) ? budget.items : []
  }));
}

/**
 * Gera PDF do orçamento usando React-PDF no frontend
 * @param budgetId - ID do orçamento
 * @returns URL do PDF gerado
 */
export async function generateBudgetPDF(budgetId: string): Promise<string> {
  console.log('📄 Gerando PDF do orçamento com React-PDF...', budgetId);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // 1. Buscar dados do orçamento com relacionamentos
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select(`
      *,
      patient:patients(*),
      simulation:simulations(*)
    `)
    .eq('id', budgetId)
    .single();

  if (budgetError || !budget) {
    console.error('❌ Erro ao buscar orçamento:', budgetError);
    throw new Error('Orçamento não encontrado');
  }

  // 2. Buscar informações da clínica
  const clinicInfo = await getClinicInfo();

  // 3. Preparar dados do paciente
  const patientData = Array.isArray(budget.patient) ? budget.patient[0] : budget.patient;
  const patientInfo = formatPatientInfo(patientData);

  // 4. Preparar imagens de simulação (se disponível)
  const simulationData = Array.isArray(budget.simulation) ? budget.simulation[0] : budget.simulation;
  const simulationImages = formatSimulationImages(
    simulationData?.original_image_url,
    simulationData?.processed_image_url
  );

  // 5. Preparar items do orçamento
  const items: BudgetItem[] = (budget.items || []).map((item: any) => ({
    servico: item.servico || item.name || 'Procedimento',
    dentes: item.dentes || item.teeth,
    quantidade: item.quantidade || item.quantity || 1,
    valor_unitario: item.valor_unitario || item.unit_price || 0,
    valor_total: item.valor_total || (item.quantidade || 1) * (item.valor_unitario || item.unit_price || 0)
  }));

  // Se não houver items, criar um item genérico baseado nos valores do budget
  if (items.length === 0) {
    items.push({
      servico: budget.treatment_type === 'clareamento' ? 'Clareamento Dental' : 'Facetas Dentárias',
      dentes: budget.teeth_count ? `${budget.teeth_count} dentes` : '-',
      quantidade: budget.teeth_count || 1,
      valor_unitario: budget.price_per_tooth || 0,
      valor_total: budget.subtotal || 0
    });
  }

  // 6. Preparar condições de pagamento
  const paymentConfig = budget.payment_conditions || {
    discount_cash: 10,
    discount_pix: 5,
    max_installments: 12
  };

  const paymentConditions: PaymentConditions = {
    discountCash: paymentConfig.discount_cash || 10,
    discountPix: paymentConfig.discount_pix || 5,
    maxInstallments: paymentConfig.max_installments || 12,
    installmentValue: budget.final_price / (paymentConfig.max_installments || 12),
    cashPrice: budget.final_price * (1 - (paymentConfig.discount_cash || 10) / 100)
  };

  // 7. Gerar PDF com React-PDF
  console.log('🎨 Renderizando PDF com React-PDF...');
  const blob = await generateBudgetPDFBlob({
    clinicInfo,
    patientInfo,
    simulationImages,
    date: new Date(),
    budgetNumber: budget.budget_number,
    items,
    subtotal: budget.subtotal,
    discount: budget.discount_amount || 0,
    total: budget.final_price,
    paymentConditions
  });

  console.log('✅ PDF gerado, tamanho:', (blob.size / 1024).toFixed(2), 'KB');

  // 8. Upload para Supabase Storage
  const fileName = `${user.id}/${budgetId}-${Date.now()}.pdf`;

  console.log('📤 Fazendo upload do PDF para:', fileName);
  const { error: uploadError } = await supabase.storage
    .from('budgets')
    .upload(fileName, blob, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    console.error('❌ Erro ao fazer upload do PDF:', uploadError);
    throw new Error(`Erro ao fazer upload: ${uploadError.message}`);
  }

  // 9. Obter URL pública
  const { data: urlData } = supabase.storage
    .from('budgets')
    .getPublicUrl(fileName);

  const pdfUrl = urlData.publicUrl;
  console.log('✅ PDF disponível em:', pdfUrl);

  // 10. Atualizar budget com pdf_url
  const { error: updateError } = await supabase
    .from('budgets')
    .update({ pdf_url: pdfUrl })
    .eq('id', budgetId);

  if (updateError) {
    console.error('⚠️ Erro ao atualizar budget com pdf_url:', updateError);
  }

  return pdfUrl;
}

/**
 * Creates or updates a lead in CRM from a budget
 */
export async function createLeadFromBudget(budgetId: string): Promise<{ leadId: string; isNew: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get budget with patient data
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select(`
      *,
      patient:patients(id, name, phone, email)
    `)
    .eq('id', budgetId)
    .single();

  if (budgetError || !budget) {
    throw new Error('Budget not found');
  }

  if (!budget.patient_id) {
    throw new Error('Budget has no associated patient');
  }

  const patientData = budget.patient as any;

  // Check if a lead already exists for this patient + treatment
  const { data: existingLeads } = await supabase
    .from('leads')
    .select('id')
    .eq('patient_id', budget.patient_id)
    .eq('treatment_type', budget.treatment_type)
    .eq('user_id', user.id);

  const existingLead = existingLeads && existingLeads.length > 0 ? existingLeads[0] : null;

  let leadId: string;
  let isNew = false;

  if (existingLead) {
    // Update existing lead
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({
        stage: 'fechamento',
        opportunity_value: budget.final_price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingLead.id)
      .select()
      .single();

    if (updateError) throw updateError;
    leadId = updatedLead.id;
  } else {
    // Create new lead
    const { data: newLead, error: createError } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        patient_id: budget.patient_id,
        name: patientData?.name || 'Paciente',
        phone: patientData?.phone || '',
        email: patientData?.email,
        stage: 'fechamento',
        treatment_type: budget.treatment_type,
        opportunity_value: budget.final_price,
        source: 'orcamento',
        status: 'fechamento',
      })
      .select()
      .single();

    if (createError) throw createError;
    leadId = newLead.id;
    isNew = true;
  }

  // Update budget with lead_id
  await supabase
    .from('budgets')
    .update({ lead_id: leadId })
    .eq('id', budgetId);

  // Create activity in the lead
  await supabase
    .from('activities')
    .insert({
      user_id: user.id,
      lead_id: leadId,
      type: 'budget',
      title: 'Orçamento enviado',
      description: `Orçamento ${budget.budget_number} no valor de R$ ${budget.final_price.toFixed(2)} foi associado ao lead`,
      metadata: {
        budget_id: budgetId,
        budget_number: budget.budget_number,
        value: budget.final_price,
      },
    });

  return { leadId, isNew };
}
