import type { IEntitlementSnapshot } from '~/types/entitlement'
import type { ISubscription } from '~/types/subscription'
import type { IPlan } from '~/types/plan'

/**
 * Billing service do user-side.
 *
 *   - listPublicPlans()       -> /api/plans (pricing page, sem auth)
 *   - getEntitlements()       -> /api/me/entitlements
 *   - getSubscription()       -> /api/me/subscription/status
 *   - startTrial(planId)      -> /api/billing/start-trial
 *   - createCheckout(...)     -> /api/billing/checkout (retorna URL Stripe)
 *   - createPortal()          -> /api/billing/portal (retorna URL Stripe)
 *   - cancel(atPeriodEnd?)    -> /api/billing/cancel
 */
export const useBillingService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}`

  async function listPublicPlans(tenantSlug?: string) {
    const qs = tenantSlug ? `?tenant_slug=${encodeURIComponent(tenantSlug)}` : ''
    return $fetch<{
      plans: IPlan[]
      tenant: { slug: string; name: string } | null
      billing_enabled: boolean
    }>(`${baseURL}/plans${qs}`)
  }

  async function getEntitlements() {
    return authFetch<IEntitlementSnapshot>(`${baseURL}/me/entitlements`)
  }

  async function getSubscriptionStatus() {
    return authFetch<{
      has_active_subscription: boolean
      plan_slug: string | null
      tenant_slug: string
      billing_enabled: boolean
    }>(`${baseURL}/me/subscription/status`)
  }

  async function startTrial(planId: number) {
    return authFetch<{ subscription: ISubscription }>(`${baseURL}/billing/start-trial`, {
      method: 'POST',
      body: { plan_id: planId },
    })
  }

  async function createCheckout(payload: {
    plan_id: number
    cycle: 'monthly' | 'yearly'
    payment_method?: 'card' | 'pix' | 'boleto'
    promo_code?: string
  }) {
    return authFetch<{ checkout_url: string }>(`${baseURL}/billing/checkout`, {
      method: 'POST',
      body: payload,
    })
  }

  async function createPortal() {
    return authFetch<{ portal_url: string }>(`${baseURL}/billing/portal`, {
      method: 'POST',
    })
  }

  async function cancel(atPeriodEnd = true) {
    return authFetch<{ subscription: ISubscription }>(`${baseURL}/billing/cancel`, {
      method: 'POST',
      body: { at_period_end: atPeriodEnd },
    })
  }

  return {
    listPublicPlans,
    getEntitlements,
    getSubscriptionStatus,
    startTrial,
    createCheckout,
    createPortal,
    cancel,
  }
}
