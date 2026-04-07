import { useState } from 'react'
import { MonteCarloCard } from './MonteCarloCard'
import { StressTestArea } from './StressTestArea'
import { RiskHeatmap } from './RiskHeatmap'

export function RiskAnalysisPanel() {
  const [params, setParams] = useState({ rev: 0, cost: 0, rate: 0 })

  return (
    <div className="space-y-6 pt-6 mt-8 border-t">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Análise de Risco e Simulações</h2>
        <p className="text-muted-foreground">
          Realize testes de estresse e calcule probabilidades de insolvência.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MonteCarloCard />
        </div>
        <div className="lg:col-span-2">
          <StressTestArea params={params} setParams={setParams} />
        </div>
      </div>

      <RiskHeatmap params={params} />
    </div>
  )
}
