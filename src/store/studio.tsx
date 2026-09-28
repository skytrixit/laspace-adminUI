/* ── Studio store ──────────────────────────────────────────────────────────
   One provider holds every collection the panel edits and every mutation
   it can perform. Reads happen once at sign-in; each mutation calls the API
   and then folds the returned row into local state, so every screen and
   badge updates from one source. Errors surface as a toast and are
   re-thrown so a form can show field messages.
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

import type {
  Brand,
  BrandInput,
  EnquirySummary,
  Faq,
  FaqInput,
  Project,
  ProjectInput,
  Service,
  ServiceInput,
  SiteSettings,
  SiteSettingsInput,
  Testimonial,
  TestimonialInput,
} from '../data/types'
import { brandsApi, faqsApi, projectsApi, servicesApi, settingsApi, testimonialsApi } from '../lib/contentApi'
import { enquirySummary } from '../lib/enquiriesApi'
import { ApiError } from '../lib/http'
import { useAuth } from './auth'

type Ordered = { id: number; displayOrder: number }

type Studio = {
  /** True once every collection has been fetched after sign-in. */
  loaded: boolean

  enquiries: EnquirySummary | null
  refreshEnquiries: () => Promise<void>

  services: Service[]
  saveService: (input: ServiceInput, id?: number) => Promise<Service>
  toggleServicePub: (id: number) => Promise<void>
  removeService: (id: number) => Promise<void>
  reorderServices: (ids: number[]) => Promise<void>

  projects: Project[]
  saveProject: (input: ProjectInput, id?: number) => Promise<Project>
  toggleProjectPub: (id: number) => Promise<void>
  toggleProjectFeat: (id: number) => Promise<void>
  removeProject: (id: number) => Promise<void>
  setProjectGallery: (id: number, mediaIds: number[]) => Promise<Project>
  reorderProjects: (ids: number[]) => Promise<void>

  testimonials: Testimonial[]
  saveTestimonial: (input: TestimonialInput, id?: number) => Promise<Testimonial>
  toggleTestimonialPub: (id: number) => Promise<void>
  removeTestimonial: (id: number) => Promise<void>
  reorderTestimonials: (ids: number[]) => Promise<void>

  brands: Brand[]
  saveBrand: (input: BrandInput, id?: number) => Promise<Brand>
  toggleBrandPub: (id: number) => Promise<void>
  removeBrand: (id: number) => Promise<void>
  reorderBrands: (ids: number[]) => Promise<void>

  faqs: Faq[]
  saveFaq: (input: FaqInput, id?: number) => Promise<Faq>
  toggleFaqPub: (id: number) => Promise<void>
  removeFaq: (id: number) => Promise<void>
  reorderFaqs: (ids: number[]) => Promise<void>

  settings: SiteSettings | null
  saveSettings: (input: SiteSettingsInput) => Promise<SiteSettings>

  toast: string | null
  notify: (message: string) => void
}

const StudioContext = createContext<Studio | null>(null)

const byOrder = <T extends Ordered>(rows: T[]) => [...rows].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)
const upsertRow = <T extends Ordered>(rows: T[], row: T) =>
  byOrder(rows.some((r) => r.id === row.id) ? rows.map((r) => (r.id === row.id ? row : r)) : [...rows, row])

