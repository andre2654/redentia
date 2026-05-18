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
  /** Códigos antigos que resolvem pra ESTE ticker. Indexados como
   *  termos de busca: digitar "EMBR3" surfaceia o item canônico EMBJ3
   *  e a UI mostra "antes EMBR3" no badge. */
  aliases?: string[]
  /** Se este item É um alias (ex: AZUL4 quando aparece no resultado),
   *  carrega metadata pra UI mostrar "delisted desde X" ou "virou Y". */
  aliasOf?: {
    event_type: 'rename' | 'merger' | 'split' | 'spinoff' | 'delisted'
    event_date: string | null
    new_symbol: string | null
  } | null
  /** Quando o item foi encontrado VIA um alias, o termo digitado que
   *  matchou. UI usa pra mostrar "EMBR3 → EMBJ3 (Embraer)". */
  matchedAlias?: string | null
}

interface RawAsset {
  ticker: string
  name?: string
  logo?: string | null
  type?: string
  /** Códigos antigos que apontam pra este ticker (ex: EMBJ3 tem aliases=['EMBR3']).
   *  Vem do backend já agregado via LEFT JOIN ticker_aliases. */
  aliases?: Array<{ old_symbol: string; event_type: string; event_date: string | null }> | null
}

/** /api/tickers/aliases — todos os aliases conhecidos, incluindo
 *  delisted (new_symbol=null). Usado pra indexar códigos antigos
 *  no search mesmo que o ticker já não tenha cotação recente. */
interface RawAlias {
  old_symbol: string
  new_symbol: string | null
  event_type: 'rename' | 'merger' | 'split' | 'spinoff' | 'delisted'
  event_date: string | null
  notes?: string | null
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
  // Extrai só os old_symbols pra ficar fácil de testar startsWith/includes.
  const aliases = Array.isArray(a.aliases)
    ? a.aliases.map((x) => x.old_symbol).filter(Boolean)
    : undefined
  return {
    id: `${kind}-${a.ticker}`,
    ticker: a.ticker.toUpperCase(),
    name: a.name || a.ticker,
    logo: a.logo ?? null,
    kind,
    slug: a.ticker.toLowerCase(),
    aliases,
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
      const apiBase = useRuntimeConfig().public.apiBaseUrl as string

      const [assetsRes, tesouroRes, cryptoRes, aliasesRes] = await Promise.allSettled([
        (assetsService as { getAssets?: () => Promise<RawAsset[]> }).getAssets?.()
          ?? Promise.resolve([] as RawAsset[]),
        (tesouroService as { listTesouros?: () => Promise<RawTesouro[]> }).listTesouros?.()
          ?? Promise.resolve([] as RawTesouro[]),
        (cryptoService as { listCryptos?: (n: number) => Promise<RawCrypto[]> }).listCryptos?.(500)
          ?? Promise.resolve([] as RawCrypto[]),
        // Aliases (rename + delisted). Falha aqui não impede o resto
        // do search — só perdemos a indexação de códigos antigos.
        $fetch<{ data: RawAlias[] }>(`${apiBase}/tickers/aliases`)
          .catch(() => ({ data: [] as RawAlias[] })),
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

      // Para aliases tipo "delisted" (sem successor) que NÃO aparecem
      // em /api/tickers (cutoff de 30d), criamos um ghost item separado
      // pra surfacear em buscas como "AZUL4" → "AZUL4 (delisted)".
      // Aliases tipo "rename" já vêm acoplados ao item canônico via
      // aliases[] em mapStock — não duplicamos aqui pra não poluir a lista.
      if (aliasesRes.status === 'fulfilled' && Array.isArray(aliasesRes.value?.data)) {
        const stockByTicker = new Map<string, AssetSearchItem>()
        for (const item of next) {
          if (item.kind === 'stock' || item.kind === 'reit' || item.kind === 'etf' || item.kind === 'bdr') {
            stockByTicker.set(item.ticker, item)
          }
        }
        for (const alias of aliasesRes.value.data) {
          if (alias.event_type === 'delisted' && !stockByTicker.has(alias.old_symbol)) {
            // Ghost item de delisted — não navega pra detail page real,
            // só mostra "AZUL4 — delisted desde X". UI pode linkar
            // pra /asset/AZUL4 e a página decide mostrar histórico stale
            // ou redirect, mas isso fica pra Fase 5.
            next.push({
              id: `delisted-${alias.old_symbol}`,
              ticker: alias.old_symbol,
              name: `${alias.old_symbol} (delisted)`,
              logo: null,
              kind: 'stock',
              slug: alias.old_symbol.toLowerCase(),
              aliasOf: {
                event_type: 'delisted',
                event_date: alias.event_date,
                new_symbol: null,
              },
            })
          }
        }
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
   * Ranking heuristic:
   *   tier1: ticker prefix match
   *   tier2: alias prefix match (digitar "EMBR3" → EMBJ3 com badge)
   *   tier3: ticker contains
   *   tier4: name contains
   * Within a tier, shorter tickers win (PETR4 before PETR5L).
   *
   * Quando o match foi via alias, retornamos o item com `matchedAlias`
   * preenchido pra UI mostrar "EMBR3 → EMBJ3 (Embraer)".
   */
  function search(query: string, limit = 12): AssetSearchItem[] {
    const q = query.trim().toLowerCase()
    if (!q) return _items.value.slice(0, limit)
    const tier1: AssetSearchItem[] = []
    const tier2: AssetSearchItem[] = []
    const tier3: AssetSearchItem[] = []
    const tier4: AssetSearchItem[] = []
    const seenIds = new Set<string>()

    for (const item of _items.value) {
      if (seenIds.has(item.id)) continue
      const tk = item.ticker.toLowerCase()
      // Tier 1: ticker prefix
      if (tk.startsWith(q)) {
        tier1.push(item)
        seenIds.add(item.id)
        continue
      }
      // Tier 2: alias prefix (EMBR3 → EMBJ3)
      const aliasHit = item.aliases?.find((a) => a.toLowerCase().startsWith(q))
      if (aliasHit) {
        tier2.push({ ...item, matchedAlias: aliasHit })
        seenIds.add(item.id)
        continue
      }
      // Tier 3: ticker substring
      if (tk.includes(q)) {
        tier3.push(item)
        seenIds.add(item.id)
        continue
      }
      // Tier 4: name substring
      if (item.name.toLowerCase().includes(q)) {
        tier4.push(item)
        seenIds.add(item.id)
      }
    }
    const sortByTickerLen = (a: AssetSearchItem, b: AssetSearchItem) =>
      a.ticker.length - b.ticker.length
    tier1.sort(sortByTickerLen)
    tier2.sort(sortByTickerLen)
    tier3.sort(sortByTickerLen)
    return [...tier1, ...tier2, ...tier3, ...tier4].slice(0, limit)
  }

  return {
    loaded: computed(() => _loaded.value),
    loading: computed(() => _loading.value),
    ensureLoaded,
    search,
  }
}
