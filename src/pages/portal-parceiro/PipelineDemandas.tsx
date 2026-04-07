import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConferenciaEnvio } from '@/components/projetos/ConferenciaEnvio'
import { useRealtime } from '@/hooks/use-realtime'
import { Loader2, ArrowRight } from 'lucide-react'

export default function PipelineDemandas() {
  const { user } = useAuth()
  const [projetos, setProjetos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProjeto, setSelectedProjeto] = useState<any | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const loadProjetos = async () => {
    try {
      const res = await pb.collection('projetos').getFullList({
        expand: 'cliente_id',
        sort: '-created',
      })
      setProjetos(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadProjetos()
  }, [user])

  useRealtime('projetos', () => loadProjetos())

  const getFaseGroup = (fase: number) => {
    if (!fase || fase <= 3) return '1-3'
    if (fase <= 6) return '4-6'
    if (fase <= 8) return '7-8'
    return '9+'
  }

  const columns = [
    { id: '1-3', title: 'Fase Inicial (1-3)' },
    { id: '4-6', title: 'Análise (4-6)' },
    { id: '7-8', title: 'Estruturação (7-8)' },
    { id: '9+', title: 'Envio aos Bancos (9+)' },
  ]

  const groupedProjetos = columns.map((col) => ({
    ...col,
    items: projetos.filter((p) => getFaseGroup(p.fase_atual) === col.id),
  }))

  const openProjeto = (p: any) => {
    setSelectedProjeto(p)
    setIsSheetOpen(true)
  }

  const avancaFase = async (id: string, currentFase: number) => {
    try {
      const novaFase = (currentFase || 1) + 1
      await pb.collection('projetos').update(id, { fase_atual: novaFase })
      if (selectedProjeto?.id === id) {
        setSelectedProjeto({ ...selectedProjeto, fase_atual: novaFase })
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/20">
      <Header title="Pipeline de Demandas" />

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="flex gap-6 h-full items-start min-w-max pb-8 animate-fade-in">
            {groupedProjetos.map((col) => (
              <div
                key={col.id}
                className="flex flex-col w-80 shrink-0 bg-muted/50 rounded-xl p-4 gap-4 border"
              >
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-semibold text-sm text-foreground/80">{col.title}</h3>
                  <Badge variant="secondary">{col.items.length}</Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {col.items.map((p) => (
                    <Card
                      key={p.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
                      onClick={() => openProjeto(p)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base truncate">
                          {p.expand?.cliente_id?.nome || 'Cliente não identificado'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>Fase {p.fase_atual || 1}</span>
                          <span>{new Date(p.created).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {p.valor_operacao > 0 && (
                          <div className="text-sm font-medium mt-1">
                            R$ {p.valor_operacao.toLocaleString('pt-BR')}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {col.items.length === 0 && (
                    <div className="text-sm text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-background/50">
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto bg-muted/10">
          {selectedProjeto && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl">
                  {selectedProjeto.expand?.cliente_id?.nome}
                </SheetTitle>
                <SheetDescription>
                  Gerenciamento do projeto - Atualmente na{' '}
                  <strong className="text-foreground">
                    Fase {selectedProjeto.fase_atual || 1}
                  </strong>
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Simulation block to advance phase if not in phase 9 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-background border rounded-lg shadow-sm gap-4">
                  <div>
                    <p className="text-sm font-medium">Avançar andamento do projeto</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mova o projeto para a próxima fase se todos os requisitos atuais estiverem
                      concluídos.
                    </p>
                  </div>
                  <Button
                    onClick={() => avancaFase(selectedProjeto.id, selectedProjeto.fase_atual)}
                    className="gap-2 shrink-0"
                  >
                    Próxima Fase
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {selectedProjeto.fase_atual >= 9 ? (
                  <ConferenciaEnvio projeto={selectedProjeto} />
                ) : (
                  <div className="p-12 text-center border border-dashed rounded-lg bg-background">
                    <h3 className="font-medium text-foreground mb-2">
                      Painel de Envio Indisponível
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Avance o projeto para a <strong>Fase 9</strong> para liberar a conferência de
                      documentos e o módulo de envio para instituições financeiras.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
