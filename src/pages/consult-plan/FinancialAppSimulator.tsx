import { useState } from 'react'
import { ArrowLeft, HelpCircle, ArrowDown, ArrowUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { NumInput } from '@/components/ui/num-input'
import { formatCurrency, ExcelFV, ExcelNPER, ExcelRATE, ExcelPV, ExcelPMT } from '@/lib/calculators'

export type SimType = 'FV' | 'NPER' | 'RATE' | 'PV' | 'PMT'

const fieldInfo: Record<
  string,
  { label: string; tooltip: string; isPercent?: boolean; isCurrency?: boolean }
> = {
  rate: {
    label: 'TAXA ESTIMADA DE JUROS (a.n.)',
    tooltip: 'Taxa percentual de juros por período',
    isPercent: true,
  },
  nper: {
    label: 'TEMPO DE APLICAÇÃO (n)',
    tooltip: 'Número total de períodos de aplicação do valor atual e/ou de depósitos periódicos',
  },
  pv: {
    label: 'DEPÓSITO INICIAL (PV)',
    tooltip: 'Valor a ser depositado no início do período',
    isCurrency: true,
  },
  pmt: {
    label: 'DEPÓSITOS PERIÓDICOS (PGTO)',
    tooltip:
      'Valor a ser depositado no final de cada período, que não pode mudar durante o tempo de aplicação',
    isCurrency: true,
  },
  fv: {
    label: 'VALOR FUTURO (FV)',
    tooltip: 'Valor a ser acumulado ao final do período',
    isCurrency: true,
  },
}

function TimelineVisual() {
  return (
    <div className="py-8 w-full">
      <h3 className="text-sm font-semibold text-center mb-8 text-muted-foreground">
        Visualização do Fluxo de Caixa
      </h3>
      <div className="relative w-full max-w-lg mx-auto">
        <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-primary/20 -translate-y-1/2" />

        <div className="flex justify-between items-center relative z-10 px-4">
          <div className="flex flex-col items-center">
            <div className="h-16 flex flex-col items-center justify-end mb-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">PV</div>
              <div className="bg-background rounded-full text-red-500">
                <ArrowDown className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm font-bold">0</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-16 flex flex-col items-center justify-end mb-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">PGTO</div>
              <div className="bg-background rounded-full text-orange-500">
                <ArrowDown className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm font-bold">1 ... n-1</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-16 flex flex-col items-center justify-end mb-2">
              <div className="bg-background rounded-full text-green-500 mb-1">
                <ArrowUp className="w-6 h-6" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">FV</div>
            </div>
            <div className="text-sm font-bold">n</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FinancialAppSimulator({ type, onBack }: { type: SimType; onBack: () => void }) {
  const [rate, setRate] = useState<number | string>('')
  const [nper, setNper] = useState<number | string>('')
  const [pv, setPv] = useState<number | string>('')
  const [pmt, setPmt] = useState<number | string>('')
  const [fv, setFv] = useState<number | string>('')

  const r = Number(rate) / 100 || 0
  const n = Number(nper) || 0
  const p = Number(pv) || 0
  const m = Number(pmt) || 0
  const f = Number(fv) || 0

  let result = 0
  let targetField = ''

  if (type === 'FV') {
    result = ExcelFV(r, n, m, p) * -1
    targetField = 'fv'
  } else if (type === 'NPER') {
    result = r ? ExcelNPER(r, m, p, -f) : 0
    targetField = 'nper'
  } else if (type === 'RATE') {
    result = n ? ExcelRATE(n, m, p, -f) * 100 : 0
    targetField = 'rate'
  } else if (type === 'PV') {
    result = ExcelPV(r, n, m, -f)
    targetField = 'pv'
  } else if (type === 'PMT') {
    result = f ? ExcelPMT(r, n, p, -f) : 0
    targetField = 'pmt'
  }

  if (isNaN(result) || !isFinite(result)) result = 0

  const activeFields = {
    FV: ['rate', 'nper', 'pv', 'pmt'],
    NPER: ['pv', 'pmt', 'fv', 'rate'],
    RATE: ['pv', 'pmt', 'fv', 'nper'],
    PV: ['rate', 'nper', 'fv', 'pmt'],
    PMT: ['rate', 'nper', 'fv', 'pv'],
  }[type]

  const setters: Record<string, any> = {
    rate: setRate,
    nper: setNper,
    pv: setPv,
    pmt: setPmt,
    fv: setFv,
  }
  const values: Record<string, any> = { rate, nper, pv, pmt, fv }

  const renderResult = (val: number, field: string) => {
    if (fieldInfo[field].isCurrency) return formatCurrency(val)
    if (fieldInfo[field].isPercent)
      return (
        new Intl.NumberFormat('pt-BR', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(val) + ' %'
      )
    return new Intl.NumberFormat('pt-BR', { style: 'decimal', maximumFractionDigits: 2 }).format(
      val,
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-foreground">APLICAÇÕES FINANCEIRAS - SIMULAÇÃO</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>DADOS DE ENTRADA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeFields.map((field) => {
              const info = fieldInfo[field]
              return (
                <div key={field} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {info.label}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[250px] text-sm font-normal">{info.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  {info.isCurrency || info.isPercent ? (
                    <NumInput
                      value={values[field]}
                      onChange={setters[field]}
                      prefix={info.isCurrency ? 'R$' : undefined}
                      isPercentage={info.isPercent}
                      placeholder="0,00"
                    />
                  ) : (
                    <Input
                      type="number"
                      value={values[field]}
                      onChange={(e) => setters[field](e.target.value)}
                      placeholder="0"
                      className="text-right"
                    />
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>RESULTADO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {fieldInfo[targetField].label}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[250px] text-sm font-normal">
                        {fieldInfo[targetField].tooltip}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-400 rounded-md font-bold text-xl flex items-center justify-end h-14 border border-yellow-200 dark:border-yellow-900/50">
                  {renderResult(result, targetField)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <TimelineVisual />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
