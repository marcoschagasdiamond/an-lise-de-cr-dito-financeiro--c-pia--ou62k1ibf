import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ArrowRight, ShieldCheck, Activity, FileText } from 'lucide-react'

export default function PortalClienteHome() {
  const { user } = useAuth()

  // Se já estiver logado como cliente ou admin, redireciona para o dashboard
  if (user && (user.role === 'cliente' || user.role === 'administrador' || !user.role)) {
    return <Navigate to="/portal-cliente/dashboard" replace />
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <Header title="Portal do Cliente" />
      <div className="p-6 md:p-12 max-w-5xl mx-auto w-full space-y-12 animate-fade-in-up flex-1 flex flex-col justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-[#002147] text-[#C5A059] rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Users className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#002147] dark:text-slate-100">
            Portal do Cliente
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Acompanhe a evolução do seu projeto, acesse análises financeiras detalhadas e gerencie
            sua documentação em um ambiente seguro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
          <Card className="border-none shadow-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h3 className="font-semibold text-lg">Dashboard Interativo</h3>
              <p className="text-sm text-muted-foreground">
                Visão geral do andamento e próximos passos do seu projeto.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <FileText className="w-8 h-8 text-emerald-600" />
              <h3 className="font-semibold text-lg">Gestão de Documentos</h3>
              <p className="text-sm text-muted-foreground">
                Envie e aprove documentos necessários para a operação de forma ágil.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-[#C5A059]" />
              <h3 className="font-semibold text-lg">Segurança Total</h3>
              <p className="text-sm text-muted-foreground">
                Seus dados financeiros protegidos com os mais altos padrões de segurança.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-md mx-auto w-full shadow-2xl border-[#1A3A5F]/20 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-[#002147] to-[#C5A059]" />
          <CardHeader className="bg-white dark:bg-slate-900 pb-4">
            <CardTitle className="text-center text-2xl">Acesse sua Conta</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 bg-white dark:bg-slate-900 pb-8">
            <Button
              asChild
              size="lg"
              className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white h-14 text-lg"
            >
              <Link to="/login">
                Fazer Login Seguro <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Ainda não é cliente? <br />
              <Link
                to="/consult-plan/solicitar-diagnostico"
                className="text-[#C5A059] font-medium hover:underline mt-1 inline-block"
              >
                Solicite um diagnóstico inicial gratuito
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
