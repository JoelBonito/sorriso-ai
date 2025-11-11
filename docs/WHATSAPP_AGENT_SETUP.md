# 📱 WhatsApp AI Agent - Setup Guide

## 🎯 Visão Geral

Agente conversacional de IA que atende pacientes via WhatsApp, guiando-os pelo processo completo:

1. ✅ Recebe foto do paciente
2. ✅ Gera simulação do sorriso (Facetas ou Clareamento)
3. ✅ Apresenta resultado ANTES/DEPOIS
4. ✅ Gera orçamento personalizado
5. ✅ Agenda consulta na clínica
6. ✅ Salva tudo no CRM automaticamente

---

## 🗄️ Banco de Dados

### Tabelas Criadas

A migration `20251111145911_whatsapp_agent_schema.sql` cria:

- **whatsapp_conversations** - Conversas ativas
- **whatsapp_messages** - Histórico de mensagens
- **appointments** - Agendamentos
- **calendar_availability** - Horários de funcionamento
- **calendar_blocked_dates** - Datas bloqueadas (feriados, férias)

### Aplicar Migration

```bash
# Via Supabase CLI (se instalado)
supabase db push

# Ou pelo Dashboard do Supabase
# https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/editor
# Cole o conteúdo da migration e execute
```

---

## 🔧 Configuração da Evolution API

### 1. Instalar Evolution API

**Opção A: Docker (Recomendado)**

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=your-secret-key-here \
  atendai/evolution-api:latest
```

**Opção B: Docker Compose**

```yaml
version: '3'
services:
  evolution-api:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_API_KEY=your-secret-key-here
    volumes:
      - evolution_data:/evolution/instances
```

### 2. Criar Instância no Evolution API

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "clinica-whatsapp",
    "qrcode": true
  }'
```

### 3. Conectar WhatsApp

Acesse: `http://localhost:8080/instance/qrcode/clinica-whatsapp`

Escaneie o QR Code com seu WhatsApp Business.

### 4. Configurar Webhook

```bash
curl -X POST http://localhost:8080/webhook/set/clinica-whatsapp \
  -H "apikey: your-secret-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://hqexulgmmtghwtgnqtfy.supabase.co/functions/v1/whatsapp-webhook",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT"
    ]
  }'
```

---

## ⚙️ Variáveis de Ambiente no Supabase

Configure estas variáveis nas Edge Functions:

### Via Supabase Dashboard

1. Acesse: https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/settings/functions
2. Adicione as seguintes secrets:

```bash
EVOLUTION_API_URL=http://seu-servidor:8080
EVOLUTION_API_KEY=your-secret-key-here
EVOLUTION_INSTANCE_NAME=clinica-whatsapp
GEMINI_API_KEY=sua-chave-gemini-aqui
```

### Via Supabase CLI

```bash
supabase secrets set EVOLUTION_API_URL=http://seu-servidor:8080
supabase secrets set EVOLUTION_API_KEY=your-secret-key-here
supabase secrets set EVOLUTION_INSTANCE_NAME=clinica-whatsapp
supabase secrets set GEMINI_API_KEY=sua-chave-gemini-aqui
```

---

## 🚀 Deploy das Edge Functions

### 1. Deploy via Dashboard

Copie o código de cada função e cole no Supabase Dashboard:

**whatsapp-webhook:**
- https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/functions

**whatsapp-agent:**
- https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/functions

### 2. Deploy via CLI (se instalado)

```bash
cd /home/user/sorriso-ai

# Deploy webhook
supabase functions deploy whatsapp-webhook

# Deploy agent
supabase functions deploy whatsapp-agent
```

---

## 📅 Configurar Horários da Clínica

Execute este SQL no Supabase para configurar os horários padrão:

```sql
-- Inserir disponibilidade: Segunda a Sábado, 9h-19h
-- IMPORTANTE: Substitua YOUR_USER_ID pelo ID do usuário dentista

INSERT INTO calendar_availability (user_id, day_of_week, start_time, end_time, slot_duration, is_active)
VALUES
  -- Segunda-feira (1)
  ('YOUR_USER_ID', 1, '09:00', '19:00', 60, true),
  -- Terça-feira (2)
  ('YOUR_USER_ID', 2, '09:00', '19:00', 60, true),
  -- Quarta-feira (3)
  ('YOUR_USER_ID', 3, '09:00', '19:00', 60, true),
  -- Quinta-feira (4)
  ('YOUR_USER_ID', 4, '09:00', '19:00', 60, true),
  -- Sexta-feira (5)
  ('YOUR_USER_ID', 5, '09:00', '19:00', 60, true),
  -- Sábado (6)
  ('YOUR_USER_ID', 6, '09:00', '19:00', 60, true);

-- Para descobrir seu user_id:
SELECT id, email FROM auth.users;
```

---

## 🧪 Testar o Agente

### 1. Enviar mensagem de teste

Envie uma mensagem para o número do WhatsApp conectado:

```
Oi
```

### 2. Fluxo esperado:

