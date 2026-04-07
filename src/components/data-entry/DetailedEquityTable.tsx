import React, { Fragment } from 'react'
import { useFinancialStore } from '@/store/main'
import { NumInput } from '@/components/ui/num-input'
import { formatCurrency } from '@/lib/calculators'
import { cn } from '@/lib/utils'
import { AutomatedExplanatoryNote } from './AutomatedExplanatoryNote'
import { ClearDataButton } from './ClearDataButton'

const EQUITY_HIERARCHY = [
  { id: 'patrimonioLiquido', label: 'PATRIMÔNIO LÍQUIDO TOTAL', isTotal: true },
  { id: 'capitalSocial', label: 'CAPITAL SOCIAL' },
  { id: 'reservas', label: 'RESERVAS' },
  { id: 'lucrosPrejuizosAcumulados', label: 'LUCROS E PREJUÍZOS ACUMULADOS' },
  { id: 'outrosRecursosPL', label: 'OUTROS RECURSOS PRÓPRIOS' },
]

const SITUATION_LABELS = {
  ATIVO: 'ATIVO TOTAL',
  PASSIVO: 'PASSIVO TOTAL',
  PL: 'PATRIMÔNIO LÍQUIDO',
}

export function DetailedEquityTable({
  isEditable,
  years,
  balances,
}: {
  isEditable: boolean
  years: number[]
  balances?: any[]
}) {
  const { balanceSheets, updateBalanceSheet } = useFinancialStore()

  const handleClear = () => {
    years.forEach((y) => {
      updateBalanceSheet(y, {
        capitalSocial: 0,
        reservas: 0,
        lucrosPrejuizosAcumulados: 0,
        outrosRecursosPL: 0,
      })
    })
  }

  const getTotals = (y: number) => {
    const bp = balanceSheets.find((b) => b.year === y)
    if (!bp) return { pl: 0, ativo: 0, passivo: 0, totalPassivoPL: 0 }
    const pl = bp.patrimonioLiquido || 0
    const ativo = (bp.ativoCirculante || 0) + (bp.ativoNaoCirculante || 0)
    const passivo = (bp.passivoCirculante || 0) + (bp.passivoNaoCirculante || 0)
    return { pl, ativo, passivo, totalPassivoPL: passivo + pl }
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

  const renderRow = (key: string, label: string, isTotal = false) => {
    return (
      <tr
        key={key}
        className={cn(
          'hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-b border-slate-200 dark:border-slate-800',
          isTotal &&
            'bg-slate-100 dark:bg-slate-800/80 font-bold border-b border-slate-300 dark:border-slate-700 print:bg-gray-200',
        )}
      >
        <td
          className={cn(
            'p-1 px-3 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 print:border-slate-400 sticky left-0 bg-white dark:bg-slate-950 z-10 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]',
            isTotal
              ? 'text-sm uppercase text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900'
              : 'text-xs font-medium italic uppercase whitespace-nowrap',
          )}
        >
          {label}
        </td>
        {years.map((y, i) => {
          const bp = balanceSheets.find((b) => b.year === y)
          const val = (bp?.[key as keyof typeof bp] as number) || 0
          const { totalPassivoPL: total } = getTotals(y)

          let prevVal = 0
          if (i > 0) {
            const prevBp = balanceSheets.find((b) => b.year === years[i - 1])
            prevVal = (prevBp?.[key as keyof typeof prevBp] as number) || 0
          }

          return (
            <Fragment key={y}>
              <td
                className={cn(
                  'p-1 border-r border-slate-200 dark:border-slate-800 w-[140px] print:border-slate-400',
                  isTotal && 'border-slate-300 dark:border-slate-700',
                )}
              >
                {isTotal ? (
                  <div className="text-right px-2 text-sm text-slate-900 dark:text-slate-100">
                    {formatCurrency(val)}
                  </div>
                ) : (
                  <NumInput
                    value={val}
                    onChange={(v) => updateBalanceSheet(y, { [key]: v as number })}
                    disabled={!isEditable}
                    className="h-7 w-full text-xs rounded-none border-transparent bg-transparent text-slate-900 dark:text-slate-100 focus-visible:ring-1 focus-visible:ring-[#0f2e4a] shadow-none px-2"
                  />
                )}
              </td>
              <td
                className={cn(
                  'p-1 text-[11px] text-right w-[80px] pr-2 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 print:border-slate-400 bg-slate-50/50 dark:bg-slate-900/50',
                  isTotal &&
                    'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200',
                )}
              >
                {fmtAV(val, total)}
              </td>
              {i > 0 && (
                <td
                  className={cn(
                    'p-1 text-[11px] text-right w-[80px] pr-2 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 print:border-slate-400 bg-slate-50/50 dark:bg-slate-900/50',
                    isTotal &&
                      'border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200',
                  )}
                >
                  {fmtAH(val, prevVal)}
                </td>
              )}
            </Fragment>
          )
        })}
      </tr>
    )
  }

  const renderSitPatrRow = (label: string, field: 'ativo' | 'passivo' | 'pl') => (
    <tr
      key={field}
      className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 print:bg-gray-100 print:border-slate-400 hover:bg-slate-200"
    >
      <td className="p-1 px-3 text-xs font-bold uppercase text-right border-r border-slate-300 dark:border-slate-700 print:border-slate-400 sticky left-0 bg-slate-200 dark:bg-slate-800 z-10 shadow-[1px_0_0_0_#cbd5e1] dark:shadow-[1px_0_0_0_#334155]">
        {label}
      </td>
      {years.map((y, i) => {
        const { ativo, passivo, pl } = getTotals(y)
        const expectedPl = ativo - passivo
        const val = field === 'ativo' ? ativo : field === 'passivo' ? passivo : pl

        const isMismatch =
          field === 'pl' && Math.abs(pl - expectedPl) > 0.01 && (pl !== 0 || expectedPl !== 0)

        return (
          <Fragment key={y}>
            <td
              className={cn(
                'p-1 border-r border-slate-300 dark:border-slate-700 print:border-slate-400',
                isMismatch &&
                  'border-2 border-destructive bg-destructive/10 print:bg-transparent print:border-black',
              )}
            >
              <div
                className={cn(
                  'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 shadow-inner px-2 py-0.5 text-right text-sm font-bold w-full mx-auto print:bg-transparent print:border-0',
                  isMismatch &&
                    'bg-destructive/20 border-destructive text-destructive print:text-black',
                )}
              >
                {formatCurrency(val)}
              </div>
            </td>
            <td className="p-1 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 w-[80px]"></td>
            {i > 0 && (
              <td className="p-1 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 w-[80px]"></td>
            )}
          </Fragment>
        )
      })}
    </tr>
  )

  return (
    <div className="w-full overflow-hidden bg-white dark:bg-slate-950 rounded-md shadow-sm border border-slate-300 dark:border-slate-700 flex flex-col animate-fade-in-up mt-8 print:border-slate-400 print:shadow-none">
      <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase ml-2">
          PATRIMÔNIO LÍQUIDO
        </span>
        <ClearDataButton onClear={handleClear} disabled={!isEditable} />
      </div>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full min-w-[1000px] border-collapse print:min-w-full">
          <thead>
            <tr className="bg-[#0f2e4a] text-white hover:bg-[#0f2e4a] border-none print:bg-gray-300 print:text-black">
              <th
                rowSpan={2}
                className="p-2 px-3 text-left w-[350px] font-bold tracking-widest border-r border-white/20 uppercase align-middle sticky left-0 bg-[#0f2e4a] z-20"
              >
                P a t r i m ô n i o &nbsp; L í q u i d o
              </th>
              {years.map((y, i) => (
                <th
                  key={y}
                  colSpan={i === 0 ? 2 : 3}
                  className="p-2 text-center font-bold border-r border-white/20"
                >
                  {y}
                </th>
              ))}
            </tr>
            <tr className="bg-[#0f2e4a] text-white hover:bg-[#0f2e4a] border-none print:bg-gray-300 print:text-black">
              {years.map((y, i) => (
                <Fragment key={`sub-${y}`}>
                  <th className="p-1 text-center text-[10px] font-bold w-[140px] border-r border-white/20">
                    VALOR
                  </th>
                  <th className="p-1 text-center text-[10px] font-bold w-[80px] border-r border-white/20">
                    A.V. (%)
                  </th>
                  {i > 0 && (
                    <th className="p-1 text-center text-[10px] font-bold w-[80px] border-r border-white/20">
                      A.H. (%)
                    </th>
                  )}
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent print:bg-white">
            {EQUITY_HIERARCHY.map((row) => renderRow(row.id, row.label, row.isTotal))}
          </tbody>
          <tbody>
            <tr className="bg-[#0f2e4a] text-white border-t border-[#0f2e4a] print:bg-gray-100 print:border-black print:text-black hover:bg-[#0f2e4a]">
              <td className="p-2 px-3 text-sm font-bold uppercase border-r border-white/20 tracking-wider sticky left-0 bg-[#0f2e4a] z-10">
                SITUAÇÃO PATRIMONIAL
              </td>
              {years.map((y, i) => {
                const { pl } = getTotals(y)
                const situation = pl < 0 ? 'PASSIVO A DESCOBERTO' : 'SITUAÇÃO LÍQUIDA POSITIVA'
                return (
                  <Fragment key={y}>
                    <td
                      colSpan={i === 0 ? 2 : 3}
                      className="p-1 text-center text-[11px] font-bold uppercase border-r border-white/20 italic align-bottom pb-1"
                    >
                      {situation}
                    </td>
                  </Fragment>
                )
              })}
            </tr>
            {renderSitPatrRow(SITUATION_LABELS.ATIVO, 'ativo')}
            {renderSitPatrRow(SITUATION_LABELS.PASSIVO, 'passivo')}
            {renderSitPatrRow(SITUATION_LABELS.PL, 'pl')}
          </tbody>
        </table>
      </div>

      <div className="px-4 pb-4">
        <AutomatedExplanatoryNote
          title="NOTAS EXPLICATIVAS"
          category="PATRIMÔNIO LÍQUIDO"
          data={balanceSheets}
          years={years}
          isEditable={isEditable}
        />
      </div>
    </div>
  )
}
