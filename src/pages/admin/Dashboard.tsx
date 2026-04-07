import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Building, Settings, ShieldAlert, LogOut, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useAdmin } from '@/hooks/use-admin'
import pb from '@/lib/pocketbase/client'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const { isAdmin, hasPermission, loading: adminLoading } = useAdmin()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    clientsOrigin: [] as any[],
    partnersStatus: [] as any[],
    projectsPhase: [] as any[],
    companyTypes: [] as any[],
    recentActivities: [] as any[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clients, partners, projetos] = await Promise.all([
          pb.collection('clientes').getFullList(),
          pb.collection('parceiros').getFullList(),
          pb.collection('projetos').getFullList({ expand: 'cliente_id' }),
        ])

        const origins = clients.reduce((acc: any, c) => {
          const origin = c.origem || 'Outros'
          acc[origin] = (acc[origin] || 0) + 1
          return acc
        }, {})

        const pStatuses = partners.reduce((acc: any, p) => {
          const st = p.status || 'pendente'
          acc[st] = (acc[st] || 0) + 1
          return acc
        }, {})

        const phases = projetos.reduce((acc: any, p) => {
          const ph = p.fase_atual ? `Fase ${p.fase_atual}` : 'Não iniciada'
          acc[ph] = (acc[ph] || 0) + 1
          return acc
        }, {})

        const ctypes = projetos.reduce((acc: any, p) => {
          const t = p.tipo_empresa || 'Não definido'
          acc[t] = (acc[t] || 0) + 1
          return acc
        }, {})

        const allActivities = [
          ...clients.map((c) => ({
            id: c.id,
            type: 'Cliente',
            description: c.nome,
            date: c.created,
            status: c.status || 'ativo',
          })),
          ...partners.map((p) => ({
            id: p.id,
            type: 'Parceiro',
            description: p.nome_empresa,
            date: p.created,
            status: p.status || 'pendente',
          })),
          ...projetos.map((p) => ({
            id: p.id,
            type: 'Projeto',
            description: `Projeto para ${p.expand?.cliente_id?.nome || 'Cliente'}`,
            date: p.created,
            status: p.fase_atual ? `Fase ${p.fase_atual}` : 'Não iniciada',
          })),
        ]

        const recentActivities = allActivities
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)

        setStats({
          clientsOrigin: Object.entries(origins).map(([name, value]) => ({ name, value })),
          partnersStatus: Object.entries(pStatuses).map(([name, value]) => ({ name, value })),
          projectsPhase: Object.entries(phases).map(([name, value]) => ({ name, value })),
          companyTypes: Object.entries(ctypes).map(([name, value]) => ({ name, value })),
          recentActivities,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  const handleLogout = () => {
    signOut()
    navigate('/admin/login')
  }

  if (adminLoading || loading)
    return (
      <div className="p-8">
        <Skeleton className="w-full h-96" />
      </div>
    )

  const COLORS = ['#002147', '#C5A059', '#1A3A5F', '#D4B271', '#334F77']

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background">
      <Header title="Painel Administrativo" />
      <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full pb-20 animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-2 w-fit px-0 hover:bg-transparent text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-[#002147]">Administração Central</h1>
            <p className="text-muted-foreground text-lg">
              Visão geral do sistema, aprovações e gestão.
            </p>
          </div>
          <Button
            variant="outline"
            className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.clientsOrigin.reduce((a: any, b: any) => a + b.value, 0)}
              </div>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground capitalize">
                {stats.clientsOrigin.map((o: any) => (
                  <span key={o.name}>
                    {o.name.replace('_', ' ')}: {o.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Parceiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.partnersStatus.reduce((a: any, b: any) => a + b.value, 0)}
              </div>
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground capitalize">
                {stats.partnersStatus.map((o: any) => (
                  <span key={o.name}>
                    {o.name}: {o.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Projetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.projectsPhase.reduce((a: any, b: any) => a + b.value, 0)}
              </div>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                {stats.projectsPhase.map((o: any) => (
                  <span key={o.name}>
                    {o.name}: {o.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {hasPermission('gerenciar_parceiros') && (
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" /> Aprovar Parceiros
                </CardTitle>
                <CardDescription>Revisar novas solicitações</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/parceiros">
                  <Button className="w-full mt-2" variant="secondary">
                    Acessar Módulo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {hasPermission('gerenciar_clientes') && (
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-500" /> Gestão de Clientes
                </CardTitle>
                <CardDescription>Base consolidada</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/clientes">
                  <Button className="w-full mt-2" variant="secondary">
                    Acessar Módulo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {hasPermission('gerenciar_admins') && (
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-500" /> Cadastro de Admins
                </CardTitle>
                <CardDescription>Gerenciar equipe e acessos</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin/administradores">
                  <Button className="w-full mt-2" variant="secondary">
                    Acessar Módulo <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Projetos por Tipo de Empresa</CardTitle>
              <CardDescription>Distribuição atual da carteira</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer
                config={{
                  inicial: { label: 'Inicial', color: 'hsl(var(--chart-1))' },
                  pequena: { label: 'Pequena', color: 'hsl(var(--chart-2))' },
                  media_grande: { label: 'Média/Grande', color: 'hsl(var(--chart-3))' },
                }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.companyTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.companyTypes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status dos Parceiros</CardTitle>
              <CardDescription>Aprovações e rejeições</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={{}} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.partnersStatus}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#C5A059" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimos eventos do sistema</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {stats.recentActivities.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentActivities.map((act, i) => (
                        <TableRow key={`${act.id}-${i}`}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(act.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>{act.type}</TableCell>
                          <TableCell className="font-medium">{act.description}</TableCell>
                          <TableCell className="capitalize">
                            {act.status.toString().replace('_', ' ')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma atividade recente.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
