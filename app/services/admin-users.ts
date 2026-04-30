/**
 * Admin: platform users service.
 *
 * Lives at `/api/admin/users/*` (separate from the unauthenticated
 * `/api/auth/me` profile endpoint). All endpoints require the
 * admin role; the route guard plus the EnsureUserIsAdmin
 * middleware on the backend enforce this together.
 */
import type { IAdminUser, IUserStats, UserRole, ApprovalStatus } from '~/types/admin-user'
import type { IPaginatedResponse } from '~/types/lead'

export const useAdminUsersService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}/admin/users`

  async function list(params?: {
    search?: string
    role?: UserRole
    approval?: ApprovalStatus
    since?: string
    page?: number
  }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.role) query.set('role', params.role)
    if (params?.approval) query.set('approval', params.approval)
    if (params?.since) query.set('since', params.since)
    if (params?.page) query.set('page', String(params.page))
    const qs = query.toString()
    return authFetch<IPaginatedResponse<IAdminUser>>(`${baseURL}${qs ? `?${qs}` : ''}`)
  }

  async function show(id: number) {
    return authFetch<{ data: IAdminUser }>(`${baseURL}/${id}`)
  }

  async function stats() {
    return authFetch<IUserStats>(`${baseURL}/stats`)
  }

  async function updateRole(id: number, role: UserRole) {
    return authFetch<{ data: IAdminUser }>(`${baseURL}/${id}/role`, {
      method: 'PATCH',
      body: { role },
    })
  }

  async function updateApproval(id: number, approval_status: ApprovalStatus) {
    return authFetch<{ data: IAdminUser }>(`${baseURL}/${id}/approval`, {
      method: 'PATCH',
      body: { approval_status },
    })
  }

  return { list, show, stats, updateRole, updateApproval }
}
