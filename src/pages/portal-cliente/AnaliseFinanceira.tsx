import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Loader2, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AnaliseFinanceiraPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [analises, setAnalises] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('analises')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (!error && data) {
          setAnalises(data)
        }
      } catch (err) {
        console.error('Erro ao carregar análises:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise Financeira</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe suas análises de crédito e diagnósticos financeiros.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 border rounded-lg bg-slate-50/50">
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
              Você ainda não possui análises financeiras registradas. Suas análises processadas
              aparecerão aqui.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analises.map((analise) => (
            <Card key={analise.id} className="overflow-hidden">
              <div className="h-2 w-full bg-primary" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Análise de Crédito</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(analise.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      analise.status === 'concluido'
                        ? 'bg-green-100 text-green-800'
                        : analise.status === 'em_analise'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {analise.status === 'concluido'
                      ? 'Concluído'
                      : analise.status === 'em_analise'
                        ? 'Em Análise'
                        : 'Pendente'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Faturamento</p>
                      <p className="font-medium">
                        {analise.faturamento_anual
                          ? `R$ ${Number(analise.faturamento_anual).toLocaleString('pt-BR')}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Score</p>
                      <p className="font-medium">{analise.score || 'N/A'}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    disabled={analise.status !== 'concluido'}
                  >
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
