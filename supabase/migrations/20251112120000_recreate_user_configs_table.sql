-- =====================================================
-- MIGRATION: Recreate user_configs table
-- =====================================================
-- Esta migration recria a tabela user_configs com todos os campos corretos
-- após a tabela ter sido deletada acidentalmente.
-- =====================================================

-- Drop da tabela existente (se existir) e recriar do zero
DROP TABLE IF EXISTS public.user_configs CASCADE;

-- Criar tabela user_configs com TODOS os campos corretos
CREATE TABLE public.user_configs (
  -- Campos básicos
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Configurações de API (OPCIONAIS agora)
  api_key TEXT,
  backend_url TEXT,
  prompt_template TEXT,

  -- Parâmetros do modelo de IA
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.4,
  top_k INTEGER NOT NULL DEFAULT 32,
  top_p DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  max_tokens INTEGER NOT NULL DEFAULT 8192,

  -- API Claude (opcional)
  claude_api_key TEXT,
  use_claude BOOLEAN DEFAULT false,

  -- Dados do usuário
  user_name TEXT,
  user_phone TEXT,
  user_email TEXT,
  profile_picture_url TEXT,

  -- Dados da clínica
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_phone TEXT,
  clinic_email TEXT,
  clinic_cnpj TEXT,
  clinic_dentist_name TEXT,
  clinic_cro TEXT,
  clinic_logo_url TEXT,
  clinic_zip_code TEXT,
  clinic_city TEXT,
  clinic_state TEXT,

  -- Configurações de pagamento
  payment_config JSONB DEFAULT '{
    "discount_cash": 10,
    "discount_pix": 5,
    "max_installments": 12,
    "allow_credit_card": true,
    "allow_debit_card": true,
    "allow_boleto": true
  }'::jsonb,

  -- Módulos habilitados
  crm_enabled BOOLEAN DEFAULT true,
  facets_simulator_enabled BOOLEAN DEFAULT true,
  whitening_simulator_enabled BOOLEAN DEFAULT false
);

-- Comentários explicativos nas colunas
COMMENT ON TABLE public.user_configs IS 'Configurações do usuário para o sistema Sorriso AI';

-- Campos básicos
COMMENT ON COLUMN public.user_configs.id IS 'ID único da configuração';
COMMENT ON COLUMN public.user_configs.user_id IS 'ID do usuário (único)';
COMMENT ON COLUMN public.user_configs.created_at IS 'Data de criação';
COMMENT ON COLUMN public.user_configs.updated_at IS 'Data de última atualização';

-- Configurações de API
COMMENT ON COLUMN public.user_configs.api_key IS 'API Key para serviço de IA (opcional)';
COMMENT ON COLUMN public.user_configs.backend_url IS 'URL do backend (opcional)';
COMMENT ON COLUMN public.user_configs.prompt_template IS 'Template do prompt para IA (opcional)';

-- Parâmetros do modelo
COMMENT ON COLUMN public.user_configs.temperature IS 'Temperature do modelo (0-1)';
COMMENT ON COLUMN public.user_configs.top_k IS 'Top K do modelo';
COMMENT ON COLUMN public.user_configs.top_p IS 'Top P do modelo (0-1)';
COMMENT ON COLUMN public.user_configs.max_tokens IS 'Máximo de tokens';

-- API Claude
COMMENT ON COLUMN public.user_configs.claude_api_key IS 'API Key do Claude (opcional)';
COMMENT ON COLUMN public.user_configs.use_claude IS 'Usar Claude ao invés de outro modelo';

-- Dados do usuário
COMMENT ON COLUMN public.user_configs.user_name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.user_configs.user_phone IS 'Telefone do usuário';
COMMENT ON COLUMN public.user_configs.user_email IS 'E-mail do usuário';
COMMENT ON COLUMN public.user_configs.profile_picture_url IS 'URL da foto de perfil';

-- Dados da clínica
COMMENT ON COLUMN public.user_configs.clinic_name IS 'Nome da clínica/consultório';
COMMENT ON COLUMN public.user_configs.clinic_address IS 'Endereço da clínica';
COMMENT ON COLUMN public.user_configs.clinic_phone IS 'Telefone da clínica';
COMMENT ON COLUMN public.user_configs.clinic_email IS 'E-mail da clínica';
COMMENT ON COLUMN public.user_configs.clinic_cnpj IS 'CNPJ da clínica (formato: 00.000.000/0000-00)';
COMMENT ON COLUMN public.user_configs.clinic_dentist_name IS 'Nome do dentista responsável técnico da clínica';
COMMENT ON COLUMN public.user_configs.clinic_cro IS 'CRO (Conselho Regional de Odontologia) do responsável técnico';
COMMENT ON COLUMN public.user_configs.clinic_logo_url IS 'URL da logomarca da clínica no storage';
COMMENT ON COLUMN public.user_configs.clinic_zip_code IS 'CEP da clínica';
COMMENT ON COLUMN public.user_configs.clinic_city IS 'Cidade da clínica';
COMMENT ON COLUMN public.user_configs.clinic_state IS 'Estado da clínica (UF)';

-- Configurações de pagamento
COMMENT ON COLUMN public.user_configs.payment_config IS 'Configurações padrão de pagamento da clínica: descontos (dinheiro, PIX), parcelas máximas e formas de pagamento aceitas';

-- Módulos
COMMENT ON COLUMN public.user_configs.crm_enabled IS 'Módulo CRM habilitado';
COMMENT ON COLUMN public.user_configs.facets_simulator_enabled IS 'Módulo de simulação de facetas habilitado';
COMMENT ON COLUMN public.user_configs.whitening_simulator_enabled IS 'Módulo de simulação de clareamento habilitado';

-- Habilitar Row Level Security
ALTER TABLE public.user_configs ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança (RLS)
CREATE POLICY "Users can view their own config"
ON public.user_configs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config"
ON public.user_configs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config"
ON public.user_configs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config"
ON public.user_configs
FOR DELETE
USING (auth.uid() = user_id);

-- Criar função para atualizar timestamps automaticamente (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar trigger para atualização automática de timestamps
CREATE TRIGGER update_user_configs_updated_at
BEFORE UPDATE ON public.user_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índice para payment_config (GIN para queries JSONB)
CREATE INDEX IF NOT EXISTS idx_user_configs_payment_config ON public.user_configs USING GIN (payment_config);

-- Criar índice para user_id (já é UNIQUE, mas garante performance)
CREATE INDEX IF NOT EXISTS idx_user_configs_user_id ON public.user_configs(user_id);

-- Verificação final: Listar todas as colunas criadas
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_configs'
  AND table_schema = 'public'
ORDER BY ordinal_position;
