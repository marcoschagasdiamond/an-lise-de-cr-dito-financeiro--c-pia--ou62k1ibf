import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'

const COMPOSITION_COLUMNS = [
  '<= 90 DIAS',
  '90 A 180 DIAS',
  '180 A 360 DIAS',
  '1 A 2 ANOS',
  '2 A 3 ANOS',
  '> 3 ANOS',
]

const ACCUMULATED_HEADERS = [
  'ATÉ 90 DIAS',
  'ATÉ 6 MESES',
  'ATÉ 1 ANO',
  'ATÉ 2 ANOS',
  'ATÉ 3 ANOS',
  'TOTAL',
]

type RowData = {
  id?: string
  sourceId: string
  rowIndex: number
  credor: string
  cols: string[]
}

export function CompositionTable({ title, tableType }: { title: string; tableType: string }) {
  const [rows, setRows] = useState<RowData[]>([])
  const rowsRef = useRef<RowData[]>([])
  rowsRef.current = rows
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const { toast } = useToast()

  const isReadOnly = tableType === 'interest'

  const loadData = async () => {
    try {
      const [withoutAmort, withAmort, diverse, derived] = await Promise.all([
        pb
          .collection('debt_composition')
          .getFullList({ filter: `tableType='without_amortization'` }),
        pb.collection('bank_debts_amortization').getFullList(),
        pb.collection('debt_composition').getFullList({ filter: `tableType='diverse'` }),
        pb.collection('debt_composition').getFullList({ filter: `tableType='${tableType}'` }),
      ])

      const sources = [
        ...withoutAmort.map((s) => ({
          id: s.id,
          creditor: s.creditor || '',
          type: 'without',
          rowIndex: s.rowIndex || 0,
        })),
        ...withAmort.map((s) => ({
          id: s.id,
          creditor: s.institution || '',
          type: 'with',
          rowIndex: s.rowIndex || 0,
        })),
        ...diverse.map((s) => ({
          id: s.id,
          creditor: s.creditor || '',
          type: 'diverse',
          rowIndex: s.rowIndex || 0,
        })),
      ]

      sources.sort((a, b) => {
        const typeOrder: Record<string, number> = { without: 1, with: 2, diverse: 3 }
        if (typeOrder[a.type] !== typeOrder[b.type]) return typeOrder[a.type] - typeOrder[b.type]
        return a.rowIndex - b.rowIndex
      })

      const newRows = sources.map((source, index) => {
        const der = derived.find((d) => d.sourceId === source.id)

        let cols = der
          ? [
              der.col0 || '',
              der.col1 || '',
              der.col2 || '',
              der.col3 || '',
              der.col4 || '',
              der.col5 || '',
            ]
          : ['', '', '', '', '', '']

        if (tableType === 'interest') {
          if (source.type === 'with') {
            const bankDebt = withAmort.find((d) => d.id === source.id)
            if (bankDebt) {
              const P = bankDebt.contractedValue || 0
              const PMT = bankDebt.monthlyPayment || 0
              const N = bankDebt.totalPeriods || 0
              const remN = bankDebt.remainingPeriods || 0

              if (P > 0 && PMT > 0 && N > 0) {
                const basePrincipal = P / N
                let baseMonthlyInterest = PMT - basePrincipal
                if (baseMonthlyInterest < 0) baseMonthlyInterest = 0

                const currentBalance = remN * basePrincipal
                const factor = P > 0 ? currentBalance / P : 0

                const m0 = Math.min(remN, 3)
                const m1 = Math.max(0, Math.min(remN - 3, 3))
                const m2 = Math.max(0, Math.min(remN - 6, 6))
                const m3 = Math.max(0, Math.min(remN - 12, 12))
                const m4 = Math.max(0, Math.min(remN - 24, 12))
                const m5 = Math.max(0, remN - 36)

                const calcInterest = (months: number) => {
                  if (months <= 0) return 0
                  return baseMonthlyInterest * months * factor
                }

                const formatVal = (val: number) =>
                  val === 0 ? '0' : val.toFixed(2).replace('.', ',')

                cols = [
                  formatVal(calcInterest(m0)),
                  formatVal(calcInterest(m1)),
                  formatVal(calcInterest(m2)),
                  formatVal(calcInterest(m3)),
                  formatVal(calcInterest(m4)),
                  formatVal(calcInterest(m5)),
                ]
              } else {
                cols = ['0', '0', '0', '0', '0', '0']
              }
            } else {
              cols = ['0', '0', '0', '0', '0', '0']
            }
          } else {
            cols = ['0', '0', '0', '0', '0', '0']
          }
        }

        return {
          id: der?.id,
          sourceId: source.id,
          rowIndex: der?.rowIndex || index,
          credor: source.creditor || '',
          cols,
        }
      })

      setRows((prev) => {
        if (prev.length === 0) return newRows
        return newRows.map((nr, i) => {
          if (timers.current[i]) return prev[i] || nr
          return nr
        })
      })
    } catch (e) {
      console.error('Failed to load table data', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [tableType])

  useRealtime('debt_composition', () => {
    loadData()
  })

  useRealtime('bank_debts_amortization', () => {
    loadData()
  })

  const clearData = async () => {
    if (confirm('Tem certeza que deseja limpar os valores desta tabela?')) {
      try {
        const derived = await pb.collection('debt_composition').getFullList({
          filter: `tableType = '${tableType}'`,
        })
        await Promise.all(
          derived.map((r) =>
            pb.collection('debt_composition').update(r.id, {
              col0: '',
              col1: '',
              col2: '',
              col3: '',
              col4: '',
              col5: '',
            }),
          ),
        )
        await loadData()
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

  const updateRow = (idx: number, field: 'credor' | number, val: string) => {
    if (field === 'credor' || isReadOnly) return

    setRows((prev) => {
      const newRows = prev.map((r, i) => {
        if (i !== idx) return r
        const cols = [...r.cols]
        cols[field as number] = val
        return { ...r, cols }
      })
      return newRows
    })

    if (timers.current[idx]) clearTimeout(timers.current[idx])

    timers.current[idx] = setTimeout(async () => {
      const currentRow = rowsRef.current[idx]
      if (!currentRow) {
        delete timers.current[idx]
        return
      }

      const payload = {
        tableType,
        sourceId: currentRow.sourceId,
        rowIndex: currentRow.rowIndex,
        col0: currentRow.cols[0] || '',
        col1: currentRow.cols[1] || '',
        col2: currentRow.cols[2] || '',
        col3: currentRow.cols[3] || '',
        col4: currentRow.cols[4] || '',
        col5: currentRow.cols[5] || '',
      }
      try {
        if (currentRow.id) {
          await pb.collection('debt_composition').update(currentRow.id, payload)
        } else {
          const res = await pb.collection('debt_composition').create(payload)
          setRows((cur) => {
            const n = [...cur]
            if (n[idx] && !n[idx].id) n[idx].id = res.id
            return n
          })
        }
      } catch (e) {
        console.error('Error saving row:', e)
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: getErrorMessage(e) })
      } finally {
        delete timers.current[idx]
      }
    }, 800)
  }

  const getNum = (val: string) => {
    if (!val) return 0
    let clean = val.trim()
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.')
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.')
    }
    const parsed = parseFloat(clean)
    return isNaN(parsed) ? 0 : parsed
  }

  const formatCurrency = (val: number) => {
    if (val === 0) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const rowTotals = useMemo(
    () => rows.map((r) => r.cols.reduce((a, c) => a + getNum(c), 0)),
    [rows],
  )

  const colTotals = useMemo(() => {
    const totals = Array(6).fill(0)
    rows.forEach((r) => r.cols.forEach((c, i) => (totals[i] += getNum(c))))
    return totals
  }, [rows])

  const grandTotal = colTotals.reduce((a, b) => a + b, 0)

  const accBalances = useMemo(() => {
    let current = 0
    return colTotals.map((v) => (current += v))
  }, [colTotals])

  if (rows.length === 0) {
    return (
      <div className="border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950 shadow-sm mt-8 animate-fade-in p-8 text-center text-slate-500 rounded-lg">
        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-2">
          {title}
        </h4>
        Nenhum registro de endividamento encontrado. Preencha as tabelas de origem para visualizar a
        composição.
      </div>
    )
  }

  return (
    <div className="border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950 shadow-sm mt-8 animate-fade-in">
      <div className="bg-slate-100 dark:bg-slate-900 p-2 text-center border-b border-slate-300 dark:border-slate-700 flex justify-between items-center px-4">
        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 uppercase tracking-wide flex-1">
          {title}
        </h4>
        {!isReadOnly && (
          <Button
            onClick={clearData}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-slate-300/50 bg-white/50 dark:bg-slate-900/50"
            title="Limpar Valores"
          >
            <Eraser className="w-4 h-4 mr-2" /> Limpar Valores
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table className="border-collapse w-full min-w-[1100px]">
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead className="text-white font-bold text-[10px] md:text-[11px] whitespace-nowrap border-r border-white/20 text-center h-10 px-2 uppercase w-64">
                CREDOR(A)
              </TableHead>
              {COMPOSITION_COLUMNS.map((col, idx) => (
                <TableHead
                  key={idx}
                  className="text-white font-bold text-[10px] md:text-[11px] whitespace-nowrap border-r border-white/20 text-center h-10 px-2 uppercase min-w-[120px]"
                >
                  {col}
                </TableHead>
              ))}
              <TableHead className="text-white font-bold text-[10px] md:text-[11px] whitespace-nowrap text-center h-10 px-2 uppercase min-w-[120px]">
                TOTAL
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={row.sourceId}
                className="even:bg-slate-50 odd:bg-white dark:even:bg-slate-900/40 dark:odd:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800"
              >
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    readOnly
                    className="border-0 rounded-none h-7 w-full bg-slate-50 dark:bg-slate-900/50 focus-visible:ring-0 font-medium text-xs px-2 shadow-none text-slate-500 cursor-not-allowed"
                    value={row.credor}
                  />
                </TableCell>
                {row.cols.map((val, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle"
                  >
                    <Input
                      readOnly={isReadOnly}
                      className={cn(
                        'border-0 rounded-none h-7 w-full text-center text-xs shadow-none',
                        isReadOnly
                          ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-500 cursor-not-allowed font-medium'
                          : 'bg-transparent focus-visible:ring-1 focus-visible:ring-inset',
                      )}
                      placeholder={isReadOnly ? '0' : '-'}
                      value={val}
                      onChange={
                        isReadOnly ? undefined : (e) => updateRow(i, colIdx, e.target.value)
                      }
                    />
                  </TableCell>
                ))}
                <TableCell className="p-0 align-middle bg-slate-100 dark:bg-slate-800">
                  <Input
                    readOnly
                    className="border-0 rounded-none h-7 w-full text-center bg-transparent focus-visible:ring-0 font-bold text-slate-800 dark:text-slate-100 text-xs shadow-none cursor-default"
                    value={formatCurrency(rowTotals[i])}
                  />
                </TableCell>
              </TableRow>
            ))}

            <TableRow className="bg-slate-200 dark:bg-slate-800 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
              <TableCell className="p-2 border-r border-slate-300 dark:border-slate-700 text-[#0f2e4a] dark:text-slate-100 text-xs uppercase text-right pr-4">
                TOTAIS POR PERÍODO
              </TableCell>
              {colTotals.map((tot, idx) => (
                <TableCell
                  key={idx}
                  className="p-2 border-r border-slate-300 dark:border-slate-700 text-center text-[#0f2e4a] dark:text-slate-100 text-xs"
                >
                  {formatCurrency(tot)}
                </TableCell>
              ))}
              <TableCell className="p-2 text-center text-[#0f2e4a] dark:text-slate-100 text-xs bg-slate-300 dark:bg-slate-700">
                {formatCurrency(grandTotal)}
              </TableCell>
            </TableRow>

            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none font-bold">
              <TableCell className="p-2 border-r border-white/20" />
              {ACCUMULATED_HEADERS.map((h, idx) => (
                <TableCell
                  key={idx}
                  className="p-2 border-r border-white/20 text-center text-white text-[10px] md:text-[11px] uppercase"
                >
                  {h}
                </TableCell>
              ))}
              <TableCell className="p-2 bg-[#0f2e4a]" />
            </TableRow>

            <TableRow className="bg-slate-200 dark:bg-slate-800 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
              <TableCell className="p-2 border-r border-slate-300 dark:border-slate-700 text-[#0f2e4a] dark:text-slate-100 text-xs uppercase text-right pr-4">
                SALDO ACUMULADO
              </TableCell>
              {accBalances.map((acc, idx) => (
                <TableCell
                  key={idx}
                  className="p-2 border-r border-slate-300 dark:border-slate-700 text-center text-[#0f2e4a] dark:text-slate-100 text-xs"
                >
                  {formatCurrency(acc)}
                </TableCell>
              ))}
              <TableCell className="p-2 text-center text-[#0f2e4a] dark:text-slate-100 text-xs bg-slate-300 dark:bg-slate-700">
                -
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
