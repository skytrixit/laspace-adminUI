import { NavLink } from 'react-router-dom'

import { asset } from '../lib/asset'
import { useAuth } from '../store/auth'
import { useStudio } from '../store/studio'
import css from './Sidebar.module.css'

type Item = { to: string; label: string; end?: boolean; count?: number }

export default function Sidebar() {
  const { enquiries, services, projects, testimonials, brands, faqs } = useStudio()
  const { signOut, user } = useAuth()

  const items: Item[] = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/leads', label: 'Enquiries', count: enquiries?.unhandled ?? 0 },
    { to: '/services', label: 'Services', end: true, count: services.length },
    { to: '/projects', label: 'Projects', end: true, count: projects.length },
    { to: '/testimonials', label: 'Testimonials', count: testimonials.length },
    { to: '/brands', label: 'Brands', count: brands.length },
    { to: '/faqs', label: 'FAQs', count: faqs.length },
    { to: '/settings', label: 'Site Details' },
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
        <span className={css.mono}>{user?.initials ?? ''}</span>
        <div className={css.ownerText}>
          <div className={css.ownerName}>{user?.displayName ?? ''}</div>
          <div className={css.ownerRole}>{user?.role ?? ''}</div>
          {/* Clearing the session drops the guard, which redirects to login. */}
          <button type="button" className={css.signOut} onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
