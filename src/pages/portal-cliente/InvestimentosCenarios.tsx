import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function InvestimentosCenarios() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Dados temporários de demonstração enquanto a estrutura é migrada para o Supabase
    const mockData = [
      { mes: 'Jan', conservador: 1000, moderado: 1050, agressivo: 1100 },
      { mes: 'Fev', conservador: 1010, moderado: 1080, agressivo: 1150 },
      { mes: 'Mar', conservador: 1020, moderado: 1100, agressivo: 1080 },
      { mes: 'Abr', conservador: 1030, moderado: 1150, agressivo: 1250 },
      { mes: 'Mai', conservador: 1040, moderado: 1180, agressivo: 1400 },
      { mes: 'Jun', conservador: 1050, moderado: 1220, agressivo: 1600 },
    ]
    setData(mockData)
    setLoading(false)
  }, [user])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando cenários...</div>
  }

  return (
    <div className="container py-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Cenários de Investimentos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Projeção de Rendimentos</CardTitle>
          <CardDescription>
            Comparativo de crescimento do patrimônio em diferentes perfis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ChartContainer
              config={{
                conservador: { label: 'Conservador', color: 'hsl(var(--chart-1))' },
                moderado: { label: 'Moderado', color: 'hsl(var(--chart-2))' },
                agressivo: { label: 'Agressivo', color: 'hsl(var(--chart-3))' },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--muted-foreground)/0.2)"
                  />
                  <XAxis
                    dataKey="mes"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$ ${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="conservador"
                    stroke="var(--color-conservador)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="moderado"
                    stroke="var(--color-moderado)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="agressivo"
                    stroke="var(--color-agressivo)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
