// ═════════════════════════════════════════════════════════════════════════
// WHATSAPP AI AGENT - ORCHESTRATOR
// ═════════════════════════════════════════════════════════════════════════
// Agente conversacional de IA que guia o paciente pelo processo completo
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
// CONFIGURAÇÃO DO EVOLUTION API
// ═════════════════════════════════════════════════════════════════════════

async function sendWhatsAppMessage(
  phone: string,
  message: string,
  log: any
): Promise<void> {
  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
  const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE_NAME');

  if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance) {
    throw new Error('Evolution API não configurada. Configure EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE_NAME');
  }

  log.info(`Enviando mensagem para ${phone}`);

  const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    },
    body: JSON.stringify({
      number: phone,
      text: message
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao enviar mensagem: ${error}`);
  }

  log.success('Mensagem enviada');
}

async function sendWhatsAppImage(
  phone: string,
  imageUrl: string,
  caption: string,
  log: any
): Promise<void> {
  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
  const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE_NAME');

  log.info(`Enviando imagem para ${phone}`);

  const response = await fetch(`${evolutionApiUrl}/message/sendMedia/${evolutionInstance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    },
    body: JSON.stringify({
      number: phone,
      mediatype: 'image',
      media: imageUrl,
      caption
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao enviar imagem: ${error}`);
  }

  log.success('Imagem enviada');
}

async function sendWhatsAppDocument(
  phone: string,
  documentUrl: string,
  fileName: string,
  log: any
): Promise<void> {
  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
  const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE_NAME');

  log.info(`Enviando documento para ${phone}: ${fileName}`);

  const response = await fetch(`${evolutionApiUrl}/message/sendMedia/${evolutionInstance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': evolutionApiKey
    },
    body: JSON.stringify({
      number: phone,
      mediatype: 'document',
      media: documentUrl,
      fileName
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao enviar documento: ${error}`);
  }

  log.success('Documento enviado');
}

// ═════════════════════════════════════════════════════════════════════════
// STATE MACHINE - ESTADOS DA CONVERSA
// ═════════════════════════════════════════════════════════════════════════

const STATE_HANDLERS = {
  greeting: handleGreeting,
  waiting_name: handleWaitingName,
  waiting_treatment: handleWaitingTreatment,
  waiting_photo: handleWaitingPhoto,
  processing: handleProcessing,
  showing_result: handleShowingResult,
  generating_budget: handleGeneratingBudget,
  waiting_approval: handleWaitingApproval,
  scheduling: handleScheduling,
};

// ─────────────────────────────────────────────────────────────────────────
// ESTADO: greeting (Boas-vindas)
// ─────────────────────────────────────────────────────────────────────────

async function handleGreeting(
  supabase: any,
  conversation: any,
  phone: string,
  messageType: string,
  content: string | null,
  log: any
) {
  log.info('Estado: GREETING');

  const welcomeMessage = `Olá! 😊 Bem-vindo(a) à nossa clínica odontológica!

Sou o assistente virtual e vou te ajudar a fazer uma simulação do seu novo sorriso!

Para começar, qual é o seu nome?`;

  await sendWhatsAppMessage(phone, welcomeMessage, log);

  // Salvar resposta do bot
  await supabase.from('whatsapp_messages').insert({
    conversation_id: conversation.id,
    direction: 'outbound',
    message_type: 'text',
    content: welcomeMessage,
    status: 'sent'
  });

  // Atualizar estado
  await supabase
    .from('whatsapp_conversations')
    .update({ state: 'waiting_name' })
    .eq('id', conversation.id);
}

// ─────────────────────────────────────────────────────────────────────────
// ESTADO: waiting_name (Aguardando nome)
// ─────────────────────────────────────────────────────────────────────────

async function handleWaitingName(
  supabase: any,
  conversation: any,
  phone: string,
  messageType: string,
  content: string | null,
  log: any
) {
  log.info('Estado: WAITING_NAME');

  if (!content || content.trim().length < 2) {
    await sendWhatsAppMessage(phone, 'Por favor, me diga seu nome completo.', log);
    return;
  }

  const patientName = content.trim();

  const treatmentMessage = `Prazer em conhecer você, ${patientName}! 🤝

Agora me diga: qual tratamento você tem interesse?

Digite:
1️⃣ - Facetas Dentárias
2️⃣ - Clareamento Dental

(Envie apenas o número)`;

  await sendWhatsAppMessage(phone, treatmentMessage, log);

  // Salvar resposta
  await supabase.from('whatsapp_messages').insert({
    conversation_id: conversation.id,
    direction: 'outbound',
    message_type: 'text',
    content: treatmentMessage,
    status: 'sent'
  });

  // Atualizar conversa
  await supabase
    .from('whatsapp_conversations')
    .update({
      patient_name: patientName,
      patient_phone: phone,
      state: 'waiting_treatment'
    })
    .eq('id', conversation.id);
}

// ─────────────────────────────────────────────────────────────────────────
// ESTADO: waiting_treatment (Aguardando tipo de tratamento)
// ─────────────────────────────────────────────────────────────────────────

async function handleWaitingTreatment(
  supabase: any,
  conversation: any,
  phone: string,
  messageType: string,
  content: string | null,
  log: any
) {
  log.info('Estado: WAITING_TREATMENT');

  if (!content) {
    await sendWhatsAppMessage(phone, 'Por favor, escolha uma opção (1 ou 2).', log);
    return;
  }

  const choice = content.trim();
  let treatmentType: string;
  let treatmentName: string;

  if (choice === '1' || choice.toLowerCase().includes('faceta')) {
    treatmentType = 'facetas';
    treatmentName = 'Facetas Dentárias';
  } else if (choice === '2' || choice.toLowerCase().includes('clarea')) {
    treatmentType = 'clareamento';
    treatmentName = 'Clareamento Dental';
  } else {
    await sendWhatsAppMessage(phone, 'Opção inválida. Por favor, digite 1 para Facetas ou 2 para Clareamento.', log);
    return;
  }

  const photoMessage = `Perfeito! Você escolheu: *${treatmentName}* ✨

Agora preciso de uma foto do seu sorriso! 📸

*IMPORTANTE:*
✅ Tire a foto com boa iluminação
✅ Mostre bem os dentes
✅ Sorria naturalmente
✅ Foto de frente, sem filtros

Envie a foto quando estiver pronta! 🙂`;

  await sendWhatsAppMessage(phone, photoMessage, log);

  // Salvar resposta
  await supabase.from('whatsapp_messages').insert({
    conversation_id: conversation.id,
    direction: 'outbound',
    message_type: 'text',
    content: photoMessage,
    status: 'sent'
  });

  // Atualizar conversa
  await supabase
    .from('whatsapp_conversations')
    .update({
      treatment_type: treatmentType,
      state: 'waiting_photo'
    })
    .eq('id', conversation.id);
}

// ─────────────────────────────────────────────────────────────────────────
// ESTADO: waiting_photo (Aguardando foto)
// ─────────────────────────────────────────────────────────────────────────

async function handleWaitingPhoto(
  supabase: any,
  conversation: any,
  phone: string,
  messageType: string,
  content: string | null,
  mediaUrl: string | null,
  log: any
) {
  log.info('Estado: WAITING_PHOTO');

  if (messageType !== 'image' || !mediaUrl) {
    await sendWhatsAppMessage(phone, 'Por favor, envie uma *foto* do seu sorriso (não texto). 📸', log);
    return;
  }

  const processingMessage = `Foto recebida! ✅

Estou processando sua simulação...
Isso pode levar de 30 segundos a 1 minuto.

Aguarde um momento! ⏳🦷✨`;

  await sendWhatsAppMessage(phone, processingMessage, log);

  // Salvar resposta
  await supabase.from('whatsapp_messages').insert({
    conversation_id: conversation.id,
    direction: 'outbound',
    message_type: 'text',
    content: processingMessage,
    status: 'sent'
  });

  // Atualizar estado para processing
  await supabase
    .from('whatsapp_conversations')
    .update({ state: 'processing' })
    .eq('id', conversation.id);

  // Chamar função de simulação (assíncrona)
  log.info('Iniciando processamento da simulação...');
  processSimulation(supabase, conversation, mediaUrl, phone, log).catch(err => {
    log.error('Erro ao processar simulação:', err);
  });
}

// ─────────────────────────────────────────────────────────────────────────
// FUNÇÃO: Processar simulação (assíncrona)
// ─────────────────────────────────────────────────────────────────────────

async function processSimulation(
  supabase: any,
  conversation: any,
  imageUrl: string,
  phone: string,
  log: any
) {
  try {
    log.info('Baixando imagem...');

    // Baixar imagem do WhatsApp e converter para base64
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const imageBase64 = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))}`;

    log.info('Imagem convertida para base64');

    // Criar paciente
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert({
        name: conversation.patient_name,
        phone: conversation.patient_phone,
        user_id: conversation.user_id
      })
      .select()
      .single();

    if (patientError) throw patientError;

    log.info(`Paciente criado: ${patient.id}`);

    // Upload da imagem original
    const fileName = `${conversation.user_id}/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('original-images')
      .upload(fileName, imageBlob);

    if (uploadError) throw uploadError;

    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('original-images')
      .getPublicUrl(fileName);

    // Criar simulação
    const { data: simulation, error: simError } = await supabase
      .from('simulations')
      .insert({
        user_id: conversation.user_id,
        patient_id: patient.id,
        patient_name: conversation.patient_name,
        patient_phone: conversation.patient_phone,
        treatment_type: conversation.treatment_type,
        original_image_url: originalUrl,
        status: 'processing',
        teeth_count: conversation.treatment_type === 'facetas' ? 6 : 0
      })
      .select()
      .single();

    if (simError) throw simError;

    log.info(`Simulação criada: ${simulation.id}`);

    // Chamar Edge Function para gerar simulação
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('process-dental-facets', {
      body: {
        imageBase64,
        action: 'generate',
        treatment_type: conversation.treatment_type
      }
    });

    if (edgeError) throw edgeError;

    if (!edgeData.processedImageBase64) {
      throw new Error('Imagem processada não foi retornada');
    }

    // Upload da imagem processada
    const processedBlob = await fetch(edgeData.processedImageBase64).then(r => r.blob());
    const processedFileName = `${conversation.user_id}/${Date.now()}-processed.jpg`;

    const { error: processedUploadError } = await supabase.storage
      .from('processed-images')
      .upload(processedFileName, processedBlob, {
        contentType: 'image/jpeg'
      });

    if (processedUploadError) throw processedUploadError;

    const { data: { publicUrl: processedUrl } } = supabase.storage
      .from('processed-images')
      .getPublicUrl(processedFileName);

    // Atualizar simulação
    await supabase
      .from('simulations')
      .update({
        processed_image_url: processedUrl,
        status: 'completed'
      })
      .eq('id', simulation.id);

    log.success('Simulação processada com sucesso');

    // Atualizar conversa
    await supabase
      .from('whatsapp_conversations')
      .update({
        simulation_id: simulation.id,
        patient_id: patient.id,
        state: 'showing_result'
      })
      .eq('id', conversation.id);

    // Enviar resultado
    await sendWhatsAppImage(phone, originalUrl, '📸 *ANTES* - Seu sorriso atual', log);
    await sendWhatsAppImage(phone, processedUrl, `✨ *DEPOIS* - Simulação com ${conversation.treatment_type === 'facetas' ? 'Facetas' : 'Clareamento'}`, log);

    const resultMessage = `🎉 *Simulação concluída!*

O que você achou do resultado?

Digite:
1️⃣ - Gostei! Quero o orçamento
2️⃣ - Não gostei, fazer nova simulação

(Envie apenas o número)`;

    await sendWhatsAppMessage(phone, resultMessage, log);

    // Salvar mensagens
    await supabase.from('whatsapp_messages').insert([
      {
        conversation_id: conversation.id,
        direction: 'outbound',
        message_type: 'image',
        media_url: originalUrl,
        content: 'ANTES - Seu sorriso atual',
        status: 'sent'
      },
      {
        conversation_id: conversation.id,
        direction: 'outbound',
        message_type: 'image',
        media_url: processedUrl,
        content: 'DEPOIS - Simulação',
        status: 'sent'
      },
      {
        conversation_id: conversation.id,
        direction: 'outbound',
        message_type: 'text',
        content: resultMessage,
        status: 'sent'
      }
    ]);

  } catch (error) {
    log.error('Erro no processamento:', error);

    await sendWhatsAppMessage(
      phone,
      '😔 Desculpe, ocorreu um erro ao processar sua simulação.\n\nPor favor, tente enviar outra foto.',
      log
    );

    // Voltar para waiting_photo
    await supabase
      .from('whatsapp_conversations')
      .update({ state: 'waiting_photo' })
      .eq('id', conversation.id);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// ESTADO: showing_result (Mostrando resultado)
// ─────────────────────────────────────────────────────────────────────────

async function handleShowingResult(
  supabase: any,
  conversation: any,
  phone: string,
  messageType: string,
  content: string | null,
  log: any
) {
  log.info('Estado: SHOWING_RESULT');

  if (!content) {
    await sendWhatsAppMessage(phone, 'Por favor, escolha uma opção (1 ou 2).', log);
    return;
  }

  const choice = content.trim();

  if (choice === '1' || choice.toLowerCase().includes('gost')) {
    // Cliente gostou - gerar orçamento
    const budgetMessage = `Que ótimo! 😊

Vou gerar seu orçamento personalizado...
Aguarde alguns segundos! 📄💰`;

    await sendWhatsAppMessage(phone, budgetMessage, log);

    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      message_type: 'text',
      content: budgetMessage,
      status: 'sent'
    });

    await supabase
      .from('whatsapp_conversations')
      .update({ state: 'generating_budget' })
      .eq('id', conversation.id);

    // Gerar orçamento (assíncrono)
    generateBudget(supabase, conversation, phone, log).catch(err => {
      log.error('Erro ao gerar orçamento:', err);
    });

  } else if (choice === '2' || choice.toLowerCase().includes('não') || choice.toLowerCase().includes('nova')) {
    // Cliente não gostou - nova simulação
    const retryMessage = `Sem problemas! 😊

Vamos fazer uma nova simulação.
Envie outra foto do seu sorriso! 📸`;

    await sendWhatsAppMessage(phone, retryMessage, log);

    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      message_type: 'text',
      content: retryMessage,
      status: 'sent'
    });

    await supabase
      .from('whatsapp_conversations')
      .update({ state: 'waiting_photo' })
      .eq('id', conversation.id);

  } else {
    await sendWhatsAppMessage(phone, 'Opção inválida. Digite 1 se gostou ou 2 para nova simulação.', log);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// FUNÇÃO: Gerar orçamento (assíncrona)
// ─────────────────────────────────────────────────────────────────────────

async function generateBudget(
  supabase: any,
  conversation: any,
  phone: string,
  log: any
) {
  try {
    log.info('Gerando orçamento...');

    // Buscar simulação
    const { data: simulation } = await supabase
      .from('simulations')
      .select('*')
      .eq('id', conversation.simulation_id)
      .single();

    if (!simulation) throw new Error('Simulação não encontrada');

    // TODO: Implementar geração de PDF do orçamento
    // Por enquanto, enviar mensagem de texto com valores

    const isFacetas = conversation.treatment_type === 'facetas';
    const valor = isFacetas ? 3600 : 1200;
    const valorDesconto = valor * 0.9;

    const budgetText = `💰 *ORÇAMENTO PERSONALIZADO*

*Tratamento:* ${isFacetas ? 'Facetas em Resina Composta' : 'Clareamento Dental Profissional'}
${isFacetas ? '*Dentes:* 6 facetas (zona do sorriso)\n' : ''}
*Valor:* R$ ${valor.toFixed(2)}
*Desconto à vista (10%):* -R$ ${(valor * 0.1).toFixed(2)}

✨ *VALOR FINAL: R$ ${valorDesconto.toFixed(2)}*

Esse valor pode ser parcelado em até ${isFacetas ? '6x' : '4x'} sem juros no cartão!

*Você aprova este orçamento?*

Digite:
1️⃣ - Sim, quero agendar consulta
2️⃣ - Não, obrigado

(Envie apenas o número)`;

    await sendWhatsAppMessage(phone, budgetText, log);

    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      message_type: 'text',
      content: budgetText,
      status: 'sent'
    });

    await supabase
      .from('whatsapp_conversations')
      .update({ state: 'waiting_approval' })
      .eq('id', conversation.id);

    log.success('Orçamento enviado');

  } catch (error) {
    log.error('Erro ao gerar orçamento:', error);

    await sendWhatsAppMessage(
      phone,
      '😔 Desculpe, ocorreu um erro ao gerar o orçamento.\n\nPor favor, entre em contato conosco.',
      log
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// ESTADO: waiting_approval (Aguardando aprovação do orçamento)
// ─────────────────────────────────────────────────────────────────────────

async function handleWaitingApproval(
  supabase: any,
  conversation: any,
  phone: string,
  messageType: string,
  content: string | null,
  log: any
) {
  log.info('Estado: WAITING_APPROVAL');

  if (!content) {
    await sendWhatsAppMessage(phone, 'Por favor, escolha uma opção (1 ou 2).', log);
    return;
  }

  const choice = content.trim();

  if (choice === '1' || choice.toLowerCase().includes('sim') || choice.toLowerCase().includes('agendar')) {
    // Cliente aprovou - agendar consulta
    const scheduleMessage = `Ótimo! 🎉

Vamos agendar sua consulta!

Nosso horário de atendimento:
📅 Segunda a Sábado
🕐 9h às 19h

*Qual dia você prefere?*
Envie no formato: DD/MM/AAAA
Exemplo: 15/12/2025`;

    await sendWhatsAppMessage(phone, scheduleMessage, log);

    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      message_type: 'text',
      content: scheduleMessage,
      status: 'sent'
    });

    await supabase
      .from('whatsapp_conversations')
      .update({ state: 'scheduling' })
      .eq('id', conversation.id);

  } else if (choice === '2' || choice.toLowerCase().includes('não') || choice.toLowerCase().includes('obrigado')) {
    // Cliente recusou
    const thankYouMessage = `Entendo! 😊

Obrigado pelo seu interesse!
Se mudar de ideia, é só me chamar novamente.

Até logo! 👋`;

    await sendWhatsAppMessage(phone, thankYouMessage, log);

    await supabase.from('whatsapp_messages').insert({
      conversation_id: conversation.id,
      direction: 'outbound',
      message_type: 'text',
      content: thankYouMessage,
      status: 'sent'
    });

    await supabase
      .from('whatsapp_conversations')
      .update({
        state: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', conversation.id);

  } else {
    await sendWhatsAppMessage(phone, 'Opção inválida. Digite 1 para agendar ou 2 para recusar.', log);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// ESTADO: scheduling (Agendando consulta)
// ─────────────────────────────────────────────────────────────────────────

async function handleScheduling(
  supabase: any,
  conversation: any,
  phone: string,
  messageType: string,
  content: string | null,
  log: any
) {
  log.info('Estado: SCHEDULING');

  // TODO: Implementar lógica completa de agendamento
  // Por enquanto, apenas confirmar

  const confirmMessage = `✅ *Agendamento confirmado!*

Você receberá uma confirmação em breve com todos os detalhes da consulta.

Nos vemos em breve! 😊🦷✨

Até logo! 👋`;

  await sendWhatsAppMessage(phone, confirmMessage, log);

  await supabase.from('whatsapp_messages').insert({
    conversation_id: conversation.id,
    direction: 'outbound',
    message_type: 'text',
    content: confirmMessage,
    status: 'sent'
  });

  await supabase
    .from('whatsapp_conversations')
    .update({
      state: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', conversation.id);
}

// ─────────────────────────────────────────────────────────────────────────
// ESTADO: processing (Processando - não recebe mensagens)
// ─────────────────────────────────────────────────────────────────────────

async function handleProcessing(
  supabase: any,
  conversation: any,
  phone: string,
  messageType: string,
  content: string | null,
  log: any
) {
  log.info('Estado: PROCESSING - Aguardando processamento');

  await sendWhatsAppMessage(
    phone,
    'Estou processando sua simulação... Aguarde mais um pouco! ⏳',
    log
  );
}

// ═════════════════════════════════════════════════════════════════════════
// SERVIDOR PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const runId = crypto.randomUUID();
  const log = createLogger(runId);

  try {
    log.info('═══════════════════════════════════════');
    log.info('AGENTE DE IA - PROCESSANDO');
    log.info('═══════════════════════════════════════');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      conversationId,
      phone,
      messageType,
      content,
      mediaUrl
    } = await req.json();

    // Buscar conversa
    const { data: conversation, error: convError } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversa não encontrada');
    }

    log.info(`Estado atual: ${conversation.state}`);

    // Chamar handler apropriado baseado no estado
    const handler = STATE_HANDLERS[conversation.state as keyof typeof STATE_HANDLERS];

    if (handler) {
      await handler(supabase, conversation, phone, messageType, content, mediaUrl, log);
    } else {
      log.error(`Handler não encontrado para estado: ${conversation.state}`);
      throw new Error(`Estado inválido: ${conversation.state}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    log.error('ERRO NO AGENTE');
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
