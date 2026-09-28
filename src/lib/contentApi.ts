import type {
  Brand,
  BrandInput,
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
import { api } from './http'

/* ── Content endpoints ─────────────────────────────────────────────────────
   Every ordered, publishable resource has the same six calls; each gets a
   typed instance. Projects add the feature flag and the gallery.
   ------------------------------------------------------------------------ */

function crud<T, I>(base: string) {
  return {
    list: () => api<T[]>(`/admin/${base}`),
    get: (id: number) => api<T>(`/admin/${base}/${id}`),
    create: (input: I) => api<T>(`/admin/${base}`, { method: 'POST', body: input }),
    update: (id: number, input: Partial<I>) => api<T>(`/admin/${base}/${id}`, { method: 'PATCH', body: input }),
    remove: (id: number) => api<void>(`/admin/${base}/${id}`, { method: 'DELETE' }),
    publish: (id: number, isPublished: boolean) =>
      api<T>(`/admin/${base}/${id}/publish`, { method: 'PATCH', body: { isPublished } }),
    reorder: (ids: number[]) => api<T[]>(`/admin/${base}/reorder`, { method: 'PUT', body: { ids } }),
  }
}

export const servicesApi = crud<Service, ServiceInput>('services')
export const testimonialsApi = crud<Testimonial, TestimonialInput>('testimonials')
export const brandsApi = crud<Brand, BrandInput>('brands')
export const faqsApi = crud<Faq, FaqInput>('faqs')

export const projectsApi = {
  ...crud<Project, ProjectInput>('projects'),
  feature: (id: number, isFeatured: boolean) =>
    api<Project>(`/admin/projects/${id}/feature`, { method: 'PATCH', body: { isFeatured } }),
  gallery: (id: number, mediaIds: number[]) =>
    api<Project>(`/admin/projects/${id}/gallery`, { method: 'PUT', body: { mediaIds } }),
}

export const settingsApi = {
  get: () => api<SiteSettings>('/admin/settings'),
  update: (input: SiteSettingsInput) => api<SiteSettings>('/admin/settings', { method: 'PUT', body: input }),
}
