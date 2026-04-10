import { supabase } from '@/lib/supabase/client'

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

export const getEmprestimos = async () => {
  const { data, error } = await supabase
    .from('cenarios_emprestimos')
    .select('*')
    .order('created', { ascending: false })
  if (error) throw error
  return data as CenarioEmprestimo[]
}
export const createEmprestimo = async (data: Partial<CenarioEmprestimo>) => {
  const { data: result, error } = await supabase
    .from('cenarios_emprestimos')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result as CenarioEmprestimo
}
export const deleteEmprestimo = async (id: string) => {
  const { error } = await supabase.from('cenarios_emprestimos').delete().eq('id', id)
  if (error) throw error
  return true
}

export const getInvestidores = async () => {
  const { data, error } = await supabase
    .from('cenarios_investidor')
    .select('*')
    .order('created', { ascending: false })
  if (error) throw error
  return data as CenarioInvestidor[]
}
export const createInvestidor = async (data: Partial<CenarioInvestidor>) => {
  const { data: result, error } = await supabase
    .from('cenarios_investidor')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result as CenarioInvestidor
}
export const deleteInvestidor = async (id: string) => {
  const { error } = await supabase.from('cenarios_investidor').delete().eq('id', id)
  if (error) throw error
  return true
}

export const getCotas = async () => {
  const { data, error } = await supabase
    .from('cenarios_cotas')
    .select('*')
    .order('created', { ascending: false })
  if (error) throw error
  return data as CenarioCotas[]
}
export const createCotas = async (data: Partial<CenarioCotas>) => {
  const { data: result, error } = await supabase
    .from('cenarios_cotas')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return result as CenarioCotas
}
export const deleteCotas = async (id: string) => {
  const { error } = await supabase.from('cenarios_cotas').delete().eq('id', id)
  if (error) throw error
  return true
}
