import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  allowedRoles?: (string | undefined)[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
          <p className="animate-pulse text-sm font-medium text-slate-900 dark:text-slate-100">
            Validando sessão...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    const isPartnerRoute =
      location.pathname.startsWith('/portal-parceiro') ||
      location.pathname.startsWith('/portal/parceiro')
    return (
      <Navigate
        to={isPartnerRoute ? '/login-parceiro' : '/login'}
        state={{ from: location }}
        replace
      />
    )
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const isPartnerRoute =
      location.pathname.startsWith('/portal-parceiro') ||
      location.pathname.startsWith('/portal/parceiro')

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
