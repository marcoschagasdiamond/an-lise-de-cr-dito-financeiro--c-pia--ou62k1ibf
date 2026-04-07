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
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Badge } from '@/components/ui/badge'

export default function MinhasComissoes() {
  const { user } = useAuth()
  const [comissoes, setComissoes] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    pb.collection('comissoes')
      .getFullList({
        filter: `parceiro_id = "${user.id}"`,
        sort: '-created',
        expand: 'cliente_id',
      })
      .then(setComissoes)
      .catch(console.error)
  }, [user])

  const totalPendentes = comissoes
    .filter((c) => c.status === 'pendente' || c.status === 'aprovado')
    .reduce((a, b) => a + b.valor_comissao, 0)
  const totalPago = comissoes
    .filter((c) => c.status === 'pago')
    .reduce((a, b) => a + b.valor_comissao, 0)

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
      <Header title="Minhas Comissões" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full pb-20">
        <h1 className="text-3xl font-bold text-primary mb-8">Painel Financeiro</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">A Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">
                {formatCurrency(totalPendentes)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Recebido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{formatCurrency(totalPago)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            {comissoes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma comissão registrada.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor Comissão</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Geração</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.expand?.cliente_id?.nome || '—'}
                      </TableCell>
                      <TableCell>{formatCurrency(c.valor_comissao)}</TableCell>
                      <TableCell>{c.percentual}%</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === 'pago'
                              ? 'default'
                              : c.status === 'cancelado'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {c.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(c.created).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
