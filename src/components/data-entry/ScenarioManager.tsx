import { useState } from 'react'
import { useFinancialStore } from '@/store/main'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatCurrency } from '@/lib/calculators'
import { Activity, FileDown, FileText } from 'lucide-react'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { ComparativePrintView } from './ComparativePrintView'
import { ReportPreviewDialog } from './SavedAnalyses'
import { cn } from '@/lib/utils'

const chartConfig = {
  patrimonioLiquido: { label: 'Patrimônio Líquido', color: 'hsl(var(--primary))' },
}

export function ScenarioManager() {
  const {
    scenarios,
    saveScenario,
    loadScenario,
    activeScenarioId,
    balanceSheets,
    dre,
    setPrintMode,
    printMode,
  } = useFinancialStore()
  const [newScenarioName, setNewScenarioName] = useState('Cenário Otimista')
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)

  const comparisonData = scenarios.map((sc) => {
    const bp2023 = sc.balanceSheets.find((b) => b.year === 2023)
    return {
      name: sc.name,
      patrimonioLiquido: bp2023 ? bp2023.patrimonioLiquido : 0,
    }
  })

  const currentBp2023 = balanceSheets.find((b) => b.year === 2023)
  const currentPL = currentBp2023 ? currentBp2023.patrimonioLiquido : 0
  const finalData =
    comparisonData.length > 0 ? comparisonData : [{ name: 'Atual', patrimonioLiquido: currentPL }]

  const currentDRE = dre.find((d) => d.year === 2023)
  const currentRev = currentDRE?.receita || 0
  const currentCosts = (currentDRE?.cpv || 0) + (currentDRE?.despesasOperacionais || 0)

  const revDropPct = currentRev > 0 ? (currentPL / currentRev) * 100 : 0
  const costIncPct = currentCosts > 0 ? (currentPL / currentCosts) * 100 : 0

  const handlePrintComparison = () => {
    if (selectedForComparison.length < 2) return
    setPrintMode('comparison')
    setTimeout(() => {
      window.print()
      setPrintMode('default')
    }, 150)
  }

  const toggleScenarioSelection = (id: string) => {
    setSelectedForComparison((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up mt-8',
        printMode === 'comparison' && 'print:m-0 print:space-y-0',
      )}
    >
      <div className={cn('flex flex-col gap-2 mb-6', printMode === 'comparison' && 'print:hidden')}>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Gestão de Múltiplos Cenários
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Crie, salve e compare diferentes projeções financeiras e seu impacto no Patrimônio
          Líquido.
        </p>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 gap-6',
          printMode === 'comparison' && 'print:hidden',
        )}
      >
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 rounded-t-lg">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              Salvar Cenário Atual
            </CardTitle>
            <CardDescription>Salve os dados atuais como um novo cenário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-4">
              <select
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)}
                className="flex h-10 w-[200px] rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled hidden>
                  Selecione uma opção
                </option>
                <option value="Cenário Otimista">Cenário Otimista</option>
                <option value="Cenário Realista">Cenário Realista</option>
                <option value="Cenário Pessimista">Cenário Pessimista</option>
              </select>
              <Button
                onClick={() => saveScenario(newScenarioName)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Salvar Cenário
              </Button>
            </div>
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
              <p className="text-sm font-medium mb-3 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Carregar Cenário Salvo:
              </p>
              <div className="flex flex-wrap gap-2">
                {scenarios.map((sc) => (
                  <Button
                    key={sc.id}
                    variant={sc.id === activeScenarioId ? 'default' : 'outline'}
                    onClick={() => loadScenario(sc.id)}
                    className={
                      sc.id === activeScenarioId
                        ? 'bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }
                  >
                    {sc.name}
                  </Button>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
              <Button
                onClick={() => setPreviewOpen(true)}
                variant="outline"
                className="w-full text-[#1e3a8a] border-[#1e3a8a] hover:bg-[#1e3a8a]/10"
              >
                <FileText className="w-4 h-4 mr-2" /> Visualizar Relatório
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Activity className="w-5 h-5 text-orange-500" /> Ponto de Ruptura (Sensibilidade)
            </CardTitle>
            <CardDescription>
              Variação necessária para atingir Passivo a Descoberto (PL ≤ 0) no ano base (2023).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {currentPL <= 0 ? (
              <Alert
                variant="destructive"
                className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50"
              >
                <AlertTitle>Passivo a Descoberto</AlertTitle>A empresa já apresenta patrimônio
                líquido nulo ou negativo.
              </Alert>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/30 flex flex-col justify-between shadow-sm">
                  <div className="text-sm text-red-700 dark:text-red-400 font-bold mb-1 uppercase tracking-wide">
                    Queda de Receita
                  </div>
                  <div className="text-3xl font-extrabold text-red-600 dark:text-red-500 my-2">
                    -{revDropPct.toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-red-500 mt-1 leading-tight font-medium">
                    Para zerar o PL atual de {formatCurrency(currentPL)}
                  </div>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/30 flex flex-col justify-between shadow-sm">
                  <div className="text-sm text-orange-700 dark:text-orange-400 font-bold mb-1 uppercase tracking-wide">
                    Aumento de Custos
                  </div>
                  <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-500 my-2">
                    +{costIncPct.toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-orange-500 mt-1 leading-tight font-medium">
                    Para zerar o PL atual de {formatCurrency(currentPL)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 gap-6',
          printMode === 'comparison' && 'print:hidden',
        )}
      >
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 rounded-t-lg">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              Comparativo de Cenários
            </CardTitle>
            <CardDescription>
              Selecione 2 ou mais cenários para gerar um relatório comparativo PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                >
                  <Checkbox
                    id={`compare-${sc.id}`}
                    checked={selectedForComparison.includes(sc.id)}
                    onCheckedChange={() => toggleScenarioSelection(sc.id)}
                    className="border-slate-400"
                  />
                  <label
                    htmlFor={`compare-${sc.id}`}
                    className="text-sm font-medium leading-none cursor-pointer flex-1 text-slate-700 dark:text-slate-300"
                  >
                    {sc.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <Button
                className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
                disabled={selectedForComparison.length < 2}
                onClick={handlePrintComparison}
              >
                <FileDown className="w-4 h-4 mr-2" /> Exportar Comparativo (PDF)
              </Button>
              {selectedForComparison.length < 2 && (
                <p className="text-xs text-slate-500 text-center mt-3 font-medium">
                  Selecione pelo menos 2 cenários para comparar.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 rounded-t-lg">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              Comparativo de Patrimônio Líquido (2023)
            </CardTitle>
            <CardDescription>Variação do PL entre os cenários salvos.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={finalData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--slate-200))"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--slate-500))' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(0)}M`}
                  tick={{ fill: 'hsl(var(--slate-500))' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent formatter={(value: number) => formatCurrency(value)} />
                  }
                  cursor={{ fill: 'hsl(var(--slate-100))' }}
                />
                <Bar
                  dataKey="patrimonioLiquido"
                  fill="#1e3a8a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {printMode === 'comparison' && (
        <div className="hidden print:block w-full">
          <ComparativePrintView scenarioIds={selectedForComparison} />
        </div>
      )}

      <ReportPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  )
}
