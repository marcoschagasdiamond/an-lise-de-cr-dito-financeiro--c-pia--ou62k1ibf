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
import { Button } from '@/components/ui/button'
import { Eraser, Plus, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const BANK_COLUMNS = [
  { label: 'INSTITUIÇÃO FINANCEIRA / DESCRIÇÃO', tooltip: null },
  {
    label: 'LIMITE DE CRÉDITO',
    tooltip: 'Limite de crédito concedido pela instituição financeira',
  },
  { label: 'TAXA DE JUROS MENSAL', tooltip: 'Taxa de juros mensal cobrada pela instituição' },
  {
    label: 'MÉDIA MENSAL SALDO DEVEDOR',
    tooltip: 'Média mensal do limite utilizado, para base de cálculo dos juros pagos',
  },
]

type RowData = {
  id?: string
  rowIndex: number
  creditor: string
  col0: string
  col1: string
  col2: string
}

const emptyRow = { creditor: '', col0: '', col1: '', col2: '' }

export function WithoutAmortizationTable() {
  const [rows, setRows] = useState<RowData[]>([])
  const rowsRef = useRef<RowData[]>([])
  rowsRef.current = rows
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const records = await pb.collection('debt_composition').getFullList({
        filter: `tableType='without_amortization'`,
      })
      const maxRowIndex = Math.max(9, ...records.map((r) => r.rowIndex || 0))
      const newRows = Array.from({ length: maxRowIndex + 1 }).map((_, i) => ({
        rowIndex: i,
        ...emptyRow,
      }))

      records.forEach((r) => {
        const idx = r.rowIndex || 0
        let formattedCol1 = r.col1 || ''
        if (formattedCol1 && !formattedCol1.includes('%')) {
          const num = parseFloat(formattedCol1.replace(',', '.'))
          if (!Number.isNaN(num)) {
            formattedCol1 = parseFloat((num * 100).toFixed(6)).toString() + '%'
          }
        }

        newRows[idx] = {
          id: r.id,
          rowIndex: idx,
          creditor: r.creditor || '',
          col0: r.col0 || '',
          col1: formattedCol1,
          col2: r.col2 || '',
        }
      })

      setRows((prev) => {
        if (prev.length === 0) return newRows
        return newRows.map((nr, i) => {
          if (debounceTimers.current[nr.rowIndex]) {
            return prev[i] || nr
          }
          return nr
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('debt_composition', () => {
    loadData()
  })

  const updateRow = (index: number, field: keyof RowData, val: string) => {
    setRows((prev) => {
      const newRows = [...prev]
      newRows[index] = { ...newRows[index], [field]: val }
      return newRows
    })

    if (debounceTimers.current[index]) clearTimeout(debounceTimers.current[index])

    debounceTimers.current[index] = setTimeout(async () => {
      if (!pb.authStore.isValid) {
        toast({
          variant: 'destructive',
          title: 'Erro de Autenticação',
          description: 'Usuário não está autenticado.',
        })
        delete debounceTimers.current[index]
        return
      }

      const currentRow = rowsRef.current[index]
      if (!currentRow) {
        delete debounceTimers.current[index]
        return
      }

      let savedCol1 = currentRow.col1 || ''
      if (savedCol1) {
        let num = parseFloat(savedCol1.replace(',', '.').replace('%', ''))
        if (!Number.isNaN(num)) {
          if (!savedCol1.includes('%') && Math.abs(num) > 0 && Math.abs(num) < 1) {
            num = num * 100
          }
          savedCol1 = (num / 100).toString()
        }
      }

      const payload = {
        tableType: 'without_amortization',
        rowIndex: currentRow.rowIndex,
        creditor: currentRow.creditor || '',
        col0: currentRow.col0 || '',
        col1: savedCol1,
        col2: currentRow.col2 || '',
        col3: '',
        col4: '',
        col5: '',
      }
      try {
        if (currentRow.id) {
          await pb.collection('debt_composition').update(currentRow.id, payload)
        } else if (currentRow.creditor || currentRow.col0 || currentRow.col1 || currentRow.col2) {
          const res = await pb.collection('debt_composition').create(payload)

          await pb.collection('debt_composition').create({
            tableType: 'amortization',
            sourceId: res.id,
            rowIndex: currentRow.rowIndex,
            col0: '',
            col1: '',
            col2: '',
            col3: '',
            col4: '',
            col5: '',
          })
          await pb.collection('debt_composition').create({
            tableType: 'interest',
            sourceId: res.id,
            rowIndex: currentRow.rowIndex,
            col0: '',
            col1: '',
            col2: '',
            col3: '',
            col4: '',
            col5: '',
          })

          setRows((cur) => {
            const n = [...cur]
            if (n[index] && !n[index].id) n[index].id = res.id
            return n
          })
        }
      } catch (e) {
        console.error('Error saving row:', e)
        toast({
          variant: 'destructive',
          title: 'Erro ao salvar',
          description: getErrorMessage(e),
        })
      } finally {
        delete debounceTimers.current[index]
      }
    }, 800)
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
      const record = await pb.collection('debt_composition').create({
        tableType: 'without_amortization',
        rowIndex: newIndex,
        creditor: '',
        col0: '',
        col1: '',
        col2: '',
        col3: '',
        col4: '',
        col5: '',
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
        await pb.collection('debt_composition').delete(id)
      }

      const shift = await pb.collection('debt_composition').getFullList({
        filter: `tableType='without_amortization' && rowIndex > ${index}`,
      })
      for (const r of shift) {
        await pb.collection('debt_composition').update(r.id, { rowIndex: r.rowIndex - 1 })
      }

      const newRows = [...rows]
      newRows.splice(index, 1)
      while (newRows.length < 10) {
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
    if (confirm('Tem certeza que deseja limpar estes dados?')) {
      try {
        const records = await pb.collection('debt_composition').getFullList({
          filter: `tableType='without_amortization'`,
        })
        for (const r of records) {
          const derived = await pb
            .collection('debt_composition')
            .getFullList({ filter: `sourceId='${r.id}'` })
          for (const d of derived) {
            await pb.collection('debt_composition').delete(d.id)
          }
          await pb.collection('debt_composition').delete(r.id)
        }
        const newRows = Array.from({ length: 10 }).map((_, i) => ({ rowIndex: i, ...emptyRow }))
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

  return (
    <div className="space-y-0 mt-6 animate-fade-in-up">
      <div className="bg-slate-100 dark:bg-slate-900 p-2 border border-slate-300 dark:border-slate-700 border-b-0 flex justify-between items-center px-4">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
          ENDIVIDAMENTO BANCÁRIO - SEM QUITAÇÃO DA OBRIGAÇÃO PRINCIPAL
        </h4>
      </div>
      <div className="border border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-950">
        <Table className="border-collapse w-full min-w-[800px]">
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              {BANK_COLUMNS.map((col) => (
                <TableHead
                  key={col.label}
                  className="text-white font-bold border-r border-white/20 last:border-r-0 text-center text-[10px] md:text-xs whitespace-nowrap px-2 h-10 align-middle"
                >
                  {col.tooltip ? (
                    <Tooltip>
                      <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                        {col.label}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{col.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
              <TableHead className="text-white font-bold border-transparent text-center text-[10px] md:text-xs whitespace-nowrap px-2 align-middle w-[60px]">
                AÇÕES
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
                    value={row.creditor}
                    onChange={(e) => updateRow(i, 'creditor', e.target.value)}
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    type="text"
                    className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium"
                    placeholder="-"
                    value={row.col0}
                    onChange={(e) => updateRow(i, 'col0', e.target.value.replace(/[^0-9.,]/g, ''))}
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium pr-6"
                      placeholder="-"
                      value={row.col1}
                      onChange={(e) =>
                        updateRow(i, 'col1', e.target.value.replace(/[^0-9.,%]/g, ''))
                      }
                      onBlur={(e) => {
                        const val = e.target.value.trim()
                        if (val && !val.endsWith('%')) {
                          let num = parseFloat(val.replace(',', '.'))
                          if (!Number.isNaN(num)) {
                            if (Math.abs(num) > 0 && Math.abs(num) < 1) {
                              num = num * 100
                            }
                            updateRow(i, 'col1', parseFloat(num.toFixed(6)).toString() + '%')
                          }
                        }
                      }}
                    />
                    {row.col1 && row.col2 && (
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
                              (parseFloat(row.col2.replace(',', '.')) || 0) *
                              (parseFloat(row.col1.replace(',', '.').replace('%', '')) / 100 || 0)
                            ).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            / mês
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-0 border-r border-slate-200 dark:border-slate-800 align-middle">
                  <Input
                    type="text"
                    className="border-0 rounded-none h-8 text-center focus-visible:ring-1 focus-visible:ring-inset bg-transparent font-medium"
                    placeholder="-"
                    value={row.col2}
                    onChange={(e) => updateRow(i, 'col2', e.target.value.replace(/[^0-9.,]/g, ''))}
                  />
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
