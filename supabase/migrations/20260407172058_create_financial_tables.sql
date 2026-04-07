-- FASE 3: TABELAS DE ANÁLISE FINANCEIRA (INTERDEPENDENTES)

CREATE TABLE IF NOT EXISTS public.balanco_patrimonial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    ano INTEGER,
    ativo_circulante JSONB,
    ativo_nao_circulante JSONB,
    passivo_circulante JSONB,
    passivo_nao_circulante JSONB,
    patrimonio_liquido JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dre (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    ano INTEGER,
    receita_bruta NUMERIC,
    deducoes NUMERIC,
    receita_liquida NUMERIC,
    custos_vendas NUMERIC,
    resultado_operacional_bruto NUMERIC,
    despesas_operacionais JSONB,
    despesas_financeiras JSONB,
    resultado_operacional NUMERIC,
    provisao_ir_csll NUMERIC,
    lucro_liquido NUMERIC,
    ebitda NUMERIC,
    ebitda_percentual NUMERIC,
    lucratividade NUMERIC,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fluxo_caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    ano INTEGER,
    saldo_inicial NUMERIC,
    entradas JSONB,
    saidas JSONB,
    saldo_final NUMERIC,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- FASE 4: TABELAS DE INDICADORES E CENÁRIOS

CREATE TABLE IF NOT EXISTS public.indicadores_financeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    ano INTEGER,
    tir NUMERIC,
    vpl_5anos NUMERIC,
    vpl_10anos NUMERIC,
    payback NUMERIC,
    margem_liquida NUMERIC,
    roe NUMERIC,
    roa NUMERIC,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cenarios_investimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    nome_cenario TEXT,
    descricao TEXT,
    parametros JSONB,
    resultados JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.investimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    tipo_investimento TEXT,
    valor NUMERIC,
    descricao TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cenarios_financiamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    tipo_cenario TEXT CHECK (tipo_cenario IN ('emprestimo', 'investidor', 'cotas')),
    ativo BOOLEAN DEFAULT true,
    dados_cenario JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.balanco_patrimonial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluxo_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cenarios_investimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cenarios_financiamento ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
DROP POLICY IF EXISTS "authenticated_all_balanco" ON public.balanco_patrimonial;
CREATE POLICY "authenticated_all_balanco" ON public.balanco_patrimonial FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_dre" ON public.dre;
CREATE POLICY "authenticated_all_dre" ON public.dre FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_fluxo" ON public.fluxo_caixa;
CREATE POLICY "authenticated_all_fluxo" ON public.fluxo_caixa FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_indicadores" ON public.indicadores_financeiros;
CREATE POLICY "authenticated_all_indicadores" ON public.indicadores_financeiros FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_cenarios_inv" ON public.cenarios_investimento;
CREATE POLICY "authenticated_all_cenarios_inv" ON public.cenarios_investimento FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_investimentos" ON public.investimentos;
CREATE POLICY "authenticated_all_investimentos" ON public.investimentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_cenarios_fin" ON public.cenarios_financiamento;
CREATE POLICY "authenticated_all_cenarios_fin" ON public.cenarios_financiamento FOR ALL TO authenticated USING (true) WITH CHECK (true);
