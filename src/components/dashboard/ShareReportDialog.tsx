import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Send, Star } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getStakeholders, Stakeholder } from '@/services/stakeholders'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ShareReportDialog() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open && user?.id) {
      getStakeholders(user.id).then((data) => {
        setStakeholders(data)
        // Auto-select favorites by default
        setSelectedIds(data.filter((s) => s.is_favorite).map((s) => s.id))
      })
    }
  }, [open, user])

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSend = () => {
    if (selectedIds.length === 0) {
      toast({ title: 'Selecione ao menos um destinatário.', variant: 'destructive' })
      return
    }
    setSending(true)
    // Mock sending email
    setTimeout(() => {
      setSending(false)
      toast({ title: 'Relatório compartilhado com sucesso!' })
      setOpen(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#1f497d] hover:bg-[#1f497d]/90">
          <Send className="w-4 h-4" />
          Compartilhar Relatório
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Compartilhar com Stakeholders</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <Label>Selecione os destinatários (Quick Select)</Label>
          <ScrollArea className="h-[250px] border rounded-md p-3">
            {stakeholders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center mt-8">
                Nenhum stakeholder cadastrado.
              </p>
            ) : (
              <div className="space-y-3">
                {stakeholders.map((s) => (
                  <div key={s.id} className="flex items-center space-x-3 p-1">
                    <Checkbox
                      id={`share-${s.id}`}
                      checked={selectedIds.includes(s.id)}
                      onCheckedChange={() => handleToggle(s.id)}
                    />
                    <Label
                      htmlFor={`share-${s.id}`}
                      className="flex flex-1 items-center justify-between cursor-pointer font-normal"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.email}</span>
                      </div>
                      {s.is_favorite && (
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={sending || selectedIds.length === 0}
            className="w-full gap-2"
          >
            {sending ? 'Enviando...' : `Enviar para ${selectedIds.length} contato(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
