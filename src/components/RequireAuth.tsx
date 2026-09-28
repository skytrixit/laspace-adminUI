import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../store/auth'

/** Everything under /admin except the login screen sits behind this. */
export default function RequireAuth() {
  const { signedIn } = useAuth()
  return signedIn ? <Outlet /> : <Navigate to="/login" replace />
}
