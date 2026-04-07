import pb from '@/lib/pocketbase/client'

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
    const records = await pb.collection('report_schedules').getFullList({
      filter: `user_id = "${userId}"`,
    })
    return records.length > 0 ? (records[0] as unknown as ReportSchedule) : null
  } catch {
    return null
  }
}

export const saveReportSchedule = async (id: string | null, data: Partial<ReportSchedule>) => {
  if (id) {
    return pb.collection('report_schedules').update(id, data)
  }
  return pb.collection('report_schedules').create(data)
}
