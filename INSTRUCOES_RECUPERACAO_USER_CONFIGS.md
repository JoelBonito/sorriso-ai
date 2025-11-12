# 🔧 Instruções para Recuperar a Tabela user_configs

## 📋 Problema Identificado

A tabela `user_configs` foi deletada acidentalmente do Supabase, causando os seguintes problemas:

1. ❌ Não é possível salvar configurações na aba de Configurações
2. ❌ Erro 400 ao tentar salvar dados da clínica
3. ❌ Sistema não consegue carregar as configurações do usuário
4. ❌ Tipos TypeScript desatualizados causando inconsistências

## ✅ Solução Implementada

Criei uma migration completa que recria a tabela `user_configs` com **TODOS** os campos necessários:

### Campos incluídos:

#### Configurações de API (OPCIONAIS)
- `api_key` - API Key para serviço de IA
- `backend_url` - URL do backend
- `prompt_template` - Template do prompt
- `claude_api_key` - API Key do Claude
- `use_claude` - Flag para usar Claude

#### Dados do Usuário
- `user_name` - Nome completo
- `user_phone` - Telefone
- `user_email` - E-mail
- `profile_picture_url` - URL da foto de perfil

#### Dados da Clínica
- `clinic_name` - Nome da clínica
- `clinic_address` - Endereço
- `clinic_phone` - Telefone
- `clinic_email` - E-mail
- `clinic_cnpj` - CNPJ 📌 **NOVO**
- `clinic_dentist_name` - Nome do dentista responsável 📌 **NOVO**
- `clinic_cro` - CRO do responsável 📌 **NOVO**
- `clinic_logo_url` - URL da logomarca
- `clinic_zip_code` - CEP
- `clinic_city` - Cidade
- `clinic_state` - Estado (UF)

#### Configurações de Pagamento 📌 **NOVO**
- `payment_config` (JSONB) - Configurações de descontos e formas de pagamento:
  - `discount_cash` - Desconto à vista (%)
  - `discount_pix` - Desconto PIX (%)
  - `max_installments` - Parcelas máximas
  - `allow_credit_card` - Aceita cartão de crédito
  - `allow_debit_card` - Aceita cartão de débito
  - `allow_boleto` - Aceita boleto

#### Módulos do Sistema
- `crm_enabled` - Módulo CRM habilitado
- `facets_simulator_enabled` - Simulador de facetas
- `whitening_simulator_enabled` - Simulador de clareamento

## 🚀 Como Executar a Correção

### Passo 1: Executar a Migration no Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/sql

2. Copie o conteúdo do arquivo:
   ```
   supabase/migrations/20251112120000_recreate_user_configs_table.sql
   ```

3. Cole no editor SQL do Supabase

4. Clique em "Run" para executar a migration

5. Verifique se a tabela foi criada com sucesso:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'user_configs'
   AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

### Passo 2: Verificar os Tipos TypeScript

Os tipos TypeScript já foram atualizados automaticamente no arquivo:
```
src/integrations/supabase/types.ts
```

✅ Todos os campos novos foram adicionados:
- `clinic_cnpj`
- `clinic_dentist_name`
- `clinic_cro`
- `payment_config`

✅ Campos opcionais corrigidos:
- `api_key` (agora é `string | null`)
- `backend_url` (agora é `string | null`)
- `prompt_template` (agora é `string | null`)

### Passo 3: Testar o Sistema

Após executar a migration:

1. Faça logout e login novamente no sistema
2. Vá para a aba "Configurações"
3. Preencha os dados da clínica
4. Clique em "Salvar Configuração"
5. ✅ Deve salvar sem erros!

## 🔍 Verificações Adicionais

### Verificar RLS (Row Level Security)

A migration já cria automaticamente as políticas de segurança:

```sql
-- Ver políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_configs';
```

### Verificar Bucket de Logos

O bucket `clinic-logos` deve existir para upload de logomarcas:

```sql
-- Ver buckets
SELECT * FROM storage.buckets WHERE id = 'clinic-logos';
```

Se não existir, execute:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-logos', 'clinic-logos', true)
ON CONFLICT (id) DO NOTHING;
```

## 📊 Comparação: Antes vs Depois

| Item | ❌ Antes | ✅ Depois |
|------|---------|----------|
| Tabela user_configs | Deletada | ✅ Recriada |
| Campos obrigatórios | api_key, backend_url, prompt_template | Todos opcionais |
| Campo clinic_cnpj | ❌ Faltando | ✅ Adicionado |
| Campo clinic_dentist_name | ❌ Faltando | ✅ Adicionado |
| Campo clinic_cro | ❌ Faltando | ✅ Adicionado |
| Campo payment_config | ❌ Faltando | ✅ Adicionado (JSONB) |
| Tipos TypeScript | ❌ Desatualizados | ✅ Atualizados |
| Salvamento de configs | ❌ Erro 400 | ✅ Funciona |

## 🎯 Resumo das Mudanças

### Arquivos Criados:
1. `supabase/migrations/20251112120000_recreate_user_configs_table.sql` - Migration completa

### Arquivos Modificados:
1. `src/integrations/supabase/types.ts` - Tipos TypeScript atualizados

### Benefícios:
- ✅ Tabela recriada com todos os campos necessários
- ✅ Campos opcionais (não precisa configurar API imediatamente)
- ✅ Suporte completo a dados da clínica
- ✅ Configurações de pagamento (descontos, parcelas, etc.)
- ✅ RLS configurado corretamente
- ✅ Tipos TypeScript sincronizados com o banco

## 🆘 Troubleshooting

### Erro: "relation user_configs already exists"

Se você receber este erro, significa que a tabela já existe. Você tem duas opções:

**Opção 1: Deletar e recriar (CUIDADO: perde dados)**
```sql
DROP TABLE IF EXISTS public.user_configs CASCADE;
-- Depois execute a migration completa
```

**Opção 2: Adicionar apenas os campos faltantes**
```sql
ALTER TABLE public.user_configs
ADD COLUMN IF NOT EXISTS clinic_cnpj TEXT,
ADD COLUMN IF NOT EXISTS clinic_dentist_name TEXT,
ADD COLUMN IF NOT EXISTS clinic_cro TEXT,
ADD COLUMN IF NOT EXISTS payment_config JSONB DEFAULT '{
  "discount_cash": 10,
  "discount_pix": 5,
  "max_installments": 12,
  "allow_credit_card": true,
  "allow_debit_card": true,
  "allow_boleto": true
}'::jsonb;

-- Tornar campos opcionais
ALTER TABLE public.user_configs
ALTER COLUMN api_key DROP NOT NULL,
ALTER COLUMN backend_url DROP NOT NULL,
ALTER COLUMN prompt_template DROP NOT NULL;
```

### Erro: "permission denied"

Certifique-se de estar executando o SQL no painel do Supabase como proprietário do projeto.

### Erro ao salvar configurações

1. Limpe o cache do navegador
2. Faça logout e login novamente
3. Verifique se a migration foi executada com sucesso
4. Verifique os logs do console do navegador (F12)

## 📞 Suporte

Se ainda tiver problemas:

1. Verifique os logs do Supabase
2. Verifique o console do navegador (F12)
3. Teste com um novo usuário para isolar o problema
4. Execute a query de verificação para ver quais campos estão faltando

---

**Data de criação:** 2025-11-12
**Versão da migration:** 20251112120000
