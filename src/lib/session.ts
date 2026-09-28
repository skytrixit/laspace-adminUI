/* ── Token storage ─────────────────────────────────────────────────────────
   The bearer token lives in localStorage when "Keep me signed in" is
   checked and in sessionStorage when it is not — exactly where the old
   flag lived. Every access is guarded: a private window or blocked site
   data throws, and the panel still has to render.
   ------------------------------------------------------------------------ */

const KEY = 'laspace_admin_session'

const stores = () => [window.localStorage, window.sessionStorage]

export function readToken(): string | null {
  for (const store of stores()) {
    try {
      const value = store.getItem(KEY)
      if (value) return value
    } catch {
      /* storage unavailable */
    }
  }
  return null
}

export function clearToken() {
  for (const store of stores()) {
    try {
      store.removeItem(KEY)
    } catch {
      /* nothing to clear */
    }
  }
}

/** One store only, and the other cleared, so flipping the toggle never leaves a second copy. */
export function writeToken(token: string, remember: boolean) {
  clearToken()
  try {
    ;(remember ? window.localStorage : window.sessionStorage).setItem(KEY, token)
  } catch {
    /* the session lives in memory for this tab either way */
  }
}
