import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

export default function AdminPrivateRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth()

  // Enquanto a sessão salva é restaurada, não redireciona (senão o F5 cai no /login).
  if (loading) return null

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
