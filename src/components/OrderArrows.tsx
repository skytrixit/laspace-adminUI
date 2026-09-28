import ui from '../styles/ui.module.css'

type Props = { index: number; count: number; onMove: (from: number, to: number) => void }

/** ↑ ↓ — reordering without a drag library, in the panel's text-only idiom. */
export default function OrderArrows({ index, count, onMove }: Props) {
  return (
    <span className={ui.arrows}>
      <button type="button" className={ui.arrow} onClick={() => onMove(index, index - 1)} disabled={index === 0} aria-label="Move up">
        ↑
      </button>
      <button type="button" className={ui.arrow} onClick={() => onMove(index, index + 1)} disabled={index >= count - 1} aria-label="Move down">
        ↓
      </button>
    </span>
  )
}
