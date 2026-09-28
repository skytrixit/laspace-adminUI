import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import ChipList from '../components/ChipList'
import Dropzone from '../components/Dropzone'
import Field from '../components/Field'
import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import Toggle from '../components/Toggle'
import { SERVICE_CATEGORIES, type Service, type ServiceCategory } from '../data/types'
import { useStudio } from '../store/studio'
import form from '../styles/form.module.css'
import ui from '../styles/ui.module.css'

/** A fresh record. The id is replaced by the store when the draft is saved. */
const blank = (): Service => ({
  id: 0,
  n: '',
  cat: 'Residential',
  sub: '',
  price: '',
  pub: false,
  tagline: '',
  unit: '',
  summary: '',
  description: '',
  benefit: '',
  includes: [],
  steps: [],
  order: 1,
})

export default function ServiceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { services, saveService } = useStudio()

  const existing = id ? services.find((service) => String(service.id) === id) : undefined
  const [draft, setDraft] = useState<Service>(() => existing ?? blank())

  /* A stale edit link — the service was deleted from the list. */
  if (id && !existing) return <Navigate to="/services" replace />

  const set = <K extends keyof Service>(key: K, value: Service[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const save = () => {
    saveService(draft)
    navigate('/services')
  }

  return (
    <>
      <HeaderBar
        crumb="Catalogue / Services"
        title={existing ? 'Edit Service' : 'Add a Service'}
      />

      <div className={Shell.content}>
        <div className={form.shell}>
          <div className={form.main}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Service Details</div>

              <div className={ui.fieldGrid}>
                <Field label="Service Name" full>
                  <input
                    className={ui.input}
                    value={draft.n}
                    onChange={(event) => set('n', event.target.value)}
                    placeholder="Full Home Interiors"
                  />
                </Field>

                <Field label="Category">
                  <select
                    className={ui.select}
                    value={draft.cat}
                    onChange={(event) => set('cat', event.target.value as ServiceCategory)}
                  >
                    {SERVICE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Card Tagline">
                  <input
                    className={ui.input}
                    value={draft.tagline}
                    onChange={(event) => set('tagline', event.target.value)}
                    placeholder="From ₹2,200 / running ft"
                  />
                </Field>

                <Field label="Price Range">
                  <input
                    className={ui.input}
                    value={draft.price}
                    onChange={(event) => set('price', event.target.value)}
                    placeholder="₹1,450 / sq ft"
                  />
                </Field>

                <Field label="Pricing Unit">
                  <input
                    className={ui.input}
                    value={draft.unit}
                    onChange={(event) => set('unit', event.target.value)}
                    placeholder="sq ft"
                  />
                </Field>

                <Field label="Short Summary" hint="shown on the service card" full>
                  <textarea
                    className={ui.textarea}
                    rows={2}
                    value={draft.summary}
                    onChange={(event) => set('summary', event.target.value)}
                  />
                </Field>

                <Field label="Full Description" hint="service detail page" full>
                  <textarea
                    className={ui.textarea}
                    rows={6}
                    value={draft.description}
                    onChange={(event) => set('description', event.target.value)}
                  />
                </Field>

                <Field label="Client Benefit" full>
                  <textarea
                    className={ui.textarea}
                    rows={3}
                    value={draft.benefit}
                    onChange={(event) => set('benefit', event.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>What&rsquo;s Included</div>
              <ChipList
                items={draft.includes}
                placeholder="Add an inclusion and press Enter"
                onChange={(items) => set('includes', items)}
              />
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Process Steps</div>
              <ChipList
                items={draft.steps}
                placeholder="Add a step and press Enter"
                numbered
                onChange={(items) => set('steps', items)}
              />
            </section>
          </div>

          <div className={form.rail}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Hero Image</div>
              <Dropzone
                title="Drop image"
                hint="JPG or PNG · min 1600px wide / Arch crop applied automatically"
              />
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Publishing</div>
              <Toggle
                on={draft.pub}
                onLabel="Live on the site"
                offLabel="Saved as draft"
                onToggle={() => set('pub', !draft.pub)}
              />
              <div className={form.railStack}>
                <Field label="Display Order">
                  <input
                    className={ui.input}
                    type="number"
                    min={1}
                    value={draft.order}
                    onChange={(event) => set('order', Number(event.target.value))}
                  />
                </Field>
              </div>
            </section>

            <button type="button" className={`${ui.btnGold} ${form.save}`} onClick={save}>
              Save Service
            </button>
            <button
              type="button"
              className={`${ui.btnGhost} ${form.cancel}`}
              onClick={() => navigate('/services')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
