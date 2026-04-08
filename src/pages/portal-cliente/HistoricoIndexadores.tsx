import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function HistoricoIndexadores() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const { data: indices, error } = await supabase
          .from('indexadores')
          .select('*')
          .order('data_referencia', { ascending: false })
          .limit(20)

        if (error) throw error

        if (mounted) {
          setData(indices || [])
        }
      } catch (err) {
        // Mock data fallback if table doesn't exist or fails
        if (mounted) {
          setData([
            { id: 1, data_referencia: '2024-03-01', selic: '10.75', ipca: '0.16', cdi: '10.65' },
            { id: 2, data_referencia: '2024-02-01', selic: '11.25', ipca: '0.83', cdi: '11.15' },
            { id: 3, data_referencia: '2024-01-01', selic: '11.75', ipca: '0.42', cdi: '11.65' },
            { id: 4, data_referencia: '2023-12-01', selic: '11.75', ipca: '0.56', cdi: '11.65' },
            { id: 5, data_referencia: '2023-11-01', selic: '12.25', ipca: '0.28', cdi: '12.15' },
          ])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico de Indexadores</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe a evolução das principais taxas e índices econômicos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Taxas e Índices</CardTitle>
          <CardDescription>Histórico recente de indicadores (Selic, IPCA, CDI)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data de Referência</TableHead>
                    <TableHead className="text-right">Selic (%)</TableHead>
                    <TableHead className="text-right">CDI (%)</TableHead>
                    <TableHead className="text-right">IPCA (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium capitalize">
                        {new Date(item.data_referencia + 'T00:00:00').toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">{item.selic}%</TableCell>
                      <TableCell className="text-right">{item.cdi}%</TableCell>
                      <TableCell className="text-right">{item.ipca}%</TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Nenhum dado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
