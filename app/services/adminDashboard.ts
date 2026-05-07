/**
 * Admin Dashboard service — metricas estendidas pra
 * /admin/index.vue.
 *
 * Endpoint: GET /api/admin/dashboard/extended-stats
 */

export interface BusinessMetrics {
  aum_total: number
  aum_users: number
  aum_average: number
  aum_median: number
  lead_conversion: number
  lead_total: number
  lead_converted: number
  raiox_score_avg: number
  raiox_total: number
}

export interface EngagementMetrics {
  dau: number
  wau: number
  mau: number
  stickiness: number
  retention_7d: number
  retention_30d: number
  new_users_24h: number
  new_users_7d: number
  new_users_30d: number
  active_communications: number
  communication_impressions: number
}

export interface AdoptionMetrics {
  users_with_positions: number
  open_finance_users: number
  open_finance_adoption: number
  raiox_users: number
  raiox_adoption: number
  goals_users: number
  goals_adoption: number
  watchlist_users: number
  watchlist_adoption: number
}

export interface ExtendedStats {
  business: BusinessMetrics
  engagement: EngagementMetrics
  adoption: AdoptionMetrics
}

export function useAdminDashboardService() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string

  function headers(): Record<string, string> {
    return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
  }

  async function extendedStats(): Promise<{ data: ExtendedStats; generated_at: string }> {
    return await $fetch<{ data: ExtendedStats; generated_at: string }>(
      `${API}/admin/dashboard/extended-stats`,
      { headers: headers() },
    )
  }

  return { extendedStats }
}
