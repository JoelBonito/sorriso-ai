# Fase 7: Testes e Validação - GUIA COMPLETO ✅

## Resumo

Guia completo de testes e validação do sistema de geração de PDF de orçamentos odontológicos. Este documento fornece checklists, casos de teste, procedimentos de validação e troubleshooting.

---

## 📋 CHECKLIST COMPLETA DE TESTES

### ✅ 1. Configuração Inicial

#### 1.1. Configuração da Clínica
- [ ] Acessar `/configuracoes`
- [ ] Verificar todos os campos de "Dados da Clínica":
  - [ ] Nome da Clínica (obrigatório)
  - [ ] CNPJ (formato: XX.XXX.XXX/XXXX-XX)
  - [ ] Endereço (Rua, número, bairro)
  - [ ] CEP (formato: XXXXX-XXX)
  - [ ] Cidade
  - [ ] Estado (UF)
  - [ ] Telefone
  - [ ] E-mail
  - [ ] Nome do Responsável Técnico
  - [ ] CRO (Número do conselho)
  - [ ] URL do Logo (opcional)

#### 1.2. Configuração de Pagamento
- [ ] Verificar seção "Condições de Pagamento":
  - [ ] Desconto à Vista (Dinheiro) % (padrão: 10%)
  - [ ] Desconto PIX % (padrão: 5%)
  - [ ] Máximo de Parcelas (padrão: 12x)
  - [ ] Aceita Cartão de Crédito (padrão: SIM)
  - [ ] Aceita Cartão de Débito (padrão: SIM)
  - [ ] Aceita Boleto (padrão: SIM)
- [ ] Salvar configurações
- [ ] Verificar toast de sucesso
- [ ] Recarregar página e confirmar persistência

### ✅ 2. Criação de Paciente

- [ ] Acessar página de pacientes
- [ ] Criar novo paciente com dados completos:
  - [ ] Nome: "João da Silva"
  - [ ] CPF: "123.456.789-00"
  - [ ] Telefone: "(11) 98765-4321"
  - [ ] E-mail: "joao@email.com"
- [ ] Salvar e verificar listagem
- [ ] Criar segundo paciente com dados incompletos:
  - [ ] Nome: "Maria Santos"
  - [ ] CPF: (deixar vazio)
  - [ ] Telefone: "(11) 91234-5678"
  - [ ] E-mail: (deixar vazio)

### ✅ 3. Criação de Simulação

#### 3.1. Simulação Completa (com imagens)
- [ ] Acessar simulações
- [ ] Criar nova simulação:
  - [ ] Upload de imagem "antes"
  - [ ] Upload de imagem "depois"
  - [ ] Associar ao paciente "João da Silva"
- [ ] Verificar preview das imagens
- [ ] Salvar simulação

#### 3.2. Simulação sem Imagens
- [ ] Criar simulação para "Maria Santos"
- [ ] Não fazer upload de imagens
- [ ] Salvar simulação

### ✅ 4. Criação de Orçamentos

#### 4.1. Orçamento com 1 Procedimento
- [ ] Criar novo orçamento para "João da Silva"
- [ ] Adicionar 1 procedimento:
  - [ ] Serviço: "Faceta de Porcelana"
  - [ ] Categoria: "Estética"
  - [ ] Dentes: "11, 21"
  - [ ] Quantidade: 2
  - [ ] Valor Unitário: R$ 2.500,00
- [ ] Verificar subtotal: R$ 5.000,00
- [ ] Aplicar desconto de 10%
- [ ] Verificar total final: R$ 4.500,00
- [ ] Associar simulação com imagens
- [ ] Salvar orçamento

#### 4.2. Orçamento com 3 Procedimentos
- [ ] Criar orçamento para "João da Silva"
- [ ] Adicionar 3 procedimentos:
  1. [ ] Faceta de Porcelana | Dentes: 11, 12, 21, 22 | Qtd: 4 | Valor: R$ 2.500,00
  2. [ ] Clareamento Dental | Dentes: - | Qtd: 1 | Valor: R$ 800,00
  3. [ ] Limpeza Profissional | Dentes: - | Qtd: 1 | Valor: R$ 150,00
- [ ] Verificar subtotal: R$ 10.950,00
- [ ] Aplicar desconto de 5%
- [ ] Verificar total final: R$ 10.402,50
- [ ] Salvar orçamento

#### 4.3. Orçamento com 10 Procedimentos
- [ ] Criar orçamento para "Maria Santos"
- [ ] Adicionar 10 procedimentos diferentes
- [ ] Verificar que todos aparecem na listagem
- [ ] Salvar orçamento

