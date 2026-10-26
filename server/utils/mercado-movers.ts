/**
 * Altas, baixas e índices da home. Fetch direto no Laravel (sem loopback no
 * proxy) e cache de 2 minutos: o HTML da primeira resposta já traz os links
 * /asset, e a home não espera o onMounted.
 */
import type { CryptoApi, NuIndexStat, NuMoverRow, NuMoversClass, NuMoverTab, TickerApi } from '../../app/types/market'

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf4 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })

function pctFmt(n: number): string {
  return `${n > 0 ? '+' : ''}${nf2.format(n)}%`
}
function dirOf(n: number): 'down' | 'up' {
  return n < 0 ? 'down' : 'up'
}

function mapTickerRow(t: TickerApi, i: number): NuMoverRow | null {
  if (t.market_price == null || t.change_percent == null) return null
  return {
    rank: i + 1,
    ticker: t.ticker,
    name: t.name,
    price: `R$ ${nf2.format(t.market_price)}`,
    pct: pctFmt(t.change_percent),
    dir: dirOf(t.change_percent),
  }
}

function cryptoPrice(v: number): string {
  if (v >= 10_000) {
    const mil = v / 1000
    return `R$ ${(mil >= 100 ? nf0 : nf1).format(mil)} mil`
  }
  if (v < 0.05) return `R$ ${nf4.format(v)}`
  return `R$ ${nf2.format(v)}`
}

export interface MercadoMoversPayload {
  movers: Partial<Record<NuMoverTab, NuMoversClass>>
  indices: NuIndexStat[]
}

function backendBase(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

async function lado(kind: 'stocks' | 'reits' | 'bdrs', side: 'top' | 'worst'): Promise<NuMoverRow[] | null> {
  try {
    const res = await $fetch<{ data?: TickerApi[] }>(`/top-${kind}?side=${side}`, {
      baseURL: backendBase(),
      headers: { Accept: 'application/json' },
      timeout: 8_000,
    })
    const rows = (res?.data ?? [])
      .filter((t) => t.market_price != null && t.change_percent != null)
      .slice(0, 5)
      .map(mapTickerRow)
      .filter((row): row is NuMoverRow => row !== null)
    return rows.length >= 3 ? rows : null
  }
  catch {
    return null
  }
}

export const fetchMercadoMovers = defineCachedFunction(
  async (): Promise<MercadoMoversPayload> => {
    const movers: Partial<Record<NuMoverTab, NuMoversClass>> = {}
    const [st, sw, rt, rw, bt, bw, cr, snap] = await Promise.all([
      lado('stocks', 'top'),
      lado('stocks', 'worst'),
      lado('reits', 'top'),
      lado('reits', 'worst'),
      lado('bdrs', 'top'),
      lado('bdrs', 'worst'),
      $fetch<{ data?: CryptoApi[] }>('/crypto?limit=200', {
        baseURL: backendBase(),
        headers: { Accept: 'application/json' },
        timeout: 8_000,
      }).catch(() => null),
      $fetch<{ indices_br?: Record<string, { value: number | null; change_pct: number | null } | undefined> }>('/market/snapshot?scope=ibov', {
        baseURL: backendBase(),
        headers: { Accept: 'application/json' },
        timeout: 8_000,
      }).catch(() => null),
    ])

    const pares: Array<[NuMoverTab, NuMoverRow[] | null, NuMoverRow[] | null]> = [
      ['Ações', st, sw],
      ['FIIs', rt, rw],
      ['BDRs', bt, bw],
    ]
    for (const [tab, altas, baixas] of pares) {
      if (altas && baixas) movers[tab] = { gainers: altas, losers: baixas }
    }

    if (cr?.data) {
      const chg24 = (c: CryptoApi): number | null => c.change_24h_pct ?? c.change_24h ?? null
      const coins = cr.data.filter((c) => c.price_brl != null && chg24(c) != null && c.symbol)
      const sorted = [...coins].sort((a, b) => (chg24(b) ?? 0) - (chg24(a) ?? 0))
      const toRow = (c: CryptoApi, i: number): NuMoverRow => ({
        rank: i + 1,
        ticker: c.symbol.toUpperCase(),
        name: c.name,
        price: cryptoPrice(c.price_brl as number),
        pct: pctFmt(chg24(c) as number),
        dir: dirOf(chg24(c) as number),
      })
      const gainers = sorted.slice(0, 5).map(toRow)
      const losers = sorted.slice(-5).reverse().map(toRow)
      if (gainers.length >= 3 && losers.length >= 3) movers.Cripto = { gainers, losers }
    }

    const indices: NuIndexStat[] = []
    for (const label of ['IBOV', 'IFIX'] as const) {
      const idx = snap?.indices_br?.[label]
      if (idx?.value != null && idx.change_pct != null) {
        indices.push({ label, value: nf0.format(idx.value), pct: pctFmt(idx.change_pct), dir: dirOf(idx.change_pct) })
      }
    }

    return { movers, indices }
  },
  {
    name: 'mercado-movers',
    maxAge: 120,
    swr: true,
    getKey: () => 'v1',
    validate: (entry) => {
      const value = entry.value as MercadoMoversPayload | undefined
      return Boolean(value && (value.indices.length > 0 || Object.keys(value.movers).length > 0))
    },
  },
)
