/**
 * Quais URLs entram em /sitemaps/quanto-rende.xml.
 *
 * Ação, FII e BDR: candidatos são STOCK, REIT e BDR com count_12m > 0 e
 * símbolo B3 válido. count_12m mistura amortização, então a lista final passa
 * por filtrarTickersComRenda: o histórico de GET /dividends/{TICKER}, a mesma
 * leitura da página (temRendaEm12Meses). Sem renda em 12 meses, ou sem
 * histórico confirmado, a URL fica de fora.
 *
 * Tesouro: a mesma régua da página (paginaTesouroValida). Título vencido ou
 * sem taxa numérica não entra.
 */
import type { DividendTickerRow } from './dividend-sitemap.ts'
import { symbolShape } from '../../app/utils/tickerClass.ts'
import { paginaTesouroValida, temRendaEm12Meses } from '../../app/utils/quanto-rende.ts'

/** Oito pedidos de histórico ao mesmo tempo. A fila não cresce com a lista. */
export const QUANTO_RENDE_SITEMAP_CONCORRENCIA = 8
/** 12 h: dentro da janela pedida (6 a 24 h) para não refazer ~900 históricos. */
export const QUANTO_RENDE_SITEMAP_MAX_AGE = 12 * 60 * 60

export interface QuantoRendeTicker {
  ticker: string
  type: string
}

export function tickersDePaginaQuantoRende(rows: readonly DividendTickerRow[]): QuantoRendeTicker[] {
  const seen = new Map<string, string>()
  for (const row of rows) {
    const type = String(row.type ?? '').trim().toUpperCase()
    if (type !== 'STOCK' && type !== 'REIT' && type !== 'BDR') continue
    const ticker = String(row.ticker ?? '').trim().toUpperCase()
    if (symbolShape(ticker) !== 'b3') continue
    if (!('count_12m' in row)) continue
    const n = Number(row.count_12m ?? 0)
    if (!Number.isFinite(n) || n <= 0) continue
    if (!seen.has(ticker)) seen.set(ticker, type)
  }
  return [...seen.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([ticker, type]) => ({ ticker, type }))
}

/**
 * Só fica quem tem provento de renda em 12 meses no histórico já buscado.
 * Chave ausente ou null: o GET falhou, e a URL não entra (404 no sitemap é
 * pior do que omitir até a próxima geração).
 */
export function filtrarTickersComRenda(
  candidatos: readonly QuantoRendeTicker[],
  historicos: Readonly<Record<string, readonly unknown[] | null | undefined>>,
  hoje: string,
): QuantoRendeTicker[] {
  return candidatos.filter((t) => {
    if (!Object.prototype.hasOwnProperty.call(historicos, t.ticker)) return false
    const rows = historicos[t.ticker]
    if (rows == null) return false
    return temRendaEm12Meses(rows, hoje)
  })
}

export interface TesouroSitemapRow {
  slug?: string | null
  name?: string | null
  indexer?: string | null
  rate_numeric?: number | null
  reference_rate?: number | null
  maturity_date?: string | null
  price_date?: string | null
}

export interface QuantoRendeTesouroSlug {
  slug: string
  name: string
  lastmod?: string
}

function isoDia(v: unknown): string | undefined {
  const d = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : undefined
}

function numOuNull(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function slugsDePaginaQuantoRendeTesouro(
  rows: readonly TesouroSitemapRow[],
  hoje: string,
): QuantoRendeTesouroSlug[] {
  const seen = new Map<string, QuantoRendeTesouroSlug>()
  for (const row of rows) {
    const slug = String(row.slug ?? '').trim().toLowerCase()
    const name = String(row.name ?? '').trim() || slug
    const indexer = String(row.indexer ?? '')
    if (!paginaTesouroValida({
      slug,
      name,
      indexer,
      rateNumeric: numOuNull(row.rate_numeric),
      referenceRate: numOuNull(row.reference_rate),
      maturity: isoDia(row.maturity_date) ?? null,
      hoje,
    })) continue
    if (!seen.has(slug)) {
      seen.set(slug, { slug, name, lastmod: isoDia(row.price_date) })
    }
  }
  return [...seen.values()].sort((a, b) => a.slug.localeCompare(b.slug))
}
