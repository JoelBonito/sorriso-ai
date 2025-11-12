-- Adicionar serviços opcionais padrão para todos os usuários
-- Esta migration adiciona serviços comuns de consultórios odontológicos

-- Primeiro, criar as categorias para todos os usuários
INSERT INTO public.service_categories (user_id, name)
SELECT
  u.id as user_id,
  categoria.name
FROM auth.users u
CROSS JOIN (
  VALUES
    ('🦷 Clareamento Dentário'),
    ('💎 Facetas Dentárias'),
    ('🔧 Serviços Gerais de Suporte')
) AS categoria(name)
ON CONFLICT (user_id, name) DO NOTHING;

-- Inserir serviços de Clareamento para cada usuário existente
INSERT INTO public.services (user_id, name, description, tipo_servico, categoria, price, active, required, base)
SELECT
  u.id as user_id,
  servico.name,
  servico.description,
  'Serviço opcional' as tipo_servico,
  '🦷 Clareamento Dentário' as categoria,
  servico.price,
  true as active,
  false as required,
  false as base
FROM auth.users u
CROSS JOIN (
  VALUES
    ('Clareamento a Laser/LED', 'Clareamento dentário profissional em sessão única com laser ou LED', 1150.00),
    ('Consulta inicial e avaliação', 'Consulta inicial para avaliação do paciente e planejamento do tratamento de clareamento', 200.00),
    ('Limpeza profissional (profilaxia)', 'Limpeza dental profissional antes do procedimento de clareamento', 225.00),
    ('Raspagem e polimento', 'Procedimento de raspagem e polimento dental', 300.00),
    ('Aplicação de flúor pós-clareamento', 'Aplicação de flúor para proteção após o clareamento dental', 115.00),
    ('Moldeira personalizada para manutenção', 'Confecção de moldeira personalizada para manutenção caseira do clareamento', 275.00),
    ('Kit clareamento caseiro', 'Kit complementar para manutenção do clareamento em casa', 400.00),
    ('Tratamento de sensibilidade dentária', 'Tratamento para reduzir ou eliminar sensibilidade após clareamento', 225.00)
) AS servico(name, description, price)
ON CONFLICT DO NOTHING;

-- Inserir serviços de Facetas para cada usuário existente
INSERT INTO public.services (user_id, name, description, tipo_servico, categoria, price, active, required, base)
SELECT
  u.id as user_id,
  servico.name,
  servico.description,
  'Serviço opcional' as tipo_servico,
  '💎 Facetas Dentárias' as categoria,
  servico.price,
  true as active,
  false as required,
  false as base
FROM auth.users u
CROSS JOIN (
  VALUES
    ('Faceta em resina composta (por dente)', 'Faceta dentária confeccionada em resina composta de alta qualidade', 600.00),
    ('Faceta em porcelana/cerâmica (por dente)', 'Faceta dentária em porcelana ou cerâmica, mais resistente e estética', 2250.00),
    ('Lente de contato dental (por dente)', 'Lâmina ultrafina de porcelana para correção estética dental', 3000.00),
    ('Consulta e planejamento digital do sorriso (DSD)', 'Planejamento digital do sorriso usando tecnologia DSD (Digital Smile Design)', 450.00),
    ('Moldagem digital 3D', 'Moldagem digital tridimensional para maior precisão no planejamento', 300.00),
    ('Mock-up (teste estético do sorriso)', 'Prova estética do novo sorriso antes do procedimento definitivo', 400.00),
    ('Fotos e análise facial', 'Documentação fotográfica e análise facial para planejamento estético', 150.00),
    ('Faceta provisória (por dente)', 'Faceta provisória durante o período de confecção das facetas definitivas', 225.00),
    ('Gengivoplastia (correção da gengiva)', 'Cirurgia para correção e harmonização do contorno gengival', 1000.00),
    ('Clareamento prévio (antes das facetas)', 'Clareamento dental realizado antes da confecção das facetas', 1150.00),
    ('Manutenção/polimento anual das facetas', 'Manutenção e polimento anual para conservação das facetas', 300.00)
) AS servico(name, description, price)
ON CONFLICT DO NOTHING;

-- Inserir serviços gerais de suporte para cada usuário existente
INSERT INTO public.services (user_id, name, description, tipo_servico, categoria, price, active, required, base)
SELECT
  u.id as user_id,
  servico.name,
  servico.description,
  'Serviço opcional' as tipo_servico,
  '🔧 Serviços Gerais de Suporte' as categoria,
  servico.price,
  true as active,
  false as required,
  false as base
FROM auth.users u
CROSS JOIN (
  VALUES
    ('Radiografia panorâmica', 'Exame radiográfico panorâmico para avaliação completa da arcada dentária', 115.00),
    ('Documentação ortodôntica completa', 'Documentação completa incluindo radiografias, fotos e modelos de estudo', 375.00),
    ('Retorno/ajuste pós-procedimento', 'Consulta de retorno para avaliação e ajustes após procedimentos realizados', 50.00)
) AS servico(name, description, price)
ON CONFLICT DO NOTHING;

-- Adicionar comentário explicativo
COMMENT ON TABLE public.services IS 'Tabela de serviços odontológicos com categorização e preços por usuário';
