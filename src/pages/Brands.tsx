import { useState } from 'react'

import EditorialList from '../components/EditorialList'
import Dropzone from '../components/Dropzone'
import Field from '../components/Field'
import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import Toggle from '../components/Toggle'
import type { Brand, BrandInput } from '../data/types'
import { ApiError } from '../lib/http'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Editorial.module.css'

const blank = (): BrandInput => ({ name: '', websiteUrl: null, logoId: null, isPublished: false })
const from = (b: Brand): BrandInput => ({ name: b.name, websiteUrl: b.websiteUrl, logoId: b.logoId, isPublished: b.isPublished })

export default function Brands() {
  const { brands, loaded, saveBrand, toggleBrandPub, removeBrand, reorderBrands } = useStudio()
  const [editing, setEditing] = useState<{ id?: number; draft: BrandInput; logo?: string | null } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const open = (b?: Brand) => {
    setErrors({})
    setEditing(b ? { id: b.id, draft: from(b), logo: b.logo?.src ?? null } : { draft: blank() })
  }
  const set = <K extends keyof BrandInput>(key: K, value: BrandInput[K]) => {
    setEditing((e) => e && { ...e, draft: { ...e.draft, [key]: value } })
    setErrors((e) => (key in e ? { ...e, [key]: '' } : e))
  }
  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await saveBrand(editing.draft, editing.id)
      setEditing(null)
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <HeaderBar crumb="Editorial" title="Brands" />
      <div className={Shell.content}>
        <div className={css.toolbar}>
          <div className={ui.meta}>{brands.length} brands · {brands.filter((b) => b.isPublished).length} live</div>
          <button type="button" className={`${ui.btnGhost} ${css.add}`} onClick={() => open()}>
            + Add Brand
          </button>
        </div>

        {editing && (
          <section className={`${ui.panel} ${css.editor}`}>
            <div className={css.editorHead}>
              <div className={ui.eyebrow}>{editing.id ? 'Edit Brand' : 'New Brand'}</div>
              <Toggle on={editing.draft.isPublished} onLabel="Live on the site" offLabel="Saved as draft" onToggle={() => set('isPublished', !editing.draft.isPublished)} />
            </div>
            <div className={ui.fieldGrid}>
              <Field label="Brand Name" error={errors.name}>
                <input className={ui.input} value={editing.draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Hettich" />
              </Field>
              <Field label="Website" error={errors.websiteUrl}>
                <input className={ui.input} value={editing.draft.websiteUrl ?? ''} onChange={(e) => set('websiteUrl', e.target.value || null)} placeholder="https://www.hettich.com" />
              </Field>
              <Field label="Logo" group full>
                <Dropzone
                  title="Drop logo"
                  hint="PNG with transparency, or SVG exported to PNG"
                  preview={editing.logo ?? null}
                  onUploaded={(view) => {
                    setEditing((e) => e && { ...e, logo: view.src })
                    set('logoId', view.id)
                  }}
                  onRemove={
                    editing.logo
                      ? () => {
                          setEditing((e) => e && { ...e, logo: null })
                          set('logoId', null)
                        }
                      : undefined
                  }
                />
              </Field>
            </div>
            <div className={css.editorActions}>
              <button type="button" className={ui.btnGold} onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save Brand'}
              </button>
              <button type="button" className={ui.btnGhost} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </section>
        )}

        <EditorialList
          rows={brands}
          loaded={loaded}
          columns={['Brand', 'Website']}
          primary={(b) => b.name}
          secondary={(b) => (b.logo ? 'Logo set' : 'No logo yet')}
          aside={(b) => b.websiteUrl ?? '—'}
          label={(b) => b.name}
          emptyText="No brands yet."
          onEdit={open}
          onToggle={toggleBrandPub}
          onRemove={removeBrand}
          onReorder={reorderBrands}
        />
      </div>
    </>
  )
}
