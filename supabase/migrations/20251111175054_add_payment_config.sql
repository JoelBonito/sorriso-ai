-- Adicionar configurações de pagamento padrão na clínica
-- Fase 1: Estruturação de Payment Conditions

-- Adicionar coluna payment_config à tabela user_configs
ALTER TABLE public.user_configs
ADD COLUMN IF NOT EXISTS payment_config JSONB DEFAULT '{
  "discount_cash": 10,
  "discount_pix": 5,
  "max_installments": 12,
  "allow_credit_card": true,
  "allow_debit_card": true,
  "allow_boleto": true
}'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN public.user_configs.payment_config IS 'Configurações padrão de pagamento da clínica: descontos (dinheiro, PIX), parcelas máximas e formas de pagamento aceitas';

-- Criar índice para melhorar performance de queries por payment_config
CREATE INDEX IF NOT EXISTS idx_user_configs_payment_config ON public.user_configs USING GIN (payment_config);
