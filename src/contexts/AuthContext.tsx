import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'

export interface Company {
  id: string
  name: string
  email: string
  responsible?: string
  phone?: string
}

export interface RegisterData {
  companyName: string
  responsible: string
  email: string
  phone?: string
  password: string
}

interface AuthContextData {
  user: Company | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const TOKEN_KEY = '@saude:token'
const USER_KEY  = '@saude:user'

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  const applySession = useCallback((token: string, company: Company) => {
    localStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(company))
    setUser(company)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const stored = sessionStorage.getItem(USER_KEY)

    if (!token) {
      setLoading(false)
      return
    }

    if (stored) {
      setUser(JSON.parse(stored))
      setLoading(false)
      return
    }

    api.get('/auth/me')
      .then((company: Company) => {
        sessionStorage.setItem(USER_KEY, JSON.stringify(company))
        setUser(company)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { token, company } = await api.post('/auth/login', { email, password })
    applySession(token, company)
  }

  async function register(data: RegisterData) {
    const { token, company } = await api.post('/auth/register', data)
    applySession(token, company)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
