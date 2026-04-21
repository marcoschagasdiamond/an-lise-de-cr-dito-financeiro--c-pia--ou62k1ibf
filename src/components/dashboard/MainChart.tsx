import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '@/lib/calculators'

interface MainChartProps {
  data: Array<{
    year: string
    ebitda: number
    ebit: number
    simEbitda: number
    simEbit: number
  }>
  showSimulated: boolean
}

export function MainChart({ data, showSimulated }: MainChartProps) {
  const chartConfig = {
    ebitda: { label: 'EBITDA (Real/Proj)', color: 'hsl(var(--primary))' },
    ebit: { label: 'EBIT (Real/Proj)', color: 'hsl(var(--chart-2))' },
    simEbitda: { label: 'EBITDA (Simulado)', color: 'hsl(var(--primary))' },
    simEbit: { label: 'EBIT (Simulado)', color: 'hsl(var(--chart-2))' },
  }

  return (
    <Card className="glass-card animate-slide-up shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b bg-slate-50/50">
        <CardTitle className="text-lg font-bold text-[#1f497d]">Evolucao EBITDA e EBIT</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[350px] w-full">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Nenhum dado financeiro disponivel.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  width={60}
                />

                <ChartTooltip
                  cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={
                    <ChartTooltipContent
                      formatter={(val: number) => formatCurrency(val)}
                      indicator="line"
                    />
                  }
                />
                <ChartLegend
                  content={<ChartLegendContent verticalAlign="top" className="mb-4 justify-end" />}
                />

                {/* Real Lines */}
                <Line
                  type="monotone"
                  dataKey="ebitda"
                  stroke="var(--color-ebitda)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="ebit"
                  stroke="var(--color-ebit)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />

                {/* Simulated Lines */}
                {showSimulated && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="simEbitda"
                      stroke="var(--color-simEbitda)"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="simEbit"
                      stroke="var(--color-simEbit)"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
