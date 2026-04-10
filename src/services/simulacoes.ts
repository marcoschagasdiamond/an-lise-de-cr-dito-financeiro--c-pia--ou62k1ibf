import { supabase } from '@/lib/supabase/client'

export interface SimulacaoCustos {
  valor_avaliacao: number
  taxa_administrativa: number
  iof: number
  fi: number
  outros_custos: number
  total_custos: number
  valor_liquido_recebido: number
  percentual_custos: number
  cet: number
  iof_input: number
  iof_type: 'PERCENT' | 'BRL'
  fi_input: number
  fi_type: 'PERCENT' | 'BRL'
  taxa_adm_input: number
}

export interface SimulacaoFinanceira {
  id?: string
  user_id: string
  loan_value: number
  interest_rate: number
  term: number
  modality: 'antecipado' | 'postecipado' | 'diferido'
  grace_period: number
  custos: SimulacaoCustos
  financing_type?: 'price' | 'sac'
  indexer?: 'none' | 'selic' | 'ipca' | 'tr' | 'cdi' | 'custom'
  spread?: number
  effective_rate?: number
  indexer_last_update?: string
  created?: string
  updated?: string
}

export const getSimulacoes = async (userId: string) => {
  const { data, error } = await supabase
    .from('simulacoes_financeiras')
    .select('*')
    .eq('user_id', userId)
    .order('created', { ascending: false })

  if (error) throw error
  return data as SimulacaoFinanceira[]
}

export const createSimulacao = async (
  payload: Omit<SimulacaoFinanceira, 'id' | 'created' | 'updated'>,
) => {
  const { data, error } = await supabase
    .from('simulacoes_financeiras')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as SimulacaoFinanceira
}
