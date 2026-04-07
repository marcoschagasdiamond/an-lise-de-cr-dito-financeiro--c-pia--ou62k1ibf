import pb from '@/lib/pocketbase/client'

export interface CenarioEmprestimo {
  id: string
  user_id: string
  projeto_id?: string
  banco: string
  valor: number
  taxa_juros: number
  prazo: number
  tipo_amortizacao: 'sac' | 'price'
  data_inicio?: string
  tabela_amortizacao?: any
  created: string
  updated: string
}

export interface CenarioInvestidor {
  id: string
  user_id: string
  projeto_id?: string
  nome_investidor: string
  valor_aporte: number
  participacao_acionaria: number
  tipo_retorno: 'dividendos' | 'lucro'
  prazo_saida: number
  retorno_esperado?: number
  created: string
  updated: string
}

export interface CenarioCotas {
  id: string
  user_id: string
  projeto_id?: string
  tipo_cota: 'diamond' | 'gold' | 'silver'
  valor_cota: number
  quantidade: number
  valor_total: number
  beneficios?: string
  retorno_esperado?: number
  created: string
  updated: string
}

export const getEmprestimos = () =>
  pb.collection('cenarios_emprestimos').getFullList<CenarioEmprestimo>({ sort: '-created' })
export const createEmprestimo = (data: Partial<CenarioEmprestimo>) =>
  pb.collection('cenarios_emprestimos').create<CenarioEmprestimo>(data)
export const deleteEmprestimo = (id: string) => pb.collection('cenarios_emprestimos').delete(id)

export const getInvestidores = () =>
  pb.collection('cenarios_investidor').getFullList<CenarioInvestidor>({ sort: '-created' })
export const createInvestidor = (data: Partial<CenarioInvestidor>) =>
  pb.collection('cenarios_investidor').create<CenarioInvestidor>(data)
export const deleteInvestidor = (id: string) => pb.collection('cenarios_investidor').delete(id)

export const getCotas = () =>
  pb.collection('cenarios_cotas').getFullList<CenarioCotas>({ sort: '-created' })
export const createCotas = (data: Partial<CenarioCotas>) =>
  pb.collection('cenarios_cotas').create<CenarioCotas>(data)
export const deleteCotas = (id: string) => pb.collection('cenarios_cotas').delete(id)
