import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFinancialStore } from '@/store/main'
import {
  calculateEBITDA,
  calculateLiquidity,
  calculateRating,
  formatCurrency,
  formatPercent,
} from '@/lib/calculators'
import { Activity, ShieldCheck, TrendingDown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DebtAnalysisPage() {
  const { balanceSheets, dre, debts } = useFinancialStore()

  const currentBP = balanceSheets.find((b) => b.year === 2023)!
  const currentDRE = dre.find((d) => d.year === 2023)!

  const totalDebt = debts.reduce((acc, d) => acc + d.amount, 0)
  const ebitda = calculateEBITDA(currentDRE)
  const liquidity = calculateLiquidity(currentBP)
  const rating = calculateRating(currentBP, currentDRE, totalDebt)

  const ratingColors: Record<string, string> = {
    'A+': 'bg-emerald-500 text-white',
    A: 'bg-green-400 text-white',
    B: 'bg-blue-500 text-white',
    C: 'bg-amber-500 text-white',
    D: 'bg-red-500 text-white',
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Mapa de Dívidas & Análise" />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-20 space-y-6">
        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card bg-primary text-primary-foreground border-none">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
              <ShieldCheck className="w-8 h-8 mb-2 opacity-80" />
              <h3 className="text-sm font-medium opacity-90">Rating de Crédito</h3>
              <div className="text-4xl font-extrabold mt-1 tracking-tight">{rating}</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-500" /> EBITDA (2023)
              </div>
              <div className="text-2xl font-bold">{formatCurrency(ebitda)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Margem: {formatPercent(ebitda / currentDRE.receita)}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-red-500" /> Endividamento Total
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalDebt)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Alavancagem: {(totalDebt / currentBP.patrimonioLiquido).toFixed(2)}x
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Índice de Liquidez (Corrente)
              </div>
              <div
                className={cn(
                  'text-2xl font-bold',
                  liquidity.corrente >= 1.5 ? 'text-emerald-600' : 'text-amber-600',
                )}
              >
                {liquidity.corrente.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Seca: {liquidity.seca.toFixed(2)} | Geral: {liquidity.geral.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debt Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Consolidação de Dívidas</CardTitle>
            <CardDescription>
              Mapeamento detalhado das obrigações financeiras da empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo / Instituição</TableHead>
                  <TableHead className="text-right">Curto Prazo</TableHead>
                  <TableHead className="text-right">Longo Prazo</TableHead>
                  <TableHead className="text-right">Taxa (a.a)</TableHead>
                  <TableHead className="text-right font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{debt.institution}</span>
                        <span className="text-xs text-muted-foreground">{debt.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(debt.shortTerm)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(debt.longTerm)}</TableCell>
                    <TableCell className="text-right">{formatPercent(debt.interestRate)}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {formatCurrency(debt.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
