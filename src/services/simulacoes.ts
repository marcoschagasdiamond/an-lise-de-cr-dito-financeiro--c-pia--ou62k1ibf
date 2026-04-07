import pb from '@/lib/pocketbase/client'

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
  return pb.collection('simulacoes_financeiras').getFullList<SimulacaoFinanceira>({
    filter: `user_id = "${userId}"`,
    sort: '-created',
  })
}

export const createSimulacao = async (
  data: Omit<SimulacaoFinanceira, 'id' | 'created' | 'updated'>,
) => {
  return pb.collection('simulacoes_financeiras').create<SimulacaoFinanceira>(data)
}
