/**
 * Plan = um plano de assinatura cadastrado no /backoffice por tenant.
 *
 * - `slug` so existe `pro` ou `max` no MVP — sem `free`.
 * - `features[]` controla feature flags booleanas.
 * - `limits{}` controla caps numericos (-1 = ilimitado).
 * - `trial_days` so populated em planos elegiveis a trial (Pro = 7).
 */
export interface IPlan {
  id: number
  tenant_id: number
  slug: 'pro' | 'max' | string
  name: string
  description: string | null
  price_brl_monthly: string | null
  price_brl_yearly: string | null
  stripe_price_id_monthly: string | null
  stripe_price_id_yearly: string | null
  trial_days: number | null
  features: string[]
  limits: Record<string, number>
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface IPlanPayload {
  slug: string
  name: string
  description?: string | null
  price_brl_monthly?: number | null
  price_brl_yearly?: number | null
  stripe_price_id_monthly?: string | null
  stripe_price_id_yearly?: string | null
  trial_days?: number | null
  features?: string[]
  limits?: Record<string, number>
  is_active?: boolean
  sort_order?: number
}
