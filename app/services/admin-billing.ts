import type { IPlan, IPlanPayload } from '~/types/plan'
import type { ISubscription, ISubscriptionStats } from '~/types/subscription'

/**
 * Admin only: CRUD de planos por tenant + listagem de assinantes +
 * override manual + stats de MRR consolidados.
 *
 * Rotas: /api/admin/{billing,tenants/{tenantId}/...}
 *
 * Substitui os antigos services backoffice-plans/backoffice-subscriptions.
 */
export const useAdminBillingService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}/admin`

  // ── Plans ──
  async function listPlans(tenantId: number) {
    return authFetch<{ plans: IPlan[] }>(`${baseURL}/tenants/${tenantId}/plans`)
  }
  async function showPlan(tenantId: number, planId: number) {
    return authFetch<{ plan: IPlan }>(`${baseURL}/tenants/${tenantId}/plans/${planId}`)
  }
  async function createPlan(tenantId: number, body: IPlanPayload) {
    return authFetch<{ plan: IPlan }>(`${baseURL}/tenants/${tenantId}/plans`, {
      method: 'POST',
      body,
    })
  }
  async function updatePlan(tenantId: number, planId: number, body: Partial<IPlanPayload>) {
    return authFetch<{ plan: IPlan }>(`${baseURL}/tenants/${tenantId}/plans/${planId}`, {
      method: 'PUT',
      body,
    })
  }
  async function deletePlan(tenantId: number, planId: number) {
    return authFetch<{ ok: boolean }>(`${baseURL}/tenants/${tenantId}/plans/${planId}`, {
      method: 'DELETE',
    })
  }

  // ── Subscriptions ──
  async function listSubscriptions(tenantId: number, params?: {
    status?: string
    cycle?: 'monthly' | 'yearly'
    plan_id?: number
    page?: number
  }) {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.cycle) qs.set('cycle', params.cycle)
    if (params?.plan_id) qs.set('plan_id', String(params.plan_id))
    if (params?.page) qs.set('page', String(params.page))
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return authFetch<{ data: ISubscription[]; meta: any }>(`${baseURL}/tenants/${tenantId}/subscriptions${query}`)
  }

  async function stats() {
    return authFetch<ISubscriptionStats>(`${baseURL}/billing/stats`)
  }

  async function applyOverride(tenantId: number, userId: number, payload: {
    plan_id: number
    reason: string
    expires_at?: string | null
  }) {
    return authFetch<{ override: any }>(
      `${baseURL}/tenants/${tenantId}/users/${userId}/plan-override`,
      { method: 'POST', body: payload },
    )
  }

  async function clearOverride(tenantId: number, userId: number) {
    return authFetch<{ deleted: boolean }>(
      `${baseURL}/tenants/${tenantId}/users/${userId}/plan-override`,
      { method: 'DELETE' },
    )
  }

  return {
    listPlans, showPlan, createPlan, updatePlan, deletePlan,
    listSubscriptions, stats, applyOverride, clearOverride,
  }
}
