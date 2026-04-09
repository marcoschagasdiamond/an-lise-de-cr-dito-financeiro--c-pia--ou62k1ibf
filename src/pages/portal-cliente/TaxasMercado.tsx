import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Taxa {
  nome: string
  valor: string
  variacao: 'up' | 'down' | 'flat'
  descricao: string
}

export default function TaxasMercado() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulating data fetch for mock rates
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const taxas: Taxa[] = [
    { nome: 'Taxa Selic', valor: '10,50%', variacao: 'up', descricao: 'Ao ano' },
    { nome: 'CDI', valor: '10,40%', variacao: 'up', descricao: 'Ao ano' },
    { nome: 'IPCA', valor: '4,50%', variacao: 'down', descricao: 'Acumulado 12 meses' },
    { nome: 'IGP-M', valor: '-3,18%', variacao: 'down', descricao: 'Acumulado 12 meses' },
    { nome: 'Poupança', valor: '6,17%', variacao: 'flat', descricao: 'Ao ano + TR' },
    { nome: 'TR', valor: '1,85%', variacao: 'flat', descricao: 'Acumulado 12 meses' },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Taxas de Mercado</h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe os principais indicadores econômicos e taxas do mercado financeiro.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Carregando indicadores...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {taxas.map((taxa) => (
            <Card key={taxa.nome}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{taxa.nome}</CardTitle>
                {taxa.variacao === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : taxa.variacao === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taxa.valor}</div>
                <p className="text-xs text-muted-foreground mt-1">{taxa.descricao}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
