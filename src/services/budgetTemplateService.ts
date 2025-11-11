import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';
import { Budget } from './budgetService';
import { getConfig, PaymentConfig } from '@/utils/storage';

/**
 * Interface para dados do template de orçamento
 */
export interface BudgetTemplateData {
  // Clinic data
  CLINIC_NAME: string;
  CLINIC_CNPJ: string;
  CLINIC_ADDRESS: string;
  CLINIC_PHONE: string;
  CLINIC_EMAIL: string;
  CLINIC_LOGO_URL: string;
  CLINIC_ZIP_CODE: string;
  CLINIC_CITY: string;
  CLINIC_STATE: string;
  DENTIST_NAME: string;
  DENTIST_CRO: string;

  // Budget data
  BUDGET_NUMBER: string;
  ISSUE_DATE: string;
  VALIDITY_DATE: string;
  STATUS: string;

  // Patient data
  PATIENT_NAME: string;
  PATIENT_CPF: string;
  PATIENT_PHONE: string;
  PATIENT_EMAIL: string;

  // Simulation images
  SIMULATION_BEFORE_IMAGE: string;
  SIMULATION_AFTER_IMAGE: string;

  // Financial data
  SUBTOTAL: string;
  DISCOUNT: string;
  TOTAL: string;
  DISCOUNT_PERCENTAGE: string;

  // Payment conditions
  DISCOUNT_CASH: string;
  DISCOUNT_PIX: string;
  INSTALLMENTS: string;
  MAX_INSTALLMENTS: string;
  INSTALLMENT_VALUE: string;
  CASH_PRICE: string;

  // Procedures (dynamic)
  [key: string]: string;
}

/**
 * Busca um budget completo com todos os relacionamentos
 */
