import { useMemo, useState } from 'react'

import HeaderBar from '../components/HeaderBar'
import LeadDrawer from '../components/LeadDrawer'
import Shell from '../components/Shell.module.css'
import { LEAD_STATUSES, STATUS_TONE, type LeadStatus } from '../data/types'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Leads.module.css'

type Filter = 'All' | LeadStatus

const FILTERS: Filter[] = ['All', ...LEAD_STATUSES]

export default function Leads() {
  const { leads, setLeadStatus } = useStudio()
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)

  const open = leads.find((lead) => lead.id === openId) ?? null

  /* Status filter and search narrow the same list, in that order. */
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return leads.filter((lead) => {
      if (filter !== 'All' && lead.status !== filter) return false
      if (!needle) return true
      return [lead.name, lead.phone, lead.city, lead.service].some((field) =>
        field.toLowerCase().includes(needle),
      )
    })
  }, [leads, filter, query])

  const countFor = (value: Filter) =>
    value === 'All' ? leads.length : leads.filter((lead) => lead.status === value).length

  return (
    <>
      <HeaderBar crumb="Enquiries" title="Demo Leads" />

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
                <span className={ui.pillCount}>{countFor(value)}</span>
              </button>
            ))}
          </div>

          <input
            className={css.search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone or city"
            aria-label="Search enquiries"
          />
        </div>

        <div className={ui.panel}>
          <div className={css.scroll}>
            <div className={css.table}>
              <div className={css.head}>
                <div className={css.th}>Name</div>
                <div className={css.th}>Phone</div>
                <div className={css.th}>Service</div>
                <div className={css.th}>Source</div>
                <div className={css.th}>Status</div>
                <div />
              </div>

              {rows.map((lead) => {
                const tone = STATUS_TONE[lead.status]
                return (
                  <div key={lead.id} className={css.row}>
                    <div>
                      <div className={css.primary}>{lead.name}</div>
                      <div className={css.sub}>{lead.city}</div>
                    </div>
                    <div className={css.secondary}>{lead.phone}</div>
                    <div className={css.secondary}>{lead.service}</div>
                    <div>
                      <div className={css.secondary}>{lead.source}</div>
                      <div className={css.subTime}>{lead.ago}</div>
                    </div>
                    <select
                      className={css.status}
                      style={{ color: tone.fg, borderColor: tone.bd }}
                      value={lead.status}
                      onChange={(event) =>
                        setLeadStatus(lead.id, event.target.value as LeadStatus)
                      }
                      aria-label={`Status for ${lead.name}`}
                    >
                      {LEAD_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className={css.open}
                      onClick={() => setOpenId(lead.id)}
                      aria-label={`Open ${lead.name}`}
                    >
                      →
                    </button>
                  </div>
                )
              })}

              {rows.length === 0 && <div className={ui.empty}>No enquiries match this view.</div>}
            </div>
          </div>
        </div>
      </div>

      {open && <LeadDrawer lead={open} onClose={() => setOpenId(null)} />}
    </>
  )
}
