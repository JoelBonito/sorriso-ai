-- =====================================================
-- WHATSAPP AI AGENT SCHEMA
-- =====================================================
-- Sistema completo de agente conversacional via WhatsApp
-- Integrado com Evolution API
-- =====================================================

-- =====================================================
-- 1. WHATSAPP CONVERSATIONS
-- =====================================================
-- Armazena conversas ativas do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificação do contato
  phone_number TEXT NOT NULL, -- Número do WhatsApp (formato: 5511999999999)
  contact_name TEXT, -- Nome do contato

  -- Estado da conversa
  state TEXT NOT NULL DEFAULT 'greeting', -- greeting, waiting_name, waiting_phone, waiting_photo, waiting_treatment, processing, showing_result, generating_budget, waiting_approval, scheduling, completed, cancelled
  last_state TEXT, -- Estado anterior (para voltar)

  -- Dados coletados durante a conversa
  patient_name TEXT,
  patient_phone TEXT,
  treatment_type TEXT, -- 'facetas' ou 'clareamento'

  -- IDs de recursos criados
  simulation_id UUID REFERENCES simulations(id),
  patient_id UUID REFERENCES patients(id),
  budget_id UUID REFERENCES budgets(id),
  lead_id UUID REFERENCES leads(id),
  appointment_id UUID REFERENCES appointments(id),

  -- Metadados
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Índices para busca rápida
  CONSTRAINT unique_active_conversation_per_phone UNIQUE (phone_number, user_id)
);

-- Índices
CREATE INDEX idx_whatsapp_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX idx_whatsapp_conversations_state ON whatsapp_conversations(state);
CREATE INDEX idx_whatsapp_conversations_user ON whatsapp_conversations(user_id);
CREATE INDEX idx_whatsapp_conversations_last_message ON whatsapp_conversations(last_message_at DESC);

-- RLS Policies
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON whatsapp_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON whatsapp_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON whatsapp_conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. WHATSAPP MESSAGES
-- =====================================================
-- Histórico completo de mensagens
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,

  -- Tipo de mensagem
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')), -- inbound = cliente, outbound = bot
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'document', 'audio', 'video', 'button_response')),

  -- Conteúdo
  content TEXT, -- Texto da mensagem
  media_url TEXT, -- URL de mídia (imagens, docs, etc)
  media_mime_type TEXT,

  -- Metadados do WhatsApp
  whatsapp_message_id TEXT, -- ID da mensagem no WhatsApp
  whatsapp_timestamp TIMESTAMPTZ,

  -- Status de entrega
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,

  -- Metadados extras
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índice
  CONSTRAINT unique_whatsapp_message_id UNIQUE (whatsapp_message_id)
);

-- Índices
CREATE INDEX idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id, created_at DESC);
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction);
CREATE INDEX idx_whatsapp_messages_type ON whatsapp_messages(message_type);

-- RLS Policies
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from their conversations"
  ON whatsapp_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM whatsapp_conversations
      WHERE whatsapp_conversations.id = whatsapp_messages.conversation_id
      AND whatsapp_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM whatsapp_conversations
      WHERE whatsapp_conversations.id = whatsapp_messages.conversation_id
      AND whatsapp_conversations.user_id = auth.uid()
    )
  );

-- =====================================================
-- 3. APPOINTMENTS
-- =====================================================
-- Agendamentos criados pelo bot
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Relacionamentos
  patient_id UUID REFERENCES patients(id),
  lead_id UUID REFERENCES leads(id),
  conversation_id UUID REFERENCES whatsapp_conversations(id),

  -- Dados do agendamento
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,

  -- Data e hora
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  end_time TIME GENERATED ALWAYS AS (scheduled_time + (duration_minutes || ' minutes')::INTERVAL) STORED,

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),

  -- Tipo de tratamento
  treatment_type TEXT CHECK (treatment_type IN ('facetas', 'clareamento', 'consulta', 'outros')),

  -- Notas
  notes TEXT,
  cancellation_reason TEXT,

  -- Lembretes enviados
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_2h BOOLEAN DEFAULT FALSE,

  -- Metadados
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,

  -- Constraint: não pode ter horários sobrepostos
  CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
    user_id WITH =,
    scheduled_date WITH =,
    tsrange(
      (scheduled_date + scheduled_time)::TIMESTAMP,
      (scheduled_date + scheduled_time + (duration_minutes || ' minutes')::INTERVAL)::TIMESTAMP
    ) WITH &&
  ) WHERE (status NOT IN ('cancelled', 'completed'))
);

-- Índices
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_datetime ON appointments(scheduled_date, scheduled_time);

-- RLS Policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON appointments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
  ON appointments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. CALENDAR AVAILABILITY
