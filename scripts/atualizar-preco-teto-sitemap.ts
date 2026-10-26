/**
 * Gera server/data/preco-teto-elegiveis.ts: ações e FIIs com cotação e com
 * LPA ou dividendo de renda. A página /calculadora/preco-teto/{T} 404a fora
 * dessa régua; o sitemap só lista quem passaria.
 *
 * Falha de rede não apaga o arquivo anterior (sitemap vazio é pior que
 * lista de ontem). Roda no build e pode rodar à mão:
 *   node scripts/atualizar-preco-teto-sitemap.ts
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseProventos, overviewDyOf } from '../app/utils/proventos.ts'
import {
  dividendoParaBazin,
  lpaDeOverview,
  paginaPrecoTetoExiste,
  tickerDePaginaPrecoTeto,
  type OverviewPrecoTeto,
} from '../app/utils/preco-teto-pagina.ts'

const BASE = process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../server/data/preco-teto-elegiveis.ts')
const CONCORRENCIA = 16

interface Row {
  ticker?: string
  type?: string
  alias_of?: string | null
  market_price?: number | null
  price_date?: string | null
}

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'RedentiaSitemap/1.0' },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
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

async function elegivel(row: Row): Promise<{ ticker: string; lastmod?: string } | null> {
  const ticker = tickerDePaginaPrecoTeto(row)
  if (!ticker) return null
  let overview: OverviewPrecoTeto | null = null
  try {
    const body = await getJson(`/fundamentals/${ticker}/overview`) as { data?: OverviewPrecoTeto }
    overview = body?.data ?? null
  } catch {
    return null
  }
  const lpa = lpaDeOverview(overview)
  if (lpa > 0) {
    return { ticker, lastmod: dataDe(row.price_date) }
  }
  let rows = null as ReturnType<typeof parseProventos> | null
  try {
    const body = await getJson(`/dividends/${ticker}`) as { data?: unknown[] }
    rows = parseProventos(body?.data)
  } catch {
    return null
  }
  const div = dividendoParaBazin({
    overviewDy: overviewDyOf(overview),
    price: Number(row.market_price) || 0,
    rows,
  })
  if (!paginaPrecoTetoExiste(lpa, div.valor)) return null
  return { ticker, lastmod: dataDe(row.price_date) }
}

function dataDe(v: unknown): string | undefined {
  const d = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : undefined
}

function emitir(itens: { ticker: string; lastmod?: string }[]) {
  const linhas = itens.map((t) => {
    const mod = t.lastmod ? `, lastmod: '${t.lastmod}'` : ''
    return `  { ticker: '${t.ticker}'${mod} },`
  })
  const src = `/**
 * Ações e FIIs com página /calculadora/preco-teto/{TICKER}.
 * Gerado por scripts/atualizar-preco-teto-sitemap.ts. Não editar à mão.
 * Entra quem tem cotação e LPA positivo ou dividendo de renda em 12 meses.
 */
export interface PrecoTetoElegivel {
  ticker: string
  lastmod?: string
}

export const PRECO_TETO_ELEGIVEIS: PrecoTetoElegivel[] = [
${linhas.join('\n')}
]
`
  writeFileSync(OUT, src)
}

async function main() {
  let rows: Row[] = []
  try {
    const body = await getJson('/tickers-full') as { data?: Row[] }
    rows = Array.isArray(body?.data) ? body.data : []
  } catch (e) {
    console.warn('preco-teto sitemap: /tickers-full falhou, arquivo anterior mantido.', e instanceof Error ? e.message : e)
    return
  }
  const candidatos = rows.filter((r) => tickerDePaginaPrecoTeto(r))
  console.log(`preco-teto sitemap: ${candidatos.length} ações e FIIs com cotação, checando LPA e dividendo…`)
  const saida = (await pool(candidatos, CONCORRENCIA, elegivel)).filter((x): x is { ticker: string; lastmod?: string } => !!x)
  saida.sort((a, b) => a.ticker.localeCompare(b.ticker))
  if (saida.length === 0) {
    console.warn('preco-teto sitemap: zero tickers com dado, arquivo anterior mantido.')
    return
  }
  emitir(saida)
  console.log(`preco-teto sitemap: ${saida.length} tickers em ${OUT}`)
}

main().catch((e) => {
  console.warn('preco-teto sitemap: geração falhou, arquivo anterior mantido.', e instanceof Error ? e.message : e)
})
