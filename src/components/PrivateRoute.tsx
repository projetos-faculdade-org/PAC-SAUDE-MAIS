import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth()

  // Enquanto a sessão salva é restaurada, não redireciona (senão o F5 cai no /login).
  if (loading) return null

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
