import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import { PROJECT_STATE_TONE } from '../data/types'
import { photo } from '../lib/asset'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Projects.module.css'

/* One pill row spans both axes the studio sorts by: what a project is, and
   where it has got to. A pill matches either. */
const FILTERS = [
  'All',
  'Residential',
  'Kitchens',
  'Wardrobes',
  'Commercial',
  'Ongoing',
  'Draft',
] as const

export default function Projects() {
  const { projects, toggleProjectFeat } = useStudio()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')

  const rows = projects.filter(
    (project) => filter === 'All' || project.type === filter || project.state === filter,
  )

  return (
    <>
      <HeaderBar crumb="Portfolio" title="Projects" />

      <div className={Shell.content}>
        <div className={css.toolbar}>
          <div className={ui.pillRow}>
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                className={value === filter ? ui.pillOn : ui.pill}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${ui.btnGhost} ${css.add}`}
            onClick={() => navigate('/projects/new')}
          >
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
                  style={{ backgroundImage: photo(project.img) }}
                />
                <span className={css.badge} style={{ color: PROJECT_STATE_TONE[project.state] }}>
                  {project.state}
                </span>
              </div>

              <div className={css.body}>
                <h2 className={css.title}>{project.title}</h2>
                <div className={css.meta}>
                  {project.type} · {project.city}
                </div>
                <div className={css.facts}>
                  <span>{project.area}</span>
                  <span>{project.year}</span>
                </div>
                <p className={css.note}>{project.note}</p>

                <div className={css.actions}>
                  <button
                    type="button"
                    className={css.edit}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={project.feat ? css.featureOn : css.feature}
                    onClick={() => toggleProjectFeat(project.id)}
                    aria-pressed={project.feat}
                  >
                    {project.feat ? 'Featured' : 'Feature'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {rows.length === 0 && <div className={ui.empty}>No projects match this view.</div>}
      </div>
    </>
  )
}
