import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function HistoricoIndexadores() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await pb.send('/backend/v1/fetch-indexer-history', { method: 'GET' })
        const merged: Record<string, any> = {}

        res.selic?.forEach((item: any) => {
          merged[item.data] = { data: item.data, selic: parseFloat(item.valor) }
        })
        res.ipca?.forEach((item: any) => {
          if (!merged[item.data]) merged[item.data] = { data: item.data }
          merged[item.data].ipca = parseFloat(item.valor)
        })

        const arr = Object.values(merged)
          .map((d: any) => {
            const dateObj = parse(d.data, 'dd/MM/yyyy', new Date())
            return {
              ...d,
              dateObj,
              monthStr: format(dateObj, 'MMM/yy', { locale: ptBR }),
            }
          })
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

        setData(arr)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header title="Histórico de Indexadores" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Evolução do Mercado</h1>
            <p className="text-slate-500 text-sm">
              Acompanhe as taxas SELIC e IPCA dos últimos 12 meses
            </p>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle>Gráfico de Evolução</CardTitle>
            <CardDescription>Dados oficiais do Banco Central do Brasil</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground animate-pulse">
                Carregando histórico...
              </div>
            ) : (
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    selic: { label: 'SELIC', color: '#2563eb' },
                    ipca: { label: 'IPCA', color: '#10b981' },
                  }}
                >
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="monthStr" tickMargin={10} />
                    <YAxis tickFormatter={(val) => `${val}%`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                      type="monotone"
                      dataKey="selic"
                      name="SELIC (% a.m.)"
                      stroke="var(--color-selic)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ipca"
                      name="IPCA (% a.m.)"
                      stroke="var(--color-ipca)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && data.length > 0 && (
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle>Tabela de Dados Históricos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Mês/Ano</TableHead>
                      <TableHead className="text-right text-blue-700">SELIC (%)</TableHead>
                      <TableHead className="text-right text-emerald-700">IPCA (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...data].reverse().map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-slate-500">{row.data}</TableCell>
                        <TableCell className="font-medium">{row.monthStr}</TableCell>
                        <TableCell className="text-right font-semibold text-blue-700">
                          {row.selic?.toFixed(2) || '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-emerald-700">
                          {row.ipca?.toFixed(2) || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
