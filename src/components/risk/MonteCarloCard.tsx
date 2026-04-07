import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useFinancialStore } from '@/store/main'
import { runMonteCarloSimulation } from '@/lib/risk-utils'
import { Play, RefreshCw, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MonteCarloCard() {
  const { dre } = useFinancialStore()
  const [isSimulating, setIsSimulating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<number | null>(null)

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            const prob = runMonteCarloSimulation(dre, 5000)
            setResult(prob)
            setIsSimulating(false)
            return 100
          }
          return prev + Math.floor(Math.random() * 15) + 5
        })
      }, 150)
      return () => clearInterval(interval)
    }
  }, [isSimulating, dre])

  const handleRun = () => {
    setResult(null)
    setProgress(0)
    setIsSimulating(true)
  }

  return (
    <Card className="flex flex-col h-full animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Simulação Monte Carlo
        </CardTitle>
        <CardDescription>
          Calcula a probabilidade de ruptura (lucro negativo) baseado na volatilidade histórica.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center gap-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[120px]">
          {result === null && !isSimulating && (
            <div className="text-muted-foreground text-sm">
              Nenhuma simulação recente. Clique abaixo para rodar 5.000 iterações.
            </div>
          )}

          {isSimulating && (
            <div className="w-full space-y-2 max-w-xs">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground animate-pulse">
                Executando iterações... {progress}%
              </p>
            </div>
          )}

          {result !== null && !isSimulating && (
            <div className="flex flex-col items-center gap-1 animate-fade-in">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Probabilidade de Ruptura
              </span>
              <div
                className={cn(
                  'text-5xl font-bold tabular-nums tracking-tight',
                  result > 20
                    ? 'text-destructive'
                    : result > 5
                      ? 'text-yellow-500'
                      : 'text-emerald-500',
                )}
              >
                {result.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2 max-w-[250px] text-center">
                Probabilidade estatística de apresentar prejuízo no próximo exercício considerando
                cenários de cauda.
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleRun}
          disabled={isSimulating}
          className="w-full"
          variant={result !== null ? 'secondary' : 'default'}
        >
          {isSimulating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Processando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              {result !== null ? 'Rodar Novamente' : 'Executar Simulação'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
