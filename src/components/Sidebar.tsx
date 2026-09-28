import { NavLink } from 'react-router-dom'

import { asset } from '../lib/asset'
import { useAuth } from '../store/auth'
import { useStudio } from '../store/studio'
import css from './Sidebar.module.css'

type Item = { to: string; label: string; end?: boolean; count?: number }

export default function Sidebar() {
  const { leads, services, projects } = useStudio()
  const { signOut } = useAuth()

  const items: Item[] = [
    { to: '/', label: 'Dashboard', end: true },
    {
      to: '/leads',
      label: 'Demo Leads',
      count: leads.filter((lead) => lead.status === 'New').length,
    },
    { to: '/services', label: 'Services', end: true, count: services.length },
    { to: '/projects', label: 'Projects', end: true, count: projects.length },
    { to: '/services/new', label: 'Add Service' },
    { to: '/projects/new', label: 'Add Project' },
  ]

  return (
    <aside className={css.rail}>
      <div className={css.brand}>
        <img
          className={css.wordmark}
          src={asset('/uploads/logo-wordmark.png')}
          alt="LA Space Interiors"
          width="101"
          height="26"
        />
        <div className={css.kicker}>Studio Admin</div>
      </div>

      <nav className={css.nav}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? `${css.item} ${css.itemOn}` : css.item)}
          >
            {item.label}
            {item.count !== undefined && <span className={css.count}>{item.count}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={css.owner}>
        <span className={css.mono}>TB</span>
        <div className={css.ownerText}>
          <div className={css.ownerName}>Thoti Balachandu</div>
          <div className={css.ownerRole}>Owner</div>
          {/* Clearing the session drops the guard, which redirects to login. */}
          <button type="button" className={css.signOut} onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
