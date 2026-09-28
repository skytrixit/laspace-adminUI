import { useEffect, useState } from 'react'

import Field from '../components/Field'
import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import type { SiteSettings, SiteSettingsInput } from '../data/types'
import { ApiError } from '../lib/http'
import { useStudio } from '../store/studio'
import form from '../styles/form.module.css'
import ui from '../styles/ui.module.css'

const toInput = ({ id: _id, updatedAt: _u, ...rest }: SiteSettings): SiteSettingsInput => rest

/** One form, one save: everything the footer, the contact page and the JSON-LD print. */
export default function Settings() {
  const { settings, saveSettings } = useStudio()
  const [draft, setDraft] = useState<SiteSettingsInput | null>(settings ? toInput(settings) : null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings && !draft) setDraft(toInput(settings))
  }, [settings, draft])

  if (!draft) return <HeaderBar crumb="Studio" title="Site Details" />

  const set = <K extends keyof SiteSettingsInput>(key: K, value: SiteSettingsInput[K]) => {
    setDraft((d) => d && { ...d, [key]: value })
    setErrors((e) => (key in e ? { ...e, [key]: '' } : e))
  }
  const text = (v: string) => v || null
  const num = (v: string) => Math.max(0, Number(v) || 0)

  const save = async () => {
    setSaving(true)
    try {
      await saveSettings(draft)
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <HeaderBar crumb="Studio" title="Site Details" />
      <div className={Shell.content}>
        <div className={form.shell}>
          <div className={form.main}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Contact</div>
              <div className={ui.fieldGrid}>
                <Field label="Phone, as shown" error={errors.phone}>
                  <input className={ui.input} value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 90000 00000" />
                </Field>
                <Field label="Phone link" hint="click-to-call" error={errors.phoneHref}>
                  <input className={ui.input} value={draft.phoneHref} onChange={(e) => set('phoneHref', e.target.value)} placeholder="tel:+919000000000" />
                </Field>
                <Field label="WhatsApp link" error={errors.whatsappHref}>
                  <input className={ui.input} value={draft.whatsappHref} onChange={(e) => set('whatsappHref', e.target.value)} placeholder="https://wa.me/919000000000" />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input className={ui.input} value={draft.email} onChange={(e) => set('email', e.target.value)} placeholder="hello@laspaceinteriors.com" />
                </Field>
                <Field label="Hours" full error={errors.hours}>
                  <input className={ui.input} value={draft.hours} onChange={(e) => set('hours', e.target.value)} placeholder="Mon – Sat, 10:00 – 19:00" />
                </Field>
              </div>
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Address</div>
              <div className={ui.fieldGrid}>
                <Field label="Line 1" full error={errors.addressLine1}>
                  <input className={ui.input} value={draft.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} />
                </Field>
                <Field label="Line 2" full error={errors.addressLine2}>
                  <input className={ui.input} value={draft.addressLine2 ?? ''} onChange={(e) => set('addressLine2', text(e.target.value))} />
                </Field>
                <Field label="Line 3" full error={errors.addressLine3}>
                  <input className={ui.input} value={draft.addressLine3 ?? ''} onChange={(e) => set('addressLine3', text(e.target.value))} />
                </Field>
                <Field label="Google Maps link" full error={errors.mapsUrl}>
                  <input className={ui.input} value={draft.mapsUrl ?? ''} onChange={(e) => set('mapsUrl', text(e.target.value))} placeholder="https://maps.app.goo.gl/…" />
                </Field>
              </div>
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Social</div>
              <div className={ui.fieldGrid}>
                <Field label="Instagram" full error={errors.instagramUrl}>
                  <input className={ui.input} value={draft.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', text(e.target.value))} placeholder="https://www.instagram.com/…" />
                </Field>
                <Field label="Facebook" full error={errors.facebookUrl}>
                  <input className={ui.input} value={draft.facebookUrl ?? ''} onChange={(e) => set('facebookUrl', text(e.target.value))} placeholder="https://www.facebook.com/…" />
                </Field>
                <Field label="YouTube" full error={errors.youtubeUrl}>
                  <input className={ui.input} value={draft.youtubeUrl ?? ''} onChange={(e) => set('youtubeUrl', text(e.target.value))} placeholder="https://www.youtube.com/@…" />
                </Field>
              </div>
            </section>
          </div>

          <div className={form.rail}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Home Page Counters</div>
              <div className={ui.fieldGrid}>
                <Field label="Projects Completed" error={errors.statProjects}>
                  <input className={ui.input} type="number" min={0} value={draft.statProjects} onChange={(e) => set('statProjects', num(e.target.value))} />
                </Field>
                <Field label="Happy Families" error={errors.statFamilies}>
                  <input className={ui.input} type="number" min={0} value={draft.statFamilies} onChange={(e) => set('statFamilies', num(e.target.value))} />
                </Field>
                <Field label="Design Concepts" error={errors.statConcepts}>
                  <input className={ui.input} type="number" min={0} value={draft.statConcepts} onChange={(e) => set('statConcepts', num(e.target.value))} />
                </Field>
                <Field label="Years of Craft" error={errors.statYears}>
                  <input className={ui.input} type="number" min={0} value={draft.statYears} onChange={(e) => set('statYears', num(e.target.value))} />
                </Field>
              </div>
            </section>

            <button type="button" className={`${ui.btnGold} ${form.save}`} onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save Site Details'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
