import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle2, Clock, Send } from 'lucide-react'

export function ProjectPendencias({
  projetoId,
  isPartner = true,
}: {
  projetoId: string
  isPartner?: boolean
}) {
  const [pendencias, setPendencias] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ tipo: 'documentacao', descricao: '', responsavel: '' })
  const [obsMap, setObsMap] = useState<Record<string, string>>({})

  const loadData = async () => {
    try {
      const records = await pb.collection('pendencias').getFullList({
        filter: `projeto_id = "${projetoId}"`,
        sort: '-created',
      })
      setPendencias(records)

      setObsMap((prev) => {
        const next = { ...prev }
        records.forEach((r) => {
          if (next[r.id] === undefined) next[r.id] = r.observacoes || ''
        })
        return next
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [projetoId])
  useRealtime('pendencias', loadData)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await pb.collection('pendencias').create({
        ...formData,
        projeto_id: projetoId,
        status: 'aberta',
      })
      setIsOpen(false)
      setFormData({ tipo: 'documentacao', descricao: '', responsavel: '' })
    } catch (err) {
      console.error(err)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const data: any = { status }
      if (status === 'resolvida') data.data_resolucao = new Date().toISOString()
      await pb.collection('pendencias').update(id, data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveObs = async (id: string) => {
    try {
      await pb.collection('pendencias').update(id, { observacoes: obsMap[id] })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pendências Identificadas</h3>
        {isPartner && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Nova Pendência</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Pendência</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tributaria">Tributária</SelectItem>
                      <SelectItem value="bacen">Bacen</SelectItem>
                      <SelectItem value="documentacao">Documentação</SelectItem>
                      <SelectItem value="outra">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsável (Opcional)</label>
                  <Input
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Salvar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {pendencias.map((p) => (
          <Card key={p.id}>
            <CardHeader className="py-3">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-center">
                  {p.status === 'aberta' ? (
                    <AlertCircle className="text-red-500 w-5 h-5" />
                  ) : p.status === 'em_resolucao' ? (
                    <Clock className="text-yellow-500 w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="text-green-500 w-5 h-5" />
                  )}
                  <CardTitle className="text-base">{p.descricao}</CardTitle>
                </div>
                <Badge
                  variant={p.status === 'resolvida' ? 'default' : 'outline'}
                  className={
                    p.status === 'resolvida'
                      ? 'bg-green-500'
                      : p.status === 'aberta'
                        ? 'text-red-600 border-red-200 bg-red-50'
                        : 'text-yellow-600 border-yellow-200 bg-yellow-50'
                  }
                >
                  {p.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>
                  Tipo: <strong className="capitalize">{p.tipo}</strong>
                </span>
                {p.responsavel && (
                  <span>
                    Resp: <strong>{p.responsavel}</strong>
                  </span>
                )}
                <span>Criado em: {format(new Date(p.created), 'dd/MM/yyyy')}</span>
              </div>

              <div className="bg-muted/50 p-3 rounded-md space-y-3">
                <label className="text-sm font-semibold">Observações / Comunicação</label>
                <div className="flex items-start gap-2">
                  <Textarea
                    value={obsMap[p.id] ?? p.observacoes ?? ''}
                    onChange={(e) => setObsMap({ ...obsMap, [p.id]: e.target.value })}
                    placeholder="Adicione notas ou responda aqui..."
                    className="min-h-[60px] bg-background resize-y"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleSaveObs(p.id)}
                    disabled={obsMap[p.id] === p.observacoes}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isPartner && p.status !== 'resolvida' && (
                <div className="flex gap-2 justify-end mt-2">
                  {p.status === 'aberta' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(p.id, 'em_resolucao')}
                    >
                      Em Resolução
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateStatus(p.id, 'resolvida')}
                  >
                    Marcar como Resolvida
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {pendencias.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
            Nenhuma pendência registrada.
          </div>
        )}
      </div>
    </div>
  )
}
