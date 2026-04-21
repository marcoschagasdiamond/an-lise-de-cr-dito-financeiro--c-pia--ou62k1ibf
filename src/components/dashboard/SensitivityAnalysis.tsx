import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

interface SensitivityAnalysisProps {
  revenueVar: number
  setRevenueVar: (val: number) => void
  expenseVar: number
  setExpenseVar: (val: number) => void
  onReset: () => void
}

export function SensitivityAnalysis({
  revenueVar,
  setRevenueVar,
  expenseVar,
  setExpenseVar,
  onReset,
}: SensitivityAnalysisProps) {
  const isSimulating = revenueVar !== 0 || expenseVar !== 0

  return (
    <Card className="shadow-sm border-[#1f497d]/20 bg-gradient-to-br from-white to-slate-50 dark:from-background dark:to-slate-900/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#1f497d]">Simulacao de Cenarios</CardTitle>
            <CardDescription>Analise de Sensibilidade - Impacto no EBITDA/EBIT</CardDescription>
          </div>
          {isSimulating && (
            <Button variant="outline" size="sm" onClick={onReset} className="h-8 gap-2">
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Variacao de Receita</Label>
            <span
              className={`font-bold text-sm ${
                revenueVar > 0
                  ? 'text-emerald-600'
                  : revenueVar < 0
                    ? 'text-red-600'
                    : 'text-muted-foreground'
              }`}
            >
              {revenueVar > 0 ? '+' : ''}
              {revenueVar}%
            </span>
          </div>
          <Slider
            min={-50}
            max={50}
            step={1}
            value={[revenueVar]}
            onValueChange={(val) => setRevenueVar(val[0])}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Variacao de Despesas</Label>
            <span
              className={`font-bold text-sm ${
                expenseVar > 0
                  ? 'text-red-600'
                  : expenseVar < 0
                    ? 'text-emerald-600'
                    : 'text-muted-foreground'
              }`}
            >
              {expenseVar > 0 ? '+' : ''}
              {expenseVar}%
            </span>
          </div>
          <Slider
            min={-50}
            max={50}
            step={1}
            value={[expenseVar]}
            onValueChange={(val) => setExpenseVar(val[0])}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  )
}
