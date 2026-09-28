/* ── Session ───────────────────────────────────────────────────────────────
   One flag, held in localStorage when the studio asked to stay signed in and
   in sessionStorage otherwise. Every read and write is guarded: a private
   window or blocked site data throws on access, and the panel still has to
   render — it just cannot remember anyone.
   ------------------------------------------------------------------------ */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { authenticate, type Session } from '../lib/authApi'

const KEY = 'laspace_admin_session'

type Auth = {
  session: Session | null
  signedIn: boolean
  signIn: (email: string, password: string, remember: boolean) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<Auth | null>(null)

const stores = () => [window.localStorage, window.sessionStorage]

const readSession = (): Session | null => {
  for (const store of stores()) {
    try {
      const raw = store.getItem(KEY)
      if (raw) return JSON.parse(raw) as Session
    } catch {
      /* storage unavailable — treat as signed out */
    }
  }
  return null
}

const clearSession = () => {
  for (const store of stores()) {
    try {
      store.removeItem(KEY)
    } catch {
      /* nothing to clear */
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession)

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    const next = await authenticate(email, password)

    /* Write to one store only, and clear the other, so flipping "keep me
       signed in" never leaves a second flag behind. */
    clearSession()
    try {
      const store = remember ? window.localStorage : window.sessionStorage
      store.setItem(KEY, JSON.stringify(next))
    } catch {
      /* the session lives in memory for this tab either way */
    }
    setSession(next)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo<Auth>(
    () => ({ session, signedIn: session !== null, signIn, signOut }),
    [session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
