/**
 * feature-flag.global middleware (Phase 6).
 *
 * Bloqueia paginas inteiras baseado em `brand.features.*` flags. Sem
 * isso, tenants white-label que escondem links no header/sidebar
 * poderiam ainda acessar `/ranking` ou `/calculadora` batendo URL
 * direta — o que vaza features que o tenant nao deveria ter.
 *
 * Path → flag mapping abaixo. Path matching via `startsWith(prefix)`
 * pra cobrir subroutes (ex: `/ranking/redentia-score`, `/calculadora/preco-teto`).
 *
 * Edge cases:
 *   - Flag indefinida no config: trata como ON (backward-compat).
 *   - `showRankings`: special-cased pra honrar tambem flags granulares
 *     antigos (`showDividendYieldRanking` / `showMonthlyMoversRanking`).
 *
 * Excluido por design: rotas internas Nuxt (`/_*`), rotas de auth e
 * admin (sempre acessiveis pra super-admin), rotas catch-all.
 */
const PATH_FLAGS: Array<{ prefix: string; flag: string }> = [
  { prefix: '/ranking', flag: 'showRankings' },
  { prefix: '/calculadora', flag: 'showCalculators' },
  { prefix: '/guias', flag: 'showGuides' },
  { prefix: '/glossario', flag: 'showGlossary' },
  { prefix: '/dividendos', flag: 'showDividends' },
  // Phase 6.x: app PWA unificado em `showApp`. Cobre `/download` e
  // `/baixar`. Aliases legacy (`showDownloadPage`/`showAppStoreLinks`)
  // sao tratados no special-case abaixo pra backward-compat.
  { prefix: '/download', flag: 'showApp' },
  { prefix: '/baixar', flag: 'showApp' },
  // View editorial alternativa da home (Redentia filter): opt-in
  // per-tenant. Default OFF — só liga quando admin marca `showParaVoce: true`.
  { prefix: '/para-voce', flag: 'showParaVoce' },
]

const SKIP_PREFIXES = ['/_', '/api/', '/admin', '/auth', '/backoffice']

export default defineNuxtRouteMiddleware((to) => {
  // Skip rotas internas / admin
  if (SKIP_PREFIXES.some((p) => to.path.startsWith(p))) return

  const match = PATH_FLAGS.find(
    ({ prefix }) => to.path === prefix || to.path.startsWith(prefix + '/'),
  )
  if (!match) return

  const brand = useBrand()
  const features = (brand as any).features ?? {}

  let enabled: boolean
  if (match.flag === 'showRankings') {
    enabled = features.showRankings === true
      || features.showDividendYieldRanking === true
      || features.showMonthlyMoversRanking === true
  } else if (match.flag === 'showApp') {
    // Backward-compat: showApp master OU flags legacy
    // (showDownloadPage/showAppStoreLinks).
    enabled = features.showApp === true
      || features.showDownloadPage === true
      || features.showAppStoreLinks === true
  } else if (match.flag === 'showParaVoce') {
    // Default-OFF: rota /para-voce só funciona quando admin marca
    // explicitamente true no config do tenant (opt-in).
    enabled = features.showParaVoce === true
  } else {
    // Default-on: undefined/null vira true (backward-compat). Pra
    // explicitamente desligar, admin setta `false` no config.
    enabled = features[match.flag] !== false
  }

  if (!enabled) {
    return navigateTo('/', { replace: true })
  }
})
