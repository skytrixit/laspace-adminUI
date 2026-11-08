import { readToken } from './session'

/* ── API client ────────────────────────────────────────────────────────────
   One fetch wrapper for every call the panel makes. Attaches the bearer
   token, speaks JSON, and turns the API's error shape —
   { statusCode, code, message, fields? } — into an ApiError the forms can
   render field by field. A 401 on an authenticated call signs the panel out
   through the handler AuthProvider registers.
   ------------------------------------------------------------------------ */

/* Where the browser sends API calls. Same-origin /api by default — the API
   serves the panel at /admin — or VITE_API_BASE from .env to point elsewhere.
   In dev the Vite server proxies /api to the API (vite.config.ts). */
export const BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** false for the login call: no token attached, and a 401 is the answer, not a sign-out. */
  auth?: boolean
  signal?: AbortSignal
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export async function api<T>(path: string, { method = 'GET', body, auth = true, signal }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? readToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (cause) {
    throw new ApiError(0, 'network', 'Could not reach the studio API.', {})
  }

  if (res.status === 204) return undefined as T

  const payload = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new ApiError(
      res.status,
      payload?.code ?? 'error',
      payload?.message ?? `Request failed (${res.status}).`,
      payload?.fields ?? {},
    )
    if (res.status === 401 && auth) onUnauthorized?.()
    throw err
  }
  return payload as T
}
