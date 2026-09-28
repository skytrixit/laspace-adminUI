import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import ChipList from '../components/ChipList'
import Dropzone from '../components/Dropzone'
import Field from '../components/Field'
import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import Toggle from '../components/Toggle'
import { PROJECT_CATEGORIES, type Project, type ProjectInput } from '../data/types'
import { ApiError } from '../lib/http'
import { slugify } from '../lib/slug'
import { useStudio } from '../store/studio'
import form from '../styles/form.module.css'
import ui from '../styles/ui.module.css'

const blank = (): ProjectInput => ({
  title: '',
  slug: '',
  typeLabel: null,
  categories: [],
  location: '',
  areaLabel: null,
  yearLabel: null,
  shortDescription: '',
  fullDescription: null,
  coverId: null,
  isFeatured: false,
  isPublished: false,
})

const fromProject = (p: Project): ProjectInput => ({
  title: p.title,
  slug: p.slug,
  typeLabel: p.typeLabel,
  categories: p.categories,
  location: p.location,
  areaLabel: p.areaLabel,
  yearLabel: p.yearLabel,
  shortDescription: p.shortDescription,
  fullDescription: p.fullDescription,
  coverId: p.coverId,
  isFeatured: p.isFeatured,
  isPublished: p.isPublished,
})

export default function ProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, loaded, saveProject, setProjectGallery, notify } = useStudio()

  const existing = id ? projects.find((p) => String(p.id) === id) : undefined
  const [draft, setDraft] = useState<ProjectInput>(() => (existing ? fromProject(existing) : blank()))
  const [slugTouched, setSlugTouched] = useState(Boolean(existing))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  if (id && loaded && !existing) return <Navigate to="/projects" replace />
  if (id && !loaded) return null

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => (key in e ? { ...e, [key]: '' } : e))
  }

  const setTitle = (title: string) => {
    set('title', title)
    if (!slugTouched) setDraft((d) => ({ ...d, title, slug: slugify(title) }))
  }

  const toggleCategory = (c: string) =>
    set('categories', draft.categories.includes(c) ? draft.categories.filter((x) => x !== c) : [...draft.categories, c])

  const save = async () => {
    setSaving(true)
    try {
      await saveProject({ ...draft, slug: draft.slug?.trim() || undefined }, existing?.id)
      navigate('/projects')
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields)
      setSaving(false)
    }
  }

  const removeImage = async (mediaId: number) => {
    if (!existing) return
    try {
      await setProjectGallery(existing.id, existing.gallery.filter((g) => g.id !== mediaId).map((g) => g.id))
      notify('Image removed')
    } catch {
      /* the store already toasted */
    }
  }

  const text = (v: string) => v || null

  return (
    <>
      <HeaderBar crumb="Portfolio / Projects" title={existing ? 'Edit Project' : 'Add a Project'} />

      <div className={Shell.content}>
        <div className={form.shell}>
          <div className={form.main}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Project Record</div>

              <div className={ui.fieldGrid}>
                <Field label="Project Title" full error={errors.title}>
                  <input className={ui.input} value={draft.title} onChange={(e) => setTitle(e.target.value)} placeholder="The Pearl Residence" />
                </Field>

                <Field label="Address" hint={`/projects/${draft.slug || '…'}`} full error={errors.slug}>
                  <input
                    className={ui.input}
                    value={draft.slug ?? ''}
                    onChange={(e) => {
                      setSlugTouched(true)
                      set('slug', slugify(e.target.value.replace(/\s+/g, '-')))
                    }}
                    placeholder="the-pearl-residence"
                  />
                </Field>

                <Field label="Type" hint="the label on the card" error={errors.typeLabel}>
                  <input className={ui.input} value={draft.typeLabel ?? ''} onChange={(e) => set('typeLabel', text(e.target.value))} placeholder="Modular Kitchen" />
                </Field>

                <Field label="Location" error={errors.location}>
                  <input className={ui.input} value={draft.location} onChange={(e) => set('location', e.target.value)} placeholder="Madhurawada" />
                </Field>

                <Field label="Area" error={errors.areaLabel}>
                  <input className={ui.input} value={draft.areaLabel ?? ''} onChange={(e) => set('areaLabel', text(e.target.value))} placeholder="2,340 sq ft" />
                </Field>

                <Field label="Completion Year" error={errors.yearLabel}>
                  <input className={ui.input} value={draft.yearLabel ?? ''} onChange={(e) => set('yearLabel', text(e.target.value))} placeholder="2026" />
                </Field>

                <Field label="Categories" hint="filters on the projects page" group full error={errors.categories}>
                  <div className={ui.pillRow}>
                    {PROJECT_CATEGORIES.map((c) => (
                      <button key={c} type="button" className={draft.categories.includes(c) ? ui.pillOn : ui.pill} onClick={() => toggleCategory(c)}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <ChipList
                    items={draft.categories.filter((c) => !(PROJECT_CATEGORIES as readonly string[]).includes(c))}
                    placeholder="Add another category and press Enter"
                    onChange={(custom) => set('categories', [...draft.categories.filter((c) => (PROJECT_CATEGORIES as readonly string[]).includes(c)), ...custom])}
                  />
                </Field>

                <Field label="Short Description" hint="on the card" full error={errors.shortDescription}>
                  <textarea className={ui.textarea} rows={2} value={draft.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
                </Field>

                <Field label="Full Description" hint="project detail page" full error={errors.fullDescription}>
                  <textarea className={ui.textarea} rows={6} value={draft.fullDescription ?? ''} onChange={(e) => set('fullDescription', text(e.target.value))} />
                </Field>
              </div>
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Gallery</div>
              {existing ? (
                <div className={form.gallery}>
                  {existing.gallery.map((image, index) => (
                    <div key={image.id} className={form.tile} role="img" aria-label={image.alt ?? `Gallery image ${index + 1}`} style={{ backgroundImage: `url("${image.src}")` }}>
                      <button type="button" className={form.tileX} onClick={() => removeImage(image.id)} aria-label={`Remove gallery image ${index + 1}`}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <button type="button" className={form.tileAdd} title="Uploads arrive in the next phase">
                    + Add
                  </button>
                </div>
              ) : (
                <p className={ui.meta}>Save the project first, then add its renders here.</p>
              )}
            </section>
          </div>

          <div className={form.rail}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Cover Image</div>
              <Dropzone title="Drop cover" hint="Portrait 3:4 crops best in the projects grid" preview={existing?.cover?.src ?? null} />
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Placement</div>
              <Toggle on={draft.isFeatured} onLabel="Feature on home page" offLabel="Feature on home page" onToggle={() => set('isFeatured', !draft.isFeatured)} />
              <div className={form.railStack}>
                <Toggle on={draft.isPublished} onLabel="Live on the site" offLabel="Saved as draft" onToggle={() => set('isPublished', !draft.isPublished)} />
              </div>
            </section>

            <button type="button" className={`${ui.btnGold} ${form.save}`} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Project'}
            </button>
            <button type="button" className={`${ui.btnGhost} ${form.cancel}`} onClick={() => navigate('/projects')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
