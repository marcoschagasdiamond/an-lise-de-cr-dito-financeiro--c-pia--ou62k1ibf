import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Scripts de Limpeza Automática: Limpa sessões conflitantes antes de tentar um novo login
    localStorage.removeItem('custom_jwt_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('admin_token')
    await supabase.auth.signOut().catch(() => {})

    try {
      if (useMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        })

        if (error) {
          throw error
        }

        toast({
          title: 'Link enviado!',
          description: 'Verifique seu e-mail para acessar o sistema através do Link Mágico.',
        })
        setLoading(false)
        return
      }

      const { data, error } = await supabase.functions.invoke('login', {
        body: { email, password },
      })

      if (error || data?.error) {
        localStorage.removeItem('custom_jwt_token')
        localStorage.removeItem('user_info')
        localStorage.removeItem('admin_token')
        await supabase.auth.signOut().catch(() => {})

        toast({
          title: 'Erro ao fazer login',
          description: 'Credenciais inválidas. Tente usar o Acesso sem Senha (Link Mágico).',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      if (data?.token) {
        localStorage.setItem('custom_jwt_token', data.token)
        localStorage.setItem('user_info', JSON.stringify(data.user))
        window.dispatchEvent(new Event('auth-change'))

        const user = data.user

        if (user?.status === 'pendente_aprovacao') {
          localStorage.removeItem('custom_jwt_token')
          toast({
            title: 'Aguardando Aprovação',
            description: 'Sua solicitação aguarda aprovação.',
            variant: 'destructive',
          })
        } else if (user?.status === 'rejeitado') {
          localStorage.removeItem('custom_jwt_token')
          toast({
            title: 'Cadastro Rejeitado',
            description: 'Sua solicitação não foi aceita.',
            variant: 'destructive',
          })
        } else {
          if (user?.tipo_usuario === 'admin') {
            setTimeout(() => navigate('/admin/dashboard'), 0)
          } else if (user?.tipo_usuario === 'parceiro') {
            setTimeout(() => navigate('/portal/parceiro'), 0)
          } else {
            setTimeout(() => navigate('/portal-cliente/dashboard'), 0)
          }
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
        title: 'Erro',
        description: 'Ocorreu um erro inesperado.',
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
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <CardDescription>Insira seu email e senha para acessar sua conta.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!useMagicLink && (
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
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {useMagicLink ? 'Enviar Link Mágico' : 'Entrar'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => setUseMagicLink(!useMagicLink)}
            >
              {useMagicLink ? 'Acessar com Senha' : 'Acesso sem Senha (Link Mágico)'}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
