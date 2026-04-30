/**
 * Admin: leads service.
 *
 * Talks to `/api/admin/leads/*`. Public capture (`POST /leads`) is
 * NOT here, it's a separate guest endpoint that the marketing
 * landing pages hit directly via $fetch.
 */
import type { ILead, ILeadStats, IPaginatedResponse } from '~/types/lead'

export const useLeadsService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const adminURL = `${config.public.apiBaseUrl}/admin/leads`

  /**
   * Paginated list with optional filters. The backend returns
   * `{ data: ILead[], meta: { current_page, last_page, total, ... } }`.
   * Pagination is server-driven so the page never holds more than
   * 25 rows in memory at a time.
   */
  async function list(params?: {
    search?: string
    source?: string
    since?: string
    until?: string
    page?: number
  }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.source) query.set('source', params.source)
    if (params?.since) query.set('since', params.since)
    if (params?.until) query.set('until', params.until)
    if (params?.page) query.set('page', String(params.page))
    const qs = query.toString()
    return authFetch<IPaginatedResponse<ILead>>(`${adminURL}${qs ? `?${qs}` : ''}`)
  }

  async function show(id: number) {
    return authFetch<{ data: ILead }>(`${adminURL}/${id}`)
  }

  async function remove(id: number) {
    return authFetch(`${adminURL}/${id}`, { method: 'DELETE' })
  }

  async function stats() {
    return authFetch<ILeadStats>(`${adminURL}/stats`)
  }

  return { list, show, remove, stats }
}
