import { supabase } from '@/lib/supabase/client'

export interface Stakeholder {
  id: string
  name: string
  email: string
  is_favorite: boolean
  user_id: string
}

export const getStakeholders = async (userId: string): Promise<Stakeholder[]> => {
  if (!userId) return []
  const { data, error } = await supabase
    .from('stakeholders')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('name', { ascending: true })

  if (error) throw error
  return data as Stakeholder[]
}

export const createStakeholder = async (payload: Partial<Stakeholder>) => {
  const { data, error } = await supabase.from('stakeholders').insert(payload).select().single()
  if (error) throw error
  return data
}

export const deleteStakeholder = async (id: string) => {
  const { error } = await supabase.from('stakeholders').delete().eq('id', id)
  if (error) throw error
  return true
}

export const toggleFavoriteStakeholder = async (id: string, is_favorite: boolean) => {
  const { data, error } = await supabase
    .from('stakeholders')
    .update({ is_favorite })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
