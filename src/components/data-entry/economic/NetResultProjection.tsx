import { useState, useEffect } from 'react'
import useEconomicStore from '@/stores/economic'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ExplanatoryNotes } from './ExplanatoryNotes'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'

function fmtVal(val: number): string {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return '#DIV/0!'
  if (val === 0) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val)
}

function fmtPct(val: number): string {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) return '#DIV/0!'
  if (val === 0) return '0,000%'
  return (
    new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(val) + '%'
  )
}

function ExcelInput({ value, onChange, isPct = false, readOnly = false }: any) {
  const [foc, setFoc] = useState(false)
  const [loc, setLoc] = useState(value?.toString() || '')

  useEffect(() => {
    if (!foc) setLoc(value?.toString() || '')
  }, [value, foc])

  const handleBlur = () => {
    setFoc(false)
    const parsed = parseFloat(loc.replace(',', '.'))
    onChange(isNaN(parsed) ? 0 : parsed)
  }

  let disp = value
  if (!foc) {
    disp = isPct ? fmtPct(value) : fmtVal(value)
  } else {
    disp = loc
  }

  return (
    <input
      type={foc ? 'number' : 'text'}
      value={disp}
      onChange={(e) => setLoc(e.target.value)}
      onFocus={() => setFoc(true)}
      onBlur={handleBlur}
      readOnly={readOnly}
      className={`w-full h-5 border border-[#1f497d]/40 px-1 text-[11px] font-bold text-right outline-none focus:border-[#1f497d] focus:ring-1 focus:ring-[#1f497d] ${readOnly ? 'bg-[#8eaadb]/30 text-[#1f497d]' : 'bg-white'}`}
    />
  )
}

function CalcCell({ value, isPct = false }: any) {
  return (
    <div className="h-5 border border-[#1f497d]/40 bg-[#8eaadb]/30 px-1 flex items-center justify-end text-[11px] font-bold text-[#1f497d] overflow-hidden">
      {isPct ? fmtPct(value) : fmtVal(value)}
    </div>
  )
}

