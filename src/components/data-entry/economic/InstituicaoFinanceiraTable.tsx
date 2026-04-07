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
import { ExplanatoryNote } from '../ExplanatoryNote'
import { Button } from '@/components/ui/button'
import { Eraser, Plus, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const emptyRow = {
  institution: '',
  contractedValue: '',
  totalPeriods: '',
  interestRate: '',
  guarantee: '',
}

export function InstituicaoFinanceiraTable() {
  const [rows, setRows] = useState<any[]>([])
  const [note, setNote] = useState('')
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const records = await pb.collection('bank_debts_amortization').getFullList()
      const maxRowIndex = Math.max(2, ...records.map((r) => r.rowIndex || 0))
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
          totalPeriods: r.totalPeriods ? r.totalPeriods.toString() : '',
          interestRate: r.interestRate ? r.interestRate.toString() : '',
          guarantee: r.guarantee || '',
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

  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rows]
    const row = { ...newRows[index], [field]: value }
    newRows[index] = row
    setRows(newRows)

    if (debounceTimers.current[index]) clearTimeout(debounceTimers.current[index])

    debounceTimers.current[index] = setTimeout(async () => {
      try {
        const valContracted = parseFloat(row.contractedValue)
        const valTotalPeriods = parseFloat(row.totalPeriods)
        const valInterestRate = parseFloat(row.interestRate)

        const payload = {
          rowIndex: index,
          institution: row.institution || '',
          contractedValue: Number.isNaN(valContracted) ? 0 : valContracted,
          totalPeriods: Number.isNaN(valTotalPeriods) ? 0 : valTotalPeriods,
          interestRate: Number.isNaN(valInterestRate) ? 0 : valInterestRate,
          guarantee: row.guarantee || '',
        }

        if (row.id) {
          await pb.collection('bank_debts_amortization').update(row.id, payload)
        } else if (row.institution || payload.contractedValue > 0) {
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
            if (latest[index]) latest[index].id = record.id
            return latest
          })
        }
      } catch (e) {
        console.error('Error saving row:', e)
        toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
      }
    }, 800)
  }

  const handleAddRow = async () => {
    const newIndex = rows.length
    try {
      const record = await pb.collection('bank_debts_amortization').create({
        rowIndex: newIndex,
        institution: '',
        contractedValue: 0,
        totalPeriods: 0,
        interestRate: 0,
        guarantee: '',
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
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }

  const handleClear = async () => {
    if (confirm('Tem certeza que deseja limpar estes dados?')) {
      try {
        const records = await pb.collection('bank_debts_amortization').getFullList()
        for (const r of records) {
          const derived = await pb
            .collection('debt_composition')
            .getFullList({ filter: `sourceId='${r.id}'` })
          for (const d of derived) await pb.collection('debt_composition').delete(d.id)
          await pb.collection('bank_debts_amortization').delete(r.id)
        }
        const newRows = Array.from({ length: 3 }).map((_, i) => ({ rowIndex: i, ...emptyRow }))
        setRows(newRows)
      } catch (e) {
        toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
      }
    }
  }

  const handleDelete = async (index: number, id?: string) => {
    try {
      if (id) {
        const derived = await pb
          .collection('debt_composition')
          .getFullList({ filter: `sourceId='${id}'` })
        for (const d of derived) await pb.collection('debt_composition').delete(d.id)
        await pb.collection('bank_debts_amortization').delete(id)
      }

      const shift = await pb
        .collection('bank_debts_amortization')
        .getFullList({ filter: `rowIndex > ${index}` })
      for (const r of shift) {
        await pb.collection('bank_debts_amortization').update(r.id, { rowIndex: r.rowIndex - 1 })
      }

      const newRows = [...rows]
      newRows.splice(index, 1)
      if (newRows.length < 3) {
        newRows.push({ ...emptyRow, rowIndex: newRows.length })
      }
      newRows.forEach((r, i) => (r.rowIndex = i))
      setRows(newRows)
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }

  return (
    <div className="space-y-4 mt-8 w-full max-w-[850px] animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#0f2e4a]">INSTITUIÇÃO FINANCEIRA</h3>
        <Button
          onClick={handleClear}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
        >
          <Eraser className="w-4 h-4 mr-2" />
          Limpar Dados
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead className="text-white font-bold border-none text-xs whitespace-nowrap">
                FONTE
              </TableHead>
              <TableHead className="text-white font-bold border-none text-right text-xs whitespace-nowrap">
                VALOR PRETENDIDO
              </TableHead>
              <TableHead className="text-white font-bold border-none text-right text-xs whitespace-nowrap">
                PRAZO (MESES)
              </TableHead>
              <TableHead className="text-white font-bold border-none text-right text-xs whitespace-nowrap">
                TAXA PREVISTA
              </TableHead>
              <TableHead className="text-white font-bold border-none text-right text-xs whitespace-nowrap">
                GARANTIA
              </TableHead>
              <TableHead className="text-white font-bold border-none text-center text-xs whitespace-nowrap w-[60px]">
                AÇÕES
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.id || i} className="hover:bg-slate-50 border-b border-slate-100">
                <TableCell className="p-0 border-r border-slate-100">
                  <Input
                    value={row.institution}
                    onChange={(e) => updateRow(i, 'institution', e.target.value)}
                    className="border-0 rounded-none h-[44px] focus-visible:ring-1 focus-visible:ring-inset"
                    placeholder="Ex: Banco do Brasil"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-100">
                  <Input
                    type="number"
                    value={row.contractedValue}
                    onChange={(e) => updateRow(i, 'contractedValue', e.target.value)}
                    className="border-0 rounded-none h-[44px] text-right focus-visible:ring-1 focus-visible:ring-inset"
                    placeholder="0,00"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-100">
                  <Input
                    type="number"
                    value={row.totalPeriods}
                    onChange={(e) => updateRow(i, 'totalPeriods', e.target.value)}
                    className="border-0 rounded-none h-[44px] text-right focus-visible:ring-1 focus-visible:ring-inset"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-100">
                  <Input
                    type="number"
                    value={row.interestRate}
                    onChange={(e) => updateRow(i, 'interestRate', e.target.value)}
                    className="border-0 rounded-none h-[44px] text-right focus-visible:ring-1 focus-visible:ring-inset"
                    placeholder="0"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-slate-100">
                  <Input
                    value={row.guarantee}
                    onChange={(e) => updateRow(i, 'guarantee', e.target.value)}
                    className="border-0 rounded-none h-[44px] text-right focus-visible:ring-1 focus-visible:ring-inset"
                    placeholder="Ex: Imóvel"
                  />
                </TableCell>
                <TableCell className="p-1 align-middle text-center">
                  {row.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(i, row.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="bg-slate-50 p-2 flex justify-end px-4 border-t border-slate-200">
          <Button
            onClick={handleAddRow}
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            Incluir Linha
          </Button>
        </div>
      </div>

      <ExplanatoryNote
        title="Notas Explicativas - Instituição Financeira"
        value={note}
        onChange={setNote}
      />
    </div>
  )
}
