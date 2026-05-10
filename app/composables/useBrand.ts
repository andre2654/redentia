/**
 * useBrand — composable read-only do brand atual.
 *
 * **Phase 1 architecture (post brand.ts kill):**
 *
 *   - Brand canônico vive na DB (tabela `tenants`), servido por
 *     `/api/brand/resolve-by-host` ou `/api/brand/resolve/{slug}`
 *   - SSR middleware `0-tenant-resolver.ts` resolve por host header,
 *     fetcha do backend (cache Redis 60s), escreve em event.context
 *   - Plugin `tenant.server.ts` injeta no `useState('brand:active')`
 *   - SSR payload serializa o state pro client — zero re-fetch
 *
 * **Comportamento:**
 *   - Server: state é request-isolado — request A no me-poupe.com.br
 *     e request B simultâneo no primorico.com.br nunca veem state
 *     trocado
 *   - Client (após hydration): state é singleton. Navegação SPA
 *     com `?brand=X` muda state via `applyBrandOverride()` (async,
 *     fetch da API)
 *
 * Componentes consomem `useBrand()` e leem `brand.colors.text` etc.
 * Reatividade flui porque retornamos o reactive proxy.
 *
 * **Fallback (raríssimo):** se a state ainda não foi populada
 * (algo deu errado no SSR), cai no `seedBrand` — config minimal
 * Redentia que evita tela branca.
 */

import { seedBrand } from '~/config/seed-brand'

/**
 * Retorna o reactive state compartilhado. Em SSR, o plugin
 * `tenant.server.ts` populou antes desta função ser chamada;
 * em client, o state veio serializado do payload SSR.
 */
function useBrandState() {
  return useState('brand:active', () =>
    reactive(JSON.parse(JSON.stringify(seedBrand))),
  )
}

/**
 * API pública. Templates leem `brand.colors.primary`, `brand.logo.full`,
 * `brand.features.showAIAdvisor`, etc. Reativo — qualquer mudança via
 * `applyBrandOverride()` propaga.
 */
export const useBrand = () => {
  const state = useBrandState()
  return state.value
}

/**
 * Aplica override client-side (sem full reload). Usado por
 * `brand-router.client.ts` quando a query `?brand=X` muda durante
 * navegação SPA.
 *
 * **Async** porque busca do backend — diferente da versão anterior
 * que tinha um `brands` map local. Garante que qualquer slug existente
 * no banco funcione, não só os que estavam hardcoded.
 *
 * Returns `true` se conseguiu aplicar, `false` se slug não bate
 * (caller pode decidir o que fazer — ex.: full page reload).
 */
export async function applyBrandOverride(slug: string): Promise<boolean> {
  if (!slug || !/^[a-z0-9\-]+$/.test(slug)) return false

  try {
    const config = useRuntimeConfig()
    const raw = (config.public?.apiBaseUrl as string) || ''
    const apiBase = raw.replace(/\/$/, '')  // apiBaseUrl ja tem /api
    const resp = await $fetch<{ data: any }>(
      `${apiBase}/brand/resolve/${encodeURIComponent(slug)}`,
      { timeout: 5000, retry: 1 },
    )
    if (!resp?.data) return false

    // Normaliza paths /storage/... pra absoluto (Phase 2 — assets vivem
    // no backend storage, frontend domain nao serve esse path)
    const apiOrigin = apiBase.replace(/\/api\/?$/, '')
    const normalized: any = { ...resp.data }
    if (normalized.logo && typeof normalized.logo === 'object') {
      const fixed: Record<string, any> = {}
      for (const [k, v] of Object.entries(normalized.logo)) {
        fixed[k] = (typeof v === 'string' && v.startsWith('/storage/'))
          ? `${apiOrigin}${v}`
          : v
      }
      normalized.logo = fixed
    }

    const state = useBrandState()
    // Mutate in place — mantém identity do reactive proxy, todos
    // os watchers/computeds já estabelecidos continuam funcionando
    Object.assign(state.value, JSON.parse(JSON.stringify(normalized)))

    const resolvedSlug = useState<string | null>('brand:resolved-slug', () => null)
    resolvedSlug.value = slug

    return true
  } catch {
    return false
  }
}

/**
 * Slug atual do tenant. Útil pra analytics, logging, condicionais
 * que precisam saber "estou no tenant X?".
 */
export function useTenantSlug(): string {
  return useState<string | null>('brand:resolved-slug').value || 'redentia'
}
