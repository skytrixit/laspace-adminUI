import ui from '../styles/ui.module.css'

type Props = { title: string; hint: string; /** URL of the image currently set, if any. */ preview?: string | null }

/** Shows the current image; upload itself arrives in Phase 5. */
export default function Dropzone({ title, hint, preview }: Props) {
  return (
    <>
      {preview && <div className={ui.thumb} role="img" aria-label="Current image" style={{ backgroundImage: `url("${preview}")` }} />}
      <button type="button" className={ui.dropzone}>
        <span className={ui.dropTitle}>{title}</span>
        <span className={ui.meta}>{hint}</span>
      </button>
    </>
  )
}
