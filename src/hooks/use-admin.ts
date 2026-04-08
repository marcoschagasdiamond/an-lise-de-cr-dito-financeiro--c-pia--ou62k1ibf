import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (user?.role === 'administrador' && user.id) {
      supabase
        .from('administradores')
        .select('permissoes')
        .eq('usuario_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            setPermissions([])
            return
          }

          let perms: string[] = []
          if (Array.isArray(data.permissoes)) {
            perms = data.permissoes as string[]
          } else if (data.permissoes && typeof data.permissoes === 'object') {
            if ((data.permissoes as any).todas) {
              perms = ['*']
            } else {
              perms = Object.keys(data.permissoes).filter((k) => (data.permissoes as any)[k])
            }
          }
          setPermissions(perms)
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
