import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
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
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function LoginParceiro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('login', {
        body: { email, password },
      })

      if (error || data?.error) {
        toast({
          title: 'Erro ao fazer login',
          description: 'Credenciais inválidas.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      if (data?.token) {
        const user = data.user

        if (user?.tipo_usuario !== 'parceiro') {
          toast({
            title: 'Acesso negado',
            description: 'Esta área é exclusiva para parceiros.',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        if (user?.status === 'pendente_aprovacao') {
          toast({
            title: 'Aguardando Aprovação',
            description: 'Sua solicitação aguarda aprovação.',
            variant: 'destructive',
          })
        } else if (user?.status === 'rejeitado') {
          toast({
            title: 'Cadastro Rejeitado',
            description: 'Sua solicitação não foi aceita.',
            variant: 'destructive',
          })
        } else {
          localStorage.setItem('custom_jwt_token', data.token)
          localStorage.setItem('user_info', JSON.stringify(data.user))
          setTimeout(() => navigate('/portal/parceiro'), 0)
        }
      } else {
        toast({
          title: 'Erro ao fazer login',
          description: 'Credenciais inválidas.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({
        title: 'Erro ao fazer login',
        description: 'Credenciais inválidas.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-4 w-full">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Portal do Parceiro</CardTitle>
          <CardDescription>
            Insira seu email e senha para acessar o painel de gestão.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              <Link to="/cadastro-parceiro" className="text-primary hover:underline font-medium">
                Ainda não é um parceiro? Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
