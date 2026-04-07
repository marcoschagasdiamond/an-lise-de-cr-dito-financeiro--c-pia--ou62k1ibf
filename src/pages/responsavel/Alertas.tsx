import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { Badge } from '@/components/ui/badge'

export default function AlertasResponsavel() {
  const [clientes, setClientes] = useState<any[]>([])

  useEffect(() => {
    pb.collection('clientes')
      .getFullList({ filter: 'origem="solicitar_diagnostico"', sort: '-created', limit: 20 })
      .then(setClientes)
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background">
      <Header title="Alertas de Prospecção" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full pb-20">
        <h1 className="text-3xl font-bold text-primary mb-8">Novas Solicitações Diretas</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientes.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  {c.nome}{' '}
                  {!c.parceiro_id && <Badge variant="destructive">Pendente Atribuição</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Contato:</strong> {c.nome_responsavel} ({c.telefone})
                </p>
                <p>
                  <strong>Valor:</strong>{' '}
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    c.valor_captacao || 0,
                  )}
                </p>
                <p>
                  <strong>Prazo:</strong> {c.prazo_desejado?.replace(/_/g, ' ')}
                </p>
                <p className="text-muted-foreground mt-2 line-clamp-3">{c.descricao}</p>
              </CardContent>
            </Card>
          ))}
          {clientes.length === 0 && (
            <p className="text-muted-foreground">Nenhuma prospecção recente.</p>
          )}
        </div>
      </div>
    </div>
  )
}
