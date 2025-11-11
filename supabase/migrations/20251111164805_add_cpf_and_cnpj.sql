-- Adicionar campo CPF na tabela patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS cpf TEXT;

COMMENT ON COLUMN public.patients.cpf IS 'CPF do paciente (formato: 000.000.000-00)';

-- Criar índice para busca por CPF
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf);

-- Adicionar campo CNPJ na tabela user_configs
ALTER TABLE public.user_configs
ADD COLUMN IF NOT EXISTS clinic_cnpj TEXT;

COMMENT ON COLUMN public.user_configs.clinic_cnpj IS 'CNPJ da clínica (formato: 00.000.000/0000-00)';
