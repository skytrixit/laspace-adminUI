import { STATUS_TONE, type LeadStatus } from '../data/types'
import css from './StatusChip.module.css'

/** Read-only status marker. Border and text both follow the tone map. */
export default function StatusChip({ status }: { status: LeadStatus }) {
  const tone = STATUS_TONE[status]
  return (
    <span className={css.chip} style={{ color: tone.fg, borderColor: tone.bd }}>
      {status}
    </span>
  )
}
