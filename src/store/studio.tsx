/* ── Studio store ──────────────────────────────────────────────────────────
   One provider holds the three collections and every mutation the panel can
   perform. Views read derived counts straight off these arrays, so a status
   change re-renders the sidebar badge, the KPI cards and the filter pills
   from the same source in one pass.
   ------------------------------------------------------------------------ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { PROJECTS, SERVICES } from '../data/demo'
import type { EnquirySummary, Project, Service } from '../data/types'
import { enquirySummary } from '../lib/enquiriesApi'
import { useAuth } from './auth'

type Studio = {
  /** Counts and the latest five, from the API. Null until the first load. */
  enquiries: EnquirySummary | null
  refreshEnquiries: () => Promise<void>

  services: Service[]
  projects: Project[]

  toggleServicePub: (id: number) => void
  removeService: (id: number) => void
  saveService: (draft: Service) => void

  toggleProjectFeat: (id: number) => void
  saveProject: (draft: Project) => void

  toast: string | null
  notify: (message: string) => void
}

const StudioContext = createContext<Studio | null>(null)

/** Replace the record with the matching id, leaving the rest untouched. */
const replace = <T extends { id: number }>(rows: T[], next: T) =>
  rows.map((row) => (row.id === next.id ? next : row))

/** Ids are assigned client-side only until the API owns them. */
const nextId = (rows: { id: number }[]) =>
  rows.reduce((max, row) => Math.max(max, row.id), 0) + 1

export function StudioProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [enquiries, setEnquiries] = useState<EnquirySummary | null>(null)
  const [services, setServices] = useState<Service[]>(SERVICES)
  const [projects, setProjects] = useState<Project[]>(PROJECTS)
  const [toast, setToast] = useState<string | null>(null)

  /* A new toast replaces whatever is on screen and restarts the 2.4s clock,
     so two quick actions never leave a stale message behind. */
  const timer = useRef<number>()
  const notify = useCallback((message: string) => {
    window.clearTimeout(timer.current)
    setToast(message)
    timer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const refreshEnquiries = useCallback(async () => {
    try {
      setEnquiries(await enquirySummary())
    } catch {
      /* a 401 has already signed the panel out; anything else keeps the last counts */
    }
  }, [])

  /* Load once signed in; forget on sign-out so the next owner starts clean. */
  useEffect(() => {
    if (status === 'in') void refreshEnquiries()
    else setEnquiries(null)
  }, [status, refreshEnquiries])

  const value = useMemo<Studio>(
    () => ({
      enquiries,
      refreshEnquiries,
      services,
      projects,
      toast,
      notify,

      /* The toast wording is read off the record as it stands now — the
         setState updater has not run yet at the point we announce it. */
      toggleServicePub(id) {
        const current = services.find((row) => row.id === id)
        if (!current) return
        setServices((rows) => rows.map((row) => (row.id === id ? { ...row, pub: !row.pub } : row)))
        notify(current.pub ? 'Moved to draft' : 'Published')
      },

      removeService(id) {
        setServices((rows) => rows.filter((row) => row.id !== id))
        notify('Service removed')
      },

      saveService(draft) {
        setServices((rows) =>
          rows.some((row) => row.id === draft.id)
            ? replace(rows, draft)
            : [...rows, { ...draft, id: nextId(rows) }],
        )
        notify('Saved')
      },

      toggleProjectFeat(id) {
        const current = projects.find((row) => row.id === id)
        if (!current) return
        setProjects((rows) => rows.map((row) => (row.id === id ? { ...row, feat: !row.feat } : row)))
        notify(current.feat ? 'Removed from home' : 'Featured on home')
      },

      saveProject(draft) {
        setProjects((rows) =>
          rows.some((row) => row.id === draft.id)
            ? replace(rows, draft)
            : [...rows, { ...draft, id: nextId(rows) }],
        )
        notify('Saved')
      },
    }),
    [enquiries, refreshEnquiries, services, projects, toast, notify],
  )

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudio() {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudio must be used inside <StudioProvider>')
  return ctx
}
