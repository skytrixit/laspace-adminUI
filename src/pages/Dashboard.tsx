import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import HeaderBar from '../components/HeaderBar'
import LeadDrawer from '../components/LeadDrawer'
import StatusChip from '../components/StatusChip'
import Shell from '../components/Shell.module.css'
import { SITES_IN_PROGRESS } from '../data/demo'
import { LEAD_SOURCES, type Lead } from '../data/types'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Dashboard.module.css'

/** Statuses that sit between first contact and a decision. */
const OPEN = ['Contacted', 'Site Visit', 'Quoted']

export default function Dashboard() {
  const { leads, services, projects } = useStudio()
  const navigate = useNavigate()
  const [openId, setOpenId] = useState<number | null>(null)

  const open = leads.find((lead) => lead.id === openId) ?? null

  const kpis = [
    {
      label: 'New Enquiries',
      value: leads.filter((lead) => lead.status === 'New').length,
      note: 'awaiting first call',
    },
    {
      label: 'Open Pipeline',
      value: leads.filter((lead) => OPEN.includes(lead.status)).length,
      note: 'contacted through quoted',
    },
    {
      label: 'Live Services',
      value: services.filter((service) => service.pub).length,
      note: `${services.length} in catalogue`,
    },
    {
      label: 'Sites Running',
      value: projects.filter((project) => project.state === 'Ongoing').length,
      note: `${projects.filter((project) => project.state === 'Live').length} projects published`,
    },
  ]

  /* Source counts drive the bar widths, so an empty board degrades to zero
     rather than dividing by nothing. */
  const bySource = LEAD_SOURCES.map((source) => ({
    source,
    count: leads.filter((lead) => lead.source === source).length,
  }))
  const total = leads.length || 1

  const latest: Lead[] = leads.slice(0, 5)

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

          <div className={css.body}>
            <section className={ui.panel}>
              <div className={css.panelHead}>
                <div className={ui.eyebrow}>Latest Enquiries</div>
                <button type="button" className={ui.btnText} onClick={() => navigate('/leads')}>
                  View all →
                </button>
              </div>

              {latest.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  className={css.leadRow}
                  onClick={() => setOpenId(lead.id)}
                >
                  <div>
                    <div className={css.cellPrimary}>{lead.name}</div>
                    <div className={css.cellSecondary}>{lead.phone}</div>
                  </div>
                  <div>
                    <div className={css.cellSecondary} style={{ marginTop: 0 }}>
                      {lead.service}
                    </div>
                    <div className={css.cellMeta}>
                      {lead.city} · {lead.ago}
                    </div>
                  </div>
                  <StatusChip status={lead.status} />
                </button>
              ))}
            </section>

            <div className={css.side}>
              <section className={ui.panel}>
                <div className={css.panelHead}>
                  <div className={ui.eyebrow}>Enquiry Split</div>
                </div>
                <div className={`${css.panelBody} ${css.split}`}>
                  {bySource.map(({ source, count }) => (
                    <div key={source}>
                      <div className={css.splitHead}>
                        <span>{source}</span>
                        <span className={css.splitCount}>{count}</span>
                      </div>
                      <div className={css.track}>
                        <div className={css.fill} style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={ui.panel}>
                <div className={css.panelHead}>
                  <div className={ui.eyebrow}>Sites In Progress</div>
                </div>
                {SITES_IN_PROGRESS.map((site) => (
                  <div key={site.title} className={css.site}>
                    <div>
                      <div className={css.cellPrimary}>{site.title}</div>
                      <div className={css.cellSecondary}>{site.stage}</div>
                    </div>
                    <span className={css.sitePct}>{site.pct}%</span>
                  </div>
                ))}
              </section>
            </div>
          </div>
        </div>
      </div>

      {open && <LeadDrawer lead={open} onClose={() => setOpenId(null)} />}
    </>
  )
}
