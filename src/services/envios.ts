import { supabase } from '@/lib/supabase/client'

export const getEnviosPorProjeto = async (projetoId: string) => {
  const { data, error } = await supabase
    .from('envios_instituicoes')
    .select('*, instituicao_id(*)')
    .eq('projeto_id', projetoId)
    .order('data_envio', { ascending: false })
  if (error) throw error
  return data
}

export const atualizarEnvio = async (id: string, payload: any) => {
  const { data, error } = await supabase
    .from('envios_instituicoes')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const enviarParaInstituicao = async (
  projetoId: string,
  instituicaoId: string,
  documentos: string[],
) => {
  return supabase.functions.invoke('enviar-instituicao', {
    body: { projeto_id: projetoId, instituicao_id: instituicaoId, documentos_enviados: documentos },
  })
}
