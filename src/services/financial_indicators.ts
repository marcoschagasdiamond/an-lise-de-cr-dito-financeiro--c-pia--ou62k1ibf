import pb from '@/lib/pocketbase/client'

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
  return pb.collection('financial_indicators').getFullList<FinancialIndicatorRecord>({
    filter: `category = '${category}'`,
    sort: 'rowIndex',
  })
}

export const saveFinancialIndicator = async (data: FinancialIndicatorRecord) => {
  if (data.id) {
    return pb.collection('financial_indicators').update<FinancialIndicatorRecord>(data.id, data)
  }
  return pb.collection('financial_indicators').create<FinancialIndicatorRecord>(data)
}
