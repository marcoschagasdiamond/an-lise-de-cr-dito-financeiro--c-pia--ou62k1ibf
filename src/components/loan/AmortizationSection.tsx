import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatPercent } from '@/lib/calculators'

interface AmortizationProps {
  pv: number
  pmt: number
  nper: number
  rate: number
  grace: number
  modality: string
  costs: {
    evaluation: number
    admin: number
    iof: number
    fi: number
    other: number
  }
}

function SummaryCard({
  title,
  value,
  highlight = false,
}: {
  title: string
  value: string
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted/30'}>
      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
        <div
          className={`text-xs font-semibold uppercase mb-1 ${highlight ? 'opacity-90' : 'text-muted-foreground'}`}
        >
          {title}
        </div>
        <div className="text-lg font-bold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  )
}

export function AmortizationSection({
  pv,
  pmt,
  nper,
  rate,
  grace,
  modality,
  costs,
}: AmortizationProps) {
  const tableData = useMemo(() => {
    const tCustos = costs.evaluation + costs.admin + costs.iof + costs.fi + costs.other
    const effPv = Math.abs(pv)
    const effPmt = Math.abs(pmt)
    const effNper = Math.max(1, Math.round(nper))

    const rows = []
    let currentBalance = effPv
    let finalRow0 = currentBalance - tCustos
    const startDate = new Date()

    rows.push({
      period: 0,
      date: startDate.toLocaleDateString('pt-BR'),
      label: 'Prestação 0',
      initialBalance: currentBalance,
      interest: 0,
      amortization: 0,
      payment: tCustos,
      finalBalance: finalRow0,
      isCost: true,
    })

    currentBalance = finalRow0
    let totalPmt = 0
    let totalInterest = 0

    for (let i = 1; i <= effNper; i++) {
      const isGrace = i <= grace
      const p = isGrace ? 0 : effPmt
      let interest = currentBalance * rate

      if (modality === 'ANTECIPADO' && !isGrace && i === grace + 1) {
        interest = 0
      }

      let amort = p - interest
      let nextBalance = currentBalance - amort

      const d = new Date(startDate)
      d.setMonth(d.getMonth() + i)

      rows.push({
        period: i,
        date: d.toLocaleDateString('pt-BR'),
        label: `Prestação ${i}`,
        initialBalance: currentBalance,
        interest: interest,
        amortization: amort,
        payment: p,
        finalBalance: nextBalance,
        isCost: false,
      })

      totalPmt += p
      totalInterest += interest
      currentBalance = nextBalance
    }

    return {
      rows,
      tCustos,
      totalPmt,
      totalInterest,
      totalGeral: totalPmt + tCustos,
      custoPercent: effPv > 0 ? (totalPmt + tCustos) / effPv : 0,
    }
  }, [pv, pmt, nper, rate, grace, modality, costs])

  if (pv <= 0 || nper <= 0) return null

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro Consolidado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <SummaryCard title="Total Prestações" value={formatCurrency(tableData.totalPmt)} />
            <SummaryCard title="Total Juros" value={formatCurrency(tableData.totalInterest)} />
            <SummaryCard title="Total Custos" value={formatCurrency(tableData.tCustos)} />
            <SummaryCard
              title="Total Geral Pago"
              value={formatCurrency(tableData.totalGeral)}
              highlight
            />
            <SummaryCard
              title="Custo Efetivo"
              value={formatPercent(tableData.custoPercent)}
              highlight
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabela de Amortização</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Saldo Inicial</TableHead>
                <TableHead className="text-right">Juros</TableHead>
                <TableHead className="text-right">Amortização</TableHead>
                <TableHead className="text-right">Prestação</TableHead>
                <TableHead className="text-right">Saldo Final</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.rows.map((row) => (
                <TableRow
                  key={row.period}
                  className={row.isCost ? 'bg-muted/50 font-medium hover:bg-muted/70' : ''}
                >
                  <TableCell>{row.label}</TableCell>
                  <TableCell className="text-muted-foreground">{row.date}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.initialBalance)}</TableCell>
                  <TableCell className="text-right text-destructive/80">
                    {formatCurrency(row.interest)}
                  </TableCell>
                  <TableCell className="text-right text-primary/80">
                    {formatCurrency(row.amortization)}
                  </TableCell>
                  <TableCell className="text-right font-bold flex items-center justify-end gap-2">
                    {row.isCost && (
                      <span className="text-[10px] uppercase bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                        Custos
                      </span>
                    )}
                    <span className={row.isCost ? 'text-foreground' : 'text-destructive'}>
                      {formatCurrency(row.payment)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(row.finalBalance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
