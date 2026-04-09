import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface UserInfo {
  id: string
  email: string
  tipo_usuario: string
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

    const loadUserFromStorage = () => {
      try {
        const userInfoStr = localStorage.getItem('user_info')
        if (userInfoStr) {
          const parsed = JSON.parse(userInfoStr)
          if (
            parsed &&
            typeof parsed === 'object' &&
            (parsed.usuario_id || parsed.id) &&
            parsed.email
          ) {
            return {
              id: parsed.usuario_id || parsed.id,
              email: parsed.email,
              tipo_usuario: parsed.tipo_usuario || 'cliente',
              role:
                parsed.tipo_usuario === 'admin'
                  ? 'administrador'
                  : parsed.tipo_usuario || 'cliente',
            }
          }
        }
      } catch (e) {
        console.error('Erro ao ler user_info do localStorage', e)
        try {
          localStorage.removeItem('user_info')
        } catch (e) {} // Fail silently if quota exceeded or access denied
      }
      return null
    }

    const handleSession = (currentSession: Session | null) => {
      if (!currentSession) {
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      const storedUser = loadUserFromStorage()
      if (storedUser && storedUser.email === currentSession.user.email) {
        if (mounted) {
          setUser(storedUser)
          setLoading(false)
        }
      } else {
        try {
          const tipo_usuario = currentSession.user.user_metadata?.tipo_usuario || 'cliente'
          const userInfo = {
            usuario_id: currentSession.user.id,
            email: currentSession.user.email || '',
            tipo_usuario: tipo_usuario,
          }
          localStorage.setItem('user_info', JSON.stringify(userInfo))

          if (mounted) {
            setUser({
              id: userInfo.usuario_id,
              email: userInfo.email,
              tipo_usuario: userInfo.tipo_usuario,
              role: userInfo.tipo_usuario === 'admin' ? 'administrador' : userInfo.tipo_usuario,
            })
            setLoading(false)
          }
        } catch (err) {
          console.error('Erro ao salvar user_info na sessão', err)
          if (mounted) {
            const fallbackTipo = currentSession.user.user_metadata?.tipo_usuario || 'cliente'
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              tipo_usuario: fallbackTipo,
              role: fallbackTipo === 'admin' ? 'administrador' : fallbackTipo,
            })
            setLoading(false)
          }
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (mounted) {
        setSession(newSession)
        handleSession(newSession)
      }
    })

    let sessionTimeout: ReturnType<typeof setTimeout>

    const fetchSession = async () => {
      try {
        sessionTimeout = setTimeout(() => {
          if (mounted && loading) {
            console.warn('Timeout ao recuperar sessão do Supabase, forçando carregamento')
            setLoading(false)
          }
        }, 5000)

        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession()

        clearTimeout(sessionTimeout)

        if (error) {
          console.error('Erro ao recuperar sessão inicial:', error)
          if (mounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(initialSession)
          handleSession(initialSession)
        }
      } catch (err) {
        clearTimeout(sessionTimeout)
        console.error('Erro inesperado em getSession:', err)
        if (mounted) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      }
    }

    fetchSession()

    const onStorageChange = () => {
      if (mounted) {
        const stored = loadUserFromStorage()
        if (stored) setUser(stored)
      }
    }

    window.addEventListener('auth-change', onStorageChange)
    window.addEventListener('storage', onStorageChange)

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('auth-change', onStorageChange)
      window.removeEventListener('storage', onStorageChange)
      if (sessionTimeout) clearTimeout(sessionTimeout)
    }
  }, [])

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
    try {
      localStorage.removeItem('custom_jwt_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('admin_token')
    } catch (e) {
      console.error('Erro ao limpar localStorage no logout', e)
    }
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
