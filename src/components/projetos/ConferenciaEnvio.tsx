import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { CheckCircle2, XCircle, Send, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getInstituicoesAtivas } from '@/services/instituicoes'
import { getEnviosPorProjeto, atualizarEnvio, enviarParaInstituicao } from '@/services/envios'

export function ConferenciaEnvio({ projeto }: { projeto: any }) {
  const [docs, setDocs] = useState<any[]>([])
  const [pendencias, setPendencias] = useState<any[]>([])
  const [instituicoes, setInstituicoes] = useState<any[]>([])
  const [envios, setEnvios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedInst, setSelectedInst] = useState<string>('')

  const loadData = async () => {
    try {
      const [d, p, i, e] = await Promise.all([
        pb.collection('documentos_projeto').getFullList({ filter: `projeto_id="${projeto.id}"` }),
        pb.collection('pendencias').getFullList({ filter: `projeto_id="${projeto.id}"` }),
        getInstituicoesAtivas(),
        getEnviosPorProjeto(projeto.id),
      ])
      setDocs(d)
      setPendencias(p)
      setInstituicoes(i)
      setEnvios(e)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projeto.id])

  useRealtime('envios_instituicoes', () => {
    getEnviosPorProjeto(projeto.id).then(setEnvios).catch(console.error)
  })

  const allDocsApproved = docs.length > 0 && docs.every((d) => d.status === 'aprovado')
  const allPendenciesResolved = pendencias.every((p) => p.status === 'resolvida')
  // Assumes that if valor_operacao is present, some basic financial structuring has been done
  const financialDataOk = !!projeto.valor_operacao

  const canSend = allDocsApproved && allPendenciesResolved && financialDataOk

  const handleSend = async () => {
    if (!selectedInst) return toast.error('Selecione uma instituição.')
    setSending(true)
    try {
      const docsIds = docs.map((d) => d.id)
      await enviarParaInstituicao(projeto.id, selectedInst, docsIds)
      toast.success('Projeto enviado com sucesso para análise!')
      setSelectedInst('')
    } catch (err) {
      toast.error('Erro ao enviar projeto.')
    } finally {
      setSending(false)
    }
  }

  const handleUpdateStatus = async (envioId: string, novoStatus: string) => {
    try {
      await atualizarEnvio(envioId, { status: novoStatus })
      toast.success('Status do envio atualizado')
    } catch (e) {
      toast.error('Erro ao atualizar status')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary" />
      </div>
    )

  const StatusIcon = ({ ok }: { ok: boolean }) =>
    ok ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
    ) : (
      <XCircle className="w-5 h-5 text-destructive shrink-0" />
    )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conferência e Envio para Instituições</CardTitle>
          <CardDescription>
            Verifique os requisitos antes de enviar a proposta aos bancos e financeiras.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card shadow-sm">
              <StatusIcon ok={allDocsApproved} />
              <div className="text-sm">
                <p className="font-medium text-foreground">Documentos</p>
                <p className="text-muted-foreground text-xs">
                  {docs.length === 0 ? 'Nenhum anexado' : 'Todos aprovados'} ({docs.length})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card shadow-sm">
              <StatusIcon ok={allPendenciesResolved} />
              <div className="text-sm">
                <p className="font-medium text-foreground">Pendências</p>
                <p className="text-muted-foreground text-xs">
                  {pendencias.length > 0 && !allPendenciesResolved
                    ? 'Pendências abertas'
                    : 'Nenhuma em aberto'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-card shadow-sm">
              <StatusIcon ok={financialDataOk} />
              <div className="text-sm">
                <p className="font-medium text-foreground">Dados Financeiros</p>
                <p className="text-muted-foreground text-xs">Preenchidos / Validados</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end bg-muted/30 p-5 rounded-lg border border-dashed">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium">Selecione a Instituição Financeira</label>
              <Select value={selectedInst} onValueChange={setSelectedInst}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um banco ou financeira..." />
                </SelectTrigger>
                <SelectContent>
                  {instituicoes.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              disabled={!canSend || !selectedInst || sending}
              onClick={handleSend}
              className="gap-2 w-full sm:w-auto"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar Projeto
            </Button>
          </div>
          {!canSend && (
            <p className="text-xs text-destructive font-medium flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Resolva todas as pendências, preencha os dados e aprove todos os documentos antes de
              enviar.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Acompanhamento de Envios</span>
            <Button variant="ghost" size="icon" onClick={loadData} title="Atualizar Tabela">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {envios.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
              Nenhum envio realizado para este projeto.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Instituição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atualizar Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {envios.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm">
                        {new Date(e.data_envio).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {e.expand?.instituicao_id?.nome}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            e.status === 'aprovado'
                              ? 'default'
                              : e.status === 'rejeitado'
                                ? 'destructive'
                                : e.status === 'em_analise'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {e.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={e.status}
                          onValueChange={(val) => handleUpdateStatus(e.id, val)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enviado">Enviado</SelectItem>
                            <SelectItem value="recebido">Recebido</SelectItem>
                            <SelectItem value="em_analise">Em Análise</SelectItem>
                            <SelectItem value="aprovado">Aprovado</SelectItem>
                            <SelectItem value="rejeitado">Rejeitado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
