import React, { useMemo } from 'react'
import { useFinancialStore } from '@/store/main'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { formatCurrency } from '@/lib/calculators'

const chartConfig = {
  ativo: { label: 'Ativo Total', color: 'hsl(var(--primary))' },
  passivo: { label: 'Passivo Total', color: 'hsl(var(--destructive))' },
  pl: { label: 'Patrimônio Líquido', color: 'hsl(var(--chart-2))' },
}

const chartConfigDetailed = {
  ac: { label: 'Ativo Circulante', color: 'hsl(var(--chart-1))' },
  pc: { label: 'Passivo Circulante', color: 'hsl(var(--chart-3))' },
  estoques: { label: 'Estoques', color: 'hsl(var(--chart-4))' },
  clientes: { label: 'Clientes a Receber', color: 'hsl(var(--chart-5))' },
}

export function PatrimonialTrends() {
  const { balanceSheets, baseYear } = useFinancialStore()

  const data = useMemo(() => {
    const years = [baseYear, baseYear + 1, baseYear + 2]
    return years.map((y) => {
      const bp = balanceSheets.find((b) => b.year === y)
      const ativo = (bp?.ativoCirculante || 0) + (bp?.ativoNaoCirculante || 0)
      const passivo = (bp?.passivoCirculante || 0) + (bp?.passivoNaoCirculante || 0)
      const pl = bp?.patrimonioLiquido || 0

      return {
        year: y.toString(),
        ativo,
        passivo,
        pl,
        ac: bp?.ativoCirculante || 0,
        pc: bp?.passivoCirculante || 0,
        estoques: bp?.estoques || 0,
        clientes: bp?.clientesAReceber || 0,
      }
    })
  }, [baseYear, balanceSheets])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <Card className="shadow-sm border-border bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Evolução Patrimonial</CardTitle>
          <CardDescription>Crescimento do Ativo vs Passivo e Patrimônio Líquido</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`}
                width={80}
              />
              <ChartTooltip
                cursor={{
                  stroke: 'var(--color-muted-foreground)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
                content={
                  <ChartTooltipContent formatter={(value: number) => formatCurrency(value)} />
                }
              />
              <ChartLegend content={<ChartLegendContent />} verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="ativo"
                name="Ativo Total"
                stroke="var(--color-ativo)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="passivo"
                name="Passivo Total"
                stroke="var(--color-passivo)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="pl"
                name="Patrimônio Líquido"
                stroke="var(--color-pl)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Contas de Giro</CardTitle>
          <CardDescription>Variação de Estoques, Clientes e Circulantes</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigDetailed} className="h-[280px] w-full">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`}
                width={80}
              />
              <ChartTooltip
                cursor={{
                  stroke: 'var(--color-muted-foreground)',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
                }}
                content={
                  <ChartTooltipContent formatter={(value: number) => formatCurrency(value)} />
                }
              />
              <ChartLegend content={<ChartLegendContent />} verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="ac"
                name="Ativo Circulante"
                stroke="var(--color-ac)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="pc"
                name="Passivo Circulante"
                stroke="var(--color-pc)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="estoques"
                name="Estoques"
                stroke="var(--color-estoques)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="clientes"
                name="Clientes"
                stroke="var(--color-clientes)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
