/**
 * Quais URLs entram em /sitemaps/quanto-rende.xml.
 *
 * Ação, FII e BDR: só quem tem count_12m > 0 em GET /dividends/tickers, símbolo
 * B3 válido. Sem o campo, fica de fora: ausência não prova provento em 12
 * meses, e a página responde 404. O count_12m não separa renda de amortização.
 * Papel que só devolveu capital (BRIP11, INFB11, ENJU3) entra aqui e a página
 * responde 404. Falta no backend a soma de renda em 12 meses.
 *
 * Tesouro: a mesma régua da página (paginaTesouroValida). Título vencido ou
 * sem taxa numérica não entra.
 */
import type { DividendTickerRow } from './dividend-sitemap.ts'
import { symbolShape } from '../../app/utils/tickerClass.ts'
import { paginaTesouroValida } from '../../app/utils/quanto-rende.ts'

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
