import { useState } from 'react'
import { Header } from '@/components/Header'
import { StatCards } from '@/components/dashboard/StatCards'
import { MainChart } from '@/components/dashboard/MainChart'
import { BottomWidgets } from '@/components/dashboard/BottomWidgets'
import { PatrimonialTrends } from '@/components/control-panel/PatrimonialTrends'
import { RiskAnalysisPanel } from '@/components/risk/RiskAnalysisPanel'
import { SensitivityAnalysis } from '@/components/dashboard/SensitivityAnalysis'
import { StakeholdersDialog } from '@/components/dashboard/StakeholdersDialog'
import { ScheduleDialog } from '@/components/dashboard/ScheduleDialog'
import { ShareReportDialog } from '@/components/dashboard/ShareReportDialog'
import { useFinancialStore } from '@/store/main'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts'
import { calculateLiquidity } from '@/lib/calculators'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const liqChartConfig = {
  corrente: { label: 'Liq. Corrente', color: 'hsl(var(--primary))' },
  seca: { label: 'Liq. Seca', color: 'hsl(var(--chart-2))' },
  geral: { label: 'Liq. Geral', color: 'hsl(var(--chart-3))' },
  solvencia: { label: 'Solvência', color: 'hsl(var(--chart-4))' },
}

export default function DashboardExecutivo() {
  const { dre, balanceSheets, baseYear } = useFinancialStore()

  // Sensitivity Analysis State
  const [revenueVar, setRevenueVar] = useState(0)
  const [expenseVar, setExpenseVar] = useState(0)
  const [showSimulatedChart, setShowSimulatedChart] = useState(true)

  const isSimulating = revenueVar !== 0 || expenseVar !== 0

  // Fallback if DRE is empty
  const defaultMetrics = { receita: 0, despesas: 0, ebitda: 0, ebit: 0 }
  const latestDRE =
    dre.length > 0
      ? dre[dre.length - 1]
      : { receita: 0, custos: 0, despesasOp: 0, ebitda: 0, ebit: 0 }

  const originalMetrics = {
    receita: latestDRE.receita || 0,
    despesas: (latestDRE.custos || 0) + (latestDRE.despesasOp || 0),
    ebitda: latestDRE.ebitda || 0,
    ebit: latestDRE.ebit || 0,
  }

  const simRevenue = originalMetrics.receita * (1 + revenueVar / 100)
  const simExpenses = originalMetrics.despesas * (1 + expenseVar / 100)
  const simEbitda = simRevenue - simExpenses
  const simEbit = simEbitda - (originalMetrics.ebitda - originalMetrics.ebit) // Keeping D&A constant

  const simulatedMetrics = {
    receita: simRevenue,
    despesas: simExpenses,
    ebitda: simEbitda,
    ebit: simEbit,
  }

  // Prep chart data applying sensitivity to all historical periods for visualization
  const dreChartData = dre.map((d) => {
    const rev = d.receita || 0
    const exp = (d.custos || 0) + (d.despesasOp || 0)
    const ebitda = d.ebitda || 0
    const ebit = d.ebit || 0

    const sRev = rev * (1 + revenueVar / 100)
    const sExp = exp * (1 + expenseVar / 100)
    const sEbitda = sRev - sExp
    const sEbit = sEbitda - (ebitda - ebit)

    return {
      year: (d.year || baseYear).toString(),
      ebitda,
      ebit,
      simEbitda: sEbitda,
      simEbit: sEbit,
    }
  })

  const years = [baseYear, baseYear + 1, baseYear + 2]
  const bpChartData = years.map((year) => {
    const bp = balanceSheets.find((b) => b.year === year) || {
      ativoCirculante: 0,
      estoques: 0,
      ativoNaoCirculante: 0,
      passivoCirculante: 0,
      passivoNaoCirculante: 0,
      patrimonioLiquido: 0,
      year,
    }
    const liq = calculateLiquidity(bp as any)
    const ativoTotal = bp.ativoCirculante + bp.ativoNaoCirculante
    const passivoExigivel = bp.passivoCirculante + bp.passivoNaoCirculante
    const solvencia = passivoExigivel > 0 ? ativoTotal / passivoExigivel : 0

    return {
      year: year.toString(),
      corrente: liq.corrente,
      seca: liq.seca,
      geral: liq.geral,
      solvencia,
    }
  })

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50 dark:bg-background">
      <Header title="Dashboard Executivo" />
      <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full pb-20 animate-fade-in-up">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#1f497d]">Ferramentas Executivas</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie relatórios e simule cenários financeiros.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <StakeholdersDialog />
            <ScheduleDialog />
            <ShareReportDialog />
          </div>
        </div>

        {/* Core KPIs */}
        <StatCards
          original={originalMetrics}
          simulated={simulatedMetrics}
          isSimulating={isSimulating}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex justify-end items-center gap-2 px-2">
              <Switch
                id="show-sim"
                checked={showSimulatedChart}
                onCheckedChange={setShowSimulatedChart}
                disabled={!isSimulating}
              />
              <Label htmlFor="show-sim" className="cursor-pointer">
                Mostrar Linha Simulada no Gráfico
              </Label>
            </div>
            <MainChart data={dreChartData} showSimulated={isSimulating && showSimulatedChart} />
          </div>

          {/* Sensitivity Analysis */}
          <div className="xl:col-span-1">
            <SensitivityAnalysis
              revenueVar={revenueVar}
              setRevenueVar={setRevenueVar}
              expenseVar={expenseVar}
              setExpenseVar={setExpenseVar}
              onReset={() => {
                setRevenueVar(0)
                setExpenseVar(0)
              }}
            />
          </div>
        </div>

        {/* Patrimonial Trends */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold tracking-tight mb-4 text-[#1f497d]">
            Painel de Tendências e Solvência
          </h3>
          <PatrimonialTrends />
        </div>

        {/* Liquidity and Solvency Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="shadow-sm border-[#1f497d]/20">
            <CardHeader className="bg-slate-50 border-b border-border">
              <CardTitle className="text-[#1f497d]">Índices de Liquidez</CardTitle>
              <CardDescription>
                Evolução histórica ({years[0]} - {years[2]})
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={liqChartConfig} className="h-[300px] w-full">
                <LineChart data={bpChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(2)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="corrente"
                    stroke="var(--color-corrente)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="seca"
                    stroke="var(--color-seca)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="geral"
                    stroke="var(--color-geral)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-[#1f497d]/20">
            <CardHeader className="bg-slate-50 border-b border-border">
              <CardTitle className="text-[#1f497d]">Índice de Solvência</CardTitle>
              <CardDescription>Ativo Total / Passivo Exigível</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={liqChartConfig} className="h-[300px] w-full">
                <BarChart data={bpChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(2)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="solvencia"
                    fill="var(--color-solvencia)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Panel & Info Widgets */}
        <RiskAnalysisPanel />
        <BottomWidgets />
      </div>
    </div>
  )
}
