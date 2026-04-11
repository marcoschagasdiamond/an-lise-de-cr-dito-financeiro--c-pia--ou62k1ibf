import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Loader2, FileText, Download, Plus } from 'lucide-react'
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

export default function AnaliseFinanceiraPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [analises, setAnalises] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    empresa: '',
    tipo: 'Crédito',
    faturamento: '',
    score: '',
  })

  useEffect(() => {
    loadData()
  }, [user])

  async function loadData() {
    if (!user?.id) {
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('analises_salvas' as any)
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })

      if (!error && data) setAnalises(data)
    } catch (err) {
      console.error('Erro ao carregar análises:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) return
    setSubmitting(true)

    try {
      const { error } = await supabase.from('analises_salvas' as any).insert({
        usuario_id: user.id,
        nome_analise: formData.empresa,
        tipo_analise: formData.tipo,
        dados_analise: {
          faturamento_anual: Number(formData.faturamento),
          score: formData.score,
          status: 'em_analise',
        },
      })

      if (error) throw error

      toast({ title: 'Análise solicitada com sucesso!' })
      setOpen(false)
      setFormData({ empresa: '', tipo: 'Crédito', faturamento: '', score: '' })
      loadData()
    } catch (error) {
      toast({ title: 'Erro ao solicitar análise', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl animate-fade-in-up duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise Financeira</h1>
          <p className="text-muted-foreground mt-1">Acompanhe suas análises de crédito.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova Análise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Nova Análise</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Empresa ou Projeto</Label>
                <Input
                  required
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Análise</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                    <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Faturamento Anual (R$)</Label>
                <Input
                  type="number"
                  required
                  value={formData.faturamento}
                  onChange={(e) => setFormData({ ...formData, faturamento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Score Atual / Desejado (Opcional)</Label>
                <Input
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
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

      {loading ? (
        <div className="flex justify-center items-center h-64 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : analises.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Nenhuma análise encontrada</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              Você ainda não possui análises financeiras registradas. Clique em "Nova Análise" para
              começar.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analises.map((analise) => (
            <Card key={analise.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-2 w-full bg-primary" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{analise.nome_analise}</CardTitle>
                    <CardDescription className="mt-1">{analise.tipo_analise}</CardDescription>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Em Análise
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Faturamento</p>
                      <p className="font-medium">
                        R${' '}
                        {Number(analise.dados_analise?.faturamento_anual || 0).toLocaleString(
                          'pt-BR',
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Score</p>
                      <p className="font-medium">{analise.dados_analise?.score || 'N/A'}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
