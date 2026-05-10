// ============================================================
// tenant.server — popula brand state a partir do middleware (Phase 1)
// ============================================================
//
// Roda 1x por request no SSR (note `.server.ts` suffix). Lê o brand
// JSON que o middleware `0-tenant-resolver.ts` escreveu em
// `event.context.tenantBrand` (já fetchado do backend, cacheado em
// Redis), e injeta em `useState('brand:active')`.
//
// Diferenças vs versão anterior:
//   - Antes: lia `event.context.tenantSlug` e buscava no `brands`
//     map importado de `brand.ts` (4.355 linhas no bundle)
//   - Agora: lê `event.context.tenantBrand` direto (já é a config
//     completa). Sem dependência de `brand.ts`. Bundle frontend
//     não cresce com N tenants.
//
// Por que plugin e não `initBrand()` em app.vue:
//   - Plugins rodam ANTES de qualquer setup() de componente — quando
//     algum componente chama `useBrand()`, o state já tá populado
//   - `event.context` é request-scoped — zero race entre tenants
//   - SSR + hydration: state serializa no payload Nuxt, client
//     recebe brand resolvida sem re-fetch
// ============================================================

import { seedBrand } from '~/config/seed-brand'

/**
 * Backend Laravel salva assets em `storage/app/public/...` e expoe via
 * `/storage/...`. Mas o frontend roda em outro dominio (ex: redentia.com.br),
 * onde `/storage/...` nao existe. Esta funcao prepende o host da API
 * em qualquer logo path absoluto que comece com `/storage/`. Paths
 * estaticos do bundle (`/brand/...`) e URLs absolutas (`https://`)
 * passam intactos.
 */
function normalizeBrandAssets(brand: any, apiBase: string): any {
  const out = { ...brand }
  const apiOrigin = apiBase.replace(/\/api\/?$/, '')

  const fixUrl = (url: any): any => {
    if (typeof url !== 'string') return url
    if (/^https?:\/\//.test(url)) return url
    if (url.startsWith('/storage/')) return `${apiOrigin}${url}`
    return url
  }

  if (out.logo && typeof out.logo === 'object') {
    const logo: Record<string, any> = {}
    for (const [k, v] of Object.entries(out.logo)) logo[k] = fixUrl(v)
    out.logo = logo
  }
  return out
}

export default defineNuxtPlugin({
  name: 'tenant-server',
  enforce: 'pre', // antes de plugins que possam ler useBrand()
  setup() {
    if (!import.meta.server) return

    const event = useRequestEvent()
    if (!event) return

    const config = useRuntimeConfig()
    const apiBase = (config.public?.apiBaseUrl as string) || ''

    // Brand já foi resolvida pelo middleware. Se por algum motivo não
    // veio (request fora do flow normal), cai no seed.
    const rawBrand = (event.context.tenantBrand as any) || seedBrand
    // Normaliza paths /storage/... pra absolute (Phase 2 logo upload).
    const brand = normalizeBrandAssets(rawBrand, apiBase)
    const slug = (event.context.tenantSlug as string) || brand.slug || 'redentia'

    // useState com factory — só roda se state ainda não existe.
    const brandState = useState('brand:active', () =>
      reactive(JSON.parse(JSON.stringify(brand))),
    )

    // SSR e per-request, mas o useState pode ja existir se algum codigo
    // chamou useBrand() antes deste plugin (race com auto-imports). E o
    // factory deep-clona seedBrand, entao SO confiar nele eh fragil. Aqui
    // sobrescrevemos sempre — a fonte canonica do brand pra esta request
    // eh o tenantBrand do middleware, ponto. Sem isto, ficamos presos
    // num seed/state stale e o hero (variant=radiograph) nunca aparece.
    Object.assign(brandState.value, JSON.parse(JSON.stringify(brand)))

    // Slug separado pra checks rápidos sem comparar config inteira
    const resolvedSlug = useState<string | null>('brand:resolved-slug', () => null)
    resolvedSlug.value = slug
  },
})
