import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import HeaderBar from '../components/HeaderBar'
import LeadDrawer from '../components/LeadDrawer'
import StatusChip from '../components/StatusChip'
import Shell from '../components/Shell.module.css'
import { SOURCE_LABEL, type Enquiry } from '../data/types'
import { timeAgo } from '../lib/time'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Dashboard.module.css'

export default function Dashboard() {
  const { enquiries, services, projects, refreshEnquiries } = useStudio()
  const navigate = useNavigate()
  const [open, setOpen] = useState<Enquiry | null>(null)

  const kpis = [
    { label: 'New Enquiries', value: enquiries?.unhandled ?? '—', note: 'awaiting a reply' },
    { label: 'This Week', value: enquiries?.thisWeek ?? '—', note: `${enquiries?.total ?? '—'} received in all` },
    { label: 'Live Services', value: services.filter((s) => s.pub).length, note: `${services.length} in catalogue` },
    { label: 'Projects', value: projects.filter((p) => p.state !== 'Draft').length, note: `${projects.length} in portfolio` },
  ]

  return (
    <>
      <HeaderBar crumb="Overview" title="Studio Dashboard" />

      <div className={Shell.content}>
        <div className={css.stack}>
          <div className={css.kpis}>
            {kpis.map((kpi) => (
              <div key={kpi.label} className={`${ui.panel} ${css.kpi}`}>
                <div className={ui.label}>{kpi.label}</div>
                <div className={css.kpiNumber}>{kpi.value}</div>
                <div className={css.kpiNote}>{kpi.note}</div>
              </div>
            ))}
          </div>

          <section className={ui.panel}>
            <div className={css.panelHead}>
              <div className={ui.eyebrow}>Latest Enquiries</div>
              <button type="button" className={ui.btnText} onClick={() => navigate('/leads')}>
                View all →
              </button>
            </div>

            {(enquiries?.latest ?? []).map((row) => (
              <button key={row.id} type="button" className={css.leadRow} onClick={() => setOpen(row)}>
                <div>
                  <div className={css.cellPrimary}>{row.name}</div>
                  <div className={css.cellSecondary}>{row.phone}</div>
                </div>
                <div>
                  <div className={css.cellSecondary} style={{ marginTop: 0 }}>
                    {row.serviceLabel}
                  </div>
                  <div className={css.cellMeta}>
                    {SOURCE_LABEL[row.source]} · {timeAgo(row.submittedAt)}
                  </div>
                </div>
                <StatusChip handled={row.isHandled} />
              </button>
            ))}

            {enquiries && enquiries.latest.length === 0 && (
              <div className={ui.empty}>No enquiries yet.</div>
            )}
          </section>
        </div>
      </div>

      {open && (
        <LeadDrawer
          enquiry={open}
          onClose={() => setOpen(null)}
          onChange={(updated) => {
            setOpen(updated)
            void refreshEnquiries()
          }}
          onDeleted={() => {
            setOpen(null)
            void refreshEnquiries()
          }}
        />
      )}
    </>
  )
}
