-- Adicionar campos do Responsável Técnico na tabela user_configs
ALTER TABLE public.user_configs
ADD COLUMN IF NOT EXISTS clinic_dentist_name TEXT,
ADD COLUMN IF NOT EXISTS clinic_cro TEXT;

COMMENT ON COLUMN public.user_configs.clinic_dentist_name IS 'Nome do dentista responsável técnico da clínica';
COMMENT ON COLUMN public.user_configs.clinic_cro IS 'CRO (Conselho Regional de Odontologia) do responsável técnico';
