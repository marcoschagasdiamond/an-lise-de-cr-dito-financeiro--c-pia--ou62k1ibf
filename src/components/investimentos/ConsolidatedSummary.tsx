import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/calculators'

interface Props {
  summary: { invTotal: number; cust: number; ret: number }
}

export function ConsolidatedSummary({ summary }: Props) {
  return (
    <Card className="border-[#1A3A5F]/20 shadow-sm mt-8 animate-fade-in-up">
      <CardHeader className="bg-slate-50/50 pb-4 rounded-t-xl">
        <CardTitle className="text-lg text-[#002147]">
          Resumo Consolidado dos Cenários Selecionados
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Investimento Total</p>
            <p className="text-2xl font-bold text-[#002147]">{formatCurrency(summary.invTotal)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Custos Mensais (Aprox.)</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.cust)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Retorno Esperado (Anual)</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.ret)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
