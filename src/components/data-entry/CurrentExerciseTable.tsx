import React, { useMemo } from 'react'
import { useFinancialStore } from '@/store/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AutomatedExplanatoryNote } from './AutomatedExplanatoryNote'
import { SaveDataButton } from '@/components/data-entry/SaveDataButton'
import { NumInput } from '@/components/ui/num-input'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const ROWS = [
  { id: 'faturamento', label: 'FATURAMENTO BRUTO', bold: true, isInput: true },
  {
    id: 'vendas_prazo',
    label: 'VENDAS A PRAZO',
    indent: true,
    percInput: 'vendas_prazo',
    percLabel: '% DO FATUR. BRUTO',
  },
  { id: 'vendas_vista', label: 'VENDAS À VISTA', indent: true },
  {
    id: 'deducoes',
    label: 'DEDUÇÕES SOBRE VENDAS',
    bold: true,
    percInput: 'deducoes',
    percLabel: '% DO FATUR. BRUTO',
  },
  { id: 'cpv', label: 'CUSTO DOS PRODUTOS/SERVIÇOS VENDIDOS', bold: true, isInput: true },
  {
    id: 'compras_prazo',
    label: 'COMPRAS A PRAZO',
    indent: true,
    percInput: 'compras_prazo',
    percLabel: '% DO CUSTO DOS PROD. VENDIDOS',
  },
  { id: 'compras_vista', label: 'COMPRAS À VISTA', indent: true },
  { id: 'desp_operacionais', label: 'DESPESAS OPERACIONAIS', bold: true },
  { id: 'desp_pessoal', label: 'DESPESAS COM PESSOAL', indent: true, isInput: true },
  { id: 'desp_servicos', label: 'PRESTAÇÃO DE SERVIÇOS DE TERCEIROS', indent: true, isInput: true },
  {
    id: 'desp_comerciais',
    label: 'DESPESAS COMERCIAIS E TRIBUTÁRIAS',
    indent: true,
    isInput: true,
  },
  { id: 'desp_admin', label: 'DESPESAS ADMINISTRATIVAS', indent: true, isInput: true },
  { id: 'outras_desp', label: 'OUTRAS DESPESAS OPERACIONAIS', indent: true, isInput: true },
  {
    id: 'outras_receitas',
    label: 'OUTRAS RECEITAS OPERACIONAIS TRIBUTÁVEIS',
    bold: true,
    isInput: true,
  },
  { id: 'ebitda', label: 'RESULTADO LÍQUIDO (EBITDA)', bold: true },
  {
    id: 'depreciacao',
    label: 'DESPESAS C/ DEPRECIAÇÃO AMORTIZ. E EXAUSTÃO',
    bold: true,
    isInput: true,
  },
  { id: 'ebit', label: 'RESULTADO LÍQUIDO (EBIT)', bold: true },
]

