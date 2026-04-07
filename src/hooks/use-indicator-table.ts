import { useState, useEffect, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export function useIndicatorTable(category: string, rowsDef: any[]) {
  const [data, setData] = useState<Record<number, any>>({})
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const load = useCallback(async () => {
    if (!pb.authStore.isValid) {
      setLoading(false)
      return
    }

    try {
      const records = await pb.collection('financial_indicators').getFullList({
        filter: `category = '${category}'`,
      })

      const map: Record<number, any> = {}
      records.forEach((r) => {
        map[r.rowIndex] = r
      })

      for (const row of rowsDef) {
        if (!map[row.id]) {
          try {
            const indicatorName =
              row.label || row.name || row.indicator_name || `Indicador ${row.id}`
            const newRecord = await pb.collection('financial_indicators').create({
              category,
              rowIndex: row.id !== undefined ? row.id : 0,
              indicator_name: indicatorName,
            })
            map[row.id] = newRecord
          } catch (e) {
            console.error(`Failed to create ${category} row ${row.id}`, e)
            // Error banner removed per acceptance criteria
          }
        }
      }

      setData(map)
    } catch (error) {
      console.error(`Failed to load ${category}`, error)
    } finally {
      setLoading(false)
    }
  }, [category, rowsDef, toast])

  useEffect(() => {
    load()
  }, [load])

  const updateCell = async (rowIndex: number, col: string, value: string) => {
    if (!pb.authStore.isValid) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Usuário não está autenticado.',
      })
      return
    }

    const record = data[rowIndex]
    if (!record) return

    setData((prev) => ({
      ...prev,
      [rowIndex]: { ...prev[rowIndex], [col]: value },
    }))

    try {
      let numValue: number | null = null
      if (value !== '' && value !== null && value !== undefined) {
        const parsed = parseFloat(value.toString().replace(',', '.'))
        if (!isNaN(parsed)) {
          numValue = parsed
        }
      }

      const updatePayload: any = {
        [col]: numValue,
        indicator_name: record.indicator_name || `Indicador ${rowIndex}`,
        category: record.category || category,
        rowIndex: record.rowIndex !== undefined ? record.rowIndex : rowIndex,
      }

      // Automatically calculate Horizontal Analysis (A.H.)
      const v21 = col === 'val_2021' ? numValue : record.val_2021
      const v22 = col === 'val_2022' ? numValue : record.val_2022
      const v23 = col === 'val_2023' ? numValue : record.val_2023

      if (v21 != null && v22 != null && v21 !== 0) {
        updatePayload.ah_2022 = (v22 / v21 - 1) * 100
      } else if (v21 === 0 || v21 == null || v22 == null) {
        updatePayload.ah_2022 = null
      }

      if (v22 != null && v23 != null && v22 !== 0) {
        updatePayload.ah_2023 = (v23 / v22 - 1) * 100
      } else if (v22 === 0 || v22 == null || v23 == null) {
        updatePayload.ah_2023 = null
      }

      const updatedRecord = await pb
        .collection('financial_indicators')
        .update(record.id, updatePayload)

      setData((prev) => ({
        ...prev,
        [rowIndex]: { ...prev[rowIndex], ...updatedRecord },
      }))
    } catch (error) {
      console.error(`Failed to update ${category} row ${rowIndex}`, error)
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: getErrorMessage(error),
      })
      load() // reload to reset invalid state
    }
  }

  return { data, updateCell, loading }
}
