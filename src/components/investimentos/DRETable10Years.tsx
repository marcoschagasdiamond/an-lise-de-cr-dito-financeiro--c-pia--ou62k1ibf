import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CustomAccountDialog, CustomAccount } from './CustomAccountDialog'
import { formatCurrency } from '@/lib/calculators'
import { Trash2 } from 'lucide-react'

export interface DreProjection {
  ano: number
  receitaBruta: number
  deducoes: number
  receitaLiquida: number
  custosVendas: number
  resultadoBruto: number
  despesasOperacionais: number
  depreciacao: number
  despesasFinanceiras: number
  resultadoAntesIRCSLL: number
  irCsll: number
  lucroAntesParticipacoes: number
  outrasReducoes: number
  resultadoLiquido: number
  ebitda: number
  ebitdaMargin: number
  lucratividade: number
  distribuicaoLucros: number
}

interface Props {
  dreProjetado: DreProjection[]
  cenarios: any
  customAccounts: CustomAccount[]
  onAddAccount: (acc: CustomAccount) => void
  onRemoveAccount: (id: string) => void
}

export function DRETable10Years({
  dreProjetado,
  customAccounts,
  onAddAccount,
  onRemoveAccount,
}: Props) {
  return (
    <Card className="border-[#1A3A5F]/20 shadow-sm mt-8">
      <CardHeader className="bg-[#002147] text-white rounded-t-xl flex flex-row items-center justify-between">
        <CardTitle>DRE Automático - Projeção 10 Anos</CardTitle>
        <CustomAccountDialog onAdd={onAddAccount} />
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#C5A059]/10">
              <TableHead className="font-bold text-[#002147] whitespace-nowrap min-w-[300px]">
                Estrutura DRE
              </TableHead>
              {dreProjetado.map((d) => (
                <TableHead
                  key={d.ano}
                  className="text-right font-bold text-[#002147] whitespace-nowrap min-w-[120px]"
                >
                  Ano {d.ano}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold text-[#002147]">RECEITA OPERACIONAL BRUTA</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right font-medium">
                  {formatCurrency(d.receitaBruta)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-slate-50/50">
              <TableCell className="text-red-600 pl-6">
                (-) DEDUÇÕES (Devoluções, Impostos, Contribuições)
              </TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-red-600">
                  -{formatCurrency(d.deducoes)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="font-bold bg-slate-100 border-y-2 border-slate-200">
              <TableCell className="text-[#002147]">= RECEITA OPERACIONAL LÍQUIDA</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-[#002147]">
                  {formatCurrency(d.receitaLiquida)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-slate-50/50">
              <TableCell className="text-red-600 pl-6">
                (-) CUSTOS DAS VENDAS (Custo dos Produtos, Royalty)
              </TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-red-600">
                  -{formatCurrency(d.custosVendas)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="font-bold bg-slate-100 border-y-2 border-slate-200">
              <TableCell className="text-[#002147]">= RESULTADO OPERACIONAL BRUTO</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-[#002147]">
                  {formatCurrency(d.resultadoBruto)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-slate-50/50">
              <TableCell className="text-red-600 pl-6">
                (-) DESPESAS OPERACIONAIS (Mão de Obra, Administrativas, Depreciação 20 anos)
              </TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-red-600">
                  -{formatCurrency(d.despesasOperacionais)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-slate-50/50">
              <TableCell className="text-red-600 pl-6">
                (-) DESPESAS FINANCEIRAS LÍQUIDAS (Juros, Amortizações)
              </TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-red-600">
                  -{formatCurrency(d.despesasFinanceiras)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="font-bold bg-slate-100 border-y-2 border-slate-200">
              <TableCell className="text-[#002147]">
                = RESULTADO OPERACIONAL ANTES DO IRPJ E CSLL
              </TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-[#002147]">
                  {formatCurrency(d.resultadoAntesIRCSLL)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-slate-50/50">
              <TableCell className="text-red-600 pl-6">(-) Provisão para IR e CSLL</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-red-600">
                  -{formatCurrency(d.irCsll)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="font-bold bg-slate-100 border-y-2 border-slate-200">
              <TableCell className="text-[#002147]">
                = LUCRO LÍQUIDO ANTES DAS PARTICIPAÇÕES
              </TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-[#002147]">
                  {formatCurrency(d.lucroAntesParticipacoes)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-slate-50/50">
              <TableCell className="text-red-600 pl-6">(-) Outras reduções estatutárias</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-red-600">
                  -{formatCurrency(d.outrasReducoes)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="font-bold bg-[#002147] text-white">
              <TableCell className="text-white">= RESULTADO LÍQUIDO DO EXERCÍCIO</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right text-white">
                  {formatCurrency(d.resultadoLiquido)}
                </TableCell>
              ))}
            </TableRow>

            <TableRow className="h-6 border-0">
              <TableCell colSpan={11}></TableCell>
            </TableRow>

            <TableRow className="bg-[#C5A059]/10 border-t-2 border-[#C5A059]/30">
              <TableCell className="font-bold text-[#002147]">EBITDA</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right font-bold text-[#002147]">
                  {formatCurrency(d.ebitda)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-[#C5A059]/5 border-y-2 border-[#C5A059]/10">
              <TableCell className="font-bold text-[#002147]">Margem EBITDA</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right font-semibold text-[#002147]">
                  {d.ebitdaMargin.toFixed(1)}%
                </TableCell>
              ))}
            </TableRow>
            <TableRow className="bg-[#C5A059]/5 border-b-2 border-[#C5A059]/30">
              <TableCell className="font-bold text-[#002147]">Lucratividade</TableCell>
              {dreProjetado.map((d) => (
                <TableCell key={d.ano} className="text-right font-semibold text-[#002147]">
                  {d.lucratividade.toFixed(1)}%
                </TableCell>
              ))}
            </TableRow>

            {customAccounts.length > 0 && (
              <>
                <TableRow className="h-6 border-0">
                  <TableCell colSpan={11}></TableCell>
                </TableRow>
                <TableRow className="bg-slate-100">
                  <TableCell colSpan={11} className="font-bold text-slate-500 text-xs uppercase">
                    Outras Contas Adicionadas (Valores já embutidos no cálculo acima)
                  </TableCell>
                </TableRow>
                {customAccounts.map((acc) => (
                  <TableRow key={acc.id} className="bg-slate-50/50 text-sm">
                    <TableCell className="flex items-center justify-between">
                      <span className="text-slate-600">
                        {acc.name}{' '}
                        <span className="text-xs text-slate-400 capitalize">({acc.type})</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveAccount(acc.id)}
                        className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    {dreProjetado.map((d, i) => {
                      const val = acc.value * Math.pow(1 + (acc.crescimentoAnual || 0) / 100, i)
                      return (
                        <TableCell key={`${acc.id}-${d.ano}`} className="text-right text-slate-500">
                          {acc.type !== 'receita' ? '-' : '+'}
                          {formatCurrency(val)}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
