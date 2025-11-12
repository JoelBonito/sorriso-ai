import { supabase } from "@/integrations/supabase/client";

export interface PaymentConfig {
  discount_cash: number;
  discount_pix: number;
  max_installments: number;
  allow_credit_card: boolean;
  allow_debit_card: boolean;
  allow_boleto: boolean;
}

export interface Config {
  apiKey: string;
  backendUrl: string;
  temperature: number;
  topK: number;
  topP: number;
  maxTokens: number;
  promptTemplate: string;

  // Dados do usuário
  userName?: string;
  userPhone?: string;
  userEmail?: string;

  // Dados da clínica
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicCnpj?: string;
  clinicDentistName?: string;
  clinicCro?: string;
  clinicLogoUrl?: string;
  clinicZipCode?: string;
  clinicCity?: string;
  clinicState?: string;

  // Condições de pagamento
  paymentConfig?: PaymentConfig;

  // Módulos
  crmEnabled: boolean;
  facetsSimulatorEnabled?: boolean;
  whiteningSimulatorEnabled?: boolean;
}

export const DEFAULT_PROMPT = `Você é um especialista em design de sorriso digital e odontologia estética.
Aplique facetas dentárias de cerâmica de alta qualidade nesta imagem seguindo estas especificações:

DENTES A MODIFICAR (Sistema FDI):
- Incisivos centrais superiores (11, 21)
- Incisivos laterais superiores (12, 22)

ESPECIFICAÇÕES DAS FACETAS:
- Material: Cerâmica feldspática com técnica estratificada
- Cor: Branco natural (escala Vita A1-A2)
- Translucidez: Bordas incisais com 30-40% de translucidez
- Formato: Levemente arredondado, seguindo anatomia natural
- Textura: Superfície lisa com brilho natural discreto
- Proporção: Largura/altura de 75-80% (proporção áurea)

AJUSTES GENGIVAIS (se necessário):
- Corrigir contorno gengival APENAS se houver assimetria evidente
- Manter proporção natural entre coroa e gengiva
- Preservar papilas interdentais

PRESERVAR COMPLETAMENTE:
- Textura e tom da pele facial
- Estrutura do cabelo e penteado
- Cor e formato dos olhos
- Sobrancelhas e expressão facial
- Barba, bigode ou pelos faciais
- Óculos, joias ou acessórios
- Expressão e emoção do rosto
- Iluminação original e sombras
- Fundo e ambiente da foto
- Formato natural dos lábios
- Características únicas do paciente

RESULTADO ESPERADO:
O resultado deve ser fotorrealista, natural e adequado para apresentação clínica profissional.
Evite efeito artificial ("dentes de chiclete"). Mantenha a identidade do paciente.

---
ANÁLISE QUANTITATIVA OBRIGATÓRIA:

Após processar a imagem, você DEVE especificar EXATAMENTE quantos dentes foram modificados com facetas.

Formato obrigatório de resposta (adicione no final):
DENTES_MODIFICADOS: [número]

Exemplo:
DENTES_MODIFICADOS: 4

Normalmente são modificados os incisivos centrais e laterais superiores (dentes 11, 21, 12, 22), totalizando 4 facetas.
Se a análise visual indicar número diferente, especifique o valor correto.`;

export async function saveConfig(config: Config): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("user_configs")
    .upsert({
      user_id: user.id,
      api_key: config.apiKey,
      backend_url: config.backendUrl,
      temperature: config.temperature,
      top_k: config.topK,
      top_p: config.topP,
      max_tokens: config.maxTokens,
      prompt_template: config.promptTemplate,
      
      // Dados do usuário
      user_name: config.userName || null,
      user_phone: config.userPhone || null,
      user_email: config.userEmail || null,
      
      // Dados da clínica
      clinic_name: config.clinicName || null,
      clinic_address: config.clinicAddress || null,
      clinic_phone: config.clinicPhone || null,
      clinic_email: config.clinicEmail || null,
      clinic_cnpj: config.clinicCnpj || null,
      clinic_dentist_name: config.clinicDentistName || null,
      clinic_cro: config.clinicCro || null,
      clinic_logo_url: config.clinicLogoUrl || null,
      clinic_zip_code: config.clinicZipCode || null,
      clinic_city: config.clinicCity || null,
      clinic_state: config.clinicState || null,

      // Condições de pagamento
      payment_config: config.paymentConfig || null,

      // Módulos
      crm_enabled: config.crmEnabled,
      facets_simulator_enabled: config.facetsSimulatorEnabled ?? true,
      whitening_simulator_enabled: config.whiteningSimulatorEnabled ?? true,
    } as any, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function getConfig(): Promise<Config | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_configs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row: any = data;

  return {
    apiKey: row.api_key,
    backendUrl: row.backend_url,
    temperature: Number(row.temperature),
    topK: row.top_k,
    topP: Number(row.top_p),
    maxTokens: row.max_tokens,
    promptTemplate: row.prompt_template,
    
    // Dados do usuário
    userName: row.user_name || undefined,
    userPhone: row.user_phone || undefined,
    userEmail: row.user_email || undefined,
    
    // Dados da clínica
    clinicName: row.clinic_name || undefined,
    clinicAddress: row.clinic_address || undefined,
    clinicPhone: row.clinic_phone || undefined,
    clinicEmail: row.clinic_email || undefined,
    clinicCnpj: row.clinic_cnpj || undefined,
    clinicDentistName: row.clinic_dentist_name || undefined,
    clinicCro: row.clinic_cro || undefined,
    clinicLogoUrl: row.clinic_logo_url || undefined,
    clinicZipCode: row.clinic_zip_code || undefined,
    clinicCity: row.clinic_city || undefined,
    clinicState: row.clinic_state || undefined,

    // Condições de pagamento
    paymentConfig: row.payment_config ? {
      discount_cash: row.payment_config.discount_cash ?? 10,
      discount_pix: row.payment_config.discount_pix ?? 5,
      max_installments: row.payment_config.max_installments ?? 12,
      allow_credit_card: row.payment_config.allow_credit_card ?? true,
      allow_debit_card: row.payment_config.allow_debit_card ?? true,
      allow_boleto: row.payment_config.allow_boleto ?? true,
    } : {
      discount_cash: 10,
      discount_pix: 5,
      max_installments: 12,
      allow_credit_card: true,
      allow_debit_card: true,
      allow_boleto: true,
    },

    // Módulos
    crmEnabled: row.crm_enabled !== false,
    facetsSimulatorEnabled: row.facets_simulator_enabled ?? true,
    whiteningSimulatorEnabled: row.whitening_simulator_enabled ?? true,
  };
}

export async function hasConfig(): Promise<boolean> {
  const config = await getConfig();
  return config !== null;
}
