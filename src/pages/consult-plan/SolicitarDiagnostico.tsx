import { useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/hooks/use-toast'
import { submitDiagnostic } from '@/services/consult_plan'

const formSchema = z.object({
  nomeEmpresa: z.string().min(2, 'O nome da empresa é obrigatório.'),
  faturamentoAnual: z.string().min(1, 'O faturamento anual é obrigatório.'),
  cnpj: z.string().min(14, 'Insira um CNPJ válido.'),
  email: z.string().email('Insira um endereço de e-mail válido.'),
  telefone: z.string().min(10, 'Insira um telefone válido com DDD.'),
  nomeResponsavel: z.string().min(2, 'O nome do responsável é obrigatório.'),
  valorCaptacao: z.string().min(1, 'O valor aproximado é obrigatório.'),
  prazoDesejado: z.string().min(1, 'Selecione um prazo desejado.'),
  descricao: z.string().min(10, 'Descreva brevemente o projeto (mínimo de 10 caracteres).'),
})

type FormValues = z.infer<typeof formSchema>

export default function ConsultPlanSolicitarDiagnostico() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeEmpresa: '',
      faturamentoAnual: '',
      cnpj: '',
      email: '',
      telefone: '',
      nomeResponsavel: '',
      valorCaptacao: '',
      prazoDesejado: '',
      descricao: '',
    },
  })

  // Basic formatters
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .substring(0, 14)
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .substring(0, 11)
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
  }

  const formatCurrency = (value: string) => {
    let numericValue = value.replace(/\D/g, '')
    if (!numericValue) return ''
    const number = parseInt(numericValue, 10) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number)
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      const faturamentoAnualNum = parseFloat(data.faturamentoAnual.replace(/\D/g, '')) / 100
      await submitDiagnostic({
        ...data,
        faturamento_anual: faturamentoAnualNum,
      })
      setIsSuccess(true)
      toast({
        title: 'Sucesso!',
        description: 'Obrigado! Entraremos em contato em breve.',
        variant: 'default',
      })
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
        <Header title="Solicitar Diagnóstico" />
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full flex flex-col items-center justify-center text-center space-y-6 mt-12 animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Solicitação Enviada!</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Obrigado! Recebemos os dados do seu projeto e nossa equipe de especialistas entrará em
            contato em breve para os próximos passos.
          </p>
          <Button asChild className="mt-8">
            <Link to="/consult-plan/home">Voltar para a Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
      <Header title="Solicitar Diagnóstico" />
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-fade-in-up pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/consult-plan/home">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Solicitar Diagnóstico</h1>
          <p className="text-muted-foreground text-lg">
            Preencha o formulário abaixo para que nossa equipe entenda as necessidades do seu
            projeto e prepare uma análise inicial de viabilidade.
          </p>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Dados da Empresa e Projeto</CardTitle>
            <CardDescription>
              As informações fornecidas serão tratadas com total confidencialidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nomeEmpresa"
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
                    name="faturamentoAnual"
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
                    name="nomeResponsavel"
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
                    name="valorCaptacao"
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
                    name="prazoDesejado"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
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
                    name="descricao"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Descrição do Projeto *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva brevemente o objetivo da captação (ex: expansão de fábrica, capital de giro, reestruturação de dívidas...)"
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                      </>
                    ) : (
                      'Enviar Solicitação'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
