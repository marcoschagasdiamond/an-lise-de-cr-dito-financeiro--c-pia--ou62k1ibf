import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useFinancialStore } from '@/store/main'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts'
import { formatCurrency } from '@/lib/calculators'
import { AlertTriangle } from 'lucide-react'

interface Props {
  params: { rev: number; cost: number; rate: number }
  setParams: (p: any) => void
}

export function StressTestArea({ params, setParams }: Props) {
  const { balanceSheets, dre } = useFinancialStore()

  const bp2023 = balanceSheets.find((b) => b.year === 2023)
  const dre2023 = dre.find((d) => d.year === 2023)

  const basePL = bp2023?.patrimonioLiquido || 0
  const baseRev = dre2023?.receita || 0
  const baseCost = (dre2023?.cpv || 0) + (dre2023?.despesasOperacionais || 0)
  const baseDepr = dre2023?.depreciacao || 0
  const baseInterest = dre2023?.juros || 0
  const baseNI = baseRev - baseCost - baseDepr - baseInterest

  // Stressed calculations
  const stRev = baseRev * (1 + params.rev / 100)
  const stCost = baseCost * (1 + params.cost / 100)
  const stInterest = baseInterest * (1 + params.rate / 100)
  const stNI = stRev - stCost - baseDepr - stInterest

  // Stressed Equity = Base Equity - Base Net Income + Stressed Net Income
  const stPL = basePL - baseNI + stNI

  const chartData = [
    { name: 'Cenário Base', valor: basePL, fill: 'hsl(var(--primary))' },
    {
      name: 'Estressado',
      valor: stPL,
      fill: stPL < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--chart-4))',
    },
  ]

  const chartConfig = {
    valor: { label: 'Patrimônio Líquido' },
  }

  const formatPercent = (val: number) => (val > 0 ? `+${val}%` : `${val}%`)

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up"
      style={{ animationDelay: '0.1s' }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Painel de Estresse</CardTitle>
          <CardDescription>Ajuste os cenários para ver o impacto financeiro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Variação de Receita</Label>
              <span className="text-sm font-mono">{formatPercent(params.rev)}</span>
            </div>
            <Slider
              value={[params.rev]}
              min={-50}
              max={50}
              step={1}
              onValueChange={(v) => setParams({ ...params, rev: v[0] })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Variação de Custos (CPV + Op.)</Label>
              <span className="text-sm font-mono">{formatPercent(params.cost)}</span>
            </div>
            <Slider
              value={[params.cost]}
              min={-20}
              max={50}
              step={1}
              onValueChange={(v) => setParams({ ...params, cost: v[0] })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Aumento na Taxa de Juros</Label>
              <span className="text-sm font-mono">{formatPercent(params.rate)}</span>
            </div>
            <Slider
              value={[params.rate]}
              min={0}
              max={300}
              step={10}
              onValueChange={(v) => setParams({ ...params, rate: v[0] })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impacto no Patrimônio Líquido</CardTitle>
          <CardDescription>Comparação com o ano base (2023)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-[300px]">
          {stPL < 0 && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-md flex items-center gap-2 text-sm font-medium animate-fade-in">
              <AlertTriangle className="w-5 h-5" />
              Alerta Crítico: O cenário leva a um Passivo a Descoberto!
            </div>
          )}
          <ChartContainer config={chartConfig} className="flex-1 w-full min-h-0">
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                content={<ChartTooltipContent formatter={(v: number) => formatCurrency(v)} />}
              />
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
