import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatPercent } from '@/lib/calculators'

interface Props {
  metricas: {
    tir: number
    tirEBTD: number
    tirEBITDA: number
    vpl5: { rate: number; value: number }[]
    vpl10: { rate: number; value: number }[]
    ebitdaMedio: number
    margemMedia: number
    lucratividadeMedia: number
  }
}

function Interpretacao({ status }: { status: 'Positivo' | 'Alerta' | 'Negativo' }) {
  if (status === 'Positivo') {
    return (
      <span className="font-bold px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
        Positivo
      </span>
    )
  }
  if (status === 'Alerta') {
    return (
      <span className="font-bold px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
        Alerta
      </span>
    )
  }
  return (
    <span className="font-bold px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
      Negativo
    </span>
  )
}

export function MetricsSummary({ metricas }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
      <Card className="border-[#1A3A5F]/20 shadow-sm flex flex-col">
        <CardHeader className="bg-slate-50 border-b border-[#1A3A5F]/10 rounded-t-xl">
          <CardTitle className="text-lg font-bold text-[#002147]">
            Análise de Viabilidade Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1A3A5F]/5 hover:bg-[#1A3A5F]/5">
                <TableHead className="font-bold text-[#002147]">Métrica</TableHead>
                <TableHead className="font-bold text-[#002147] text-right">
                  Valor Calculado
                </TableHead>
                <TableHead className="font-bold text-[#002147] text-center">
                  Interpretação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-slate-600">EBITDA (Média)</TableCell>
                <TableCell className="text-right font-bold text-[#002147]">
                  {formatCurrency(metricas.ebitdaMedio)}
                </TableCell>
                <TableCell className="text-center">
                  <Interpretacao status={metricas.ebitdaMedio > 0 ? 'Positivo' : 'Negativo'} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-slate-600">EBITDA % (Média)</TableCell>
                <TableCell className="text-right font-bold text-[#002147]">
                  {formatPercent(metricas.margemMedia / 100)}
                </TableCell>
                <TableCell className="text-center">
                  <Interpretacao
                    status={
                      metricas.margemMedia >= 15
                        ? 'Positivo'
                        : metricas.margemMedia > 0
                          ? 'Alerta'
                          : 'Negativo'
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-slate-600">Lucratividade (Média)</TableCell>
                <TableCell className="text-right font-bold text-[#002147]">
                  {formatPercent(metricas.lucratividadeMedia / 100)}
                </TableCell>
                <TableCell className="text-center">
                  <Interpretacao
                    status={
                      metricas.lucratividadeMedia >= 10
                        ? 'Positivo'
                        : metricas.lucratividadeMedia > 0
                          ? 'Alerta'
                          : 'Negativo'
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-slate-600">TIR</TableCell>
                <TableCell className="text-right font-bold text-[#002147]">
                  {formatPercent(metricas.tir / 100)}
                </TableCell>
                <TableCell className="text-center">
                  <Interpretacao
                    status={
                      metricas.tir >= 15 ? 'Positivo' : metricas.tir > 5 ? 'Alerta' : 'Negativo'
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-slate-600">TIR EBTD</TableCell>
                <TableCell className="text-right font-bold text-[#002147]">
                  {formatPercent(metricas.tirEBTD / 100)}
                </TableCell>
                <TableCell className="text-center">
                  <Interpretacao
                    status={
                      metricas.tirEBTD >= 15
                        ? 'Positivo'
                        : metricas.tirEBTD > 5
                          ? 'Alerta'
                          : 'Negativo'
                    }
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-slate-600">TIR EBITDA</TableCell>
                <TableCell className="text-right font-bold text-[#002147]">
                  {formatPercent(metricas.tirEBITDA / 100)}
                </TableCell>
                <TableCell className="text-center">
                  <Interpretacao
                    status={
                      metricas.tirEBITDA >= 15
                        ? 'Positivo'
                        : metricas.tirEBITDA > 5
                          ? 'Alerta'
                          : 'Negativo'
                    }
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-[#1A3A5F]/20 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-[#1A3A5F]/10 rounded-t-xl">
          <CardTitle className="text-lg font-bold text-[#002147]">
            VPL por Taxa de Desconto
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1A3A5F]/5 hover:bg-[#1A3A5F]/5">
                <TableHead className="font-bold text-[#002147] whitespace-nowrap">Taxa</TableHead>
                <TableHead className="text-right font-bold text-[#002147] whitespace-nowrap">
                  VPL 5 Anos
                </TableHead>
                <TableHead className="text-right font-bold text-[#002147] whitespace-nowrap">
                  VPL 10 Anos
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricas.vpl10.map((vpl10, idx) => {
                const vpl5 = metricas.vpl5[idx]
                return (
                  <TableRow key={vpl10.rate}>
                    <TableCell className="font-medium text-slate-600">
                      {formatPercent(vpl10.rate)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${vpl5.value >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(vpl5.value)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${vpl10.value >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrency(vpl10.value)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
