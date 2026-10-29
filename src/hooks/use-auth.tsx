import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthUser extends User {
  role?: string
  tipo_usuario?: string
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
    const buildAuthUser = (baseUser: User | null): AuthUser | null => {
      if (!baseUser) return null
      const meta = baseUser.user_metadata || {}
      const role = meta.tipo_usuario || baseUser.role || 'cliente'
      return {
        ...baseUser,
        role,
        tipo_usuario: role,
        status: meta.status || 'ativo',
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        setUser(buildAuthUser(session.user))
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setUser(buildAuthUser(session.user))
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    // Se o usuário já tiver perfil reconhecido pelo metadata, garanta loading false imediatamente
    if (user.user_metadata?.tipo_usuario) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              role: user.user_metadata.tipo_usuario,
              tipo_usuario: user.user_metadata.tipo_usuario,
              status: user.user_metadata.status || prev.status || 'ativo',
            }
          : null,
      )
      setLoading(false)
      return
    }

    // Caso não tenha metadata, busca na tabela pública
    supabase
      .from('usuarios')
      .select('tipo_usuario, status')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.warn('Aviso ao consultar perfil:', error.message)
        }
        if (data?.tipo_usuario) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  role: data.tipo_usuario,
                  tipo_usuario: data.tipo_usuario,
                  status: data.status || prev.status || 'ativo',
                }
              : null,
          )
        }
        setLoading(false)
      })
      .catch((err) => {
        console.warn('Exceção na consulta de perfil:', err)
        setLoading(false)
      })
  }, [user?.id, user?.user_metadata?.tipo_usuario, user?.user_metadata?.status])

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
