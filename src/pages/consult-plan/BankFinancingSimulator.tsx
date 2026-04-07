import { useState, useMemo } from 'react'
import { HelpCircle, Download, Calculator, ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { formatCurrency, ExcelPMT } from '@/lib/calculators'
import { exportAmortizationToCSV } from '@/lib/export-utils'
import { addMonths, format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

function Metric({ title, value, hl = false }: { title: string; value: string; hl?: boolean }) {
  return (
    <Card className={hl ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card shadow-sm'}>
      <CardContent className="p-5">
        <p
          className={`text-sm font-medium mb-1 ${hl ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
        >
          {title}
        </p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}

function Field({ label, tip, value, onChange, type = 'number' }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 text-sm">
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[200px] text-xs">{tip}</p>
          </TooltipContent>
        </Tooltip>
      </Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
    </div>
  )
}

export function BankFinancingSimulator({ onBack }: { onBack?: () => void }) {
  const [pv, setPv] = useState('100000')
  const [rate, setRate] = useState('12')
  const [nper, setNper] = useState('36')
  const [mod, setMod] = useState('POSTECIPADO')
  const [grace, setGrace] = useState('0')
  const { toast } = useToast()

  const { rows, sum } = useMemo(() => {
    const p = Number(pv) || 0,
      r = Number(rate) || 0,
      n = Number(nper) || 0,
      g = mod === 'DIFERIDO' ? Number(grace) || 0 : 0
    const mRate = Math.pow(1 + r / 100, 1 / 12) - 1
    const data: any[] = []
    let bal = p,
      tInt = 0,
      tPay = 0,
      pmt = 0,
      start = new Date(),
      fDate = start

    if (n > 0 && p > 0) {
      if (mod === 'ANTECIPADO') {
        pmt = Math.abs(ExcelPMT(mRate, n, p, 0, 1))
        data.push({
          period: 0,
          date: start,
          initialBalance: bal,
          interest: 0,
          amortization: pmt,
          pmt,
          finalBalance: bal - pmt,
        })
        bal -= pmt
        tPay += pmt
        for (let i = 1; i < n; i++) {
          const int = bal * mRate
          let am = pmt - int
          if (i === n - 1) {
            am = bal
            pmt = int + am
          }
          data.push({
            period: i,
            date: addMonths(start, i),
            initialBalance: bal,
            interest: int,
            amortization: am,
            pmt,
            finalBalance: bal - am,
          })
          bal -= am
          tInt += int
          tPay += pmt
        }
      } else {
        for (let i = 1; i <= g; i++) {
          const int = bal * mRate
          data.push({
            period: i,
            date: addMonths(start, i),
            initialBalance: bal,
            interest: int,
            amortization: 0,
            pmt: 0,
            finalBalance: bal + int,
          })
          bal += int
          tInt += int
        }
        pmt = Math.abs(ExcelPMT(mRate, n, bal, 0, 0))
        fDate = addMonths(start, g + 1)
        for (let i = 1; i <= n; i++) {
          const int = bal * mRate
          let am = pmt - int
          if (i === n) {
            am = bal
            pmt = int + am
          }
          data.push({
            period: g + i,
            date: addMonths(start, g + i),
            initialBalance: bal,
            interest: int,
            amortization: am,
            pmt,
            finalBalance: Math.max(0, bal - am),
          })
          bal -= am
          tInt += int
          tPay += pmt
        }
      }
    }
    return { rows: data, sum: { pmt, tInt, tPay, n, fDate } }
  }, [pv, rate, nper, mod, grace])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">
          Financiamento Bancário (Saldo Devedor/Juros)
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 shadow-md">
          <CardHeader>
            <CardTitle>Parâmetros da Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Valor do Empréstimo (PV)"
              tip="Valor presente do empréstimo"
              value={pv}
              onChange={setPv}
            />
            <Field
              label="Taxa de Juros Anual (%)"
              tip="Taxa de juros ao ano"
              value={rate}
              onChange={setRate}
            />
            <Field
              label="Prazo (em meses)"
              tip="Total de parcelas a serem pagas"
              value={nper}
              onChange={setNper}
            />
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-sm">
                Modalidade de Pagamento
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px] text-xs">
                      Antecipado (1ª no ato), Postecipado ou Diferido (com carência)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select value={mod} onValueChange={setMod}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANTECIPADO">Antecipado</SelectItem>
                  <SelectItem value="POSTECIPADO">Postecipado</SelectItem>
                  <SelectItem value="DIFERIDO">Diferido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mod === 'DIFERIDO' && (
              <Field
                label="Período de Carência (meses)"
                tip="Meses iniciais sem pagamento (juros capitalizados)"
                value={grace}
                onChange={setGrace}
              />
            )}
            <Button
              className="w-full mt-4"
              onClick={() =>
                toast({
                  title: 'Cálculo Atualizado',
                  description: 'Simulação atualizada com sucesso!',
                })
              }
            >
              <Calculator className="w-4 h-4 mr-2" /> Calcular
            </Button>
          </CardContent>
        </Card>
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Metric title="Valor da Prestação (PMT)" value={formatCurrency(sum.pmt)} hl />
            <Metric title="Total de Juros a Pagar" value={formatCurrency(sum.tInt)} />
            <Metric title="Total a Pagar (Principal + Juros)" value={formatCurrency(sum.tPay)} hl />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Metric title="Número Total de Prestações" value={sum.n.toString()} />
            <Metric title="Data da Primeira Prestação" value={format(sum.fDate, 'dd/MM/yyyy')} />
          </div>
          <Card className="mt-2 flex-1 flex flex-col overflow-hidden shadow-md">
            <CardHeader className="flex flex-row justify-between items-center py-4 bg-muted/30">
              <CardTitle className="text-lg">Tabela de Amortização</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportAmortizationToCSV(
                    {
                      'Valor (PV)': formatCurrency(Number(pv)),
                      'Taxa Anual (%)': rate,
                      'Prazo (meses)': nper,
                      Modalidade: mod,
                      ...(mod === 'DIFERIDO' && { 'Carência (meses)': grace }),
                    },
                    rows,
                    'Simulacao_Financiamento.csv',
                  )
                }
              >
                <Download className="w-4 h-4 mr-2" /> Exportar Tabela
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="max-h-[500px] h-[50vh] w-full">
                <div className="min-w-[800px] p-4 pt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número da Prestação</TableHead>
                        <TableHead>Data do Pagamento</TableHead>
                        <TableHead className="text-right">Saldo Devedor Inicial</TableHead>
                        <TableHead className="text-right">Juros da Prestação</TableHead>
                        <TableHead className="text-right">Amortização (Principal)</TableHead>
                        <TableHead className="text-right">Valor da Prestação</TableHead>
                        <TableHead className="text-right">Saldo Devedor Final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-center">{r.period}</TableCell>
                          <TableCell>{format(r.date, 'dd/MM/yyyy')}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(r.initialBalance)}
                          </TableCell>
                          <TableCell className="text-right text-red-500/80">
                            {formatCurrency(r.interest)}
                          </TableCell>
                          <TableCell className="text-right text-green-600/80">
                            {formatCurrency(r.amortization)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(r.pmt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(r.finalBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
export default BankFinancingSimulator
