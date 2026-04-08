import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

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
  session: Session | null
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
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
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const checkLegacySession = (currentSession?: Session | null) => {
      try {
        const token = localStorage.getItem('custom_jwt_token')
        const userInfoStr = localStorage.getItem('user_info')

        if (currentSession?.user?.email) {
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr)
            // Scripts de Limpeza Automática: Se houver conflito de e-mail entre Supabase e legacy, limpa legacy
            if (userInfo.email !== currentSession.user.email) {
              console.warn('Conflito de sessão detectado. Limpando sessão legada.')
              localStorage.removeItem('custom_jwt_token')
              localStorage.removeItem('user_info')
              localStorage.removeItem('admin_token')
            }
          }
          return false
        }

        if (token && userInfoStr) {
          const userInfo = JSON.parse(userInfoStr)
          let role = userInfo.tipo_usuario
          if (role === 'admin') role = 'administrador'

          if (mounted) {
            setUser({ ...userInfo, role })
          }
          return true
        }
      } catch (error) {
        console.error('Erro ao validar sessão legada:', error)
        localStorage.removeItem('custom_jwt_token')
        localStorage.removeItem('user_info')
        localStorage.removeItem('admin_token')
      }
      return false
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      // FORBIDDEN: no async/await inside this callback — sync only
      if (mounted) {
        setSession(newSession)
      }
      if (!newSession) {
        // If no GoTrue session, check legacy one last time
        if (!checkLegacySession(newSession) && mounted) {
          setUser(null)
          setLoading(false)
        }
      } else {
        // If there is a GoTrue session, we verify if legacy conflicts
        checkLegacySession(newSession)
      }
    })

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        setSession(initialSession)
        if (!initialSession) {
          if (!checkLegacySession(initialSession)) {
            setUser(null)
          }
          setLoading(false)
        }
      }
    })

    const handleAuthChange = () => {
      if (!session) checkLegacySession(session)
    }
    window.addEventListener('auth-change', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [session])

  // Effect to fetch user details when GoTrue session changes
  useEffect(() => {
    let mounted = true
    if (session?.user?.email) {
      supabase
        .from('usuarios')
        .select('*')
        .eq('email', session.user.email)
        .single()
        .then(({ data }) => {
          if (data && mounted) {
            let role = data.tipo_usuario
            if (role === 'admin') role = 'administrador'

            // Atualiza os dados locais para manter consistência
            const newUserInfo = {
              id: data.id,
              email: data.email,
              nome: data.nome || '',
              tipo_usuario: data.tipo_usuario || 'cliente',
              status: data.status || 'ativo',
              role,
            }

            setUser(newUserInfo)
            localStorage.setItem('user_info', JSON.stringify(newUserInfo))
          }
          if (mounted) setLoading(false)
        })
        .catch(() => {
          if (mounted) {
            setUser(null)
            setLoading(false)

            // Limpeza Automática
            localStorage.removeItem('custom_jwt_token')
            localStorage.removeItem('user_info')
            localStorage.removeItem('admin_token')
            supabase.auth.signOut().catch(() => {})
          }
        })
    }
    return () => {
      mounted = false
    }
  }, [session])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    localStorage.removeItem('custom_jwt_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('admin_token')
    setUser(null)
    setSession(null)
    window.dispatchEvent(new Event('auth-change'))
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
