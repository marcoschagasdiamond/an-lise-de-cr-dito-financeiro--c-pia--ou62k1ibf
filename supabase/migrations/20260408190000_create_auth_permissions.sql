-- Add criado_em to usuarios if missing, to match prompt specification
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT NOW();

-- Create permissoes_admin table
CREATE TABLE IF NOT EXISTS public.permissoes_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    pode_aprovar_parceiros BOOLEAN NOT NULL DEFAULT false,
    pode_gerenciar_clientes BOOLEAN NOT NULL DEFAULT false,
    pode_gerenciar_admins BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create permissoes_parceiro table
CREATE TABLE IF NOT EXISTS public.permissoes_parceiro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    pode_gerenciar_clientes BOOLEAN NOT NULL DEFAULT false,
    pode_ver_comissoes BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create permissoes_cliente table
CREATE TABLE IF NOT EXISTS public.permissoes_cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    pode_ver_projetos BOOLEAN NOT NULL DEFAULT false,
    pode_enviar_documentos BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.permissoes_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_parceiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_cliente ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for permissoes_admin
DROP POLICY IF EXISTS "authenticated_all_permissoes_admin" ON public.permissoes_admin;
CREATE POLICY "authenticated_all_permissoes_admin" ON public.permissoes_admin 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add RLS Policies for permissoes_parceiro
DROP POLICY IF EXISTS "authenticated_all_permissoes_parceiro" ON public.permissoes_parceiro;
CREATE POLICY "authenticated_all_permissoes_parceiro" ON public.permissoes_parceiro 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add RLS Policies for permissoes_cliente
DROP POLICY IF EXISTS "authenticated_all_permissoes_cliente" ON public.permissoes_cliente;
CREATE POLICY "authenticated_all_permissoes_cliente" ON public.permissoes_cliente 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