```
Bot: Olá! Bem-vindo(a) à nossa clínica...
     Para começar, qual é o seu nome?

Você: João Silva

Bot: Prazer em conhecer você, João Silva!
     Qual tratamento você tem interesse?
     1️⃣ - Facetas Dentárias
     2️⃣ - Clareamento Dental

Você: 1

Bot: Perfeito! Você escolheu: Facetas Dentárias
     Agora preciso de uma foto do seu sorriso! 📸

Você: [Envia foto]

Bot: Foto recebida! ✅
     Estou processando sua simulação...

[30-60 segundos depois]

Bot: [Envia foto ANTES]
Bot: [Envia foto DEPOIS]
Bot: 🎉 Simulação concluída!
     O que você achou do resultado?
     1️⃣ - Gostei! Quero o orçamento
     2️⃣ - Não gostei, fazer nova simulação

Você: 1

Bot: [Envia orçamento]
     Você aprova este orçamento?
     1️⃣ - Sim, quero agendar consulta
     2️⃣ - Não, obrigado

Você: 1

Bot: Vamos agendar sua consulta!
     Qual dia você prefere?
     Envie no formato: DD/MM/AAAA

... e assim por diante
```

---

## 🔍 Monitoramento e Logs

### Ver logs das Edge Functions:

```bash
# Via Dashboard
https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/logs/edge-functions

# Via CLI
supabase functions logs whatsapp-webhook
supabase functions logs whatsapp-agent
```

### Ver conversas no banco:

```sql
-- Conversas ativas
SELECT * FROM whatsapp_conversations
WHERE state NOT IN ('completed', 'cancelled')
ORDER BY last_message_at DESC;

-- Mensagens de uma conversa
SELECT
  direction,
  message_type,
  content,
  created_at
FROM whatsapp_messages
WHERE conversation_id = 'CONVERSATION_ID_HERE'
ORDER BY created_at ASC;
```

---

## 🛠️ Troubleshooting

### Erro: "Evolution API não configurada"

```bash
# Verifique se as variáveis estão configuradas
supabase secrets list

# Configure novamente
supabase secrets set EVOLUTION_API_URL=http://seu-servidor:8080
supabase secrets set EVOLUTION_API_KEY=your-secret-key-here
supabase secrets set EVOLUTION_INSTANCE_NAME=clinica-whatsapp
```

### Erro: "Nenhum usuário dentista encontrado"

O sistema busca o primeiro usuário cadastrado. Certifique-se de ter pelo menos um usuário:

```sql
SELECT id, email FROM auth.users;
```

### Bot não responde

1. Verifique se o webhook está configurado no Evolution API
2. Verifique os logs das Edge Functions
3. Teste o webhook manualmente:

```bash
curl -X POST https://hqexulgmmtghwtgnqtfy.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "messages.upsert",
    "instance": "clinica-whatsapp",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false,
        "id": "test123"
      },
      "pushName": "Teste",
      "message": {
        "conversation": "Oi"
      },
      "messageTimestamp": 1234567890
    }
  }'
```

### Simulação não processa

1. Verifique se a `GEMINI_API_KEY` está configurada
2. Verifique se a função `process-dental-facets` está deployada
3. Verifique os logs para ver o erro específico

---

## 📊 Integração com CRM

Todas as conversas, pacientes criados e agendamentos são automaticamente salvos no CRM do MVP:

- **Pacientes**: Tabela `patients`
- **Leads**: Tabela `leads` (quando gera orçamento)
- **Simulações**: Tabela `simulations`
- **Agendamentos**: Tabela `appointments`
- **Atividades**: Tabela `activities` (histórico no CRM)

---

## 🎨 Customização

### Alterar mensagens do bot

Edite as funções em `/supabase/functions/whatsapp-agent/index.ts`:

- `handleGreeting()` - Mensagem de boas-vindas
- `handleWaitingName()` - Após receber nome
- `handleWaitingTreatment()` - Após escolher tratamento
- etc.

### Alterar horários da clínica

```sql
UPDATE calendar_availability
SET start_time = '08:00', end_time = '18:00'
WHERE user_id = 'YOUR_USER_ID';
```

### Adicionar feriados

```sql
INSERT INTO calendar_blocked_dates (user_id, blocked_date, all_day, reason)
VALUES
  ('YOUR_USER_ID', '2025-12-25', true, 'Natal'),
  ('YOUR_USER_ID', '2025-01-01', true, 'Ano Novo');
```

---

## 📚 Próximos Passos

- [ ] Implementar geração de PDF do orçamento
- [ ] Implementar lógica completa de agendamento com verificação de horários
- [ ] Adicionar lembretes automáticos de consulta (24h e 2h antes)
- [ ] Adicionar suporte a múltiplos dentistas (roteamento)
- [ ] Adicionar dashboard para gerenciar conversas
- [ ] Adicionar métricas e analytics

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs das Edge Functions
2. Verifique o estado das conversas no banco
3. Teste manualmente cada endpoint

---

**Documentação criada em:** 11/11/2025
**Versão:** 1.0.0