export function CurrentExerciseTable({ isEditable }: { isEditable: boolean }) {
  const { currentExerciseDRE, setCurrentExerciseDRE, setEconomicValueData, dre } =
    useFinancialStore()

  const latestDre = useMemo(() => {
    return (
      [...dre]
        .sort((a, b) => b.year - a.year)
        .find((d) => d.receita > 0 || d.despesasOperacionais > 0) ||
      dre[0] ||
      {}
    )
  }, [dre])

  const fiscalYear = latestDre.year || new Date().getFullYear() - 1
  const currentYear = fiscalYear + 1

  const fiscalMonths = currentExerciseDRE?.fiscalMonths ?? 12
  const currentMonths = currentExerciseDRE?.currentMonths ?? 4
  const costConfig = currentExerciseDRE?.costConfig || 'manual'
  const percs = currentExerciseDRE?.percs || {}
  const current = currentExerciseDRE?.current || {}

  const updateConfig = (key: string, val: any) => setCurrentExerciseDRE({ [key]: val })
  const updatePerc = (key: string, val: number | string) =>
    setCurrentExerciseDRE({ percs: { ...percs, [key]: val } })
  const updateCurrent = (key: string, val: number | string) =>
    setCurrentExerciseDRE({ current: { ...current, [key]: val } })

  // Fiscal Calculations
  const fFat = latestDre.receita || 0
  const fDed =
    (latestDre.impostosSobreVendas || 0) + (latestDre.devolucoesDescontosAbatimentos || 0)
  const fCpv = latestDre.cpv || 0
  const fDespPessoal = latestDre.despesasComPessoal || 0
  const fDespServicos = latestDre.prestacaoServicosTerceiros || 0
  const fDespComerciais = latestDre.despesasComerciaisTributarias || 0
  const fDespAdmin = latestDre.despesasAdministrativas || 0
  const fOutrasDesp = latestDre.outrasDespesasOperacionais || 0
  const fDespOp = fDespPessoal + fDespServicos + fDespComerciais + fDespAdmin + fOutrasDesp
  const fOutrasRec = latestDre.outrasReceitasOperacionaisTributaveis || 0
  const fDepreciacao = latestDre.depreciacao || 0

  const fEbitda = fFat - fDed - fCpv - fDespOp + fOutrasRec
  const fEbit = fEbitda - fDepreciacao

  // Current Calculations
  const cFat = current.faturamento || 0

  const getC = (key: string, fVal: number) => {
    return costConfig === 'auto'
      ? fFat
        ? (fVal / fFat) * cFat
        : 0
      : current[key] !== undefined
        ? current[key]
        : fVal
  }

  const histDedPct = fFat ? (fDed / fFat) * 100 : 0
  const dp =
    costConfig === 'auto' ? histDedPct : percs.deducoes !== undefined ? percs.deducoes : histDedPct
  const cDed = cFat * (dp / 100)

  const cCpv = getC('cpv', fCpv)
  const cDespPessoal = getC('desp_pessoal', fDespPessoal)
  const cDespServicos = getC('desp_servicos', fDespServicos)
  const cDespComerciais = getC('desp_comerciais', fDespComerciais)
  const cDespAdmin = getC('desp_admin', fDespAdmin)
  const cOutrasDesp = getC('outras_desp', fOutrasDesp)
  const cDespOp = cDespPessoal + cDespServicos + cDespComerciais + cDespAdmin + cOutrasDesp
  const cOutrasRec = getC('outras_receitas', fOutrasRec)
  const cDepreciacao = getC('depreciacao', fDepreciacao)

  const cEbitda = cFat - cDed - cCpv - cDespOp + cOutrasRec
  const cEbit = cEbitda - cDepreciacao

  // Splits (Prazo / Vista)
  const cVendasPrazo = cFat * ((percs.vendas_prazo || 0) / 100)
  const cVendasVista = cFat - cVendasPrazo
  const cComprasPrazo = cCpv * ((percs.compras_prazo || 0) / 100)
  const cComprasVista = cCpv - cComprasPrazo

  const fVendasPrazo = fFat * ((percs.vendas_prazo || 0) / 100)
  const fVendasVista = fFat - fVendasPrazo
  const fComprasPrazo = fCpv * ((percs.compras_prazo || 0) / 100)
  const fComprasVista = fCpv - fComprasPrazo

  const totalMonths = fiscalMonths + currentMonths
  const getM = (fVal: number, cVal: number) => (totalMonths > 0 ? (fVal + cVal) / totalMonths : 0)

  const mFat = getM(fFat, cFat)
  const mEbitda = getM(fEbitda, cEbitda)

  React.useEffect(() => {
    setEconomicValueData((prev: any) => ({
      ...prev,
      mFat,
      mEbitda,
    }))
  }, [mFat, mEbitda, setEconomicValueData])

  const fmtR = (v: number) => {
    if (v === 0) return '-'
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v)
  }

  const fmtP = (v: number) => {
    if (v === 0 || !isFinite(v)) return '-'
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v)
  }

  const getRowData = (id: string) => {
    let fVal = 0,
      cVal = 0
    switch (id) {
      case 'faturamento':
        fVal = fFat
        cVal = cFat
        break
      case 'vendas_prazo':
        fVal = fVendasPrazo
        cVal = cVendasPrazo
        break
      case 'vendas_vista':
        fVal = fVendasVista
        cVal = cVendasVista
        break
      case 'deducoes':
        fVal = fDed
        cVal = cDed
        break
      case 'cpv':
        fVal = fCpv
        cVal = cCpv
        break
      case 'compras_prazo':
        fVal = fComprasPrazo
        cVal = cComprasPrazo
        break
      case 'compras_vista':
        fVal = fComprasVista
        cVal = cComprasVista
        break
      case 'desp_operacionais':
        fVal = fDespOp
        cVal = cDespOp
        break
      case 'desp_pessoal':
        fVal = fDespPessoal
        cVal = cDespPessoal
        break
      case 'desp_servicos':
        fVal = fDespServicos
        cVal = cDespServicos
        break
      case 'desp_comerciais':
        fVal = fDespComerciais
        cVal = cDespComerciais
        break
      case 'desp_admin':
        fVal = fDespAdmin
        cVal = cDespAdmin
        break
      case 'outras_desp':
        fVal = fOutrasDesp
        cVal = cOutrasDesp
        break
      case 'outras_receitas':
        fVal = fOutrasRec
        cVal = cOutrasRec
        break
      case 'ebitda':
        fVal = fEbitda
        cVal = cEbitda
        break
      case 'depreciacao':
        fVal = fDepreciacao
        cVal = cDepreciacao
        break
      case 'ebit':
        fVal = fEbit
        cVal = cEbit
        break
    }
    return { fVal, cVal, mVal: getM(fVal, cVal) }
  }

  return (
    <Card className="animate-fade-in-up flex flex-col border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardTitle className="text-[#0f2e4a] dark:text-slate-100 tracking-wide uppercase text-lg">
          DEMONSTRAÇÃO DAS RECEITAS E DESPESAS - EXERCÍCIO ATUAL
        </CardTitle>
      </CardHeader>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-12 gap-x-2 gap-y-4 w-full">
          <div className="col-span-12 md:col-span-3 flex items-center font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            PARÂMETROS DE RECEITAS E DESPESAS
          </div>

          <div className="col-span-6 md:col-span-3 flex flex-col justify-end">
            <div className="text-[11px] font-bold mb-1 text-slate-500 uppercase tracking-wide text-center">
              Últ. Exerc. Fiscal
            </div>
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-1.5 font-bold text-sm w-full text-center rounded-sm text-slate-900 dark:text-slate-100 shadow-sm mb-2">
              {fiscalYear}
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <span>TOTAL MESES:</span>
              <NumInput
                value={fiscalMonths}
                onChange={(v) => isEditable && updateConfig('fiscalMonths', v)}
                disabled={!isEditable}
                className="w-14 h-7 border-slate-300 dark:border-slate-700 rounded-sm text-center p-0 font-bold focus-visible:ring-1 focus-visible:ring-[#0f2e4a] bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="col-span-6 md:col-span-3 flex flex-col justify-end">
            <div className="text-[11px] font-bold mb-1 text-slate-500 uppercase tracking-wide text-center">
              Exerc. Atual
            </div>
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-1.5 font-bold text-sm w-full text-center rounded-sm text-slate-900 dark:text-slate-100 shadow-sm mb-2">
              {currentYear}
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <span>TOTAL MESES:</span>
              <NumInput
                value={currentMonths}
                onChange={(v) => isEditable && updateConfig('currentMonths', v)}
                disabled={!isEditable}
                className="w-14 h-7 border-slate-300 dark:border-slate-700 rounded-sm text-center p-0 font-bold focus-visible:ring-1 focus-visible:ring-[#0f2e4a] bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 flex flex-col justify-end">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-3 text-[10px] font-bold space-y-2.5 shadow-sm">
              <label
                className={cn(
                  'flex items-center gap-2 text-slate-700 dark:text-slate-300',
                  isEditable && 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100',
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 border flex items-center justify-center shrink-0 rounded-sm transition-colors',
                    costConfig === 'manual'
                      ? 'border-[#0f2e4a] bg-[#0f2e4a] text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900',
                  )}
                >
                  {costConfig === 'manual' && '✓'}
                </div>
                <input
                  type="radio"
                  name="costConfig"
                  className="hidden"
                  disabled={!isEditable}
                  checked={costConfig === 'manual'}
                  onChange={() => isEditable && updateConfig('costConfig', 'manual')}
                />
                INFORMAR MANUALMENTE
              </label>
              <label
                className={cn(
                  'flex items-center gap-2 text-slate-700 dark:text-slate-300',
                  isEditable && 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100',
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 border flex items-center justify-center shrink-0 rounded-sm transition-colors',
                    costConfig === 'auto'
                      ? 'border-[#0f2e4a] bg-[#0f2e4a] text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900',
                  )}
                >
                  {costConfig === 'auto' && '✓'}
                </div>
                <input
                  type="radio"
                  name="costConfig"
                  className="hidden"
                  disabled={!isEditable}
                  checked={costConfig === 'auto'}
                  onChange={() => isEditable && updateConfig('costConfig', 'auto')}
                />
                MANTER % DO EXERC. ANTERIOR
              </label>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-0 overflow-x-auto bg-white dark:bg-slate-950">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead className="w-[350px] pl-6 text-white font-bold border-none align-middle sticky left-0 bg-[#0f2e4a] z-20">
                CONTA
              </TableHead>
              <TableHead className="text-right text-white font-bold border-none border-l border-white/20 w-[150px] pr-4">
                R$
              </TableHead>
              <TableHead className="text-right text-white font-bold border-none w-[90px] pr-4">
                A.V. (%)
              </TableHead>
              <TableHead className="text-right text-white font-bold border-none border-l border-white/20 w-[150px] pr-4">
                R$
              </TableHead>
              <TableHead className="text-right text-white font-bold border-none w-[90px] pr-4">
                A.V. (%)
              </TableHead>
              <TableHead className="text-right text-white font-bold border-none border-l border-white/20 w-[150px] pr-4">
                R$
              </TableHead>
              <TableHead className="text-right text-white font-bold border-none w-[90px] pr-4">
                A.V. (%)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((row) => {
              const { fVal, cVal, mVal } = getRowData(row.id)
              const fAV = fFat ? (fVal / fFat) * 100 : 0
              const cAV = cFat ? (cVal / cFat) * 100 : 0
              const mAV = mFat ? (mVal / mFat) * 100 : 0

              const isInputCell =
                isEditable && (row.id === 'faturamento' || (row.isInput && costConfig === 'manual'))

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    row.bold && 'bg-slate-50 dark:bg-slate-900/50 font-bold',
                    'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800',
                  )}
                >
                  <TableCell
                    className={cn(
                      'pl-8 sticky left-0 z-10 bg-white dark:bg-slate-950 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b]',
                      row.indent && 'pl-12 text-muted-foreground',
                      row.bold &&
                        'bg-slate-50 dark:bg-slate-900/50 shadow-[1px_0_0_0_#f8fafc] dark:shadow-[1px_0_0_0_#1e293b]',
                    )}
                  >
                    <div className="flex justify-between items-center h-full gap-2">
                      <span className={cn(row.bold && 'uppercase')}>{row.label}</span>
                      {row.percInput && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <span>{row.percLabel}</span>
                          <NumInput
                            value={percs[row.percInput] ?? ''}
                            onChange={(v) => updatePerc(row.percInput!, v)}
                            disabled={!isEditable}
                            className="w-12 h-6 px-1 py-0 text-center border-slate-300 dark:border-slate-700 rounded-sm text-[10px] bg-white dark:bg-slate-900 focus-visible:ring-1"
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="border-l border-slate-200 dark:border-slate-800 p-0 text-right pr-4 w-[150px]">
                    <div className="font-medium min-h-[44px] flex items-center justify-end">
                      {fmtR(fVal)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 pr-4 text-[11px] font-medium w-[90px]">
                    {fmtP(fAV)}
                  </TableCell>

                  <TableCell className="border-l border-slate-200 dark:border-slate-800 p-0 w-[150px]">
                    {isInputCell ? (
                      <NumInput
                        value={cVal}
                        onChange={(v) => updateCurrent(row.id, v)}
                        disabled={!isEditable}
                        className="w-full h-full min-h-[44px] border-0 bg-transparent text-right rounded-none shadow-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#0f2e4a] font-medium pr-4"
                      />
                    ) : (
                      <div className="text-right pr-4 font-medium min-h-[44px] flex items-center justify-end">
                        {fmtR(cVal)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 pr-4 text-[11px] font-medium w-[90px]">
                    {fmtP(cAV)}
                  </TableCell>

                  <TableCell className="border-l border-slate-200 dark:border-slate-800 p-0 text-right pr-4 w-[150px]">
                    <div className="font-medium min-h-[44px] flex items-center justify-end">
                      {fmtR(mVal)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 pr-4 text-[11px] font-medium w-[90px]">
                    {fmtP(mAV)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>

      <div className="px-6 pb-6 pt-6">
        <AutomatedExplanatoryNote
          title="NOTAS EXPLICATIVAS SOBRE AS CONTAS DO DEMONSTRATIVO DE RESULTADOS - EXERCÍCIO ATUAL"
          category="RECEITAS E DESPESAS - EXERCÍCIO ATUAL"
          data={[{ year: currentYear, fat: cFat, ebitda: cEbitda }]}
          years={[currentYear]}
          isEditable={isEditable}
        />
      </div>
      <div className="flex justify-end p-4 border-t bg-muted/10 print:hidden mt-auto">
        <SaveDataButton className="bg-[#0f2e4a] text-white hover:bg-[#0f2e4a]/90 border-transparent shadow-sm" />
      </div>
    </Card>
  )
}
