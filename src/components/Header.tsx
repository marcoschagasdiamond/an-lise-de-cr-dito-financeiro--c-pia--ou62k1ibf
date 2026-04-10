import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 sm:px-8">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block">Análise de Crédito</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>
          <nav className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground hidden md:flex">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">Entrar</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
