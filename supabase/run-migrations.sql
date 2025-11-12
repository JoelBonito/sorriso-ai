-- Script para aplicar migration faltante manualmente
-- Execute este SQL no Supabase SQL Editor: https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/sql

-- Adicionar campos faltantes de endereço da clínica
ALTER TABLE public.user_configs
ADD COLUMN IF NOT EXISTS clinic_zip_code TEXT,
ADD COLUMN IF NOT EXISTS clinic_city TEXT,
ADD COLUMN IF NOT EXISTS clinic_state TEXT,
ADD COLUMN IF NOT EXISTS clinic_logo_url TEXT;

-- Comentários explicativos
COMMENT ON COLUMN public.user_configs.clinic_zip_code IS 'CEP da clínica';
COMMENT ON COLUMN public.user_configs.clinic_city IS 'Cidade da clínica';
COMMENT ON COLUMN public.user_configs.clinic_state IS 'Estado da clínica (UF)';
COMMENT ON COLUMN public.user_configs.clinic_logo_url IS 'URL da logomarca da clínica no storage';

-- Tornar campos api_key, backend_url e prompt_template OPCIONAIS
-- Isso permite salvar configurações da clínica sem precisar configurar API
ALTER TABLE public.user_configs
ALTER COLUMN api_key DROP NOT NULL,
ALTER COLUMN backend_url DROP NOT NULL,
ALTER COLUMN prompt_template DROP NOT NULL;

-- Atualizar comentários
COMMENT ON COLUMN public.user_configs.api_key IS 'API Key para serviço de IA (opcional)';
COMMENT ON COLUMN public.user_configs.backend_url IS 'URL do backend (opcional)';
COMMENT ON COLUMN public.user_configs.prompt_template IS 'Template do prompt para IA (opcional)';

-- Verificar se deu certo
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_configs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
