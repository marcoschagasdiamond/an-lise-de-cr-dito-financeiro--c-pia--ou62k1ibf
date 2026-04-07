import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'administrador') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      const status = error?.status || 0

      if (status === 0) {
        toast.error('Erro de conexão. Verifique sua rede e tente novamente.')
      } else if (status >= 400 && status < 500) {
        toast.error('Credenciais inválidas. Verifique seu email e senha.')
      } else {
        toast.error('Ocorreu um erro inesperado ao tentar fazer login.')
      }

      setIsLoading(false)
      return
    }

    if (pb.authStore.record?.role !== 'administrador') {
      toast.error('Acesso negado. Esta área é restrita para administradores.')
      pb.authStore.clear()
      setIsLoading(false)
      return
    }

    toast.success('Login efetuado com sucesso!')
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#002147]/10 dark:bg-[#002147]/30 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#002147] dark:text-[#C5A059]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#002147] dark:text-white">
            Painel Administrativo
          </CardTitle>
          <CardDescription>Entre com suas credenciais de administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Administrativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemplo.com"
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
            <Button
              type="submit"
              className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
