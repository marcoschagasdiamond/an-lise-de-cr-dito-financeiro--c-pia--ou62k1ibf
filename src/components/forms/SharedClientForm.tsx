import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Building2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formSchema = z.object({
  empresa_nome: z.string().min(2, 'O nome da empresa é obrigatório.'),
  cnpj: z.string().min(14, 'Insira um CNPJ válido.'),
  faturamento_anual: z.string().min(1, 'O faturamento anual é obrigatório.'),
  nome_responsavel: z.string().min(2, 'O nome do responsável é obrigatório.'),
  email: z.string().email('Insira um endereço de e-mail válido.'),
  telefone: z.string().min(10, 'Insira um telefone válido com DDD.'),
  valor_captacao: z.string().min(1, 'O valor aproximado é obrigatório.'),
  prazo_desejado: z.string().min(1, 'Selecione um prazo desejado.'),
  descricao_projeto: z.string().min(10, 'Descreva brevemente o projeto (mínimo de 10 caracteres).'),
})

type FormValues = z.infer<typeof formSchema>

export const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .substring(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .substring(0, 11)
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d)(\d{4})$/, '$1-$2')
}

export const formatCurrency = (value: string) => {
  let numericValue = value.replace(/\D/g, '')
  if (!numericValue) return ''
  const number = parseInt(numericValue, 10) / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number)
}

export function SharedClientForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentClients, setRecentClients] = useState<any[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa_nome: '',
      cnpj: '',
      faturamento_anual: '',
      nome_responsavel: '',
      email: '',
      telefone: '',
      valor_captacao: '',
      prazo_desejado: '',
      descricao_projeto: '',
    },
  })

  const loadRecentClients = async () => {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('data_cadastro', { ascending: false })
      .limit(5)
    if (data) setRecentClients(data)
  }

  useEffect(() => {
    loadRecentClients()
  }, [])

  useRealtime('clientes', (payload) => {
    loadRecentClients()
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const faturamentoAnualNum = parseFloat(data.faturamento_anual.replace(/\D/g, '')) / 100
      const valorCaptacaoNum = parseFloat(data.valor_captacao.replace(/\D/g, '')) / 100

      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      const { error } = await supabase.from('clientes').insert([
        {
          usuario_id: userId || null,
          empresa_nome: data.empresa_nome,
          cnpj: data.cnpj,
          faturamento_anual: faturamentoAnualNum,
          nome_responsavel: data.nome_responsavel,
          email: data.email,
          telefone: data.telefone,
          valor_captacao: valorCaptacaoNum,
          prazo_desejado: data.prazo_desejado,
          descricao_projeto: data.descricao_projeto,
        },
      ])

      if (error) {
        throw error
      }

      toast.success('Cliente cadastrado com sucesso!')
      form.reset()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao cadastrar cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="empresa_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Razão Social ou Nome Fantasia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="faturamento_anual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faturamento Anual *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      {...field}
                      onChange={(e) => field.onChange(formatCurrency(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00.000.000/0000-00"
                      {...field}
                      onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                      maxLength={18}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome_responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Responsável *</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone / WhatsApp *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      {...field}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                      maxLength={15}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor_captacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Aproximado da Captação *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      {...field}
                      onChange={(e) => field.onChange(formatCurrency(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prazo_desejado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo Desejado para Conclusão *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled hidden>
                        Selecione uma opção
                      </option>
                      <option value="30_dias">Imediato (até 30 dias)</option>
                      <option value="60_dias">Curto prazo (30 a 60 dias)</option>
                      <option value="90_dias">Médio prazo (60 a 90 dias)</option>
                      <option value="mais_90_dias">Longo prazo (mais de 90 dias)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao_projeto"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descrição do Projeto *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva brevemente o objetivo da captação"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-[200px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                'Salvar Cliente'
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Tabela Realtime */}
      {recentClients.length > 0 && (
        <Card className="mt-8 border-border/50 shadow-sm animate-fade-in-up">
          <CardHeader className="bg-muted/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Últimos Clientes Cadastrados (Sincronizado em Tempo Real)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex justify-between items-center p-4 bg-background rounded-lg border shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-sm">{client.empresa_nome}</p>
                    <p className="text-xs text-muted-foreground">
                      CNPJ: {client.cnpj || 'Não informado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-primary">{client.email}</p>
                    <p className="text-xs text-muted-foreground">{client.telefone}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
