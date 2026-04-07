import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface UserInfo {
  id: string
  email: string
  nome: string
  tipo_usuario: string
  status: string
  role?: string
}

interface AuthContextType {
  user: UserInfo | null
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkSession = () => {
      try {
        const token = localStorage.getItem('custom_jwt_token')
        const userInfoStr = localStorage.getItem('user_info')

        if (token && userInfoStr) {
          const userInfo = JSON.parse(userInfoStr)

          // Mapeia 'admin' para 'administrador' para garantir compatibilidade
          // com as definições de rotas no App.tsx
          let role = userInfo.tipo_usuario
          if (role === 'admin') role = 'administrador'

          if (mounted) {
            setUser({ ...userInfo, role })
          }
        } else {
          if (mounted) setUser(null)
        }
      } catch (error) {
        console.error('Erro ao validar sessão:', error)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Verifica o estado inicial
    checkSession()

    // Ouve eventos de alteração de estado de autenticação (mesma aba ou abas diferentes)
    const handleAuthChange = () => checkSession()
    window.addEventListener('auth-change', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      mounted = false
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  // Mantidos apenas para compatibilidade de tipagem, a lógica de login
  // agora é tratada nas próprias páginas chamando a Edge Function do Supabase
  const signUp = async () => {
    console.warn('signUp via useAuth obsoleto. Utilize as funções do Supabase.')
    return { error: new Error('Não implementado') }
  }

  const signIn = async () => {
    console.warn('signIn via useAuth obsoleto. Utilize as funções do Supabase.')
    return { error: new Error('Não implementado') }
  }

  const signOut = () => {
    localStorage.removeItem('custom_jwt_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('admin_token')
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
