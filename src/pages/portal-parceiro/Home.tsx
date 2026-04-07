import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, ArrowRight, Handshake, Target, TrendingUp } from 'lucide-react'

export default function PortalParceiroHome() {
  const { user } = useAuth()

  // Redireciona parceiro ou admin logado para o dashboard correspondente
  if (user && (user.role === 'parceiro' || user.role === 'administrador')) {
    return <Navigate to="/portal/parceiro" replace />
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <Header title="Portal do Parceiro" />
      <div className="p-6 md:p-12 max-w-5xl mx-auto w-full space-y-12 animate-fade-in-up flex-1 flex flex-col justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-[#002147] text-[#C5A059] rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Briefcase className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-[#002147] dark:text-slate-100">
            Portal do Parceiro
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Aumente o portfólio de soluções para seus clientes e receba comissionamento por
            operações estruturadas e aprovadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
          <Card className="border-none shadow-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <Handshake className="w-8 h-8 text-blue-600" />
              <h3 className="font-semibold text-lg">Gestão de Clientes</h3>
              <p className="text-sm text-muted-foreground">
                Cadastre e acompanhe o andamento de cada cliente indicado.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <Target className="w-8 h-8 text-emerald-600" />
              <h3 className="font-semibold text-lg">Pipeline de Demandas</h3>
              <p className="text-sm text-muted-foreground">
                Visualize o funil de operações em tempo real.
              </p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
              <TrendingUp className="w-8 h-8 text-[#C5A059]" />
              <h3 className="font-semibold text-lg">Novos Negócios</h3>
              <p className="text-sm text-muted-foreground">
                Agregue valor à sua consultoria oferecendo inteligência financeira.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto w-full justify-center mt-8">
          <Card className="w-full shadow-xl border-[#1A3A5F]/20 overflow-hidden flex-1">
            <div className="h-1.5 w-full bg-[#002147]" />
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <CardTitle className="text-xl">Já sou Parceiro</CardTitle>
              <p className="text-sm text-muted-foreground mb-2">
                Acesse seu painel exclusivo para gerenciar sua carteira.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white"
              >
                <Link to="/login-parceiro">
                  Fazer Login <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="w-full shadow-xl border-[#C5A059]/30 overflow-hidden flex-1">
            <div className="h-1.5 w-full bg-[#C5A059]" />
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <CardTitle className="text-xl">Quero ser Parceiro</CardTitle>
              <p className="text-sm text-muted-foreground mb-2">
                Cadastre-se para iniciar nossa parceria estratégica.
              </p>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-white transition-colors"
              >
                <Link to="/cadastro-parceiro">
                  Solicitar Parceria <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
