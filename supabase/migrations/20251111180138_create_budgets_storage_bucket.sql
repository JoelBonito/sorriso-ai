-- Criar storage bucket para PDFs de orçamentos
-- Fase 3: Serviço de Geração de PDF

-- Criar bucket 'budget-pdfs' se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('budget-pdfs', 'budget-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Usuários podem fazer upload de seus próprios PDFs
DROP POLICY IF EXISTS "Users can upload own budget PDFs" ON storage.objects;
CREATE POLICY "Users can upload own budget PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'budget-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Usuários podem atualizar seus próprios PDFs
DROP POLICY IF EXISTS "Users can update own budget PDFs" ON storage.objects;
CREATE POLICY "Users can update own budget PDFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'budget-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Usuários podem deletar seus próprios PDFs
DROP POLICY IF EXISTS "Users can delete own budget PDFs" ON storage.objects;
CREATE POLICY "Users can delete own budget PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'budget-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: PDFs são publicamente visíveis (para compartilhamento com pacientes)
DROP POLICY IF EXISTS "Budget PDFs are publicly accessible" ON storage.objects;
CREATE POLICY "Budget PDFs are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'budget-pdfs');

-- Comentário no bucket
COMMENT ON TABLE storage.buckets IS 'Armazena PDFs gerados de orçamentos odontológicos';
