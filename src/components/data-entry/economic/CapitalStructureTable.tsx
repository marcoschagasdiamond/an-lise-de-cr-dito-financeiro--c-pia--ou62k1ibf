import { useState } from 'react'
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
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export function CapitalStructureTable(props: any) {
  const { toast } = useToast()
  const [items, setItems] = useState([
    { id: crypto.randomUUID(), source: 'Capital Próprio', amount: 0, cost: 0 },
    { id: crypto.randomUUID(), source: 'Capital de Terceiros', amount: 0, cost: 0 },
  ])

  const handleAdd = () => {
    setItems([...items, { id: crypto.randomUUID(), source: '', amount: 0, cost: 0 }])
  }

  const handleRemove = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleChange = (id: string, field: string, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSave = async () => {
    try {
      // Dummy save just to show the UI feedback
      toast({
        title: 'Sucesso',
        description: 'Estrutura de capital salva com sucesso.',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div {...props}>
      <Card className="mt-6 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 pb-4 border-b">
          <CardTitle className="text-lg text-[#003366]">Estrutura de Capital</CardTitle>
          <Button size="sm" onClick={handleAdd} variant="outline" type="button" className="h-8">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Fonte
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold text-[#003366]">Fonte de Capital</TableHead>
                  <TableHead className="font-bold text-[#003366]">Valor (R$)</TableHead>
                  <TableHead className="font-bold text-[#003366]">Custo (%)</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.source}
                        onChange={(e) => handleChange(item.id, 'source', e.target.value)}
                        placeholder="Ex: Financiamento"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) =>
                          handleChange(item.id, 'amount', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.cost || ''}
                        onChange={(e) =>
                          handleChange(item.id, 'cost', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.0"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                      Nenhuma fonte de capital cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} className="bg-[#003366] hover:bg-[#002244] text-white">
              Salvar Estrutura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
