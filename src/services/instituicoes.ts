import { supabase } from '@/lib/supabase/client'

export const getInstituicoesAtivas = async () => {
  const { data, error } = await supabase
    .from('instituicoes_financeiras')
    .select('*')
    .eq('ativa', true)
    .order('nome', { ascending: true })

  if (error) throw error
  return data
}
