import type { Enquiry, EnquiryPage, EnquirySummary } from '../data/types'
import { api } from './http'

export type ListParams = { page?: number; pageSize?: number; q?: string; handled?: 'all' | 'unhandled' | 'handled' }

export function listEnquiries(params: ListParams = {}, signal?: AbortSignal) {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  if (params.q) qs.set('q', params.q)
  if (params.handled && params.handled !== 'all') qs.set('handled', params.handled)
  const query = qs.toString()
  return api<EnquiryPage>(`/admin/enquiries${query ? `?${query}` : ''}`, { signal })
}

export const enquirySummary = () => api<EnquirySummary>('/admin/enquiries/summary')

export const setEnquiryHandled = (id: number, isHandled: boolean) =>
  api<Enquiry>(`/admin/enquiries/${id}`, { method: 'PATCH', body: { isHandled } })

export const deleteEnquiry = (id: number) => api<void>(`/admin/enquiries/${id}`, { method: 'DELETE' })