#### 4.4. Orçamento sem Simulação
- [ ] Criar orçamento para "Maria Santos"
- [ ] Não associar simulação
- [ ] Adicionar 2 procedimentos
- [ ] Salvar orçamento

### ✅ 5. Geração de PDF

#### 5.1. PDF com Dados Completos
**Orçamento**: João da Silva (1 procedimento, com simulação)

- [ ] Abrir modal de detalhes do orçamento
- [ ] Verificar botão "Gerar PDF" está visível
- [ ] Clicar em "Gerar PDF"
- [ ] Verificar estados de loading:
  - [ ] Botão muda para "Gerando PDF..."
  - [ ] Ícone de refresh com animação spin
  - [ ] Botão fica desabilitado
- [ ] Aguardar conclusão (~2-5 segundos)
- [ ] Verificar feedback de sucesso:
  - [ ] Toast: "PDF gerado com sucesso!"
  - [ ] PDF abre em nova aba automaticamente
  - [ ] Modal atualiza para mostrar 3 botões: "Ver PDF", "Download", "Regenerar"

#### 5.2. Validação do Conteúdo do PDF

**No PDF gerado, verificar:**

**Cabeçalho:**
- [ ] Logo da clínica aparece (se configurado)
- [ ] Nome da clínica está correto
- [ ] CNPJ está formatado corretamente
- [ ] Endereço completo
- [ ] CEP, Cidade/Estado estão corretos
- [ ] Telefone e e-mail estão presentes

**Simulação:**
- [ ] Seção "SIMULAÇÃO DO TRATAMENTO" aparece
- [ ] Imagem "ANTES" está visível e bem dimensionada
- [ ] Imagem "DEPOIS" está visível e bem dimensionada
- [ ] Imagens não estão distorcidas
- [ ] Imagens têm bordas arredondadas
- [ ] Labels "ANTES" e "DEPOIS" estão visíveis

**Dados do Orçamento:**
- [ ] Nº do orçamento está correto
- [ ] Data de emissão está correta (formato: DD/MM/AAAA)
- [ ] Data de validade está correta
- [ ] Status está traduzido corretamente

**Dados do Paciente:**
- [ ] Nome do paciente está correto
- [ ] CPF está formatado (XXX.XXX.XXX-XX)
- [ ] Telefone está presente
- [ ] E-mail está presente

**Tabela de Procedimentos:**
- [ ] Coluna "Cód." com numeração sequencial (001, 002, ...)
- [ ] Coluna "Procedimento" com nomes corretos
- [ ] Coluna "Dente(s)" com números dos dentes
- [ ] Coluna "Qtd" com quantidades
- [ ] Coluna "Valor Unit." formatado como R$ X.XXX,XX
- [ ] Coluna "Subtotal" com cálculos corretos
- [ ] Linhas vazias NÃO aparecem (se tem 1 proc, só 1 linha aparece)

**Resumo Financeiro:**
- [ ] Subtotal está correto
- [ ] Desconto está correto
- [ ] VALOR TOTAL está correto e em destaque
- [ ] Valores formatados em Real brasileiro

**Condições de Pagamento:**
- [ ] Formas de pagamento listadas com percentuais corretos
- [ ] Valor à vista com desconto calculado corretamente
- [ ] Valor parcelado com número de parcelas e valor por parcela

**Observações Importantes:**
- [ ] Texto "ORÇAMENTO INDICATIVO" presente
- [ ] Texto "AVALIAÇÃO PRESENCIAL OBRIGATÓRIA" presente
- [ ] Texto "POSSÍVEIS VARIAÇÕES" presente
- [ ] Texto "VALIDADE" presente
- [ ] Texto "GARANTIA" presente
- [ ] Fonte menor que o resto do documento

**Rodapé:**
- [ ] Seção "ACEITAÇÃO DO ORÇAMENTO" presente
- [ ] Linha para assinatura do paciente
- [ ] Campo para data
- [ ] Nome do Responsável Técnico
- [ ] Número do CRO
- [ ] Dados da clínica repetidos no final

**Layout e Formatação:**
- [ ] Documento em formato A4
- [ ] Margens adequadas (não cortado)
- [ ] Fontes legíveis
- [ ] Hierarquia visual clara (H1 > H2 > H3)
- [ ] Cores profissionais
- [ ] Sem quebras de página no meio de seções
- [ ] Tabelas não cortadas entre páginas

