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

/* Sections of the panel the API has switched on for this deployment
   (FEATURE_* in its environment). A locked section answers 403, so the
   panel hides it instead of showing something that cannot work. */
export type Features = { faqs: boolean; siteSettings: boolean }

/** An API that sends no features (an older build) locks nothing. */
export const allFeatures: Features = { faqs: true, siteSettings: true }
export const normalizeFeatures = (features?: Partial<Features>): Features => ({ ...allFeatures, ...features })

export type LoginResult = { token: string; expiresAt: string; user: AdminUser; features?: Features }

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

export const me = () => api<{ user: AdminUser; expiresAt: string; features?: Features }>('/admin/auth/me')

export const logout = () => api<void>('/admin/auth/logout', { method: 'POST' })
