import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import ChipList from '../components/ChipList'
import Dropzone from '../components/Dropzone'
import Field from '../components/Field'
import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import Toggle from '../components/Toggle'
import {
  PROJECT_STAGES,
  PROJECT_TYPES,
  type Project,
  type ProjectStage,
  type ProjectType,
} from '../data/types'
import { photo } from '../lib/asset'
import { useStudio } from '../store/studio'
import form from '../styles/form.module.css'
import ui from '../styles/ui.module.css'

/** Stages where the handover date is still ahead of the studio. */
const UNFINISHED: ProjectStage[] = ['Design', 'Ongoing']

const blank = (): Project => ({
  id: 0,
  title: '',
  type: 'Residential',
  city: '',
  area: '',
  year: '',
  state: 'Draft',
  img: '/uploads/R1-web.png',
  note: '',
  feat: false,
  stage: 'Design',
  handover: '',
  story: '',
  scope: [],
  gallery: [],
  linkedService: '',
})

/** The badge on the portfolio card follows the stage the studio picked. */
const stateFor = (stage: ProjectStage): Project['state'] =>
  stage === 'Completed' ? 'Live' : stage === 'Draft' ? 'Draft' : 'Ongoing'

export default function ProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, services, saveProject, notify } = useStudio()

  const existing = id ? projects.find((project) => String(project.id) === id) : undefined
  const [draft, setDraft] = useState<Project>(() => existing ?? blank())

  if (id && !existing) return <Navigate to="/projects" replace />

  const set = <K extends keyof Project>(key: K, value: Project[K]) =>
    setDraft((current) => ({ ...current, [key]: value }))

  const setStage = (stage: ProjectStage) =>
    setDraft((current) => ({ ...current, stage, state: stateFor(stage) }))

  const removeImage = (index: number) => {
    setDraft((current) => ({ ...current, gallery: current.gallery.filter((_, i) => i !== index) }))
    notify('Image removed')
  }

  const save = () => {
    saveProject(draft)
    navigate('/projects')
  }

  return (
    <>
      <HeaderBar
        crumb="Portfolio / Projects"
        title={existing ? 'Edit Project' : 'Add a Project'}
      />

      <div className={Shell.content}>
        <div className={form.shell}>
          <div className={form.main}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Project Record</div>

              <div className={ui.fieldGrid}>
                <Field label="Project Title" full>
                  <input
                    className={ui.input}
                    value={draft.title}
                    onChange={(event) => set('title', event.target.value)}
                    placeholder="The Pearl Residence"
                  />
                </Field>

                <Field label="Project Type">
                  <select
                    className={ui.select}
                    value={draft.type}
                    onChange={(event) => set('type', event.target.value as ProjectType)}
                  >
                    {PROJECT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Location">
                  <input
                    className={ui.input}
                    value={draft.city}
                    onChange={(event) => set('city', event.target.value)}
                    placeholder="Madhurawada"
                  />
                </Field>

                <Field label="Area">
                  <input
                    className={ui.input}
                    value={draft.area}
                    onChange={(event) => set('area', event.target.value)}
                    placeholder="2,340 sq ft"
                  />
                </Field>

                <Field label="Year">
                  <input
                    className={ui.input}
                    value={draft.year}
                    onChange={(event) => set('year', event.target.value)}
                    placeholder="2026"
                  />
                </Field>

                <Field label="Stage" group full>
                  <div className={ui.pillRow}>
                    {PROJECT_STAGES.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        className={stage === draft.stage ? ui.pillOn : ui.pill}
                        onClick={() => setStage(stage)}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </Field>

                {UNFINISHED.includes(draft.stage) && (
                  <Field label="Expected Handover" full>
                    <input
                      className={ui.input}
                      value={draft.handover}
                      onChange={(event) => set('handover', event.target.value)}
                      placeholder="February 2026"
                    />
                  </Field>
                )}

                <Field label="Story" full>
                  <textarea
                    className={ui.textarea}
                    rows={6}
                    value={draft.story}
                    onChange={(event) => set('story', event.target.value)}
                  />
                </Field>
              </div>
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Scope Delivered</div>
              <ChipList
                items={draft.scope}
                placeholder="Add scope item and press Enter"
                onChange={(items) => set('scope', items)}
              />
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Gallery</div>
              <div className={form.gallery}>
                {draft.gallery.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className={form.tile}
                    role="img"
                    aria-label={`Gallery image ${index + 1}`}
                    style={{ backgroundImage: photo(image) }}
                  >
                    <button
                      type="button"
                      className={form.tileX}
                      onClick={() => removeImage(index)}
                      aria-label={`Remove gallery image ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" className={form.tileAdd}>
                  + Add
                </button>
              </div>
            </section>
          </div>

          <div className={form.rail}>
            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Cover Image</div>
              <Dropzone title="Drop cover" hint="Portrait 3:4 crops best in the projects grid" />
            </section>

            <section className={`${ui.panel} ${form.card}`}>
              <div className={`${ui.eyebrow} ${form.cardHead}`}>Placement</div>
              <Toggle
                on={draft.feat}
                onLabel="Feature on home page"
                offLabel="Feature on home page"
                onToggle={() => set('feat', !draft.feat)}
              />
              <div className={form.railStack}>
                <Field label="Linked Service">
                  <select
                    className={ui.select}
                    value={draft.linkedService}
                    onChange={(event) => set('linkedService', event.target.value)}
                  >
                    <option value="">None</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.n}>
                        {service.n}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <button type="button" className={`${ui.btnGold} ${form.save}`} onClick={save}>
              Save Project
            </button>
            <button
              type="button"
              className={`${ui.btnGhost} ${form.cancel}`}
              onClick={() => navigate('/projects')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
