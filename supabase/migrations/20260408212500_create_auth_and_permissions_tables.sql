-- 1. Tabela usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    senha_hash TEXT,
    nome TEXT,
    tipo_usuario TEXT,
    status TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que as colunas existam
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS senha_hash TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS tipo_usuario TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();

-- Constraints para usuarios
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_key'
    ) THEN
        ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_tipo_usuario_check'
    ) THEN
        ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_tipo_usuario_check CHECK (tipo_usuario IN ('admin', 'parceiro', 'cliente'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_status_check'
    ) THEN
        ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_status_check CHECK (status IN ('ativo', 'inativo'));
    END IF;
END $$;

-- 2. Tabela permissoes_admin
CREATE TABLE IF NOT EXISTS public.permissoes_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    pode_aprovar_parceiros BOOLEAN NOT NULL DEFAULT false,
    pode_gerenciar_clientes BOOLEAN NOT NULL DEFAULT false,
    pode_gerenciar_admins BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir colunas permissoes_admin
ALTER TABLE public.permissoes_admin ADD COLUMN IF NOT EXISTS usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE;
ALTER TABLE public.permissoes_admin ADD COLUMN IF NOT EXISTS pode_aprovar_parceiros BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.permissoes_admin ADD COLUMN IF NOT EXISTS pode_gerenciar_clientes BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.permissoes_admin ADD COLUMN IF NOT EXISTS pode_gerenciar_admins BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.permissoes_admin ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. Tabela permissoes_parceiro
CREATE TABLE IF NOT EXISTS public.permissoes_parceiro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    pode_gerenciar_clientes BOOLEAN NOT NULL DEFAULT false,
    pode_ver_comissoes BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir colunas permissoes_parceiro
ALTER TABLE public.permissoes_parceiro ADD COLUMN IF NOT EXISTS usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE;
ALTER TABLE public.permissoes_parceiro ADD COLUMN IF NOT EXISTS pode_gerenciar_clientes BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.permissoes_parceiro ADD COLUMN IF NOT EXISTS pode_ver_comissoes BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.permissoes_parceiro ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4. Tabela permissoes_cliente
CREATE TABLE IF NOT EXISTS public.permissoes_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    pode_ver_projetos BOOLEAN NOT NULL DEFAULT false,
    pode_enviar_documentos BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garantir colunas permissoes_cliente
ALTER TABLE public.permissoes_cliente ADD COLUMN IF NOT EXISTS usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE;
ALTER TABLE public.permissoes_cliente ADD COLUMN IF NOT EXISTS pode_ver_projetos BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.permissoes_cliente ADD COLUMN IF NOT EXISTS pode_enviar_documentos BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.permissoes_cliente ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_parceiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_cliente ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "authenticated_all_usuarios" ON public.usuarios;
CREATE POLICY "authenticated_all_usuarios" ON public.usuarios
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_permissoes_admin" ON public.permissoes_admin;
CREATE POLICY "authenticated_all_permissoes_admin" ON public.permissoes_admin
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_permissoes_parceiro" ON public.permissoes_parceiro;
CREATE POLICY "authenticated_all_permissoes_parceiro" ON public.permissoes_parceiro
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_permissoes_cliente" ON public.permissoes_cliente;
CREATE POLICY "authenticated_all_permissoes_cliente" ON public.permissoes_cliente
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
