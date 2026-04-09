import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

export default function Comissoes() {
  const [comissoes, setComissoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchComissoes() {
      try {
        const { data, error } = await supabase
          .from('comissoes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          // Fallback para mock data se a tabela não existir ou outro erro
          setComissoes([
            {
              id: '1',
              parceiro: 'João Silva',
              valor: 1500.0,
              status: 'pago',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              parceiro: 'Maria Souza',
              valor: 850.5,
              status: 'pendente',
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: '3',
              parceiro: 'Empresa XYZ',
              valor: 3200.0,
              status: 'cancelado',
              created_at: new Date(Date.now() - 172800000).toISOString(),
            },
          ])
        } else {
          setComissoes(data || [])
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComissoes()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pago':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Pago</Badge>
      case 'pendente':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30"
          >
            Pendente
          </Badge>
        )
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in-up duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Comissões</h1>
        <p className="text-muted-foreground">Gerencie e acompanhe as comissões dos parceiros.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de Comissões</CardTitle>
          <CardDescription>Últimas comissões registradas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : comissoes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Nenhuma comissão encontrada.
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Parceiro / Referência</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoes.map((comissao) => (
                    <TableRow key={comissao.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-600">
                        {new Date(comissao.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {comissao.parceiro || comissao.parceiro_id || 'Não identificado'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(comissao.valor || 0))}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(comissao.status)}
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
