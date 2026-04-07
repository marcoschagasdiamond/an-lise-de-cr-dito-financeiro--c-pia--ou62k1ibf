import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowRight, Lock, Database, Settings } from 'lucide-react'

export default function PortalAdminHome() {
  const { user } = useAuth()

  if (user && user.role === 'administrador') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <Header title="Administração Central" />
      <div className="p-6 md:p-12 max-w-4xl mx-auto w-full space-y-12 animate-fade-in-up flex-1 flex flex-col justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-[#002147] text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#002147] dark:text-slate-100">
            Administração Central
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Acesso restrito à gestão da plataforma Diamond Group. Ambiente exclusivo para
            colaboradores autorizados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-70">
          <div className="flex flex-col items-center text-center space-y-2">
            <Lock className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-medium">Controle de Acessos</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <Database className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-medium">Gestão de Base</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <Settings className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-medium">Configurações globais</span>
          </div>
        </div>

        <Card className="max-w-md mx-auto w-full shadow-2xl border-[#1A3A5F]/20 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-[#002147] to-[#1A3A5F]" />
          <CardHeader className="bg-white dark:bg-slate-900 pb-4">
            <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-[#C5A059]" /> Acesso Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 bg-white dark:bg-slate-900 pb-8">
            <Button
              asChild
              size="lg"
              className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white h-14 text-lg"
            >
              <Link to="/admin/login">
                Login Restrito <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <div className="text-center text-xs text-muted-foreground mt-4 px-6">
              Todas as ações neste portal são registradas e auditadas por motivos de segurança.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
