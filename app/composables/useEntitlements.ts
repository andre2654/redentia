import type { IEntitlementSnapshot } from '~/types/entitlement'

/**
 * Estado global de entitlements pra o user logado no tenant atual.
 *
 * Cacheia 60s entre chamadas; invalidada manualmente via refresh()
 * apos checkout/cancel/override (eventos disparados pelo settings/billing).
 *
 * Uso:
 *   const { snapshot, refresh, can, limit, usage,
 *           hasActiveSubscription, planSlug, isBillingEnabled } = useEntitlements()
 *   await refresh()
 *   if (!can('rebalance_simulator')) ...
 */
export function useEntitlements() {
  const snapshot = useState<IEntitlementSnapshot | null>('entitlements:snapshot', () => null)
  const lastFetched = useState<number>('entitlements:fetched_at', () => 0)
  const isLoading = useState<boolean>('entitlements:loading', () => false)

  const CACHE_TTL_MS = 60_000

  async function refresh(force = false) {
    const auth = useAuthStore()
    if (!auth.token) {
      snapshot.value = null
      return null
    }
    const now = Date.now()
    if (!force && snapshot.value && (now - lastFetched.value) < CACHE_TTL_MS) {
      return snapshot.value
    }
    if (isLoading.value) return snapshot.value
    isLoading.value = true
    try {
      const billing = useBillingService()
      const data = await billing.getEntitlements()
      // authFetch ja retorna o body — TS infere CustomResponse<T> que e {data: T}
      // mas no codebase atual o uso e direto; type inference flexivel.
      const payload = (data as any)?.data ?? data
      snapshot.value = payload as IEntitlementSnapshot
      lastFetched.value = now
      return snapshot.value
    } catch (err) {
      console.warn('[useEntitlements] refresh failed', err)
      return snapshot.value
    } finally {
      isLoading.value = false
    }
  }

  function can(feature: string): boolean {
    return Boolean(snapshot.value?.can?.[feature])
  }

  function limit(key: string): number {
    return Number(snapshot.value?.limits?.[key] ?? 0)
  }

  function usage(key: string): number {
    return Number(snapshot.value?.usage?.[key] ?? 0)
  }

  function hasActiveSubscription(): boolean {
    return Boolean(snapshot.value?.has_active_subscription)
  }

  function planSlug(): string | null {
    return snapshot.value?.plan?.slug ?? null
  }

  function isBillingEnabled(): boolean {
    return Boolean(snapshot.value?.tenant?.billing_enabled)
  }

  function subscriptionStatus(): string | null {
    return snapshot.value?.subscription?.status ?? null
  }

  function trialEndsAt(): string | null {
    return snapshot.value?.subscription?.trial_ends_at ?? null
  }

  function trialDaysRemaining(): number | null {
    const ends = trialEndsAt()
    if (!ends) return null
    const diff = new Date(ends).getTime() - Date.now()
    if (diff <= 0) return 0
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return {
    snapshot,
    isLoading,
    refresh,
    can,
    limit,
    usage,
    hasActiveSubscription,
    planSlug,
    isBillingEnabled,
    subscriptionStatus,
    trialEndsAt,
    trialDaysRemaining,
  }
}
