import React, { Fragment, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NumInput } from '@/components/ui/num-input'
import { AutomatedExplanatoryNote } from './AutomatedExplanatoryNote'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'
import { useFinancialStore } from '@/store/main'
import { formatCurrency } from '@/lib/calculators'
import { cn } from '@/lib/utils'

const LIABILITY_HIERARCHY = [
  { id: 'passivoCirculante', label: 'PASSIVO CIRCULANTE', isTotal: true },
  { id: 'fornecedores', label: 'FORNECEDORES A PAGAR', isInput: true },
  { id: 'obrigacoesFiscais', label: 'OBRIGAÇÕES FISCAIS E TRABALHISTAS', isInput: true },
  { id: 'adiantamentoClientes', label: 'ADIANTAMENTO DE CLIENTES', isInput: true },
  { id: 'provisaoImpostosRenda', label: 'PROVISÃO IMPOSTOS S/ RENDA (IR E CSLL)', isInput: true },
  { id: 'emprestimosCurtoPrazo', label: 'EMPRÉST. E FINANCIAMENTOS DE CURTO PRAZO', isInput: true },
  { id: 'duplicatasDescontadas', label: 'DUPLICATAS DESCONTADAS', isInput: true },
  { id: 'outrasObrigacoesCirculantes', label: 'OUTRAS OBRIGAÇÕES CIRCULANTES', isInput: true },
  { id: 'passivoNaoCirculante', label: 'PASSIVO NÃO-CIRCULANTE', isTotal: true },
  {
    id: 'emprestimosLongoPrazo',
    label: 'EMPRÉST. E FINANC. EXIGÍVEIS DE LONGO PRAZO',
    isInput: true,
  },
  { id: 'outrasObrigacoesLongoPrazo', label: 'OUTRAS OBRIGAÇÕES NÃO-CIRCULANTES', isInput: true },
]

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError)
      return (
        <div className="p-4 text-red-500">
          Erro ao carregar a tabela. Por favor, recarregue a página.
        </div>
      )
    return this.props.children
  }
}

export function DetailedLiabilityTable({
  isEditable,
  years,
}: {
  isEditable?: boolean
  years?: number[]
}) {
  return (
    <ErrorBoundary>
      <DetailedLiabilityTableContent isEditable={isEditable} years={years} />
    </ErrorBoundary>
  )
}

