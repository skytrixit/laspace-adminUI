import css from './StatusChip.module.css'

/* The two states an inbox item has. Gold = needs a reply, green = done —
   the same tones the pipeline chips used for New and Won. */
const TONE = {
  open: { fg: '#C29D62', bd: 'rgba(194,157,98,0.55)', label: 'New' },
  done: { fg: '#9DBE8F', bd: 'rgba(157,190,143,0.45)', label: 'Handled' },
}

export default function StatusChip({ handled }: { handled: boolean }) {
  const tone = handled ? TONE.done : TONE.open
  return (
    <span className={css.chip} style={{ color: tone.fg, borderColor: tone.bd }}>
      {tone.label}
    </span>
  )
}
