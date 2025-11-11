# Guia Rápido: Implementação PDFShift (FREE - 50 PDFs/mês)

## ✅ Status da Implementação

**✅ CÓDIGO ATUALIZADO!** A Edge Function já está pronta para usar PDFShift.

---

## 🚀 PASSOS PARA ATIVAR (15 minutos)

### Passo 1: Criar Conta PDFShift FREE (5 min)

1. **Acesse:** https://pdfshift.io/register
2. **Preencha:**
   - Email
   - Senha
   - Nome
3. **Clique:** "Sign Up" (não precisa cartão de crédito!)
4. **Confirme email** (cheque sua caixa de entrada)

**✅ Plano FREE:** 50 documentos/mês (perfeito para começar!)

---

### Passo 2: Obter API Key (2 min)

1. **Faça login:** https://pdfshift.io/login
2. **Dashboard → API Keys**
3. **Copie sua API Key** (algo como: `sk_xxxxxxxxxxxxx`)

**⚠️ IMPORTANTE:** Guarde essa chave em local seguro!

---

### Passo 3: Configurar no Supabase (3 min)

#### Opção A: Via CLI (Recomendado)

```bash
# No terminal, na pasta do projeto:
supabase secrets set PDFSHIFT_API_KEY=sk_sua_api_key_aqui
```

**Exemplo:**
```bash
supabase secrets set PDFSHIFT_API_KEY=sk_abcd1234efgh5678ijkl
```

#### Opção B: Via Dashboard Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **sorriso-ai**
3. Vá em: **Settings → Edge Functions → Secrets**
4. Clique: **New secret**
5. Preencha:
   - **Name:** `PDFSHIFT_API_KEY`
   - **Value:** `sk_sua_api_key_aqui`
6. Clique: **Save**

---

### Passo 4: Deploy da Edge Function (2 min)

```bash
# Deploy da função atualizada
supabase functions deploy generate-budget-pdf
```

**Saída esperada:**
```
✓ Deployed Function generate-budget-pdf
  URL: https://seu-projeto.supabase.co/functions/v1/generate-budget-pdf
```

---

### Passo 5: Testar! (3 min)

#### Método 1: Pelo Sistema (Recomendado)

1. Acesse sua aplicação
2. Abra um orçamento existente
3. Clique em **"Gerar PDF"**
4. Aguarde ~3-5 segundos
5. **PDF abre automaticamente** (agora é um PDF REAL!)

#### Método 2: Verificar Logs

```bash
# Ver logs em tempo real
supabase functions logs generate-budget-pdf --follow
```

**Logs de sucesso:**
```
Iniciando conversão HTML→PDF com PDFShift...
PDF gerado com sucesso: {
  duration_ms: 2847,
  size_bytes: 125643,
  size_kb: 123
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

### PDF Gerado com Sucesso?

- [ ] PDF é um arquivo válido (não HTML)
- [ ] Abre no navegador sem erros
- [ ] Formato A4 correto
- [ ] Margens adequadas (não cortado)
- [ ] Imagens aparecem corretamente
- [ ] Tabelas formatadas
- [ ] Fontes renderizadas
- [ ] Pode fazer download
- [ ] Pode imprimir

### Se tudo OK: ✅ **SISTEMA PRONTO PARA PRODUÇÃO!**

---

## 🎯 O QUE MUDOU

### Antes (Temporário):
```typescript
// Retornava HTML como bytes
const encoder = new TextEncoder()
return encoder.encode(html)
```
**Resultado:** Arquivo "PDF" que era na verdade HTML

### Depois (PDFShift):
```typescript
// Converte HTML para PDF REAL
const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
  method: 'POST',
  body: JSON.stringify({
    source: html,
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
  })
})
return new Uint8Array(await response.arrayBuffer())
```
**Resultado:** PDF profissional, pronto para impressão

---

## 📊 MONITORAMENTO

### Ver Uso Mensal

1. **Dashboard PDFShift:** https://pdfshift.io/dashboard
2. **Métricas:**
   - PDFs gerados este mês: X/50
   - Tempo médio de conversão
   - Taxa de erro
   - Histórico de conversões

### Alertas Automáticos

Quando atingir **45/50 PDFs** (90%), PDFShift envia email de alerta.

**Opções:**
- Esperar próximo mês (reset)
- Upgrade para plano pago ($9/mês = 1.000 PDFs)

---

## 🐛 TROUBLESHOOTING

### Erro: "PDFSHIFT_API_KEY não está configurada"

**Causa:** Secret não foi configurada corretamente

**Solução:**
```bash
# Verificar secrets atuais
supabase secrets list

