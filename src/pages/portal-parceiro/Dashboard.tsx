import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, CheckCircle, LogOut } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export default function PortalParceiroDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const hasLoaded = useRef(false)
  const isFetching = useRef(false)
  const [totalClientes, setTotalClientes] = useState(0)
  const [projetosEmAndamento, setProjetosEmAndamento] = useState(0)
  const [projetosConcluidos, setProjetosConcluidos] = useState(0)

  const loadData = async () => {
    if (!user?.id || isFetching.current) return
    isFetching.current = true
    try {
      const clientes = await pb.collection('clientes').getFullList({
        filter: `parceiro_id = "${user.id}"`,
      })
      setTotalClientes(clientes.length)

      const projetos = await pb.collection('projetos').getFullList({
        filter: `cliente_id.parceiro_id = "${user.id}"`,
      })

      let andamento = 0
      let concluidos = 0
      projetos.forEach((p) => {
        if (p.fase_atual < 9) andamento++
        else concluidos++
      })

      setProjetosEmAndamento(andamento)
      setProjetosConcluidos(concluidos)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      isFetching.current = false
    }
  }

  useEffect(() => {
    if (user?.id && !hasLoaded.current) {
      hasLoaded.current = true
      loadData()
    }
  }, [user?.id])

  useRealtime('clientes', loadData)
  useRealtime('projetos', loadData)

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border border-border shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Olá, {user?.name || user?.email}!
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/portal-parceiro/gestao-clientes')}
            variant="outline"
            className="bg-background"
          >
            <Users className="mr-2 h-4 w-4" />
            Gestão de Clientes
          </Button>
          <Button
            onClick={() => navigate('/portal-parceiro/pipeline-demandas')}
            variant="outline"
            className="bg-background"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Meus Projetos
          </Button>
          <Button onClick={handleSignOut} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Meus Clientes</CardTitle>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados na base</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Projetos em Andamento</CardTitle>
            <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projetosEmAndamento}</div>
            <p className="text-xs text-muted-foreground mt-1">Projetos nas fases 1 a 8</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Projetos Concluídos</CardTitle>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projetosConcluidos}</div>
            <p className="text-xs text-muted-foreground mt-1">Projetos na fase 9 ou finalizados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
