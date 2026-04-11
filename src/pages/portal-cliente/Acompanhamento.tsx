import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function AcompanhamentoPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [registros, setRegistros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    tipo_evento: 'analise',
    descricao: '',
    responsavel: '',
  })

  useEffect(() => {
    let mounted = true

    async function fetchRegistros() {
      if (!user?.id) {
        if (mounted) setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('acompanhamento_projetos' as any)
          .select('*')
          .eq('usuario_id', user.id)
          .order('data_criacao', { ascending: false })

        if (!error && mounted && data) {
          setRegistros(data)
        }
      } catch (error) {
        console.error('Erro inesperado:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchRegistros()
    return () => {
      mounted = false
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) return
    setSubmitting(true)

    try {
      const { error } = await supabase.from('acompanhamento_projetos' as any).insert({
        usuario_id: user.id,
        tipo_evento: formData.tipo_evento,
        descricao: formData.descricao,
        responsavel: formData.responsavel,
        data_evento: new Date().toISOString(),
      })

      if (error) throw error

      toast({ title: 'Evento registrado com sucesso!' })
      setOpen(false)
      setFormData({ tipo_evento: 'analise', descricao: '', responsavel: '' })

      const { data } = await supabase
        .from('acompanhamento_projetos' as any)
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
      if (data) setRegistros(data)
    } catch (error) {
      toast({ title: 'Erro ao registrar evento', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (tipo: string) => {
    if (tipo === 'diagnostico') return <Badge variant="secondary">Diagnóstico</Badge>
    if (tipo === 'analise') return <Badge className="bg-blue-600 hover:bg-blue-700">Análise</Badge>
    if (tipo === 'implementacao')
      return <Badge className="bg-amber-600 hover:bg-amber-700">Implementação</Badge>
    if (tipo === 'resultado')
      return <Badge className="bg-green-600 hover:bg-green-700">Resultado</Badge>
    return <Badge variant="outline">{tipo}</Badge>
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acompanhamento</h1>
          <p className="text-muted-foreground mt-2">
            Registre e acompanhe os eventos de suas análises e projetos.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Novo Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Evento</Label>
                <Select
                  value={formData.tipo_evento}
                  onValueChange={(v) => setFormData({ ...formData, tipo_evento: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diagnostico">Diagnóstico</SelectItem>
                    <SelectItem value="analise">Análise</SelectItem>
                    <SelectItem value="implementacao">Implementação</SelectItem>
                    <SelectItem value="resultado">Resultado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Resumo do evento..."
                />
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  required
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Confirmar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Eventos</CardTitle>
          <CardDescription>
            Lista de todas as interações e progressos registrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : registros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
              <p>Nenhum evento registrado no momento.</p>
              <p className="text-sm mt-1">
                Seus novos registros de acompanhamento aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(item.data_criacao).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.tipo_evento)}</TableCell>
                      <TableCell
                        className="font-medium max-w-[300px] truncate"
                        title={item.descricao}
                      >
                        {item.descricao}
                      </TableCell>
                      <TableCell>{item.responsavel || 'Não informado'}</TableCell>
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
