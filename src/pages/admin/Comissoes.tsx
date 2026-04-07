import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import pb from '@/lib/pocketbase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function AdminComissoes() {
  const [comissoes, setComissoes] = useState<any[]>([])

  const loadData = async () => {
    try {
      const res = await pb
        .collection('comissoes')
        .getFullList({ sort: '-created', expand: 'cliente_id,parceiro_id' })
      setComissoes(res)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await pb.collection('comissoes').update(id, { status: newStatus })
      toast.success('Status atualizado.')
      loadData()
    } catch (err) {
      toast.error('Erro ao atualizar.')
    }
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background">
      <Header title="Gestão de Comissões" />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-20">
        <h1 className="text-3xl font-bold text-primary mb-8">Comissões Geradas</h1>
        <Card>
          <CardHeader>
            <CardTitle>Todas as Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Status Atual</TableHead>
                  <TableHead>Ação Rápida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comissoes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {c.expand?.parceiro_id?.name || c.expand?.parceiro_id?.email || '—'}
                    </TableCell>
                    <TableCell>{c.expand?.cliente_id?.nome || '—'}</TableCell>
                    <TableCell>{formatCurrency(c.valor_comissao)}</TableCell>
                    <TableCell>{c.percentual}%</TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.status.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={c.status}
                        onValueChange={(val) => handleStatusChange(c.id, val)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="aprovado">Aprovado</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
