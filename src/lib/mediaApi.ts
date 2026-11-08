import type { MediaView } from '../data/types'
import { api, ApiError, BASE } from './http'
import { readToken } from './session'

/* ── Uploads ───────────────────────────────────────────────────────────────
   fetch() has no upload progress, so the POST goes through XMLHttpRequest.
   The API answers 202 as soon as the original is stored; the derivatives
   follow, so the caller polls until the row is `ready`.
   ------------------------------------------------------------------------ */

export function uploadMedia(file: File, onProgress: (fraction: number) => void, alt?: string): Promise<MediaView> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const body = new FormData()
    body.append('file', file, file.name)
    if (alt) body.append('alt', alt)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total)
    }
    xhr.onerror = () => reject(new ApiError(0, 'network', 'Could not reach the studio API.'))
    xhr.onload = () => {
      let payload: { code?: string; message?: string; fields?: Record<string, string> } | MediaView | null = null
      try {
        payload = JSON.parse(xhr.responseText)
      } catch {
        /* no body */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(payload as MediaView)
      else {
        const p = (payload ?? {}) as { code?: string; message?: string; fields?: Record<string, string> }
        reject(new ApiError(xhr.status, p.code ?? 'error', p.message ?? `Upload failed (${xhr.status}).`, p.fields ?? {}))
      }
    }
    xhr.open('POST', `${BASE}/admin/media`)
    const token = readToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.send(body)
  })
}

/** Polls until the worker has finished. A failed job rejects; a slow one gives up after two minutes. */
export async function waitForReady(id: number, onTick?: (view: MediaView) => void): Promise<MediaView> {
  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    const view = await api<MediaView>(`/admin/media/${id}`)
    onTick?.(view)
    if (view.status === 'ready') return view
    if (view.status === 'failed') throw new ApiError(500, 'processing_failed', 'The image could not be processed.')
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new ApiError(504, 'processing_timeout', 'The image is taking too long to process.')
}

export const deleteMedia = (id: number) => api<void>(`/admin/media/${id}`, { method: 'DELETE' })
