import { api, ApiError } from './http'

/* ── Auth endpoints ────────────────────────────────────────────────────────
   Thin, typed calls. The session itself is held by the auth store.
   ------------------------------------------------------------------------ */

export type AdminUser = {
  id: number
  email: string
  displayName: string
  initials: string
  role: 'owner'
}

export type LoginResult = { token: string; expiresAt: string; user: AdminUser }

/** Wrong email or password — the login form shows its message verbatim. */
export class BadCredentials extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BadCredentials'
  }
}

export async function login(email: string, password: string, remember: boolean): Promise<LoginResult> {
  try {
    return await api<LoginResult>('/admin/auth/login', {
      method: 'POST',
      body: { email, password, remember },
      auth: false,
    })
  } catch (cause) {
    if (cause instanceof ApiError && cause.code === 'invalid_credentials') throw new BadCredentials(cause.message)
    throw cause
  }
}

export const me = () => api<{ user: AdminUser; expiresAt: string }>('/admin/auth/me')

export const logout = () => api<void>('/admin/auth/logout', { method: 'POST' })