#### 5.3. PDF com Dados Incompletos
**Orçamento**: Maria Santos (sem simulação, sem CPF paciente)

- [ ] Gerar PDF
- [ ] Verificar que seção "SIMULAÇÃO" NÃO aparece
- [ ] Verificar que logo NÃO aparece (se não configurado)
- [ ] Verificar que CPF aparece como "-"
- [ ] Verificar que documento ainda está bem formatado

#### 5.4. Regenerar PDF
**Orçamento**: Qualquer orçamento que já tem PDF

- [ ] Abrir modal de detalhes
- [ ] Verificar 3 botões: "Ver PDF", "Download", "Regenerar"
- [ ] Clicar em "Regenerar"
- [ ] Verificar loading state no botão "Regenerar"
- [ ] Aguardar conclusão
- [ ] Verificar que novo PDF foi gerado (URL diferente)
- [ ] Verificar que PDF abre automaticamente

#### 5.5. Download de PDF
- [ ] Clicar no botão "Download"
- [ ] Verificar que arquivo é baixado
- [ ] Verificar nome do arquivo (contém budgetId e timestamp)
- [ ] Abrir arquivo baixado
- [ ] Confirmar que é um PDF válido

#### 5.6. Ver PDF Existente
- [ ] Clicar no botão "Ver PDF"
- [ ] Verificar que PDF abre em nova aba
- [ ] Verificar que é o PDF correto
- [ ] Fechar aba e voltar ao modal

### ✅ 6. Testes de Configuração de Pagamento

#### 6.1. Alterar Descontos
- [ ] Ir para `/configuracoes`
- [ ] Alterar "Desconto à Vista" para 15%
- [ ] Alterar "Desconto PIX" para 8%
- [ ] Salvar configurações
- [ ] Criar novo orçamento de R$ 1.000,00
- [ ] Gerar PDF
- [ ] Verificar no PDF:
  - [ ] "Dinheiro (15% desconto)"
  - [ ] "PIX (8% desconto)"
  - [ ] À vista: R$ 850,00
  - [ ] Cálculos corretos

#### 6.2. Alterar Parcelas
- [ ] Alterar "Máximo de Parcelas" para 18x
- [ ] Salvar configurações
- [ ] Criar orçamento de R$ 3.600,00
- [ ] Gerar PDF
- [ ] Verificar no PDF:
  - [ ] "Parcelado: 18x de R$ 200,00"

#### 6.3. Desabilitar Formas de Pagamento
- [ ] Desmarcar "Aceita Cartão de Débito"
- [ ] Desmarcar "Aceita Boleto"
- [ ] Salvar configurações
- [ ] Gerar novo PDF
- [ ] Verificar que formas desabilitadas não aparecem

### ✅ 7. Testes de Procedimentos

#### 7.1. Orçamento com 1 Procedimento
- [ ] Criar orçamento com 1 item
- [ ] Gerar PDF
- [ ] Verificar que só 1 linha aparece na tabela
- [ ] Verificar que linhas 002-010 NÃO aparecem

#### 7.2. Orçamento com 5 Procedimentos
- [ ] Criar orçamento com 5 itens
- [ ] Gerar PDF
- [ ] Verificar que 5 linhas aparecem (001-005)
- [ ] Verificar que linhas 006-010 NÃO aparecem

#### 7.3. Orçamento com 10 Procedimentos
- [ ] Criar orçamento com 10 itens
- [ ] Gerar PDF
- [ ] Verificar que todas as 10 linhas aparecem (001-010)
- [ ] Verificar que tabela está bem formatada
- [ ] Verificar que não há quebra de página no meio da tabela

#### 7.4. Procedimentos com Dentes
- [ ] Criar procedimento com dentes: "11, 12, 21, 22"
- [ ] Gerar PDF
- [ ] Verificar que coluna "Dente(s)" mostra "11, 12, 21, 22"

#### 7.5. Procedimentos sem Dentes
- [ ] Criar procedimento sem especificar dentes
- [ ] Gerar PDF
- [ ] Verificar que coluna "Dente(s)" mostra "-"

### ✅ 8. Testes de Imagens

#### 8.1. Simulação com Before e After
- [ ] Criar simulação com 2 imagens
- [ ] Gerar PDF
- [ ] Verificar seção "SIMULAÇÃO DO TRATAMENTO" presente
- [ ] Verificar 2 imagens lado a lado
- [ ] Verificar dimensionamento adequado

