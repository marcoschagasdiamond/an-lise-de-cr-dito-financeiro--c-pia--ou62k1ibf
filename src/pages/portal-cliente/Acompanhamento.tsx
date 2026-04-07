import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Info,
  Printer,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  Loader2,
  Mail,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFinancialStore } from '@/store/main'
import useEconomicStore from '@/stores/economic'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface HistoryRecord {
  id: string
  created: string
  nome_relatorio: string
  tipo_cenario: string
  arquivo_pdf: string
  faturamento?: number
  ebitda?: number
  ebit?: number
}

export default function Acompanhamento() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [periodo, setPeriodo] = useState<string>('')
  const [months, setMonths] = useState<number>(12)
  const [captRec, setCaptRec] = useState<'S' | 'N'>('N')
  const [ebitdaTargetStr, setEbitdaTargetStr] = useState<string>('')

  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)

  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [reportToSend, setReportToSend] = useState<string | null>(null)
  const [emailRecipient, setEmailRecipient] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const { dre } = useFinancialStore()
  const { netResult } = useEconomicStore()

  useEffect(() => {
    if (user?.ebitda_target !== undefined) {
      setEbitdaTargetStr(user.ebitda_target.toString())
    }
  }, [user])

  const handleEbitdaTargetBlur = async () => {
    if (!user) return
    const val = parseFloat(ebitdaTargetStr)
    const finalVal = isNaN(val) ? 0 : val
    if (user.ebitda_target === finalVal) return

    try {
      await pb.collection('users').update(user.id, { ebitda_target: finalVal })
      toast({ title: 'Meta atualizada', description: 'Sua meta de margem EBITDA foi salva.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao salvar meta', variant: 'destructive' })
    }
  }

  const isProjetado = captRec === 'S'
  const currentDivisor = isProjetado ? 12 : months || 1
  const prevDivisor = isProjetado ? months || 1 : 12

  // DRE Sorting
  const sortedDre = [...(dre || [])].sort((a, b) => b.year - a.year)
  const latestDre = sortedDre[0] || ({} as any)
  const prevDre = sortedDre[1] || ({} as any)
  const projData = netResult?.[0]?.com || ({} as any)

  const rFat = latestDre.receita || 0
  const rDed =
    (latestDre.impostosSobreVendas || 0) + (latestDre.devolucoesDescontosAbatimentos || 0)
  const rCusto = latestDre.cpv || 0
  const rDespPessoal = latestDre.despesasComPessoal || 0
  const rDespTerceiros = latestDre.prestacaoServicosTerceiros || 0
  const rDespComerciais = latestDre.despesasComerciaisTributarias || 0
  const rDespAdmin = latestDre.despesasAdministrativas || 0
  const rDespOutras = latestDre.outrasDespesasOperacionais || 0
  const rOutrasRec = latestDre.outrasReceitasOperacionaisTributaveis || 0
  const rDepreciacao = latestDre.depreciacao || 0

  const prFat = prevDre.receita || 0
  const prDed = (prevDre.impostosSobreVendas || 0) + (prevDre.devolucoesDescontosAbatimentos || 0)
  const prCusto = prevDre.cpv || 0
  const prDespPessoal = prevDre.despesasComPessoal || 0
  const prDespTerceiros = prevDre.prestacaoServicosTerceiros || 0
  const prDespComerciais = prevDre.despesasComerciaisTributarias || 0
  const prDespAdmin = prevDre.despesasAdministrativas || 0
  const prDespOutras = prevDre.outrasDespesasOperacionais || 0
  const prOutrasRec = prevDre.outrasReceitasOperacionaisTributaveis || 0
  const prDepreciacao = prevDre.depreciacao || 0

  const getPerc = (val: number) => (rFat ? val / rFat : 0)

  const pjFat = projData.fatBruto || 0
  const pjDed = projData.deducoes ?? pjFat * getPerc(rDed)
  const pjCusto = projData.cpv ?? pjFat * getPerc(rCusto)
  const pjDespPessoal = pjFat * getPerc(rDespPessoal)
  const pjDespTerceiros = pjFat * getPerc(rDespTerceiros)
  const pjDespComerciais = pjFat * getPerc(rDespComerciais)
  const pjDespAdmin = pjFat * getPerc(rDespAdmin)
  const pjDespOutras = pjFat * getPerc(rDespOutras)
  const pjOutrasRec = pjFat * getPerc(rOutrasRec)
  const pjDepreciacao = projData.depreciacao ?? pjFat * getPerc(rDepreciacao)

  const cFat = isProjetado ? pjFat : rFat
  const pFat = isProjetado ? rFat : prFat

  const cDed = isProjetado ? pjDed : rDed
  const pDed = isProjetado ? rDed : prDed

  const cCusto = isProjetado ? pjCusto : rCusto
  const pCusto = isProjetado ? rCusto : prCusto

  const cDespPessoal = isProjetado ? pjDespPessoal : rDespPessoal
  const pDespPessoal = isProjetado ? rDespPessoal : prDespPessoal

  const cDespTerceiros = isProjetado ? pjDespTerceiros : rDespTerceiros
  const pDespTerceiros = isProjetado ? rDespTerceiros : prDespTerceiros

  const cDespComerciais = isProjetado ? pjDespComerciais : rDespComerciais
  const pDespComerciais = isProjetado ? rDespComerciais : prDespComerciais

  const cDespAdmin = isProjetado ? pjDespAdmin : rDespAdmin
  const pDespAdmin = isProjetado ? rDespAdmin : prDespAdmin

  const cDespOutras = isProjetado ? pjDespOutras : rDespOutras
  const pDespOutras = isProjetado ? rDespOutras : prDespOutras

  const cDespesas = cDespPessoal + cDespTerceiros + cDespComerciais + cDespAdmin + cDespOutras
  const pDespesas = pDespPessoal + pDespTerceiros + pDespComerciais + pDespAdmin + pDespOutras

  const cOutrasRec = isProjetado ? pjOutrasRec : rOutrasRec
  const pOutrasRec = isProjetado ? rOutrasRec : prOutrasRec

  const cDepreciacao = isProjetado ? pjDepreciacao : rDepreciacao
  const pDepreciacao = isProjetado ? rDepreciacao : prDepreciacao

  const cEbitda = cFat - cDed - cCusto - cDespesas + cOutrasRec
  const pEbitda = pFat - pDed - pCusto - pDespesas + pOutrasRec

  const cEbit = cEbitda - cDepreciacao
  const pEbit = pEbitda - pDepreciacao

  const createRow = (
    name: string,
    cVal: number,
    pVal: number,
    isExpense: boolean,
    isHeader: boolean = false,
    isSub: boolean = false,
  ) => {
    const mCVal = cVal / currentDivisor
    const mPVal = pVal / prevDivisor
    const avPerc = cFat ? cVal / cFat : 0
    const prevAvPerc = pFat ? pVal / pFat : 0
    const u6 = prevAvPerc !== 0 ? avPerc / prevAvPerc : avPerc ? 1.01 : 1

    let ahPerc = 0
    if (mPVal !== 0) {
      ahPerc = (mCVal - mPVal) / Math.abs(mPVal)
    } else if (mCVal !== 0) {
      ahPerc = mCVal > 0 ? 1 : -1
    }

    return {
      name,
      value: mCVal,
      prevValue: mPVal,
      avPerc,
      prevAvPerc,
      u6,
      ahPerc,
      isExpense,
      isHeader,
      isSub,
    }
  }

  const rows = [
    createRow('FATURAMENTO BRUTO', cFat, pFat, false, true),
    createRow('DEDUÇÕES SOBRE VENDAS', cDed, pDed, true),
    createRow('CUSTO DOS PRODUTOS/SERVIÇOS VENDIDOS', cCusto, pCusto, true),
    createRow('DESPESAS OPERACIONAIS', cDespesas, pDespesas, true, true),
    createRow('Pessoal', cDespPessoal, pDespPessoal, true, false, true),
    createRow('Terceiros', cDespTerceiros, pDespTerceiros, true, false, true),
    createRow('Comerciais', cDespComerciais, pDespComerciais, true, false, true),
    createRow('Administrativas', cDespAdmin, pDespAdmin, true, false, true),
    createRow('Outras', cDespOutras, pDespOutras, true, false, true),
    createRow('OUTRAS RECEITAS OPERACIONAIS TRIBUTÁVEIS', cOutrasRec, pOutrasRec, false),
    createRow('RESULTADO LÍQUIDO (EBITDA)', cEbitda, pEbitda, false, true),
    createRow('DESPESAS C/ DEPREC. AMORTIZ. E EXAUSTÃO', cDepreciacao, pDepreciacao, true),
    createRow('RESULTADO LÍQUIDO (EBIT)', cEbit, pEbit, false, true),
  ]

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  const formatPercent = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format(val)

  const getAnalysis = (u6: number, isExpense: boolean = false) => {
    if (u6 > 1.0001)
      return isExpense
        ? { label: 'RUIM', color: 'bg-red-100 text-red-800 border-red-200' }
        : { label: 'BOM', color: 'bg-green-100 text-green-800 border-green-200' }
    if (u6 < 0.9999)
      return isExpense
        ? { label: 'BOM', color: 'bg-green-100 text-green-800 border-green-200' }
        : { label: 'RUIM', color: 'bg-red-100 text-red-800 border-red-200' }
    return { label: 'OK', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
  }

  const getAhColor = (val: number, isExpense: boolean = false) => {
    if (val > 0.0001) return isExpense ? 'text-red-600' : 'text-green-600'
    if (val < -0.0001) return isExpense ? 'text-green-600' : 'text-red-600'
    return 'text-yellow-600'
  }

  const summaryFat = rows.find((r) => r.name === 'FATURAMENTO BRUTO')!
  const summaryEbitda = rows.find((r) => r.name === 'RESULTADO LÍQUIDO (EBITDA)')!
  const summaryEbit = rows.find((r) => r.name === 'RESULTADO LÍQUIDO (EBIT)')!
  const overallAnalysis = getAnalysis(summaryEbitda.u6, false)

  // Performance Alert Logic
  const ebitdaMarginVal = summaryFat.value ? (summaryEbitda.value / summaryFat.value) * 100 : 0
  const ebitdaTargetNum = parseFloat(ebitdaTargetStr)
  const hasEbitdaAlert =
    !isNaN(ebitdaTargetNum) && ebitdaTargetNum > 0 && ebitdaMarginVal < ebitdaTargetNum

  const chartData = [
    { name: 'Faturamento', Anterior: summaryFat.prevValue, Atual: summaryFat.value },
    { name: 'EBITDA', Anterior: summaryEbitda.prevValue, Atual: summaryEbitda.value },
    { name: 'EBIT', Anterior: summaryEbit.prevValue, Atual: summaryEbit.value },
  ]

  const chartConfig = {
    Atual: { label: isProjetado ? 'Projetado (Média)' : 'Atual (Média)', color: '#003366' },
    Anterior: { label: isProjetado ? 'Atual (Média)' : 'Anterior (Média)', color: '#60a5fa' },
  }

  const loadHistory = async () => {
    if (!user) return
    try {
      setLoadingHistory(true)
      const records = await pb.collection('historico_analises').getList<HistoryRecord>(1, 50, {
        sort: '-created',
        filter: `user_id = "${user.id}"`,
      })
      setHistory(records.items)
    } catch (e) {
      console.error('Failed to load history:', e)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [user])
  useRealtime('historico_analises', () => {
    loadHistory()
  })

  const handleExportPDF = async () => {
    if (!user) return
    setIsExporting(true)
    window.print()

    try {
      const pdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Relatorio de Desempenho - ${periodo || 'Atual'}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000289 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n393\n%%EOF`
      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      const file = new File([blob], `Analise_${Date.now()}.pdf`, { type: 'application/pdf' })

      const formData = new FormData()
      formData.append('user_id', user.id)
      formData.append('nome_relatorio', `Análise de Desempenho - ${periodo || 'Período Atual'}`)
      formData.append('arquivo_pdf', file)
      formData.append('tipo_cenario', captRec === 'S' ? 'Projetado' : 'Real')
      formData.append('faturamento', summaryFat.value.toString())
      formData.append('ebitda', summaryEbitda.value.toString())
      formData.append('ebit', summaryEbit.value.toString())

      await pb.collection('historico_analises').create(formData)
      toast({
        title: 'Relatório salvo!',
        description: 'Uma cópia foi adicionada ao seu histórico.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível persistir o relatório.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleReportSelection = (id: string) => {
    setSelectedReports((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id)
      if (prev.length >= 2) {
        toast({
          title: 'Máximo de 2 relatórios',
          description: 'Selecione apenas dois para comparar.',
          variant: 'destructive',
        })
        return prev
      }
      return [...prev, id]
    })
  }

  const handleSendEmail = async () => {
    if (!emailRecipient || !reportToSend) return
    setIsSendingEmail(true)
    try {
      await pb.send(`/backend/v1/reports/${reportToSend}/send`, {
        method: 'POST',
        body: JSON.stringify({ email: emailRecipient }),
      })
      toast({
        title: 'E-mail enviado',
        description: `Relatório enviado com sucesso para ${emailRecipient}`,
      })
      setEmailDialogOpen(false)
      setEmailRecipient('')
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar o e-mail.',
        variant: 'destructive',
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const renderComparisonDialog = () => {
    const report1 = history.find((r) => r.id === selectedReports[0])
    const report2 = history.find((r) => r.id === selectedReports[1])

    if (!report1 || !report2) return null
    const [older, newer] =
      new Date(report1.created) < new Date(report2.created)
        ? [report1, report2]
        : [report2, report1]

    const calcDelta = (v1: number, v2: number) => {
      const diff = v2 - v1
      const pct = v1 !== 0 ? diff / Math.abs(v1) : 0
      return { diff, pct }
    }

    const fatDelta = calcDelta(older.faturamento || 0, newer.faturamento || 0)
    const ebitdaDelta = calcDelta(older.ebitda || 0, newer.ebitda || 0)
    const ebitDelta = calcDelta(older.ebit || 0, newer.ebit || 0)

    const renderRow = (
      label: string,
      v1: number,
      v2: number,
      delta: { diff: number; pct: number },
    ) => (
      <TableRow>
        <TableCell className="font-medium text-slate-700">{label}</TableCell>
        <TableCell className="text-right text-slate-600">{formatCurrency(v1)}</TableCell>
        <TableCell className="text-right text-slate-600">{formatCurrency(v2)}</TableCell>
        <TableCell
          className={cn(
            'text-right font-medium',
            delta.diff > 0 ? 'text-green-600' : delta.diff < 0 ? 'text-red-600' : 'text-slate-600',
          )}
        >
          {delta.diff > 0 ? '+' : ''}
          {formatCurrency(delta.diff)}
        </TableCell>
        <TableCell
          className={cn(
            'text-right font-medium',
            delta.pct > 0 ? 'text-green-600' : delta.pct < 0 ? 'text-red-600' : 'text-slate-600',
          )}
        >
          {delta.pct > 0 ? '+' : ''}
          {formatPercent(delta.pct)}
        </TableCell>
      </TableRow>
    )

    return (
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-[#003366] flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" /> Comparação de Relatórios
            </DialogTitle>
            <DialogDescription>
              Comparando a evolução entre os dois períodos selecionados.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-[#003366]">Métrica</TableHead>
                  <TableHead className="text-right font-bold text-[#003366]">
                    {new Date(older.created).toLocaleDateString('pt-BR')}
                    <div className="text-xs font-normal text-slate-500 mt-1">
                      {older.tipo_cenario}
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-[#003366]">
                    {new Date(newer.created).toLocaleDateString('pt-BR')}
                    <div className="text-xs font-normal text-slate-500 mt-1">
                      {newer.tipo_cenario}
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-[#003366]">
                    Variação (R$)
                  </TableHead>
                  <TableHead className="text-right font-bold text-[#003366]">
                    Variação (%)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderRow(
                  'Faturamento Bruto',
                  older.faturamento || 0,
                  newer.faturamento || 0,
                  fatDelta,
                )}
                {renderRow('EBITDA', older.ebitda || 0, newer.ebitda || 0, ebitdaDelta)}
                {renderRow('EBIT', older.ebit || 0, newer.ebit || 0, ebitDelta)}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 print:bg-white print:text-black">
      <style type="text/css" media="print">
        {`
          @page { size: landscape; margin: 10mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          aside, nav, header { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
        `}
      </style>

      <div className="print:hidden">
        <Header title="Acompanhamento e Desempenho" />
      </div>

      <div className="p-6 md:p-8 max-w-[1400px] mx-auto w-full space-y-8 animate-fade-in-up print:p-0 print:m-0 print:space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <h1 className="text-2xl font-bold text-[#003366]">
            ACOMPANHAMENTO DO DESEMPENHO OPERACIONAL
          </h1>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-[#003366] hover:bg-[#002244] text-white"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}{' '}
            Exportar em PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          <Card className="border-t-4 border-t-[#003366] shadow-md">
            <CardHeader className="bg-blue-50/50 pb-4">
              <CardTitle className="text-[#003366] text-lg">PERÍODO AVALIADO (ATUAL)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="periodo">PERÍODO AVALIADO</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Digite a referência dos meses avaliados.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="periodo"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  placeholder="Ex: Jan-mar"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="months">Nº DE MESES</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Número de meses do período avaliado.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="months"
                  type="number"
                  value={months || ''}
                  onChange={(e) => setMonths(Number(e.target.value) || 1)}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Faturamento Bruto (Atual)</Label>
                <Input
                  value={formatCurrency(rFat)}
                  readOnly
                  className="bg-slate-50 text-slate-500 font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-[#003366] shadow-md">
            <CardHeader className="bg-blue-50/50 pb-4">
              <CardTitle className="text-[#003366] text-lg">CENÁRIO PROJETADO E METAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="captRec">C/CAPT. REC.? (S/N)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Considerar incremento de faturamento.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={captRec} onValueChange={(val: 'S' | 'N') => setCaptRec(val)}>
                  <SelectTrigger id="captRec">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">Sim (S)</SelectItem>
                    <SelectItem value="N">Não (N)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ebitdaTarget">Meta Margem EBITDA (%)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Margem alvo. Se ficar abaixo, um alerta será exibido.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="ebitdaTarget"
                  type="number"
                  step="0.1"
                  value={ebitdaTargetStr}
                  onChange={(e) => setEbitdaTargetStr(e.target.value)}
                  onBlur={handleEbitdaTargetBlur}
                  placeholder="Ex: 15"
                />
              </div>
              <div className="space-y-2">
                <Label>Faturamento Bruto (Projetado 12m)</Label>
                <Input
                  value={formatCurrency(pjFat)}
                  readOnly
                  className="bg-slate-50 text-slate-500 font-medium"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 print:grid-cols-5">
          <Card className="shadow-sm border-l-4 border-l-blue-600 print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                Faturamento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(summaryFat.value)}</div>
              <p
                className={cn(
                  'text-xs font-medium flex items-center mt-1',
                  getAhColor(summaryFat.ahPerc, false),
                )}
              >
                {summaryFat.ahPerc > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}{' '}
                {formatPercent(summaryFat.ahPerc)} vs Base
              </p>
            </CardContent>
          </Card>

          <Card
            className={cn(
              'shadow-sm border-l-4 print:shadow-none print:border',
              hasEbitdaAlert ? 'border-l-red-500 border-red-200 bg-red-50' : 'border-l-emerald-500',
            )}
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-500">EBITDA Mensal</CardTitle>
              {hasEbitdaAlert && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    A margem EBITDA atual ({ebitdaMarginVal.toFixed(1)}%) está abaixo da meta
                    estabelecida de {ebitdaTargetNum}%.
                  </TooltipContent>
                </Tooltip>
              )}
            </CardHeader>
            <CardContent>
              <div className={cn('text-xl font-bold', hasEbitdaAlert && 'text-red-700')}>
                {formatCurrency(summaryEbitda.value)}
              </div>
              <p
                className={cn(
                  'text-xs font-medium flex items-center mt-1',
                  hasEbitdaAlert ? 'text-red-600' : getAhColor(summaryEbitda.ahPerc, false),
                )}
              >
                {summaryEbitda.ahPerc > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}{' '}
                {formatPercent(summaryEbitda.ahPerc)} vs Base
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-purple-500 print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">EBIT Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(summaryEbit.value)}</div>
              <p
                className={cn(
                  'text-xs font-medium flex items-center mt-1',
                  getAhColor(summaryEbit.ahPerc, false),
                )}
              >
                {summaryEbit.ahPerc > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}{' '}
                {formatPercent(summaryEbit.ahPerc)} vs Base
              </p>
            </CardContent>
          </Card>

          <Card
            className={cn(
              'shadow-sm border-l-4 print:shadow-none print:border',
              hasEbitdaAlert ? 'border-l-red-500 border-red-200 bg-red-50' : 'border-l-orange-500',
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Margem EBITDA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn('text-xl font-bold', hasEbitdaAlert && 'text-red-700')}>
                {formatPercent(summaryEbitda.avPerc)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Anterior: {formatPercent(summaryEbitda.prevAvPerc)}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-slate-800 print:shadow-none print:border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Status Global</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-start pt-2">
              <span
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-bold border',
                  overallAnalysis.color,
                )}
              >
                {overallAnalysis.label}
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:block">
          <Card className="lg:col-span-3 shadow-md overflow-hidden print:shadow-none print:border-none print:mb-8">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100 hover:bg-blue-100 border-b-2 border-blue-200">
                    <TableHead className="text-[#003366] font-bold py-3">CONTA</TableHead>
                    <TableHead className="text-[#003366] font-bold text-right py-3 w-24">
                      A.V. (%)
                    </TableHead>
                    <TableHead className="text-[#003366] font-bold text-right py-3 w-36">
                      MÉDIA MENSAL
                    </TableHead>
                    <TableHead className="text-[#003366] font-bold text-center py-3 w-20">
                      A.V.
                    </TableHead>
                    <TableHead className="text-[#003366] font-bold text-right py-3 w-24">
                      A.H.
                    </TableHead>
                    <TableHead className="text-[#003366] font-bold text-center py-3 w-28">
                      ANÁLISE
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => {
                    const avInd = row.u6 > 1.0001 ? '>1' : row.u6 < 0.9999 ? '<1' : '=1'
                    const analysis = getAnalysis(row.u6, row.isExpense)
                    const isEbitdaRow = row.name === 'RESULTADO LÍQUIDO (EBITDA)'

                    return (
                      <TableRow
                        key={idx}
                        className={cn(
                          'transition-colors',
                          row.isHeader && 'bg-slate-50 font-bold',
                          row.isSub && 'text-slate-500 text-sm',
                        )}
                      >
                        <TableCell
                          className={cn(
                            'py-2.5',
                            row.isSub && 'pl-8',
                            isEbitdaRow && hasEbitdaAlert && 'text-red-600 font-bold',
                          )}
                        >
                          {row.name}{' '}
                          {isEbitdaRow && hasEbitdaAlert && (
                            <AlertTriangle className="inline w-4 h-4 ml-2 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right py-2.5',
                            isEbitdaRow && hasEbitdaAlert && 'text-red-600 font-medium',
                          )}
                        >
                          {formatPercent(row.avPerc)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right py-2.5 font-medium',
                            isEbitdaRow && hasEbitdaAlert && 'text-red-600',
                          )}
                        >
                          {formatCurrency(row.value)}
                        </TableCell>
                        <TableCell className="text-center py-2.5 text-slate-600">{avInd}</TableCell>
                        <TableCell className="text-right py-2.5 font-medium">
                          <span className={getAhColor(row.ahPerc, row.isExpense)}>
                            {formatPercent(row.ahPerc)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-2.5">
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-bold border print:border-slate-300 print:text-black print:bg-transparent',
                              analysis.color,
                            )}
                          >
                            {analysis.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="space-y-6 print:block print:w-full print:mt-8 print:break-inside-avoid">
            <Card className="shadow-md print:shadow-none border-t-4 border-t-[#003366]">
              <CardHeader className="pb-2 bg-blue-50/30">
                <CardTitle className="text-base text-[#003366]">Evolução de Indicadores</CardTitle>
                <CardDescription>
                  {isProjetado ? 'Atual vs Projetado' : 'Anterior vs Atual'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                      width={60}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="Anterior" fill="var(--color-Anterior)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Atual" fill="var(--color-Atual)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-blue-50 border-blue-100 print:hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#003366] flex items-center">
                  <Info className="w-5 h-5 mr-2" /> Dicas de Interpretação
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-3">
                <p>
                  <strong>A.V. (Análise Vertical):</strong> Avalia a representatividade da conta
                  sobre o Faturamento Bruto.
                </p>
                <p>
                  <strong>A.H. (Análise Horizontal):</strong> Mede o crescimento ou queda em relação
                  ao período base.
                </p>
                <p>
                  <strong>Status (ANÁLISE):</strong> 'BOM' para aumento de margens/receitas ou queda
                  de despesas relativas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-md border-t-4 border-t-[#003366] print:hidden">
          <CardHeader className="bg-blue-50/50 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#003366]" />
                <CardTitle className="text-[#003366] text-lg">HISTÓRICO DE ANÁLISES</CardTitle>
              </div>
              <Button
                variant="outline"
                onClick={() => setCompareOpen(true)}
                disabled={selectedReports.length !== 2}
                className="border-[#003366] text-[#003366]"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" /> Comparar Selecionados
              </Button>
            </div>
            <CardDescription>Relatórios gerados anteriormente ficam salvos aqui.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loadingHistory ? (
              <div className="p-8 flex justify-center items-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Carregando...
              </div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum relatório salvo no histórico ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-2">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-bold text-slate-600">Data de Geração</TableHead>
                    <TableHead className="font-bold text-slate-600">Nome do Relatório</TableHead>
                    <TableHead className="font-bold text-slate-600">Cenário</TableHead>
                    <TableHead className="font-bold text-slate-600 text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow
                      key={record.id}
                      className={selectedReports.includes(record.id) ? 'bg-blue-50/30' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedReports.includes(record.id)}
                          onCheckedChange={() => toggleReportSelection(record.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">
                        {new Date(record.created).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>{record.nome_relatorio}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            record.tipo_cenario === 'Projetado'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200',
                          )}
                        >
                          {record.tipo_cenario}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:bg-slate-100"
                          onClick={() => {
                            setReportToSend(record.id)
                            setEmailDialogOpen(true)
                          }}
                        >
                          <Mail className="w-4 h-4 mr-2" /> Enviar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#003366] hover:bg-blue-50"
                          asChild
                        >
                          <a
                            href={pb.files.getUrl(record, record.arquivo_pdf)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            <Download className="w-4 h-4 mr-2" /> Baixar
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {renderComparisonDialog()}

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Relatório por E-mail</DialogTitle>
            <DialogDescription>
              Insira o endereço de e-mail do destinatário para compartilhar este relatório PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="email">E-mail do Destinatário</Label>
            <Input
              id="email"
              type="email"
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
              placeholder="exemplo@email.com"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!emailRecipient || isSendingEmail}
              className="bg-[#003366] hover:bg-[#002244] text-white"
            >
              {isSendingEmail && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
