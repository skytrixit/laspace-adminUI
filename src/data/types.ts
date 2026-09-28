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

/* ── Media ───────────────────────────────────────────────────────────────── */

export type MediaDerivative = {
  format: 'avif' | 'webp' | 'jpeg'
  width: number
  height: number
  key: string
  bytes: number
  src: string
}

export type MediaView = {
  id: number
  src: string
  width: number
  height: number
  alt: string | null
  lqipColor: string | null
  status: 'processing' | 'ready' | 'failed'
  derivatives: MediaDerivative[]
}

/* ── Content, as the admin API returns it ─────────────────────────────────
   Timestamps are ISO strings. `*Input` is what the forms send.
   ------------------------------------------------------------------------ */

export type Service = {
  id: number
  slug: string
  name: string
  shortDescription: string
  fullDescription: string | null
  inclusions: string[]
  image: MediaView | null
  imageId: number | null
  isPublished: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type ServiceInput = {
  name: string
  slug?: string
  shortDescription: string
  fullDescription: string | null
  inclusions: string[]
  imageId: number | null
  isPublished: boolean
}

/** The site's filter set. Free text is allowed too; these are the suggestions. */
export const PROJECT_CATEGORIES = ['Residential', 'Kitchen', 'Wardrobe', 'Commercial'] as const

export type Project = {
  id: number
  slug: string
  title: string
  typeLabel: string | null
  categories: string[]
  location: string
  areaLabel: string | null
  yearLabel: string | null
  shortDescription: string
  fullDescription: string | null
  cover: MediaView | null
  coverId: number | null
  gallery: MediaView[]
  isFeatured: boolean
  isPublished: boolean
  displayOrder: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectInput = {
  title: string
  slug?: string
  typeLabel: string | null
  categories: string[]
  location: string
  areaLabel: string | null
  yearLabel: string | null
  shortDescription: string
  fullDescription: string | null
  coverId: number | null
  isFeatured: boolean
  isPublished: boolean
}

export type Testimonial = {
  id: number
  customerName: string
  attribution: string | null
  quote: string
  photo: MediaView | null
  photoId: number | null
  isPublished: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type TestimonialInput = {
  customerName: string
  attribution: string | null
  quote: string
  photoId: number | null
  isPublished: boolean
}

export type Brand = {
  id: number
  name: string
  websiteUrl: string | null
  logo: MediaView | null
  logoId: number | null
  isPublished: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type BrandInput = { name: string; websiteUrl: string | null; logoId: number | null; isPublished: boolean }

export type Faq = {
  id: number
  question: string
  answer: string
  isPublished: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type FaqInput = { question: string; answer: string; isPublished: boolean }

export type SiteSettings = {
  id: number
  phone: string
  phoneHref: string
  whatsappHref: string
  email: string
  addressLine1: string
  addressLine2: string | null
  addressLine3: string | null
  hours: string
  mapsUrl: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
  statProjects: number
  statFamilies: number
  statConcepts: number
  statYears: number
  updatedAt: string
}

export type SiteSettingsInput = Omit<SiteSettings, 'id' | 'updatedAt'>
