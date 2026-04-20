/**
 * Blocks routes whose feature flag is disabled for the active tenant.
 *
 * The `ranking`, `dividendos/calendario` and `setor` pages are SEO
 * programmatic pages that don't fit every tenant (e.g. Norte Capital is
 * an advisory and doesn't want clients making decisions from rankings).
 *
 * When the active brand has the corresponding flag disabled, we 404
 * instead of redirecting, that way the sitemap entries that a different
 * tenant might have indexed don't accidentally leak into this tenant.
 *
 * Now that each tenant has its own domain (saraivainvest.com.br,
 * nortecapital.com.br, etc.), the 404 is scoped per-domain and Google
 * treats each domain's index independently.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server && to.path.startsWith('/api/')) return

  const brand = useBrand()
  const features = (brand as any)?.features
  if (!features) return

  // Map route prefixes to feature flags. Order matters: check most
  // specific first (e.g. `maiores-dividend-yield` before the generic
  // `ranking` hub).
  const rules: Array<{ match: (path: string) => boolean; flag: string }> = [
    {
      match: (p) => p.startsWith('/ranking/maiores-dividend-yield'),
      flag: 'showDividendYieldRanking',
    },
    {
      match: (p) => p.startsWith('/ranking/maiores-altas-mes') || p.startsWith('/ranking/maiores-baixas-mes'),
      flag: 'showMonthlyMoversRanking',
    },
    {
      // Hub /ranking is visible if ANY ranking flag is on
      match: (p) => p === '/ranking' || p === '/ranking/',
      flag: '__any_ranking__',
    },
    {
      match: (p) => p.startsWith('/dividendos/calendario'),
      flag: 'showDividendCalendar',
    },
    {
      match: (p) => p.startsWith('/setor'),
      flag: 'showSectorComparatives',
    },
  ]

  for (const rule of rules) {
    if (!rule.match(to.path)) continue

    let enabled: boolean
    if (rule.flag === '__any_ranking__') {
      enabled =
        features.showDividendYieldRanking === true ||
        features.showMonthlyMoversRanking === true
    } else {
      enabled = features[rule.flag] === true
    }

    if (!enabled) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Página não disponível',
        fatal: true,
      })
    }
    break
  }
})
