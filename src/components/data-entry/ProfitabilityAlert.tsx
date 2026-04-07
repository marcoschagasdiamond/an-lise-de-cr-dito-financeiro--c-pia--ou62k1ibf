import { useFinancialStore } from '@/store/main'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProfitabilityAlert() {
  const { dre, currentExerciseDRE, targetMargin, setTargetMargin } = useFinancialStore()

  const current = currentExerciseDRE.current || {}

  let receita =
    current.receita || current.faturamentoBruto || current.faturamento || current.receitaBruta || 0
  let deducoes =
    current.devolucoesDescontosAbatimentos ||
    current.deducoesVendas ||
    current.impostosSobreVendas ||
    0
  let cpv = current.cpv || current.custo || current.custos || 0
  let despesas = current.despesasOperacionais || current.despesas || 0
  let outrasRec = current.outrasReceitasOperacionaisTributaveis || current.outrasReceitas || 0

  if (receita === 0 && dre.length > 0) {
    const latestDre = dre.reduce((a, b) => (a.year > b.year ? a : b))
    receita = latestDre.receita || 0
    deducoes =
      (latestDre.devolucoesDescontosAbatimentos || 0) + (latestDre.impostosSobreVendas || 0)
    cpv = latestDre.cpv || 0
    despesas =
      (latestDre.despesasComPessoal || 0) +
        (latestDre.prestacaoServicosTerceiros || 0) +
        (latestDre.despesasComerciaisTributarias || 0) +
        (latestDre.despesasAdministrativas || 0) +
        (latestDre.outrasDespesasOperacionais || 0) ||
      latestDre.despesasOperacionais ||
      0
    outrasRec = latestDre.outrasReceitasOperacionaisTributaveis || 0
  }

  const lob = receita - deducoes - cpv
  const ebitda = lob - despesas + outrasRec
  const ebitdaMargin = receita > 0 ? (ebitda / receita) * 100 : 0

  const isHealthy = ebitdaMargin >= targetMargin

  return (
    <Card
      className="border-l-4 shadow-sm animate-fade-in-up"
      style={{ borderLeftColor: isHealthy ? '#16a34a' : '#dc2626' }}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start md:items-center gap-4">
          {isHealthy ? (
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-full shrink-0 mt-1 md:mt-0">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
          ) : (
            <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-full shrink-0 mt-1 md:mt-0">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg flex flex-wrap items-center gap-2.5 text-foreground">
              Status de Rentabilidade (EBITDA)
              <Badge
                variant="outline"
                className={cn(
                  'text-sm',
                  isHealthy
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800'
                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
                )}
              >
                {ebitdaMargin.toFixed(1)}% Margem Atual
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground leading-snug mt-1.5 max-w-xl">
              {isHealthy
                ? 'Rentabilidade Adequada: A margem EBITDA calculada está igual ou superior à meta estabelecida para o setor.'
                : 'Atenção: Rentabilidade Abaixo do Ideal. A margem EBITDA calculada encontra-se inferior à meta.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0 bg-muted/40 p-3 rounded-lg border border-border/50 shadow-inner w-full md:w-auto">
          <Label htmlFor="targetMargin" className="whitespace-nowrap font-semibold text-sm">
            Margem Alvo (%)
          </Label>
          <Input
            id="targetMargin"
            type="number"
            step="0.1"
            className="w-full sm:w-24 h-9 text-right font-mono text-base"
            value={targetMargin}
            onChange={(e) => setTargetMargin(Number(e.target.value) || 0)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
