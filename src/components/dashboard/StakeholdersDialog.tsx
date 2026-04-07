import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, Trash2, Star, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  getStakeholders,
  createStakeholder,
  deleteStakeholder,
  toggleFavoriteStakeholder,
  Stakeholder,
} from '@/services/stakeholders'
import { ScrollArea } from '@/components/ui/scroll-area'

export function StakeholdersDialog() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isFav, setIsFav] = useState(false)

  const loadData = async () => {
    if (user?.id) {
      const data = await getStakeholders(user.id)
      setStakeholders(data)
    }
  }

  useEffect(() => {
    if (open) loadData()
  }, [open, user])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !user?.id) return
    try {
      await createStakeholder({ name, email, is_favorite: isFav, user_id: user.id })
      toast({ title: 'Stakeholder adicionado com sucesso' })
      setName('')
      setEmail('')
      setIsFav(false)
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteStakeholder(id)
      toast({ title: 'Stakeholder removido' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleToggleFav = async (id: string, currentFav: boolean) => {
    try {
      await toggleFavoriteStakeholder(id, !currentFav)
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao atualizar favorito', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-white dark:bg-slate-900 border-[#1f497d]/20 hover:bg-[#1f497d]/5"
        >
          <Users className="w-4 h-4 text-[#1f497d]" />
          Stakeholders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestão de Stakeholders</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAdd} className="space-y-4 pt-4 border-b pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Conselho"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="fav" checked={isFav} onCheckedChange={(c) => setIsFav(!!c)} />
              <Label htmlFor="fav" className="text-sm font-normal cursor-pointer">
                Marcar como favorito
              </Label>
            </div>
            <Button type="submit" size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        </form>

        <div className="pt-2">
          <Label className="text-muted-foreground mb-3 block">Contatos Cadastrados</Label>
          <ScrollArea className="h-[200px] rounded-md border p-2">
            {stakeholders.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-8">
                Nenhum stakeholder cadastrado.
              </p>
            ) : (
              <div className="space-y-2">
                {stakeholders.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggleFav(s.id, s.is_favorite)}
                      >
                        <Star
                          className={`w-4 h-4 ${s.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
