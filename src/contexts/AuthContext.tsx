import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface Company {
  id: string
  name: string
  email: string
}

interface AuthContextData {
  user: Company | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

// Credencial fixa para o POC
const POC_CREDENTIAL = {
  email: 'empresa@saude.com',
  password: 'saude123',
  company: {
    id: '1',
    name: 'Academia Saúde Total',
    email: 'empresa@saude.com',
  } as Company,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Company | null>(() => {
    const stored = sessionStorage.getItem('@saude:user')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('@saude:user', JSON.stringify(user))
    } else {
      sessionStorage.removeItem('@saude:user')
    }
  }, [user])

  function login(email: string, password: string): boolean {
    if (
      email === POC_CREDENTIAL.email &&
      password === POC_CREDENTIAL.password
    ) {
      setUser(POC_CREDENTIAL.company)
      return true
    }
    return false
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
