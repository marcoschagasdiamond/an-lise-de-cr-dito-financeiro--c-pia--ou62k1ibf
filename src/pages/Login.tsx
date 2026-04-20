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
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Tenta o método padrão de autenticação do Supabase (GoTrue)
      const { error } = await signIn(email, password)

      if (error) {
        // Fallback: Tenta a Edge Function customizada caso o usuário esteja isolado
        const { data: edgeData, error: edgeError } = await supabase.functions.invoke('login', {
          body: { email, password },
        })

        if (edgeError || !edgeData?.success) {
          toast({
            title: 'Erro ao fazer login',
            description: 'Credenciais inválidas.',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        // Caso o login customizado retorne sucesso, tenta forçar a sessão local
        if (edgeData.token) {
          await supabase.auth.setSession({
            access_token: edgeData.token,
            refresh_token: edgeData.token,
          })
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('status, tipo_usuario')
          .eq('id', user.id)
          .single()

        if (profile?.status === 'pendente_aprovacao') {
          await supabase.auth.signOut()
          toast({
            title: 'Aguardando Aprovação',
            description: 'Sua solicitação aguarda aprovação.',
            variant: 'destructive',
          })
        } else if (profile?.status === 'rejeitado') {
          await supabase.auth.signOut()
          toast({
            title: 'Cadastro Rejeitado',
            description: 'Sua solicitação não foi aceita.',
            variant: 'destructive',
          })
        } else {
          if (profile?.tipo_usuario === 'admin' || profile?.tipo_usuario === 'administrador') {
            navigate('/admin/dashboard', { replace: true })
          } else if (profile?.tipo_usuario === 'parceiro') {
            navigate('/portal/parceiro', { replace: true })
          } else {
            navigate('/portal-cliente/dashboard', { replace: true })
          }
        }
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
