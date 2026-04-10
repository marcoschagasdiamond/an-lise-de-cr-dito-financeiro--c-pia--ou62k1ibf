import { supabase } from '@/lib/supabase/client'

export interface InvestimentoCenario {
  id: string
  user_id: string
  tipo: 'emprestimo' | 'investidor' | 'cotas'
  nome?: string
  valor: number
  taxa_juros?: number
  prazo?: number
  sistema_amortizacao?: 'sac' | 'price'
  data_inicio?: string
  participacao?: number
  tipo_retorno?: 'dividendos' | 'lucro'
  tipo_cota?: 'diamond' | 'gold' | 'silver'
  quantidade_cotas?: number
  descricao_beneficios?: string
  retorno_esperado?: number
  created: string
  updated: string
}

export const getInvestimentos = async () => {
  const { data, error } = await supabase
    .from('investimentos_cenarios')
    .select('*')
    .order('created', { ascending: false })

  if (error) throw error
  return data as InvestimentoCenario[]
}

export const createInvestimento = async (payload: Partial<InvestimentoCenario>) => {
  const { data, error } = await supabase
    .from('investimentos_cenarios')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as InvestimentoCenario
}

export const updateInvestimento = async (id: string, payload: Partial<InvestimentoCenario>) => {
  const { data, error } = await supabase
    .from('investimentos_cenarios')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as InvestimentoCenario
}

export const deleteInvestimento = async (id: string) => {
  const { error } = await supabase.from('investimentos_cenarios').delete().eq('id', id)

  if (error) throw error
  return true
}
