import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import css from './Shell.module.css'

/** Rail plus content column — the layout every signed-in view renders into. */
export default function AdminShell() {
  return (
    <div className={css.shell}>
      <Sidebar />
      <div className={css.main}>
        <Outlet />
      </div>
    </div>
  )
}
