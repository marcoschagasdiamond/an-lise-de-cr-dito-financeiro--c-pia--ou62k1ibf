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

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe seu e-mail e senha.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    try {
      // Tenta o método padrão de autenticação do Supabase (GoTrue)
      let { error } = await signIn(cleanEmail, cleanPassword)

      if (error) {
        // Se falhou no signIn nativo, tenta invocar a Edge Function como sincronizador / fallback
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('login', {
            body: { email: cleanEmail, password: cleanPassword },
          })

          if (edgeError || !edgeData?.success) {
            const rawMessage = edgeData?.error || error.message || ''
            const isInvalidCredentials =
              rawMessage.toLowerCase().includes('invalid login credentials') ||
              rawMessage.toLowerCase().includes('credenciais') ||
              rawMessage.toLowerCase().includes('invalid grant') ||
              rawMessage.toLowerCase().includes('incorret')

            const userFriendlyMessage = isInvalidCredentials
              ? 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.'
              : rawMessage || 'Não foi possível autenticar. Tente novamente mais tarde.'

            toast({
              title: 'Erro ao entrar',
              description: userFriendlyMessage,
              variant: 'destructive',
            })
            setLoading(false)
            return
          }

          // Edge function sincronizou as credenciais no auth.users com sucesso, tenta o signIn novamente
          const retry = await signIn(cleanEmail, cleanPassword)
          if (retry.error) {
            console.error('Retry auth error:', retry.error)
            toast({
              title: 'Erro ao entrar',
              description:
                'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
              variant: 'destructive',
            })
            setLoading(false)
            return
          }
        } catch (edgeErr) {
          console.error('Edge function error:', edgeErr)
          const isInvalidCredentials =
            error.message?.toLowerCase().includes('invalid login credentials') ||
            error.message?.toLowerCase().includes('invalid grant')

          toast({
            title: 'Erro ao entrar',
            description: isInvalidCredentials
              ? 'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.'
              : 'Não foi possível conectar ao servidor de autenticação. Tente novamente.',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }
      }

      // Obtém os dados do usuário autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Consulta resiliente com maybeSingle (não explode erro caso RLS restrinja ou demore)
        const { data: profile } = await supabase
          .from('usuarios')
          .select('status, tipo_usuario')
          .eq('id', user.id)
          .maybeSingle()

        const status = profile?.status || user.user_metadata?.status || 'ativo'
        const tipoUsuario = profile?.tipo_usuario || user.user_metadata?.tipo_usuario || 'cliente'

        if (status === 'pendente_aprovacao' || status === 'pendente') {
          await supabase.auth.signOut()
          toast({
            title: 'Aguardando Aprovação',
            description: 'Sua solicitação está em análise e aguarda aprovação dos administradores.',
            variant: 'destructive',
          })
          setLoading(false)
          return
        } else if (status === 'rejeitado' || status === 'inativo') {
          await supabase.auth.signOut()
          toast({
            title: 'Acesso Não Autorizado',
            description: 'Sua conta está inativa ou não foi aprovada.',
            variant: 'destructive',
          })
          setLoading(false)
          return
        } else {
          toast({
            title: 'Login realizado com sucesso',
            description: 'Bem-vindo de volta! Redirecionando...',
          })

          if (tipoUsuario === 'admin' || tipoUsuario === 'administrador') {
            navigate('/admin/dashboard', { replace: true })
          } else if (tipoUsuario === 'parceiro') {
            navigate('/portal/parceiro', { replace: true })
          } else {
            navigate('/portal-cliente/dashboard', { replace: true })
          }
        }
      } else {
        toast({
          title: 'Erro ao entrar',
          description: 'Não foi possível carregar a sessão do usuário. Tente novamente.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      console.error('Erro no login:', err)
      toast({
        title: 'Erro inesperado',
        description: err?.message || 'Ocorreu um erro ao processar sua solicitação.',
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
