import { useState, useCallback, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export function WithoutAmortizationTable() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFetch = useCallback(async () => {
    try {
      setLoading(true)
      // Supabase fetch - checking for a generic table that might exist
      // If table doesn't exist, the error will just show a toast and leave data empty
      const { data: result, error } = await supabase.from('dividas_bancarias').select('*').limit(10)

      if (error) {
        // Just silently handle if the table doesn't exist yet to prevent crashes
        console.warn('Erro ao buscar dívidas:', error)
        setData([])
        return
      }

      setData(result || [])
    } catch (err: any) {
      toast({
        title: 'Aviso',
        description: 'Não foi possível carregar os dados. Verifique a conexão.',
        variant: 'destructive',
      })
      setData([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Dívidas Sem Tabela de Amortização</h3>
        <Button onClick={handleFetch} disabled={loading} variant="outline" size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Atualizar
        </Button>
      </div>
      <div className="border rounded-md w-full overflow-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Saldo Devedor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Carregando dados...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma dívida cadastrada para esta categoria.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell className="font-medium">{item.banco || '-'}</TableCell>
                  <TableCell>{item.modalidade || '-'}</TableCell>
                  <TableCell className="text-right">
                    {item.valor_total !== undefined && item.valor_total !== null
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.valor_total)
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.saldo_devedor !== undefined && item.saldo_devedor !== null
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.saldo_devedor)
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
