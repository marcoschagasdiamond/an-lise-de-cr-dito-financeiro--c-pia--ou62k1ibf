import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Calculator,
  Download,
  DollarSign,
  Info,
  History,
  FileText,
  Save,
  RefreshCw,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { calculateIRR, formatCurrency } from '@/lib/calculators'
import { exportAmortizationToCSV } from '@/lib/export-utils'
import { addMonths, format } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { getSimulacoes, createSimulacao, type SimulacaoFinanceira } from '@/services/simulacoes'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

interface ComparisonScenario {
  id: string
  name: string
  financingType: string
  indexer: string
  effectiveRate: number
  pmtFirst: number
  pmtLast: number
  totalInterest: number
  totalToPay: number
}

function calculateSimulation(
  pv: number,
  monthlyRate: number,
  term: number,
  modality: string,
  grace: number,
  type: 'price' | 'sac',
) {
  const r = monthlyRate / 100
  let pricePmt = 0
  const table = []
  const safeTerm = term > 0 ? term : 1
  let currentBalance = pv > 0 ? pv : 0

  if (r === 0) {
    pricePmt = currentBalance / safeTerm
  } else {
    if (modality === 'postecipado') {
      pricePmt =
        (currentBalance * (r * Math.pow(1 + r, safeTerm))) / (Math.pow(1 + r, safeTerm) - 1)
    } else if (modality === 'antecipado') {
      pricePmt =
        (currentBalance * (r * Math.pow(1 + r, safeTerm))) /
        (Math.pow(1 + r, safeTerm) - 1) /
        (1 + r)
    } else if (modality === 'diferido') {
      const balanceAfterGrace = currentBalance * Math.pow(1 + r, grace)
      pricePmt =
        (balanceAfterGrace * (r * Math.pow(1 + r, safeTerm))) / (Math.pow(1 + r, safeTerm) - 1)
    }
  }

  const startDate = new Date()
  let sacAmort = 0

  if (modality === 'diferido') {
    for (let k = 1; k <= grace; k++) {
      const interest = currentBalance * r
      const finalBalance = currentBalance + interest
      table.push({
        period: k,
        date: addMonths(startDate, k),
        initialBalance: currentBalance,
        interest,
        amortization: -interest,
        pmt: 0,
        finalBalance,
      })
      currentBalance = finalBalance
    }
    sacAmort = currentBalance / safeTerm
    for (let k = 1; k <= safeTerm; k++) {
      const interest = currentBalance * r
      const amort = type === 'price' ? pricePmt - interest : sacAmort
      const currentPmt = type === 'price' ? pricePmt : amort + interest
      const finalBalance = currentBalance - amort
      table.push({
        period: grace + k,
        date: addMonths(startDate, grace + k),
        initialBalance: currentBalance,
        interest,
        amortization: amort,
        pmt: currentPmt,
        finalBalance: Math.abs(finalBalance) < 0.01 ? 0 : finalBalance,
      })
      currentBalance = finalBalance
    }
  } else if (modality === 'antecipado') {
    sacAmort = currentBalance / safeTerm
    for (let k = 1; k <= safeTerm; k++) {
      const interest = k === 1 ? 0 : currentBalance * r
      const amort = type === 'price' ? pricePmt - interest : sacAmort
      const currentPmt = type === 'price' ? pricePmt : amort + interest
      const finalBalance = currentBalance - amort
      table.push({
        period: k,
        date: addMonths(startDate, k - 1),
        initialBalance: currentBalance,
        interest,
        amortization: amort,
        pmt: currentPmt,
        finalBalance: Math.abs(finalBalance) < 0.01 ? 0 : finalBalance,
      })
      currentBalance = finalBalance
    }
  } else {
    sacAmort = currentBalance / safeTerm
    for (let k = 1; k <= safeTerm; k++) {
      const interest = currentBalance * r
      const amort = type === 'price' ? pricePmt - interest : sacAmort
      const currentPmt = type === 'price' ? pricePmt : amort + interest
      const finalBalance = currentBalance - amort
      table.push({
        period: k,
        date: addMonths(startDate, k),
        initialBalance: currentBalance,
        interest,
        amortization: amort,
        pmt: currentPmt,
        finalBalance: Math.abs(finalBalance) < 0.01 ? 0 : finalBalance,
      })
      currentBalance = finalBalance
    }
  }

  let firstPaymentDate = startDate
  if (modality === 'postecipado') firstPaymentDate = addMonths(startDate, 1)
  if (modality === 'antecipado') firstPaymentDate = startDate
  if (modality === 'diferido') firstPaymentDate = addMonths(startDate, grace + 1)

  const totalToPay = table.reduce((acc, r) => acc + r.pmt, 0)
  const totalInterest = Math.max(0, totalToPay - pv)

  return {
    loanValue: pv,
    monthlyRate,
    termMonths: safeTerm,
    modality,
    gracePeriod: grace,
    type,
    totalInterest,
    totalToPay,
    totalInstallments: modality === 'diferido' ? grace + safeTerm : safeTerm,
    firstPaymentDate,
    table,
  }
}

