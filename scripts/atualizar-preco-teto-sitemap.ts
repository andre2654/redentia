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
  mesclarSitemapPrecoTeto,
  paginaPrecoTetoExiste,
  tickerDePaginaPrecoTeto,
  type OverviewPrecoTeto,
} from '../app/utils/preco-teto-pagina.ts'
import { PRECO_TETO_ELEGIVEIS } from '../server/data/preco-teto-elegiveis.ts'

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
      if (tentativa < 3) await new Promise((r) => setTimeout(r, 400 * tentativa))
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

async function checar(row: Row): Promise<{ ticker: string; status: 'sim' | 'nao' | 'falha'; lastmod?: string } | null> {
  const ticker = tickerDePaginaPrecoTeto(row)
  if (!ticker) return null
  const lastmod = dataDe(row.price_date)
  let overview: OverviewPrecoTeto | null = null
  try {
    const body = await getJson(`/fundamentals/${ticker}/overview`) as { data?: OverviewPrecoTeto } | null
    overview = body?.data ?? null
  } catch {
    return { ticker, status: 'falha', lastmod }
  }
  const lpa = lpaDeOverview(overview)
  if (lpa > 0) return { ticker, status: 'sim', lastmod }
  let rows = null as ReturnType<typeof parseProventos> | null
  try {
    const body = await getJson(`/dividends/${ticker}`) as { data?: unknown[] } | null
    rows = parseProventos(body?.data)
  } catch {
    return { ticker, status: 'falha', lastmod }
  }
  const div = dividendoParaBazin({
    overviewDy: overviewDyOf(overview),
    price: Number(row.market_price) || 0,
    rows,
  })
  if (!paginaPrecoTetoExiste(lpa, div.valor)) return { ticker, status: 'nao', lastmod }
  return { ticker, status: 'sim', lastmod }
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
  const checagens = (await pool(candidatos, CONCORRENCIA, checar)).filter((x): x is NonNullable<typeof x> => !!x)
  const falhas = checagens.filter((c) => c.status === 'falha').length
  const saida = mesclarSitemapPrecoTeto(PRECO_TETO_ELEGIVEIS, checagens)
  if (saida.length === 0) {
    console.warn('preco-teto sitemap: zero tickers com dado, arquivo anterior mantido.')
    return
  }
  emitir(saida)
  console.log(`preco-teto sitemap: ${saida.length} tickers (${falhas} falhas de rede reaproveitadas da lista anterior) em ${OUT}`)
}

main().catch((e) => {
  console.warn('preco-teto sitemap: geração falhou, arquivo anterior mantido.', e instanceof Error ? e.message : e)
})
