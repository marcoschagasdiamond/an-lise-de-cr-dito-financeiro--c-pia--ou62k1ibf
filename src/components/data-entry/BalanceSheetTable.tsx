import React from 'react'
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
import { formatCurrency } from '@/lib/calculators'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DetailedAssetTable } from './DetailedAssetTable'
import { DetailedLiabilityTable } from './DetailedLiabilityTable'
import { DetailedEquityTable } from './DetailedEquityTable'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SaveDataButton } from '@/components/data-entry/SaveDataButton'
import { ClearDataButton } from './ClearDataButton'

interface Props {
  years: number[]
  balances: any[]
  isEditable: boolean
  title: string
  description: string
}

export function BalanceSheetTable({ years, balances, isEditable, title, description }: Props) {
  const { balanceSheets, updateBalanceSheet, category, baseYear, setBaseYear } = useFinancialStore()
  const isDetailed = category === 'Média e Grande Porte'

  const handleClear = () => {
    years.forEach((y) => {
      updateBalanceSheet(y, {
        ativoCirculante: 0,
        estoques: 0,
        ativoNaoCirculante: 0,
        passivoCirculante: 0,
        passivoNaoCirculante: 0,
        patrimonioLiquido: 0,
      })
    })
  }

  const renderRow = (
    key: string,
    label: string,
    cls: string = 'pl-8',
    isTotal: boolean = false,
  ) => (
    <TableRow
      key={key}
      className={cn(
        isTotal ? 'bg-slate-100 dark:bg-slate-800/80 font-bold' : '',
        'border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors',
      )}
    >
      <TableCell
        className={cn(
          cls,
          isTotal
            ? 'text-slate-900 dark:text-slate-100 uppercase tracking-wider'
            : 'text-slate-700 dark:text-slate-300',
        )}
      >
        {label}
      </TableCell>
      {years.map((y) => {
        const bp = balanceSheets.find((b) => b.year === y)
        const val = bp?.[key as keyof typeof bp] as number | undefined
        return (
          <TableCell key={y} className="pr-6">
            {isTotal ? (
              <div className="text-right py-1.5 px-3 text-slate-900 dark:text-slate-100">
                {formatCurrency(val || 0)}
              </div>
            ) : (
              <NumInput
                disabled={!isEditable}
                value={val}
                onChange={(v: number) => updateBalanceSheet(y, { [key]: v })}
                className="bg-white dark:bg-slate-950 focus-visible:ring-1 focus-visible:ring-[#0f2e4a] h-9"
              />
            )}
          </TableCell>
        )
      })}
    </TableRow>
  )

  if (isDetailed) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="baseYear"
                className="font-semibold whitespace-nowrap text-sm text-slate-700 dark:text-slate-300"
              >
                Ano Base:
              </Label>
              <Input
                id="baseYear"
                type="number"
                value={baseYear || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val)) setBaseYear(val)
                }}
                className="w-24 h-9 bg-slate-50 dark:bg-slate-950 focus-visible:ring-[#0f2e4a]"
                disabled={!isEditable}
              />
            </div>
            <SaveDataButton />
          </div>
        </div>

        <DetailedAssetTable isEditable={isEditable} years={years} />
        <DetailedLiabilityTable isEditable={isEditable} years={years} />
        <DetailedEquityTable isEditable={isEditable} years={years} balances={balances} />

        <div className="flex justify-end mt-4 print:hidden">
          <SaveDataButton className="bg-[#0f2e4a] text-white hover:bg-[#0f2e4a]/90 border-transparent shadow-sm" />
        </div>
      </div>
    )
  }

  return (
    <Card className="animate-fade-in-up flex flex-col border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 text-slate-900 border-b border-slate-200">
        <div>
          <CardTitle className="text-[#0f2e4a] tracking-wide uppercase">{title}</CardTitle>
          <CardDescription className="text-slate-500 mt-1">{description}</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 px-3 rounded-md border border-slate-200">
            <Label htmlFor="baseYear" className="font-semibold whitespace-nowrap text-slate-800">
              Ano Base:
            </Label>
            <Input
              id="baseYear"
              type="number"
              value={baseYear || ''}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (!isNaN(val)) setBaseYear(val)
              }}
              className="w-20 h-8 bg-white border-slate-300 text-slate-900 focus-visible:ring-[#0f2e4a]"
              disabled={!isEditable}
            />
          </div>
          <ClearDataButton
            onClear={handleClear}
            disabled={!isEditable}
            className="bg-slate-600 hover:bg-slate-700 text-white border-slate-600"
          />
          <SaveDataButton className="bg-[#0f2e4a] hover:bg-[#0f2e4a]/90 text-white border-[#0f2e4a]" />
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto bg-white dark:bg-slate-950">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead className="w-[300px] pl-6 font-bold text-white uppercase tracking-wider">
                Conta
              </TableHead>
              {years.map((y) => (
                <TableHead key={y} className="text-right pr-6 font-bold text-white">
                  {y}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-slate-100 dark:bg-slate-900 font-semibold border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100">
              <TableCell
                colSpan={years.length + 1}
                className="pl-6 text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs"
              >
                Ativos
              </TableCell>
            </TableRow>
            {renderRow('ativoCirculante', 'Ativo Circulante')}
            {renderRow('estoques', '└ Estoques (Incluso no AC)', 'text-sm text-slate-500 pl-10')}
            {renderRow('ativoNaoCirculante', 'Ativo Não Circulante')}
            <TableRow className="bg-slate-100 dark:bg-slate-800/80 font-bold border-b border-slate-300 dark:border-slate-700 hover:bg-slate-100">
              <TableCell className="pl-8 text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Total Ativo
              </TableCell>
              {balances.map((b) => (
                <TableCell
                  key={`ativo-${b.year}`}
                  className="text-right pr-6 text-slate-900 dark:text-slate-100"
                >
                  {formatCurrency(b.ativo)}
                </TableCell>
              ))}
            </TableRow>

            <TableRow className="bg-slate-100 dark:bg-slate-900 font-semibold border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100">
              <TableCell
                colSpan={years.length + 1}
                className="pl-6 text-slate-800 dark:text-slate-200 uppercase tracking-widest text-xs mt-4"
              >
                Passivo & PL
              </TableCell>
            </TableRow>
            {renderRow('passivoCirculante', 'Passivo Circulante')}
            {renderRow('passivoNaoCirculante', 'Passivo Não Circulante')}
            {renderRow('patrimonioLiquido', 'Patrimônio Líquido')}

            <TableRow className="bg-slate-100 dark:bg-slate-800/80 font-bold hover:bg-slate-100">
              <TableCell className="pl-8 text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Total Passivo + PL
              </TableCell>
              {balances.map((b) => (
                <TableCell
                  key={`passivo-${b.year}`}
                  className={cn(
                    'text-right pr-6',
                    !b.isBalanced ? 'text-destructive' : 'text-slate-900 dark:text-slate-100',
                  )}
                >
                  <div className="flex items-center justify-end gap-1">
                    {formatCurrency(b.passivo)}
                    {!b.isBalanced && <AlertCircle className="w-4 h-4" />}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
