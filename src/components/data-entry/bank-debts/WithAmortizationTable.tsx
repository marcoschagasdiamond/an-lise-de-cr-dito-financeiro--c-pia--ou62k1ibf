import { useState, useCallback, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2, Save } from 'lucide-react'

export interface DebtRow {
  id: string
  valor_financiamento: string
  sistema_amortizacao: string
  modalidade_pagamento: string
  total_periodos: string
  periodos_carencia: string
  prest_restantes: string
  taxa_contratual_anual: string
  indexador: string
  estimada_anual_index: string
  efetiva_mensal_total: string
  prestacao_mensal_amortiz: string
}

// Map common indexer names to BCB series codes
const INDEXER_SERIES_MAP: Record<string, number> = {
  cdi: 4389,
  ipca: 433,
  selic: 4189,
  'igp-m': 189,
  igpm: 189,
}

function parseBrazilianNumber(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  const clean = val
    .toString()
    .replace(/[R$\s%]/g, '')
    .trim()
  if (!clean) return 0

  if (clean.includes(',') && clean.includes('.')) {
    // Standard brazilian: 1.234,56 -> 1234.56
    const normalized = clean.replace(/\./g, '').replace(',', '.')
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? 0 : parsed
  } else if (clean.includes(',')) {
    const normalized = clean.replace(',', '.')
    const parsed = parseFloat(normalized)
    return isNaN(parsed) ? 0 : parsed
  } else {
    const parsed = parseFloat(clean)
    return isNaN(parsed) ? 0 : parsed
  }
}

function formatCurrency(val: number): string {
  if (isNaN(val) || !isFinite(val) || val === 0) return ''
  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPercent(val: number): string {
  if (isNaN(val) || !isFinite(val) || val === 0) return ''
  return (
    val.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }) + '%'
  )
}

function normalizeIndexerKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '')
}

function getSeriesCodeForIndexer(raw: string): number | null {
  const norm = normalizeIndexerKey(raw)
  if (INDEXER_SERIES_MAP[norm] !== undefined) {
    return INDEXER_SERIES_MAP[norm]
  }
  // Check if contains key
  for (const [key, code] of Object.entries(INDEXER_SERIES_MAP)) {
    if (norm === key || norm.includes(key)) {
      return code
    }
  }
  return null
}

