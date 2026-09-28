import { useEffect, useState } from 'react'

import { LEAD_STATUSES, type Lead } from '../data/types'
import { dial } from '../lib/asset'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './LeadDrawer.module.css'

export default function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { setLeadStatus, saveLeadNote } = useStudio()
  const [note, setNote] = useState(lead.note)

  /* Re-seed the textarea when the drawer is pointed at a different lead. */
  useEffect(() => setNote(lead.note), [lead.id, lead.note])

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

  const fields: [string, string][] = [
    ['Phone', lead.phone],
    ['Service', lead.service],
    ['Scope', lead.area],
    ['Budget', lead.budget],
    ['Status', lead.status],
    ['Message', lead.msg],
  ]

  return (
    <div className={css.overlay} role="dialog" aria-modal="true" aria-label={lead.name}>
      <div className={css.scrim} onClick={onClose} />

      <div className={css.panel}>
        <button type="button" className={css.close} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className={ui.eyebrow}>Enquiry · {lead.ago}</div>
        <h2 className={css.name}>{lead.name}</h2>
        <div className={css.where}>
          {lead.city} · via {lead.source}
        </div>

        <div className={css.contact}>
          <a className={css.call} href={`tel:${dial(lead.phone)}`}>
            Call
          </a>
          <a
            className={css.whatsapp}
            href={`https://wa.me/${dial(lead.phone).replace('+', '')}`}
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

        <section className={css.block}>
          <div className={ui.eyebrow}>Pipeline</div>
          <div className={`${ui.pillRow} ${css.blockBody}`}>
            {LEAD_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className={status === lead.status ? css.stagePillOn : css.stagePill}
                onClick={() => setLeadStatus(lead.id, status)}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        <section className={css.block}>
          <div className={ui.eyebrow}>Internal note</div>
          <div className={css.blockBody}>
            <textarea
              className={ui.textarea}
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What was agreed on the call"
            />
            <button
              type="button"
              className={`${ui.btnGhost} ${css.saveNote}`}
              onClick={() => saveLeadNote(lead.id, note)}
            >
              Save note
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
