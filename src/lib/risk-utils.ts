export function getNormalRandom(mean: number, stdDev: number): number {
  let u1 = 0,
    u2 = 0
  while (u1 === 0) u1 = Math.random()
  while (u2 === 0) u2 = Math.random()
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
  return z0 * stdDev + mean
}

export function calculateHistoricalNetIncome(dres: any[]) {
  return dres
    .filter((d) => d.receita > 0)
    .map(
      (d) =>
        (d.receita || 0) -
        (d.cpv || 0) -
        (d.despesasOperacionais || 0) -
        (d.depreciacao || 0) -
        (d.juros || 0),
    )
}

export function runMonteCarloSimulation(dres: any[], iterations = 1000): number {
  const incomes = calculateHistoricalNetIncome(dres)
  if (incomes.length < 2) return 0

  const mean = incomes.reduce((sum, val) => sum + val, 0) / incomes.length
  const variance =
    incomes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (incomes.length - 1)

  // Apply a 2.5x multiplier to stdDev to simulate "tail risk" stress scenarios
  const stdDev = Math.sqrt(variance) * 2.5

  let breakEvenHits = 0
  for (let i = 0; i < iterations; i++) {
    const simulatedIncome = getNormalRandom(mean, stdDev)
    // "Break-even / Ruptura" is considered as having operational losses (Net Income < 0)
    if (simulatedIncome <= 0) {
      breakEvenHits++
    }
  }

  return (breakEvenHits / iterations) * 100
}
