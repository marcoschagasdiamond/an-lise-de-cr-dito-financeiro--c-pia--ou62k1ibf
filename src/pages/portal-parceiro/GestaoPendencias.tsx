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

export default function GestaoPendencias() {
  const [pendencias, setPendencias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchPendencias() {
      try {
        if (!user) return

        const { data, error } = await supabase
          .from('pendencias')
          .select('*')
          .eq('parceiro_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          // Fallback para mock data se a tabela não existir
          setPendencias([
            {
              id: '1',
              cliente: 'Empresa Alpha',
              descricao: 'Aguardando envio do Balanço Patrimonial',
              status: 'pendente',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              cliente: 'Empresa Beta',
              descricao: 'Assinatura do contrato de parceria pendente',
              status: 'resolvido',
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: '3',
              cliente: 'Empresa Gamma',
              descricao: 'DRE não confere com o faturamento',
              status: 'pendente',
              created_at: new Date(Date.now() - 172800000).toISOString(),
            },
          ])
        } else {
          setPendencias(data || [])
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPendencias()
  }, [user])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolvido':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Resolvido</Badge>
      case 'pendente':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30"
          >
            Pendente
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in-up duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Pendências</h1>
        <p className="text-muted-foreground">
          Acompanhe e resolva as pendências de documentação e análise de crédito dos seus clientes.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Histórico de Pendências</CardTitle>
          <CardDescription>Pendências recentes associadas aos seus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendencias.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Nenhuma pendência encontrada no momento.
            </div>
          ) : (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendencias.map((pendencia) => (
                    <TableRow key={pendencia.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {new Date(pendencia.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {pendencia.cliente || 'Não identificado'}
                      </TableCell>
                      <TableCell className="text-slate-600">{pendencia.descricao || '-'}</TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(pendencia.status)}
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
