import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import {
  EvolucaoTaxasChart,
  type HistoricoTaxa,
} from '@/components/taxas-mercado/EvolucaoTaxasChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Percent,
  DollarSign,
  Activity,
  Calendar,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TaxasMercado() {
  const [data, setData] = useState<any>(null)
  const [history, setHistory] = useState<HistoricoTaxa[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchRates = async (force = false) => {
    try {
      if (force) setRefreshing(true)
      else setLoading(true)

      const res = await pb.send(`/backend/v1/buscar-taxas-mercado${force ? '?force=true' : ''}`, {
        method: 'GET',
      })
      setData(res)

      // Fetch historico_taxas
      const histRes = await pb.collection('historico_taxas').getList(1, 30, {
        sort: '-data_atualizacao',
      })
      const items = histRes.items.reverse()
      const formattedHistory = items.map((item) => ({
        date: format(parseISO(item.data_atualizacao), 'MMM/yy', { locale: ptBR }),
        selic: item.selic_12m,
        ipca: item.ipca_12m,
        cdi: item.cdi_12m,
        tr: item.tr_12m,
        ...(item.igpm_12m !== undefined && { igpm: item.igpm_12m }),
      })) as HistoricoTaxa[]

      // Deduplicate by month/year label to avoid visual clutter
      const uniqueHistory = Array.from(
        new Map(formattedHistory.map((item) => [item.date, item])).values(),
      )

      setHistory(uniqueHistory)

      if (force) {
        toast({
          title: 'Taxas Atualizadas',
          description: 'As taxas foram atualizadas com sucesso!',
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as taxas de mercado.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header title="Taxas de Mercado" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Taxas Atualizadas de Mercado</h1>
              <p className="text-slate-500 text-sm">
                Acompanhe as principais taxas acumuladas dos últimos 12 meses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fetchRates(true)}
              disabled={loading || refreshing}
              className="gap-2 bg-white hover:bg-slate-50 border shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar Agora
            </Button>
            <Button
              asChild
              className="gap-2 bg-white text-slate-700 hover:bg-slate-50 border shadow-sm"
              variant="outline"
            >
              <a
                href="https://www.debit.com.br/tabelas/indicadores-economicos"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                Consulta Completa
              </a>
            </Button>
          </div>
        </div>

        <div className="text-center bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <p className="text-lg font-medium text-slate-700">
            {data?.observacao || 'Variação das taxas dos últimos 12 meses'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-slate-200/50 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-slate-200/50 rounded w-3/4 mb-2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* SELIC */}
              <Card className="shadow-sm border-none bg-blue-600 text-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between opacity-90">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider">
                    SELIC - Acumulado 12 meses (%)
                  </CardTitle>
                  <Activity className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.selic_12m?.toFixed(2).replace('.', ',')}%
                  </div>
                </CardContent>
              </Card>

              {/* IPCA */}
              <Card className="shadow-sm border-none bg-emerald-600 text-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between opacity-90">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider">
                    IPCA - Acumulado 12 meses (%)
                  </CardTitle>
                  <Percent className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.ipca_12m?.toFixed(2).replace('.', ',')}%
                  </div>
                </CardContent>
              </Card>

              {/* CDI */}
              <Card className="shadow-sm border-none bg-orange-500 text-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between opacity-90">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider">
                    CDI - Acumulado 12 meses (%)
                  </CardTitle>
                  <DollarSign className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.cdi_12m?.toFixed(2).replace('.', ',')}%
                  </div>
                </CardContent>
              </Card>

              {/* TR */}
              <Card className="shadow-sm border-none bg-purple-600 text-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between opacity-90">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider">
                    TR - Acumulado 12 meses (%)
                  </CardTitle>
                  <TrendingUp className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.tr_12m?.toFixed(2).replace('.', ',')}%
                  </div>
                </CardContent>
              </Card>

              {/* IGP-M */}
              <Card className="shadow-sm border-none bg-red-600 text-white hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-center justify-between opacity-90">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider">
                    IGP-M - Acumulado 12 meses (%)
                  </CardTitle>
                  <Activity className="w-4 h-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {data?.igpm_12m?.toFixed(2).replace('.', ',')}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {data?.data_atualizacao && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-slate-600 mt-6 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    <strong>Data da Última Atualização:</strong> {formatDate(data.data_atualizacao)}
                  </span>
                </div>
                {data.source_link && (
                  <span className="sm:ml-auto text-xs flex items-center gap-1">
                    Fonte:{' '}
                    <a
                      href={data.source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Indicadores Econômicos (Debit)
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </span>
                )}
              </div>
            )}

            {history.length > 0 && <EvolucaoTaxasChart data={history} />}
          </>
        )}
      </div>
    </div>
  )
}
