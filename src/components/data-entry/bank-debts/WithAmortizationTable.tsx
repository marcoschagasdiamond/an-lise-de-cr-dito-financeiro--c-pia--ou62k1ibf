import { useState, useEffect, useRef } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2, Eraser, Plus } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

type RowData = {
  id?: string
  rowIndex: number
  institution: string
  contractedValue: string
  amortizationSystem: string
  paymentModality: string
  totalPeriods: string
  gracePeriod: string
  remainingPeriods: string
  interestRate: string
  indexer: string
  annualEstimate: string
}

const emptyRow = {
  institution: '',
  contractedValue: '',
  amortizationSystem: '',
  paymentModality: '',
  totalPeriods: '',
  gracePeriod: '',
  remainingPeriods: '',
  interestRate: '',
  indexer: '',
  annualEstimate: '',
}

export function WithAmortizationTable() {
  const [rows, setRows] = useState<RowData[]>([])
  const [indexerRates, setIndexerRates] = useState<Record<string, number>>({})
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const { toast } = useToast()

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await pb.send('/backend/v1/fetch-indexer-rates', { method: 'GET' })
        setIndexerRates(res)
      } catch (err) {
        console.error('Failed to fetch indexer rates', err)
      }
    }
    fetchRates()
  }, [])

  const loadData = async () => {
    try {
      const records = await pb.collection('bank_debts_amortization').getFullList()
      const maxRowIndex = Math.max(11, ...records.map((r) => r.rowIndex || 0))
      const newRows = Array.from({ length: maxRowIndex + 1 }).map((_, i) => ({
        rowIndex: i,
        ...emptyRow,
      }))

      records.forEach((r) => {
        const idx = r.rowIndex || 0
        newRows[idx] = {
          id: r.id,
          rowIndex: idx,
          institution: r.institution || '',
          contractedValue: r.contractedValue ? r.contractedValue.toString() : '',
          amortizationSystem: r.amortizationSystem || '',
          paymentModality: r.paymentModality || '',
          totalPeriods: r.totalPeriods ? r.totalPeriods.toString() : '',
          gracePeriod: r.gracePeriod ? r.gracePeriod.toString() : '',
          remainingPeriods: r.remainingPeriods ? r.remainingPeriods.toString() : '',
          interestRate:
            r.interestRate !== null && r.interestRate !== undefined
              ? parseFloat((r.interestRate * 100).toFixed(6)).toString() + '%'
              : '',
          indexer: r.indexer || '',
          annualEstimate: r.annualEstimate ? r.annualEstimate.toString() : '',
        }
      })
      setRows(newRows)
    } catch (e) {
      console.error('Failed to load records', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('bank_debts_amortization', () => {
    loadData()
  })

  const getMonthlyEffectiveRate = (row: RowData) => {
    const annualEst = parseFloat(row.annualEstimate) || 0
    return Number.isNaN(annualEst) ? 0 : annualEst / 12
  }

  const getMonthlyPayment = (row: RowData) => {
    const pv = parseFloat(row.contractedValue) || 0
    const n = parseFloat(row.totalPeriods) || 0
    const rate = getMonthlyEffectiveRate(row) / 100

    if (n === 0 || Number.isNaN(n)) return 0
    if (rate === 0 || Number.isNaN(rate)) return pv / n
    const pmt = (pv * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1)
    return Number.isNaN(pmt) || !Number.isFinite(pmt) ? 0 : pmt
  }

  const formatCurrencyDisplay = (val: number) => {
    if (Number.isNaN(val)) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const handleAddRow = async () => {
    if (!pb.authStore.isValid) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Usuário não está autenticado.',
      })
      return
    }
    const newIndex = rows.length
    try {
      const record = await pb.collection('bank_debts_amortization').create({
        rowIndex: newIndex,
        institution: '',
        contractedValue: null,
        totalPeriods: null,
        gracePeriod: null,
        remainingPeriods: null,
        interestRate: null,
        annualEstimate: null,
        monthlyEffectiveRate: null,
        monthlyPayment: null,
      })

      await pb.collection('debt_composition').create({
        tableType: 'amortization',
        sourceId: record.id,
        rowIndex: newIndex,
        col0: '',
        col1: '',
        col2: '',
        col3: '',
        col4: '',
        col5: '',
      })
      await pb.collection('debt_composition').create({
        tableType: 'interest',
        sourceId: record.id,
        rowIndex: newIndex,
        col0: '',
        col1: '',
        col2: '',
        col3: '',
        col4: '',
        col5: '',
      })

      setRows([...rows, { ...emptyRow, rowIndex: newIndex, id: record.id }])
    } catch (e) {
      console.error(e)
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar linha',
        description: getErrorMessage(e),
      })
    }
  }

  const handleDelete = async (index: number, id?: string) => {
    if (!pb.authStore.isValid) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Usuário não está autenticado.',
      })
      return
    }
    try {
      if (id) {
        const derived = await pb
          .collection('debt_composition')
          .getFullList({ filter: `sourceId='${id}'` })
        for (const d of derived) {
          await pb.collection('debt_composition').delete(d.id)
        }
        await pb.collection('bank_debts_amortization').delete(id)
      }

      const shiftAmort = await pb.collection('bank_debts_amortization').getFullList({
        filter: `rowIndex > ${index}`,
      })
      for (const r of shiftAmort) {
        await pb.collection('bank_debts_amortization').update(r.id, { rowIndex: r.rowIndex - 1 })
      }

      const newRows = [...rows]
      newRows.splice(index, 1)
      if (newRows.length < 12) {
        newRows.push({ ...emptyRow, rowIndex: newRows.length })
      }
      newRows.forEach((r, i) => (r.rowIndex = i))
      setRows(newRows)
    } catch (e) {
      console.error(e)
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir linha',
        description: getErrorMessage(e),
      })
    }
  }

  const handleClear = async () => {
    if (!pb.authStore.isValid) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Usuário não está autenticado.',
      })
      return
    }
    if (
      confirm('Tem certeza que deseja limpar estes dados e as tabelas de composição derivadas?')
    ) {
      try {
        const records = await pb.collection('bank_debts_amortization').getFullList()
        for (const r of records) {
          const derived = await pb
            .collection('debt_composition')
            .getFullList({ filter: `sourceId='${r.id}'` })
          for (const d of derived) {
            await pb.collection('debt_composition').delete(d.id)
          }
          await pb.collection('bank_debts_amortization').delete(r.id)
        }
        const newRows = Array.from({ length: 12 }).map((_, i) => ({ rowIndex: i, ...emptyRow }))
        setRows(newRows)
      } catch (e) {
        console.error(e)
        toast({
          variant: 'destructive',
          title: 'Erro ao limpar dados',
          description: getErrorMessage(e),
        })
      }
    }
  }

  const updateRow = (index: number, field: keyof RowData, value: any) => {
    const newRows = [...rows]
    const row = { ...newRows[index], [field]: value }

    if (field === 'indexer' && indexerRates[value] !== undefined) {
      row.annualEstimate = indexerRates[value].toString()
    }

    newRows[index] = row
    setRows(newRows)

    if (debounceTimers.current[index]) {
      clearTimeout(debounceTimers.current[index])
    }

    debounceTimers.current[index] = setTimeout(async () => {
      try {
        if (!pb.authStore.isValid) {
          toast({
            variant: 'destructive',
            title: 'Erro de Autenticação',
            description: 'Usuário não está autenticado.',
          })
          return
        }

        const valContracted = parseFloat(row.contractedValue)
        const valTotalPeriods = parseFloat(row.totalPeriods)
        const valGracePeriod = parseFloat(row.gracePeriod)
        const valRemainingPeriods = parseFloat(row.remainingPeriods)
        let parsedInterest = parseFloat((row.interestRate || '').replace(',', '.').replace('%', ''))
        if (!Number.isNaN(parsedInterest) && !(row.interestRate || '').includes('%')) {
          if (Math.abs(parsedInterest) > 0 && Math.abs(parsedInterest) < 1) {
            parsedInterest = parsedInterest * 100
          }
        }
        const valInterestRate = Number.isNaN(parsedInterest) ? null : parsedInterest / 100
        const valAnnualEstimate = parseFloat(row.annualEstimate)
        const mRate = getMonthlyEffectiveRate(row)
        const mPayment = getMonthlyPayment(row)

        const payload = {
          rowIndex: index,
          institution: row.institution || '',
          contractedValue: Number.isNaN(valContracted) ? null : valContracted,
          amortizationSystem: row.amortizationSystem || '',
          paymentModality: row.paymentModality || '',
          totalPeriods: Number.isNaN(valTotalPeriods) ? null : valTotalPeriods,
          gracePeriod: Number.isNaN(valGracePeriod) ? null : valGracePeriod,
          remainingPeriods: Number.isNaN(valRemainingPeriods) ? null : valRemainingPeriods,
          interestRate: valInterestRate,
          indexer: row.indexer || '',
          annualEstimate: Number.isNaN(valAnnualEstimate) ? null : valAnnualEstimate,
          monthlyEffectiveRate: Number.isNaN(mRate) ? null : mRate,
          monthlyPayment: Number.isNaN(mPayment) || !Number.isFinite(mPayment) ? null : mPayment,
        }

        if (row.id) {
          await pb.collection('bank_debts_amortization').update(row.id, payload)
        } else if (row.institution || (payload.contractedValue && payload.contractedValue > 0)) {
          const record = await pb.collection('bank_debts_amortization').create(payload)

          await pb.collection('debt_composition').create({
            tableType: 'amortization',
            sourceId: record.id,
            rowIndex: index,
            col0: '',
            col1: '',
            col2: '',
            col3: '',
            col4: '',
            col5: '',
          })
          await pb.collection('debt_composition').create({
            tableType: 'interest',
            sourceId: record.id,
            rowIndex: index,
            col0: '',
            col1: '',
            col2: '',
            col3: '',
            col4: '',
            col5: '',
          })

          setRows((current) => {
            const latest = [...current]
            if (latest[index]) {
              latest[index].id = record.id
            }
            return latest
          })
        }
      } catch (e) {
        console.error('Error saving row:', e)
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: getErrorMessage(e) })
      }
    }, 800)
  }

  return (
    <div className="space-y-0 mt-8 animate-fade-in-up">
      <div className="bg-slate-100 dark:bg-slate-900 p-2 border border-slate-300 dark:border-slate-700 border-b-0 flex justify-between items-center px-4">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
          ENDIVIDAMENTO BANCÁRIO - COM AMORTIZAÇÃO DA OBRIGAÇÃO PRINCIPAL
        </h4>
      </div>
      <div className="border border-slate-300 dark:border-slate-700 overflow-x-auto shadow-sm bg-white dark:bg-slate-950">
        <Table className="border-collapse w-full min-w-[1450px]">
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                INSTITUIÇÃO FINANCEIRA
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    VALOR CONTRATADO
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Valor total do contrato de financiamento</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    SIST. DE AMORTIZ.
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sistema de amortização utilizado (SAC, Price, etc.)</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    MODALIDADE DE PAGAMENTO
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Forma de pagamento (ANTECIPADO se for a 1º parcela no ato; POSTECIPADO se 1º
                      parcela após um período)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                colSpan={3}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 border-b border-white/20 h-8 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    Nº DE PERÍODOS (PRESTAÇÕES)
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Número total de períodos/prestações</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    TAXA DE JUROS CONTR.
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Taxa de juros efetivos contratada</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    INDEXADOR OFICIAL
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Índice de correção monetária (SELIC, TR, IGP-M, IPCA, CDI)</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    ESTIMATIVA ANUAL INDEXADOR
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Estimativa anual do indexador selecionado</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    % EFETIVA MENSAL TOTAL
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentual efetivo mensal total</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle"
              >
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    PRESTAÇÃO MENSAL C/ AMORTIZAÇÃO
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Valor da prestação mensal com amortização</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead
                rowSpan={2}
                className="text-white font-bold border-transparent text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle w-[60px]"
              >
                AÇÕES
              </TableHead>
            </TableRow>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 h-8 align-middle">
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    TOTAIS
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de Período do contrato (PRAZO)incluindo os períodos</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 h-8 align-middle">
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    CARÊNCIA
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Período de carência antes do início dos pagamentos</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-white font-bold border-r border-white/20 text-center text-[10px] md:text-xs whitespace-nowrap px-2 h-8 align-middle">
                <Tooltip>
                  <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                    REST. A PAGAR
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Saldo restante a pagar</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={row.id || i}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
              >
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    className="border-0 rounded-none h-8 text-left px-2 focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium"
                    placeholder=""
                    value={row.institution}
                    onChange={(e) => updateRow(i, 'institution', e.target.value)}
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    type="text"
                    className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium"
                    placeholder="-"
                    value={row.contractedValue}
                    onChange={(e) =>
                      updateRow(i, 'contractedValue', e.target.value.replace(/[^0-9.,]/g, ''))
                    }
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle px-1">
                  <Select
                    value={row.amortizationSystem || undefined}
                    onValueChange={(v) => updateRow(i, 'amortizationSystem', v)}
                  >
                    <SelectTrigger className="border-0 bg-transparent h-8 shadow-none focus:ring-1 text-xs justify-center text-center font-medium">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Price">Price</SelectItem>
                      <SelectItem value="SAC">SAC</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle px-1">
                  <Select
                    value={row.paymentModality || undefined}
                    onValueChange={(v) => updateRow(i, 'paymentModality', v)}
                  >
                    <SelectTrigger className="border-0 bg-transparent h-8 shadow-none focus:ring-1 text-xs justify-center text-center font-medium">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Antecipado">Antecipado</SelectItem>
                      <SelectItem value="Postecipado">Postecipado</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    type="text"
                    className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium"
                    placeholder="-"
                    value={row.totalPeriods}
                    onChange={(e) =>
                      updateRow(i, 'totalPeriods', e.target.value.replace(/[^0-9.,]/g, ''))
                    }
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    type="text"
                    className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium"
                    placeholder="-"
                    value={row.gracePeriod}
                    onChange={(e) =>
                      updateRow(i, 'gracePeriod', e.target.value.replace(/[^0-9.,]/g, ''))
                    }
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    type="text"
                    className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium"
                    placeholder="-"
                    value={row.remainingPeriods}
                    onChange={(e) =>
                      updateRow(i, 'remainingPeriods', e.target.value.replace(/[^0-9.,]/g, ''))
                    }
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium pr-6"
                      placeholder="-"
                      value={row.interestRate}
                      onChange={(e) =>
                        updateRow(i, 'interestRate', e.target.value.replace(/[^0-9.,%]/g, ''))
                      }
                      onBlur={(e) => {
                        const val = e.target.value.trim()
                        if (val && !val.endsWith('%')) {
                          let num = parseFloat(val.replace(',', '.'))
                          if (!Number.isNaN(num)) {
                            if (Math.abs(num) > 0 && Math.abs(num) < 1) {
                              num = num * 100
                            }
                            updateRow(
                              i,
                              'interestRate',
                              parseFloat(num.toFixed(6)).toString() + '%',
                            )
                          }
                        }
                      }}
                    />
                    {row.interestRate && row.contractedValue && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute right-1 w-4 h-4 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[9px] cursor-help font-bold text-slate-600 dark:text-slate-300">
                            i
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Impacto: R${' '}
                            {(
                              (parseFloat(row.contractedValue.replace(',', '.')) || 0) *
                              (parseFloat(row.interestRate.replace(',', '.').replace('%', '')) /
                                100 || 0)
                            ).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            / período
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle px-1">
                  <Select
                    value={row.indexer || undefined}
                    onValueChange={(v) => updateRow(i, 'indexer', v)}
                  >
                    <SelectTrigger className="border-0 bg-transparent h-8 shadow-none focus:ring-1 text-xs justify-center text-center font-medium">
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SELIC">SELIC</SelectItem>
                      <SelectItem value="TR">TR</SelectItem>
                      <SelectItem value="IGP-M">IGP-M</SelectItem>
                      <SelectItem value="IPCA">IPCA</SelectItem>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="OUTROS">OUTROS</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    type="text"
                    className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium read-only:bg-slate-50 dark:read-only:bg-slate-800/50"
                    placeholder="-"
                    value={row.annualEstimate}
                    readOnly={row.indexer !== 'OUTROS' && row.indexer !== ''}
                    onChange={(e) =>
                      updateRow(i, 'annualEstimate', e.target.value.replace(/[^0-9.,]/g, ''))
                    }
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle text-center text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/20">
                  {getMonthlyEffectiveRate(row).toFixed(2)}%
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle text-center text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                  {formatCurrencyDisplay(getMonthlyPayment(row))}
                </TableCell>
                <TableCell className="p-1 align-middle text-center">
                  {row.id ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(i, row.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-2 border-t border-slate-300 dark:border-slate-700 flex justify-end gap-2 px-4">
          <Button
            onClick={handleAddRow}
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 border-slate-300/50 bg-white dark:bg-slate-950 h-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            Incluir Linha
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-slate-300/50 bg-white dark:bg-slate-950 h-8"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Limpar Dados
          </Button>
        </div>
      </div>
    </div>
  )
}