#### 8.2. Simulação com Apenas Before
- [ ] Criar simulação com só imagem "antes"
- [ ] Gerar PDF
- [ ] Verificar que seção ainda aparece
- [ ] Verificar que imagem "antes" está presente
- [ ] Verificar tratamento da imagem "depois" ausente

#### 8.3. Simulação com Apenas After
- [ ] Criar simulação com só imagem "depois"
- [ ] Gerar PDF
- [ ] Verificar que seção ainda aparece
- [ ] Verificar que imagem "depois" está presente

#### 8.4. Sem Simulação
- [ ] Criar orçamento sem associar simulação
- [ ] Gerar PDF
- [ ] Verificar que seção "SIMULAÇÃO DO TRATAMENTO" NÃO aparece
- [ ] Verificar que documento vai direto para "DADOS DO ORÇAMENTO"

#### 8.5. Imagens Grandes
- [ ] Upload de imagem muito grande (>5MB)
- [ ] Criar simulação e orçamento
- [ ] Gerar PDF
- [ ] Verificar que imagem foi redimensionada adequadamente
- [ ] Verificar que não distorceu

#### 8.6. Imagens Pequenas
- [ ] Upload de imagem pequena (<100KB)
- [ ] Criar simulação e orçamento
- [ ] Gerar PDF
- [ ] Verificar que imagem não ficou pixelada

### ✅ 9. Testes de Erro e Casos Extremos

#### 9.1. Clínica sem Logo
- [ ] Remover URL do logo nas configurações
- [ ] Gerar PDF
- [ ] Verificar que seção do logo NÃO aparece
- [ ] Verificar que documento ainda está bem formatado

#### 9.2. Paciente com CPF Inválido
- [ ] Criar paciente com CPF: "12345678900" (sem formatação)
- [ ] Gerar PDF
- [ ] Verificar que CPF é exibido formatado: "123.456.789-00"

#### 9.3. Paciente sem CPF
- [ ] Criar paciente sem CPF
- [ ] Gerar PDF
- [ ] Verificar que campo CPF mostra "-"

#### 9.4. Orçamento com Valores Altos
- [ ] Criar orçamento com total > R$ 100.000,00
- [ ] Gerar PDF
- [ ] Verificar formatação de valores grandes
- [ ] Verificar que não há overflow na tabela

#### 9.5. Orçamento com Desconto 100%
- [ ] Criar orçamento
- [ ] Aplicar desconto de 100%
- [ ] Gerar PDF
- [ ] Verificar que total é R$ 0,00
- [ ] Verificar que documento está correto

#### 9.6. Erro de Rede
- [ ] Desconectar internet
- [ ] Tentar gerar PDF
- [ ] Verificar toast de erro
- [ ] Verificar mensagem de erro clara
- [ ] Reconectar internet
- [ ] Tentar novamente
- [ ] Verificar que funciona

#### 9.7. Clique Duplo em "Gerar PDF"
- [ ] Clicar em "Gerar PDF"
- [ ] Clicar novamente rapidamente
- [ ] Verificar que segunda chamada é ignorada (botão desabilitado)
- [ ] Verificar que só 1 PDF é gerado

#### 9.8. Fechar Modal Durante Geração
- [ ] Clicar em "Gerar PDF"
- [ ] Fechar modal imediatamente
- [ ] Aguardar alguns segundos
- [ ] Reabrir modal
- [ ] Verificar se PDF foi gerado ou se houve erro

### ✅ 10. Testes de Performance

#### 10.1. Tempo de Geração
- [ ] Gerar 5 PDFs diferentes
- [ ] Medir tempo de cada geração
- [ ] Verificar que tempo médio < 10 segundos
- [ ] Verificar que não há timeouts

#### 10.2. PDFs Simultâneos
- [ ] Abrir 3 modais de orçamentos diferentes
- [ ] Clicar "Gerar PDF" nos 3 ao mesmo tempo
- [ ] Verificar que todos são gerados com sucesso
- [ ] Verificar que não há conflitos

#### 10.3. Tamanho dos PDFs
- [ ] Gerar PDF simples (1 procedimento, sem imagens)
- [ ] Verificar tamanho do arquivo
- [ ] Gerar PDF completo (10 procedimentos, com imagens)
- [ ] Verificar tamanho do arquivo
- [ ] Confirmar que tamanhos são razoáveis (<2MB cada)

### ✅ 11. Testes Cross-Browser

#### 11.1. Chrome
- [ ] Abrir aplicação no Chrome
- [ ] Executar testes principais (5.1 a 5.6)
- [ ] Verificar funcionamento completo

