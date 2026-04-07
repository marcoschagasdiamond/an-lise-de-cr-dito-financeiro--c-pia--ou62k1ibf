-- FASE 5: TABELAS DE PARÂMETROS E PROJEÇÕES

CREATE TABLE IF NOT EXISTS public.parametros_dre (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    receita_ano1 NUMERIC,
    margem_deducoes NUMERIC,
    margem_custos NUMERIC,
    margem_despesas_op NUMERIC,
    margem_despesas_fin NUMERIC,
    aliquota_ir_csll NUMERIC,
    crescimento_anual NUMERIC,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dre_projetado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    ano INTEGER,
    receita_bruta NUMERIC,
    deducoes NUMERIC,
    receita_liquida NUMERIC,
    custos_vendas NUMERIC,
    resultado_operacional_bruto NUMERIC,
    despesas_operacionais NUMERIC,
    despesas_financeiras NUMERIC,
    resultado_operacional NUMERIC,
    provisao_ir_csll NUMERIC,
    lucro_liquido NUMERIC,
    ebitda NUMERIC,
    ebitda_percentual NUMERIC,
    lucratividade NUMERIC,
    tir NUMERIC,
    vpl_5anos NUMERIC,
    vpl_10anos NUMERIC,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- FASE 6: TABELAS DE SUPORTE (PARCEIROS E DOCUMENTOS)

CREATE TABLE IF NOT EXISTS public.comissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parceiro_id UUID REFERENCES public.parceiros(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    valor_comissao NUMERIC,
    percentual NUMERIC,
    status TEXT CHECK (status IN ('pago', 'pendente')),
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_pagamento TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    nome_documento TEXT,
    tipo_documento TEXT,
    url_storage TEXT,
    data_upload TIMESTAMPTZ DEFAULT NOW(),
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pipeline_demandas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parceiro_id UUID REFERENCES public.parceiros(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechado')),
    valor_oportunidade NUMERIC,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_parceiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parceiro_id UUID REFERENCES public.parceiros(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    historico_interacoes JSONB,
    proxima_acao TEXT,
    data_proxima_acao TIMESTAMPTZ,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- FASE 7: TABELAS DE ANÁLISES E ACOMPANHAMENTO

CREATE TABLE IF NOT EXISTS public.analises_salvas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
    nome_analise TEXT,
    tipo_analise TEXT,
    dados_analise JSONB,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.acompanhamento_projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    tipo_evento TEXT CHECK (tipo_evento IN ('diagnostico', 'analise', 'implementacao', 'resultado')),
    descricao TEXT,
    data_evento TIMESTAMPTZ,
    responsavel TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dashboard_metricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    metrica_nome TEXT,
    valor NUMERIC,
    data_calculo TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.relatorios_gerados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    tipo_relatorio TEXT,
    url_arquivo TEXT,
    data_geracao TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR RLS

ALTER TABLE public.parametros_dre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dre_projetado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_demandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_parceiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_salvas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamento_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_gerados ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS BÁSICAS

DROP POLICY IF EXISTS "authenticated_all_parametros_dre" ON public.parametros_dre;
CREATE POLICY "authenticated_all_parametros_dre" ON public.parametros_dre FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_dre_projetado" ON public.dre_projetado;
CREATE POLICY "authenticated_all_dre_projetado" ON public.dre_projetado FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_comissoes" ON public.comissoes;
CREATE POLICY "authenticated_all_comissoes" ON public.comissoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_documentos" ON public.documentos;
CREATE POLICY "authenticated_all_documentos" ON public.documentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_pipeline_demandas" ON public.pipeline_demandas;
CREATE POLICY "authenticated_all_pipeline_demandas" ON public.pipeline_demandas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_crm_parceiros" ON public.crm_parceiros;
CREATE POLICY "authenticated_all_crm_parceiros" ON public.crm_parceiros FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_analises_salvas" ON public.analises_salvas;
CREATE POLICY "authenticated_all_analises_salvas" ON public.analises_salvas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_acompanhamento_projetos" ON public.acompanhamento_projetos;
CREATE POLICY "authenticated_all_acompanhamento_projetos" ON public.acompanhamento_projetos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_dashboard_metricas" ON public.dashboard_metricas;
CREATE POLICY "authenticated_all_dashboard_metricas" ON public.dashboard_metricas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_relatorios_gerados" ON public.relatorios_gerados;
CREATE POLICY "authenticated_all_relatorios_gerados" ON public.relatorios_gerados FOR ALL TO authenticated USING (true) WITH CHECK (true);
