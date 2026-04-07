CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT,
    nome TEXT,
    tipo_usuario TEXT CHECK (tipo_usuario IN ('cliente', 'parceiro', 'admin')),
    status TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    empresa_nome TEXT,
    cnpj TEXT,
    faturamento_anual NUMERIC,
    telefone TEXT,
    endereco TEXT,
    data_cadastro TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parceiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome_parceiro TEXT,
    cnpj TEXT,
    comissao_percentual NUMERIC,
    status TEXT CHECK (status IN ('ativo', 'inativo', 'pendente')),
    data_cadastro TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.administradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome TEXT,
    permissoes JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    nome_projeto TEXT,
    apresentacao_empresa TEXT,
    apresentacao_projeto TEXT,
    mercado_justificativa TEXT,
    faturamento_anual NUMERIC,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    status TEXT
);

CREATE TABLE IF NOT EXISTS public.diagnosticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    tipo_diagnostico TEXT CHECK (tipo_diagnostico IN ('juridico', 'tributario', 'fiscal', 'contabil', 'financeiro')),
    descricao TEXT,
    riscos_identificados JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.simulacoes_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    tipo_simulacao TEXT,
    parametros JSONB,
    resultado JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulacoes_financeiras ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
DROP POLICY IF EXISTS "authenticated_all_usuarios" ON public.usuarios;
CREATE POLICY "authenticated_all_usuarios" ON public.usuarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_clientes" ON public.clientes;
CREATE POLICY "authenticated_all_clientes" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_parceiros" ON public.parceiros;
CREATE POLICY "authenticated_all_parceiros" ON public.parceiros FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_administradores" ON public.administradores;
CREATE POLICY "authenticated_all_administradores" ON public.administradores FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_projetos" ON public.projetos;
CREATE POLICY "authenticated_all_projetos" ON public.projetos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_diagnosticos" ON public.diagnosticos;
CREATE POLICY "authenticated_all_diagnosticos" ON public.diagnosticos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_simulacoes" ON public.simulacoes_financeiras;
CREATE POLICY "authenticated_all_simulacoes" ON public.simulacoes_financeiras FOR ALL TO authenticated USING (true) WITH CHECK (true);