#### 11.2. Firefox
- [ ] Abrir aplicação no Firefox
- [ ] Executar testes principais
- [ ] Verificar funcionamento completo

#### 11.3. Safari
- [ ] Abrir aplicação no Safari
- [ ] Executar testes principais
- [ ] Verificar funcionamento completo

#### 11.4. Mobile (Chrome)
- [ ] Abrir aplicação no celular (Chrome Android)
- [ ] Gerar PDF
- [ ] Verificar que PDF abre corretamente
- [ ] Verificar que download funciona

### ✅ 12. Testes de Impressão

#### 12.1. Imprimir PDF Gerado
- [ ] Gerar PDF
- [ ] Abrir em nova aba
- [ ] Ctrl+P (ou Cmd+P no Mac)
- [ ] Verificar preview de impressão:
  - [ ] Formato A4
  - [ ] Margens adequadas
  - [ ] Nada cortado
  - [ ] Cores adequadas
  - [ ] Fontes legíveis

#### 12.2. Imprimir Múltiplas Páginas
- [ ] Gerar PDF grande (10 procedimentos + imagens)
- [ ] Verificar que tem mais de 1 página
- [ ] Imprimir preview
- [ ] Verificar que quebras de página estão corretas
- [ ] Verificar que seções não são cortadas no meio

---

## 🎯 CASOS DE TESTE DETALHADOS

### Caso de Teste 1: Geração de PDF Completo

**Objetivo:** Validar geração de PDF com todos os dados preenchidos

**Pré-condições:**
- Sistema configurado completamente
- Paciente cadastrado com todos os dados
- Simulação com imagens before/after
- Orçamento criado com 3 procedimentos

**Passos:**
1. Acessar lista de orçamentos
2. Clicar no orçamento de teste
3. Verificar modal de detalhes
4. Clicar em "Gerar PDF"
5. Aguardar conclusão
6. Verificar toast de sucesso
7. Verificar que PDF abre automaticamente
8. Validar conteúdo conforme checklist seção 5.2

**Resultado Esperado:**
- PDF gerado em <10 segundos
- Todos os placeholders preenchidos
- Layout profissional e bem formatado
- Sem erros de formatação

**Resultado Obtido:**
```
[PREENCHER APÓS EXECUÇÃO]
✅ Sucesso / ❌ Falha
Tempo de geração: ___ segundos
Observações: ___________
```

---

### Caso de Teste 2: PDF com Dados Incompletos

**Objetivo:** Validar comportamento com dados ausentes

**Pré-condições:**
- Clínica sem logo configurado
- Paciente sem CPF e e-mail
- Orçamento sem simulação
- 1 procedimento sem especificar dentes

**Passos:**
1. Criar orçamento conforme pré-condições
2. Gerar PDF
3. Validar que seções condicionais não aparecem
4. Validar que campos vazios mostram "-"

**Resultado Esperado:**
- Seção de logo não aparece
- Seção de simulação não aparece
- CPF mostra "-"
- E-mail mostra "-"
- Dentes mostra "-"
- Documento ainda está bem formatado

**Resultado Obtido:**
```
[PREENCHER APÓS EXECUÇÃO]
✅ Sucesso / ❌ Falha
Observações: ___________
```

---

### Caso de Teste 3: Cálculos de Pagamento

**Objetivo:** Validar cálculos automáticos de parcelas e descontos

**Pré-condições:**
- Desconto à vista: 10%
- Desconto PIX: 5%
- Máximo de parcelas: 12x
- Orçamento de R$ 6.000,00

**Passos:**
1. Configurar conforme pré-condições
2. Criar orçamento de R$ 6.000,00
3. Gerar PDF
4. Validar valores no PDF

**Resultado Esperado:**
- À vista (dinheiro): R$ 5.400,00 (10% desconto)
- À vista (PIX): R$ 5.700,00 (5% desconto)
- Parcelado: 12x de R$ 500,00
- Todos os valores formatados em Real

**Resultado Obtido:**
```
[PREENCHER APÓS EXECUÇÃO]
✅ Sucesso / ❌ Falha
À vista (dinheiro): R$ ___
À vista (PIX): R$ ___
Parcelado: ___x de R$ ___
```

---

### Caso de Teste 4: 10 Procedimentos

**Objetivo:** Validar suporte a máximo de procedimentos

**Pré-condições:**
- Orçamento com 10 procedimentos diferentes

