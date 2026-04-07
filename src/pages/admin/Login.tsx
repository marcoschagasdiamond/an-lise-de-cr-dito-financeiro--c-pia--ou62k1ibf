import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session || token) {
        setTimeout(() => {
          navigate('/admin/dashboard', { replace: true })
        }, 0)
      }
    })
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 1. Unificação da Autenticação: Tentar login via Supabase Auth primeiro
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!authError && authData.session) {
        toast.success('Login efetuado com sucesso!')
        setTimeout(() => {
          navigate('/admin/dashboard')
        }, 0)
        setIsLoading(false)
        return
      }

      // 2. Fallback para a Edge Function caso o usuário só exista no banco antigo
      const { data, error } = await supabase.functions.invoke('criar-usuario-admin', {
        body: { email, password },
      })

      if (error || data?.error) {
        toast.error('Credenciais inválidas.')
        setIsLoading(false)
        return
      }

      if (data?.token) {
        localStorage.setItem('admin_token', data.token)
        toast.success('Login efetuado com sucesso!')
        setTimeout(() => {
          navigate('/admin/dashboard')
        }, 0)
      } else {
        toast.error('Credenciais inválidas.')
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado ao tentar fazer login.')
    }

    setIsLoading(false)
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
