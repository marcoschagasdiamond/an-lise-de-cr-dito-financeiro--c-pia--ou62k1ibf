import { useState, useEffect, useMemo, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Users, CheckCircle, AlertTriangle, DollarSign, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'

export function PartnerDashboard() {
  const { user } = useAuth()
  const hasLoaded = useRef(false)
  const isFetching = useRef(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [projetos, setProjetos] = useState<any[]>([])
  const [tarefas, setTarefas] = useState<any[]>([])

  const [periodo, setPeriodo] = useState('all')
  const [tipoEmpresa, setTipoEmpresa] = useState('all')
  const [status, setStatus] = useState('all')

  const loadData = async () => {
    if (!user?.id || isFetching.current) return
    isFetching.current = true
    try {
      const [c, p, t] = await Promise.all([
        pb.collection('clientes').getFullList({ filter: `parceiro_id = "${user.id}"` }),
        pb
          .collection('projetos')
          .getFullList({ filter: `cliente_id.parceiro_id = "${user.id}"`, expand: 'cliente_id' }),
        pb.collection('tarefas_fase').getFullList({
          filter: `fase_id.projeto_id.cliente_id.parceiro_id = "${user.id}"`,
          expand: 'fase_id',
        }),
      ])
      setClientes(c)
      setProjetos(p)
      setTarefas(t)
    } catch (err) {
      console.error(err)
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

  useRealtime('clientes', () => loadData())
  useRealtime('projetos', () => loadData())
  useRealtime('tarefas_fase', () => loadData())

  const filteredProjetos = useMemo(() => {
    return projetos.filter((p) => {
      if (tipoEmpresa !== 'all' && p.tipo_empresa !== tipoEmpresa) return false
      if (status === 'completed' && p.fase_atual < 9) return false
      if (status === 'in_progress' && p.fase_atual >= 9) return false

      if (periodo !== 'all') {
        const date = new Date(p.created)
        const now = new Date()
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
        if (periodo === '30d' && diffDays > 30) return false
        if (periodo === '90d' && diffDays > 90) return false
        if (periodo === '1y' && diffDays > 365) return false
      }
      return true
    })
  }, [projetos, tipoEmpresa, status, periodo])

  const metrics = useMemo(() => {
    const activeClients = clientes.filter((c) => c.status === 'ativo').length
    const inactiveClients = clientes.filter((c) => c.status === 'inativo').length

    const totalProjects = filteredProjetos.length
    const completedProjects = filteredProjetos.filter((p) => p.fase_atual >= 9).length
    const completionRate = totalProjects ? (completedProjects / totalProjects) * 100 : 0

    const now = new Date()
    const overdueProjectIds = new Set(
      tarefas
        .filter(
          (t) => t.status !== 'concluida' && t.data_vencimento && new Date(t.data_vencimento) < now,
        )
        .map((t) => t.expand?.fase_id?.projeto_id),
    )
    const overdueProjectsCount = filteredProjetos.filter((p) => overdueProjectIds.has(p.id)).length

    const estimatedRevenue = filteredProjetos
      .filter((p) => p.fase_atual < 9)
      .reduce((sum, p) => sum + (p.valor_operacao || 0), 0)

    return {
      activeClients,
      inactiveClients,
      completionRate,
      overdueProjectsCount,
      estimatedRevenue,
    }
  }, [clientes, filteredProjetos, tarefas])

  const chartData = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => {
      const phase = i + 1
      return {
        phase: `Fase ${phase}`,
        count: filteredProjetos.filter((p) => p.fase_atual === phase).length,
      }
    })
  }, [filteredProjetos])

  const chartConfig = {
    count: { label: 'Projetos', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="font-semibold text-sm uppercase tracking-wider">
            Filtros do Dashboard
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[150px] h-9 bg-background">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tipoEmpresa} onValueChange={setTipoEmpresa}>
            <SelectTrigger className="w-[150px] h-9 bg-background">
              <SelectValue placeholder="Tipo de Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="inicial">Inicial</SelectItem>
              <SelectItem value="pequena">Pequena</SelectItem>
              <SelectItem value="media_grande">Média/Grande</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px] h-9 bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold">
                {metrics.activeClients + metrics.inactiveClients}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-600 font-semibold">{metrics.activeClients}</span>{' '}
                ativos • {metrics.inactiveClients} inativos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
              <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                De {filteredProjetos.length} projetos filtrados
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Projetos Atrasados</p>
              <p className="text-2xl font-bold">{metrics.overdueProjectsCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Com tarefas vencidas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Estimada</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(metrics.estimatedRevenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Projetos em andamento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader className="pb-2 border-b bg-muted/10">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            Distribuição de Projetos por Fase
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="phase"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