**Passos:**
1. Criar orçamento com 10 itens
2. Gerar PDF
3. Contar linhas na tabela de procedimentos
4. Verificar formatação

**Resultado Esperado:**
- Exatamente 10 linhas (001-010)
- Todas preenchidas corretamente
- Tabela não quebra entre páginas
- Cálculos corretos

**Resultado Obtido:**
```
[PREENCHER APÓS EXECUÇÃO]
✅ Sucesso / ❌ Falha
Número de linhas visíveis: ___
Tabela bem formatada: Sim / Não
```

---

### Caso de Teste 5: Regenerar PDF

**Objetivo:** Validar regeneração de PDF existente

**Pré-condições:**
- Orçamento que já tem PDF gerado

**Passos:**
1. Abrir modal do orçamento
2. Anotar URL do PDF atual
3. Clicar em "Regenerar"
4. Aguardar conclusão
5. Comparar URLs

**Resultado Esperado:**
- Novo PDF é gerado (URL diferente)
- Timestamp no nome do arquivo é atualizado
- PDF antigo ainda é acessível (se tiver a URL)
- Novo PDF abre automaticamente

**Resultado Obtido:**
```
[PREENCHER APÓS EXECUÇÃO]
✅ Sucesso / ❌ Falha
URL antiga: ___________
URL nova: ___________
São diferentes: Sim / Não
```

---

### Caso de Teste 6: Erro de Rede

**Objetivo:** Validar tratamento de erros

**Passos:**
1. Desconectar internet
2. Tentar gerar PDF
3. Verificar mensagem de erro
4. Reconectar internet
5. Tentar novamente

**Resultado Esperado:**
- Toast de erro aparece
- Mensagem clara e compreensível
- Botão volta ao estado normal
- Após reconectar, funciona normalmente

**Resultado Obtido:**
```
[PREENCHER APÓS EXECUÇÃO]
✅ Sucesso / ❌ Falha
Mensagem de erro: ___________
Recuperou após reconexão: Sim / Não
```

---

## 🔧 GUIA DE TROUBLESHOOTING

### Problema 1: PDF não é gerado

**Sintomas:**
- Botão fica em loading indefinidamente
- Timeout após muito tempo
- Erro não específico

**Possíveis Causas:**
1. Edge Function não está deployada
2. Erro na Edge Function
3. Budget ID inválido
4. Dados obrigatórios faltando

**Diagnóstico:**
```bash
# Verificar logs da Edge Function
supabase functions logs generate-budget-pdf

# Verificar se budget existe
# Na console do Supabase: SELECT * FROM budgets WHERE id = 'xxx'
```

**Soluções:**
1. Deploy da Edge Function:
   ```bash
   supabase functions deploy generate-budget-pdf
   ```

2. Verificar dados do budget no banco
3. Verificar user_configs tem todos os campos

---

### Problema 2: Placeholders não são substituídos

**Sintomas:**
- PDF mostra `{{CLINIC_NAME}}` em vez do nome real
- Outros placeholders não substituídos

**Possíveis Causas:**
1. Mapeamento de dados incorreto
2. Config do usuário não encontrado
3. Erro no fillTemplate

**Diagnóstico:**
```typescript
// Adicionar log temporário em budgetTemplateService.ts
console.log('Template data:', templateData);
```

**Soluções:**
1. Verificar que user_configs existe para o usuário
2. Verificar que todos os campos estão no formato correto (camelCase no código, snake_case no DB)
3. Re-salvar configurações na UI

---

### Problema 3: Imagens não aparecem no PDF

**Sintomas:**
- Seção de simulação aparece mas sem imagens
- Imagens quebradas

**Possíveis Causas:**
1. URLs das imagens inválidas
2. Imagens não são públicas
3. CORS bloqueando acesso

**Diagnóstico:**
```bash
# Verificar storage bucket
# Console Supabase > Storage > simulation-images

# Verificar URLs das imagens
# Console Supabase > Select * from simulations WHERE id = 'xxx'
```

**Soluções:**
1. Verificar RLS policies no bucket de simulações
2. Verificar que URLs são públicas
3. Testar URL diretamente no navegador
4. Re-upload das imagens se necessário

---

### Problema 4: Linhas vazias de procedimentos aparecem

**Sintomas:**
- Tabela mostra linhas com "- | - | - | - | -"
- Mais de 10 linhas aparecem

**Possível Causa:**
- Regex de remoção de linhas vazias não está funcionando

