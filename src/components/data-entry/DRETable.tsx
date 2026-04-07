import { Fragment } from 'react'
import { useFinancialStore } from '@/store/main'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NumInput } from '@/components/ui/num-input'
import { formatCurrency, calculateEBITDA } from '@/lib/calculators'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SaveDataButton } from '@/components/data-entry/SaveDataButton'
import { ClearDataButton } from './ClearDataButton'
import { AutomatedExplanatoryNote } from './AutomatedExplanatoryNote'
import { cn } from '@/lib/utils'

interface Props {
  years: number[]
  isEditable: boolean
  title: string
  description: string
}

const SMALL_DRE_ACCOUNTS = [
  { key: 'receita', label: 'FATURAMENTO BRUTO' },
  { key: 'deducoesGroup', label: 'DEDUÇÕES DAS VENDAS', isHeader: true },
  {
    key: 'devolucoesDescontosAbatimentos',
    label: 'DEVOLUÇÕES DESCONTOS E ABATIMENTOS',
    indent: true,
  },
  { key: 'impostosSobreVendas', label: 'IMPOSTOS SOBRE VENDAS', indent: true },
  {
    key: 'receitaLiquida',
    label: '(=) Receita Líquida',
    isComputed: true,
    isBold: true,
    calc: (d: any) =>
      (d.receita || 0) - (d.impostosSobreVendas || 0) - (d.devolucoesDescontosAbatimentos || 0),
  },
  { key: 'cpv', label: 'CUSTO DOS PRODUTOS/SERVIÇOS VENDIDOS' },
  {
    key: 'lucroBruto',
    label: '(=) Lucro Bruto',
    isComputed: true,
    isBold: true,
    calc: (d: any) =>
      (d.receita || 0) -
      (d.impostosSobreVendas || 0) -
      (d.devolucoesDescontosAbatimentos || 0) -
      (d.cpv || 0),
  },
  { key: 'despesasOperacionaisGroup', label: 'DESPESAS OPERACIONAIS', isHeader: true },
  { key: 'despesasComPessoal', label: 'DESPESAS COM PESSOAL', indent: true },
  { key: 'prestacaoServicosTerceiros', label: 'PRESTAÇÃO DE SERVIÇOS DE TERCEIROS', indent: true },
  {
    key: 'despesasComerciaisTributarias',
    label: 'DESPESAS COMERCIAIS E TRIBUTÁRIAS',
    indent: true,
  },
  { key: 'despesasAdministrativas', label: 'DESPESAS ADMINISTRATIVAS', indent: true },
  { key: 'outrasDespesasOperacionais', label: 'OUTRAS DESPESAS OPERACIONAIS', indent: true },
  {
    key: 'despesasOperacionais',
    label: '(=) Total Despesas Operacionais',
    isComputed: true,
    isBold: true,
    calc: (d: any) =>
      (d.despesasComPessoal || 0) +
      (d.prestacaoServicosTerceiros || 0) +
      (d.despesasComerciaisTributarias || 0) +
      (d.despesasAdministrativas || 0) +
      (d.outrasDespesasOperacionais || 0),
  },
  {
    key: 'outrasReceitasOperacionaisTributaveis',
    label: 'OUTRAS RECEITAS OPERACIONAIS TRIBUTÁVEIS',
  },
  {
    key: 'ebitda',
    label: '(=) EBITDA',
    isComputed: true,
    isPrimary: true,
    calc: (d: any) => calculateEBITDA(d),
  },
  { key: 'depreciacao', label: 'DESP. C/ DEPRECIAÇÃO AMORTIZ. E EXAUSTÃO' },
  {
    key: 'ebit',
    label: '(=) Resultado Operacional (EBIT)',
    isComputed: true,
    isBold: true,
    calc: (d: any) => calculateEBITDA(d) - (d.depreciacao || 0),
  },
  { key: 'resultadoFinanceiroGroup', label: 'RESULTADO FINANCEIRO', isHeader: true },
  { key: 'juros', label: 'DESPESAS FINANCEIRAS', indent: true },
  { key: 'receitasFinanceiras', label: 'RECEITAS FINANCEIRAS', indent: true },
  { key: 'resultadoNaoOperacionalGroup', label: 'RESULTADO NÃO-OPERACIONAL', isHeader: true },
  { key: 'despesasNaoOperacionais', label: 'DESPESAS NÃO-OPERACIONAIS', indent: true },
  { key: 'receitasNaoOperacionais', label: 'RECEITAS NÃO-OPERACIONAIS', indent: true },
  { key: 'provisaoImpostos', label: 'PROVISÃO DE IMPOSTOS S/ RENDA (IR/CSLL)' },
  { key: 'participacoesEReservas', label: 'PARTICIPAÇÕES E RESERVAS' },
  { key: 'outrasReceitasLiquidasNaoTributadas', label: 'OUTRAS RECEITAS LÍQUIDAS NÃO TRIBUTADAS' },
  {
    key: 'resultadoLiquido',
    label: '(=) Resultado Líquido',
    isComputed: true,
    isBold: true,
    calc: (d: any) =>
      calculateEBITDA(d) -
      (d.depreciacao || 0) -
      (d.juros || 0) +
      (d.receitasFinanceiras || 0) -
      (d.despesasNaoOperacionais || 0) +
      (d.receitasNaoOperacionais || 0) -
      (d.provisaoImpostos || 0) -
      (d.participacoesEReservas || 0) +
      (d.outrasReceitasLiquidasNaoTributadas || 0),
  },
]

