/** Resolve a stored upload path against the panel's deploy base (`/admin/`). */
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

/** `background-image` value for a stored upload path. */
export const photo = (path: string) => `url("${asset(path)}")`

/** Strip everything but the digits a `tel:` / `wa.me` href can carry. */
export const dial = (phone: string) => phone.replace(/[^\d+]/g, '')

/** `01`, `02`, … — the index prefix on a process-step chip. */
export const pad2 = (i: number) => String(i + 1).padStart(2, '0')