# Se não aparecer PDFSHIFT_API_KEY, adicionar:
supabase secrets set PDFSHIFT_API_KEY=sua_key_aqui

# Re-deploy
supabase functions deploy generate-budget-pdf
```

---

### Erro: "PDFShift HTTP 401: Unauthorized"

**Causa:** API Key inválida ou expirada

**Solução:**
1. Verificar API Key no dashboard PDFShift
2. Copiar novamente
3. Reconfigurar secret:
```bash
supabase secrets set PDFSHIFT_API_KEY=nova_key_aqui
```

---

### Erro: "PDFShift HTTP 429: Too Many Requests"

**Causa:** Limite de 50 PDFs/mês atingido

**Soluções:**
1. **Aguardar:** Reset automático no início do próximo mês
2. **Upgrade:** Plano $9/mês (1.000 PDFs)
3. **Temporário:** Usar conta de teste adicional

---

### PDF não abre ou está corrompido

**Causa:** Erro na conversão ou upload

**Diagnóstico:**
```bash
# Ver logs detalhados
supabase functions logs generate-budget-pdf --tail 50
```

**Soluções:**
- Verificar se imagens estão acessíveis (URLs públicas)
- Verificar tamanho do HTML (<5MB)
- Tentar regenerar PDF

---

### Imagens não aparecem no PDF

**Causa:** URLs das imagens não são públicas ou CORS

**Solução:**
1. Verificar RLS policies do bucket `simulation-images`
2. Testar URL da imagem diretamente no navegador
3. Garantir que URLs são públicas

---

## 💡 DICAS DE USO

### Economizar PDFs

Para economizar os 50 PDFs gratuitos:

1. **Não regere PDFs** desnecessariamente
   - Use botão "Ver PDF" para visualizar existente
   - Só use "Regenerar" se realmente necessário

2. **Durante testes:**
   - Use poucos orçamentos de teste
   - Delete PDFs de teste do storage

3. **Para produção:**
   - Gere PDF apenas quando orçamento estiver finalizado
   - Orçamentos em rascunho não precisam de PDF

### Otimizar Conversões

Para PDFs mais rápidos e menores:

1. **Comprimir imagens** antes do upload
2. **Limitar procedimentos** a 10 (já implementado)
3. **Remover dados desnecessários** do template

---

## 📈 QUANDO FAZER UPGRADE?

### Plano FREE (50 PDFs/mês) é suficiente se:
- ✅ Clínica pequena (5-10 orçamentos/mês)
- ✅ Fase inicial / testes
- ✅ Poucos pacientes

### Considere Upgrade ($9/mês = 1.000 PDFs) se:
- 📈 >40 PDFs/mês consistente
- 📈 Crescimento rápido
- 📈 Múltiplas clínicas
- 📈 Alto volume de orçamentos

**ROI:** $9/mês é ~R$45/mês (preço de 1 consulta)

---

## 🎉 PRONTO!

Seu sistema agora gera **PDFs profissionais e reais**!

### Benefícios Imediatos:

✅ **PDF Real** (não mais HTML disfarçado)
✅ **Formato A4 Perfeito** (pronto para impressão)
✅ **Imagens de Alta Qualidade**
✅ **Fontes Renderizadas Corretamente**
✅ **Compatível com Todos os Leitores** (Adobe, Chrome, etc.)
✅ **Download Funciona Perfeitamente**
✅ **Impressão Profissional**

### Próximos Passos:

1. ✅ **Testar** com orçamentos reais
2. ✅ **Validar** com usuários finais
3. ✅ **Monitorar** uso mensal
4. ✅ **Coletar feedback** para melhorias

---

## 📞 SUPORTE

### PDFShift:
- Documentação: https://docs.pdfshift.io
- Email: support@pdfshift.io
- Status: https://status.pdfshift.io

### Supabase:
- Documentação: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

**Data:** Janeiro 2025
**Versão:** 1.0 - FREE (50 PDFs/mês)
**Status:** ✅ Pronto para Produção
