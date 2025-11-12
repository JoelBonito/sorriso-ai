# Adicionar Serviços Opcionais Padrão

Esta migration adiciona **22 serviços opcionais padrão** ao banco de dados para todos os usuários existentes.

## Serviços Incluídos

### 🦷 Clareamento Dentário (8 serviços)
1. **Clareamento a Laser/LED** - R$ 1.150,00
2. **Consulta inicial e avaliação** - R$ 200,00
3. **Limpeza profissional (profilaxia)** - R$ 225,00
4. **Raspagem e polimento** - R$ 300,00
5. **Aplicação de flúor pós-clareamento** - R$ 115,00
6. **Moldeira personalizada para manutenção** - R$ 275,00
7. **Kit clareamento caseiro** - R$ 400,00
8. **Tratamento de sensibilidade dentária** - R$ 225,00

### 💎 Facetas Dentárias (11 serviços)
1. **Faceta em resina composta (por dente)** - R$ 600,00
2. **Faceta em porcelana/cerâmica (por dente)** - R$ 2.250,00
3. **Lente de contato dental (por dente)** - R$ 3.000,00
4. **Consulta e planejamento digital do sorriso (DSD)** - R$ 450,00
5. **Moldagem digital 3D** - R$ 300,00
6. **Mock-up (teste estético do sorriso)** - R$ 400,00
7. **Fotos e análise facial** - R$ 150,00
8. **Faceta provisória (por dente)** - R$ 225,00
9. **Gengivoplastia (correção da gengiva)** - R$ 1.000,00
10. **Clareamento prévio (antes das facetas)** - R$ 1.150,00
11. **Manutenção/polimento anual das facetas** - R$ 300,00

### 🔧 Serviços Gerais de Suporte (3 serviços)
1. **Radiografia panorâmica** - R$ 115,00
2. **Documentação ortodôntica completa** - R$ 375,00
3. **Retorno/ajuste pós-procedimento** - R$ 50,00

## Como Executar a Migration

### Opção 1: Arquivo de Migration Automática
O arquivo de migration foi criado em:
```
supabase/migrations/20251112225759_add_default_optional_services.sql
```

Se você usar o Supabase CLI, a migration será aplicada automaticamente ao executar:
```bash
supabase db push
```

### Opção 2: Executar Manualmente no Supabase Dashboard

1. Acesse o **Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/hqexulgmmtghwtgnqtfy/sql
   ```

2. Copie todo o conteúdo do arquivo:
   ```
   supabase/run-migrations.sql
   ```

3. Cole no SQL Editor e execute

4. Verifique os resultados nas queries de verificação que aparecem ao final

## Estrutura dos Serviços

Todos os serviços são inseridos com as seguintes características:

- **tipo_servico**: `Serviço opcional`
- **categoria**: `🦷 Clareamento Dentário`, `💎 Facetas Dentárias` ou `🔧 Serviços Gerais de Suporte`
- **active**: `true` (ativo por padrão)
- **required**: `false` (não obrigatório)
- **base**: `false` (não é serviço base)
- **user_id**: Criado para cada usuário existente

## Categorias Criadas

A migration também cria as 3 categorias na tabela `service_categories` para todos os usuários:

1. **🦷 Clareamento Dentário** - Serviços relacionados a clareamento dental
2. **💎 Facetas Dentárias** - Serviços relacionados a facetas e estética dental
3. **🔧 Serviços Gerais de Suporte** - Serviços auxiliares e de diagnóstico

## Verificação

Após executar a migration, você pode verificar se os serviços foram criados corretamente:

### Contar serviços por categoria
```sql
SELECT
  categoria,
  COUNT(*) as total_servicos
FROM public.services
WHERE tipo_servico = 'Serviço opcional'
  AND categoria IN ('🦷 Clareamento Dentário', '💎 Facetas Dentárias', '🔧 Serviços Gerais de Suporte')
GROUP BY categoria;
```

**Resultado esperado:**
- 🦷 Clareamento Dentário: 8 serviços × número de usuários
- 💎 Facetas Dentárias: 11 serviços × número de usuários
- 🔧 Serviços Gerais de Suporte: 3 serviços × número de usuários

### Verificar seus serviços
```sql
SELECT
  categoria,
  name,
  price,
  active
FROM public.services
WHERE user_id = auth.uid()
  AND tipo_servico = 'Serviço opcional'
ORDER BY categoria, name;
```

## Importante

⚠️ **Atenção**: Esta migration usa `ON CONFLICT DO NOTHING`, o que significa:
- Se um serviço com o mesmo nome já existir para um usuário, ele NÃO será duplicado
- É seguro executar esta migration múltiplas vezes
- Novos usuários que se cadastrarem DEPOIS da migration NÃO receberão esses serviços automaticamente

## Próximos Passos

Se você quiser que novos usuários recebam esses serviços automaticamente ao se cadastrar, você precisará:

1. Criar uma trigger function que insira esses serviços quando um novo usuário é criado
2. Ou criar um script de inicialização que rode quando o usuário faz login pela primeira vez

Consulte a documentação do Supabase sobre triggers para mais informações.