function HeaderTooltip({ children, tooltip }: any) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-center text-[10px] font-bold pt-1 cursor-help underline decoration-dotted underline-offset-2 decoration-slate-400">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-center">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function NetResultProjection() {
  const { netResult, setNetResult } = useEconomicStore()
  const [data, setData] = useState<{
    sem: Record<string, number>
    com: Record<string, number>
    cresc_sem: Record<string, number>
    cresc_com: Record<string, number>
  }>(() => {
    const existing = (netResult[0] as any) || {}
    return {
      sem: existing.sem || {},
      com: existing.com || {},
      cresc_sem: existing.cresc_sem || {},
      cresc_com: existing.cresc_com || {},
      ...existing,
    }
  })

  useEffect(() => {
    setNetResult([data])
  }, [data, setNetResult])

  const updateVal = (type: 'sem' | 'com', key: string, val: number) => {
    setData((p) => ({ ...p, [type]: { ...(p?.[type] || {}), [key]: val } }))
  }

  const updateCresc = (type: 'sem' | 'com', key: string, val: number) => {
    setData((p) => ({
      ...p,
      [`cresc_${type}`]: {
        ...((p?.[`cresc_${type}` as keyof typeof p] as any) || {}),
        [key]: val,
      },
    }))
  }

  const handleClearData = () => {
    setData({ sem: {}, com: {}, cresc_sem: {}, cresc_com: {} })
  }

  const getVal = (type: 'sem' | 'com', key: string) => data?.[type]?.[key] || 0

  const calcVal = (type: 'sem' | 'com', id: string): number => {
    const get = (k: string) => getVal(type, k)
    switch (id) {
      case 'lucroBruto':
        return get('fatBruto') - get('deducoes') - get('cmv')
      case 'ebitda':
        return calcVal(type, 'lucroBruto') - get('despOp') + get('outrasRec')
      case 'ebit':
        return calcVal(type, 'ebitda') - get('dep')
      case 'lucroOpLiq':
        return calcVal(type, 'ebit') + get('resFin')
      case 'lucroAntesImp':
        return calcVal(type, 'lucroOpLiq') + get('resNaoOp')
      case 'lucroLiqEx':
        return calcVal(type, 'lucroAntesImp') - get('ir')
      case 'resLiqProj':
        return calcVal(type, 'lucroLiqEx') + get('outrasRecLiq') - get('amort')
      default:
        return get(id)
    }
  }

  const safeDiv = (a: number, b: number) => (b === 0 || !b ? NaN : (a / b) * 100)

  const calcAV = (type: 'sem' | 'com', id: string) => {
    const fat = calcVal(type, 'fatBruto')
    return safeDiv(calcVal(type, id), fat)
  }

  const rows = [
    { id: 'fatBruto', label: 'FATURAMENTO BRUTO', isInput: true, crescSem: true, crescCom: true },
    { id: 'deducoes', label: 'DEDUÇÕES DAS VENDAS', isInput: true, italic: true },
    {
      id: 'cmv',
      label: 'CUSTO DOS PRODUTOS VENDIDOS',
      isInput: true,
      italic: true,
      spaceAfter: true,
    },
    { id: 'lucroBruto', label: 'LUCRO OPERACIONAL BRUTO', isCalc: true },
    {
      id: 'despOp',
      label: 'DESPESAS OPERACIONAIS',
      isInput: true,
      italic: true,
      crescSem: true,
      crescCom: true,
    },
    {
      id: 'outrasRec',
      label: 'OUTRAS RECEITAS OPERACIONAIS TRIBUTÁVEIS',
      isInput: true,
      italic: true,
      spaceAfter: true,
      crescSem: true,
      crescCom: true,
    },
    { id: 'ebitda', label: 'RESULTADO LÍQUIDO (EBITDA)', isCalc: true },
    {
      id: 'dep',
      label: 'DESPESAS C/ DEPRECIAÇÃO, AMORTIZAÇÃO E EXAUSTÃO',
      isInput: true,
      italic: true,
      spaceAfter: true,
      crescCom: true,
    },
    { id: 'ebit', label: 'RESULTADO LÍQUIDO (EBIT)', isCalc: true },
    {
      id: 'resFin',
      label: 'RESULTADO FINANCEIRO',
      isInput: true,
      italic: true,
      asterisk: '*',
      spaceAfter: true,
    },
    { id: 'lucroOpLiq', label: 'LUCRO OPERACIONAL LÍQUIDO', isCalc: true },
    {
      id: 'resNaoOp',
      label: 'RESULTADO NÃO-OPERACIONAL TRIBUTÁVEL',
      isInput: true,
      italic: true,
      crescSem: true,
      crescCom: true,
      spaceAfter: true,
    },
    { id: 'lucroAntesImp', label: 'LUCRO ANTES DOS IMPOSTOS E PROVISÕES', isCalc: true },
    {
      id: 'ir',
      label: 'PROVISÃO DE IMPOSTOS S/ RENDA (IR/CSLL)',
      isInput: true,
      italic: true,
      spaceAfter: true,
    },
    { id: 'lucroLiqEx', label: 'LUCRO LÍQUIDO DO EXERCÍCIO', isCalc: true },
    {
      id: 'outrasRecLiq',
      label: 'OUTRAS RECEITAS LÍQUIDAS NÃO TRIBUTADAS',
      isInput: true,
      italic: true,
      crescSem: true,
      crescCom: true,
    },
    {
      id: 'amort',
      label: 'AMORTIZAÇÃO DE DÍVIDAS C/ TERCEIROS',
      isInput: true,
      italic: true,
      asterisk: '**',
      spaceAfter: true,
      crescCom: true,
    },
    { id: 'resLiqProj', label: 'RESULTADO LÍQUIDO PROJETADO', isCalc: true },
  ]

  return (
    <div className="space-y-6 mt-8 animate-fade-in-up">
      <div className="bg-[#c5d9f1] p-2 sm:p-4 rounded-sm border border-[#1f497d] font-sans text-black shadow-lg overflow-x-auto">
        <div className="min-w-[1000px]">
          <h2 className="text-center font-bold text-lg tracking-wide text-white border-b-2 border-[#1f497d] py-1 bg-[#1f497d] rounded-t-sm">
            PROJEÇÃO DE RESULTADOS FUTUROS - PRÓXIMOS 12 MESES
          </h2>

          <div className="grid grid-cols-[1fr_100px_120px_80px_100px_120px_80px] mt-2 gap-x-[1px]">
            <div className="border-b-2 border-[#1f497d]"></div>
            <div className="col-span-3 text-center font-bold text-[12px] border-b-2 border-[#1f497d] pb-1 text-[#1f497d]">
              SEM CAPTAÇÃO DE RECURSOS
            </div>
            <div className="col-span-3 text-center font-bold text-[12px] border-b-2 border-[#1f497d] pb-1 text-[#1f497d]">
              COM CAPTAÇÃO DE RECURSOS DE TERCEIROS
            </div>

            <div></div>
            <HeaderTooltip tooltip="Percentual de crescimento esperado SEM captação de recursos de terceiros">
              CRESC. ANUAL %
            </HeaderTooltip>
            <HeaderTooltip tooltip="12x a media apurada na guia Faturamento anual acrescida do percentual do Cresc.anual esperado">
              $
            </HeaderTooltip>
            <HeaderTooltip tooltip="Análise Vertical">A.V.</HeaderTooltip>
            <HeaderTooltip tooltip="Percentual de incremento operacional (além do crescimento anual esperado) decorrente da aplicação dos recursos de terceiros captados">
              INCREM.OPERAC. %
            </HeaderTooltip>
            <HeaderTooltip tooltip="Valor projetado acrescido dos percentuais de Cresc. anual e do increm. Operacional decorrente da captação de recursos.">
              $
            </HeaderTooltip>
            <HeaderTooltip tooltip="Análise Vertical">A.V.</HeaderTooltip>

            {rows.map((row, i) => {
              const valSem = calcVal('sem', row.id)
              const avSem = calcAV('sem', row.id)
              const valCom = calcVal('com', row.id)
              const avCom = calcAV('com', row.id)

              return (
                <div key={row.id} className="contents">
                  <div
                    className={`flex items-center py-[3px] text-[11px] ${row.isCalc ? 'font-bold' : row.italic ? 'italic pl-2' : 'font-bold'} ${row.spaceAfter ? 'border-b border-transparent mb-2' : ''}`}
                  >
                    {row.label}
                  </div>

                  {/* SEM */}
                  <div className="py-[1px]">
                    {row.crescSem ? (
                      <div className="relative">
                        <ExcelInput
                          value={data?.cresc_sem?.[row.id] || 0}
                          onChange={(v: number) => updateCresc('sem', row.id, v)}
                          isPct
                        />
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[5px] border-t-red-500 border-l-[5px] border-l-transparent pointer-events-none" />
                      </div>
                    ) : (
                      <div className="h-5"></div>
                    )}
                  </div>
                  <div className="py-[1px]">
                    {row.isCalc ? (
                      <CalcCell value={valSem} />
                    ) : (
                      <ExcelInput
                        value={getVal('sem', row.id)}
                        onChange={(v: number) => updateVal('sem', row.id, v)}
                        readOnly // Image shows grey boxes for the $ column on 'sem', implying calc/base
                      />
                    )}
                  </div>
                  <div className="py-[1px]">
                    <CalcCell value={avSem} isPct />
                  </div>

                  {/* COM */}
                  <div className="py-[1px] flex items-center justify-end pr-1 text-[11px] font-bold">
                    {row.crescCom ? (
                      <div className="relative w-full">
                        <ExcelInput
                          value={data?.cresc_com?.[row.id] || 0}
                          onChange={(v: number) => updateCresc('com', row.id, v)}
                          isPct
                        />
                        <div className="absolute top-0 right-0 w-0 h-0 border-t-[5px] border-t-red-500 border-l-[5px] border-l-transparent pointer-events-none" />
                      </div>
                    ) : row.asterisk === '*' ? (
                      <div className="w-full flex items-center gap-1">
                        <ExcelInput
                          value={getVal('com', row.id)}
                          onChange={(v: number) => updateVal('com', row.id, v)}
                        />
                        <span>*</span>
                      </div>
                    ) : row.asterisk === '**' ? (
                      <div className="w-full flex items-center justify-end">
                        <span className="mr-1">**</span>
                      </div>
                    ) : (
                      <div className="h-5"></div>
                    )}
                  </div>
                  <div className="py-[1px]">
                    {row.isCalc ? (
                      <CalcCell value={valCom} />
                    ) : (
                      <ExcelInput
                        value={getVal('com', row.id)}
                        onChange={(v: number) => updateVal('com', row.id, v)}
                        readOnly={row.asterisk === '*'} // Asterisk fields are calculated typically, but we let it be an input if no fixed calc
                      />
                    )}
                  </div>
                  <div className="py-[1px]">
                    <CalcCell value={avCom} isPct />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-start justify-between mt-4 pt-2 border-t-2 border-[#1f497d]">
            <div className="text-[10px] italic text-slate-800 max-w-[80%]">
              * Custos (Juros Financeiros) da captação dos recursos de terceiros e ** Amortização do
              Principal dos recursos captados, conforme simulação na Capac. Pagto. Mensal.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="text-blue-700 border-blue-600 bg-white hover:bg-blue-50 hover:text-blue-800 h-8 text-xs shrink-0 shadow-sm"
              title="Limpar todos os dados desta seção"
            >
              <Eraser className="w-3.5 h-3.5 mr-1.5" /> Limpar Dados
            </Button>
          </div>
        </div>
      </div>

      <ExplanatoryNotes category="PROJEÇÃO DE RESULTADOS FUTUROS" tableData={data} />
    </div>
  )
}