function DetailedLiabilityTableContent({
  isEditable,
  years,
}: {
  isEditable?: boolean
  years?: number[]
}) {
  const { balanceSheets, updateBalanceSheet } = useFinancialStore()

  const displayYears = years || [2021, 2022, 2023]

  // Assegurando que qualquer validação de datas na tabela ou componentes filhos
  // tenha um fallback consistente e evite erros com react-day-picker (null/undefined)
  const [defaultDate] = useState<Date>(new Date())

  const clearData = () => {
    displayYears.forEach((y) => {
      updateBalanceSheet(y, {
        passivoCirculante: 0,
        fornecedores: 0,
        obrigacoesFiscais: 0,
        adiantamentoClientes: 0,
        provisaoImpostosRenda: 0,
        emprestimosCurtoPrazo: 0,
        duplicatasDescontadas: 0,
        outrasObrigacoesCirculantes: 0,
        passivoNaoCirculante: 0,
        emprestimosLongoPrazo: 0,
        outrasObrigacoesLongoPrazo: 0,
      })
    })
  }

  const handleUpdate = (year: number, key: string, value: number) => {
    const bp = balanceSheets.find((b) => b.year === year) || ({} as any)
    const newBp = { ...bp, [key]: value }

    const pc = [
      'fornecedores',
      'obrigacoesFiscais',
      'adiantamentoClientes',
      'provisaoImpostosRenda',
      'emprestimosCurtoPrazo',
      'duplicatasDescontadas',
      'outrasObrigacoesCirculantes',
    ].reduce((acc, f) => acc + (newBp[f] || 0), 0)

    const pnc = ['emprestimosLongoPrazo', 'outrasObrigacoesLongoPrazo'].reduce(
      (acc, f) => acc + (newBp[f] || 0),
      0,
    )

    updateBalanceSheet(year, {
      [key]: value,
      passivoCirculante: pc,
      passivoNaoCirculante: pnc,
    })
  }

  const getVal = (year: number, key: string) => {
    const bp = balanceSheets.find((b) => b.year === year) || ({} as any)
    return bp[key] || 0
  }

  const getTotal = (year: number) => {
    return (
      getVal(year, 'passivoCirculante') +
      getVal(year, 'passivoNaoCirculante') +
      getVal(year, 'patrimonioLiquido')
    )
  }

  const fmtAV = (val: number, total: number) => {
    if (total === 0) return '0,00%'
    return (
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format((val / total) * 100) + '%'
    )
  }

  const fmtAH = (val: number, prevVal: number) => {
    if (prevVal === 0) return val === 0 ? '0,00%' : '-'
    return (
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(((val - prevVal) / Math.abs(prevVal)) * 100) + '%'
    )
  }

  return (
    <div className="space-y-4 mt-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#0f2e4a] dark:text-slate-100">
          Balanço Patrimonial - PASSIVO
        </h3>
        <Button
          onClick={clearData}
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:border-red-900"
          disabled={!isEditable}
        >
          <Eraser className="w-4 h-4 mr-2" /> Limpar Dados
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto shadow-sm border-slate-200 dark:border-slate-800">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead
                className="text-white font-bold border-none w-[350px] align-middle sticky left-0 bg-[#0f2e4a] z-20"
                rowSpan={2}
              >
                CONTA
              </TableHead>
              {displayYears.map((y, i) => (
                <TableHead
                  key={y}
                  colSpan={i === 0 ? 2 : 3}
                  className="text-white font-bold border-none text-center border-l border-white/20"
                >
                  {y}
                </TableHead>
              ))}
            </TableRow>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              {displayYears.map((y, i) => (
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
          <TableBody className="bg-white dark:bg-slate-950">
            <TableRow className="bg-slate-200 dark:bg-slate-800 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
              <TableCell className="text-[#0f2e4a] dark:text-slate-100 sticky left-0 bg-slate-200 dark:bg-slate-800 z-10 shadow-[1px_0_0_0_#cbd5e1] dark:shadow-[1px_0_0_0_#334155]">
                PASSIVO TOTAL + PL
              </TableCell>
              {displayYears.map((y, i) => {
                const total = getTotal(y)
                const prevTotal = i > 0 ? getTotal(displayYears[i - 1]) : 0
                return (
                  <Fragment key={y}>
                    <TableCell className="text-right text-[#0f2e4a] dark:text-slate-100 pr-4 border-l border-slate-300 dark:border-slate-700">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell className="text-right text-[#0f2e4a] dark:text-slate-100 pr-4 text-xs">
                      100,00%
                    </TableCell>
                    {i > 0 && (
                      <TableCell className="text-right text-[#0f2e4a] dark:text-slate-100 pr-4 text-xs">
                        {fmtAH(total, prevTotal)}
                      </TableCell>
                    )}
                  </Fragment>
                )
              })}
            </TableRow>

            {LIABILITY_HIERARCHY.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  'hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800',
                  row.isTotal ? 'bg-slate-100 dark:bg-slate-900 font-semibold' : '',
                )}
              >
                <TableCell
                  className={cn(
                    'sticky left-0 z-10 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b]',
                    row.isTotal
                      ? 'pl-6 text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#0f172a]'
                      : 'pl-10 text-slate-700 dark:text-slate-400',
                  )}
                >
                  {row.label}
                </TableCell>

                {displayYears.map((y, i) => {
                  const val = getVal(y, row.id)
                  const total = getTotal(y)
                  const prevVal = i > 0 ? getVal(displayYears[i - 1], row.id) : 0

                  return (
                    <Fragment key={y}>
                      <TableCell
                        className={cn(
                          'border-l border-slate-200 dark:border-slate-800',
                          row.isInput ? 'p-0 w-[150px]' : 'text-right pr-4 w-[150px]',
                        )}
                      >
                        {row.isInput ? (
                          <NumInput
                            value={val}
                            onChange={(v) => handleUpdate(y, row.id, v as number)}
                            disabled={!isEditable}
                            className="border-0 rounded-none h-full min-h-[44px] w-full text-right bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-inset"
                          />
                        ) : (
                          formatCurrency(val)
                        )}
                      </TableCell>
                      <TableCell className="text-right bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 pr-4 text-[11px] font-medium w-[90px]">
                        {fmtAV(val, total)}
                      </TableCell>
                      {i > 0 && (
                        <TableCell className="text-right bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 pr-4 text-[11px] font-medium w-[90px]">
                          {fmtAH(val, prevVal)}
                        </TableCell>
                      )}
                    </Fragment>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AutomatedExplanatoryNote
        title="NOTAS EXPLICATIVAS"
        category="BALANÇO PATRIMONIAL - PASSIVO"
        data={balanceSheets}
        years={displayYears}
        isEditable={isEditable}
      />
    </div>
  )
}
