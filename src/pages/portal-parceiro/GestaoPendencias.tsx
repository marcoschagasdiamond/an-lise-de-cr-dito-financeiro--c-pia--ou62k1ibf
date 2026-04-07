import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Header } from '@/components/Header'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, parseISO, isBefore, startOfDay, isAfter, endOfDay } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

function PendenciaDialog({ p, onResolve }: { p: any; onResolve: (id: string) => void }) {
  const [obs, setObs] = useState(p.observacoes || '')

  const handleSave = async () => {
    try {
      await pb.collection('pendencias').update(p.id, { observacoes: obs })
      toast.success('Observações salvas com sucesso.')
    } catch (e) {
      toast.error('Erro ao salvar observações.')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Comentários e Detalhes">
          <MessageSquare className="w-4 h-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Pendência</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="text-sm bg-slate-50 dark:bg-slate-900 p-3 rounded border">
            <strong>Descrição:</strong> {p.descricao}
          </div>
          <div>
            <label className="text-sm font-semibold">Observações / Comunicação</label>
            <Textarea
              className="mt-1 min-h-[100px]"
              placeholder="Adicione notas ou interaja com o cliente..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
            <Button className="mt-3 w-full" onClick={handleSave}>
              Salvar Observações
            </Button>
          </div>
          {p.status !== 'resolvida' && (
            <Button
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => onResolve(p.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como Resolvida
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function GestaoPendencias() {
  const { user } = useAuth()
  const [pendencias, setPendencias] = useState<any[]>([])
  const [filters, setFilters] = useState({
    cliente: '',
    tipo: 'todos',
    status: 'todos',
    inicio: '',
    fim: '',
  })

  const loadData = async () => {
    if (!user) return
    try {
      const records = await pb.collection('pendencias').getFullList({
        filter: `projeto_id.cliente_id.parceiro_id = "${user.id}"`,
        expand: 'projeto_id.cliente_id',
        sort: '-created',
      })
      setPendencias(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('pendencias', loadData)

  const filtered = useMemo(
    () =>
      pendencias.filter((p) => {
        const cNome = p.expand?.projeto_id?.expand?.cliente_id?.nome?.toLowerCase() || ''
        if (filters.cliente && !cNome.includes(filters.cliente.toLowerCase())) return false
        if (filters.tipo !== 'todos' && p.tipo !== filters.tipo) return false
        if (filters.status !== 'todos' && p.status !== filters.status) return false

        const pDate = parseISO(p.created)
        if (filters.inicio && isBefore(pDate, startOfDay(parseISO(filters.inicio)))) return false
        if (filters.fim && isAfter(pDate, endOfDay(parseISO(filters.fim)))) return false

        return true
      }),
    [pendencias, filters],
  )

  const handleResolve = async (id: string) => {
    try {
      await pb.collection('pendencias').update(id, {
        status: 'resolvida',
        data_resolucao: new Date().toISOString(),
      })
      toast.success('Pendência marcada como resolvida!')
    } catch (e) {
      toast.error('Erro ao resolver a pendência.')
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-background overflow-y-auto">
      <Header title="Gestão de Pendências" />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 pb-20 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoramento Global</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe e resolva pendências de todos os projetos ativos.
          </p>
        </div>

        <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-white dark:bg-slate-950 rounded-xl">
            <Input
              placeholder="Buscar por Cliente..."
              value={filters.cliente}
              onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
            />
            <Select value={filters.tipo} onValueChange={(v) => setFilters({ ...filters, tipo: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Pendência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Tipos</SelectItem>
                <SelectItem value="tributaria">Tributária</SelectItem>
                <SelectItem value="bacen">Bacen</SelectItem>
                <SelectItem value="documentacao">Documentação</SelectItem>
                <SelectItem value="outra">Outra</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters({ ...filters, status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="em_resolucao">Em Resolução</SelectItem>
                <SelectItem value="resolvida">Resolvida</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              title="Data Inicial"
              value={filters.inicio}
              onChange={(e) => setFilters({ ...filters, inicio: e.target.value })}
            />
            <Input
              type="date"
              title="Data Final"
              value={filters.fim}
              onChange={(e) => setFilters({ ...filters, fim: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableHead className="w-[200px]">Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="group">
                    <TableCell className="font-medium text-primary">
                      {p.expand?.projeto_id?.expand?.cliente_id?.nome || 'N/D'}
                    </TableCell>
                    <TableCell className="capitalize">{p.tipo}</TableCell>
                    <TableCell
                      className="max-w-[250px] truncate text-muted-foreground"
                      title={p.descricao}
                    >
                      {p.descricao}
                    </TableCell>
                    <TableCell>{format(parseISO(p.created), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === 'resolvida' ? 'default' : 'outline'}
                        className={
                          p.status === 'resolvida'
                            ? 'bg-green-500'
                            : p.status === 'aberta'
                              ? 'text-red-600 bg-red-50 border-red-200'
                              : 'text-yellow-600 bg-yellow-50 border-yellow-200'
                        }
                      >
                        {p.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      {p.status !== 'resolvida' && (
                        <Button
                          size="icon"
                          variant="outline"
                          title="Marcar como Resolvida"
                          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 h-8 w-8"
                          onClick={() => handleResolve(p.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      <PendenciaDialog p={p} onResolve={handleResolve} />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Nenhuma pendência encontrada para os filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
