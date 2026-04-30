/**
 * useAssetSearch — single-source-of-truth asset autocomplete for
 * the chat composer.
 *
 * Loads stocks (B3 + ETF + REIT + BDR), tesouro direto, and crypto
 * lists ONCE per session and indexes them by ticker + name. Search
 * is fully client-side after the initial load — no per-keystroke
 * network round-trip.
 *
 * Public API:
 *   - `loaded: Ref<boolean>` — true once the indices are populated.
 *   - `loading: Ref<boolean>` — true while the initial fetch runs.
 *   - `ensureLoaded()` — kicks off the fetch on first call;
 *     subsequent calls are no-ops.
 *   - `search(query, limit)` — returns up to `limit` items whose
 *     ticker or name matches `query` (case-insensitive). Empty
 *     query returns the top picks across categories (a curated
 *     "popular" feed).
 *
 * The shape matches the chat composer's needs — small and stable
 * (`ticker`, `name`, optional `logo`, `kind`, `slug`). For the
 * full-fat shape used by /search use the QuickSearch composable.
 */
import { computed, ref } from 'vue'

export type AssetKind = 'stock' | 'reit' | 'etf' | 'bdr' | 'crypto' | 'tesouro'

export interface AssetSearchItem {
  /** Stable id for keyed lists. */
  id: string
  /** Ticker / symbol as it should appear in the composer text. */
  ticker: string
  /** Display name (company / fund / treasury name). */
  name: string
  /** Logo URL when available; null falls through to TickerLogo
   *  initials in the consumer. */
  logo: string | null
  /** Asset class. Used for the chip + filter affordances. */
  kind: AssetKind
  /** Slug for navigation (`/asset/{slug}`, `/crypto/{slug}`,
   *  `/tesouro/{slug}`). Useful when the picker doubles as a
   *  jump-to-asset menu. */
  slug: string
}

interface RawAsset {
  ticker: string
  name?: string
  logo?: string | null
  type?: string
}

interface RawTesouro {
  id?: string | number
  slug?: string
  name?: string
  indexer?: string
  indexer_label?: string
  maturity_date?: string
  rate?: string
  rate_numeric?: number
}

interface RawCrypto {
  id?: string
  symbol?: string
  name?: string
  image?: string | null
  price_brl?: number
  change_24h_pct?: number
}

const _items = ref<AssetSearchItem[]>([])
const _loading = ref(false)
const _loaded = ref(false)
let _loadPromise: Promise<void> | null = null

function mapStock(a: RawAsset): AssetSearchItem {
  const type = (a.type || '').toUpperCase()
  const kind: AssetKind =
    type === 'REIT' ? 'reit'
    : type === 'ETF' ? 'etf'
    : type === 'BDR' ? 'bdr'
    : 'stock'
  return {
    id: `${kind}-${a.ticker}`,
    ticker: a.ticker.toUpperCase(),
    name: a.name || a.ticker,
    logo: a.logo ?? null,
    kind,
    slug: a.ticker.toLowerCase(),
  }
}

function mapTesouro(t: RawTesouro): AssetSearchItem {
  const indexer = (t.indexer || t.indexer_label || '').toString().toUpperCase()
  const year = t.maturity_date ? new Date(t.maturity_date).getFullYear() : ''
  const ticker = `${indexer || 'TD'}${year ? ` ${year}` : ''}`.trim()
  return {
    id: `tesouro-${t.slug ?? t.id ?? ticker}`,
    ticker,
    name: t.name || 'Tesouro Direto',
    logo: null,
    kind: 'tesouro',
    slug: String(t.slug ?? t.id ?? ''),
  }
}

function mapCrypto(c: RawCrypto): AssetSearchItem {
  const sym = (c.symbol || c.id || '').toString().toUpperCase()
  return {
    id: `crypto-${c.id ?? sym}`,
    ticker: sym,
    name: c.name || sym,
    logo: c.image ?? null,
    kind: 'crypto',
    slug: String(c.id ?? sym).toLowerCase(),
  }
}

async function loadOnce(): Promise<void> {
  if (_loaded.value) return
  if (_loadPromise) return _loadPromise

  _loading.value = true
  _loadPromise = (async () => {
    try {
      const assetsService = useAssetsService()
      const tesouroService = useTesouroService()
      const cryptoService = useCryptoService()

      const [assetsRes, tesouroRes, cryptoRes] = await Promise.allSettled([
        (assetsService as { getAssets?: () => Promise<RawAsset[]> }).getAssets?.()
          ?? Promise.resolve([] as RawAsset[]),
        (tesouroService as { listTesouros?: () => Promise<RawTesouro[]> }).listTesouros?.()
          ?? Promise.resolve([] as RawTesouro[]),
        (cryptoService as { listCryptos?: (n: number) => Promise<RawCrypto[]> }).listCryptos?.(500)
          ?? Promise.resolve([] as RawCrypto[]),
      ])

      const next: AssetSearchItem[] = []
      if (assetsRes.status === 'fulfilled' && Array.isArray(assetsRes.value)) {
        for (const a of assetsRes.value) next.push(mapStock(a))
      }
      if (tesouroRes.status === 'fulfilled' && Array.isArray(tesouroRes.value)) {
        for (const t of tesouroRes.value) next.push(mapTesouro(t))
      }
      if (cryptoRes.status === 'fulfilled' && Array.isArray(cryptoRes.value)) {
        for (const c of cryptoRes.value) next.push(mapCrypto(c))
      }
      _items.value = next
      _loaded.value = true
    } finally {
      _loading.value = false
      _loadPromise = null
    }
  })()
  return _loadPromise
}

export function useAssetSearch() {
  /** Trigger the initial load on demand. Cached after first call. */
  function ensureLoaded(): Promise<void> {
    return loadOnce()
  }

  /**
   * Search by ticker prefix or name substring (case-insensitive).
   * Empty query returns the FIRST `limit` items in the index — fine
   * for an "open the picker" preview because the index already
   * comes ordered (stocks first, then ETFs/REITs/BDRs, treasuries,
   * cryptos).
   *
   * Ranking heuristic: ticker prefix match > ticker contains > name
   * contains. Within a tier, shorter tickers win (PETR4 before
   * PETR5L). This keeps "PE" → PETR4 above PETROBRASE.
   */
  function search(query: string, limit = 12): AssetSearchItem[] {
    const q = query.trim().toLowerCase()
    if (!q) return _items.value.slice(0, limit)
    const tier1: AssetSearchItem[] = [] // ticker startsWith q
    const tier2: AssetSearchItem[] = [] // ticker includes q
    const tier3: AssetSearchItem[] = [] // name includes q
    for (const item of _items.value) {
      const tk = item.ticker.toLowerCase()
      if (tk.startsWith(q)) tier1.push(item)
      else if (tk.includes(q)) tier2.push(item)
      else if (item.name.toLowerCase().includes(q)) tier3.push(item)
      if (tier1.length >= limit) break
    }
    const sortByTickerLen = (a: AssetSearchItem, b: AssetSearchItem) =>
      a.ticker.length - b.ticker.length
    tier1.sort(sortByTickerLen)
    tier2.sort(sortByTickerLen)
    return [...tier1, ...tier2, ...tier3].slice(0, limit)
  }

  return {
    loaded: computed(() => _loaded.value),
    loading: computed(() => _loading.value),
    ensureLoaded,
    search,
  }
}
