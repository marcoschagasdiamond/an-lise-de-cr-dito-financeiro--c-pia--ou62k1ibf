CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    senha_hash TEXT,
    nome TEXT,
    tipo_usuario TEXT,
    status TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS senha_hash TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS tipo_usuario TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_key'
    ) THEN
        ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);
    END IF;
END $$;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_usuarios" ON public.usuarios;
CREATE POLICY "authenticated_all_usuarios" ON public.usuarios
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
