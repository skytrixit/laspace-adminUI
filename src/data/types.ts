/* ── Domain types ──────────────────────────────────────────────────────────
   The shapes the panel reads. Each collection is loaded once into the store
   and never reshaped by a view, so swapping the seed arrays in demo.ts for a
   fetch() is the only change an API-backed build needs.
   ------------------------------------------------------------------------ */

export type EnquirySource =
  | 'website_form'
  | 'consultation_modal'
  | 'instagram'
  | 'referral'
  | 'google'
  | 'whatsapp'
  | 'other'

export const SOURCE_LABEL: Record<EnquirySource, string> = {
  website_form: 'Website form',
  consultation_modal: 'Consultation dialog',
  instagram: 'Instagram',
  referral: 'Referral',
  google: 'Google',
  whatsapp: 'WhatsApp',
  other: 'Other',
}

/** One enquiry as the API returns it to the inbox. Timestamps are ISO strings. */
export type Enquiry = {
  id: number
  referenceCode: string
  name: string
  phone: string
  email: string | null
  serviceLabel: string
  budgetLabel: string | null
  message: string | null
  source: EnquirySource
  isHandled: boolean
  handledAt: string | null
  notifiedAt: string | null
  submittedAt: string
  createdAt: string
  updatedAt: string
}

export type EnquiryPage = { items: Enquiry[]; page: number; pageSize: number; total: number }

export type EnquirySummary = { total: number; unhandled: number; thisWeek: number; latest: Enquiry[] }

export type ServiceCategory =
  | 'Residential'
  | 'Modular'
  | 'Commercial'
  | 'Renovation'
  | 'Consultation'

export type Service = {
  id: number
  n: string
  cat: ServiceCategory
  sub: string
  price: string
  pub: boolean
  /* Long-form fields, edited on the service form. */
  tagline: string
  unit: string
  summary: string
  description: string
  benefit: string
  includes: string[]
  steps: string[]
  order: number
}

export type ProjectType = 'Residential' | 'Kitchens' | 'Wardrobes' | 'Commercial'

export type ProjectState = 'Live' | 'Ongoing' | 'Draft'

export type ProjectStage = 'Design' | 'Ongoing' | 'Completed' | 'Draft'

export type Project = {
  id: number
  title: string
  type: ProjectType
  city: string
  area: string
  year: string
  state: ProjectState
  img: string
  note: string
  feat: boolean
  /* Long-form fields, edited on the project form. */
  stage: ProjectStage
  handover: string
  story: string
  scope: string[]
  gallery: string[]
  linkedService: string
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Residential',
  'Modular',
  'Commercial',
  'Renovation',
  'Consultation',
]

export const PROJECT_TYPES: ProjectType[] = ['Residential', 'Kitchens', 'Wardrobes', 'Commercial']

export const PROJECT_STAGES: ProjectStage[] = ['Design', 'Ongoing', 'Completed', 'Draft']

/** The three badge tones a project card can carry. */
export const PROJECT_STATE_TONE: Record<ProjectState, string> = {
  Live: '#9DBE8F',
  Ongoing: '#C29D62',
  Draft: 'rgba(196,173,147,0.65)',
}
