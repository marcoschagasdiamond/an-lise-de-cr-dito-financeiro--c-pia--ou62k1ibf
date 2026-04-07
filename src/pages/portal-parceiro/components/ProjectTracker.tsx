import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Check, Clock, Circle, Upload, Plus } from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { ProjectPendencias } from './ProjectPendencias'
import { ProjectDocumentos } from './ProjectDocumentos'
import { generateProjectReportPDF } from '@/lib/report-utils'
import { FileText } from 'lucide-react'

export function ProjectTracker({
  projetoId,
  faseAtual = 1,
}: {
  projetoId: string
  faseAtual?: number
}) {
  const [fases, setFases] = useState<any[]>([])
  const [tarefas, setTarefas] = useState<Record<string, any[]>>({})

  const loadFases = async () => {
    try {
      const recs = await pb
        .collection('fases_projeto')
        .getFullList({ filter: `projeto_id = "${projetoId}"`, sort: 'numero_fase' })
      setFases(recs)

      const tRecs = await pb
        .collection('tarefas_fase')
        .getFullList({ filter: `fase_id.projeto_id = "${projetoId}"`, sort: 'numero_tarefa' })
      const grouped: any = {}
      tRecs.forEach((t) => {
        if (!grouped[t.fase_id]) grouped[t.fase_id] = []
        grouped[t.fase_id].push(t)
      })
      setTarefas(grouped)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadFases()
  }, [projetoId])

  useRealtime('fases_projeto', () => loadFases())
  useRealtime('tarefas_fase', () => loadFases())

  const toggleTarefa = async (tarefa: any) => {
    const newStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida'
    await pb.collection('tarefas_fase').update(tarefa.id, { status: newStatus })

    const faseTarefas = tarefas[tarefa.fase_id].map((t) =>
      t.id === tarefa.id ? { ...t, status: newStatus } : t,
    )
    const allDone = faseTarefas.every((t) => t.status === 'concluida')

    if (allDone && faseTarefas.length > 0) {
      await pb.collection('fases_projeto').update(tarefa.fase_id, {
        status: 'concluida',
        data_conclusao: new Date().toISOString(),
      })
    }
  }

  const addTarefa = async (faseId: string) => {
    const desc = prompt('Descrição da nova tarefa:')
    if (!desc) return
    await pb.collection('tarefas_fase').create({
      fase_id: faseId,
      descricao: desc,
      status: 'pendente',
      numero_tarefa: (tarefas[faseId]?.length || 0) + 1,
    })
  }

  const handleUpload = async (tarefaId: string, file: File) => {
    const formData = new FormData()
    formData.append('anexos', file)
    await pb.collection('tarefas_fase').update(tarefaId, formData)
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold">Gestão do Projeto</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateProjectReportPDF(projetoId)}
          className="border-primary text-primary hover:bg-primary hover:text-white"
        >
          <FileText className="w-4 h-4 mr-2" /> Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="cronograma" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cronograma">Cronograma & Tarefas</TabsTrigger>
          {faseAtual >= 7 && <TabsTrigger value="pendencias">Pendências (Fase 7)</TabsTrigger>}
          {faseAtual >= 8 && <TabsTrigger value="documentos">Documentos (Fase 8)</TabsTrigger>}
        </TabsList>

        <TabsContent value="cronograma">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {fases.map((fase) => (
              <AccordionItem
                key={fase.id}
                value={fase.id}
                className="border rounded-lg px-4 bg-card shadow-sm"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-full shadow-sm ${fase.status === 'concluida' ? 'bg-green-100 text-green-600' : fase.status === 'em_progresso' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {fase.status === 'concluida' ? (
                        <Check className="w-5 h-5" />
                      ) : fase.status === 'em_progresso' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-left flex flex-col justify-center">
                      <p className="font-semibold text-lg">
                        Fase {fase.numero_fase}: {fase.nome_fase}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${fase.status === 'concluida' ? 'bg-green-100 text-green-700' : fase.status === 'em_progresso' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {fase.status.replace('_', ' ')}
                        </span>
                        {fase.data_inicio && (
                          <span className="text-xs text-muted-foreground">
                            Início: {format(new Date(fase.data_inicio), 'dd/MM/yyyy')}
                          </span>
                        )}
                        {fase.data_conclusao && (
                          <span className="text-xs text-muted-foreground">
                            Fim: {format(new Date(fase.data_conclusao), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-5 border-t mt-2">
                  <div className="space-y-3 mt-4">
                    {tarefas[fase.id]?.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/40 border border-transparent hover:border-border transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={t.status === 'concluida'}
                            onCheckedChange={() => toggleTarefa(t)}
                          />
                          <span
                            className={
                              t.status === 'concluida'
                                ? 'line-through text-muted-foreground'
                                : 'font-medium'
                            }
                          >
                            {t.descricao}
                          </span>
                        </div>
                        <label className="cursor-pointer shrink-0">
                          <Input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleUpload(t.id, e.target.files[0])
                            }}
                          />
                          <span className="flex items-center text-xs font-medium text-primary hover:underline">
                            <Upload className="w-3.5 h-3.5 mr-1" />{' '}
                            {t.anexos ? 'Substituir' : 'Anexar'}
                          </span>
                        </label>
                      </div>
                    ))}
                    {(!tarefas[fase.id] || tarefas[fase.id].length === 0) && (
                      <p className="text-sm text-muted-foreground italic text-center py-2">
                        Nenhuma tarefa cadastrada nesta fase.
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTarefa(fase.id)}
                      className="w-full mt-2 border-dashed"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Tarefa
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        {faseAtual >= 7 && (
          <TabsContent value="pendencias" className="mt-4">
            <ProjectPendencias projetoId={projetoId} isPartner={true} />
          </TabsContent>
        )}

        {faseAtual >= 8 && (
          <TabsContent value="documentos" className="mt-4">
            <ProjectDocumentos projetoId={projetoId} isPartner={true} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
