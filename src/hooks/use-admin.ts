import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (user?.role === 'administrador') {
      pb.collection('administradores')
        .getFirstListItem(`usuario_id="${user.id}"`)
        .then((record) => {
          setPermissions(record.permissoes || [])
        })
        .catch(() => {
          setPermissions([])
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setPermissions([])
      setLoading(false)
    }
  }, [user, authLoading])

  const hasPermission = (perm: string) => permissions.includes(perm) || permissions.includes('*')

  return {
    permissions,
    hasPermission,
    loading: loading || authLoading,
    isAdmin: user?.role === 'administrador',
  }
}
