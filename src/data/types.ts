/* ── Domain types ──────────────────────────────────────────────────────────
   The shapes the panel reads. Each collection is loaded once into the store
   and never reshaped by a view, so swapping the seed arrays in demo.ts for a
   fetch() is the only change an API-backed build needs.
   ------------------------------------------------------------------------ */

export type LeadStatus = 'New' | 'Contacted' | 'Site Visit' | 'Quoted' | 'Won' | 'Lost'

export type LeadSource = 'Website form' | 'Instagram' | 'Referral' | 'Google' | 'WhatsApp'

export type Lead = {
  id: number
  name: string
  phone: string
  service: string
  city: string
  source: LeadSource
  ago: string
  status: LeadStatus
  budget: string
  area: string
  msg: string
  /** Studio-only note, written from the drawer. Never shown to the client. */
  note: string
}

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

/** The statuses a lead moves through, in pipeline order. */
export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Site Visit',
  'Quoted',
  'Won',
  'Lost',
]

export const LEAD_SOURCES: LeadSource[] = [
  'Website form',
  'Instagram',
  'Referral',
  'Google',
  'WhatsApp',
]

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Residential',
  'Modular',
  'Commercial',
  'Renovation',
  'Consultation',
]

export const PROJECT_TYPES: ProjectType[] = ['Residential', 'Kitchens', 'Wardrobes', 'Commercial']

export const PROJECT_STAGES: ProjectStage[] = ['Design', 'Ongoing', 'Completed', 'Draft']

/** Text and border colour for every status chip, select and pill. */
export const STATUS_TONE: Record<LeadStatus, { fg: string; bd: string }> = {
  New: { fg: '#C29D62', bd: 'rgba(194,157,98,0.55)' },
  Contacted: { fg: '#C4AD93', bd: 'rgba(196,173,147,0.35)' },
  'Site Visit': { fg: '#C4AD93', bd: 'rgba(196,173,147,0.35)' },
  Quoted: { fg: '#E4C88E', bd: 'rgba(228,200,142,0.45)' },
  Won: { fg: '#9DBE8F', bd: 'rgba(157,190,143,0.45)' },
  Lost: { fg: 'rgba(196,173,147,0.5)', bd: 'rgba(196,173,147,0.18)' },
}

/** The three badge tones a project card can carry. */
export const PROJECT_STATE_TONE: Record<ProjectState, string> = {
  Live: '#9DBE8F',
  Ongoing: '#C29D62',
  Draft: 'rgba(196,173,147,0.65)',
}
