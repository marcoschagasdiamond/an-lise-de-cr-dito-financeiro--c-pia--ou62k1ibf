import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopProgressBar } from './TopProgressBar'

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
          <p className="animate-pulse text-sm font-medium text-slate-900 dark:text-slate-100">
            Validando sessão de administrador...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (user.role !== 'administrador' && user.role !== 'admin') {
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
            Apenas administradores têm permissão para acessar este painel.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              variant="outline"
              className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-500 dark:hover:bg-amber-950/50"
            >
              <Link to="/login">Trocar de Conta</Link>
            </Button>
            <Button
              asChild
              className="bg-[#0A1128] text-white hover:bg-[#0A1128]/90 dark:bg-amber-500 dark:text-[#0A1128] dark:hover:bg-amber-600"
            >
              <Link to="/consult-plan/home">Voltar para Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <TopProgressBar />
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-background">
        <AdminSidebar />
        <SidebarInset className="flex w-full flex-1 flex-col overflow-x-hidden bg-transparent">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
