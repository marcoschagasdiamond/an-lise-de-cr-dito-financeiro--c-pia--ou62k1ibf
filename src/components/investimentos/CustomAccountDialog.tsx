import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

export interface CustomAccount {
  id: string
  name: string
  type: 'receita' | 'custo' | 'despesa' | 'outro'
  value: number
  crescimentoAnual: number
  description?: string
}

export function CustomAccountDialog({ onAdd }: { onAdd: (acc: CustomAccount) => void }) {
  const [open, setOpen] = useState(false)
  const [acc, setAcc] = useState<CustomAccount>({
    id: '',
    name: '',
    type: 'receita',
    value: 0,
    crescimentoAnual: 0,
  })

  const handleAdd = () => {
    if (!acc.name || acc.value <= 0) return
    onAdd({ ...acc, id: Date.now().toString() })
    setOpen(false)
    setAcc({ id: '', name: '', type: 'receita', value: 0, crescimentoAnual: 0 })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar Conta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Conta Personalizada</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Conta</Label>
            <Input value={acc.name} onChange={(e) => setAcc({ ...acc, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={acc.type} onValueChange={(v: any) => setAcc({ ...acc, type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="custo">Custo</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor Anual Ano 1 (R$)</Label>
            <Input
              type="number"
              value={acc.value || ''}
              onChange={(e) => setAcc({ ...acc, value: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Crescimento Anual (%)</Label>
            <Input
              type="number"
              value={acc.crescimentoAnual || ''}
              onChange={(e) => setAcc({ ...acc, crescimentoAnual: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição (Opcional)</Label>
            <Input
              value={acc.description || ''}
              onChange={(e) => setAcc({ ...acc, description: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} className="bg-[#002147] text-white hover:bg-[#001835]">
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
