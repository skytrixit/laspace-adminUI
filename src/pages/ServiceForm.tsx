import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import ChipList from '../components/ChipList'
import Dropzone from '../components/Dropzone'
import Field from '../components/Field'
import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import Toggle from '../components/Toggle'
import type { MediaView, Service, ServiceInput } from '../data/types'
import { ApiError } from '../lib/http'
import { slugify } from '../lib/slug'
import { useStudio } from '../store/studio'
import form from '../styles/form.module.css'
import ui from '../styles/ui.module.css'

const blank = (): ServiceInput => ({
  name: '',
  slug: '',
  shortDescription: '',
  fullDescription: null,
  inclusions: [],
  imageId: null,
  isPublished: false,
})

const fromService = (s: Service): ServiceInput => ({
  name: s.name,
  slug: s.slug,
  shortDescription: s.shortDescription,
  fullDescription: s.fullDescription,
  inclusions: s.inclusions,
  imageId: s.imageId,
  isPublished: s.isPublished,
})

function ServiceEditor({ existing }: { existing?: Service }) {
  const navigate = useNavigate()
  const { saveService } = useStudio()

  const [draft, setDraft] = useState<ServiceInput>(() => (existing ? fromService(existing) : blank()))
  const [slugTouched, setSlugTouched] = useState(Boolean(existing))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [image, setImage] = useState<MediaView | null>(existing?.image ?? null)

  /* A stale edit link — or the store has not loaded yet. */
  const set = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => (key in e ? { ...e, [key]: '' } : e))
  }

  /* The address follows the name until the owner edits it by hand. */
  const setName = (name: string) => {
    set('name', name)
    if (!slugTouched) setDraft((d) => ({ ...d, name, slug: slugify(name) }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = { ...draft, slug: draft.slug?.trim() || undefined }
      await saveService(payload, existing?.id)
      navigate('/services')
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields)
      setSaving(false)
    }
  }

  return (
    <>
      <HeaderBar crumb="Catalogue / Services" title={existing ? 'Edit Service' : 'Add a Service'} />

      <div className={Shell.content}>
        <div className={form.shell}>
          <div className={form.main}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Service Details</div>

              <div className={ui.fieldGrid}>
                <Field label="Service Name" full error={errors.name}>
                  <input className={ui.input} value={draft.name} onChange={(e) => setName(e.target.value)} placeholder="Full Home Interiors" />
                </Field>

                <Field label="Address" hint={`/services/${draft.slug || '…'}`} full error={errors.slug}>
                  <input
                    className={ui.input}
                    value={draft.slug ?? ''}
                    onChange={(e) => {
                      setSlugTouched(true)
                      set('slug', slugify(e.target.value.replace(/\s+/g, '-')))
                    }}
                    placeholder="full-home-interiors"
                  />
                </Field>

                <Field label="Short Description" hint="shown on the service card" full error={errors.shortDescription}>
                  <textarea className={ui.textarea} rows={2} value={draft.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
                </Field>

                <Field label="Full Description" hint="service detail page" full error={errors.fullDescription}>
                  <textarea className={ui.textarea} rows={6} value={draft.fullDescription ?? ''} onChange={(e) => set('fullDescription', e.target.value || null)} />
                </Field>
              </div>
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>What&rsquo;s Included</div>
              <ChipList items={draft.inclusions} placeholder="Add an inclusion and press Enter" onChange={(items) => set('inclusions', items)} />
              {errors.inclusions && <div className={ui.fieldError}>{errors.inclusions}</div>}
            </section>
          </div>

          <div className={form.rail}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Image</div>
              <Dropzone
                title="Drop image"
                hint="JPG, PNG, WebP or AVIF · the site makes every size it needs"
                preview={image?.src ?? null}
                onUploaded={(view) => {
                  setImage(view)
                  set('imageId', view.id)
                }}
                onRemove={
                  image
                    ? () => {
                        setImage(null)
                        set('imageId', null)
                      }
                    : undefined
                }
              />
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Publishing</div>
              <Toggle on={draft.isPublished} onLabel="Live on the site" offLabel="Saved as draft" onToggle={() => set('isPublished', !draft.isPublished)} />
            </section>

            <button type="button" className={`${ui.btnGold} ${form.save}`} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Service'}
            </button>
            <button type="button" className={`${ui.btnGhost} ${form.cancel}`} onClick={() => navigate('/services')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Resolves the record from the route, then mounts the editor keyed on it —
 * so a deep link or a reload never initialises the form before the store
 * has loaded. A stale edit link goes back to the list.
 */
export default function ServiceForm() {
  const { id } = useParams()
  const { services, loaded } = useStudio()
  const existing = id ? services.find((row) => String(row.id) === id) : undefined
  if (id && !loaded) return null
  if (id && !existing) return <Navigate to="/services" replace />
  return <ServiceEditor key={existing?.id ?? 'new'} existing={existing} />
}
