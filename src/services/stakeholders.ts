import pb from '@/lib/pocketbase/client'

export interface Stakeholder {
  id: string
  name: string
  email: string
  is_favorite: boolean
  user_id: string
}

export const getStakeholders = async (userId: string): Promise<Stakeholder[]> => {
  if (!userId) return []
  return pb.collection('stakeholders').getFullList({
    filter: `user_id = "${userId}"`,
    sort: '-is_favorite,name',
  })
}

export const createStakeholder = async (data: Partial<Stakeholder>) => {
  return pb.collection('stakeholders').create(data)
}

export const deleteStakeholder = async (id: string) => {
  return pb.collection('stakeholders').delete(id)
}

export const toggleFavoriteStakeholder = async (id: string, is_favorite: boolean) => {
  return pb.collection('stakeholders').update(id, { is_favorite })
}
