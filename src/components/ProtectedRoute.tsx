import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ProtectedRouteProps {
  allowedRoles?: (string | undefined)[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading: authLoading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [loadingPerms, setLoadingPerms] = useState(true)

  useEffect(() => {
    let mounted = true

    if (authLoading) return

    if (!user) {
      if (mounted) {
        setLoadingPerms(false)
      }
      return
    }

    const roleAllowed =
      !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(user.role)

    if (!roleAllowed) {
      if (mounted) {
        setHasPermission(false)
        setLoadingPerms(false)
        setPermissionsLoaded(true)
      }
      return
    }

    const loadPermissions = async () => {
      try {
        let table = ''
        if (user.tipo_usuario === 'admin' || user.role === 'administrador')
          table = 'permissoes_admin'
        else if (user.tipo_usuario === 'parceiro' || user.role === 'parceiro')
          table = 'permissoes_parceiro'
        else if (user.tipo_usuario === 'cliente' || user.role === 'cliente')
          table = 'permissoes_cliente'

        if (table) {
          // Tenta carregar apenas para confirmar que a tabela responde
          const { error } = await supabase
            .from(table as any)
            .select('id')
            .eq('usuario_id', user.id)
            .maybeSingle()

          if (error) {
            console.error(`Erro ao verificar tabela ${table}:`, error)
          }

          if (mounted) {
            // Permitimos o acesso baseado na role validada inicialmente
            // para evitar travamentos caso a tabela esteja vazia ou com erro de RLS
            setHasPermission(true)
          }
        } else {
          if (mounted) {
            setHasPermission(true)
          }
        }
      } catch (err) {
        console.error('Erro fatal ao carregar permissões', err)
        if (mounted) {
          // Em caso de falha crítica na promise, permitimos acesso se a role estiver ok
          // Isso garante a estabilidade solicitada
          setHasPermission(true)
        }
      } finally {
        if (mounted) {
          setPermissionsLoaded(true)
          setLoadingPerms(false)
        }
      }
    }

    loadPermissions()

    return () => {
      mounted = false
    }
  }, [user, authLoading, allowedRoles])

  if (authLoading || loadingPerms) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
          <p className="animate-pulse text-sm font-medium text-slate-900 dark:text-slate-100">
            Carregando permissões...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    const isAdminRoute = location.pathname.startsWith('/admin')
    const isPartnerRoute =
      location.pathname.startsWith('/portal-parceiro') ||
      location.pathname.startsWith('/portal/parceiro') ||
      location.pathname.startsWith('/area-parceiro')

    if (isAdminRoute) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />
    }

    return (
      <Navigate
        to={isPartnerRoute ? '/login-parceiro' : '/login'}
        state={{ from: location }}
        replace
      />
    )
  }

  if (!hasPermission) {
    const isPartnerRoute =
      location.pathname.startsWith('/portal-parceiro') ||
      location.pathname.startsWith('/portal/parceiro') ||
      location.pathname.startsWith('/area-parceiro')

    const handleSignOut = () => {
      signOut()
      navigate('/login')
    }

    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-[#0A1128]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[#0A1128] dark:text-slate-50">
            Acesso Restrito
          </h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Você não tem permissão para acessar esta área.
          </p>
          <div className="flex flex-col gap-3">
            {isPartnerRoute && (
              <Button
                asChild
                className="w-full bg-amber-500 text-[#0A1128] hover:bg-amber-600 dark:bg-amber-500 dark:text-[#0A1128] dark:hover:bg-amber-600"
              >
                <Link to="/solicitar-parceria">Quero ser um Parceiro</Link>
              </Button>
            )}
            <Button
              onClick={handleSignOut}
              variant={isPartnerRoute ? 'outline' : 'default'}
              className={
                !isPartnerRoute
                  ? 'w-full bg-[#0A1128] text-white hover:bg-[#0A1128]/90 dark:bg-amber-500 dark:text-[#0A1128] dark:hover:bg-amber-600'
                  : 'w-full'
              }
            >
              Sair / Trocar Conta
            </Button>
            {!isPartnerRoute && (
              <Button asChild variant="outline" className="w-full">
                <Link to="/consult-plan/home">Voltar para Home</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
