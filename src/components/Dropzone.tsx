import { useEffect, useRef, useState, type DragEvent } from 'react'

import type { MediaView } from '../data/types'
import { ApiError } from '../lib/http'
import { uploadMedia, waitForReady } from '../lib/mediaApi'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'

type Props = {
  title: string
  hint: string
  /** URL of the image currently set, if any. */
  preview?: string | null
  /** Several files, uploaded one after another; each reports when it is ready. */
  multiple?: boolean
  onUploaded: (view: MediaView) => void
  /** Shown as a small "Remove" under the preview. */
  onRemove?: () => void
}

type Phase = { kind: 'idle' } | { kind: 'uploading'; name: string; fraction: number; index: number; total: number } | { kind: 'processing'; name: string; index: number; total: number }

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif'

/** Drag-and-drop or click to choose. Uploads, then waits for the derivative set before reporting the image as usable. */
export default function Dropzone({ title, hint, preview, multiple = false, onUploaded, onRemove }: Props) {
  const { notify } = useStudio()
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [over, setOver] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  /* The parent's handler may change between files in a batch; always call the latest. */
  const latest = useRef(onUploaded)
  useEffect(() => {
    latest.current = onUploaded
  }, [onUploaded])

  const busy = phase.kind !== 'idle'

  const run = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => ACCEPT.split(',').includes(f.type))
    if (!list.length) {
      notify('Choose a JPEG, PNG, WebP or AVIF image')
      return
    }
    const batch = multiple ? list : list.slice(0, 1)
    for (const [index, file] of batch.entries()) {
      try {
        setPhase({ kind: 'uploading', name: file.name, fraction: 0, index, total: batch.length })
        const accepted = await uploadMedia(file, (fraction) => setPhase({ kind: 'uploading', name: file.name, fraction, index, total: batch.length }))
        setPhase({ kind: 'processing', name: file.name, index, total: batch.length })
        const ready = await waitForReady(accepted.id)
        latest.current(ready)
      } catch (err) {
        notify(err instanceof ApiError ? err.message : 'Upload failed')
      }
    }
    setPhase({ kind: 'idle' })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    if (!busy && e.dataTransfer.files.length) void run(e.dataTransfer.files)
  }

  const status =
    phase.kind === 'uploading'
      ? `Uploading ${phase.name}${phase.total > 1 ? ` (${phase.index + 1} of ${phase.total})` : ''} — ${Math.round(phase.fraction * 100)}%`
      : phase.kind === 'processing'
        ? `Processing ${phase.name}${phase.total > 1 ? ` (${phase.index + 1} of ${phase.total})` : ''} — making the fifteen sizes…`
        : null

  return (
    <>
      {preview && !busy && (
        <>
          <div className={ui.thumb} role="img" aria-label="Current image" style={{ backgroundImage: `url("${preview}")` }} />
          {onRemove && (
            <button type="button" className={ui.thumbRemove} onClick={onRemove}>
              Remove
            </button>
          )}
        </>
      )}
      <button
        type="button"
        className={[ui.dropzone, over ? ui.dropzoneActive : '', busy ? ui.dropzoneBusy : ''].join(' ')}
        onClick={() => !busy && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!busy) setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        disabled={busy}
        aria-busy={busy}
      >
        <span className={ui.dropTitle}>{busy ? 'Working…' : title}</span>
        <span className={ui.meta}>{hint}</span>
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        hidden
        onChange={(e) => {
          if (e.target.files?.length) void run(e.target.files)
          e.target.value = ''
        }}
      />
      {status && (
        <div className={ui.dropStatus} role="status">
          {status}
          <div className={ui.progressTrack}>
            <div className={ui.progressFill} style={{ width: phase.kind === 'uploading' ? `${Math.round(phase.fraction * 100)}%` : '100%' }} />
          </div>
        </div>
      )}
    </>
  )
}
