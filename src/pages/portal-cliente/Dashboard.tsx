import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  FileText,
  Activity,
  LogOut,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

export default function ClientDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [projeto, setProjeto] = useState<any>(null)
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const projetos = await pb.collection('projetos').getList(1, 1, {
          filter: `cliente_id.user_id = "${user.id}" || cliente_id.email = "${user.email}"`,
          expand: 'cliente_id',
        })

        if (projetos.items.length > 0) {
          const proj = projetos.items[0]
          setProjeto(proj)

          const docs = await pb.collection('documentos_projeto').getList(1, 10, {
            filter: `projeto_id = "${proj.id}"`,
          })
          setDocumentos(docs.items)
        }
      } catch (e) {
        console.error('Error fetching dashboard data', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  const docsPendentes = documentos.filter(
    (d) => d.status === 'rascunho' || d.status === 'em_revisao',
  ).length
  const docsAprovados = documentos.filter((d) => d.status === 'aprovado').length

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background">
      <Header title="Portal do Cliente" />
      <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto w-full pb-20 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#1f497d]">
              Olá, {user?.name || user?.email?.split('@')[0] || 'Cliente'}
            </h1>
            <p className="text-muted-foreground mt-1">Bem-vindo ao seu portal de acompanhamento.</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meu Projeto */}
          <Card className="flex flex-col border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Meu Projeto
              </CardTitle>
              <CardDescription>Acompanhe o andamento da sua análise</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ) : projeto ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fase Atual</p>
                    <p className="text-3xl font-bold text-[#1f497d]">
                      Fase {projeto.fase_atual || 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Valor da Operação</p>
                    <p className="text-lg font-semibold">
                      {projeto.valor_operacao
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(projeto.valor_operacao)
                        : 'A definir'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>Nenhum projeto ativo encontrado.</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full bg-[#1f497d] hover:bg-[#1f497d]/90 text-white"
                disabled={!projeto}
              >
                <Link to="/portal-cliente/meu-projeto">
                  Ver Detalhes <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Documentos Solicitados */}
          <Card className="flex flex-col border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" /> Documentos Solicitados
              </CardTitle>
              <CardDescription>Gerencie a documentação do projeto</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-muted rounded w-full"></div>
                  <div className="h-12 bg-muted rounded w-full"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/50">
                    <div className="flex items-center gap-3 text-amber-700 dark:text-amber-500">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Pendentes / Em Revisão</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                      {docsPendentes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900/50">
                    <div className="flex items-center gap-3 text-green-700 dark:text-green-500">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Aprovados</span>
                    </div>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-500">
                      {docsAprovados}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/portal-cliente/meu-projeto">
                  Acessar Documentos <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Análises Financeiras */}
          <Card className="flex flex-col border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Análises Financeiras
              </CardTitle>
              <CardDescription>Resultados do diagnóstico financeiro</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
              <div className="flex flex-col h-full justify-center">
                <p className="text-sm text-muted-foreground mb-6">
                  Acesse os resultados do diagnóstico detalhado, índices de liquidez, solvência e as
                  análises geradas pelo sistema.
                </p>
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Diagnóstico
                    Preliminar
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Mapa de Dívidas
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Cenários e Projeções
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/portal-cliente/dashboard-executivo">
                  Acessar Análises <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
