# Generate Budget PDF - Edge Function

Edge Function para gerar PDFs de orçamentos odontológicos.

## Funcionalidade

1. Recebe um `budgetId`
2. Busca dados do orçamento com relacionamentos (paciente, simulação)
3. Busca configurações do usuário (dados da clínica, payment config)
4. Preenche template Markdown com os dados
5. Converte Markdown → HTML → PDF
6. Faz upload do PDF para storage bucket `budget-pdfs`
7. Atualiza o campo `pdf_url` na tabela `budgets`
8. Retorna a URL pública do PDF

## Como usar

### Chamada via JavaScript/TypeScript

```typescript
const { data, error } = await supabase.functions.invoke('generate-budget-pdf', {
  body: { budgetId: 'uuid-do-orcamento' }
});

if (error) {
  console.error('Erro ao gerar PDF:', error);
} else {
  console.log('PDF gerado:', data.pdf_url);
}
```

### Deploy

```bash
supabase functions deploy generate-budget-pdf
```

### Variáveis de ambiente necessárias

As variáveis são automaticamente disponibilizadas pela Edge Function:
- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (permissões admin)

## Limitações atuais

⚠️ **IMPORTANTE**: A conversão HTML → PDF está usando uma implementação temporária.

Para produção, é necessário:

1. **Opção 1**: Usar uma API externa de conversão
   - [PDFShift](https://pdfshift.io/)
   - [API2PDF](https://www.api2pdf.com/)
   - [DocRaptor](https://docraptor.com/)

2. **Opção 2**: Usar Puppeteer/Chrome Headless
   - Requer container customizado
   - Mais complexo mas maior controle

3. **Opção 3**: Biblioteca PDF nativa Deno
   - [pdf-lib](https://pdf-lib.js.org/)
   - Requer construir PDF manualmente

## Próximos passos

- [ ] Implementar conversão HTML → PDF real
- [ ] Adicionar tratamento de erros robusto
- [ ] Implementar retry logic para uploads
- [ ] Adicionar logs estruturados
- [ ] Otimizar performance (cache de templates)
- [ ] Adicionar testes unitários
