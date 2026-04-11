-- Adiciona a coluna usuario_id para permitir que as páginas operem de forma autônoma 
-- sem a dependência estrita de um registro na tabela clientes.
ALTER TABLE public.analises_salvas ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.acompanhamento_projetos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.investimentos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Garante índices para melhorar a performance das consultas por usuario_id
CREATE INDEX IF NOT EXISTS idx_analises_salvas_usuario_id ON public.analises_salvas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_acompanhamento_projetos_usuario_id ON public.acompanhamento_projetos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_investimentos_usuario_id ON public.investimentos(usuario_id);
