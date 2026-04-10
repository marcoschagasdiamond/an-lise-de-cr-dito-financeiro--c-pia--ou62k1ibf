import { supabase } from '@/lib/supabase/client'

export type FinancialIndicatorRecord = {
  id?: string
  indicator_name: string
  category: string
  val_2021?: string | number | null
  val_2022?: string | number | null
  ah_2022?: string | number | null
  val_2023?: string | number | null
  ah_2023?: string | number | null
  last_exercise?: string | number | null
  sector_performance?: string | number | null
  rowIndex: number
}

export const getFinancialIndicators = async (category: string) => {
  const { data, error } = await supabase
    .from('financial_indicators')
    .select('*')
    .eq('category', category)
    .order('rowIndex', { ascending: true })

  if (error) throw error
  return data as FinancialIndicatorRecord[]
}

export const saveFinancialIndicator = async (payload: FinancialIndicatorRecord) => {
  if (payload.id) {
    const { data, error } = await supabase
      .from('financial_indicators')
      .update(payload)
      .eq('id', payload.id)
      .select()
      .single()
    if (error) throw error
    return data as FinancialIndicatorRecord
  }

  const { data, error } = await supabase
    .from('financial_indicators')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as FinancialIndicatorRecord
}
