import type { ReactNode } from 'react'

import ui from '../styles/ui.module.css'

type Props = {
  label: string
  /** Sits beside the label — where the copy will appear on the live site. */
  hint?: string
  full?: boolean
  /** Wraps a group of buttons rather than one control, so not a <label>. */
  group?: boolean
  children: ReactNode
}

export default function Field({ label, hint, full, group, children }: Props) {
  const Tag = group ? 'div' : 'label'
  return (
    <Tag className={full ? `${ui.field} ${ui.full}` : ui.field}>
      <span className={ui.labelRow}>
        <span className={ui.label}>{label}</span>
        {hint && <span className={ui.hint}>{hint}</span>}
      </span>
      {children}
    </Tag>
  )
}
