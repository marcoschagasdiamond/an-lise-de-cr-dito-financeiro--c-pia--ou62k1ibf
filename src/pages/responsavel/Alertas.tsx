import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface Alerta {
  id: string
  titulo: string
  mensagem: string
  tipo: 'info' | 'warning' | 'error' | 'success'
  lido: boolean
  created_at: string
}

const mockAlertas: Alerta[] = [
  {
    id: '1',
    titulo: 'Documentação pendente',
    mensagem: 'A documentação de balanço financeiro está incompleta e aguarda envio.',
    tipo: 'warning',
    lido: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    titulo: 'Análise de crédito concluída',
    mensagem: 'O diagnóstico financeiro da empresa parceira foi gerado com sucesso.',
    tipo: 'success',
    lido: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    titulo: 'Atualização de sistema',
    mensagem: 'Novos recursos de análise de DRE foram adicionados ao painel.',
    tipo: 'info',
    lido: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const { data, error } = await supabase
          .from('alertas')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.warn('Erro ao buscar alertas, usando dados de demonstração.', error)
          setAlertas(mockAlertas)
        } else {
          setAlertas(data && data.length > 0 ? (data as Alerta[]) : mockAlertas)
        }
      } catch (err) {
        console.error('Erro inesperado', err)
        setAlertas(mockAlertas)
      } finally {
        setLoading(false)
      }
    }

    fetchAlertas()
  }, [])

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Alertas e Notificações</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : alertas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Bell className="h-12 w-12 mb-4 opacity-20" />
            <p>Nenhum alerta no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alertas.map((alerta) => (
            <Card
              key={alerta.id}
              className={`transition-all hover:bg-muted/50 ${alerta.lido ? 'opacity-70' : 'border-primary/50 shadow-sm'}`}
            >
              <CardContent className="p-6 flex items-start gap-4">
                <div className="mt-1 bg-background p-2 rounded-full shadow-sm">
                  {getIcon(alerta.tipo)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3
                      className={`font-semibold ${alerta.lido ? 'text-muted-foreground' : 'text-foreground'}`}
                    >
                      {alerta.titulo}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md w-fit">
                      {formatDate(alerta.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{alerta.mensagem}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
