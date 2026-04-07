import { useState, useEffect, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { ExplanatoryNotes } from './ExplanatoryNotes'

const INDICATORS = [
  { id: 0, label: 'IMOBILIZAÇÃO DO CAPITAL PRÓPRIO', indent: false, hasInputs: true },
  { id: 'g1', label: 'PARTICIPAÇÃO DE TERCEIROS:', indent: false, hasInputs: false },
  { id: 1, label: 'SOBRE OS RECURSOS TOTAIS', indent: true, hasInputs: true },
  { id: 2, label: 'SOBRE O CAPITAL PRÓPRIO', indent: true, hasInputs: true },
  { id: 'g2', label: 'COMPOSIÇÃO DO ENDIVIDAMENTO:', indent: false, hasInputs: false },
  { id: 3, label: 'DE CURTO PRAZO SOBRE O CAPITAL PRÓPRIO', indent: true, hasInputs: true },
  { id: 4, label: 'DE CURTO PRAZO SOBRE O EXIGÍVEL TOTAL', indent: true, hasInputs: true },
]

export function CapitalStructureTable() {
  const [data, setData] = useState<Record<number, any>>({})
  const [sectorData, setSectorData] = useState<Record<number, any>>({})
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const records = await pb.collection('debt_composition').getFullList({
        filter: `tableType='capital_structure' || tableType='capital_structure_sector'`,
      })
      const newData: Record<number, any> = {}
      const newSectorData: Record<number, any> = {}

      records.forEach((r) => {
        if (r.tableType === 'capital_structure') {
          newData[r.rowIndex] = r
        } else {
          newSectorData[r.rowIndex] = r
        }
      })
      setData(newData)
      setSectorData(newSectorData)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('debt_composition', () => {
    loadData()
  })

  const updateData = (rowIndex: number, field: string, value: string, isSector: boolean) => {
    const tableType = isSector ? 'capital_structure_sector' : 'capital_structure'
    const stateObj = isSector ? sectorData : data
    const setStateObj = isSector ? setSectorData : setData

    const currentRow = stateObj[rowIndex] || {}
    const newRow = { ...currentRow, [field]: value }

    setStateObj((prev) => ({ ...prev, [rowIndex]: newRow }))

    const timerKey = `${tableType}_${rowIndex}`
    if (debounceTimers.current[timerKey]) clearTimeout(debounceTimers.current[timerKey])

    debounceTimers.current[timerKey] = setTimeout(async () => {
      try {
        if (newRow.id) {
          await pb.collection('debt_composition').update(newRow.id, { [field]: value })
        } else {
          const payload = {
            tableType,
            rowIndex,
            [field]: value,
          }
          const res = await pb.collection('debt_composition').create(payload)
          setStateObj((prev) => ({ ...prev, [rowIndex]: { ...newRow, id: res.id } }))
        }
      } catch (e) {
        toast({ variant: 'destructive', title: 'Erro ao salvar', description: getErrorMessage(e) })
      }
    }, 800)
  }

  return (
    <div className="w-full max-w-[850px] border-2 border-[#1f497d] font-sans mt-8 shadow-md">
      <div className="bg-[#1f497d] text-white font-bold text-center py-2 border-b-2 border-[#1f497d] text-[17px] tracking-wide">
        INDICADORES ECONÔMICO-FINANCEIROS
      </div>

      <div className="bg-[#c5d9f1] pb-6 pt-1">
        <div className="grid grid-cols-[1fr_90px_90px_45px_90px_45px] gap-x-2 items-end px-3 pt-2 pb-1 border-b-2 border-[#1f497d]">
          <div className="font-bold text-[14px] uppercase text-[#1f497d]">ESTRUTURA DE CAPITAL</div>
          <div className="font-bold text-center text-[13px] text-[#1f497d]">2021</div>
          <div className="font-bold text-center text-[13px] text-[#1f497d]">2022</div>
          <div className="font-bold text-center text-[10px] italic text-[#1f497d]">A.H.</div>
          <div className="font-bold text-center text-[13px] text-[#1f497d]">2023</div>
          <div className="font-bold text-center text-[10px] italic text-[#1f497d]">A.H.</div>
        </div>

        <div className="flex flex-col gap-1.5 mt-3 px-3">
          {INDICATORS.map((ind, i) => (
            <div
              key={`ind-${i}`}
              className="grid grid-cols-[1fr_90px_90px_45px_90px_45px] gap-x-2 items-center"
            >
              <div
                className={`text-[11.5px] uppercase text-black ${ind.indent ? 'pl-4 italic font-medium' : 'font-bold'}`}
              >
                {ind.label}
              </div>
              {ind.hasInputs ? (
                <>
                  <input
                    value={data[ind.id as number]?.col0 || ''}
                    onChange={(e) => updateData(ind.id as number, 'col0', e.target.value, false)}
                    className="w-full bg-white border border-[#1f497d] h-[22px] text-black px-1 text-center outline-none focus:ring-1 focus:ring-[#1f497d] font-bold text-xs"
                  />
                  <input
                    value={data[ind.id as number]?.col1 || ''}
                    onChange={(e) => updateData(ind.id as number, 'col1', e.target.value, false)}
                    className="w-full bg-white border border-[#1f497d] h-[22px] text-black px-1 text-center outline-none focus:ring-1 focus:ring-[#1f497d] font-bold text-xs"
                  />
                  <div className="flex items-center justify-center text-[10px] font-semibold text-[#1f497d]">
                    {(() => {
                      const v1 = parseFloat(
                        String(data[ind.id as number]?.col0 || '').replace(',', '.'),
                      )
                      const v2 = parseFloat(
                        String(data[ind.id as number]?.col1 || '').replace(',', '.'),
                      )
                      if (v1 && v2 && !isNaN(v1) && !isNaN(v2) && v1 !== 0) {
                        return ((v2 / v1 - 1) * 100).toFixed(1) + '%'
                      }
                      return '-'
                    })()}
                  </div>
                  <input
                    value={data[ind.id as number]?.col2 || ''}
                    onChange={(e) => updateData(ind.id as number, 'col2', e.target.value, false)}
                    className="w-full bg-white border border-[#1f497d] h-[22px] text-black px-1 text-center outline-none focus:ring-1 focus:ring-[#1f497d] font-bold text-xs"
                  />
                  <div className="flex items-center justify-center text-[10px] font-semibold text-[#1f497d]">
                    {(() => {
                      const v2 = parseFloat(
                        String(data[ind.id as number]?.col1 || '').replace(',', '.'),
                      )
                      const v3 = parseFloat(
                        String(data[ind.id as number]?.col2 || '').replace(',', '.'),
                      )
                      if (v2 && v3 && !isNaN(v2) && !isNaN(v3) && v2 !== 0) {
                        return ((v3 / v2 - 1) * 100).toFixed(1) + '%'
                      }
                      return '-'
                    })()}
                  </div>
                </>
              ) : (
                <div className="col-span-5"></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_90px_90px_45px_90px_45px] gap-x-2 items-end px-3 pt-6 pb-1 border-b-2 border-[#1f497d] mt-2">
          <div className="font-bold text-[14px] uppercase text-[#1f497d]">
            COMPARAÇÃO ÚLT. EXERC. x DESEMP. DO SETOR
          </div>
          <div className="font-bold text-center text-[10px] text-[#1f497d] uppercase tracking-tight">
            ÚLT. EXERC.
          </div>
          <div className="col-span-2"></div>
          <div className="font-bold text-center text-[10px] text-[#1f497d] uppercase flex items-center justify-center tracking-tight">
            DESEMP. SETOR
            <span className="w-0 h-0 border-t-[4px] border-t-red-500 border-l-[4px] border-l-transparent ml-0.5 mt-[-10px]"></span>
          </div>
          <div></div>
        </div>

        <div className="flex flex-col gap-1.5 mt-3 px-3">
          {INDICATORS.map((ind, i) => (
            <div
              key={`sec-${i}`}
              className="grid grid-cols-[1fr_90px_90px_45px_90px_45px] gap-x-2 items-center"
            >
              <div
                className={`text-[11.5px] uppercase text-black ${ind.indent ? 'pl-4 italic font-medium' : 'font-bold'}`}
              >
                {ind.label}
              </div>
              {ind.hasInputs ? (
                <>
                  <input
                    value={sectorData[ind.id as number]?.col0 || ''}
                    onChange={(e) => updateData(ind.id as number, 'col0', e.target.value, true)}
                    className="w-full bg-white border border-[#1f497d] h-[22px] text-black px-1 text-center outline-none focus:ring-1 focus:ring-[#1f497d] font-bold text-xs"
                  />
                  <div className="col-span-2 flex items-center justify-center text-[#1f497d] font-normal tracking-[0.2em] text-[10px]">
                    {'<--------->'}
                  </div>
                  <input
                    value={sectorData[ind.id as number]?.col1 || ''}
                    onChange={(e) => updateData(ind.id as number, 'col1', e.target.value, true)}
                    className="w-full bg-white border border-[#1f497d] h-[22px] text-black px-1 text-center outline-none focus:ring-1 focus:ring-[#1f497d] font-bold text-xs"
                  />
                  <div></div>
                </>
              ) : (
                <div className="col-span-5"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ExplanatoryNotes category="ESTRUTURA DE CAPITAL" tableData={data} />
    </div>
  )
}
