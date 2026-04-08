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
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Scripts de Limpeza Automática: ao montar a página de login, limpa resquícios de sessão antigas
    localStorage.removeItem('custom_jwt_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('admin_token')
    supabase.auth.signOut().catch(() => {})
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Scripts de Limpeza Automática: Limpa sessões conflitantes antes de tentar um novo login
    localStorage.removeItem('custom_jwt_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('admin_token')
    await supabase.auth.signOut().catch(() => {})

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        throw error
      }

      toast.success(
        'Link enviado! Verifique seu e-mail para acessar o sistema com credenciais de Master.',
      )
    } catch (err) {
      toast.error('Ocorreu um erro inesperado ao tentar enviar o Link Mágico.')
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
            Acesso Administrativo (Link Mágico)
          </CardTitle>
          <CardDescription>
            Insira seu e-mail de administrador para receber o link de acesso
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
            <Button
              type="submit"
              className="w-full bg-[#002147] hover:bg-[#002147]/90 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Enviando...' : 'Enviar Link Mágico'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