**Solução:**
```typescript
// Verificar em budgetTemplateService.ts linha ~281
filled = filled.replace(/^\|.*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|.*$/gm, '');

// Se não funcionar, testar regex alternativa
filled = filled.split('\n').filter(line => {
  return !(/^\|\s*\d+\s*\|.*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|\s*-\s*\|/.test(line));
}).join('\n');
```

---

### Problema 5: PDF tem quebras de página no meio de seções

**Sintomas:**
- Tabelas cortadas entre páginas
- Imagens cortadas

**Possível Causa:**
- CSS de page-break não está sendo aplicado

**Solução:**
```typescript
// Verificar em generate-budget-pdf/index.ts
// CSS deve ter:
table, img, div {
  page-break-inside: avoid;
}

// Se não funcionar, adicionar explicitamente no template:
<div style="page-break-inside: avoid !important;">
  <!-- conteúdo -->
</div>
```

---

### Problema 6: Cálculos de pagamento incorretos

**Sintomas:**
- Valor à vista não bate com desconto esperado
- Parcelas com valores errados

**Diagnóstico:**
```typescript
// Adicionar log em budgetTemplateService.ts > calculatePaymentConditions
console.log('Total:', totalPrice);
console.log('Config:', paymentConfig);
console.log('Cash discount:', cashDiscount);
console.log('Cash price:', totalPrice * (1 - cashDiscount));
```

**Soluções:**
1. Verificar que payment_config está correto no user_configs
2. Verificar cálculos em calculatePaymentConditions()
3. Verificar formatação de números (usar . para decimal, não ,)

---

### Problema 7: Seções condicionais não funcionam

**Sintomas:**
- Logo aparece mesmo sem URL
- Simulação aparece mesmo sem imagens

**Diagnóstico:**
```typescript
// Adicionar log em processConditionals
console.log('Checking IF_HAS_LOGO:', data.CLINIC_LOGO_URL);
console.log('Result:', data.CLINIC_LOGO_URL && data.CLINIC_LOGO_URL.trim() !== '');
```

**Solução:**
1. Verificar que processConditionals() é chamado DEPOIS de substituir placeholders
2. Verificar ordem no fillTemplate():
   - 1º: substituir {{PLACEHOLDERS}}
   - 2º: processConditionals()
   - 3º: remover linhas vazias

---

### Problema 8: Formatação de CPF/CNPJ incorreta

**Sintomas:**
- CPF aparece sem pontos e hífen
- CNPJ sem formatação

**Solução:**
```typescript
// Verificar formatCPF em budgetTemplateService.ts
function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '-';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return cpf; // Retorna original se não tiver 11 dígitos
}

// Adicionar formatCNPJ similar se necessário
```

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Funcionalidade Core

- [ ] ✅ PDFs são gerados com sucesso em <10 segundos
- [ ] ✅ Todos os placeholders são preenchidos corretamente
- [ ] ✅ Seções condicionais funcionam (logo, simulação)
- [ ] ✅ Cálculos de pagamento estão corretos
- [ ] ✅ Suporta 1-10 procedimentos dinamicamente
- [ ] ✅ Linhas vazias são removidas automaticamente

### Layout e Formatação

- [ ] ✅ Formato A4 com margens adequadas
- [ ] ✅ Imagens dimensionadas corretamente (não distorcidas)
- [ ] ✅ Tabelas bem formatadas
- [ ] ✅ Sem quebras de página no meio de seções
- [ ] ✅ Fontes legíveis e hierarquia visual clara
- [ ] ✅ Valores monetários formatados em Real brasileiro

### UX

- [ ] ✅ Loading states claros durante geração
- [ ] ✅ Toast de sucesso/erro apropriados
- [ ] ✅ PDF abre automaticamente após geração
- [ ] ✅ Botões de Ver/Download/Regenerar funcionam
- [ ] ✅ Não permite cliques duplos (botão desabilitado)

### Robustez

- [ ] ✅ Funciona com dados incompletos (sem distorcer layout)
- [ ] ✅ Tratamento de erros adequado
- [ ] ✅ Recupera de falhas de rede
- [ ] ✅ Não quebra com valores extremos
- [ ] ✅ Funciona em diferentes navegadores

### Performance

- [ ] ✅ Tempo de geração <10 segundos
- [ ] ✅ Tamanho dos PDFs razoável (<2MB)
- [ ] ✅ Suporta geração simultânea
- [ ] ✅ Não causa timeout

---

## 📊 RELATÓRIO DE TESTES

### Template de Relatório

