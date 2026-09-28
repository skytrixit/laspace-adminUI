import { useStudio } from '../store/studio'
import css from './Toast.module.css'

export default function Toast() {
  const { toast } = useStudio()
  if (!toast) return null

  /* Keyed on the message so a replacement toast replays the fade. */
  return (
    <div key={toast} className={css.toast} role="status" aria-live="polite">
      {toast}
    </div>
  )
}