type Api<T, I> = {
  create: (input: I) => Promise<T>
  update: (id: number, input: Partial<I>) => Promise<T>
  remove: (id: number) => Promise<void>
  publish: (id: number, isPublished: boolean) => Promise<T>
  reorder: (ids: number[]) => Promise<T[]>
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [loaded, setLoaded] = useState(false)
  const [enquiries, setEnquiries] = useState<EnquirySummary | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  /* A new toast replaces whatever is on screen and restarts the 2.4s clock. */
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

  /* Everything, once, on sign-in; forgotten on sign-out. */
  useEffect(() => {
    if (status !== 'in') {
      setLoaded(false)
      setEnquiries(null)
      setServices([])
      setProjects([])
      setTestimonials([])
      setBrands([])
      setFaqs([])
      setSettings(null)
      return
    }
    let cancelled = false
    Promise.all([enquirySummary(), servicesApi.list(), projectsApi.list(), testimonialsApi.list(), brandsApi.list(), faqsApi.list(), settingsApi.get()])
      .then(([e, s, p, t, b, f, st]) => {
        if (cancelled) return
        setEnquiries(e)
        setServices(byOrder(s))
        setProjects(byOrder(p))
        setTestimonials(byOrder(t))
        setBrands(byOrder(b))
        setFaqs(byOrder(f))
        setSettings(st)
        setLoaded(true)
      })
      .catch((err) => {
        if (!cancelled) notify(err instanceof ApiError ? err.message : 'Could not load the studio')
      })
    return () => {
      cancelled = true
    }
  }, [status, notify])

  /* One set of mutations, bound per collection. Each call goes to the API
     first; the local list only changes with what the server returned. */
  const bind = useCallback(
    <T extends Ordered & { isPublished: boolean }, I>(
      api: Api<T, I>,
      set: (fn: (rows: T[]) => T[]) => void,
      get: () => T[],
      words: { saved: string; live: string; draft: string; removed: string },
    ) => ({
      save: async (input: I, id?: number) => {
        try {
          const row = id === undefined ? await api.create(input) : await api.update(id, input)
          set((rows) => upsertRow(rows, row))
          notify(words.saved)
          return row
        } catch (err) {
          notify(err instanceof ApiError ? err.message : 'Could not save')
          throw err
        }
      },
      toggle: async (id: number) => {
        const current = get().find((r) => r.id === id)
        if (!current) return
        try {
          const row = await api.publish(id, !current.isPublished)
          set((rows) => upsertRow(rows, row))
          notify(row.isPublished ? words.live : words.draft)
        } catch (err) {
          notify(err instanceof ApiError ? err.message : 'Could not update')
        }
      },
      remove: async (id: number) => {
        try {
          await api.remove(id)
          set((rows) => rows.filter((r) => r.id !== id))
          notify(words.removed)
        } catch (err) {
          notify(err instanceof ApiError ? err.message : 'Could not remove')
        }
      },
      reorder: async (ids: number[]) => {
        try {
          const rows = await api.reorder(ids)
          set(() => byOrder(rows))
        } catch (err) {
          notify(err instanceof ApiError ? err.message : 'Could not reorder')
        }
      },
    }),
    [notify],
  )

  const value = useMemo<Studio>(() => {
    const svc = bind<Service, ServiceInput>(servicesApi, setServices, () => services, { saved: 'Saved', live: 'Published', draft: 'Moved to draft', removed: 'Service removed' })
    const prj = bind<Project, ProjectInput>(projectsApi, setProjects, () => projects, { saved: 'Saved', live: 'Published', draft: 'Moved to draft', removed: 'Project removed' })
    const tst = bind<Testimonial, TestimonialInput>(testimonialsApi, setTestimonials, () => testimonials, { saved: 'Saved', live: 'Published', draft: 'Moved to draft', removed: 'Testimonial removed' })
    const brd = bind<Brand, BrandInput>(brandsApi, setBrands, () => brands, { saved: 'Saved', live: 'Published', draft: 'Moved to draft', removed: 'Brand removed' })
    const faq = bind<Faq, FaqInput>(faqsApi, setFaqs, () => faqs, { saved: 'Saved', live: 'Published', draft: 'Moved to draft', removed: 'FAQ removed' })

    return {
      loaded,
      enquiries,
      refreshEnquiries,
      toast,
      notify,

      services,
      saveService: svc.save,
      toggleServicePub: svc.toggle,
      removeService: svc.remove,
      reorderServices: svc.reorder,

      projects,
      saveProject: prj.save,
      toggleProjectPub: prj.toggle,
      removeProject: prj.remove,
      reorderProjects: prj.reorder,
      async toggleProjectFeat(id) {
        const current = projects.find((p) => p.id === id)
        if (!current) return
        try {
          const row = await projectsApi.feature(id, !current.isFeatured)
          setProjects((rows) => upsertRow(rows, row))
          notify(row.isFeatured ? 'Featured on home' : 'Removed from home')
        } catch (err) {
          notify(err instanceof ApiError ? err.message : 'Could not update')
        }
      },
      async setProjectGallery(id, mediaIds) {
        try {
          const row = await projectsApi.gallery(id, mediaIds)
          setProjects((rows) => upsertRow(rows, row))
          notify('Gallery updated')
          return row
        } catch (err) {
          notify(err instanceof ApiError ? err.message : 'Could not update the gallery')
          throw err
        }
      },

      testimonials,
      saveTestimonial: tst.save,
      toggleTestimonialPub: tst.toggle,
      removeTestimonial: tst.remove,
      reorderTestimonials: tst.reorder,

      brands,
      saveBrand: brd.save,
      toggleBrandPub: brd.toggle,
      removeBrand: brd.remove,
      reorderBrands: brd.reorder,

      faqs,
      saveFaq: faq.save,
      toggleFaqPub: faq.toggle,
      removeFaq: faq.remove,
      reorderFaqs: faq.reorder,

      settings,
      async saveSettings(input) {
        try {
          const row = await settingsApi.update(input)
          setSettings(row)
          notify('Saved')
          return row
        } catch (err) {
          notify(err instanceof ApiError ? err.message : 'Could not save')
          throw err
        }
      },
    }
  }, [bind, loaded, enquiries, refreshEnquiries, toast, notify, services, projects, testimonials, brands, faqs, settings])

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudio() {
  const ctx = useContext(StudioContext)
  if (!ctx) throw new Error('useStudio must be used inside <StudioProvider>')
  return ctx
}
