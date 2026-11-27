/**
 * Monta o fixture dos 537 textos indexáveis a partir da API.
 *   node scripts/gerar-preco-teto-textos.ts
 * O teste tests/preco-teto-unicos.test.ts relê o JSON e confere que título,
 * description e intro (parágrafo) são strings únicas.
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PRECO_TETO_INDEXAVEIS } from '../app/content/seo/preco-teto-indexaveis.ts'
import {
  dividendoParaBazin,
  lpaDeOverview,
  montarPrecoTeto,
  sectorPlEfetivo,
  vpaDeOverview,
  type OverviewPrecoTeto,
} from '../app/utils/preco-teto-pagina.ts'
import { overviewDyOf, parseProventos } from '../app/utils/proventos.ts'

const BASE = process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../tests/fixtures/preco-teto-indexaveis.json')
const HOJE = '2026-11-17'

interface SectorRow { slug?: string; name?: string }

async function getJson(path: string): Promise<unknown> {
  let ultimo: unknown = null
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'RedentiaSitemap/1.0' },
        signal: AbortSignal.timeout(20_000),
      })
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`${res.status} ${path}`)
      return res.json()
    } catch (e) {
      ultimo = e
      if (tentativa < 3) await new Promise((r) => setTimeout(r, 300 * tentativa))
    }
  }
  throw ultimo instanceof Error ? ultimo : new Error(String(ultimo))
}

async function pool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++
      out[i] = await fn(items[i]!)
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, () => worker()))
  return out
}

async function mediaDoSetor(sectorName: string, setores: SectorRow[]): Promise<number | null> {
  const target = sectorName.toLowerCase().trim()
  const slug = target.replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const found = setores.find((s) => s.name?.toLowerCase() === target || s.slug === target || s.slug === slug)
  if (!found?.slug) return null
  const resp = await getJson(`/sectors/${found.slug}/tickers?limit=200`) as {
    aggregates?: { avg_trailing_pe?: number | null }
    data?: { trailing_pe?: number | null }[]
  } | null
  const avg = Number(resp?.aggregates?.avg_trailing_pe)
  if (Number.isFinite(avg) && avg > 0) return avg
  const pes = (resp?.data ?? [])
    .map((t) => Number(t?.trailing_pe))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 100)
  if (!pes.length) return null
  return pes.reduce((a, b) => a + b, 0) / pes.length
}

async function main() {
  const setoresBody = await getJson('/sectors') as { data?: SectorRow[] } | null
  const setores = Array.isArray(setoresBody?.data) ? setoresBody.data : []
  const medias = new Map<string, number | null>()
  const tickers = [...PRECO_TETO_INDEXAVEIS]
  const linhas = await pool(tickers, 12, async (ticker) => {
    const perfil = await getJson(`/tickers/${ticker}`) as { data?: Record<string, unknown> } | null
    const p = perfil?.data
    if (!p) throw new Error(`sem perfil ${ticker}`)
    const overviewBody = await getJson(`/fundamentals/${ticker}/overview`) as { data?: OverviewPrecoTeto } | null
    const overview = overviewBody?.data ?? null
    const divBody = await getJson(`/dividends/${ticker}`) as { data?: unknown[] } | null
    const rows = divBody ? parseProventos(divBody.data) : null
    const preco = Number(p.market_price)
    const lpa = lpaDeOverview(overview)
    const div = dividendoParaBazin({
      overviewDy: overviewDyOf(overview),
      price: preco,
      rows,
      today: HOJE,
    })
    const setor = String(p.sector ?? '')
    if (lpa > 0 && setor && !medias.has(setor)) {
      try {
        medias.set(setor, await mediaDoSetor(setor, setores))
      } catch {
        medias.set(setor, null)
      }
    }
    const pe = sectorPlEfetivo(lpa, lpa > 0 ? medias.get(setor) ?? null : null)
    return {
      ticker,
      nomeBruto: String(p.name ?? ''),
      fiiTradingName: overview?.scrape_extras?.fii?.trading_name ?? null,
      tipo: String(p.type ?? ''),
      preco,
      priceDate: typeof p.price_date === 'string' ? p.price_date : null,
      setorBruto: setor,
      segmentoBruto: typeof p.industry_category === 'string' ? p.industry_category : null,
      lpa,
      vpa: vpaDeOverview(overview),
      dividendo: div.valor,
      dividendoFonte: div.fonte,
      dyPct: div.dyPct,
      sectorPL: pe.valor,
      sectorPLFonte: pe.fonte,
      temPaginaDividendos: (rows != null && rows.length > 0) || overviewDyOf(overview) != null,
    }
  })
  const textos = linhas.map((linha) => {
    const view = montarPrecoTeto(linha)
    if (!view) throw new Error(`página vazia ${linha.ticker}`)
    return { entrada: linha, title: view.title, description: view.description, paragrafo: view.paragrafo }
  })
  const unicos = (chave: 'title' | 'description' | 'paragrafo') => new Set(textos.map((t) => t[chave])).size
  console.log(`textos ${textos.length} títulos ${unicos('title')} descriptions ${unicos('description')} parágrafos ${unicos('paragrafo')}`)
  writeFileSync(OUT, JSON.stringify(linhas, null, 0))
  console.log(OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
