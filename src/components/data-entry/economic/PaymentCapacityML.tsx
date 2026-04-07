import { useState, useEffect } from 'react'
import useEconomicStore from '@/stores/economic'
import { ExplanatoryNote } from '../ExplanatoryNote'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

function ExcelInput({
  value,
  onChange,
  isPct = false,
  isYellow = false,
  hasTriangle = false,
  isString = false,
  readOnly = false,
  className = '',
}: any) {
  const [foc, setFoc] = useState(false)
  const [loc, setLoc] = useState(value?.toString() || '')

  useEffect(() => {
    if (!foc) setLoc(value?.toString() || '')
  }, [value, foc])

  const handleBlur = () => {
    setFoc(false)
    if (!isString) {
      const parsed = parseFloat(loc.replace(',', '.'))
      onChange(isNaN(parsed) ? 0 : parsed)
    } else {
      onChange(loc)
    }
  }

  let disp = value
  if (!foc) {
    if (isString) disp = value
    else if (isPct) disp = fmtPct(value)
    else disp = fmtVal(value)
  } else {
    disp = loc
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type={foc && !isString ? 'number' : 'text'}
        value={disp}
        onChange={(e) => setLoc(e.target.value)}
        onFocus={() => setFoc(true)}
        onBlur={handleBlur}
        readOnly={readOnly}
        className={`w-full h-5 border border-[#1f497d]/40 px-1 text-[11px] font-bold outline-none focus:border-[#1f497d] focus:ring-1 focus:ring-[#1f497d]
          ${isString ? 'text-left' : 'text-right'}
          ${readOnly ? 'bg-[#8eaadb]/30 text-[#1f497d]' : isYellow ? 'bg-[#ffff00]' : 'bg-white'}`}
      />
      {hasTriangle && !readOnly && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[5px] border-t-red-500 border-l-[5px] border-l-transparent pointer-events-none" />
      )}
    </div>
  )
}

function CalcCell({ value, isPct = false, className = '' }: any) {
  return (
    <div
      className={`h-5 border border-[#1f497d]/40 bg-[#8eaadb]/30 px-1 flex items-center justify-end text-[11px] font-bold text-[#1f497d] overflow-hidden ${className}`}
    >
      {isPct ? fmtPct(value) : fmtVal(value)}
    </div>
  )
}

