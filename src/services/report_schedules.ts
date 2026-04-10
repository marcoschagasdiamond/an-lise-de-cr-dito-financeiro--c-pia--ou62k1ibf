import { supabase } from '@/lib/supabase/client'

export interface ReportSchedule {
  id: string
  user_id: string
  frequency: 'weekly' | 'monthly'
  active: boolean
  stakeholders: string[]
  last_run?: string
}

export const getReportSchedule = async (userId: string): Promise<ReportSchedule | null> => {
  if (!userId) return null
  try {
    const { data, error } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (error) throw error
    return data && data.length > 0 ? (data[0] as unknown as ReportSchedule) : null
  } catch {
    return null
  }
}

export const saveReportSchedule = async (id: string | null, payload: Partial<ReportSchedule>) => {
  if (id) {
    const { data, error } = await supabase
      .from('report_schedules')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  const { data, error } = await supabase.from('report_schedules').insert(payload).select().single()
  if (error) throw error
  return data
}
