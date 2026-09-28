import { useNavigate } from 'react-router-dom'

import ui from '../styles/ui.module.css'
import css from './Shell.module.css'

/** The eyebrow / title pair is set per route by the view that renders it. */
export default function HeaderBar({ crumb, title }: { crumb: string; title: string }) {
  const navigate = useNavigate()

  return (
    <header className={css.header}>
      <div className={css.crumb}>
        <div className={ui.eyebrow}>{crumb}</div>
        <h1 className={ui.pageTitle}>{title}</h1>
      </div>

      <div className={css.actions}>
        <button type="button" className={ui.btnGhost} onClick={() => navigate('/services/new')}>
          New Service
        </button>
        <button type="button" className={ui.btnGold} onClick={() => navigate('/projects/new')}>
          New Project
        </button>
      </div>
    </header>
  )
}