function LabelWithTooltip({ children, tooltip, className = '' }: any) {
  if (!tooltip) return <div className={className}>{children}</div>
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`cursor-help underline decoration-dotted underline-offset-2 decoration-slate-600 ${className}`}
          >
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function PaymentCapacityML() {
  const { paymentCapacity, setPaymentCapacity } = useEconomicStore()
  const [data, setData] = useState<Record<string, any>>(() => paymentCapacity[0] || {})
  const [note, setNote] = useState('')

  useEffect(() => {
    setPaymentCapacity([data])
  }, [data, setPaymentCapacity])

  const update = (k: string, v: any) => setData((p) => ({ ...p, [k]: v }))
  const get = (k: string) => data[k] || 0
  const getStr = (k: string) => data[k] || ''

  const handleClearData = () => {
    setData({})
    setNote('')
  }

  const resFin = -get('despFin') + get('recFin')
  const resNaoOp = -get('despNaoOp') + get('recNaoOp')
  const lucroAntesImp = get('ebitda') + resFin + resNaoOp
  const lucroLiq = lucroAntesImp - get('irCsll')
  const capacidade = lucroLiq + get('outrasRec') - get('amortAtual')

  const prestacao = capacidade * (get('percUtilizar') / 100)

  const iJuros = Math.pow(1 + get('taxaJuros') / 100, 1 / 12) - 1
  const iIndex = Math.pow(1 + get('percEstimada') / 100, 1 / 12) - 1
  const efetivaMensal = (1 + iJuros) * (1 + iIndex) - 1

  let limiteCredito = 0
  const n = get('totalPer')
  const c = get('carencia')
  if (efetivaMensal > 0 && n > 0) {
    limiteCredito = prestacao * ((1 - Math.pow(1 + efetivaMensal, -n)) / efetivaMensal)
    if (c > 0) limiteCredito = limiteCredito / Math.pow(1 + efetivaMensal, c)
  } else if (efetivaMensal === 0 && n > 0) {
    limiteCredito = prestacao * n
  }

  return (
    <div className="space-y-6 mt-8 animate-fade-in-up">
      <div className="bg-[#c5d9f1] p-2 sm:p-4 rounded-sm border border-[#1f497d] font-sans text-black shadow-lg overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="relative bg-[#1f497d] py-2 mb-4 flex items-center justify-center border-b-2 border-[#1f497d] rounded-t-sm shadow-sm">
            <h2 className="text-center font-bold text-lg tracking-wide text-white m-0">
              CAPACIDADE DE PAGAMENTO MENSAL E DE CAPTAÇÃO DE RECURSOS
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearData}
              className="absolute right-2 text-blue-700 border-blue-600 bg-white hover:bg-blue-50 hover:text-blue-800 h-7 text-[11px] px-2 shadow-sm"
              title="Limpar todos os dados desta seção"
            >
              <Eraser className="w-3.5 h-3.5 mr-1" /> Limpar Dados
            </Button>
          </div>

          <div className="grid grid-cols-[1fr_120px_20px_1fr_120px] gap-x-2 items-center mb-1">
            <div className="font-bold text-[11px] text-[#1f497d]">
              CAPACIDADE DE PAGAMENTO MENSAL
            </div>
            <div className="text-[10px] text-right pr-1">$/MÊS</div>
            <div></div>
            <div></div>
            <div className="text-[10px] text-right pr-1">$/MÊS</div>
          </div>

          <div className="grid grid-cols-[1fr_120px_20px_1fr_120px] gap-x-2 gap-y-1">
            <div className="text-[11px] font-bold">MÉDIA MENSAL DE FATURAMENTO BRUTO</div>
            <ExcelInput
              value={get('fatBruto')}
              onChange={(v: number) => update('fatBruto', v)}
              hasTriangle
            />
            <div className="text-[10px]">*</div>
            <div className="text-[11px] font-bold">LUCRO ANTES DOS IMPOSTOS E PROVISÕES</div>
            <CalcCell value={lucroAntesImp} />

            <div className="text-[11px] font-bold">MÉDIA MENSAL DE RESULTADO LÍQUIDO (EBITDA)</div>
            <ExcelInput
              value={get('ebitda')}
              onChange={(v: number) => update('ebitda', v)}
              hasTriangle
            />
            <div className="text-[10px]">*</div>
            <LabelWithTooltip
              tooltip="Valor reservado para pagamento de impostos futuros"
              className="text-[11px] italic pl-2"
            >
              PROVISÃO DE IMPOSTOS S/ RENDA (IR/CSLL)
            </LabelWithTooltip>
            <ExcelInput
              value={get('irCsll')}
              onChange={(v: number) => update('irCsll', v)}
              readOnly
            />

            <div className="text-[10px] italic pt-1 col-span-2">
              * Apuradas pelo faturamento Último Exerc. Fiscal e Exerc. Atual
            </div>
            <div></div>
            <div className="text-[11px] font-bold pt-2">LUCRO LÍQUIDO MENSAL</div>
            <CalcCell value={lucroLiq} className="mt-2" />

            <div className="text-[11px] font-bold pt-2">RESULTADO FINANCEIRO (PRÓX. MÊS)</div>
            <CalcCell value={resFin} className="mt-2" />
            <div></div>
            <LabelWithTooltip
              tooltip="Receitas que não sofrem incidência de impostos"
              className="text-[11px] italic pl-2 pt-2"
            >
              OUTRAS RECEITAS LÍQUIDAS NÃO TRIBUTADAS
            </LabelWithTooltip>
            <ExcelInput
              value={get('outrasRec')}
              onChange={(v: number) => update('outrasRec', v)}
              isYellow
              hasTriangle
              className="mt-2"
            />

            <div className="text-[11px] italic pl-2">
              DESPESAS FINANCEIRAS DO ENDIVIDAMENTO ATUAL
            </div>
            <ExcelInput
              value={get('despFin')}
              onChange={(v: number) => update('despFin', v)}
              readOnly
            />
            <div></div>
            <div className="text-[11px] italic pl-2">
              AMORTIZAÇÃO DE PRINCIPAL DO ENDIVIDAMENTO ATUAL
            </div>
            <ExcelInput
              value={get('amortAtual')}
              onChange={(v: number) => update('amortAtual', v)}
              readOnly
            />

            <LabelWithTooltip
              tooltip="Receitas geradas por aplicações financeiras ou juros recebidos"
              className="text-[11px] italic pl-2"
            >
              RECEITAS FINANCEIRAS
            </LabelWithTooltip>
            <ExcelInput
              value={get('recFin')}
              onChange={(v: number) => update('recFin', v)}
              hasTriangle
            />
            <div></div>
            <div className="text-[12px] font-bold pt-3 pl-2 border-t border-[#1f497d] mt-2 text-[#1f497d]">
              CAPACIDADE DE PAGAMENTO MENSAL...........
            </div>
            <div className="pt-3 border-t border-[#1f497d] mt-2">
              <div className="h-[22px] bg-white border border-[#1f497d] flex items-center justify-end px-1 text-[11px] font-bold text-[#1f497d]">
                {fmtVal(capacidade)}
              </div>
            </div>

            <div className="text-[11px] font-bold pt-2">
              RESULT. NÃO-OPERACIONAL TRIBUTÁVEL (PRÓX. MÊS)
            </div>
            <CalcCell value={resNaoOp} className="mt-2" />
            <div></div>
            <div></div>
            <div></div>

            <LabelWithTooltip
              tooltip="Despesas que não estão relacionadas à operação principal da empresa"
              className="text-[11px] italic pl-2"
            >
              DESPESAS NÃO-OPERACIONAIS
            </LabelWithTooltip>
            <ExcelInput
              value={get('despNaoOp')}
              onChange={(v: number) => update('despNaoOp', v)}
              hasTriangle
            />
            <div></div>
            <div></div>
            <div></div>

            <LabelWithTooltip
              tooltip="Receitas que não estão relacionadas à operação principal da empresa"
              className="text-[11px] italic pl-2 pb-4"
            >
              RECEITAS NÃO-OPERACIONAIS
            </LabelWithTooltip>
            <ExcelInput
              value={get('recNaoOp')}
              onChange={(v: number) => update('recNaoOp', v)}
              hasTriangle
            />
            <div></div>
            <div></div>
            <div></div>
          </div>

          <div className="border-t-2 border-[#1f497d] mt-4 pt-2">
            <h3 className="font-bold text-[12px] mb-2 uppercase text-[#1f497d]">
              CAPACIDADE DE CAPTAÇÃO DE RECURSOS DE TERCEIROS
            </h3>

            <div className="grid grid-cols-[1fr_120px_20px_1fr] gap-x-2 gap-y-1">
              <LabelWithTooltip
                tooltip="Percentual da capacidade de pagamento mensal que será utilizado para a prestação"
                className="text-[11px] font-bold"
              >
                % A UTILIZAR DA CAPAC. PGTO. MENSAL
              </LabelWithTooltip>
              <ExcelInput
                value={get('percUtilizar')}
                onChange={(v: number) => update('percUtilizar', v)}
                isPct
                hasTriangle
              />
              <div></div>
              <div className="text-[10px] italic row-span-2 pl-4 text-slate-700">
                ** Considerando o valor para pagamento das prestações com amortização do Principal +
                Juros, no caso de modalidade com carência (Diferido).
              </div>

              <div className="text-[11px] italic pl-2">VALOR DA PRESTAÇÃO</div>
              <CalcCell value={prestacao} />
              <div className="text-[10px]">**</div>

              <div className="text-[11px] font-bold pt-2">CONDIÇÕES DO CONTRATO:</div>
              <div></div>
              <div></div>
              <div className="text-[11px] font-bold pt-2 pl-4">INDEXADORES:</div>

              <div className="text-[11px] pl-2">MODALIDADE:</div>
              <div></div>
              <div></div>
              <div className="text-[11px] italic pl-4 flex items-center justify-between">
                <span>TAXA CONTRATUAL ANUAL DE JUROS</span>
                <div className="w-[100px]">
                  <ExcelInput
                    value={get('taxaJuros')}
                    onChange={(v: number) => update('taxaJuros', v)}
                    isPct
                    hasTriangle
                  />
                </div>
              </div>

              <LabelWithTooltip
                tooltip="Método de pagamento do empréstimo (SAC ou Price)"
                className="text-[11px] pl-2"
              >
                SISTEMA DE AMORTIZAÇÃO
              </LabelWithTooltip>
              <ExcelInput
                value={getStr('sistemaAmort')}
                onChange={(v: string) => update('sistemaAmort', v)}
                isString
                hasTriangle
              />
              <div></div>
              <div className="text-[11px] italic pl-4 flex items-center justify-between">
                <LabelWithTooltip tooltip="Índice de correção monetária (SELIC, TR, IGP-M, IPCA, CDI)">
                  INDEXADOR OFICIAL
                </LabelWithTooltip>
                <div className="w-[100px]">
                  <ExcelInput
                    value={getStr('indexador')}
                    onChange={(v: string) => update('indexador', v)}
                    isString
                  />
                </div>
              </div>

              <LabelWithTooltip
                tooltip="ANTECIPADO, se 1º parcela no ato; POSTECIPADO, se 1º parcela após um período; ou DEFERIDO, se com mais de um período de carência"
                className="text-[11px] pl-2"
              >
                MODALIDADE DE PAGAMENTO
              </LabelWithTooltip>
              <ExcelInput
                value={getStr('modPagamento')}
                onChange={(v: string) => update('modPagamento', v)}
                isString
                hasTriangle
              />
              <div></div>
              <div className="text-[11px] italic pl-4 flex justify-end gap-2">
                <span className="w-[120px] text-right">% ESTIMADA ANUAL</span>
                <div className="w-[100px]">
                  <ExcelInput
                    value={get('percEstimada')}
                    onChange={(v: number) => update('percEstimada', v)}
                    isPct
                  />
                </div>
              </div>

              <div className="text-[11px] pl-2">PERÍODOS MENSAIS:</div>
              <div></div>
              <div></div>
              <div className="text-[11px] italic pl-4 flex justify-end gap-2">
                <span className="w-[120px] text-right">% EFETIVA MENSAL</span>
                <div className="w-[100px]">
                  <CalcCell value={efetivaMensal * 100} isPct />
                </div>
              </div>

              <LabelWithTooltip
                tooltip="Número total de períodos/prestações do contrato incluindo os períodos de carência, se no modo diferido"
                className="text-[11px] pl-2"
              >
                TOTAL DE PERÍODOS
              </LabelWithTooltip>
              <ExcelInput
                value={get('totalPer')}
                onChange={(v: number) => update('totalPer', v)}
                hasTriangle
              />
              <div></div>
              <div></div>

              <LabelWithTooltip
                tooltip="Digite o total de períodos de carência, se o modo DIFERIDO; ou deixe em branco ou digite 0, se no modo antecipado ou postecipado"
                className="text-[11px] pl-2"
              >
                PERÍODOS DE CARÊNCIA
              </LabelWithTooltip>
              <ExcelInput
                value={get('carencia')}
                onChange={(v: number) => update('carencia', v)}
                hasTriangle
              />
              <div></div>
              <div></div>
            </div>

            <div className="mt-6 flex justify-center items-center gap-2">
              <span className="text-[12px] font-bold bg-white px-2 py-1 border border-[#1f497d] text-[#1f497d]">
                LIMITE DE CRÉDITO NAS CONDIÇÕES ACIMA........
              </span>
              <div className="w-[150px] h-[26px] bg-white border-[2px] border-[#1f497d] flex items-center justify-end px-2 text-[12px] font-bold shadow-inner text-[#1f497d]">
                {fmtVal(limiteCredito)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExplanatoryNote
        title="Notas Explicativas - Capacidade de Pagamento e Captação"
        value={note}
        onChange={setNote}
      />
    </div>
  )
}