-- =====================================================
-- Define horários de funcionamento da clínica
CREATE TABLE IF NOT EXISTS calendar_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Dia da semana (0 = Domingo, 6 = Sábado)
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),

  -- Horários
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Intervalo de consultas (minutos)
  slot_duration INTEGER DEFAULT 60,

  -- Ativo/Inativo
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: horário final deve ser maior que inicial
  CONSTRAINT valid_time_range CHECK (end_time > start_time),

  -- Constraint: uma configuração por dia da semana por usuário
  CONSTRAINT unique_availability_per_day UNIQUE (user_id, day_of_week)
);

-- Índices
CREATE INDEX idx_calendar_availability_user ON calendar_availability(user_id);
CREATE INDEX idx_calendar_availability_day ON calendar_availability(day_of_week);

-- RLS Policies
ALTER TABLE calendar_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own availability"
  ON calendar_availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their availability"
  ON calendar_availability FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. CALENDAR BLOCKED_DATES
-- =====================================================
-- Datas/horários bloqueados (feriados, férias, etc)
CREATE TABLE IF NOT EXISTS calendar_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Data bloqueada
  blocked_date DATE NOT NULL,

  -- Horários específicos bloqueados (opcional)
  start_time TIME,
  end_time TIME,

  -- Se NULL, bloqueia o dia todo
  all_day BOOLEAN DEFAULT TRUE,

  -- Motivo
  reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: se não for all_day, deve ter horários
  CONSTRAINT blocked_times_required CHECK (
    all_day = TRUE OR (start_time IS NOT NULL AND end_time IS NOT NULL)
  )
);

-- Índices
CREATE INDEX idx_blocked_dates_user ON calendar_blocked_dates(user_id);
CREATE INDEX idx_blocked_dates_date ON calendar_blocked_dates(blocked_date);

-- RLS Policies
ALTER TABLE calendar_blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blocked dates"
  ON calendar_blocked_dates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their blocked dates"
  ON calendar_blocked_dates FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter próximos horários disponíveis
CREATE OR REPLACE FUNCTION get_available_slots(
  p_user_id UUID,
  p_date DATE,
  p_duration INTEGER DEFAULT 60
)
RETURNS TABLE (
  slot_time TIME,
  slot_datetime TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH availability AS (
    -- Buscar disponibilidade para o dia da semana
    SELECT start_time, end_time, slot_duration
    FROM calendar_availability
    WHERE user_id = p_user_id
      AND day_of_week = EXTRACT(DOW FROM p_date)::INTEGER
      AND is_active = TRUE
  ),
  time_slots AS (
    -- Gerar slots de tempo
    SELECT generate_series(
      a.start_time,
      a.end_time - (p_duration || ' minutes')::INTERVAL,
      (a.slot_duration || ' minutes')::INTERVAL
    )::TIME AS slot
    FROM availability a
  ),
  blocked_times AS (
    -- Buscar horários bloqueados
    SELECT start_time, end_time
    FROM calendar_blocked_dates
    WHERE user_id = p_user_id
      AND blocked_date = p_date
      AND all_day = FALSE
  ),
  existing_appointments AS (
    -- Buscar agendamentos existentes
    SELECT scheduled_time, end_time
    FROM appointments
    WHERE user_id = p_user_id
      AND scheduled_date = p_date
      AND status IN ('scheduled', 'confirmed')
  )
  SELECT
    ts.slot AS slot_time,
    (p_date + ts.slot)::TIMESTAMPTZ AS slot_datetime
  FROM time_slots ts
  WHERE NOT EXISTS (
    -- Verificar se não está bloqueado
    SELECT 1 FROM blocked_times bt
    WHERE ts.slot >= bt.start_time
      AND ts.slot < bt.end_time
  )
  AND NOT EXISTS (
    -- Verificar se não tem agendamento
    SELECT 1 FROM existing_appointments ea
    WHERE ts.slot >= ea.scheduled_time
      AND ts.slot < ea.end_time
  )
  -- Filtrar horários passados se for hoje
  AND (p_date > CURRENT_DATE OR ts.slot > CURRENT_TIME)
  ORDER BY ts.slot;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_availability_updated_at
  BEFORE UPDATE ON calendar_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. DADOS INICIAIS
-- =====================================================

-- Inserir disponibilidade padrão (Segunda a Sábado, 9h-19h)
-- Será inserido apenas se não existir disponibilidade
-- Os usuários podem configurar depois via interface

COMMENT ON TABLE whatsapp_conversations IS 'Conversas do agente de IA via WhatsApp';
COMMENT ON TABLE whatsapp_messages IS 'Histórico completo de mensagens do WhatsApp';
COMMENT ON TABLE appointments IS 'Agendamentos criados pelo bot ou manualmente';
COMMENT ON TABLE calendar_availability IS 'Horários de funcionamento da clínica';
COMMENT ON TABLE calendar_blocked_dates IS 'Datas/horários bloqueados (feriados, férias)';
