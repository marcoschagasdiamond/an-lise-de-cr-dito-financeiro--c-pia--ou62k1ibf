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

interface DebtRow {
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

export function WithAmortizationTable() {
  const [data, setData] = useState<DebtRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
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

        if (!error && existing?.dados_analise) {
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

  const handleAddRow = () => {
    setData((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        valor_financiamento: '',
        sistema_amortizacao: '',
        modalidade_pagamento: '',
        total_periodos: '',
        periodos_carencia: '',
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
  }

  const handleChange = (id: string, field: keyof DebtRow, value: string) => {
    setData((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
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
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
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
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
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
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[150px]">
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
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[150px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        PREST. RESTANTES
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quantidade de prestações restantes para quitação</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
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
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[150px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        INDEXADOR
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Índice utilizado para correção do contrato (ex: CDI, IPCA)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        % ESTIMADA ANUAL C/ INDEX
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Taxa anual estimada incluindo o indexador</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        % EFETIVA MENSAL TOTAL
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Taxa efetiva mensal total, incluindo todos os encargos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        PRESTAÇÃO MENSAL C/ AMORTIZ
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Valor da prestação mensal incluindo amortização do principal</p>
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
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-2">
                    <Input
                      value={item.valor_financiamento}
                      onChange={(e) => handleChange(item.id, 'valor_financiamento', e.target.value)}
                      placeholder="R$ 0,00"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.sistema_amortizacao}
                      onChange={(e) => handleChange(item.id, 'sistema_amortizacao', e.target.value)}
                      placeholder="Ex: SAC"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.modalidade_pagamento}
                      onChange={(e) =>
                        handleChange(item.id, 'modalidade_pagamento', e.target.value)
                      }
                      placeholder="Ex: Mensal"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.total_periodos}
                      onChange={(e) => handleChange(item.id, 'total_periodos', e.target.value)}
                      placeholder="0"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.periodos_carencia}
                      onChange={(e) => handleChange(item.id, 'periodos_carencia', e.target.value)}
                      placeholder="0"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.prest_restantes}
                      onChange={(e) => handleChange(item.id, 'prest_restantes', e.target.value)}
                      placeholder="0"
                      className="h-8"
                    />
                  </TableCell>
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
                  <TableCell className="p-2">
                    <Input
                      value={item.indexador}
                      onChange={(e) => handleChange(item.id, 'indexador', e.target.value)}
                      placeholder="Ex: CDI"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.estimada_anual_index}
                      onChange={(e) =>
                        handleChange(item.id, 'estimada_anual_index', e.target.value)
                      }
                      placeholder="0,00%"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.efetiva_mensal_total}
                      onChange={(e) =>
                        handleChange(item.id, 'efetiva_mensal_total', e.target.value)
                      }
                      placeholder="0,00%"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      value={item.prestacao_mensal_amortiz}
                      onChange={(e) =>
                        handleChange(item.id, 'prestacao_mensal_amortiz', e.target.value)
                      }
                      placeholder="R$ 0,00"
                      className="h-8"
                    />
                  </TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
