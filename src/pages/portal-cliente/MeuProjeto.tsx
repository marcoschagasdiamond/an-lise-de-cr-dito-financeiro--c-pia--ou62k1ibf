import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Calendar, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function MeuProjeto() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)

  useEffect(() => {
    if (user) {
      const fetchProject = async () => {
        try {
          setLoading(true)
          // Mock data to display project status
          setTimeout(() => {
            setProject({
              name: 'Reestruturação Financeira - 2024',
              description:
                'Análise completa de crédito e diagnóstico financeiro focado na redução de passivos e captação de novos recursos.',
              status: 'Em Análise',
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
              documentsRequired: 5,
              documentsSubmitted: 3,
            })
            setLoading(false)
          }, 800)
        } catch (error) {
          console.error(error)
          setLoading(false)
        }
      }

      fetchProject()
    }
  }, [user])

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[200px] w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[150px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f2e4a] dark:text-slate-100">Meu Projeto</h1>
          <p className="text-slate-500 mt-1">Acompanhe o andamento da sua solicitação</p>
        </div>
        <Button className="bg-[#0f2e4a] hover:bg-[#0f2e4a]/90 text-white">
          Falar com Consultor
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-[#0f2e4a] dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  {project?.name || 'Projeto não encontrado'}
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                  {project?.description || 'Nenhum detalhe disponível.'}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 px-3 py-1 flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" />
                {project?.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Data de Início
                </span>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    {project?.createdAt
                      ? new Date(project.createdAt).toLocaleDateString('pt-BR')
                      : '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Última Atualização
                </span>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    {project?.updatedAt
                      ? new Date(project.updatedAt).toLocaleDateString('pt-BR')
                      : '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Documentação
                </span>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    {project?.documentsSubmitted} de {project?.documentsRequired} enviados
                  </span>
                </div>
              </div>
            </div>

            {project?.documentsSubmitted < project?.documentsRequired && (
              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg flex items-start gap-3">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-amber-500" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Ação Pendente
                  </h4>
                  <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1">
                    Existem documentos pendentes para dar continuidade à análise. Por favor, acesse
                    a área de documentos para enviá-los.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
                  >
                    Ir para Documentos
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
