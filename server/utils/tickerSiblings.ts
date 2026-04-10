/**
 * Sibling ticker helpers.
 *
 * In B3, the same company often has multiple classes of shares
 * (e.g. ITUB3 ON + ITUB4 PN, PETR3 + PETR4, BBDC3 + BBDC4, GGBR3 + GGBR4).
 * Since company news applies equally to all classes, we reuse generated
 * commentaries across siblings — one AI call, saved under each sibling
 * with its own specific change_percent / OHLCV.
 *
 * Tickers follow the pattern: 4 letters + 1-2 digits.
 * Common class suffixes: 3 (ON), 4 (PN), 5/6 (PNA/PNB), 11 (Unit / FII).
 */

const SIBLING_SUFFIXES = ['3', '4', '5', '6', '11']

export interface SiblingInfo {
  ticker: string
  name: string
  sector: string | null
}

export interface SiblingPriceRow {
  change_percent: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Compute candidate sibling symbols (same 4-letter root, different suffix).
 * Does NOT include the original ticker.
 */
export function computeSiblingCandidates(ticker: string): string[] {
  const match = ticker.match(/^([A-Z]{4})([0-9]{1,2})$/)
  if (!match) return []
  const root = match[1]
  const suffix = match[2]
  // Skip Units/FIIs (11) when the primary is a stock (3/4/5/6) and vice-versa,
  // because an 11-suffix is usually not the "same" security as a 3/4.
  const isUnitLike = suffix === '11'
  return SIBLING_SUFFIXES.filter((s) => {
    if (s === suffix) return false
    const sIsUnit = s === '11'
    return isUnitLike ? sIsUnit : !sIsUnit
  }).map((s) => root + s)
}

/**
 * Probe which candidate siblings actually exist by calling /tickers/{x}.
 * Returns only valid ones with their profile metadata.
 */
export async function resolveValidSiblings(
  ticker: string,
  apiBase: string
): Promise<SiblingInfo[]> {
  const candidates = computeSiblingCandidates(ticker)
  if (candidates.length === 0) return []

  const results = await Promise.all(
    candidates.map(async (t) => {
      try {
        const res = await $fetch<{ data: any }>(`${apiBase}/tickers/${t}`)
        if (res?.data) {
          return {
            ticker: t,
            name: res.data.name || res.data.full_name || t,
            sector:
              res.data.company_profile?.sector || res.data.sector || null,
          } as SiblingInfo
        }
      } catch {
        // Sibling doesn't exist — silently skip
      }
      return null
    })
  )

  return results.filter((r): r is SiblingInfo => r !== null)
}

/**
 * Fetch a sibling's price history as a date→row map for quick lookups.
 * Used during backfill to reuse the same prices fetch across many dates.
 */
export async function fetchSiblingPriceSeries(
  ticker: string,
  apiBase: string,
  mode: '1mo' | '3mo' | '6mo' | '1y' = '3mo'
): Promise<Map<string, SiblingPriceRow>> {
  const map = new Map<string, SiblingPriceRow>()
  try {
    const res = await $fetch<{ data: any[] }>(
      `${apiBase}/tickers/${ticker}/prices?mode=${mode}`
    )
    for (const row of res?.data || []) {
      const date = String(row.price_at).slice(0, 10)
      map.set(date, {
        change_percent: Number(row.change_percent) || 0,
        open: Number(row.open) || 0,
        high: Number(row.high) || 0,
        low: Number(row.low) || 0,
        close: Number(row.market_price) || 0,
        volume: Number(row.volume) || 0,
      })
    }
  } catch {
    // Network / backend error — return empty map, caller handles
  }
  return map
}

/**
 * Fetch which dates already have commentaries for a given sibling, within
 * a date range. Used to avoid duplicate saves during propagation.
 */
export async function fetchExistingCommentaryDates(
  ticker: string,
  from: string,
  to: string,
  apiBase: string
): Promise<Set<string>> {
  try {
    const res = await $fetch<{ data: any[] }>(
      `${apiBase}/market-commentaries`,
      {
        query: { scope: 'ticker', identifier: ticker, from, to, limit: 200 },
      }
    )
    return new Set(
      (res?.data || []).map((c) => String(c.date).slice(0, 10))
    )
  } catch {
    return new Set()
  }
}
