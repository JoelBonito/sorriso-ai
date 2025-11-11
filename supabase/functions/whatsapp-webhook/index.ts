// ═════════════════════════════════════════════════════════════════════════
// WHATSAPP WEBHOOK - EVOLUTION API
// ═════════════════════════════════════════════════════════════════════════
// Recebe webhooks do Evolution API e processa mensagens do WhatsApp
// ═════════════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Logger estruturado
function createLogger(runId: string) {
  const prefix = `[${runId.substring(0, 8)}]`;
  return {
    info: (msg: string, ...args: any[]) => console.log(`${prefix} ℹ️  ${msg}`, ...args),
    success: (msg: string, ...args: any[]) => console.log(`${prefix} ✓ ${msg}`, ...args),
    warn: (msg: string, ...args: any[]) => console.warn(`${prefix} ⚠️  ${msg}`, ...args),
    error: (msg: string, ...args: any[]) => console.error(`${prefix} ❌ ${msg}`, ...args),
  };
}

// ═════════════════════════════════════════════════════════════════════════
// INTERFACE: Evolution API Webhook
// ═════════════════════════════════════════════════════════════════════════

interface EvolutionMessage {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string; // Número do WhatsApp
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string; // Mensagem de texto
      imageMessage?: {
        url: string;
        mimetype: string;
        caption?: string;
      };
      documentMessage?: {
        url: string;
        mimetype: string;
        fileName: string;
      };
    };
    messageTimestamp: number;
  };
}

// ═════════════════════════════════════════════════════════════════════════
// FUNÇÃO: Extrair número de telefone
// ═════════════════════════════════════════════════════════════════════════

function extractPhoneNumber(remoteJid: string): string {
  // Formato: 5511999999999@s.whatsapp.net
  return remoteJid.split('@')[0];
}

// ═════════════════════════════════════════════════════════════════════════
// FUNÇÃO: Processar mensagem recebida
// ═════════════════════════════════════════════════════════════════════════

async function processInboundMessage(
  supabase: any,
  phone: string,
  contactName: string,
  messageType: string,
  content: string | null,
  mediaUrl: string | null,
  whatsappMessageId: string,
  log: any
) {
  log.info(`Processando mensagem de ${contactName} (${phone})`);

  // 1. Buscar ou criar conversa
  let { data: conversation, error: convError } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('phone_number', phone)
    .neq('state', 'completed')
    .neq('state', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (convError) {
    log.error('Erro ao buscar conversa:', convError);
    throw convError;
  }

  // Se não existe conversa ativa, criar nova
  if (!conversation) {
    log.info('Criando nova conversa');

    // Buscar user_id do dentista (primeiro usuário por enquanto)
    // TODO: Implementar lógica de roteamento para múltiplos dentistas
    const { data: users } = await supabase.auth.admin.listUsers();
    const dentistUserId = users?.users?.[0]?.id;

    if (!dentistUserId) {
      throw new Error('Nenhum usuário dentista encontrado');
    }

    const { data: newConv, error: createError } = await supabase
      .from('whatsapp_conversations')
      .insert({
        phone_number: phone,
        contact_name: contactName,
        state: 'greeting',
        user_id: dentistUserId,
        metadata: { source: 'whatsapp' }
      })
      .select()
      .single();

    if (createError) throw createError;
    conversation = newConv;
  } else {
    // Atualizar timestamp da última mensagem
    await supabase
      .from('whatsapp_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id);
  }

  // 2. Salvar mensagem recebida
  const { error: msgError } = await supabase
    .from('whatsapp_messages')
    .insert({
      conversation_id: conversation.id,
      direction: 'inbound',
      message_type: messageType,
      content,
      media_url: mediaUrl,
      whatsapp_message_id: whatsappMessageId,
      status: 'delivered'
    });

  if (msgError) {
    log.error('Erro ao salvar mensagem:', msgError);
    throw msgError;
  }

  log.success('Mensagem salva no banco de dados');

  // 3. Chamar agente de IA para processar
  log.info('Chamando agente de IA...');

  const { data: agentResponse, error: agentError } = await supabase.functions.invoke('whatsapp-agent', {
    body: {
      conversationId: conversation.id,
      phone,
      messageType,
      content,
      mediaUrl
    }
  });

  if (agentError) {
    log.error('Erro ao chamar agente:', agentError);
    throw agentError;
  }

  log.success('Agente processou mensagem com sucesso');
  return agentResponse;
}

// ═════════════════════════════════════════════════════════════════════════
// SERVIDOR PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const runId = crypto.randomUUID();
  const log = createLogger(runId);

  try {
    log.info('═══════════════════════════════════════');
    log.info('WEBHOOK RECEBIDO');
    log.info('═══════════════════════════════════════');

    // Criar cliente Supabase com service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse do body
    const body: EvolutionMessage = await req.json();
    log.info(`Evento: ${body.event}`);
    log.info(`Instância: ${body.instance}`);

    // Ignorar mensagens enviadas por nós (fromMe = true)
    if (body.data.key.fromMe) {
      log.info('Mensagem enviada por nós, ignorando');
      return new Response(
        JSON.stringify({ success: true, message: 'Ignored (fromMe)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Processar apenas mensagens recebidas
    if (body.event === 'messages.upsert') {
      const phone = extractPhoneNumber(body.data.key.remoteJid);
      const contactName = body.data.pushName || 'Cliente';
      const whatsappMessageId = body.data.key.id;

      log.info(`De: ${contactName} (${phone})`);

      // Determinar tipo e conteúdo da mensagem
      let messageType = 'text';
      let content: string | null = null;
      let mediaUrl: string | null = null;

      if (body.data.message?.conversation) {
        messageType = 'text';
        content = body.data.message.conversation;
        log.info(`Mensagem: "${content}"`);
      } else if (body.data.message?.imageMessage) {
        messageType = 'image';
        mediaUrl = body.data.message.imageMessage.url;
        content = body.data.message.imageMessage.caption || null;
        log.info(`Imagem recebida: ${mediaUrl}`);
      } else if (body.data.message?.documentMessage) {
        messageType = 'document';
        mediaUrl = body.data.message.documentMessage.url;
        content = body.data.message.documentMessage.fileName;
        log.info(`Documento recebido: ${content}`);
      } else {
        log.warn('Tipo de mensagem não suportado:', JSON.stringify(body.data.message).substring(0, 200));
        return new Response(
          JSON.stringify({ success: true, message: 'Unsupported message type' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Processar mensagem
      await processInboundMessage(
        supabase,
        phone,
        contactName,
        messageType,
        content,
        mediaUrl,
        whatsappMessageId,
        log
      );

      return new Response(
        JSON.stringify({ success: true, message: 'Message processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Outros eventos (status, etc)
    log.info('Evento não processado:', body.event);
    return new Response(
      JSON.stringify({ success: true, message: 'Event not processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    log.error('ERRO NO WEBHOOK');
    log.error('Mensagem:', message);

    return new Response(
      JSON.stringify({
        error: message,
        success: false,
        run_id: runId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
