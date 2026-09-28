import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import { PROJECT_CATEGORIES } from '../data/types'
import { useArmed } from '../lib/useArmed'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Projects.module.css'

export default function Projects() {
  const { projects, loaded, toggleProjectFeat, removeProject } = useStudio()
  const navigate = useNavigate()
  const { armedId, confirm } = useArmed()
  const [filter, setFilter] = useState('All')

  /* The site's four categories plus any the owner has added, plus Draft. */
  const filters = useMemo(() => {
    const seen = new Set<string>(PROJECT_CATEGORIES)
    projects.forEach((p) => p.categories.forEach((c) => seen.add(c)))
    return ['All', ...seen, 'Draft']
  }, [projects])

  const rows = projects.filter((p) => filter === 'All' || (filter === 'Draft' ? !p.isPublished : p.categories.includes(filter)))

  return (
    <>
      <HeaderBar crumb="Portfolio" title="Projects" />

      <div className={Shell.content}>
        <div className={css.toolbar}>
          <div className={ui.pillRow}>
            {filters.map((value) => (
              <button key={value} type="button" className={value === filter ? ui.pillOn : ui.pill} onClick={() => setFilter(value)}>
                {value}
              </button>
            ))}
          </div>
          <button type="button" className={`${ui.btnGhost} ${css.add}`} onClick={() => navigate('/projects/new')}>
            + Add Project
          </button>
        </div>

        <div className={css.grid}>
          {rows.map((project) => (
            <article key={project.id} className={`${ui.panel} ${css.card}`}>
              <div className={css.cover}>
                {/* A background-image, not an <img>: the preload scanner would
                    otherwise fetch a templated src literally. */}
                <div
                  className={css.shot}
                  role="img"
                  aria-label={project.title}
                  style={project.cover ? { backgroundImage: `url("${project.cover.src}")` } : undefined}
                />
                <span className={`${css.badge} ${project.isPublished ? css.badgeLive : css.badgeDraft}`}>
                  {project.isPublished ? 'Live' : 'Draft'}
                </span>
              </div>

              <div className={css.body}>
                <h2 className={css.title}>{project.title}</h2>
                <div className={css.meta}>
                  {project.typeLabel ?? project.categories.join(' · ')} · {project.location}
                </div>
                <div className={css.facts}>
                  <span>{project.areaLabel ?? '—'}</span>
                  <span>{project.yearLabel ?? '—'}</span>
                </div>
                <p className={css.note}>{project.shortDescription}</p>

                <div className={css.actions}>
                  <button type="button" className={css.edit} onClick={() => navigate(`/projects/${project.id}`)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={project.isFeatured ? css.featureOn : css.feature}
                    onClick={() => toggleProjectFeat(project.id)}
                    aria-pressed={project.isFeatured}
                  >
                    {project.isFeatured ? 'Featured' : 'Feature'}
                  </button>
                  <button
                    type="button"
                    className={armedId === project.id ? `${css.remove} ${ui.armed}` : css.remove}
                    onClick={() => confirm(project.id, () => removeProject(project.id))}
                    aria-label={armedId === project.id ? `Confirm delete ${project.title}` : `Delete ${project.title}`}
                    title={armedId === project.id ? 'Click again to delete' : 'Delete'}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {loaded && rows.length === 0 && <div className={ui.empty}>No projects match this view.</div>}
      </div>
    </>
  )
}
