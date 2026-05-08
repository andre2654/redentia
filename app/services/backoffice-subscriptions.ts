import type { ISubscription, ISubscriptionStats } from '~/types/subscription'

/**
 * Super-admin only: listing de assinantes + stats consolidados +
 * override manual.
 */
export const useBackofficeSubscriptionsService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}/backoffice`

  async function list(tenantId: number, params?: {
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
    return authFetch<ISubscriptionStats>(`${baseURL}/subscriptions/stats`)
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

  return { list, stats, applyOverride, clearOverride }
}
