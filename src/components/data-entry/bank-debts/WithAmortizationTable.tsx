import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

export interface WithAmortizationTableProps {
  empresaId?: string
  data?: any[]
  onDelete?: (id: string) => void
  loading?: boolean
}

export function WithAmortizationTable({
  empresaId,
  data: propsData,
  onDelete: propsOnDelete,
  loading: propsLoading = false,
}: WithAmortizationTableProps) {
  const [internalData, setInternalData] = useState<any[]>([])
  const [internalLoading, setInternalLoading] = useState(false)
  const { toast } = useToast()

  const isControlled = propsData !== undefined
  const data = isControlled ? propsData : internalData
  const loading = isControlled ? propsLoading : internalLoading

  useEffect(() => {
    if (!isControlled && empresaId) {
      loadData()
    }
  }, [empresaId, isControlled])

  const loadData = async () => {
    try {
      setInternalLoading(true)
      const { data: debts, error } = await supabase
        .from('dividas_bancarias')
        .select('*')
        .eq('empresa_id', empresaId)

      if (error) throw error
      setInternalData(debts || [])
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados das dívidas.',
        variant: 'destructive',
      })
    } finally {
      setInternalLoading(false)
    }
  }

  const handleDelete = async (id: string, index: number) => {
    if (propsOnDelete) {
      propsOnDelete(id || String(index))
      return
    }

    if (!id) return

    try {
      const { error } = await supabase.from('dividas_bancarias').delete().eq('id', id)

      if (error) throw error
      setInternalData((prev) => prev.filter((item) => item.id !== id))
      toast({
        title: 'Sucesso',
        description: 'Registro removido com sucesso.',
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o registro.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="rounded-md border w-full bg-white dark:bg-slate-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instituição / Banco</TableHead>
            <TableHead>Modalidade</TableHead>
            <TableHead>Taxa</TableHead>
            <TableHead>Saldo Devedor</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </TableCell>
            </TableRow>
          ) : !data || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                Nenhum registro de dívida encontrado.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell className="font-medium">
                  {item.instituicao || item.banco || item.descricao || '-'}
                </TableCell>
                <TableCell>{item.modalidade || item.tipo || '-'}</TableCell>
                <TableCell>
                  {item.taxa_juros !== undefined
                    ? `${Number(item.taxa_juros).toFixed(2)}%`
                    : item.taxa !== undefined
                      ? `${Number(item.taxa).toFixed(2)}%`
                      : '-'}
                </TableCell>
                <TableCell>
                  {item.saldo_devedor !== undefined
                    ? Number(item.saldo_devedor).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    : item.valor !== undefined
                      ? Number(item.valor).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id, index)}
                    type="button"
                    title="Remover item"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default WithAmortizationTable
