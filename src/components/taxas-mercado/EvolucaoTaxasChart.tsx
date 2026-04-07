import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

export interface HistoricoTaxa {
  date: string
  selic: number
  ipca: number
  cdi: number
  tr: number
  igpm?: number
}

interface EvolucaoTaxasChartProps {
  data: HistoricoTaxa[]
}

const chartConfig = {
  selic: { label: 'SELIC', color: '#3b82f6' }, // blue-500
  ipca: { label: 'IPCA', color: '#10b981' }, // emerald-500
  cdi: { label: 'CDI', color: '#f59e0b' }, // amber-500
  tr: { label: 'TR', color: '#a855f7' }, // purple-500
  igpm: { label: 'IGP-M', color: '#ef4444' }, // red-500
}

export function EvolucaoTaxasChart({ data }: EvolucaoTaxasChartProps) {
  const [filters, setFilters] = useState({
    selic: true,
    ipca: true,
    cdi: true,
    tr: true,
    igpm: true,
  })

  return (
    <Card className="shadow-sm border-slate-200 mt-8 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-800">
          Evolução Histórica (Últimos 12 meses)
        </CardTitle>
        <CardDescription>
          Acompanhe o histórico de variação dos indexadores ao longo do tempo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-6 mb-6">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${key}`}
                checked={filters[key]}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, [key]: !!checked }))}
              />
              <Label
                htmlFor={`filter-${key}`}
                className="flex items-center gap-2 cursor-pointer font-medium text-slate-700"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: chartConfig[key].color }}
                />
                {chartConfig[key].label}
              </Label>
            </div>
          ))}
        </div>

        <div className="h-[400px] w-full mt-4">
          <ChartContainer config={chartConfig}>
            <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value}%`}
                stroke="#64748b"
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              {filters.selic && (
                <Line
                  type="monotone"
                  dataKey="selic"
                  name="SELIC"
                  stroke={chartConfig.selic.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {filters.ipca && (
                <Line
                  type="monotone"
                  dataKey="ipca"
                  name="IPCA"
                  stroke={chartConfig.ipca.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {filters.cdi && (
                <Line
                  type="monotone"
                  dataKey="cdi"
                  name="CDI"
                  stroke={chartConfig.cdi.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {filters.tr && (
                <Line
                  type="monotone"
                  dataKey="tr"
                  name="TR"
                  stroke={chartConfig.tr.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {filters.igpm && (
                <Line
                  type="monotone"
                  dataKey="igpm"
                  name="IGP-M"
                  stroke={chartConfig.igpm.color}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
