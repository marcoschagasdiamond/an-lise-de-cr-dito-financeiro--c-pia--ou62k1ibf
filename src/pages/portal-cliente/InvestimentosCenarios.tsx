import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Loader2 } from 'lucide-react'

export default function InvestimentosCenarios() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [investimentos, setInvestimentos] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ descricao: '', tipo: 'Conservador', valor: '' })

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    if (!user?.id) return setLoading(false)
    try {
      const { data, error } = await supabase
        .from('investimentos' as any)
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
      if (!error && data) setInvestimentos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('investimentos' as any).insert({
        usuario_id: user.id,
        descricao: formData.descricao,
        tipo_investimento: formData.tipo,
        valor: Number(formData.valor),
      })
      if (error) throw error
      toast({ title: 'Investimento adicionado!' })
      setOpen(false)
      setFormData({ descricao: '', tipo: 'Conservador', valor: '' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteInv(id: string) {
    try {
      await supabase
        .from('investimentos' as any)
        .delete()
        .eq('id', id)
      toast({ title: 'Investimento removido' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const chartData = useMemo(() => {
    let cons = 0,
      mod = 0,
      agr = 0
    investimentos.forEach((inv) => {
      const val = Number(inv.valor) || 0
      if (inv.tipo_investimento === 'Conservador') cons += val
      else if (inv.tipo_investimento === 'Moderado') mod += val
      else if (inv.tipo_investimento === 'Agressivo') agr += val
    })

    const data = []
    for (let i = 0; i <= 5; i++) {
      data.push({
        mes: `Mês ${i + 1}`,
        conservador: Math.round(cons * Math.pow(1.008, i)),
        moderado: Math.round(mod * Math.pow(1.012, i)),
        agressivo: Math.round(agr * Math.pow(1.02, i)),
      })
    }
    return data
  }, [investimentos])

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-6xl animate-fade-in-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cenários de Investimentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas posições e projete o crescimento.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Investimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição (Ex: Tesouro Selic, Ações)</Label>
                <Input
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Perfil do Investimento</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conservador">Conservador</SelectItem>
                    <SelectItem value="Moderado">Moderado</SelectItem>
                    <SelectItem value="Agressivo">Agressivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor Aportado (R$)</Label>
                <Input
                  type="number"
                  required
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Confirmar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Projeção de Rendimentos (6 meses)</CardTitle>
              <CardDescription>
                Crescimento estimado agrupado por perfil de investimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartContainer
                  config={{
                    conservador: { label: 'Conservador', color: 'hsl(var(--chart-1))' },
                    moderado: { label: 'Moderado', color: 'hsl(var(--chart-2))' },
                    agressivo: { label: 'Agressivo', color: 'hsl(var(--chart-3))' },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted-foreground)/0.2)"
                      />
                      <XAxis
                        dataKey="mes"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `R$ ${v}`}
                        width={90}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="conservador"
                        stroke="var(--color-conservador)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="moderado"
                        stroke="var(--color-moderado)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="agressivo"
                        stroke="var(--color-agressivo)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Meus Investimentos</CardTitle>
              <CardDescription>Posições ativas na carteira</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {investimentos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                  <p className="text-sm">Nenhum investimento registrado.</p>
                </div>
              ) : (
                investimentos.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate" title={inv.descricao}>
                        {inv.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {inv.tipo_investimento}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pl-4">
                      <span className="text-sm font-bold whitespace-nowrap">
                        R$ {Number(inv.valor).toLocaleString('pt-BR')}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => deleteInv(inv.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
