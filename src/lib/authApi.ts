/* ── Auth endpoint (stubbed) ───────────────────────────────────────────────
   Stands in for POST /api/admin/session until the backend exists. Replace
   the body of `authenticate` with the real request; the thrown
   BadCredentials is what the login form turns into its error block.
   ------------------------------------------------------------------------ */

export type Session = { email: string }

export class BadCredentials extends Error {
  constructor() {
    super('Those credentials do not match our records.')
    this.name = 'BadCredentials'
  }
}

/** The one account the stub recognises. Documented in the README. */
const DEMO = { email: 'studio@laspaceinteriors.com', password: 'laspace' }

export async function authenticate(email: string, password: string): Promise<Session> {
  await new Promise((resolve) => setTimeout(resolve, 900))

  const normalised = email.trim().toLowerCase()
  if (normalised !== DEMO.email || password !== DEMO.password) throw new BadCredentials()

  return { email: DEMO.email }
}
