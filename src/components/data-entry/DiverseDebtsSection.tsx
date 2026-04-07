import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { ExplanatoryNote } from './ExplanatoryNote'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser, Plus, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const DIVERSE_COLUMNS = [
  { label: 'CREDOR(A)/DESCRIÇÃO', tooltip: 'Nome do credor ou descrição da dívida' },
  {
    label: 'VALOR PRINC. DA DÍVIDA',
    tooltip:
      'Valor principal da dívida quando a negociação/efetivação do acerto com o (a) credor (a)',
  },
  {
    label: 'Nº DE PARCELAS TOTAIS',
    tooltip: 'Número de parcelas quando da negociação do valor principal da dívida',
  },
  {
    label: 'SALDO DEVEDOR PRINC. ATUAL',
    tooltip:
      'Valor da divida proporcional ao n° de prestações restantes a pagar, ou seja, o valor principal da divida dividido pelo n° de parcelas totais multiplicado pelo n° de parcelas a pagar',
  },
  {
    label: 'PRESTAÇÃO MENSAL',
    tooltip:
      'Valor da prestação mensal devida, com ou sem juros. Deve ser igual ou maior que o valor principal da divida dividido pelo n° de parcelas totais',
  },
]

type RowData = {
  id?: string
  rowIndex: number
  creditor: string
  col0: string
  col1: string
  col2: string
  col3: string
}

const emptyRow = { creditor: '', col0: '', col1: '', col2: '', col3: '' }

export function DiverseDebtsSection() {
  const [note, setNote] = useState('')
  const [rows, setRows] = useState<RowData[]>([])
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const records = await pb.collection('debt_composition').getFullList({
        filter: `tableType='diverse'`,
      })
      const maxRowIndex = Math.max(14, ...records.map((r) => r.rowIndex || 0))
      const newRows = Array.from({ length: maxRowIndex + 1 }).map((_, i) => ({
        rowIndex: i,
        ...emptyRow,
      }))

      records.forEach((r) => {
        const idx = r.rowIndex || 0
        newRows[idx] = {
          id: r.id,
          rowIndex: idx,
          creditor: r.creditor || '',
          col0: r.col0 || '',
          col1: r.col1 || '',
          col2: r.col2 || '',
          col3: r.col3 || '',
        }
      })
      setRows(newRows)
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
    const newRows = [...rows]
    const row = { ...newRows[index], [field]: val }
    newRows[index] = row
    setRows(newRows)

    if (debounceTimers.current[index]) clearTimeout(debounceTimers.current[index])

    debounceTimers.current[index] = setTimeout(async () => {
      const payload = {
        tableType: 'diverse',
        rowIndex: index,
        creditor: row.creditor || '',
        col0: row.col0 || '',
        col1: row.col1 || '',
        col2: row.col2 || '',
        col3: row.col3 || '',
        col4: '',
        col5: '',
      }
      try {
        if (row.id) {
          await pb.collection('debt_composition').update(row.id, payload)
        } else if (row.creditor || row.col0 || row.col1 || row.col2 || row.col3) {
          const res = await pb.collection('debt_composition').create(payload)

          await pb.collection('debt_composition').create({
            tableType: 'amortization',
            sourceId: res.id,
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
            sourceId: res.id,
            rowIndex: index,
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
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: getErrorMessage(e) })
      }
    }, 800)
  }

  const handleAddRow = async () => {
    const newIndex = rows.length
    try {
      const record = await pb.collection('debt_composition').create({
        tableType: 'diverse',
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
        filter: `tableType='diverse' && rowIndex > ${index}`,
      })
      for (const r of shift) {
        await pb.collection('debt_composition').update(r.id, { rowIndex: r.rowIndex - 1 })
      }

      const newRows = [...rows]
      newRows.splice(index, 1)
      if (newRows.length < 15) {
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
    if (confirm('Tem certeza que deseja limpar estes dados?')) {
      try {
        const records = await pb.collection('debt_composition').getFullList({
          filter: `tableType='diverse'`,
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
        const newRows = Array.from({ length: 15 }).map((_, i) => ({ rowIndex: i, ...emptyRow }))
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
    <div className="space-y-4 mt-10 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-2xl font-bold text-[#0f2e4a] dark:text-slate-100">
          Endividamento Diversos
        </h3>
      </div>

      <div className="border border-slate-300 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
        <div className="bg-slate-100 dark:bg-slate-900 p-2 text-center border-b border-slate-300 dark:border-slate-700 relative">
          <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            COMPOSIÇÃO DO ENDIVIDAMENTO - DIVERSOS
          </h4>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 border-b border-slate-300 dark:border-slate-700">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide text-center">
            ENDIVIDAMENTO - FISCAL, PARAFISCAL, TRABALHISTA E OUTROS
          </h4>
        </div>
        <div className="overflow-x-auto">
          <Table className="border-collapse w-full min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
                {DIVERSE_COLUMNS.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className="text-white font-bold text-[10px] md:text-xs whitespace-nowrap border-r border-white/20 last:border-0 text-center h-10 px-2 uppercase align-middle"
                  >
                    <Tooltip>
                      <TooltipTrigger className="cursor-help decoration-dashed underline underline-offset-4">
                        {col.label}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[250px] text-center text-sm">{col.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                ))}
                <TableHead className="text-white font-bold text-[10px] md:text-xs whitespace-nowrap text-center h-10 px-2 align-middle w-[60px]">
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
                  <TableCell
                    className={`p-0 border-r border-slate-200 dark:border-slate-800 align-middle w-[40%]`}
                  >
                    <Input
                      className="border-0 rounded-none h-8 w-full bg-transparent focus-visible:ring-1 font-medium text-left px-2"
                      placeholder=""
                      value={row.creditor}
                      onChange={(e) => updateRow(i, 'creditor', e.target.value)}
                    />
                  </TableCell>
                  <TableCell
                    className={`p-0 border-r border-slate-200 dark:border-slate-800 align-middle w-[15%]`}
                  >
                    <Input
                      className="border-0 rounded-none h-8 w-full bg-transparent focus-visible:ring-1 font-medium text-center"
                      placeholder="-"
                      value={row.col0}
                      onChange={(e) => updateRow(i, 'col0', e.target.value)}
                    />
                  </TableCell>
                  <TableCell
                    className={`p-0 border-r border-slate-200 dark:border-slate-800 align-middle w-[15%]`}
                  >
                    <Input
                      className="border-0 rounded-none h-8 w-full bg-transparent focus-visible:ring-1 font-medium text-center"
                      placeholder="-"
                      value={row.col1}
                      onChange={(e) => updateRow(i, 'col1', e.target.value)}
                    />
                  </TableCell>
                  <TableCell
                    className={`p-0 border-r border-slate-200 dark:border-slate-800 align-middle w-[15%]`}
                  >
                    <Input
                      className="border-0 rounded-none h-8 w-full bg-transparent focus-visible:ring-1 font-medium text-center"
                      placeholder="-"
                      value={row.col2}
                      onChange={(e) => updateRow(i, 'col2', e.target.value)}
                    />
                  </TableCell>
                  <TableCell
                    className={`p-0 border-r border-slate-200 dark:border-slate-800 align-middle w-[15%]`}
                  >
                    <Input
                      className="border-0 rounded-none h-8 w-full bg-transparent focus-visible:ring-1 font-medium text-center"
                      placeholder="-"
                      value={row.col3}
                      onChange={(e) => updateRow(i, 'col3', e.target.value)}
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
        </div>
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

      <ExplanatoryNote
        title="Notas Explicativas - Endividamentos Diversos"
        value={note}
        onChange={setNote}
      />
    </div>
  )
}
