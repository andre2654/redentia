/**
 * Reports service.
 *
 * The PUBLIC submission endpoint (`POST /api/reports`) is
 * auth-optional, so we use the regular `$fetch` path with a
 * conditional Authorization header instead of `authFetch` (which
 * would 401 anonymous calls). Admin endpoints reuse `authFetch`
 * exactly like the leads / users services.
 */
import type { IReport, IReportStats, IReportPayload, ReportStatus, ReportPriority, ReportType } from '~/types/report'
import type { IPaginatedResponse } from '~/types/lead'

export const useReportsService = () => {
  const config = useRuntimeConfig()
  const { authFetch } = useCustomFetch()
  const authStore = useAuthStore()
  const baseURL = `${config.public.apiBaseUrl}/reports`
  const adminURL = `${config.public.apiBaseUrl}/admin/reports`

  /**
   * Submit a new report. Works for both authenticated and anonymous
   * users; we forward the bearer token when one is present so the
   * backend can stamp `user_id`. When anonymous, the caller must
   * include `guest_email` in the payload.
   */
  async function submit(payload: IReportPayload) {
    const headers: Record<string, string> = {}
    if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
    return $fetch<{ success: true; message: string }>(baseURL, {
      method: 'POST',
      body: payload,
      headers,
    })
  }

  // ---- Admin ----

  async function list(params?: {
    search?: string
    status?: ReportStatus
    type?: ReportType
    priority?: ReportPriority
    since?: string
    page?: number
  }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.status) query.set('status', params.status)
    if (params?.type) query.set('type', params.type)
    if (params?.priority) query.set('priority', params.priority)
    if (params?.since) query.set('since', params.since)
    if (params?.page) query.set('page', String(params.page))
    const qs = query.toString()
    return authFetch<IPaginatedResponse<IReport>>(`${adminURL}${qs ? `?${qs}` : ''}`)
  }

  async function show(id: number) {
    return authFetch<{ data: IReport }>(`${adminURL}/${id}`)
  }

  async function stats() {
    return authFetch<IReportStats>(`${adminURL}/stats`)
  }

  async function update(id: number, body: { status?: ReportStatus; priority?: ReportPriority | null; admin_note?: string | null }) {
    return authFetch<{ data: IReport }>(`${adminURL}/${id}`, {
      method: 'PATCH',
      body,
    })
  }

  return { submit, list, show, stats, update }
}
