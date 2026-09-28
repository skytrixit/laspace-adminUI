import { useState } from 'react'

import EditorialList from '../components/EditorialList'
import Field from '../components/Field'
import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import Toggle from '../components/Toggle'
import type { Faq, FaqInput } from '../data/types'
import { ApiError } from '../lib/http'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Editorial.module.css'

const blank = (): FaqInput => ({ question: '', answer: '', isPublished: false })
const from = (f: Faq): FaqInput => ({ question: f.question, answer: f.answer, isPublished: f.isPublished })

export default function Faqs() {
  const { faqs, loaded, saveFaq, toggleFaqPub, removeFaq, reorderFaqs } = useStudio()
  const [editing, setEditing] = useState<{ id?: number; draft: FaqInput } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const open = (f?: Faq) => {
    setErrors({})
    setEditing(f ? { id: f.id, draft: from(f) } : { draft: blank() })
  }
  const set = <K extends keyof FaqInput>(key: K, value: FaqInput[K]) => {
    setEditing((e) => e && { ...e, draft: { ...e.draft, [key]: value } })
    setErrors((e) => (key in e ? { ...e, [key]: '' } : e))
  }
  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await saveFaq(editing.draft, editing.id)
      setEditing(null)
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <HeaderBar crumb="Editorial" title="FAQs" />
      <div className={Shell.content}>
        <div className={css.toolbar}>
          <div className={ui.meta}>{faqs.length} questions · {faqs.filter((f) => f.isPublished).length} live</div>
          <button type="button" className={`${ui.btnGhost} ${css.add}`} onClick={() => open()}>
            + Add Question
          </button>
        </div>

        {editing && (
          <section className={`${ui.panel} ${css.editor}`}>
            <div className={css.editorHead}>
              <div className={ui.eyebrow}>{editing.id ? 'Edit Question' : 'New Question'}</div>
              <Toggle on={editing.draft.isPublished} onLabel="Live on the site" offLabel="Saved as draft" onToggle={() => set('isPublished', !editing.draft.isPublished)} />
            </div>
            <div className={ui.fieldGrid}>
              <Field label="Question" full error={errors.question}>
                <input className={ui.input} value={editing.draft.question} onChange={(e) => set('question', e.target.value)} placeholder="How long does a project take?" />
              </Field>
              <Field label="Answer" full error={errors.answer}>
                <textarea className={ui.textarea} rows={5} value={editing.draft.answer} onChange={(e) => set('answer', e.target.value)} />
              </Field>
            </div>
            <div className={css.editorActions}>
              <button type="button" className={ui.btnGold} onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Question'}
              </button>
              <button type="button" className={ui.btnGhost} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </section>
        )}

        <EditorialList
          rows={faqs}
          loaded={loaded}
          columns={['Question', 'Answer']}
          primary={(f) => f.question}
          secondary={(f) => f.answer}
          aside={() => ''}
          label={(f) => f.question}
          emptyText="No questions yet."
          onEdit={open}
          onToggle={toggleFaqPub}
          onRemove={removeFaq}
          onReorder={reorderFaqs}
        />
      </div>
    </>
  )
}