export async function getBudgetWithRelations(budgetId: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      patient:patients(*),
      simulation:simulations(*)
    `)
    .eq('id', budgetId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Formata CPF para exibição
 */
function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '-';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return cpf;
}

/**
 * Formata data para exibição
 */
function formatDate(date: string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Traduz status do orçamento
 */
function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    pending: 'Pendente',
    sent: 'Enviado',
    viewed: 'Visualizado',
    accepted: 'Aceito',
    rejected: 'Rejeitado',
    expired: 'Expirado',
  };
  return translations[status] || status;
}

/**
 * Mapeia items do budget para placeholders de procedimentos
 */
function mapItemsToProcedures(items: any[]): Record<string, string> {
  const placeholders: Record<string, string> = {};

  items.forEach((item, index) => {
    const num = index + 1;
    const total = (item.quantidade || 0) * (item.valor_unitario || 0);

    placeholders[`PROCEDURE_${num}_NAME`] = item.servico || '-';
    placeholders[`PROCEDURE_${num}_TEETH`] = item.dentes || '-';
    placeholders[`PROCEDURE_${num}_QTY`] = (item.quantidade || 0).toString();
    placeholders[`PROCEDURE_${num}_PRICE`] = formatCurrency(item.valor_unitario || 0);
    placeholders[`PROCEDURE_${num}_TOTAL`] = formatCurrency(total);
  });

  // Preencher procedimentos vazios se houver menos de 10 items
  for (let i = items.length + 1; i <= 10; i++) {
    placeholders[`PROCEDURE_${i}_NAME`] = '-';
    placeholders[`PROCEDURE_${i}_TEETH`] = '-';
    placeholders[`PROCEDURE_${i}_QTY`] = '-';
    placeholders[`PROCEDURE_${i}_PRICE`] = '-';
    placeholders[`PROCEDURE_${i}_TOTAL`] = '-';
  }

  return placeholders;
}

/**
 * Calcula condições de pagamento baseado no total e config
 */
function calculatePaymentConditions(totalPrice: number, paymentConfig?: PaymentConfig) {
  const config = paymentConfig || {
    discount_cash: 10,
    discount_pix: 5,
    max_installments: 12,
    allow_credit_card: true,
    allow_debit_card: true,
    allow_boleto: true,
  };

  const cashDiscount = config.discount_cash / 100;
  const pixDiscount = config.discount_pix / 100;

  return {
    discount_cash: config.discount_cash,
    discount_pix: config.discount_pix,
    max_installments: config.max_installments,
    installment_value: totalPrice / config.max_installments,
    cash_price: totalPrice * (1 - cashDiscount),
    pix_price: totalPrice * (1 - pixDiscount),
  };
}

/**
 * Gera dados do template de orçamento a partir do budget
 */
export async function getBudgetTemplateData(budgetId: string): Promise<BudgetTemplateData> {
  // Buscar budget com relacionamentos
  const budget = await getBudgetWithRelations(budgetId);
  const userConfig = await getConfig();

  // Calcular condições de pagamento
  const paymentConditions = calculatePaymentConditions(
    budget.final_price || 0,
    userConfig?.paymentConfig
  );

  // Mapear items para procedimentos
  const procedurePlaceholders = mapItemsToProcedures(budget.items || []);

  // Montar objeto com todos os placeholders
  const templateData: BudgetTemplateData = {
    // Clinic
    CLINIC_NAME: userConfig?.clinicName || '-',
    CLINIC_CNPJ: userConfig?.clinicCnpj || '-',
    CLINIC_ADDRESS: userConfig?.clinicAddress || '-',
    CLINIC_PHONE: userConfig?.clinicPhone || '-',
    CLINIC_EMAIL: userConfig?.clinicEmail || '-',
    CLINIC_LOGO_URL: userConfig?.clinicLogoUrl || '',
    CLINIC_ZIP_CODE: userConfig?.clinicZipCode || '-',
    CLINIC_CITY: userConfig?.clinicCity || '-',
    CLINIC_STATE: userConfig?.clinicState || '-',
    DENTIST_NAME: userConfig?.clinicDentistName || '-',
    DENTIST_CRO: userConfig?.clinicCro || '-',

    // Budget
    BUDGET_NUMBER: budget.budget_number || '-',
    ISSUE_DATE: formatDate(budget.created_at),
    VALIDITY_DATE: formatDate(budget.valid_until),
    STATUS: translateStatus(budget.status),

    // Patient
    PATIENT_NAME: budget.patient?.name || '-',
    PATIENT_CPF: formatCPF(budget.patient?.cpf),
    PATIENT_PHONE: budget.patient?.phone || '-',
    PATIENT_EMAIL: budget.patient?.email || '-',

    // Simulation images
    SIMULATION_BEFORE_IMAGE: budget.before_image || budget.simulation?.original_image_url || '',
    SIMULATION_AFTER_IMAGE: budget.after_image || budget.simulation?.processed_image_url || '',

    // Financial
    SUBTOTAL: formatCurrency(budget.subtotal || 0),
    DISCOUNT: formatCurrency(budget.discount_amount || 0),
    TOTAL: formatCurrency(budget.final_price || 0),
    DISCOUNT_PERCENTAGE: (budget.discount_percentage || 0).toString(),

    // Payment conditions
    DISCOUNT_CASH: paymentConditions.discount_cash.toString(),
    DISCOUNT_PIX: paymentConditions.discount_pix.toString(),
    INSTALLMENTS: paymentConditions.max_installments.toString(),
    MAX_INSTALLMENTS: paymentConditions.max_installments.toString(),
    INSTALLMENT_VALUE: formatCurrency(paymentConditions.installment_value),
    CASH_PRICE: formatCurrency(paymentConditions.cash_price),

    // Procedures (dinâmico)
    ...procedurePlaceholders,
  };

  return templateData;
}

/**
 * Processa condicionais no template (remove seções se dados não existem)
 */
function processConditionals(template: string, data: BudgetTemplateData): string {
  let processed = template;

  // Definir condições e suas validações
  const conditions = {
    IF_HAS_LOGO: () => data.CLINIC_LOGO_URL && data.CLINIC_LOGO_URL.trim() !== '',
    IF_HAS_SIMULATION: () =>
      (data.SIMULATION_BEFORE_IMAGE && data.SIMULATION_BEFORE_IMAGE.trim() !== '') ||
      (data.SIMULATION_AFTER_IMAGE && data.SIMULATION_AFTER_IMAGE.trim() !== ''),
  };

  // Processar cada tipo de condicional
  Object.entries(conditions).forEach(([conditionName, validator]) => {
    const startTag = `{{${conditionName}}}`;
    const endTag = `{{END_${conditionName}}}`;
    const regex = new RegExp(`${startTag}([\\s\\S]*?)${endTag}`, 'g');

    processed = processed.replace(regex, (match, content) => {
      // Se a condição é atendida, mantém o conteúdo (sem as tags)
      // Se não, remove tudo
      return validator() ? content : '';
    });
  });

  return processed;
}

/**
 * Preenche template Markdown com dados
 */
export function fillTemplate(template: string, data: BudgetTemplateData): string {
  let filled = template;

  // Substituir todos os placeholders
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    filled = filled.replace(regex, value);
  });

  // Processar condicionais (remover seções vazias)
  filled = processConditionals(filled, data);

  // Remover linhas de procedimentos vazios (que contêm apenas hífens)
  filled = filled.replace(/^\|.*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|.*$/gm, '');

  return filled;
}

/**
 * Lê o template de orçamento do arquivo
 */
export async function loadBudgetTemplate(): Promise<string> {
  // Em produção, você pode buscar de um bucket ou ter o template inline
  // Por enquanto, vamos retornar o conteúdo do template
  const response = await fetch('/PDF/template-orcamento-profissional.md');
  if (!response.ok) {
    throw new Error('Erro ao carregar template de orçamento');
  }
  return await response.text();
}

/**
 * Gera markdown preenchido para um orçamento
 */
export async function generateBudgetMarkdown(budgetId: string): Promise<string> {
  const template = await loadBudgetTemplate();
  const data = await getBudgetTemplateData(budgetId);
  return fillTemplate(template, data);
}
