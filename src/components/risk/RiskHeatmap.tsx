import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useFinancialStore } from '@/store/main'
import { formatCurrency } from '@/lib/calculators'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

interface Props {
  params: { rev: number; cost: number; rate: number }
}

export function RiskHeatmap({ params }: Props) {
  const { balanceSheets, dre } = useFinancialStore()

  const bp = balanceSheets.find((b) => b.year === 2023)
  const d = dre.find((x) => x.year === 2023)

  const basePL = bp?.patrimonioLiquido || 0
  const baseAC = bp?.ativoCirculante || 0
  const basePC = bp?.passivoCirculante || 0
  const baseCash = bp?.disponibilidades || 0
  const baseTotalPassivo = basePC + (bp?.passivoNaoCirculante || 0)

  const baseNI =
    (d?.receita || 0) -
    (d?.cpv || 0) -
    (d?.despesasOperacionais || 0) -
    (d?.depreciacao || 0) -
    (d?.juros || 0)

  // Apply stress
  const stRev = (d?.receita || 0) * (1 + params.rev / 100)
  const stCost = ((d?.cpv || 0) + (d?.despesasOperacionais || 0)) * (1 + params.cost / 100)
  const stInterest = (d?.juros || 0) * (1 + params.rate / 100)
  const stNI = stRev - stCost - (d?.depreciacao || 0) - stInterest

  const niDelta = stNI - baseNI

  // Propagate impact to Balance Sheet
  const stPL = basePL + niDelta
  let stCash = baseCash + niDelta
  let stPC = basePC

  if (stCash < 0) {
    stPC += Math.abs(stCash)
    stCash = 0
  }

  const stAC = baseAC - baseCash + stCash
  const liqCorrente = stPC > 0 ? stAC / stPC : 0
  const endividamento = stPL > 0 ? (stPC + (bp?.passivoNaoCirculante || 0)) / stPL : 999

  const indicators = [
    {
      name: 'Liquidez Corrente',
      value: liqCorrente.toFixed(2),
      status: liqCorrente < 1.0 ? 'danger' : liqCorrente < 1.5 ? 'warning' : 'safe',
      desc: 'Capacidade de pagar dívidas de curto prazo.',
    },
    {
      name: 'Caixa Projetado',
      value: formatCurrency(stCash),
      status: stCash <= 0 ? 'danger' : stCash < baseCash * 0.5 ? 'warning' : 'safe',
      desc: 'Disponibilidades após choque operacional.',
    },
    {
      name: 'Endividamento Total',
      value: endividamento > 99 ? 'Critico' : endividamento.toFixed(2) + 'x',
      status: endividamento > 2 || stPL < 0 ? 'danger' : endividamento > 1 ? 'warning' : 'safe',
      desc: 'Proporção entre capital de terceiros e próprio.',
    },
    {
      name: 'Situação Patrimonial',
      value: stPL < 0 ? 'Passivo a Descoberto' : formatCurrency(stPL),
      status: stPL < 0 ? 'danger' : stPL < basePL * 0.5 ? 'warning' : 'safe',
      desc: 'Saúde do Patrimônio Líquido.',
    },
  ]

  const statusStyles = {
    danger: 'bg-destructive/10 border-destructive/30 text-destructive',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-500',
    safe: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-500',
  }

  const statusIcons = {
    danger: <AlertCircle className="w-5 h-5" />,
    warning: <Info className="w-5 h-5" />,
    safe: <CheckCircle2 className="w-5 h-5" />,
  }

  return (
    <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <CardHeader>
        <CardTitle>Mapa de Calor de Risco</CardTitle>
        <CardDescription>
          Impacto do estresse nas contas patrimoniais (proximidade da ruptura).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indicators.map((ind, idx) => (
            <div
              key={idx}
              className={cn(
                'p-4 rounded-lg border-2 transition-all duration-300 flex items-start gap-4',
                statusStyles[ind.status as keyof typeof statusStyles],
              )}
            >
              <div className="mt-0.5">{statusIcons[ind.status as keyof typeof statusIcons]}</div>
              <div className="flex-1">
                <h4 className="font-semibold tracking-tight">{ind.name}</h4>
                <div className="text-2xl font-bold mt-1 tabular-nums">{ind.value}</div>
                <p className="text-xs opacity-80 mt-1">{ind.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
