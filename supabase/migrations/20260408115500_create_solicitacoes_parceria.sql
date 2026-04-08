CREATE TABLE IF NOT EXISTS public.solicitacoes_parceria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    empresa TEXT,
    mensagem TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.solicitacoes_parceria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_anonymous_insert" ON public.solicitacoes_parceria;
CREATE POLICY "allow_anonymous_insert" ON public.solicitacoes_parceria
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_admin_select" ON public.solicitacoes_parceria;
CREATE POLICY "allow_admin_select" ON public.solicitacoes_parceria
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.administradores
            WHERE public.administradores.usuario_id = auth.uid()
        )
    );
