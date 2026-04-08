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
import { Loader2 } from 'lucide-react'

interface Analise {
  id: string
  created_at: string
  status: string
  tipo?: string
  empresa?: string
}

export default function AcompanhamentoPage() {
  const { user } = useAuth()
  const [analises, setAnalises] = useState<Analise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchAnalises() {
      if (!user?.email) {
        if (mounted) setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('analises')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          console.warn('Erro ao carregar análises:', error.message)
          if (mounted) setAnalises([])
          return
        }

        if (mounted && data) {
          setAnalises(data as Analise[])
        }
      } catch (error) {
        console.error('Erro inesperado:', error)
        if (mounted) setAnalises([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchAnalises()

    return () => {
      mounted = false
    }
  }, [user])

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Indefinido</Badge>

    const s = status.toLowerCase()
    if (s.includes('pendente')) return <Badge variant="secondary">Pendente</Badge>
    if (s.includes('aprovado'))
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          Aprovado
        </Badge>
      )
    if (s.includes('rejeitado') || s.includes('reprovado'))
      return <Badge variant="destructive">Reprovado</Badge>
    if (s.includes('analise') || s.includes('análise'))
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          Em Análise
        </Badge>
      )

    return <Badge variant="outline">{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Acompanhamento</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o status das suas solicitações de crédito e diagnósticos financeiros.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Solicitações</CardTitle>
          <CardDescription>
            Lista de todas as suas análises recentes registradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
              <p>Nenhuma solicitação encontrada no momento.</p>
              <p className="text-sm mt-1">Suas novas análises de crédito aparecerão aqui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data da Solicitação</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Empresa/CNPJ</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analises.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.tipo || 'Análise de Crédito'}
                      </TableCell>
                      <TableCell>{item.empresa || 'Não informada'}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
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
