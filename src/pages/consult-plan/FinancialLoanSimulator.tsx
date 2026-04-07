import { useState, useMemo } from 'react'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  formatCurrency,
  formatPercent,
  ExcelPMT,
  ExcelPV,
  ExcelNPER,
  ExcelRATE,
} from '@/lib/calculators'
import { AmortizationSection } from '@/components/loan/AmortizationSection'

export type LoanSimType = 'PMT' | 'PV' | 'NPER' | 'RATE'

function InputField({ label, tooltip, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <span className="line-clamp-1">{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-foreground shrink-0">
              <HelpCircle className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[250px] text-sm font-normal">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </Label>
      <Input type="number" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function FinancialLoanSimulator({
  type,
  onBack,
}: {
  type: LoanSimType
  onBack: () => void
}) {
  const [pv, setPv] = useState('')
  const [pmt, setPmt] = useState('')
  const [rate, setRate] = useState('')
  const [nper, setNper] = useState('')
  const [grace, setGrace] = useState('0')
  const [modality, setModality] = useState('POSTECIPADO')

  const [costEvaluation, setCostEvaluation] = useState('')
  const [costAdmin, setCostAdmin] = useState('')
  const [costIOF, setCostIOF] = useState('')
  const [costFI, setCostFI] = useState('')
  const [costOther, setCostOther] = useState('')

  const pvNum = Number(pv) || 0
  const pmtNum = Number(pmt) || 0
  const rateNum = Number(rate) / 100 || 0
  const nperNum = Number(nper) || 0
  const graceNum = Number(grace) || 0
  const isAnt = modality === 'ANTECIPADO' ? 1 : 0
  const periods = nperNum - graceNum

  const result = useMemo(() => {
    if (type === 'PMT' && nperNum > 0) return ExcelPMT(rateNum, periods, pvNum, 0, isAnt)
    if (type === 'PV' && nperNum > 0) return ExcelPV(rateNum, periods, pmtNum, 0, isAnt)
    if (type === 'NPER' && pvNum && pmtNum) {
      const c = ExcelNPER(rateNum, pmtNum, pvNum, 0, isAnt)
      return isNaN(c) ? 0 : c
    }
    if (type === 'RATE' && nperNum > 0 && pvNum && pmtNum)
      return ExcelRATE(periods, pmtNum, pvNum, 0, isAnt) * 100
    return 0
  }, [type, pvNum, pmtNum, rateNum, nperNum, isAnt, periods])

  const formatRes = () => {
    if (type === 'PMT' || type === 'PV') return formatCurrency(result)
    if (type === 'RATE') return formatPercent(result / 100)
    return result.toFixed(2) + ' períodos'
  }

  const costs = useMemo(
    () => ({
      evaluation: Number(costEvaluation) || 0,
      admin: Number(costAdmin) || 0,
      iof: Number(costIOF) || 0,
      fi: Number(costFI) || 0,
      other: Number(costOther) || 0,
    }),
    [costEvaluation, costAdmin, costIOF, costFI, costOther],
  )

  const effPv = type === 'PV' ? Math.abs(result || 0) : pvNum
  const effPmt = type === 'PMT' ? Math.abs(result || 0) : Math.abs(pmtNum)
  const effNper = type === 'NPER' ? Math.max(0, Math.round(result || 0)) : nperNum
  const effRate = type === 'RATE' ? result / 100 || 0 : rateNum

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <h1 className="text-2xl font-bold">SÉRIE DE PAGAMENTOS DE UM EMPRÉSTIMO - SIMULAÇÃO</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros da Simulação</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type !== 'PV' && (
                <InputField
                  label="VALOR PRESENTE (PV)"
                  tooltip="Valor presente do empréstimo"
                  value={pv}
                  onChange={setPv}
                />
              )}
              {type !== 'PMT' && (
                <InputField
                  label="VALOR DA PRESTAÇÃO (PMT)"
                  tooltip="Valor da prestação a ser paga (use NEGATIVO)"
                  value={pmt}
                  onChange={setPmt}
                />
              )}
              {type !== 'RATE' && (
                <InputField
                  label="TAXA DE JUROS (i) % a.n."
                  tooltip="Taxa percentual de juros"
                  value={rate}
                  onChange={setRate}
                />
              )}
              {type !== 'NPER' && (
                <InputField
                  label="TOTAL DE PERÍODOS (n)"
                  tooltip="Total de períodos do contrato"
                  value={nper}
                  onChange={setNper}
                />
              )}
              <div className="space-y-2">
                <Label>MODALIDADE DE PAGAMENTO</Label>
                <Select value={modality} onValueChange={setModality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANTECIPADO">Antecipado</SelectItem>
                    <SelectItem value="POSTECIPADO">Postecipado</SelectItem>
                    <SelectItem value="DIFERIDO">Diferido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <InputField
                label="PERÍODO DE CARÊNCIA (c)"
                tooltip="0 para postecipado, -1 para antecipado"
                value={grace}
                onChange={setGrace}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Custos e Taxas Iniciais (Tirados no Ato)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <InputField
                label="Avaliação"
                tooltip="Custo de avaliação do bem"
                value={costEvaluation}
                onChange={setCostEvaluation}
              />
              <InputField
                label="Taxa Admin"
                tooltip="Taxa de abertura de crédito (TAC)"
                value={costAdmin}
                onChange={setCostAdmin}
              />
              <InputField
                label="IOF"
                tooltip="Imposto sobre Operações Financeiras"
                value={costIOF}
                onChange={setCostIOF}
              />
              <InputField
                label="Fundo (FI)"
                tooltip="Fundo de Investimento ou Garantia"
                value={costFI}
                onChange={setCostFI}
              />
              <InputField
                label="Outros"
                tooltip="Quaisquer outros custos iniciais"
                value={costOther}
                onChange={setCostOther}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>
                {type === 'PMT'
                  ? 'VALOR DA PRESTAÇÃO (PMT)'
                  : type === 'PV'
                    ? 'VALOR PRESENTE (PV) DO EMPRÉSTIMO'
                    : type === 'NPER'
                      ? 'TOTAL DE PERÍODOS (n)'
                      : 'TAXA DE JUROS (i) % a.n.'}
              </Label>
              <div className="mt-2 p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-400 rounded-md font-bold text-xl flex items-center h-14 border border-yellow-200 dark:border-yellow-900/50">
                {formatRes()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AmortizationSection
        pv={effPv}
        pmt={effPmt}
        nper={effNper}
        rate={effRate}
        grace={graceNum}
        modality={modality}
        costs={costs}
      />
    </div>
  )
}
