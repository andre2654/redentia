/**
 * Subscription = vinculo (user, tenant) -> plan + status.
 */
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'

export type BillingCycle = 'monthly' | 'yearly'

export interface ISubscription {
  id: number
  tenant_id: number
  user_id: number
  plan_id: number
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  trial_ends_at: string | null
  past_due_grace_until: string | null
  created_at: string
  updated_at: string

  // Relations carregadas via with()
  user?: { id: number; name: string; email: string }
  plan?: { id: number; slug: string; name: string }
}

export interface ISubscriptionStats {
  mrr_brl: number
  paying_users: number
  trial_users: number
  total_active: number
}
