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
    tenant_id?: number | null
  }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.role) query.set('role', params.role)
    if (params?.approval) query.set('approval', params.approval)
    if (params?.since) query.set('since', params.since)
    if (params?.page) query.set('page', String(params.page))
    if (params?.tenant_id !== undefined && params?.tenant_id !== null) {
      query.set('tenant_id', String(params.tenant_id))
    }
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

  /**
   * Impersonate a platform user. Returns a brand-new Sanctum token
   * in the target user's name. The caller (admin/users/index.vue)
   * stashes the admin's own token before swapping, so a future
   * "voltar a ser admin" button can restore the original session.
   *
   * Backend gates this to `admin` role + refuses admin-on-admin.
   */
  async function impersonate(id: number) {
    return authFetch<{
      access_token: string
      token_type: 'bearer'
      expires_in: number
      user: { id: number; name: string; email: string; role: UserRole }
    }>(`${baseURL}/${id}/impersonate`, { method: 'POST' })
  }

  /**
   * Update geral de campos do user (name, email, login, celular, role,
   * approval_status, tenant_id). Backend faz scoping por tenant + valida
   * privilegio (so superadmin pode mudar tenant_id).
   */
  async function update(id: number, payload: {
    name?: string
    email?: string
    login?: string | null
    celular?: string | null
    role?: UserRole
    approval_status?: ApprovalStatus | null
    tenant_id?: number | null
  }) {
    return authFetch<{ data: IAdminUser }>(`${baseURL}/${id}`, {
      method: 'PATCH',
      body: payload,
    })
  }

  async function destroy(id: number) {
    return authFetch<{ message: string; deleted_id: number }>(`${baseURL}/${id}`, {
      method: 'DELETE',
    })
  }

  return { list, show, stats, updateRole, updateApproval, impersonate, update, destroy }
}