export function WithAmortizationTable() {
  const [data, setData] = useState<DebtRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fetchingIndexers, setFetchingIndexers] = useState<Record<string, boolean>>({})
  const [indexerRates, setIndexerRates] = useState<Record<string, number | null>>({})
  const [overriddenFields, setOverriddenFields] = useState<Record<string, Record<string, boolean>>>(
    {},
  )
  const { toast } = useToast()

  const handleFetch = useCallback(async () => {
    try {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const { data: existing, error } = await supabase
          .from('analises_salvas')
          .select('dados_analise')
          .eq('usuario_id', userData.user.id)
          .eq('tipo_analise', 'com_quitacao')
          .limit(1)
          .maybeSingle()

        if (!error && existing?.dados_analise && Array.isArray(existing.dados_analise)) {
          setData(existing.dados_analise as unknown as DebtRow[])
          return
        }
      }

      setData([])
    } catch (err: any) {
      toast({
        title: 'Aviso',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      })
      setData([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  // Helper to recompute row calculated values
  const computeRowValues = useCallback(
    (
      row: DebtRow,
      indexerRateOverride?: number | null,
      rowOverrides?: Record<string, boolean>,
    ): DebtRow => {
      const overrides = rowOverrides || overriddenFields[row.id] || {}

      const valorFinanciamento = parseBrazilianNumber(row.valor_financiamento)
      const totalPeriodos = parseBrazilianNumber(row.total_periodos)
      const periodosCarencia = parseBrazilianNumber(row.periodos_carencia)
      const taxaContratual = parseBrazilianNumber(row.taxa_contratual_anual)
      const sistemaAmort = (row.sistema_amortizacao || '').trim().toUpperCase()
      const modalidadePag = (row.modalidade_pagamento || '').trim().toUpperCase()

      // 1. Indexer value
      const indexerVal =
        indexerRateOverride !== undefined ? indexerRateOverride : (indexerRates[row.id] ?? null)

      // Prest. Restantes = total_periodos - periodos_carencia (editável)
      let prestRestantes = row.prest_restantes
      if (!overrides['prest_restantes']) {
        if (totalPeriodos > 0) {
          const rem = Math.max(0, totalPeriodos - periodosCarencia)
          prestRestantes = rem.toString()
        } else {
          prestRestantes = ''
        }
      }

      // % ESTIMADA ANUAL C/ INDEX
      // se valor_indexador existe: ((1 + taxa_contratual/100) * (1 + valor_indexador/100) - 1) * 100. Senão: taxa_contratual.
      let estimadaAnualIndex = row.estimada_anual_index
      let estimadaAnualNum = taxaContratual
      if (!overrides['estimada_anual_index']) {
        if (taxaContratual > 0 || (indexerVal !== null && indexerVal > 0)) {
          if (indexerVal !== null && indexerVal !== undefined) {
            estimadaAnualNum = ((1 + taxaContratual / 100) * (1 + indexerVal / 100) - 1) * 100
          } else {
            estimadaAnualNum = taxaContratual
          }
          estimadaAnualIndex = estimadaAnualNum !== 0 ? formatPercent(estimadaAnualNum) : ''
        } else {
          estimadaAnualIndex = ''
          estimadaAnualNum = 0
        }
      } else {
        estimadaAnualNum = parseBrazilianNumber(row.estimada_anual_index)
      }

      // % EFETIVA MENSAL TOTAL = ((1 + %_estimada_anual/100)^(1/12) - 1) * 100
      let efetivaMensalTotal = row.efetiva_mensal_total
      let taxaEfetivaMensalNum = 0
      if (!overrides['efetiva_mensal_total']) {
        if (estimadaAnualNum > 0) {
          taxaEfetivaMensalNum = (Math.pow(1 + estimadaAnualNum / 100, 1 / 12) - 1) * 100
          efetivaMensalTotal = taxaEfetivaMensalNum !== 0 ? formatPercent(taxaEfetivaMensalNum) : ''
        } else {
          efetivaMensalTotal = ''
          taxaEfetivaMensalNum = 0
        }
      } else {
        taxaEfetivaMensalNum = parseBrazilianNumber(row.efetiva_mensal_total)
      }

      // PRESTAÇÃO MENSAL C/ AMORTIZ:
      // Se SAC: amort = valor_financiamento / total_periodos; prestacao = amort + (valor_financiamento * taxa_efetiva_mensal/100)
      // Se Price: i = taxa_efetiva_mensal/100; n = total_periodos; prestacao = valor_financiamento * (i * (1+i)^n) / ((1+i)^n - 1)
      // Se houver carência com modo DIFERIDO: capitalize juros no saldo antes de calcular
      let prestacaoMensalAmortiz = row.prestacao_mensal_amortiz
      if (!overrides['prestacao_mensal_amortiz']) {
        if (valorFinanciamento > 0 && totalPeriodos > 0) {
          const i = taxaEfetivaMensalNum / 100
          let saldoDevedor = valorFinanciamento

          const isDiferido =
            modalidadePag.includes('DIFERID') ||
            (periodosCarencia > 0 &&
              !modalidadePag.includes('ANTECIPAD') &&
              !modalidadePag.includes('POSTECIPAD'))

          if (periodosCarencia > 0 && isDiferido) {
            saldoDevedor = valorFinanciamento * Math.pow(1 + i, periodosCarencia)
          }

          const nAmortiz = Math.max(1, totalPeriodos - (isDiferido ? periodosCarencia : 0))

          let prestacao = 0
          if (sistemaAmort.includes('SAC')) {
            const amort = saldoDevedor / nAmortiz
            prestacao = amort + saldoDevedor * i
          } else if (
            sistemaAmort.includes('PRICE') ||
            sistemaAmort.includes('TABELA PRICE') ||
            sistemaAmort.includes('FRANCÊS') ||
            sistemaAmort.includes('FRANCES')
          ) {
            if (i > 0) {
              const factor = Math.pow(1 + i, nAmortiz)
              prestacao = saldoDevedor * ((i * factor) / (factor - 1))
            } else {
              prestacao = saldoDevedor / nAmortiz
            }
          } else {
            // Default to Price if not specified, or SAC if explicitly contains SAC
            if (i > 0) {
              const factor = Math.pow(1 + i, nAmortiz)
              prestacao = saldoDevedor * ((i * factor) / (factor - 1))
            } else {
              prestacao = saldoDevedor / nAmortiz
            }
          }

          prestacaoMensalAmortiz = prestacao > 0 ? formatCurrency(prestacao) : ''
        } else {
          prestacaoMensalAmortiz = ''
        }
      }

      return {
        ...row,
        prest_restantes: prestRestantes,
        estimada_anual_index: estimadaAnualIndex,
        efetiva_mensal_total: efetivaMensalTotal,
        prestacao_mensal_amortiz: prestacaoMensalAmortiz,
      }
    },
    [indexerRates, overriddenFields],
  )

  const handleAddRow = () => {
    setData((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        valor_financiamento: '',
        sistema_amortizacao: 'SAC',
        modalidade_pagamento: 'Mensal',
        total_periodos: '',
        periodos_carencia: '0',
        prest_restantes: '',
        taxa_contratual_anual: '',
        indexador: '',
        estimada_anual_index: '',
        efetiva_mensal_total: '',
        prestacao_mensal_amortiz: '',
      },
    ])
  }

  const handleRemoveRow = (id: string) => {
    setData((prev) => prev.filter((row) => row.id !== id))
    setIndexerRates((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
    setOverriddenFields((prev) => {
      const copy = { ...prev }
      delete copy[id]
      return copy
    })
  }

  const handleChange = (id: string, field: keyof DebtRow, value: string) => {
    // If user manually edits a calculated field, mark it as overridden
    const isCalculatedField = [
      'estimada_anual_index',
      'efetiva_mensal_total',
      'prestacao_mensal_amortiz',
      'prest_restantes',
    ].includes(field)

    let currentOverrides = overriddenFields[id] || {}
    if (isCalculatedField) {
      currentOverrides = { ...currentOverrides, [field]: true }
      setOverriddenFields((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: true },
      }))
    }

    setData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row
        const updatedRow = { ...row, [field]: value }
        if (isCalculatedField) {
          // If editing an overridden field, keep the value as typed and re-evaluate dependent non-overridden fields
          return computeRowValues(updatedRow, undefined, currentOverrides)
        } else {
          // Normal input field change -> auto re-calculate dependent calculated fields
          return computeRowValues(updatedRow, undefined, currentOverrides)
        }
      }),
    )
  }

  const handleIndexerBlur = async (id: string, value: string) => {
    if (!value || !value.trim()) {
      setIndexerRates((prev) => ({ ...prev, [id]: null }))
      setData((prev) => prev.map((row) => (row.id === id ? computeRowValues(row, null) : row)))
      return
    }

    const seriesCode = getSeriesCodeForIndexer(value)
    if (!seriesCode) {
      return
    }

    setFetchingIndexers((prev) => ({ ...prev, [id]: true }))

    try {
      const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesCode}/dados?formato=json`
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`BCB HTTP ${res.status}`)
      }
      const jsonData = await res.json()
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        // Take the latest available entry in the series
        const lastEntry = jsonData[jsonData.length - 1]
        const rateVal = parseBrazilianNumber(lastEntry?.valor)

        setIndexerRates((prev) => ({ ...prev, [id]: rateVal }))

        // Update row and calculate
        setData((prev) =>
          prev.map((row) => {
            if (row.id !== id) return row
            // Remove override for estimada_anual_index since we freshly fetched indexer
            const updatedOverrides = { ...(overriddenFields[id] || {}) }
            delete updatedOverrides['estimada_anual_index']
            setOverriddenFields((prevOver) => ({
              ...prevOver,
              [id]: updatedOverrides,
            }))
            return computeRowValues(row, rateVal, updatedOverrides)
          }),
        )

        toast({
          title: 'Indexador atualizado',
          description: `${value.toUpperCase()} obtido do Banco Central: ${formatPercent(rateVal)}`,
        })
      } else {
        throw new Error('Nenhum dado retornado')
      }
    } catch (error) {
      console.error('Erro ao buscar indexador BCB:', error)
      toast({
        title: 'Não foi possível buscar o indexador',
        description: 'Digite o valor manualmente.',
        variant: 'destructive',
      })
    } finally {
      setFetchingIndexers((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        const { data: existing } = await supabase
          .from('analises_salvas')
          .select('id')
          .eq('usuario_id', userData.user.id)
          .eq('tipo_analise', 'com_quitacao')
          .limit(1)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('analises_salvas')
            .update({ dados_analise: data as any })
            .eq('id', existing.id)
        } else {
          await supabase.from('analises_salvas').insert({
            usuario_id: userData.user.id,
            tipo_analise: 'com_quitacao',
            nome_analise: 'Dívidas com quitação principal',
            dados_analise: data as any,
          })
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Dados salvos com sucesso.',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const isOverridden = (rowId: string, field: string) => {
    return !!overriddenFields[rowId]?.[field]
  }

  return (
    <div className="space-y-4 w-full mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-bold uppercase text-slate-800 dark:text-slate-100">
          COM AMORTIZAÇÃO DA OBRIGAÇÃO PRINCIPAL
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={handleAddRow}
            variant="outline"
            size="sm"
            className="bg-slate-50 dark:bg-slate-900 border-slate-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Inserir linha
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            size="sm"
            className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>
      <div className="border border-slate-200 dark:border-slate-800 rounded-md w-full overflow-auto bg-card">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        VALOR FINANCIAMENTO CONTRATADO
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Valor total do financiamento contratado junto à instituição financeira</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[170px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        SISTEMA DE AMORTIZAÇÃO
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sistema de amortização utilizado (ex: SAC, Price)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[170px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        MODALIDADE DE PAGAMENTO
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Forma de pagamento das prestações (ex: Mensal, Trimestral)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[140px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        TOTAL DE PERÍODOS
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Total de Período do contrato (PRAZO) incluindo os períodos de carência se
                        modo diferido
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[150px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        PERÍODOS CARÊNCIA
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Digite o total de períodos de carência, se no modo DIFERIDO; ou deixe em
                        branco ou digite 0, se no modo Antecipado ou Postecipado
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[140px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        PREST. RESTANTES
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Quantidade de prestações restantes para quitação (calculado: Total -
                        Carência)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[180px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        % TAXA CONTRATUAL ANUAL
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Taxa percentual de juros efetivos anuais contratada</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[160px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        INDEXADOR
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Índice utilizado para correção do contrato (ex: CDI, IPCA, SELIC, IGP-M).
                        Busca automática no Banco Central.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[190px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        % ESTIMADA ANUAL C/ INDEX
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Taxa anual estimada incluindo o indexador (calculada automaticamente)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[180px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        % EFETIVA MENSAL TOTAL
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Taxa efetiva mensal total calculada a partir da taxa anual estimada</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[210px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        PRESTAÇÃO MENSAL C/ AMORTIZ
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Valor da prestação mensal incluindo amortização do principal (SAC ou Price)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Carregando dados...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                  Nenhuma linha adicionada. Clique em "Inserir linha" para começar.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const isFetching = !!fetchingIndexers[item.id]

                return (
                  <TableRow key={item.id}>
                    {/* VALOR FINANCIAMENTO CONTRATADO */}
                    <TableCell className="p-2">
                      <Input
                        value={item.valor_financiamento}
                        onChange={(e) =>
                          handleChange(item.id, 'valor_financiamento', e.target.value)
                        }
                        placeholder="R$ 0,00"
                        className="h-8"
                      />
                    </TableCell>

                    {/* SISTEMA DE AMORTIZAÇÃO */}
                    <TableCell className="p-2">
                      <Input
                        value={item.sistema_amortizacao}
                        onChange={(e) =>
                          handleChange(item.id, 'sistema_amortizacao', e.target.value)
                        }
                        placeholder="SAC ou Price"
                        className="h-8"
                      />
                    </TableCell>

                    {/* MODALIDADE DE PAGAMENTO */}
                    <TableCell className="p-2">
                      <Input
                        value={item.modalidade_pagamento}
                        onChange={(e) =>
                          handleChange(item.id, 'modalidade_pagamento', e.target.value)
                        }
                        placeholder="Mensal, Diferido..."
                        className="h-8"
                      />
                    </TableCell>

                    {/* TOTAL DE PERÍODOS */}
                    <TableCell className="p-2">
                      <Input
                        value={item.total_periodos}
                        onChange={(e) => handleChange(item.id, 'total_periodos', e.target.value)}
                        placeholder="0"
                        className="h-8"
                      />
                    </TableCell>

                    {/* PERÍODOS CARÊNCIA */}
                    <TableCell className="p-2">
                      <Input
                        value={item.periodos_carencia}
                        onChange={(e) => handleChange(item.id, 'periodos_carencia', e.target.value)}
                        placeholder="0"
                        className="h-8"
                      />
                    </TableCell>

                    {/* PREST. RESTANTES (Calculado, editável) */}
                    <TableCell className="p-2">
                      <Input
                        value={item.prest_restantes}
                        onChange={(e) => handleChange(item.id, 'prest_restantes', e.target.value)}
                        placeholder="0"
                        className={`h-8 transition-colors ${
                          isOverridden(item.id, 'prest_restantes')
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20'
                            : 'bg-[#f3f4f6] dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium'
                        }`}
                        title={
                          isOverridden(item.id, 'prest_restantes')
                            ? 'Valor editado manualmente'
                            : 'Calculado automaticamente: Total - Carência'
                        }
                      />
                    </TableCell>

                    {/* % TAXA CONTRATUAL ANUAL */}
                    <TableCell className="p-2">
                      <Input
                        value={item.taxa_contratual_anual}
                        onChange={(e) =>
                          handleChange(item.id, 'taxa_contratual_anual', e.target.value)
                        }
                        placeholder="0,00%"
                        className="h-8"
                      />
                    </TableCell>

                    {/* INDEXADOR (Com busca automática no blur e spinner) */}
                    <TableCell className="p-2">
                      <div className="relative flex items-center">
                        <Input
                          value={item.indexador}
                          onChange={(e) => handleChange(item.id, 'indexador', e.target.value)}
                          onBlur={(e) => handleIndexerBlur(item.id, e.target.value)}
                          placeholder="CDI, IPCA, SELIC..."
                          className={`h-8 ${isFetching ? 'pr-8' : ''}`}
                        />
                        {isFetching && (
                          <div className="absolute right-2 flex items-center pointer-events-none">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* % ESTIMADA ANUAL C/ INDEX (Calculado com fundo #f3f4f6 e override) */}
                    <TableCell className="p-2">
                      <Input
                        value={item.estimada_anual_index}
                        onChange={(e) =>
                          handleChange(item.id, 'estimada_anual_index', e.target.value)
                        }
                        placeholder="0,00%"
                        className={`h-8 transition-colors ${
                          isOverridden(item.id, 'estimada_anual_index')
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20'
                            : 'bg-[#f3f4f6] dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium'
                        }`}
                        title={
                          isOverridden(item.id, 'estimada_anual_index')
                            ? 'Valor editado manualmente'
                            : 'Calculado automaticamente'
                        }
                      />
                    </TableCell>

                    {/* % EFETIVA MENSAL TOTAL (Calculado com fundo #f3f4f6 e override) */}
                    <TableCell className="p-2">
                      <Input
                        value={item.efetiva_mensal_total}
                        onChange={(e) =>
                          handleChange(item.id, 'efetiva_mensal_total', e.target.value)
                        }
                        placeholder="0,00%"
                        className={`h-8 transition-colors ${
                          isOverridden(item.id, 'efetiva_mensal_total')
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20'
                            : 'bg-[#f3f4f6] dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium'
                        }`}
                        title={
                          isOverridden(item.id, 'efetiva_mensal_total')
                            ? 'Valor editado manualmente'
                            : 'Calculado automaticamente'
                        }
                      />
                    </TableCell>

                    {/* PRESTAÇÃO MENSAL C/ AMORTIZ (Calculado com fundo #f3f4f6 e override) */}
                    <TableCell className="p-2">
                      <Input
                        value={item.prestacao_mensal_amortiz}
                        onChange={(e) =>
                          handleChange(item.id, 'prestacao_mensal_amortiz', e.target.value)
                        }
                        placeholder="R$ 0,00"
                        className={`h-8 transition-colors ${
                          isOverridden(item.id, 'prestacao_mensal_amortiz')
                            ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20'
                            : 'bg-[#f3f4f6] dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium'
                        }`}
                        title={
                          isOverridden(item.id, 'prestacao_mensal_amortiz')
                            ? 'Valor editado manualmente'
                            : 'Calculado automaticamente'
                        }
                      />
                    </TableCell>

                    {/* REMOVE BUTTON */}
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                        onClick={() => handleRemoveRow(item.id)}
                        title="Remover linha"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
