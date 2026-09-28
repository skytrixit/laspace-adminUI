import { useEffect, useMemo, useState } from 'react'

import HeaderBar from '../components/HeaderBar'
import LeadDrawer from '../components/LeadDrawer'
import Shell from '../components/Shell.module.css'
import { SOURCE_LABEL, type Enquiry } from '../data/types'
import { listEnquiries, setEnquiryHandled, type ListParams } from '../lib/enquiriesApi'
import { formatDateTime, timeAgo } from '../lib/time'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Leads.module.css'

type Filter = NonNullable<ListParams['handled']>

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unhandled', label: 'New' },
  { value: 'handled', label: 'Handled' },
]

const PAGE_SIZE = 25

/** The inbox. Filtering, search and paging are the server's; this screen only asks. */
export default function Leads() {
  const { enquiries: summary, notify, refreshEnquiries } = useStudio()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<Enquiry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)

  /* Search waits for typing to pause; filter and page changes are immediate. */
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 300)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => setPage(1), [filter, debounced])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    listEnquiries({ page, pageSize: PAGE_SIZE, q: debounced, handled: filter }, controller.signal)
      .then((result) => {
        setRows(result.items)
        setTotal(result.total)
        setLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setLoading(false)
        notify('Could not load enquiries')
      })
    return () => controller.abort()
  }, [page, debounced, filter, notify])

  const open = rows.find((row) => row.id === openId) ?? null
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const counts = useMemo<Record<Filter, number | null>>(
    () => ({
      all: summary?.total ?? null,
      unhandled: summary?.unhandled ?? null,
      handled: summary ? summary.total - summary.unhandled : null,
    }),
    [summary],
  )

  const replaceRow = (updated: Enquiry) =>
    setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)))

  const toggleHandled = async (row: Enquiry) => {
    try {
      replaceRow(await setEnquiryHandled(row.id, !row.isHandled))
      notify(row.isHandled ? 'Marked as new' : 'Marked as handled')
      void refreshEnquiries()
    } catch {
      notify('Could not update')
    }
  }

  const dropRow = (id: number) => {
    setRows((current) => current.filter((row) => row.id !== id))
    setTotal((n) => Math.max(0, n - 1))
    setOpenId(null)
  }

  return (
    <>
      <HeaderBar crumb="Enquiries" title="Inbox" />

      <div className={Shell.content}>
        <div className={css.toolbar}>
          <div className={ui.pillRow}>
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={value === filter ? ui.pillOn : ui.pill}
                onClick={() => setFilter(value)}
              >
                {label}
                {counts[value] !== null && <span className={ui.pillCount}>{counts[value]}</span>}
              </button>
            ))}
          </div>

          <input
            className={css.search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, phone or email"
            aria-label="Search enquiries"
          />
        </div>

        <div className={ui.panel}>
          <div className={css.scroll}>
            <div className={loading ? `${css.table} ${css.loading}` : css.table} aria-busy={loading}>
              <div className={css.head}>
                <div className={css.th}>Name</div>
                <div className={css.th}>Phone</div>
                <div className={css.th}>Service</div>
                <div className={css.th}>Received</div>
                <div className={css.th}>Status</div>
                <div />
              </div>

              {rows.map((row) => (
                <div key={row.id} className={css.row}>
                  <div>
                    <div className={css.primary}>{row.name}</div>
                    <div className={css.subTime}>{row.email ?? SOURCE_LABEL[row.source]}</div>
                  </div>
                  <div className={css.secondary}>{row.phone}</div>
                  <div className={css.secondary}>{row.serviceLabel}</div>
                  <div>
                    <div className={css.secondary}>{timeAgo(row.submittedAt)}</div>
                    <div className={css.subTime}>{formatDateTime(row.submittedAt)}</div>
                  </div>
                  <button
                    type="button"
                    className={row.isHandled ? css.handledOn : css.handledOff}
                    onClick={() => toggleHandled(row)}
                    aria-label={`${row.isHandled ? 'Mark as new' : 'Mark as handled'}: ${row.name}`}
                  >
                    {row.isHandled ? 'Handled' : 'New'}
                  </button>
                  <button
                    type="button"
                    className={css.open}
                    onClick={() => setOpenId(row.id)}
                    aria-label={`Open ${row.name}`}
                  >
                    →
                  </button>
                </div>
              ))}

              {!loading && rows.length === 0 && (
                <div className={ui.empty}>
                  {debounced || filter !== 'all' ? 'No enquiries match this view.' : 'No enquiries yet.'}
                </div>
              )}
            </div>
          </div>

          {total > PAGE_SIZE && (
            <div className={css.pager}>
              <span className={css.pagerNote}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <div className={css.pagerButtons}>
                <button type="button" className={ui.btnQuiet} onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                  ← Newer
                </button>
                <button type="button" className={ui.btnQuiet} onClick={() => setPage((p) => p + 1)} disabled={page >= pages}>
                  Older →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {open && (
        <LeadDrawer enquiry={open} onClose={() => setOpenId(null)} onChange={replaceRow} onDeleted={dropRow} />
      )}
    </>
  )
}
