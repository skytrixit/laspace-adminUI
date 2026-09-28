import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../store/auth'

/** Everything under /admin except the login screen sits behind this. */
export default function RequireAuth() {
  const { status } = useAuth()
  /* A stored token is being verified — hold the dark canvas rather than
     flashing the login page for a stale one or the shell for a bad one. */
  if (status === 'checking') return null
  return status === 'in' ? <Outlet /> : <Navigate to="/login" replace />
}
