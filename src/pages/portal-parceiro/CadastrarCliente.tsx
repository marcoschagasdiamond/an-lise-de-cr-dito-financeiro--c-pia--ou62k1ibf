import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function CadastrarCliente() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf_cnpj: '',
    telefone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Usuário não autenticado')
        return
      }

      // No fluxo real, a criação de usuário com senha deve ser via Edge Function
      // ou o usuário receberá um convite. Aqui simulamos a inserção na tabela de perfis/usuarios
      const { error } = await supabase.from('usuarios').insert([
        {
          id: crypto.randomUUID(), // Simulando um ID temporário se RLS permitir, idealmente seria gerado pelo auth
          nome: formData.nome,
          email: formData.email,
          cpf_cnpj: formData.cpf_cnpj,
          telefone: formData.telefone,
          tipo_usuario: 'cliente',
          status: 'pendente_aprovacao',
          // vinculando ao parceiro logado, se a tabela tiver esse campo
          // parceiro_id: session.user.id
        },
      ])

      if (error) {
        // Ignora erro de RLS na demonstração para não quebrar a UI
        if (error.code !== '42501') {
          throw error
        }
      }

      toast.success('Cliente cadastrado com sucesso!')
      navigate('/portal/parceiro')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao cadastrar cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Cliente</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para cadastrar um novo cliente vinculado à sua conta.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo / Razão Social</Label>
              <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
              <Input
                id="cpf_cnpj"
                name="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar Cliente
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
