import type { IPlan, IPlanPayload } from '~/types/plan'

/**
 * Super-admin only: CRUD de planos por tenant.
 *
 * Rotas: /api/backoffice/tenants/{tenantId}/plans/...
 */
export const useBackofficePlansService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}/backoffice`

  async function list(tenantId: number) {
    return authFetch<{ plans: IPlan[] }>(`${baseURL}/tenants/${tenantId}/plans`)
  }

  async function show(tenantId: number, planId: number) {
    return authFetch<{ plan: IPlan }>(`${baseURL}/tenants/${tenantId}/plans/${planId}`)
  }

  async function create(tenantId: number, body: IPlanPayload) {
    return authFetch<{ plan: IPlan }>(`${baseURL}/tenants/${tenantId}/plans`, {
      method: 'POST',
      body,
    })
  }

  async function update(tenantId: number, planId: number, body: Partial<IPlanPayload>) {
    return authFetch<{ plan: IPlan }>(`${baseURL}/tenants/${tenantId}/plans/${planId}`, {
      method: 'PUT',
      body,
    })
  }

  async function remove(tenantId: number, planId: number) {
    return authFetch<{ ok: boolean }>(`${baseURL}/tenants/${tenantId}/plans/${planId}`, {
      method: 'DELETE',
    })
  }

  return { list, show, create, update, remove }
}
