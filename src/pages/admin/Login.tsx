import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem('custom_jwt_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('admin_token')
    sessionStorage.clear()
    supabase.auth.signOut().catch(() => {})
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      toast.error('Informe o e-mail e a senha.')
      setIsLoading(false)
      return
    }

    try {
      localStorage.removeItem('custom_jwt_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('admin_token')
      sessionStorage.clear()
      await supabase.auth.signOut().catch(() => {})

      let { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      })

      if (error) {
        // Tenta sincronizar via edge function de login
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('login', {
            body: { email: cleanEmail, password: cleanPassword },
          })

          if (!edgeError && edgeData?.success) {
            const retry = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: cleanPassword,
            })
            error = retry.error
          }
        } catch (edgeErr) {
          console.error('Edge login error:', edgeErr)
        }
      }

      if (error) {
        const isInvalid =
          error.message?.toLowerCase().includes('invalid login credentials') ||
          error.message?.toLowerCase().includes('invalid grant')
        throw new Error(isInvalid ? 'E-mail ou senha incorretos.' : error.message)
      }

      toast.success('Login realizado! Bem-vindo ao painel administrativo.')
      navigate('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'E-mail ou senha incorretos.')
    } finally {
      setIsLoading(false)
    }
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
            Acesso Administrativo
          </CardTitle>
          <CardDescription>
            Insira suas credenciais de administrador para acessar o painel
          </CardDescription>
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
                placeholder="Sua senha de administrador"
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
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
