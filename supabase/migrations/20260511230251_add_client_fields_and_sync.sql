-- Add new fields to clientes table for unified form data
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS nome_responsavel text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS valor_captacao numeric;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS prazo_desejado text;
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS descricao_projeto text;

-- Ensure anonymous users can insert and read from the Consult Plan public page
DROP POLICY IF EXISTS "allow_anonymous_insert_clientes" ON public.clientes;
CREATE POLICY "allow_anonymous_insert_clientes" ON public.clientes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_anonymous_select_clientes" ON public.clientes;
CREATE POLICY "allow_anonymous_select_clientes" ON public.clientes FOR SELECT USING (true);
