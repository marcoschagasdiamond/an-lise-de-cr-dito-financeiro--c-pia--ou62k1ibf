import React, { useState, useEffect } from 'react'
import { useIndicatorTable } from '@/hooks/use-indicator-table'
import { cn } from '@/lib/utils'
import { ExplanatoryNotes } from './ExplanatoryNotes'

const ROWS = [
  { id: 0, label: 'ATIVO OPERACIONAL' },
  { id: 1, label: 'PASSIVO OPERACIONAL' },
  { id: 2, label: 'NECESSIDADE LÍQUIDA DE CAPITAL DE GIRO', bold: true },
  { id: 991, spacer: true },
  { id: 3, label: 'ATIVO FINANCEIRO' },
  { id: 4, label: 'PASSIVO FINANCEIRO' },
  { id: 5, label: 'SALDO DE TESOURARIA', bold: true },
  { id: 992, spacer: true },
  { id: 6, label: 'ATIVO CIRCULANTE' },
  { id: 7, label: 'PASSIVO CIRCULANTE' },
  { id: 8, label: 'CAPITAL CIRCULANTE LÍQUIDO', bold: true },
]

export function CapitalGiroTable() {
  const dataRows = ROWS.filter((r) => !r.spacer)
  const { data, updateCell, loading } = useIndicatorTable('CAPITAL DE GIRO', dataRows)

  if (loading) return <div className="animate-pulse h-64 bg-slate-200 rounded-md"></div>

  const InputCell = ({ rowId, col }: { rowId: number; col: string }) => {
    const current = data[rowId]?.[col] ?? '0'
    const [val, setVal] = useState(current)

    useEffect(() => {
      setVal(data[rowId]?.[col] ?? '0')
    }, [data[rowId]?.[col]])

    return (
      <input
        type="text"
        className="w-full h-[22px] px-1 text-right text-xs border border-[#1f497d] rounded-none outline-none focus:ring-1 focus:ring-[#1f497d] bg-white font-sans text-black"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          if (val.toString() !== current.toString()) {
            updateCell(rowId, col, val)
          }
        }}
      />
    )
  }

  return (
    <div className="w-full overflow-x-auto border-2 border-[#1f497d] bg-[#c5d9f1] text-black font-sans pb-6 shadow-sm select-none">
      <div className="bg-[#1f497d] text-white text-center font-bold text-lg py-1 border-b-2 border-[#1f497d] tracking-wide">
        INDICADORES ECONÔMICO-FINANCEIROS
      </div>

      <div className="px-1 md:px-2 min-w-[600px]">
        <table className="w-full border-collapse mt-2">
          <thead>
            <tr className="border-b-2 border-[#1f497d]">
              <th className="text-left font-bold px-1 py-1 uppercase text-sm text-[#1f497d]">
                CAPITAL DE GIRO
              </th>
              <th className="text-center font-bold px-1 w-24 text-sm text-[#1f497d]">2021</th>
              <th className="text-center font-bold px-1 w-24 text-sm text-[#1f497d]">2022</th>
              <th className="text-center text-[10px] italic font-normal px-1 w-12 text-[#1f497d]">
                A.H.
              </th>
              <th className="text-center font-bold px-1 w-24 text-sm text-[#1f497d]">2023</th>
              <th className="text-center text-[10px] italic font-normal px-1 w-12 text-[#1f497d]">
                A.H.
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              if (row.spacer) {
                return (
                  <tr key={row.id}>
                    <td colSpan={6} className="h-4"></td>
                  </tr>
                )
              }
              return (
                <tr key={row.id}>
                  <td
                    className={cn(
                      'px-1 py-0.5 italic text-[11px] uppercase whitespace-nowrap',
                      row.bold && 'font-bold not-italic',
                    )}
                  >
                    {row.label}
                  </td>
                  <td className="px-1 py-0.5">
                    <InputCell rowId={row.id} col="val_2021" />
                  </td>
                  <td className="px-1 py-0.5">
                    <InputCell rowId={row.id} col="val_2022" />
                  </td>
                  <td className="px-1 py-0.5 text-center text-[10px] font-semibold text-[#1f497d]">
                    {data[row.id]?.ah_2022 != null ? `${data[row.id].ah_2022.toFixed(1)}%` : '-'}
                  </td>
                  <td className="px-1 py-0.5">
                    <InputCell rowId={row.id} col="val_2023" />
                  </td>
                  <td className="px-1 py-0.5 text-center text-[10px] font-semibold text-[#1f497d]">
                    {data[row.id]?.ah_2023 != null ? `${data[row.id].ah_2023.toFixed(1)}%` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-5 border-t-2 border-[#1f497d]/20 pt-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-[#1f497d]">
                <th className="text-left font-bold px-1 py-1 uppercase text-sm text-[#1f497d]">
                  COMPARAÇÃO ÚLT. EXERC. x DESEMP. DO SETOR
                </th>
                <th className="text-center font-bold px-1 w-24 text-xs text-[#1f497d]">
                  ÚLT. EXERC.
                </th>
                <th className="text-center px-1 w-24"></th>
                <th className="text-center font-bold px-1 w-24 text-xs leading-tight text-[#1f497d]">
                  DESEMP. SETOR
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                if (row.spacer) {
                  return (
                    <tr key={'comp-' + row.id}>
                      <td colSpan={5} className="h-4"></td>
                    </tr>
                  )
                }
                return (
                  <tr key={'comp-' + row.id}>
                    <td
                      className={cn(
                        'px-1 py-0.5 italic text-[11px] uppercase whitespace-nowrap',
                        row.bold && 'font-bold not-italic',
                      )}
                    >
                      {row.label}
                    </td>
                    <td className="px-1 py-0.5">
                      <InputCell rowId={row.id} col="last_exercise" />
                    </td>
                    <td className="px-1 py-0.5 text-center text-[11px] tracking-[0.2em] text-[#1f497d]">
                      &lt;--------&gt;
                    </td>
                    <td className="px-1 py-0.5">
                      <InputCell rowId={row.id} col="sector_performance" />
                    </td>
                    <td></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ExplanatoryNotes category="CAPITAL DE GIRO" tableData={data} />
    </div>
  )
}
