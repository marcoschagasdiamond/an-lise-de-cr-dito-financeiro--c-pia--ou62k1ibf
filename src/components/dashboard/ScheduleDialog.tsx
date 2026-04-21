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
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarClock, Save } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { getStakeholders, Stakeholder } from '@/services/stakeholders'
import { getReportSchedule, saveReportSchedule, ReportSchedule } from '@/services/report_schedules'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ScheduleDialog() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])

  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [active, setActive] = useState(true)
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    if (!user?.id) return
    const stData = await getStakeholders(user.id)
    setStakeholders(stData)

    const sched = await getReportSchedule(user.id)
    if (sched) {
      setScheduleId(sched.id)
      setActive(sched.active)
      setFrequency(sched.frequency)
      setSelectedIds(sched.stakeholders || [])
    }
  }

  useEffect(() => {
    if (open) loadData()
  }, [open, user])

  const handleToggleStakeholder = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSave = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      await saveReportSchedule(scheduleId, {
        user_id: user.id,
        active,
        frequency,
        stakeholders: selectedIds,
      })
      toast({ title: 'Agendamento salvo com sucesso!' })
      setOpen(false)
    } catch (err) {
      toast({ title: 'Erro ao salvar agendamento', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 bg-white dark:bg-slate-900 border-[#1f497d]/20 hover:bg-[#1f497d]/5"
        >
          <CalendarClock className="w-4 h-4 text-[#1f497d]" />
          Agendar Relatorio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Envio Automatico de Relatorios</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-base">Ativar Agendamento</Label>
              <p className="text-sm text-muted-foreground">Envio periodico do sumario executivo.</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <div className="space-y-3">
            <Label>Frequencia de Envio</Label>
            <Select
              disabled={!active}
              value={frequency}
              onValueChange={(v: any) => setFrequency(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal (Toda Segunda-feira)</SelectItem>
                <SelectItem value="monthly">Mensal (Dia 1)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Destinatarios (Stakeholders)</Label>
            <ScrollArea className="h-[150px] border rounded-md p-3">
              {stakeholders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Nenhum stakeholder cadastrado.
                </p>
              ) : (
                <div className="space-y-3">
                  {stakeholders.map((s) => (
                    <div key={s.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`sh-${s.id}`}
                        disabled={!active}
                        checked={selectedIds.includes(s.id)}
                        onCheckedChange={() => handleToggleStakeholder(s.id)}
                      />
                      <Label
                        htmlFor={`sh-${s.id}`}
                        className="flex flex-col cursor-pointer font-normal"
                      >
                        <span className="font-medium text-sm flex items-center gap-2">
                          {s.name}{' '}
                          {s.is_favorite && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                              Fav
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">{s.email}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
            <Save className="w-4 h-4" />
            Salvar Configuracoes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
