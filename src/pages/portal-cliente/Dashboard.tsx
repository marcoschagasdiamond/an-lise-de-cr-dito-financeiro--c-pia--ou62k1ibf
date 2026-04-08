import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CreditCard, Activity, Loader2 } from 'lucide-react'

export default function ClienteDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnalises: 0,
    analisesAprovadas: 0,
    analisesPendentes: 0,
  })

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from('analises')
          .select('status')
          .eq('user_id', user.id)

        if (!error && data) {
          setStats({
            totalAnalises: data.length,
            analisesAprovadas: data.filter((a) => a.status === 'concluido').length,
            analisesPendentes: data.filter(
              (a) => a.status === 'em_analise' || a.status === 'pendente',
            ).length,
          })
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo(a), {user?.nome || 'Cliente'}! Aqui está o resumo da sua conta.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Análises</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnalises}</div>
            <p className="text-xs text-muted-foreground">Solicitadas até o momento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises Concluídas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analisesAprovadas}</div>
            <p className="text-xs text-muted-foreground">Prontas para visualização</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analisesPendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando processamento</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
