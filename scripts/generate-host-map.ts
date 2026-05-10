/**
 * Phase 5: build-time host map.
 *
 * Lê todos os tenants ativos do backend e gera um JSON `{host: slug}`
 * que o middleware `0-tenant-resolver.ts` consulta ANTES de bater na
 * API. Pra hosts conhecidos, evita o roundtrip serverless ↔ Laravel
 * (~50-100ms por SSR).
 *
 * Roda no Vercel build:
 *   "build:host-map": "tsx scripts/generate-host-map.ts"
 *   "build": "npm run build:host-map && nuxt build"
 *
 * Quando admin adiciona/edita um tenant em prod, o host map fica stale.
 * Nesse caso o middleware ainda funciona (cai pro fallback API). Pra
 * forcar atualizacao: redeploy frontend (Vercel) ou cron de revalidacao.
 *
 * Output: `assets/host-map.json` (gitignored)
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT = resolve(__dirname, '../app/config/host-map.json')

const API_BASE = process.env.NUXT_PUBLIC_API_BASE_URL || 'https://redentia-api.saraivada.com/api'

interface BrandData {
  slug: string
  domain?: string | null
}

async function main() {
  console.log(`[host-map] fetching tenants from ${API_BASE}/tenants/list-public`)

  let tenants: BrandData[] = []
  try {
    // Endpoint publico read-only que retorna {slug, domain} pra cada tenant ativo.
    // Sem auth pq nao expoe dados sensitivos (apenas mapping).
    const r = await fetch(`${API_BASE}/tenants/list-public`, {
      headers: { Accept: 'application/json' },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    tenants = (j?.data ?? []) as BrandData[]
  } catch (e: any) {
    console.warn(`[host-map] fetch failed: ${e?.message}. Writing empty map.`)
    tenants = []
  }

  // {host: slug} (lowercase). Hosts sem domain custom (white-label so via ?brand=)
  // ficam de fora.
  const map: Record<string, string> = {}
  for (const t of tenants) {
    if (t.domain && t.slug) {
      map[t.domain.toLowerCase()] = t.slug
      // Tambem sem `www.` pra cobrir deduplicacao basica
      const noWww = t.domain.toLowerCase().replace(/^www\./, '')
      if (noWww !== t.domain.toLowerCase()) map[noWww] = t.slug
    }
  }

  mkdirSync(dirname(OUTPUT), { recursive: true })
  writeFileSync(OUTPUT, JSON.stringify({ generated_at: new Date().toISOString(), map }, null, 2))
  console.log(`[host-map] wrote ${Object.keys(map).length} host(s) to ${OUTPUT}`)
}

main().catch((e) => {
  console.error('[host-map] fatal:', e)
  process.exit(0) // never block build — empty map is OK fallback
})
