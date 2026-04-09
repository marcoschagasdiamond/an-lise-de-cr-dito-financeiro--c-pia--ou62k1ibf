import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export function useAdmin() {
  const { user, loading: authLoading } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    if (authLoading) return

    if (user && (user.role === 'administrador' || user.tipo_usuario === 'admin') && user.id) {
      supabase
        .from('permissoes_admin')
        .select('*')
        .eq('usuario_id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!mounted) return
          if (error || !data) {
            console.warn('Permissões admin não encontradas ou erro:', error?.message)
            setPermissions([])
            return
          }

          const perms: string[] = []
          if (data.pode_aprovar_parceiros) perms.push('aprovar_parceiros')
          if (data.pode_gerenciar_clientes) perms.push('gerenciar_clientes')
          if (data.pode_gerenciar_admins) perms.push('gerenciar_admins')

          if (
            data.pode_aprovar_parceiros &&
            data.pode_gerenciar_clientes &&
            data.pode_gerenciar_admins
          ) {
            perms.push('*')
          }

          setPermissions(perms)
        })
        .catch((err) => {
          console.error('Erro fatal ao buscar permissoes_admin:', err)
          if (mounted) setPermissions([])
        })
        .finally(() => {
          if (mounted) setLoading(false)
        })
    } else {
      if (mounted) {
        setPermissions([])
        setLoading(false)
      }
    }

    return () => {
      mounted = false
    }
  }, [user, authLoading])

  const hasPermission = (perm: string) => permissions.includes(perm) || permissions.includes('*')

  return {
    permissions,
    hasPermission,
    loading: loading || authLoading,
    isAdmin: user?.role === 'administrador' || user?.tipo_usuario === 'admin',
  }
}
