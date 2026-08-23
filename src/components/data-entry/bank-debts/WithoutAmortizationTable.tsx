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
  instituicao: string
  limite_credito: string
  taxa_juros: string
  saldo_devedor: string
}

export function WithoutAmortizationTable() {
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
          .eq('tipo_analise', 'sem_quitacao')
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
        instituicao: '',
        limite_credito: '',
        taxa_juros: '',
        saldo_devedor: '',
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
          .eq('tipo_analise', 'sem_quitacao')
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
            tipo_analise: 'sem_quitacao',
            nome_analise: 'Dívidas sem quitação principal',
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
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-bold uppercase text-slate-800 dark:text-slate-100">
          SEM QUITAÇÃO DA OBRIGAÇÃO PRINCIPAL
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
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        Instituição financeira
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Nome da instituição financeira credora</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        Limite de crédito
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Limite de crédito concedido pela instituição financeira</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        Taxa de juros mensal
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Taxa de juros mensal cobrada pela instituição</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help underline decoration-dotted underline-offset-2">
                        Média mensal saldo devedor
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Média mensal do limite utilizado, para base de cálculo dos juros pagos</p>
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
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Carregando dados...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma linha adicionada. Clique em "Inserir linha" para começar.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-2 min-w-[200px]">
                    <Input
                      value={item.instituicao}
                      onChange={(e) => handleChange(item.id, 'instituicao', e.target.value)}
                      placeholder="Ex: Banco do Brasil"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2 min-w-[150px]">
                    <Input
                      value={item.limite_credito}
                      onChange={(e) => handleChange(item.id, 'limite_credito', e.target.value)}
                      placeholder="Ex: R$ 100.000,00"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell className="p-2 min-w-[150px]">
                    <Input
                      value={item.taxa_juros}
                      onChange={(e) => handleChange(item.id, 'taxa_juros', e.target.value)}
                      placeholder="Ex: 1,5%"
                      className="h-8 text-right"
                    />
                  </TableCell>
                  <TableCell className="p-2 min-w-[180px]">
                    <Input
                      value={item.saldo_devedor}
                      onChange={(e) => handleChange(item.id, 'saldo_devedor', e.target.value)}
                      placeholder="Ex: R$ 50.000,00"
                      className="h-8 text-right"
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
