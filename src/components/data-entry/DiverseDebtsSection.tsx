import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

export function DiverseDebtsSection(props: any) {
  const [debts, setDebts] = useState([{ id: crypto.randomUUID(), description: '', amount: '' }])

  const addDebt = () => {
    setDebts([...debts, { id: crypto.randomUUID(), description: '', amount: '' }])
  }

  const removeDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id))
  }

  return (
    <div {...props}>
      <Card className="mt-6 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-slate-50/50 border-b">
          <CardTitle className="text-lg text-[#003366]">Dívidas Diversas</CardTitle>
          <Button size="sm" onClick={addDebt} variant="outline" type="button" className="h-8">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Dívida
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {debts.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">
              Nenhuma dívida cadastrada. Clique em adicionar para incluir.
            </div>
          ) : (
            debts.map((debt, index) => (
              <div
                key={debt.id}
                className="flex flex-col sm:flex-row items-start sm:items-end gap-4 animate-fade-in p-4 border rounded-md bg-white"
              >
                <div className="flex-1 w-full space-y-2">
                  <Label>Descrição da Dívida {index + 1}</Label>
                  <Input
                    value={debt.description}
                    onChange={(e) => {
                      const newDebts = [...debts]
                      newDebts[index].description = e.target.value
                      setDebts(newDebts)
                    }}
                    placeholder="Ex: Financiamento Banco X, Empréstimo de Sócios..."
                  />
                </div>
                <div className="w-full sm:w-1/3 space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={debt.amount}
                    onChange={(e) => {
                      const newDebts = [...debts]
                      newDebts[index].amount = e.target.value
                      setDebts(newDebts)
                    }}
                    placeholder="0,00"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDebt(debt.id)}
                  type="button"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 sm:mb-[2px] w-full sm:w-10 mt-2 sm:mt-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
