import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calculator, HelpCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/calculators'
import { FinancialAppSimulator, type SimType } from './FinancialAppSimulator'
import { FinancialLoanSimulator, type LoanSimType } from './FinancialLoanSimulator'
import { BankFinancingSimulator } from './BankFinancingSimulator'

const simulators = [
  'Fluxo Financeiro Projetado',
  'Aplicação Financeira (Valor Futuro)',
  'Aplicação Financeira (Tempo/Período)',
  'Aplicação Financeira (Taxa de Juros)',
  'Aplicação Financeira (Depósito Inicial)',
  'Aplicação Financeira (Depósitos e Períodos)',
  'Empréstimos Série de Pagamentos (Valor da Prestação)',
  'Empréstimos Série de Pagamentos (Valor do Empréstimo)',
  'Empréstimos Série de Pagamentos (Total de Períodos)',
  'Empréstimos Série de Pagamentos (Taxa de Juros)',
  'Financiamento Bancário (Saldo Devedor/Juros)',
  'Financiamento Bancário (Valor das Prestações)',
  'Refinanciamento do Endividamento Atual (Endividamento Atual)',
  'Refinanciamento do Endividamento Atual (Novo Endividamento)',
]

function FluxoFinanceiroProjetado({ onBack }: { onBack: () => void }) {
  const [rows, setRows] = useState(Array(10).fill({ description: '', period: '', value: '' }))
  const [interestRate, setInterestRate] = useState('')
  const [targetPeriod, setTargetPeriod] = useState('')

  const handleRowChange = (index: number, field: string, val: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: val }
    setRows(newRows)
  }

  const calculateMontanteFinal = () => {
    if (!targetPeriod || isNaN(Number(targetPeriod))) return 0
    const target = Number(targetPeriod)
    const rate = Number(interestRate) / 100 || 0

    return rows.reduce((acc, row) => {
      if (row.period === '' || row.value === '') return acc
      const p = Number(row.period)
      const v = Number(row.value)
      if (isNaN(p) || isNaN(v)) return acc

      if (p <= target) {
        return acc + v * Math.pow(1 + rate, target - p)
      }
      return acc
    }, 0)
  }

  const montanteFinal = calculateMontanteFinal()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Fluxo Financeiro Projetado</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ENTRADAS (+) / SAÍDAS (-)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Nº</TableHead>
                    <TableHead>DESCRIÇÃO DO LANÇAMENTO</TableHead>
                    <TableHead className="w-[120px]">
                      <div className="flex items-center gap-2">
                        PERÍODO
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
                            <p className="max-w-[250px] text-sm font-normal">
                              Número do período em que se dará a ENTRADA/SAÍDA. Se for no período
                              inicial, deverá ser igual a 0
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="w-[150px]">
                      <div className="flex items-center gap-2">
                        VALOR
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
                            <p className="max-w-[250px] text-sm font-normal">
                              Deverá ser positivo, se for entrada, recebimento ou depósito; ou
                              negativo, se for saídas, pagamento ou retirada
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={row.description}
                          onChange={(e) => handleRowChange(i, 'description', e.target.value)}
                          placeholder="Descrição"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={row.period}
                          onChange={(e) => handleRowChange(i, 'period', e.target.value)}
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={row.value}
                          onChange={(e) => handleRowChange(i, 'value', e.target.value)}
                          placeholder="0.00"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>REMUNERAÇÃO DO CAPITAL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  TX. JUROS (% a.n.)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[250px] text-sm font-normal">
                        Informe a taxa de juros em que o saldo do fluxo financeiro será reajustado
                        no final de cada período
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="Ex: 5.5"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  PERÍODO
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-foreground">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[250px] text-sm font-normal">
                        Informe o número do período em que se deseja saber o montante final do fluxo
                        financeiro projetado
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  type="number"
                  value={targetPeriod}
                  onChange={(e) => setTargetPeriod(e.target.value)}
                  placeholder="Ex: 12"
                />
              </div>
              <div className="space-y-2 pt-4">
                <Label>MONTANTE FINAL</Label>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-400 rounded-md font-bold text-xl flex items-center h-14 border border-yellow-200 dark:border-yellow-900/50">
                  {targetPeriod ? formatCurrency(montanteFinal) : '-'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const appSimulatorsMapping: Record<string, SimType> = {
  'Aplicação Financeira (Valor Futuro)': 'FV',
  'Aplicação Financeira (Tempo/Período)': 'NPER',
  'Aplicação Financeira (Taxa de Juros)': 'RATE',
  'Aplicação Financeira (Depósito Inicial)': 'PV',
  'Aplicação Financeira (Depósitos e Períodos)': 'PMT',
}

const loanSimulatorsMapping: Record<string, LoanSimType> = {
  'Empréstimos Série de Pagamentos (Valor da Prestação)': 'PMT',
  'Empréstimos Série de Pagamentos (Valor do Empréstimo)': 'PV',
  'Empréstimos Série de Pagamentos (Total de Períodos)': 'NPER',
  'Empréstimos Série de Pagamentos (Taxa de Juros)': 'RATE',
}

export default function SimuladoresFinanceiros() {
  const [activeSimulator, setActiveSimulator] = useState<string | null>(null)

  if (activeSimulator) {
    if (activeSimulator === 'Fluxo Financeiro Projetado') {
      return <FluxoFinanceiroProjetado onBack={() => setActiveSimulator(null)} />
    }
    if (appSimulatorsMapping[activeSimulator]) {
      return (
        <FinancialAppSimulator
          type={appSimulatorsMapping[activeSimulator]}
          onBack={() => setActiveSimulator(null)}
        />
      )
    }
    if (loanSimulatorsMapping[activeSimulator]) {
      return (
        <FinancialLoanSimulator
          type={loanSimulatorsMapping[activeSimulator]}
          onBack={() => setActiveSimulator(null)}
        />
      )
    }
    if (activeSimulator === 'Financiamento Bancário (Saldo Devedor/Juros)') {
      return <BankFinancingSimulator onBack={() => setActiveSimulator(null)} />
    }
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setActiveSimulator(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{activeSimulator}</h1>
        </div>
        <Card>
          <CardContent className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground min-h-[300px]">
            <Calculator className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Este simulador encontra-se em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/consult-plan/home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Simuladores Financeiros</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {simulators.map((title, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:border-primary/50 transition-colors group"
            onClick={() => setActiveSimulator(title)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight mb-1">{title}</CardTitle>
                <CardDescription className="text-sm font-medium">
                  {title === 'Fluxo Financeiro Projetado'
                    ? 'Simule projeções de entradas e saídas'
                    : title === 'Financiamento Bancário (Saldo Devedor/Juros)'
                      ? 'Simulador de financiamento com tabela de amortização'
                      : appSimulatorsMapping[title]
                        ? 'Simulador de aplicação financeira'
                        : loanSimulatorsMapping[title]
                          ? 'Simulador de empréstimo/série de pagamentos'
                          : 'Simulador em desenvolvimento'}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
