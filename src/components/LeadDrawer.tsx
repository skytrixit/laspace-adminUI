import { useEffect, useState } from 'react'

import { SOURCE_LABEL, type Enquiry } from '../data/types'
import { dial } from '../lib/asset'
import { deleteEnquiry /* STATUS: , setEnquiryHandled */ } from '../lib/enquiriesApi'
import { formatDateTime, timeAgo } from '../lib/time'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './LeadDrawer.module.css'

type Props = {
  enquiry: Enquiry
  onClose: () => void
  /** The row as the API returned it after a change, so the list stays in step. */
  onChange: (updated: Enquiry) => void
  onDeleted: (id: number) => void
}

export default function LeadDrawer({ enquiry, onClose, /* STATUS: onChange, */ onDeleted }: Props) {
  const { notify, refreshEnquiries } = useStudio()
  const [busy, setBusy] = useState(false)
  const [armed, setArmed] = useState(false)

  /* Escape closes, and the page behind the scrim stops scrolling. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  /* A new enquiry in the same drawer disarms the delete. */
  useEffect(() => setArmed(false), [enquiry.id])

  /* STATUS — the handled / new workflow is parked until it is released (see Leads.tsx).
  const toggleHandled = async () => {
    setBusy(true)
    try {
      onChange(await setEnquiryHandled(enquiry.id, !enquiry.isHandled))
      notify(enquiry.isHandled ? 'Marked as new' : 'Marked as handled')
      void refreshEnquiries()
    } catch {
      notify('Could not update')
    } finally {
      setBusy(false)
    }
  }
  */

  /* Two clicks to delete: the first arms the button, the second commits. */
  const remove = async () => {
    if (!armed) {
      setArmed(true)
      return
    }
    setBusy(true)
    try {
      await deleteEnquiry(enquiry.id)
      notify('Enquiry removed')
      void refreshEnquiries()
      onDeleted(enquiry.id)
    } catch {
      notify('Could not remove')
      setBusy(false)
    }
  }

  const fields: [string, string][] = [
    ['Phone', enquiry.phone],
    ['Email', enquiry.email ?? '—'],
    ['Service', enquiry.serviceLabel],
    ['Budget', enquiry.budgetLabel ?? '—'],
    ['Received', formatDateTime(enquiry.submittedAt)],
    ['Message', enquiry.message ?? '—'],
  ]

  return (
    <div className={css.overlay} role="dialog" aria-modal="true" aria-label={enquiry.name}>
      <div className={css.scrim} onClick={onClose} />

      <div className={css.panel}>
        <button type="button" className={css.close} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className={ui.eyebrow}>Enquiry · {timeAgo(enquiry.submittedAt)}</div>
        <h2 className={css.name}>{enquiry.name}</h2>
        <div className={css.where}>
          {SOURCE_LABEL[enquiry.source]} · {enquiry.referenceCode}
        </div>

        <div className={css.contact}>
          <a className={css.call} href={`tel:${dial(enquiry.phone)}`}>
            Call
          </a>
          <a
            className={css.whatsapp}
            href={`https://wa.me/${dial(enquiry.phone).replace('+', '')}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>

        <div className={css.fields}>
          {fields.map(([label, value]) => (
            <div key={label} className={css.row}>
              <div className={ui.label}>{label}</div>
              <div className={css.rowValue}>{value}</div>
            </div>
          ))}
        </div>

        {/* STATUS:
        <section className={css.block}>
          <div className={ui.eyebrow}>Handling</div>
          <div className={css.blockBody}>
            <button
              type="button"
              className={`${ui.btnGhost} ${css.action}`}
              onClick={toggleHandled}
              disabled={busy}
            >
              {enquiry.isHandled ? 'Mark as new' : 'Mark as handled'}
            </button>
            {enquiry.isHandled && enquiry.handledAt && (
              <p className={css.hint}>Handled {timeAgo(enquiry.handledAt).toLowerCase()}.</p>
            )}
          </div>
        </section>
        */}

        <section className={css.block}>
          <div className={ui.eyebrow}>Remove</div>
          <div className={css.blockBody}>
            <button
              type="button"
              className={armed ? `${css.danger} ${css.dangerArmed}` : css.danger}
              onClick={remove}
              disabled={busy}
            >
              {armed ? 'Confirm — delete this enquiry' : 'Delete enquiry'}
            </button>
            <p className={css.hint}>
              {armed ? 'This cannot be undone. Click again to delete, or close the drawer.' : 'Removes it from the inbox for good.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
