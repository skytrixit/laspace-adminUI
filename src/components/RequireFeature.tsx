import { Navigate, Outlet } from 'react-router-dom'

import type { Features } from '../lib/authApi'
import { useAuth } from '../store/auth'

/** The routes of a section the API has locked bounce to the dashboard, as if they did not exist. */
export default function RequireFeature({ name }: { name: keyof Features }) {
  const { features } = useAuth()
  return features[name] ? <Outlet /> : <Navigate to="/" replace />
}
