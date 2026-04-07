import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  CheckCircle2,
  Circle,
  Clock,
  FileUp,
  AlertCircle,
  PlayCircle,
  FileText,
  CheckCircle,
  ArrowRight,
  Download,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectPendencias } from '../portal-parceiro/components/ProjectPendencias'
import { ProjectDocumentos } from '../portal-parceiro/components/ProjectDocumentos'

export default function MeuProjeto() {
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [phases, setPhases] = useState<any[]>([])
  const [tasks, setTasks] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])

  const loadData = async () => {
    if (!user) return
    try {
      const clients = await pb
        .collection('clientes')
        .getFullList({ filter: `email = "${user.email}" || user_id = "${user.id}"` })
      if (clients.length === 0) {
        setLoading(false)
        return
      }
      const clientId = clients[0].id

      const projects = await pb
        .collection('projetos')
        .getFullList({ filter: `cliente_id = "${clientId}"`, expand: 'cliente_id' })
      if (projects.length === 0) {
        setLoading(false)
        return
      }
      const proj = projects[0]
      setProject(proj)

      const phs = await pb
        .collection('fases_projeto')
        .getFullList({ filter: `projeto_id = "${proj.id}"`, sort: 'numero_fase' })
      setPhases(phs)

      const tsks = await pb
        .collection('tarefas_fase')
        .getFullList({ filter: `fase_id.projeto_id = "${proj.id}"`, sort: 'numero_tarefa' })
      const groupedTasks: Record<string, any[]> = {}
      tsks.forEach((t) => {
        if (!groupedTasks[t.fase_id]) groupedTasks[t.fase_id] = []
        groupedTasks[t.fase_id].push(t)
      })
      setTasks(groupedTasks)

      const reps = await pb
        .collection('historico_analises')
        .getFullList({ filter: `user_id = "${user.id}"`, sort: '-created' })
      setReports(reps)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('projetos', loadData)
  useRealtime('fases_projeto', loadData)
  useRealtime('tarefas_fase', loadData)
  useRealtime('historico_analises', loadData)

  const handleFileUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const formData = new FormData()
      formData.append('anexos', file)
      formData.append('status', 'enviado')
      await pb.collection('tarefas_fase').update(taskId, formData)
      toast.success('Documento enviado com sucesso!')
      loadData()
    } catch (err) {
      toast.error('Erro ao enviar documento.')
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando seu projeto...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full bg-slate-50/50 dark:bg-background overflow-y-auto">
        <Header title="Meu Projeto" />
        <div className="p-8 flex flex-col items-center justify-center flex-1">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Nenhum projeto encontrado</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Não encontramos um projeto ativo vinculado ao seu e-mail. Caso acredite ser um erro,
            entre em contato com seu consultor Diamond Group.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-background overflow-y-auto">
      <Header title="Meu Projeto" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full pb-20 space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Progresso do Projeto</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe em tempo real o status de cada fase do seu diagnóstico financeiro.
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-sm px-4 py-1 self-start md:self-auto bg-primary/5"
          >
            Fase Atual: {project.fase_atual} / 9
          </Badge>
        </div>

        <Tabs defaultValue="cronograma" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-3 mx-auto">
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="pendencias" disabled={project.fase_atual < 7}>
              Pendências
            </TabsTrigger>
            <TabsTrigger value="documentos" disabled={project.fase_atual < 8}>
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cronograma" className="mt-0">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {phases.map((phase) => {
                const phaseTasks = tasks[phase.id] || []
                const completedTasks = phaseTasks.filter((t) =>
                  ['concluida', 'aprovado'].includes(t.status),
                ).length
                const totalTasks = phaseTasks.length

                const isCurrent = phase.numero_fase === project.fase_atual
                const isCompleted = phase.status === 'concluida'

                return (
                  <div
                    key={phase.id}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10',
                        isCompleted
                          ? 'bg-green-500'
                          : isCurrent
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-700',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white text-sm font-bold">{phase.numero_fase}</span>
                      )}
                    </div>
                    <Card
                      className={cn(
                        'w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] transition-all duration-300 hover:shadow-md',
                        isCurrent ? 'border-blue-400 ring-1 ring-blue-400/20' : '',
                      )}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <CardTitle className="text-lg">{phase.nome_fase}</CardTitle>
                            <CardDescription className="flex flex-col gap-1 mt-2">
                              {phase.data_inicio && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Início: {format(new Date(phase.data_inicio), 'dd/MM/yyyy')}
                                </span>
                              )}
                              {totalTasks > 0 && (
                                <span className="font-medium text-primary">
                                  {completedTasks} de {totalTasks} tarefas concluídas
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}
                            className={cn(
                              isCompleted && 'bg-green-500 hover:bg-green-600',
                              isCurrent &&
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                            )}
                          >
                            {isCompleted ? 'Concluída' : isCurrent ? 'Em Progresso' : 'Pendente'}
                          </Badge>
                        </div>
                      </CardHeader>

                      {phaseTasks.length > 0 && (
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="tasks" className="border-b-0">
                              <AccordionTrigger className="py-2 text-sm text-primary hover:no-underline font-medium">
                                Ver Detalhes das Tarefas
                              </AccordionTrigger>
                              <AccordionContent className="pt-4 pb-2">
                                <div className="space-y-4">
                                  {phaseTasks.map((task) => (
                                    <div
                                      key={task.id}
                                      className="flex flex-col gap-2 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                          {['concluida', 'aprovado'].includes(task.status) ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                          ) : task.status === 'rejeitado' ? (
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                          ) : (
                                            <Circle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                          )}
                                          <span className="font-medium text-sm leading-tight">
                                            {task.descricao}
                                          </span>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            'text-[0.65rem] px-1.5 py-0',
                                            task.status === 'rejeitado' &&
                                              'border-red-200 text-red-600 bg-red-50',
                                            task.status === 'enviado' &&
                                              'border-blue-200 text-blue-600 bg-blue-50',
                                            ['concluida', 'aprovado'].includes(task.status) &&
                                              'border-green-200 text-green-600 bg-green-50',
                                          )}
                                        >
                                          {task.status.toUpperCase()}
                                        </Badge>
                                      </div>

                                      {task.status === 'rejeitado' && task.observacoes && (
                                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-100 dark:border-red-900 mt-1">
                                          <strong>Motivo da rejeição:</strong> {task.observacoes}
                                        </div>
                                      )}

                                      {phase.numero_fase === 5 &&
                                        ['pendente', 'rejeitado'].includes(task.status) && (
                                          <div className="mt-2">
                                            <label className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-primary transition-colors border-2 border-dashed rounded-lg cursor-pointer hover:bg-primary/5 hover:border-primary/50">
                                              <FileUp className="w-4 h-4 mr-2" />
                                              <span>Anexar Documento</span>
                                              <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(task.id, e)}
                                              />
                                            </label>
                                          </div>
                                        )}

                                      {task.anexos && (
                                        <a
                                          href={pb.files.getUrl(task, task.anexos)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 mt-1"
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          Visualizar documento enviado
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </CardContent>
                      )}

                      {phase.numero_fase === 6 && (isCurrent || isCompleted) && (
                        <CardContent className="pt-0">
                          <div className="mt-2 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 flex flex-col gap-3">
                            <div>
                              <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Análise Financeira
                              </h4>
                              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                Acesse o módulo para preencher ou visualizar seus dados financeiros.
                              </p>
                            </div>
                            <Button
                              asChild
                              size="sm"
                              className="w-full sm:w-auto self-start bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Link
                                to={`/portal-cliente/analise-financeira?projectId=${project.id}`}
                              >
                                Acessar Módulo <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          {project.fase_atual >= 7 && (
            <TabsContent value="pendencias">
              <Card className="p-6 shadow-sm">
                <ProjectPendencias projetoId={project.id} isPartner={false} />
              </Card>
            </TabsContent>
          )}

          {project.fase_atual >= 8 && (
            <TabsContent value="documentos">
              <Card className="p-6 shadow-sm">
                <ProjectDocumentos projetoId={project.id} isPartner={false} />
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {reports.length > 0 && (
          <div className="mt-16 space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" />
              Seus Relatórios Financeiros
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:border-primary transition-colors bg-white dark:bg-slate-900 shadow-sm hover:shadow-md"
                >
                  <CardHeader className="p-5">
                    <CardTitle className="text-base text-primary leading-tight">
                      {report.nome_relatorio}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Gerado em{' '}
                      {format(new Date(report.created), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex justify-end">
                    {report.arquivo_pdf && (
                      <Button variant="outline" size="sm" asChild className="gap-2">
                        <a
                          href={pb.files.getUrl(report, report.arquivo_pdf)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download className="w-4 h-4" />
                          Baixar PDF
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
