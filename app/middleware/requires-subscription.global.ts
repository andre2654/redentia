/**
 * Global middleware: bouncia user logado SEM subscription ativa pra /pricing
 * pras rotas listadas em SUBSCRIPTION_REQUIRED_PATH_PREFIXES.
 *
 * Roda DEPOIS do auth.global.ts (que ja garantiu token presente). Aqui
 * focamos so em "tem sub ativa?". Tenants com billing.enabled=false fazem
 * bypass total (composable retorna unlimited synthetic).
 *
 * Por que global em vez de per-page:
 *   - Cobertura automatica de subrotas (/wallet/integracoes, etc)
 *   - Um lugar so pra adicionar nova rota gated
 *   - Menos fricção (não precisa lembrar de pageMeta em cada arquivo)
 */
const SUBSCRIPTION_REQUIRED_PATH_PREFIXES = [
  '/wallet',
  '/help',
  '/settings/gerenciar-plano',
  '/settings/integracoes',
]

function requiresSubscription(path: string): boolean {
  return SUBSCRIPTION_REQUIRED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + '/'),
  )
}

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip server-side: o token vive em cookie e o entitlements composable
  // depende de fetch client-side. Validacao real acontece na hidratacao.
  if (import.meta.server) return

  if (!requiresSubscription(to.path)) return

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
