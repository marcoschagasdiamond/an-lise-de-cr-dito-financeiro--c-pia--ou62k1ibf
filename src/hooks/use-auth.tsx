import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthUser extends User {
  role?: string
  status?: string
}

interface AuthContextType {
  user: AuthUser | null
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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && !user.role) {
      // Tenta recuperar do metadata do token primeiro (para logins fallback da edge function)
      if (user.user_metadata?.tipo_usuario) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                role: user.user_metadata.tipo_usuario,
                status: user.user_metadata.status || 'ativo',
              }
            : null,
        )
        setLoading(false)
        return
      }

      supabase
        .from('usuarios')
        .select('tipo_usuario, status')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Erro ao buscar perfil do usuário:', error)
          }
          if (data) {
            setUser((prev) =>
              prev ? { ...prev, role: data.tipo_usuario, status: data.status } : null,
            )
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error('Exceção ao buscar perfil:', err)
          setLoading(false)
        })
    }
  }, [user?.id, user?.role, user?.user_metadata])

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
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
