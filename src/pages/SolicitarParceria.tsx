import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Mail, MessageSquare, User } from 'lucide-react'

export default function SolicitarParceria() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      empresa: formData.get('empresa') as string,
      mensagem: formData.get('mensagem') as string,
    }

    try {
      const { error } = await supabase.from('solicitacoes_parceria').insert([data])

      if (error) throw error

      toast({
        title: 'Solicitação enviada com sucesso!',
        description: 'Nossa equipe entrará em contato em breve.',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar solicitação',
        description: error.message || 'Ocorreu um erro ao processar seu pedido. Tente novamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-12 md:py-24 animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Seja nosso parceiro</h1>
        <p className="text-muted-foreground">
          Preencha o formulário abaixo para nos contar um pouco mais sobre sua empresa e como
          podemos colaborar.
        </p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Formulário de Solicitação</CardTitle>
          <CardDescription>Todos os campos são obrigatórios.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Nome Completo
              </Label>
              <Input id="nome" name="nome" placeholder="Seu nome" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                E-mail Corporativo
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@suaempresa.com.br"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Nome da Empresa
              </Label>
              <Input
                id="empresa"
                name="empresa"
                placeholder="Sua Empresa LTDA"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Mensagem ou Proposta
              </Label>
              <Textarea
                id="mensagem"
                name="mensagem"
                rows={5}
                required
                placeholder="Conte-nos um pouco sobre a sua empresa e que tipo de parceria você tem em mente..."
                disabled={loading}
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando solicitação...' : 'Enviar Solicitação'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
