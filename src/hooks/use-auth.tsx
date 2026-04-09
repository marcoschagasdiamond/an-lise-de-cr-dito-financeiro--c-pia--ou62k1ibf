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
          return {
            id: parsed.usuario_id || parsed.id,
            email: parsed.email,
            tipo_usuario: parsed.tipo_usuario,
            role: parsed.tipo_usuario === 'admin' ? 'administrador' : parsed.tipo_usuario,
          }
        }
      } catch (e) {
        // fail silently
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
        // Salva apenas os dados essenciais da sessão sem queries adicionais
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

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (mounted) {
        setSession(initialSession)
        handleSession(initialSession)
      }
    })

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
