import ui from '../styles/ui.module.css'

/** Visual only — there is no upload backend behind the panel yet. */
export default function Dropzone({ title, hint }: { title: string; hint: string }) {
  return (
    <button type="button" className={ui.dropzone}>
      <span className={ui.dropTitle}>{title}</span>
      <span className={ui.meta}>{hint}</span>
    </button>
  )
}
