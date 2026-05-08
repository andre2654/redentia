/**
 * Aplicado em /wallet e /help via:
 *   definePageMeta({ middleware: ['requires-subscription'] })
 *
 * Bouncia user logado SEM subscription ativa pra /pricing. Tenants com
 * billing.enabled=false fazem bypass total.
 *
 * Roda DEPOIS do auth.global.ts (que ja garantiu token presente). Aqui
 * focamos so em "tem sub ativa?".
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip server-side render pra evitar fetch antes do client hydratar
  // o token. O middleware roda novamente no cliente; ai sim valida.
  if (import.meta.server) return

  const auth = useAuthStore()
  if (!auth.token) return // auth.global.ts ja vai redirecionar pra /auth/login

  const ent = useEntitlements()
  await ent.refresh()

  // Tenant sem billing -> bypass total
  if (!ent.isBillingEnabled()) return

  // Sub ativa (active, trialing, past_due dentro de grace) -> deixa passar
  if (ent.hasActiveSubscription()) return

  // Sem sub -> bouncia pra /pricing preservando brand query e marcando reason
  const brandQuery = to.query.brand
  return navigateTo({
    path: '/pricing',
    query: {
      reason: 'needs-subscription',
      from: to.fullPath,
      ...(brandQuery ? { brand: brandQuery } : {}),
    },
  })
})
