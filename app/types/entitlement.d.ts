/**
 * Snapshot retornado por GET /api/me/entitlements.
 *
 * - Tenant sem billing -> all-true booleans + plan.slug='unlimited'
 * - User logado sem sub em tenant cobrando -> plan=null, can=all-false
 */
import type { SubscriptionStatus, BillingCycle } from './subscription'

export interface IEntitlementSnapshot {
  tenant: {
    slug: string
    billing_enabled: boolean
  }
  plan: {
    slug: string
    name: string
  } | null
  subscription: {
    status: SubscriptionStatus
    billing_cycle: BillingCycle
    trial_ends_at: string | null
    current_period_end: string | null
  } | null
  has_active_subscription: boolean
  can: Record<string, boolean>
  limits: Record<string, number>
  usage: Record<string, number>
}