export default function Simulador() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loanValueStr, setLoanValueStr] = useState('100000')
  const [monthlyRateStr, setMonthlyRateStr] = useState('1.5')
  const [termMonthsStr, setTermMonthsStr] = useState('36')
  const [modality, setModality] = useState('postecipado')
  const [gracePeriodStr, setGracePeriodStr] = useState('6')
  const [financingType, setFinancingType] = useState<'price' | 'sac'>('price')
  const [indexer, setIndexer] = useState<string>('none')
  const [spreadStr, setSpreadStr] = useState('0')

  const [avaliacaoStr, setAvaliacaoStr] = useState('0')
  const [taxaAdmStr, setTaxaAdmStr] = useState('0')
  const [iofStr, setIofStr] = useState('0')
  const [iofType, setIofType] = useState<'PERCENT' | 'BRL'>('PERCENT')
  const [fiStr, setFiStr] = useState('0')
  const [fiType, setFiType] = useState<'PERCENT' | 'BRL'>('PERCENT')
  const [outrosStr, setOutrosStr] = useState('0')

  const [showAllRows, setShowAllRows] = useState(false)
  const [simulacoes, setSimulacoes] = useState<SimulacaoFinanceira[]>([])
  const [comparisons, setComparisons] = useState<ComparisonScenario[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const [liveRates, setLiveRates] = useState<Record<string, number>>({
    SELIC: 10.5,
    CDI: 10.4,
    IPCA: 4.0,
    TR: 1.5,
    IGPM: -2.86,
  })
  const [lastFetch, setLastFetch] = useState<string>('')
  const [isFetchingRates, setIsFetchingRates] = useState(false)

  const fetchRates = async (force = false) => {
    setIsFetchingRates(true)
    try {
      const res = await pb.send(`/backend/v1/buscar-taxas-mercado${force ? '?force=true' : ''}`, {
        method: 'GET',
      })
      if (res) {
        setLiveRates({
          SELIC: res.selic_12m || 0,
          IPCA: res.ipca_12m || 0,
          CDI: res.cdi_12m || 0,
          TR: res.tr_12m || 0,
          IGPM: res.igpm_12m || 0,
        })
        setLastFetch(res.data_atualizacao)
      }
    } catch (err) {
      console.error('Failed to fetch rates', err)
    } finally {
      setIsFetchingRates(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchHistory = async () => {
    if (!user) return
    try {
      const data = await getSimulacoes(user.id)
      setSimulacoes(data)
    } catch (e) {
      console.error('Failed to fetch simulation history', e)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [user])

  useRealtime(
    'simulacoes_financeiras',
    () => {
      fetchHistory()
    },
    !!user,
  )

  const pv = parseFloat(loanValueStr) || 0
  const inputRate = parseFloat(monthlyRateStr) || 0
  const term = parseInt(termMonthsStr) || 1
  const grace = parseInt(gracePeriodStr) || 0
  const spread = parseFloat(spreadStr) || 0

  const annualBaseRate =
    indexer !== 'none' && indexer !== 'custom' ? liveRates[indexer.toUpperCase()] || 0 : 0
  const convertedMonthlyBaseRate = (Math.pow(1 + annualBaseRate / 100, 1 / 12) - 1) * 100

  const monthlyBaseRate =
    indexer === 'none' ? 0 : indexer === 'custom' ? inputRate : convertedMonthlyBaseRate

  const finalRate = indexer === 'none' ? inputRate : monthlyBaseRate + spread
  const finalAnnualRate = (Math.pow(1 + finalRate / 100, 12) - 1) * 100

  const resultsPrice = useMemo(
    () => calculateSimulation(pv, finalRate, term, modality, grace, 'price'),
    [pv, finalRate, term, modality, grace],
  )
  const resultsSAC = useMemo(
    () => calculateSimulation(pv, finalRate, term, modality, grace, 'sac'),
    [pv, finalRate, term, modality, grace],
  )

  const results = financingType === 'price' ? resultsPrice : resultsSAC

  const valAvaliacao = parseFloat(avaliacaoStr) || 0
  const taxaAdmInput = parseFloat(taxaAdmStr) || 0
  const valTaxaAdm = pv * (taxaAdmInput / 100)
  const iofValInput = parseFloat(iofStr) || 0
  const valIof = iofType === 'PERCENT' ? pv * (iofValInput / 100) : iofValInput
  const fiValInput = parseFloat(fiStr) || 0
  const valFi = fiType === 'PERCENT' ? pv * (fiValInput / 100) : fiValInput
  const valOutros = parseFloat(outrosStr) || 0

  const totalCustos = valAvaliacao + valTaxaAdm + valIof + valFi + valOutros
  const valorLiquido = pv - totalCustos

  let cetMensal = 0
  if (results && valorLiquido > 0) {
    const cashFlows = [-valorLiquido, ...results.table.map((r) => r.pmt)]
    cetMensal = calculateIRR(cashFlows, finalRate / 100)
    if (isNaN(cetMensal)) cetMensal = 0
  }
  const cetAnual = (Math.pow(1 + cetMensal, 12) - 1) * 100

  const handleSave = () => {
    if (!user) return
    const pesoCustos = pv > 0 ? (totalCustos / pv) * 100 : 0
    createSimulacao({
      user_id: user.id,
      loan_value: pv,
      interest_rate: inputRate,
      term,
      modality: modality as any,
      grace_period: grace,
      financing_type: financingType,
      indexer: indexer as any,
      spread: spread,
      effective_rate: finalRate,
      indexer_last_update: lastFetch,
      custos: {
        valor_avaliacao: valAvaliacao,
        taxa_administrativa: valTaxaAdm,
        iof: valIof,
        fi: valFi,
        outros_custos: valOutros,
        total_custos: totalCustos,
        valor_liquido_recebido: valorLiquido,
        percentual_custos: pesoCustos,
        cet: cetAnual,
        iof_input: iofValInput,
        iof_type: iofType,
        fi_input: fiValInput,
        fi_type: fiType,
        taxa_adm_input: taxaAdmInput,
      },
    })
      .then(() => {
        toast({
          title: 'Simulação salva',
          description: 'Os dados foram guardados no seu histórico.',
        })
      })
      .catch((err) => {
        console.error(err)
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar a simulação.',
          variant: 'destructive',
        })
      })
  }

  const handleAddComparison = () => {
    if (!results) return
    const newScen: ComparisonScenario = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Cenário ${comparisons.length + 1}`,
      financingType,
      indexer,
      effectiveRate: finalRate,
      pmtFirst: results.table.find((t) => t.pmt > 0)?.pmt || 0,
      pmtLast: results.table[results.table.length - 1]?.pmt || 0,
      totalInterest: results.totalInterest,
      totalToPay: results.totalToPay,
    }
    setComparisons([...comparisons, newScen])
    toast({
      title: 'Cenário adicionado',
      description: 'Verifique a tabela de comparação no final da página.',
    })
  }

  const handleLoadSimulation = (sim: SimulacaoFinanceira) => {
    setLoanValueStr(sim.loan_value.toString())
    setMonthlyRateStr(sim.interest_rate.toString())
    setTermMonthsStr(sim.term.toString())
    setModality(sim.modality)
    setGracePeriodStr((sim.grace_period || 0).toString())
    setFinancingType(sim.financing_type || 'price')
    setIndexer(sim.indexer || 'none')
    setSpreadStr((sim.spread || 0).toString())
    setAvaliacaoStr(sim.custos.valor_avaliacao.toString())
    setTaxaAdmStr((sim.custos.taxa_adm_input ?? 0).toString())
    setIofStr((sim.custos.iof_input ?? 0).toString())
    setIofType(sim.custos.iof_type ?? 'PERCENT')
    setFiStr((sim.custos.fi_input ?? 0).toString())
    setFiType(sim.custos.fi_type ?? 'PERCENT')
    setOutrosStr(sim.custos.outros_custos.toString())
    setShowAllRows(false)
    setIsHistoryOpen(false)
    toast({ title: 'Simulação carregada', description: 'Parâmetros atualizados com sucesso.' })
  }

  const handleExport = () => {
    if (!results) return
    const parameters = {
      'Valor do Financiamento (PV)': formatCurrency(results.loanValue),
      'Taxa de Juros Mensal': `${finalRate.toFixed(4)}%`,
      'Prazo (Meses)': results.termMonths.toString(),
      Modalidade:
        results.modality === 'postecipado'
          ? 'Postecipado'
          : results.modality === 'antecipado'
            ? 'Antecipado'
            : 'Diferido',
      'Carência (Meses)': results.modality === 'diferido' ? results.gracePeriod.toString() : '0',
      'Tipo Financiamento': financingType.toUpperCase(),
      Indexador: indexer.toUpperCase(),
    }
    exportAmortizationToCSV(parameters, results.table, 'Simulacao_Financiamento.csv')
  }

  const COLORS = {
    avaliacao: '#f59e0b',
    taxaAdm: '#10b981',
    iof: '#3b82f6',
    fi: '#8b5cf6',
    outros: '#6366f1',
    juros: '#ef4444',
  }

  const chartData = [
    { name: 'Avaliação', value: valAvaliacao, fill: COLORS.avaliacao },
    { name: 'Taxa Adm.', value: valTaxaAdm, fill: COLORS.taxaAdm },
    { name: 'IOF', value: valIof, fill: COLORS.iof },
    { name: 'FI', value: valFi, fill: COLORS.fi },
    { name: 'Outros', value: valOutros, fill: COLORS.outros },
    { name: 'Juros Totais', value: results?.totalInterest || 0, fill: COLORS.juros },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 print:bg-white print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Header title="Simulador Financeiro" />
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 print:space-y-6 print:p-8 print:max-w-[21cm] animate-fade-in-up">
        <div className="flex justify-end print:hidden">
          <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 bg-white shadow-sm border-slate-200">
                <History className="w-4 h-4" />
                Histórico de Simulações
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="pb-4 border-b border-slate-100">
                <SheetTitle>Histórico de Simulações</SheetTitle>
                <SheetDescription>
                  Carregue simulações salvas anteriormente para visualizar e comparar cenários.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                {simulacoes.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Nenhuma simulação salva ainda.
                  </p>
                ) : (
                  simulacoes.map((sim) => (
                    <Card
                      key={sim.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleLoadSimulation(sim)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-primary">
                            {formatCurrency(sim.loan_value)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {sim.created ? format(new Date(sim.created), 'dd/MM/yyyy HH:mm') : ''}
                          </div>
                        </div>
                        <div className="text-sm text-slate-600 grid grid-cols-2 gap-y-1">
                          <div>
                            Taxa: {sim.effective_rate?.toFixed(4) || sim.interest_rate}% a.m.
                          </div>
                          <div>Prazo: {sim.term}x</div>
                          <div>CET: {sim.custos.cet.toFixed(2)}% a.a.</div>
                          <div className="capitalize">Tipo: {sim.financing_type || 'price'}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card className="mb-8 border-slate-200 shadow-sm print:hidden">
          <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                Taxas Atualizadas de Mercado
              </CardTitle>
              <CardDescription>
                Última atualização:{' '}
                {lastFetch ? format(new Date(lastFetch), 'dd/MM/yyyy HH:mm') : 'Carregando...'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRates(true)}
              disabled={isFetchingRates}
              className="bg-white"
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isFetchingRates && 'animate-spin')} />
              Atualizar Agora
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition-shadow">
              <span className="text-blue-600 font-semibold text-sm tracking-wide">SELIC</span>
              <span className="text-2xl font-bold text-blue-900">
                {liveRates.SELIC?.toFixed(2)}%
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition-shadow">
              <span className="text-emerald-600 font-semibold text-sm tracking-wide">IPCA</span>
              <span className="text-2xl font-bold text-emerald-900">
                {liveRates.IPCA?.toFixed(2)}%
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition-shadow">
              <span className="text-amber-600 font-semibold text-sm tracking-wide">CDI</span>
              <span className="text-2xl font-bold text-amber-900">
                {liveRates.CDI?.toFixed(2)}%
              </span>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition-shadow">
              <span className="text-purple-600 font-semibold text-sm tracking-wide">TR</span>
              <span className="text-2xl font-bold text-purple-900">
                {liveRates.TR?.toFixed(2)}%
              </span>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex flex-col items-center justify-center shadow-sm hover:shadow transition-shadow">
              <span className="text-red-600 font-semibold text-sm tracking-wide">IGP-M</span>
              <span className="text-2xl font-bold text-red-900">{liveRates.IGPM?.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:flex print:flex-col">
          <Card className="lg:col-span-1 shadow-sm border-slate-200 h-fit print:hidden">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Parâmetros
              </CardTitle>
              <CardDescription>Configure os dados do financiamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="loanValue">Valor do Financiamento (R$)</Label>
                <Input
                  id="loanValue"
                  type="number"
                  min="0"
                  step="1000"
                  value={loanValueStr}
                  onChange={(e) => setLoanValueStr(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="termMonths">Prazo (Meses)</Label>
                <Input
                  id="termMonths"
                  type="number"
                  min="1"
                  step="1"
                  value={termMonthsStr}
                  onChange={(e) => setTermMonthsStr(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modality">Modalidade de Pagamento</Label>
                <Select value={modality} onValueChange={setModality}>
                  <SelectTrigger id="modality">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postecipado">Postecipado (Fim do mês)</SelectItem>
                    <SelectItem value="antecipado">Antecipado (Início do mês)</SelectItem>
                    <SelectItem value="diferido">Diferido (Com Carência)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {modality === 'diferido' && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="gracePeriod">Período de Carência (Meses)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    min="1"
                    step="1"
                    value={gracePeriodStr}
                    onChange={(e) => setGracePeriodStr(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Durante a carência, os juros são capitalizados ao saldo devedor.
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t">
                <Label>Tipo de Financiamento</Label>
                <RadioGroup
                  value={financingType}
                  onValueChange={(v: any) => setFinancingType(v)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="price" id="price" />
                    <Label
                      htmlFor="price"
                      className="font-normal flex items-center gap-1 cursor-pointer"
                    >
                      Tabela Price (PMT Fixa)
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger type="button" tabIndex={-1}>
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Prestação fixa durante todo o período, com juros decrescentes e
                            amortização crescente
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sac" id="sac" />
                    <Label
                      htmlFor="sac"
                      className="font-normal flex items-center gap-1 cursor-pointer"
                    >
                      Sistema SAC (Amort. Constante)
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger type="button" tabIndex={-1}>
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Amortização constante, com prestações decrescentes e juros decrescentes
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 mt-4 pt-4 border-t">
                <Label className="text-xs font-bold text-slate-500 tracking-wider">
                  INDEXADORES
                </Label>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="indexer">Indexador Financeiro</Label>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger type="button" tabIndex={-1}>
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Escolha um indexador de mercado para compor a taxa base de juros
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select value={indexer} onValueChange={setIndexer}>
                    <SelectTrigger id="indexer">
                      <SelectValue placeholder="Selecione o indexador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem Indexador (Taxa Fixa)</SelectItem>
                      <SelectItem value="selic">
                        SELIC (~{liveRates.SELIC?.toFixed(2)}% a.a. | ~
                        {((Math.pow(1 + (liveRates.SELIC || 0) / 100, 1 / 12) - 1) * 100).toFixed(
                          4,
                        )}
                        % a.m.)
                      </SelectItem>
                      <SelectItem value="ipca">
                        IPCA (~{liveRates.IPCA?.toFixed(2)}% a.a. | ~
                        {((Math.pow(1 + (liveRates.IPCA || 0) / 100, 1 / 12) - 1) * 100).toFixed(4)}
                        % a.m.)
                      </SelectItem>
                      <SelectItem value="tr">
                        TR (~{liveRates.TR?.toFixed(2)}% a.a. | ~
                        {((Math.pow(1 + (liveRates.TR || 0) / 100, 1 / 12) - 1) * 100).toFixed(4)}%
                        a.m.)
                      </SelectItem>
                      <SelectItem value="cdi">
                        CDI (~{liveRates.CDI?.toFixed(2)}% a.a. | ~
                        {((Math.pow(1 + (liveRates.CDI || 0) / 100, 1 / 12) - 1) * 100).toFixed(4)}%
                        a.m.)
                      </SelectItem>
                      <SelectItem value="igpm">
                        IGP-M (~{liveRates.IGPM?.toFixed(2)}% a.a. | ~
                        {((Math.pow(1 + (liveRates.IGPM || 0) / 100, 1 / 12) - 1) * 100).toFixed(4)}
                        % a.m.)
                      </SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(indexer === 'none' || indexer === 'custom') && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="monthlyRate">
                      {indexer === 'custom'
                        ? 'Taxa Base Personalizada (% a.m.)'
                        : 'Taxa de Juros Mensal (% a.m.)'}
                    </Label>
                    <Input
                      id="monthlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={monthlyRateStr}
                      onChange={(e) => setMonthlyRateStr(e.target.value)}
                    />
                  </div>
                )}

                {indexer !== 'none' && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="spread">Spread Adicional (% a.m.)</Label>
                    <Input
                      id="spread"
                      type="number"
                      min="0"
                      step="0.01"
                      value={spreadStr}
                      onChange={(e) => setSpreadStr(e.target.value)}
                    />
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-col gap-2 text-sm shadow-sm animate-fade-in">
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    TAXA SELECIONADA
                  </div>
                  {indexer !== 'none' && indexer !== 'custom' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Indexador Selecionado:</span>
                        <span className="font-medium text-slate-900 uppercase">
                          {indexer === 'igpm' ? 'IGP-M' : indexer}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Taxa Anual (Indexador):</span>
                        <span className="font-medium text-slate-900">
                          {annualBaseRate.toFixed(2)}% a.a.
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Taxa Mensal (Convertida):</span>
                        <span className="font-medium text-slate-900">
                          {convertedMonthlyBaseRate.toFixed(4)}% a.m.
                        </span>
                      </div>
                    </>
                  ) : indexer === 'custom' ? (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Taxa Base Personalizada:</span>
                      <span className="font-medium text-slate-900">
                        {monthlyBaseRate.toFixed(4)}% a.m.
                      </span>
                    </div>
                  ) : null}

                  {indexer !== 'none' && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Spread Adicional:</span>
                      <span className="font-medium text-slate-900">{spread.toFixed(4)}% a.m.</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-800 font-semibold">Taxa Efetiva Mensal:</span>
                    <span className="font-bold text-primary">{finalRate.toFixed(4)}% a.m.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-800 font-semibold">Taxa Efetiva Anual:</span>
                    <span className="font-bold text-primary">
                      {finalAnnualRate.toFixed(2)}% a.a.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
                <Button className="w-1/2 gap-2" variant="outline" onClick={handleAddComparison}>
                  <Plus className="w-4 h-4" /> Comparar
                </Button>
                <Button className="w-1/2 gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" /> Salvar
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 print:col-span-1 flex flex-col gap-6 print:w-full">
            <div className="flex justify-between items-center print:hidden mb-2">
              <div />
              <Button
                onClick={() => window.print()}
                className="gap-2 bg-slate-800 hover:bg-slate-900 text-white shadow-md"
              >
                <FileText className="w-4 h-4" /> Gerar Relatório (PDF)
              </Button>
            </div>

            {results && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-3 gap-4">
                <Card className="sm:col-span-2 xl:col-span-3 print:col-span-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg border-none print:shadow-none print:border print:border-slate-300 print:bg-none print:text-slate-900">
                  <CardHeader>
                    <CardDescription className="text-slate-300 print:text-slate-600 font-medium uppercase tracking-wider text-xs">
                      {financingType === 'sac'
                        ? 'Primeira Parcela'
                        : `Parcela Mensal (PMT) ${modality === 'diferido' ? 'após carência' : ''}`}
                    </CardDescription>
                    <CardTitle className="text-4xl text-amber-400 print:text-slate-900">
                      {formatCurrency(results.table.find((t) => t.pmt > 0)?.pmt || 0)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="print:shadow-none print:border-slate-300">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1 print:text-slate-600">
                      <DollarSign className="w-4 h-4" /> Total a Pagar
                    </CardDescription>
                    <CardTitle className="text-2xl">{formatCurrency(results.totalToPay)}</CardTitle>
                  </CardHeader>
                </Card>

                <Card className="print:shadow-none print:border-slate-300">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1 print:text-slate-600">
                      Total de Juros
                    </CardDescription>
                    <CardTitle className="text-2xl text-red-500">
                      {formatCurrency(results.totalInterest)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card className="print:shadow-none print:border-slate-300">
                  <CardHeader className="pb-2">
                    <CardDescription className="print:text-slate-600">
                      Prazos e Datas
                    </CardDescription>
                    <div className="text-sm space-y-1 mt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parcelas:</span>
                        <span className="font-medium">{results.totalInstallments} meses</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">1º Pgto:</span>
                        <span className="font-medium">
                          {format(results.firstPaymentDate, 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {resultsPrice && resultsSAC && (
                  <Card className="sm:col-span-2 xl:col-span-3 border border-slate-200 shadow-sm mt-4 print:hidden">
                    <CardHeader className="bg-slate-50 pb-4 border-b border-slate-100">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Comparativo de Sistemas: Price vs SAC
                      </CardTitle>
                      <CardDescription>
                        Análise de custo total com os parâmetros atuais ({finalRate.toFixed(4)}%
                        a.m.)
                      </CardDescription>{' '}
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table className="w-full">
                          <TableHeader className="bg-white">
                            <TableRow>
                              <TableHead className="font-medium">Métrica</TableHead>
                              <TableHead className="text-right">Tabela Price</TableHead>
                              <TableHead className="text-right">Sistema SAC</TableHead>
                              <TableHead className="text-right">Diferença</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium text-slate-600">
                                Primeira Parcela
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(
                                  resultsPrice.table.find((t) => t.pmt > 0)?.pmt || 0,
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(resultsSAC.table.find((t) => t.pmt > 0)?.pmt || 0)}
                              </TableCell>
                              <TableCell className="text-right text-slate-400">-</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-slate-600">
                                Última Parcela
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(
                                  resultsPrice.table[resultsPrice.table.length - 1]?.pmt || 0,
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(
                                  resultsSAC.table[resultsSAC.table.length - 1]?.pmt || 0,
                                )}
                              </TableCell>
                              <TableCell className="text-right text-slate-400">-</TableCell>
                            </TableRow>
                            <TableRow className="bg-slate-50">
                              <TableCell className="font-medium text-slate-800">
                                Total de Juros
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(resultsPrice.totalInterest)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(resultsSAC.totalInterest)}
                              </TableCell>
                              {(() => {
                                const diff = resultsPrice.totalInterest - resultsSAC.totalInterest
                                const pct =
                                  resultsPrice.totalInterest > 0
                                    ? (diff / resultsPrice.totalInterest) * 100
                                    : 0
                                const isSacBetter = diff > 0
                                return (
                                  <TableCell
                                    className={`text-right font-bold ${isSacBetter ? 'text-emerald-600' : 'text-amber-600'}`}
                                  >
                                    {isSacBetter ? '-' : '+'}
                                    {formatCurrency(Math.abs(diff))} ({Math.abs(pct).toFixed(1)}%)
                                  </TableCell>
                                )
                              })()}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {results && (
          <Card className="bg-slate-50 shadow-sm border-slate-200 print:bg-transparent print:border-none print:shadow-none print:mt-8">
            <CardHeader className="print:hidden">
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="w-5 h-5 text-primary" />
                CUSTOS E TAXAS
              </CardTitle>
              <CardDescription>
                Adicione custos associados à operação para o cálculo automático do Custo Efetivo
                Total (CET)
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 print:p-0">
              <div className="print:hidden">
                <TooltipProvider delayDuration={100}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="avaliacao">Avaliação (R$)</Label>
                      <Input
                        id="avaliacao"
                        type="number"
                        min="0"
                        value={avaliacaoStr}
                        onChange={(e) => setAvaliacaoStr(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxaAdm">Taxa Administrativa (%)</Label>
                      <Input
                        id="taxaAdm"
                        type="number"
                        min="0"
                        step="0.1"
                        value={taxaAdmStr}
                        onChange={(e) => setTaxaAdmStr(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IOF</Label>
                      <div className="flex gap-2">
                        <Input
                          className="flex-1"
                          type="number"
                          min="0"
                          step="0.01"
                          value={iofStr}
                          onChange={(e) => setIofStr(e.target.value)}
                        />
                        <Select value={iofType} onValueChange={(v: any) => setIofType(v)}>
                          <SelectTrigger className="w-[75px] px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENT">%</SelectItem>
                            <SelectItem value="BRL">R$</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Fundo Insolvência</Label>
                      <div className="flex gap-2">
                        <Input
                          className="flex-1"
                          type="number"
                          min="0"
                          step="0.01"
                          value={fiStr}
                          onChange={(e) => setFiStr(e.target.value)}
                        />
                        <Select value={fiType} onValueChange={(v: any) => setFiType(v)}>
                          <SelectTrigger className="w-[75px] px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENT">%</SelectItem>
                            <SelectItem value="BRL">R$</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outros">Outros Custos (R$)</Label>
                      <Input
                        id="outros"
                        type="number"
                        min="0"
                        value={outrosStr}
                        onChange={(e) => setOutrosStr(e.target.value)}
                      />
                    </div>
                  </div>
                </TooltipProvider>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 print:border-none print:mt-0 print:pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm print:shadow-none print:border-slate-300">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium text-slate-600">
                              Valor da Avaliação
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(valAvaliacao)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-slate-600">
                              Taxa Administrativa
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(valTaxaAdm)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-slate-600">IOF</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(valIof)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-slate-600">
                              Fundo Insolvência (FI)
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(valFi)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-slate-600">
                              Outros Custos
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(valOutros)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="bg-slate-50 font-bold border-t-2 print:bg-slate-100">
                            <TableCell className="text-slate-800">
                              Total de Custos (Taxas)
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              {formatCurrency(totalCustos)}
                            </TableCell>
                          </TableRow>
                          <TableRow className="bg-emerald-50/50 font-bold print:bg-emerald-50">
                            <TableCell className="text-slate-800">Valor Líquido Recebido</TableCell>
                            <TableCell className="text-right text-emerald-700">
                              {formatCurrency(valorLiquido)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-white shadow-sm print:shadow-none print:border-slate-300">
                        <CardHeader className="pb-4">
                          <CardDescription className="text-slate-500 font-medium">
                            Taxa de Juros Efetiva
                          </CardDescription>
                          <CardTitle className="text-3xl text-slate-800">
                            {finalRate.toFixed(4)}%{' '}
                            <span className="text-lg font-normal opacity-80">a.m.</span>
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="bg-amber-400 border-none shadow-md text-slate-900 print:bg-amber-100 print:shadow-none print:border print:border-amber-300">
                        <CardHeader className="pb-4">
                          <CardDescription className="text-slate-800 font-bold print:text-slate-900">
                            Custo Efetivo Total (CET)
                          </CardDescription>
                          <CardTitle className="text-3xl font-extrabold">
                            {cetAnual.toFixed(2)}%{' '}
                            <span className="text-lg font-bold opacity-80">a.a.</span>
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </div>
                  </div>

                  <Card className="bg-white shadow-sm h-full flex flex-col justify-center print:shadow-none print:border-slate-300 print:min-h-[400px]">
                    <CardHeader className="pb-0 text-center">
                      <CardTitle className="text-base text-slate-700">
                        Composição Visual da Operação (Taxas + Juros)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1 min-h-[350px] w-full">
                      {chartData.length > 0 ? (
                        <ChartContainer
                          config={{
                            avaliacao: { label: 'Avaliação', color: COLORS.avaliacao },
                            taxaAdm: { label: 'Taxa Adm.', color: COLORS.taxaAdm },
                            iof: { label: 'IOF', color: COLORS.iof },
                            fi: { label: 'FI', color: COLORS.fi },
                            outros: { label: 'Outros', color: COLORS.outros },
                            juros: { label: 'Juros Totais', color: COLORS.juros },
                          }}
                          className="h-full w-full"
                        >
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={110}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              iconType="circle"
                              wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                            />
                          </PieChart>
                        </ChartContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                          Nenhum custo ou juros para exibir
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {results && comparisons.length > 0 && (
          <Card className="mt-8 border-slate-200 shadow-sm print:hidden animate-fade-in">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2">Comparativo de Cenários</CardTitle>
              <CardDescription>Análise lado a lado das simulações adicionadas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto rounded-md border border-slate-200 mb-8">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Cenário</TableHead>
                      <TableHead>Sistema</TableHead>
                      <TableHead>Indexador</TableHead>
                      <TableHead>Taxa Efetiva</TableHead>
                      <TableHead className="text-right">1ª Parcela</TableHead>
                      <TableHead className="text-right">Última Parcela</TableHead>
                      <TableHead className="text-right">Total de Juros</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisons.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-slate-700">{c.name}</TableCell>
                        <TableCell className="uppercase text-slate-600">
                          {c.financingType}
                        </TableCell>
                        <TableCell className="uppercase text-slate-600">{c.indexer}</TableCell>
                        <TableCell className="text-slate-600">
                          {c.effectiveRate.toFixed(4)}%
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {formatCurrency(c.pmtFirst)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {formatCurrency(c.pmtLast)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-semibold">
                          {formatCurrency(c.totalInterest)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="h-[350px] w-full">
                <ChartContainer
                  config={{ interest: { label: 'Juros Totais', color: 'hsl(var(--primary))' } }}
                >
                  <BarChart data={comparisons} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `R$ ${Math.round(val / 1000)}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="totalInterest"
                      fill="var(--color-interest)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {results && (
          <Card className="shadow-sm border-slate-200 print:shadow-none print:border-none print:mt-12">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 print:px-0 border-b print:border-b-2 print:border-slate-800">
              <div>
                <CardTitle className="print:text-2xl print:text-slate-900">
                  Tabela de Amortização ({financingType === 'sac' ? 'Sistema SAC' : 'Tabela Price'})
                </CardTitle>
                <CardDescription className="print:text-slate-600">
                  Evolução do saldo devedor mês a mês
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} className="print:hidden">
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>
            </CardHeader>
            <CardContent className="print:px-0 pt-4">
              <div className="max-h-[600px] w-full overflow-auto rounded-md border scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent print:h-auto print:max-h-none print:overflow-visible print:border-none">
                <Table className="min-w-[800px] print:w-full print:min-w-0">
                  <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm print:static print:shadow-none print:bg-slate-100">
                    <TableRow>
                      <TableHead className="w-[80px]">Nº</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Saldo Inicial</TableHead>
                      <TableHead className="text-right">Juros</TableHead>
                      <TableHead className="text-right">Amortização</TableHead>
                      <TableHead className="text-right">Prestação</TableHead>
                      <TableHead className="text-right">Saldo Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="will-change-transform">
                    {(showAllRows ? results.table : results.table.slice(0, 20)).map((row) => (
                      <TableRow key={row.period} className="print:break-inside-avoid">
                        <TableCell className="font-medium">{row.period}</TableCell>
                        <TableCell className="text-muted-foreground print:text-slate-800">
                          {format(row.date, 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.initialBalance)}
                        </TableCell>
                        <TableCell className="text-right text-red-500/80 print:text-red-700">
                          {formatCurrency(row.interest)}
                        </TableCell>
                        <TableCell className="text-right text-green-600/80 print:text-emerald-700">
                          {formatCurrency(row.amortization)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(row.pmt)}
                        </TableCell>
                        <TableCell className="text-right text-primary font-bold print:text-slate-900">
                          {formatCurrency(row.finalBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {results.table.length > 20 && !showAllRows && (
                <div className="mt-4 flex justify-center print:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllRows(true)}
                    className="w-full sm:w-auto"
                  >
                    Expandir Tabela Completa ({results.table.length - 20} linhas ocultas)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
