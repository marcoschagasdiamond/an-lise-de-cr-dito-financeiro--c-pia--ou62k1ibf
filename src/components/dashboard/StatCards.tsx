import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, TrendingDown, TrendingUp, Activity, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/calculators'

interface FinancialMetrics {
  receita: number
  despesas: number
  ebitda: number
  ebit: number
}

interface StatCardsProps {
  original: FinancialMetrics
  simulated: FinancialMetrics
  isSimulating: boolean
}

export function StatCards({ original, simulated, isSimulating }: StatCardsProps) {
  const calcDelta = (sim: number, orig: number) => {
    if (orig === 0) return 0
    return ((sim - orig) / Math.abs(orig)) * 100
  }

  const cards = [
    {
      title: 'Receita Total',
      icon: DollarSign,
      origValue: original.receita,
      simValue: simulated.receita,
      positiveIsGood: true,
    },
    {
      title: 'Custos e Despesas',
      icon: Activity,
      origValue: original.despesas,
      simValue: simulated.despesas,
      positiveIsGood: false,
    },
    {
      title: 'EBITDA',
      icon: TrendingUp,
      origValue: original.ebitda,
      simValue: simulated.ebitda,
      positiveIsGood: true,
    },
    {
      title: 'EBIT',
      icon: Target,
      origValue: original.ebit,
      simValue: simulated.ebit,
      positiveIsGood: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((c, i) => {
        const delta = isSimulating ? calcDelta(c.simValue, c.origValue) : 0
        const isPositive = delta > 0
        const isGood = c.positiveIsGood ? isPositive : !isPositive

        return (
          <Card
            key={i}
            className={cn(
              'glass-card animate-slide-up relative overflow-hidden transition-all duration-300',
              isSimulating && delta !== 0 && 'ring-2 ring-primary/20',
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {isSimulating && delta !== 0 && (
              <div className="absolute top-0 right-0 p-1.5 px-3 bg-primary/10 rounded-bl-lg">
                <span className="text-xs font-semibold text-primary">Simulado</span>
              </div>
            )}
            <CardContent className="p-5 flex flex-col justify-between h-full pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-2">
                <c.icon className="w-4 h-4" />
                {c.title}
              </div>
              <div className="space-y-1">
                <div className="flex items-end justify-between">
                  <span
                    className={cn(
                      'text-2xl font-bold tracking-tight transition-colors',
                      isSimulating && delta !== 0 ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {formatCurrency(isSimulating ? c.simValue : c.origValue)}
                  </span>
                </div>

                {isSimulating && delta !== 0 ? (
                  <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
                    <span className="text-muted-foreground">
                      Original: {formatCurrency(c.origValue)}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-semibold flex items-center gap-1',
                        isGood ? 'text-emerald-600' : 'text-red-600',
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {Math.abs(delta).toFixed(1)}%
                    </span>
                  </div>
                ) : (
                  <div className="h-6 mt-2" /> // spacer to maintain card height
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
