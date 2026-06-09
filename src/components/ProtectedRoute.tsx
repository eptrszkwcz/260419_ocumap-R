import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (user == null) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
