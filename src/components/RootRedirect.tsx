import { Navigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

export function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user != null ? '/library' : '/login'} replace />
}
