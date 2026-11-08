/* ── Session ───────────────────────────────────────────────────────────────
   Holds who is signed in. On boot, a stored token is checked against /me
   before anything renders, so a stale token never shows the shell for a
   moment and then bounces. A 401 on any later call signs the panel out.
   ------------------------------------------------------------------------ */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { allFeatures, login, logout, me, normalizeFeatures, type AdminUser, type Features } from '../lib/authApi'
import { setUnauthorizedHandler } from '../lib/http'
import { clearToken, readToken, writeToken } from '../lib/session'

type Status = 'checking' | 'in' | 'out'

type Auth = {
  status: Status
  user: AdminUser | null
  /** What the API has switched on — fixed for the session, read at sign-in. */
  features: Features
  signedIn: boolean
  signIn: (email: string, password: string, remember: boolean) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: Status; user: AdminUser | null; features: Features }>(() =>
    readToken()
      ? { status: 'checking', user: null, features: allFeatures }
      : { status: 'out', user: null, features: allFeatures },
  )

  const drop = useCallback(() => {
    clearToken()
    setState({ status: 'out', user: null, features: allFeatures })
  }, [])

  /* Verify a stored token once, on boot. */
  useEffect(() => {
    if (state.status !== 'checking') return
    let cancelled = false
    me()
      .then(({ user, features }) => !cancelled && setState({ status: 'in', user, features: normalizeFeatures(features) }))
      .catch(() => !cancelled && drop())
    return () => {
      cancelled = true
    }
  }, [state.status, drop])

  /* Any 401 from any call means the session is gone server-side. */
  useEffect(() => {
    setUnauthorizedHandler(drop)
    return () => setUnauthorizedHandler(null)
  }, [drop])

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const { token, user, features } = await login(email, password, remember)
    writeToken(token, remember)
    setState({ status: 'in', user, features: normalizeFeatures(features) })
  }, [])

  /* Revoke server-side, then forget locally. The local part never waits on
     the network — Sign out must work even if the API is unreachable. */
  const signOut = useCallback(() => {
    logout().catch(() => undefined)
    drop()
  }, [drop])

  const value = useMemo<Auth>(
    () => ({ status: state.status, user: state.user, features: state.features, signedIn: state.status === 'in', signIn, signOut }),
    [state, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
