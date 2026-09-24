import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'

export interface Company {
  id: string
  name: string
  email: string
  responsible?: string
  phone?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string | null
}

export type Role = 'company' | 'admin'

export interface ResubmitData {
  companyName: string
  responsible: string
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
  isAdmin: boolean
  loading: boolean
  /** Login único de empresa e admin; devolve o papel para a tela decidir o painel. */
  login: (email: string, password: string) => Promise<Role>
  register: (data: RegisterData) => Promise<void>
  refreshUser: () => Promise<void>
  resubmit: (data: ResubmitData) => Promise<void>
  logout: () => void
  adminLogout: () => void
}

const TOKEN_KEY       = '@saude:token'
const USER_KEY        = '@saude:user'
const ADMIN_TOKEN_KEY = '@saude:admin-token'

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<Company | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const applySession = useCallback((token: string, company: Company) => {
    localStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(USER_KEY, JSON.stringify(company))
    setUser(company)
  }, [])

  const storeUser = useCallback((company: Company) => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(company))
    setUser(company)
  }, [])

  // O status pode mudar pelo admin enquanto a sessão está aberta — o painel chama isso ao montar.
  const refreshUser = useCallback(async () => {
    const company: Company = await api.get('/auth/me')
    storeUser(company)
  }, [storeUser])

  useEffect(() => {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (adminToken) {
      setIsAdmin(true)
      setLoading(false)
      return
    }

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

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const adminLogout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setIsAdmin(false)
  }, [])

  async function login(email: string, password: string): Promise<Role> {
    const res: { role: Role; token: string; company?: Company } = await api.post('/auth/login', { email, password })

    if (res.role === 'admin') {
      logout()
      localStorage.setItem(ADMIN_TOKEN_KEY, res.token)
      setIsAdmin(true)
    } else {
      adminLogout()
      applySession(res.token, res.company!)
    }
    return res.role
  }

  async function register(data: RegisterData) {
    const { token, company } = await api.post('/auth/register', data)
    applySession(token, company)
  }

  async function resubmit(data: ResubmitData) {
    const company: Company = await api.put('/auth/resubmit', data)
    storeUser(company)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, refreshUser, resubmit, logout, adminLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
