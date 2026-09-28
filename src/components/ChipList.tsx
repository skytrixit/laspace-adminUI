import { useState, type KeyboardEvent } from 'react'

import { pad2 } from '../lib/asset'
import ui from '../styles/ui.module.css'

type Props = {
  items: string[]
  placeholder: string
  /** Process steps carry a two-digit index; inclusions do not. */
  numbered?: boolean
  onChange: (items: string[]) => void
}

/** Text entries added with Enter or the ADD button, removed one at a time. */
export default function ChipList({ items, placeholder, numbered, onChange }: Props) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const value = draft.trim()
    if (!value) return
    onChange([...items, value])
    setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    add()
  }

  return (
    <>
      <div className={ui.chipRow}>
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className={ui.chip}>
            {numbered && <span className={ui.chipIndex}>{pad2(index)}</span>}
            {item}
            <button
              type="button"
              className={ui.chipX}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              aria-label={`Remove ${item}`}
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className={ui.chipAdd}>
        <input
          className={ui.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        <button type="button" className={ui.chipAddBtn} onClick={add}>
          Add
        </button>
      </div>
    </>
  )
}