```markdown
# Relatório de Testes - Fase 7
**Data:** ___/___/2025
**Testador:** ___________
**Ambiente:** Produção / Homologação / Local

## Resumo Executivo
- Total de testes executados: ___
- Testes com sucesso: ___
- Testes com falha: ___
- Taxa de sucesso: ___%

## Testes Executados

### 1. Configuração Inicial
✅ / ❌ - Observações: ___________

### 2. Criação de Paciente
✅ / ❌ - Observações: ___________

### 3. Criação de Simulação
✅ / ❌ - Observações: ___________

### 4. Criação de Orçamentos
✅ / ❌ - Observações: ___________

### 5. Geração de PDF
✅ / ❌ - Observações: ___________
- Tempo médio de geração: ___ segundos
- Tamanho médio dos PDFs: ___ KB

### 6. Configuração de Pagamento
✅ / ❌ - Observações: ___________

### 7. Testes de Procedimentos
✅ / ❌ - Observações: ___________

### 8. Testes de Imagens
✅ / ❌ - Observações: ___________

### 9. Casos Extremos
✅ / ❌ - Observações: ___________

### 10. Performance
✅ / ❌ - Observações: ___________

### 11. Cross-Browser
✅ / ❌ - Observações: ___________

### 12. Impressão
✅ / ❌ - Observações: ___________

## Bugs Encontrados

### Bug #1
- **Severidade:** Alta / Média / Baixa
- **Descrição:** ___________
- **Passos para reproduzir:** ___________
- **Comportamento esperado:** ___________
- **Comportamento observado:** ___________
- **Screenshot:** ___________

### Bug #2
[Repetir template acima]

## Melhorias Sugeridas
1. ___________
2. ___________
3. ___________

## Conclusão
[Resumo geral dos testes, se o sistema está pronto para produção, etc.]

## Próximos Passos
- [ ] Corrigir bugs críticos
- [ ] Implementar melhorias sugeridas
- [ ] Re-testar funcionalidades afetadas
- [ ] Deploy para produção
```

---

## 🎓 GUIA DE VALIDAÇÃO RÁPIDA

Para validação rápida do sistema (checklist mínimo):

### 5 Minutos de Validação

1. **Configurar Sistema (1 min)**
   - [ ] Preencher dados da clínica
   - [ ] Configurar payment_config

2. **Criar Dados de Teste (2 min)**
   - [ ] Criar 1 paciente completo
   - [ ] Criar 1 simulação com imagens
   - [ ] Criar 1 orçamento com 3 procedimentos

3. **Gerar e Validar PDF (2 min)**
   - [ ] Gerar PDF
   - [ ] Verificar que todos os dados aparecem
   - [ ] Verificar layout profissional
   - [ ] Testar download

**Se todos os itens acima passam: Sistema OK para uso básico ✅**

---

## 📝 NOTAS FINAIS

### Limitações Conhecidas

1. **Conversão HTML → PDF Temporária**
   - Atualmente a Edge Function usa implementação simplificada
   - Para produção: integrar API real (PDFShift, Puppeteer, etc.)
   - Ver: `supabase/functions/generate-budget-pdf/README.md`

2. **Template Inline na Edge Function**
   - Template está hardcoded na função
   - Ideal: carregar de storage ou usar template do repositório
   - Por ora funciona para todas as necessidades

3. **Sem Histórico de Versões**
   - Regenerar PDF sobrescreve anterior
   - URL antiga ainda funciona mas não é rastreada
   - Melhoria futura: histórico de PDFs gerados

### Recomendações para Produção

1. **Antes do Deploy:**
   - [ ] Executar todos os testes desta fase
   - [ ] Corrigir todos os bugs críticos
   - [ ] Integrar API real de conversão PDF
   - [ ] Fazer backup do banco de dados

2. **Após Deploy:**
   - [ ] Monitorar logs da Edge Function
   - [ ] Verificar taxa de sucesso na geração
   - [ ] Coletar feedback dos usuários
   - [ ] Ajustar template conforme necessário

3. **Manutenção Contínua:**
   - [ ] Revisar template mensalmente
   - [ ] Atualizar com novos requisitos legais
   - [ ] Otimizar performance se necessário
   - [ ] Adicionar novos campos conforme demanda

---

**Status**: Fase 7 DOCUMENTAÇÃO COMPLETA ✅
**Próximo**: Executar testes e preencher relatórios
**Progresso**: 7 de 7 fases (100%)

🎉 **Sistema de Orçamentos Completo!**
