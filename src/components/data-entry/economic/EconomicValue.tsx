import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useFinancialStore } from '@/store/main'
import { cn } from '@/lib/utils'
import { ExplanatoryNotes } from './ExplanatoryNotes'

const formatC = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const formatP = (v: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v / 100)

function FmtInput({ val, onChange, pct, cls }: any) {
  const [foc, setFoc] = useState(false)
  const [loc, setLoc] = useState(val?.toString() || '0')

  useEffect(() => {
    if (!foc) setLoc(val?.toString() || '0')
  }, [val, foc])

  const blur = () => {
    setFoc(false)
    onChange(Number(loc) || 0)
  }

  const dVal = foc
    ? loc
    : pct
      ? formatP(val)
      : new Intl.NumberFormat('pt-BR', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(val)

  return (
    <Input
      type={foc ? 'number' : 'text'}
      value={dVal}
      onChange={(e) => setLoc(e.target.value)}
      onFocus={() => setFoc(true)}
      onBlur={blur}
      className={cn(
        'h-8 text-right bg-white dark:bg-slate-950 rounded-sm border border-slate-300 dark:border-slate-700 text-xs px-2 focus-visible:ring-1 focus-visible:ring-primary',
        cls,
      )}
    />
  )
}

function CalcBox({ val, curr }: { val: number; curr?: boolean }) {
  return (
    <div className="flex h-8 w-full items-center justify-end border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 text-xs font-medium rounded-sm">
      {curr ? formatC(val) : formatP(val)}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-2.5 border border-slate-700 rounded-t-md font-bold text-sm uppercase mb-4 tracking-wider shadow-sm">
      {children}
    </div>
  )
}

function Row({ label, cols, cls = 'grid-cols-[1fr_80px_100px]' }: any) {
  return (
    <div
      className={cn(
        'grid gap-2 items-center text-[11px] font-medium text-slate-700 dark:text-slate-300',
        cls,
      )}
    >
      <div className="leading-tight">{label}</div>
      {cols.map((c: any, i: number) => (
        <div key={i}>{c}</div>
      ))}
    </div>
  )
}

export function EconomicValue() {
  const { economicValueData, setEconomicValueData } = useFinancialStore()

  const updateVal = (k: string, v: any) => setEconomicValueData((p) => ({ ...p, [k]: v }))

  const {
    cpValor = 0,
    lpValor = 0,
    propValor = 0,
    cpEf = 0,
    lpEf = 0,
    propMensal = 0,
    fcoCresc = 0,
    ebitda = 0,
    receitas = 'com',
    fcoTotal = 0,
    disp = 0,
    amCp = 0,
    amLp = 0,
    div = 0,
  } = economicValueData

  const tValor = cpValor + lpValor + propValor
  const cpPerc = tValor ? (cpValor / tValor) * 100 : 0
  const lpPerc = tValor ? (lpValor / tValor) * 100 : 0
  const propPerc = tValor ? (propValor / tValor) * 100 : 0

  const propAnual = (Math.pow(1 + propMensal / 100, 12) - 1) * 100
  const cpPond = (cpPerc / 100) * cpEf
  const lpPond = (lpPerc / 100) * lpEf
  const propPond = (propPerc / 100) * propAnual
  const cmpc = cpPond + lpPond + propPond

  const tAjustes = disp - amCp - amLp - div
  const avaliacao = fcoTotal + tAjustes

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg animate-fade-in-up">
      <h1 className="text-xl font-bold text-center uppercase tracking-wide mb-2 pt-2 text-slate-900 dark:text-slate-100">
        VALOR ECONÔMICO-FINANCEIRO
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-6 bg-white dark:bg-slate-950 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-800">
          <SectionTitle>CUSTO MÉDIO PONDERADO DE CAPITAL (CMPC)</SectionTitle>
          <div className="space-y-3">
            <h3 className="font-bold border-b border-slate-300 dark:border-slate-700 text-sm pb-1 uppercase text-slate-800 dark:text-slate-200">
              VALOR MÉDIO
            </h3>
            <div className="grid grid-cols-[1fr_80px_100px] gap-2 items-end text-[10px] font-bold mt-2 text-slate-500">
              <div>CAPITAL DE TERCEIROS</div>
              <div className="text-center">% PROPORCIONAL</div>
              <div className="text-center">$</div>
            </div>
            <Row
              label="EMPRÉST. E FINANC. DE CURTO PRAZO"
              cols={[
                <CalcBox val={cpPerc} />,
                <FmtInput val={cpValor} onChange={(v: number) => updateVal('cpValor', v)} />,
              ]}
            />
            <Row
              label="EMPRÉST. E FINANC. DE LONGO PRAZO"
              cols={[
                <CalcBox val={lpPerc} />,
                <FmtInput val={lpValor} onChange={(v: number) => updateVal('lpValor', v)} />,
              ]}
            />

            <div className="grid grid-cols-[1fr_80px_100px] gap-2 items-center mt-5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <div className="uppercase">CAPITAL PRÓPRIO</div>
              <CalcBox val={propPerc} />
              <FmtInput val={propValor} onChange={(v: number) => updateVal('propValor', v)} />
            </div>
            <div className="grid grid-cols-[1fr_80px_100px] gap-2 items-center mt-3 border-t border-slate-300 dark:border-slate-700 border-dashed pt-3 text-xs font-bold text-slate-900 dark:text-slate-100">
              <div>VALOR MÉDIO TOTAL</div>
              <CalcBox val={100} />
              <CalcBox val={tValor} curr />
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <h3 className="font-bold border-b border-slate-300 dark:border-slate-700 text-sm pb-1 uppercase text-slate-800 dark:text-slate-200">
              CUSTOS ANUAIS
            </h3>
            <div className="grid grid-cols-[1fr_80px_80px] gap-2 items-end text-[10px] font-bold mt-2 text-slate-500">
              <div>CAPITAL DE TERCEIROS</div>
              <div className="text-center">% EFETIVA ANUAL</div>
              <div className="text-center">% PONDERADA</div>
            </div>
            <Row
              cls="grid-cols-[1fr_80px_80px]"
              label="EMPRÉST. E FINANC. DE CURTO PRAZO"
              cols={[
                <FmtInput pct val={cpEf} onChange={(v: number) => updateVal('cpEf', v)} />,
                <CalcBox val={cpPond} />,
              ]}
            />
            <Row
              cls="grid-cols-[1fr_80px_80px]"
              label="EMPRÉST. E FINANC. DE LONGO PRAZO"
              cols={[
                <FmtInput pct val={lpEf} onChange={(v: number) => updateVal('lpEf', v)} />,
                <CalcBox val={lpPond} />,
              ]}
            />

            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-end text-[10px] font-bold mt-5 text-slate-500">
              <div className="text-slate-700 dark:text-slate-300">CAPITAL PRÓPRIO</div>
              <div className="text-center">% MENSAL</div>
              <div className="text-center">% ANUAL</div>
              <div className="text-center">% POND.</div>
            </div>
            <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 items-center text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <div>TAXA DE RETORNO MENSAL</div>
              <FmtInput pct val={propMensal} onChange={(v: number) => updateVal('propMensal', v)} />
              <CalcBox val={propAnual} />
              <CalcBox val={propPond} />
            </div>
            <div className="grid grid-cols-[1fr_80px] gap-2 items-center mt-3 border-t border-slate-300 dark:border-slate-700 border-dashed pt-3 text-xs font-bold text-slate-900 dark:text-slate-100">
              <div>CUSTO MÉDIO PONDERADO DE CAPITAL</div>
              <CalcBox val={cmpc} />
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-white dark:bg-slate-950 p-4 rounded-md shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <div>
            <SectionTitle>FLUXO DE CAIXA OPERACIONAL (FCO)</SectionTitle>
            <div className="grid grid-cols-[1fr_120px] gap-y-3 gap-x-3 items-center text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <div>TAXA DE CRESCIMENTO</div>
              <FmtInput pct val={fcoCresc} onChange={(v: number) => updateVal('fcoCresc', v)} />
              <div>TAXA DE DESCONTO</div>
              <CalcBox val={cmpc} />
              <div className="mt-3 uppercase">EBITDA PROJETADO</div>
              <div className="mt-3">
                <FmtInput val={ebitda} onChange={(v: number) => updateVal('ebitda', v)} />
              </div>
            </div>
            <div className="space-y-2 text-[10px] font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 mt-4 rounded-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <Checkbox
                  checked={receitas === 'sem'}
                  onCheckedChange={() => updateVal('receitas', 'sem')}
                  className="h-4 w-4 rounded-sm border-slate-400"
                />{' '}
                SEM OUTRAS RECEITAS LÍQ. NÃO TRIBUTADAS
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <Checkbox
                  checked={receitas === 'com'}
                  onCheckedChange={() => updateVal('receitas', 'com')}
                  className="h-4 w-4 rounded-sm border-slate-400"
                />{' '}
                COM OUTRAS RECEITAS LÍQ. NÃO TRIBUTADAS
              </label>
            </div>
            <div className="flex justify-between items-center border-b border-slate-300 dark:border-slate-700 border-dashed pb-3 mt-5 text-xs font-bold text-slate-900 dark:text-slate-100">
              <div>FLUXO DE CAIXA OPERACIONAL</div>
              <div className="w-[120px]">
                <FmtInput val={fcoTotal} onChange={(v: number) => updateVal('fcoTotal', v)} />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <SectionTitle>AJUSTES DIVERSOS</SectionTitle>
            <div className="grid grid-cols-[1fr_120px] gap-y-3 gap-x-3 items-center text-[11px] text-slate-700 dark:text-slate-300">
              <div className="font-bold">(+) DISPONIBILIDADES</div>
              <FmtInput val={disp} onChange={(v: number) => updateVal('disp', v)} />
              <div className="font-bold mt-2">(-) AMORTIZ. SALDO DEVEDOR</div>
              <div></div>
              <div className="font-bold uppercase text-slate-500">CAPITAL DE TERCEIROS</div>
              <div></div>
              <div className="pl-2">EMPRÉST. E FINANC. DE CURTO PRAZO</div>
              <FmtInput val={amCp} onChange={(v: number) => updateVal('amCp', v)} />
              <div className="pl-2">EMPRÉST. E FINANC. DE LONGO PRAZO</div>
              <FmtInput val={amLp} onChange={(v: number) => updateVal('amLp', v)} />
              <div className="font-bold mt-2 uppercase text-slate-500">CAPITAL PRÓPRIO</div>
              <div></div>
              <div className="pl-2">DIVIDENDOS E ADMINISTRADORES</div>
              <FmtInput val={div} onChange={(v: number) => updateVal('div', v)} />
            </div>
            <div className="flex justify-between items-center border-t border-slate-300 dark:border-slate-700 border-dashed pt-3 mt-4 text-xs font-bold text-slate-900 dark:text-slate-100">
              <div>TOTAL DOS AJUSTES DIVERSOS</div>
              <div className="w-[120px]">
                <CalcBox val={tAjustes} curr />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row justify-between items-center bg-slate-800 dark:bg-slate-900 text-slate-100 p-5 rounded-md shadow-md text-sm font-bold tracking-wide">
        <div>AVALIAÇÃO ECONÔMICO-FINANCEIRA E VALOR DE MERCADO</div>
        <div className="w-[160px] mt-3 md:mt-0">
          <div className="flex h-10 w-full items-center justify-end bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 px-3 text-sm font-bold rounded-sm shadow-inner">
            {formatC(avaliacao)}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <ExplanatoryNotes category="VALOR ECONÔMICO-FINANCEIRO" tableData={economicValueData} />
      </div>
    </div>
  )
}
