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
        .from('administradores')
        .select('*')
        .eq('usuario_id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!mounted) return
          if (error || !data) {
            console.warn('Permissões admin não encontradas ou erro:', error?.message)
            // Fallback provisório para evitar bloqueios, permitindo acesso total caso o admin não tenha permissões configuradas
            setPermissions(['*'])
            return
          }

          let perms: string[] = []

          if (Array.isArray(data.permissoes)) {
            perms = data.permissoes
          } else if (typeof data.permissoes === 'object' && data.permissoes !== null) {
            if ((data.permissoes as any).todas) {
              perms = ['*']
            } else {
              perms = Object.keys(data.permissoes)
            }
          }

          if (
            perms.includes('gerenciar_parceiros') &&
            perms.includes('gerenciar_clientes') &&
            perms.includes('gerenciar_admins')
          ) {
            if (!perms.includes('*')) perms.push('*')
          }

          // Se for o admin principal (Marcos), garantir todas as permissões
          if (user.email === 'marcoschagasdiamond@icloud.com') {
            if (!perms.includes('*')) perms.push('*')
          }

          setPermissions(perms)
        })
        .catch((err) => {
          console.error('Erro fatal ao buscar administradores:', err)
          if (mounted) setPermissions(['*']) // Fallback em caso de erro fatal
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
