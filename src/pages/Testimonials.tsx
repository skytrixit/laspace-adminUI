import { useState } from 'react'

import EditorialList from '../components/EditorialList'
import Dropzone from '../components/Dropzone'
import Field from '../components/Field'
import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import Toggle from '../components/Toggle'
import type { Testimonial, TestimonialInput } from '../data/types'
import { ApiError } from '../lib/http'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Editorial.module.css'

const blank = (): TestimonialInput => ({ customerName: '', attribution: null, quote: '', photoId: null, isPublished: false })
const from = (t: Testimonial): TestimonialInput => ({ customerName: t.customerName, attribution: t.attribution, quote: t.quote, photoId: t.photoId, isPublished: t.isPublished })

export default function Testimonials() {
  const { testimonials, loaded, saveTestimonial, toggleTestimonialPub, removeTestimonial, reorderTestimonials } = useStudio()
  const [editing, setEditing] = useState<{ id?: number; draft: TestimonialInput; photo?: string | null } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const open = (t?: Testimonial) => {
    setErrors({})
    setEditing(t ? { id: t.id, draft: from(t), photo: t.photo?.src ?? null } : { draft: blank() })
  }
  const set = <K extends keyof TestimonialInput>(key: K, value: TestimonialInput[K]) => {
    setEditing((e) => e && { ...e, draft: { ...e.draft, [key]: value } })
    setErrors((e) => (key in e ? { ...e, [key]: '' } : e))
  }
  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await saveTestimonial(editing.draft, editing.id)
      setEditing(null)
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <HeaderBar crumb="Editorial" title="Testimonials" />
      <div className={Shell.content}>
        <div className={css.toolbar}>
          <div className={ui.meta}>{testimonials.length} testimonials · {testimonials.filter((t) => t.isPublished).length} live</div>
          <button type="button" className={`${ui.btnGhost} ${css.add}`} onClick={() => open()}>
            + Add Testimonial
          </button>
        </div>

        {editing && (
          <section className={`${ui.panel} ${css.editor}`}>
            <div className={css.editorHead}>
              <div className={ui.eyebrow}>{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</div>
              <Toggle on={editing.draft.isPublished} onLabel="Live on the site" offLabel="Saved as draft" onToggle={() => set('isPublished', !editing.draft.isPublished)} />
            </div>
            <div className={ui.fieldGrid}>
              <Field label="Customer Name" error={errors.customerName}>
                <input className={ui.input} value={editing.draft.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder="Sruthi & Karthik" />
              </Field>
              <Field label="Location or Project" error={errors.attribution}>
                <input className={ui.input} value={editing.draft.attribution ?? ''} onChange={(e) => set('attribution', e.target.value || null)} placeholder="Villa Marine Drive" />
              </Field>
              <Field label="Testimonial" full error={errors.quote}>
                <textarea className={ui.textarea} rows={4} value={editing.draft.quote} onChange={(e) => set('quote', e.target.value)} />
              </Field>
              <Field label="Customer Photograph" group full>
                <Dropzone
                  title="Drop photograph"
                  hint="A square crop works best"
                  preview={editing.photo ?? null}
                  onUploaded={(view) => {
                    setEditing((e) => e && { ...e, photo: view.src })
                    set('photoId', view.id)
                  }}
                  onRemove={
                    editing.photo
                      ? () => {
                          setEditing((e) => e && { ...e, photo: null })
                          set('photoId', null)
                        }
                      : undefined
                  }
                />
              </Field>
            </div>
            <div className={css.editorActions}>
              <button type="button" className={ui.btnGold} onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Testimonial'}
              </button>
              <button type="button" className={ui.btnGhost} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </section>
        )}

        <EditorialList
          rows={testimonials}
          loaded={loaded}
          columns={['Testimonial', 'Attribution']}
          primary={(t) => t.customerName}
          secondary={(t) => t.quote}
          aside={(t) => t.attribution ?? '—'}
          label={(t) => t.customerName}
          emptyText="No testimonials yet."
          onEdit={open}
          onToggle={toggleTestimonialPub}
          onRemove={removeTestimonial}
          onReorder={reorderTestimonials}
        />
      </div>
    </>
  )
}
