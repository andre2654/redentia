// ============================================================
// tenant-resolver — server-first brand resolution (Phase 1: API-backed)
// ============================================================
//
// Roda antes de qualquer outra middleware (filename `0-` força ordem
// alfabetica) em CADA request SSR. Resolve o tenant baseado em:
//
//   1. `?brand=<slug>` query string  (override admin pra preview)
//   2. Host header                    (produção white-label)
//   3. fallback Redentia              (último recurso)
//
// Diferente da versão anterior (que tinha `HOST_TO_SLUG` map hardcoded
// vindo de `brand.ts`), agora **chama o backend** pra resolver. Brand
// canônica vive na DB, o frontend só consome.
//
// Cache: O backend cacheia em Redis 60s. SSR não cacheia adicional —
// `event.context.tenantBrand` é per-request, isolado.
//
// Resultado escrito no contexto:
//   - event.context.tenantSlug:  string (slug ou 'redentia' fallback)
//   - event.context.tenantBrand: BrandConfig completa pronta pra
//     `useState('brand:active')` consumir no plugin tenant.server.ts
// ============================================================

import { seedBrand } from '~/config/seed-brand'
// Phase 5: build-time host map. Quando o frontend builda, o script
// `scripts/generate-host-map.ts` consulta `/api/tenants/list-public`
// e regrava `app/config/host-map.json` com `{host: slug}`.
// JSON estatico (sem fetch em runtime). Pra hosts conhecidos pulamos
// o fetch da API (~50-100ms). Pra hosts novos (tenant criado desde o
// ultimo build), cai no fallback API normal — sem regressao.
// O arquivo eh checado in pra git com `map: {}` default — primeira
// build em prod popula via Vercel build step.
import hostMapJson from '~/config/host-map.json'
const HOST_MAP: Record<string, string> = (hostMapJson?.map ?? {}) as Record<string, string>

const PRODUCT_SUBDOMAIN_HOSTS = new Set([
  'api.redentia.com.br',
  'api.localhost',
  'api.redentia.localhost',
  'creative.redentia.com.br',
  'creative.localhost',
  'creative.redentia.localhost',
  'whitelabel.redentia.com.br',
  'whitelabel.localhost',
  'whitelabel.redentia.localhost',
  'embed.redentia.com.br',
  'embed.localhost',
  'embed.redentia.localhost',
])

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function normalizeHost(raw: string): string {
  return raw.split(':')[0].toLowerCase()
}

async function fetchBrandFromBackend(
  event: any,
  params: { slug?: string; host?: string },
): Promise<any | null> {
  // Per-request memo (em event.context.__brandCache) — evita refetch
  // se o middleware reentrar pro mesmo slug/host na MESMA request. NAO
  // pode ser module-scope: ai um restart de Redis no backend nao seria
  // visto pelo SSR ate dev server reiniciar. Backend ja cacheia 60s no
  // Redis, deixa o storage canonico la.
  const cache: Map<string, any> = (event.context.__brandCache ??= new Map())
  const cacheKey = params.slug ? `slug:${params.slug}` : `host:${params.host}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const config = useRuntimeConfig()
  // apiBaseUrl ja tem /api (ex: 'https://redentia-api.saraivada.com/api').
  const raw = (config.public?.apiBaseUrl as string) || 'https://redentia-api.saraivada.com/api'
  const apiBase = raw.replace(/\/$/, '')

  try {
    const url = params.slug
      ? `${apiBase}/brand/resolve/${encodeURIComponent(params.slug)}`
      : `${apiBase}/brand/resolve-by-host?host=${encodeURIComponent(params.host || '')}`

    const resp = await $fetch<{ data: any }>(url, {
      timeout: 3000,  // SSR não pode esperar muito — 3s é teto razoável
      retry: 1,
      headers: { Accept: 'application/json' },
    })
    cache.set(cacheKey, resp.data)
    return resp.data
  } catch (e) {
    // Backend down / 404 / timeout — retorna null pra cair no seed
    cache.set(cacheKey, null)
    return null
  }
}

export default defineEventHandler(async (event) => {
  // Skip rotas internas Nuxt/Nitro/API — não renderizam tenant
  const url = getRequestURL(event)
  const isDebugEndpoint = url.pathname === '/api/_debug/tenant'
  if (
    !isDebugEndpoint &&
    (
      url.pathname.startsWith('/_') ||
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/sw.js') ||
      url.pathname.startsWith('/manifest') ||
      url.pathname.startsWith('/firebase-messaging-sw.js')
    )
  ) {
    return
  }

  const host = normalizeHost(getRequestHeader(event, 'host') || '')

  // Product subdomains (api.redentia.com.br etc) sempre Redentia
  if (PRODUCT_SUBDOMAIN_HOSTS.has(host)) {
    event.context.tenantSlug = 'redentia'
    event.context.tenantBrand = await fetchBrandFromBackend(event, { slug: 'redentia' }) || seedBrand
    return
  }

  // 1. Query override (admin preview)
  const queryBrand = firstString(url.searchParams.get('brand'))
  if (queryBrand && /^[a-z0-9\-]+$/.test(queryBrand)) {
    const brand = await fetchBrandFromBackend(event, { slug: queryBrand })
    if (brand) {
      event.context.tenantSlug = brand.slug
      event.context.tenantBrand = brand
      return
    }
    // Slug não encontrado — segue pro próximo resolver
  }

  // 2. Host header → tenants.domain match
  if (host) {
    // 2a. Build-time host map shortcut: pra hosts conhecidos, vamos
    //     direto pro slug (1 fetch em vez de 2). Tenants criados ou
    //     com domain alterado APOS o ultimo build caem no path normal.
    const knownSlug = HOST_MAP[host]
    if (knownSlug) {
      const brand = await fetchBrandFromBackend(event, { slug: knownSlug })
      if (brand) {
        event.context.tenantSlug = brand.slug
        event.context.tenantBrand = brand
        return
      }
    }

    // 2b. Path normal: API resolve por host (caso tenant novo ainda
    //     nao no build map, ou host map vazio em dev).
    const brand = await fetchBrandFromBackend(event, { host })
    if (brand) {
      event.context.tenantSlug = brand.slug
      event.context.tenantBrand = brand
      return
    }
  }

  // 3. Fallback Redentia (busca do backend, com seed como ultimo recurso)
  const fallback = await fetchBrandFromBackend(event, { slug: 'redentia' })
  event.context.tenantSlug = 'redentia'
  event.context.tenantBrand = fallback || seedBrand
})