export function DRETable({ years, isEditable, title, description }: Props) {
  const { dre, updateDRE } = useFinancialStore()

  const handleClear = () => {
    years.forEach((y) => {
      updateDRE(y, {
        receita: 0,
        impostosSobreVendas: 0,
        devolucoesDescontosAbatimentos: 0,
        cpv: 0,
        outrasReceitasOperacionaisTributaveis: 0,
        despesasOperacionais: 0,
        despesasComPessoal: 0,
        prestacaoServicosTerceiros: 0,
        despesasComerciaisTributarias: 0,
        despesasAdministrativas: 0,
        outrasDespesasOperacionais: 0,
        depreciacao: 0,
        juros: 0,
        receitasFinanceiras: 0,
        despesasNaoOperacionais: 0,
        receitasNaoOperacionais: 0,
        provisaoImpostos: 0,
        participacoesEReservas: 0,
        outrasReceitasLiquidasNaoTributadas: 0,
      })
    })
  }

  const handleUpdate = (year: number, key: string, value: number) => {
    const dreRow = dre.find((d) => d.year === year) || ({} as any)
    const newDre = { ...dreRow, [key]: value }

    const despesasOperacionais =
      (newDre.despesasComPessoal || 0) +
      (newDre.prestacaoServicosTerceiros || 0) +
      (newDre.despesasComerciaisTributarias || 0) +
      (newDre.despesasAdministrativas || 0) +
      (newDre.outrasDespesasOperacionais || 0)

    updateDRE(year, {
      [key]: value,
      despesasOperacionais,
    })
  }

  const fmtAV = (val: number, total: number) => {
    if (!total || total === 0) return '0,00%'
    return (
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format((val / total) * 100) + '%'
    )
  }

  const fmtAH = (val: number, prevVal: number) => {
    if (!prevVal || prevVal === 0) return !val || val === 0 ? '0,00%' : '-'
    return (
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(((val - prevVal) / Math.abs(prevVal)) * 100) + '%'
    )
  }

  return (
    <Card className="animate-fade-in-up flex flex-col border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div>
          <CardTitle className="text-[#0f2e4a] dark:text-slate-100 tracking-wide uppercase">
            {title}
          </CardTitle>
          <CardDescription className="text-slate-500 mt-1">{description}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center shrink-0 print:hidden gap-2">
          <ClearDataButton onClear={handleClear} disabled={!isEditable} />
          <SaveDataButton />
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto bg-white dark:bg-slate-950">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead
                className="w-[350px] pl-6 text-white font-bold border-none align-middle sticky left-0 bg-[#0f2e4a] z-20"
                rowSpan={2}
              >
                CONTA
              </TableHead>
              {years.map((y, i) => (
                <TableHead
                  key={y}
                  colSpan={i === 0 ? 2 : 3}
                  className="text-center text-white font-bold border-none border-l border-white/20"
                >
                  Ano {y}
                </TableHead>
              ))}
            </TableRow>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              {years.map((y, i) => (
                <Fragment key={`sub-${y}`}>
                  <TableHead className="text-white font-semibold text-[11px] border-none text-right border-l border-white/20">
                    VALOR
                  </TableHead>
                  <TableHead className="text-white font-semibold text-[11px] border-none text-right">
                    A.V. (%)
                  </TableHead>
                  {i > 0 && (
                    <TableHead className="text-white font-semibold text-[11px] border-none text-right">
                      A.H. (%)
                    </TableHead>
                  )}
                </Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {SMALL_DRE_ACCOUNTS.map((row) => (
              <TableRow
                key={row.key}
                className={cn(
                  row.isHeader &&
                    'bg-slate-100 dark:bg-slate-900 font-semibold border-b-2 border-slate-200 dark:border-slate-800',
                  row.isBold && 'bg-slate-50 dark:bg-slate-900/50 font-bold',
                  row.isPrimary && 'bg-primary/5 font-bold text-primary',
                  'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800',
                )}
              >
                <TableCell
                  className={cn(
                    'pl-8 sticky left-0 z-10 bg-white dark:bg-slate-950 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b]',
                    row.indent && 'pl-12 text-muted-foreground',
                    row.isHeader &&
                      'bg-slate-100 dark:bg-slate-900 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#0f172a]',
                    row.isBold &&
                      'bg-slate-50 dark:bg-slate-900/50 shadow-[1px_0_0_0_#f8fafc] dark:shadow-[1px_0_0_0_#1e293b]',
                    row.isPrimary &&
                      'bg-primary/5 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b]',
                  )}
                >
                  {row.label}
                </TableCell>
                {years.map((y, i) => {
                  const d = dre.find((x) => x.year === y) || ({} as any)
                  const total = d.receita || 0
                  const val = row.isHeader
                    ? 0
                    : row.isComputed
                      ? row.calc
                        ? row.calc(d)
                        : 0
                      : (d[row.key] as number) || 0

                  let prevVal = 0
                  if (i > 0) {
                    const prevD = dre.find((x) => x.year === years[i - 1]) || ({} as any)
                    prevVal = row.isHeader
                      ? 0
                      : row.isComputed
                        ? row.calc
                          ? row.calc(prevD)
                          : 0
                        : (prevD[row.key] as number) || 0
                  }

                  return (
                    <Fragment key={y}>
                      <TableCell
                        className={cn(
                          'border-l border-slate-200 dark:border-slate-800',
                          row.isComputed || row.isHeader
                            ? 'text-right pr-4 w-[150px]'
                            : 'p-0 w-[150px]',
                        )}
                      >
                        {row.isHeader ? null : row.isComputed ? (
                          formatCurrency(val)
                        ) : (
                          <NumInput
                            disabled={!isEditable}
                            value={val}
                            onChange={(v: number) => handleUpdate(y, row.key, v)}
                            className="h-full min-h-[44px] border-0 rounded-none w-full text-right bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#0f2e4a]"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 pr-4 text-[11px] font-medium w-[90px]">
                        {!row.isHeader && fmtAV(val, total)}
                      </TableCell>
                      {i > 0 && (
                        <TableCell className="text-right bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 pr-4 text-[11px] font-medium w-[90px]">
                          {!row.isHeader && fmtAH(val, prevVal)}
                        </TableCell>
                      )}
                    </Fragment>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <div className="px-6 pb-6">
        <AutomatedExplanatoryNote
          title="NOTAS EXPLICATIVAS SOBRE AS CONTAS DO DEMONSTRATIVO DE RESULTADOS"
          category="DEMONSTRATIVO DE RESULTADOS"
          data={dre}
          years={years}
          isEditable={isEditable}
        />
      </div>
      <div className="flex justify-end p-4 border-t bg-muted/10 print:hidden mt-auto">
        <SaveDataButton className="bg-[#0f2e4a] text-white hover:bg-[#0f2e4a]/90 border-transparent shadow-sm" />
      </div>
    </Card>
  )
}
