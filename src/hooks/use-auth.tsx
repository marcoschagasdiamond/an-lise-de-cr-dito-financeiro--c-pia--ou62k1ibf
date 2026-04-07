import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
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
  const [user, setUser] = useState<any>(pb.authStore.record)
  // Initialize loading to true so that routing decisions wait for the session check
  const [loading, setLoading] = useState(true)
  const hasCheckedSession = useRef(false)

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      if (hasCheckedSession.current) return
      hasCheckedSession.current = true

      try {
        if (pb.authStore.isValid) {
          // Refresh the auth store to get the latest user data (including roles)
          await pb.collection('users').authRefresh()
        }
      } catch (error) {
        // Token is invalid or expired
        pb.authStore.clear()
      } finally {
        if (mounted) {
          setUser(pb.authStore.record)
          setLoading(false)
        }
      }
    }

    checkSession()

    const unsubscribe = pb.authStore.onChange((_token, record) => {
      if (mounted) {
        setUser(record)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      await pb.collection('users').create({ email, password, passwordConfirm: password, name })
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
