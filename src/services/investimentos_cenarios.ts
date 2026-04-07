import pb from '@/lib/pocketbase/client'

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

export const getInvestimentos = () =>
  pb.collection('investimentos_cenarios').getFullList<InvestimentoCenario>({ sort: '-created' })

export const createInvestimento = (data: Partial<InvestimentoCenario>) =>
  pb.collection('investimentos_cenarios').create<InvestimentoCenario>(data)

export const updateInvestimento = (id: string, data: Partial<InvestimentoCenario>) =>
  pb.collection('investimentos_cenarios').update<InvestimentoCenario>(id, data)

export const deleteInvestimento = (id: string) => pb.collection('investimentos_cenarios').delete(id)
