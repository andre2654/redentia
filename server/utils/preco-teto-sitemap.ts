/**
 * URLs de /calculadora/preco-teto/{TICKER} que entram no sitemap.
 *
 * Allowlist de cliques mais os lotes abertos, e só quem a rota responde 200.
 * Ticker sem página não entra: a rota responde 404 (ou 410, se deslistado).
 * A ordem em PRECO_TETO_ORDEM não muda: cada lote aberto segue com 100.
 */
import { PRECO_TETO_COM_CLIQUE, PRECO_TETO_INDEXAVEIS, precoTetoIndexavel } from '../../app/content/seo/preco-teto-indexaveis.ts'
import { PRECO_TETO_ELEGIVEIS } from '../data/preco-teto-elegiveis.ts'
import { PRECO_TETO_LOTE_LASTMOD } from '../data/preco-teto-lotes.ts'

/**
 * Indexáveis cuja rota não responde 200. Conferido na API em 27/11/2026.
 * Ficam na ordem dos lotes (e PRSN11, na allowlist) para não deslocar o corte.
 *
 * 404 com LPA não positivo e sem dividendo de renda em 12 meses: VVEO3.
 * 404 porque GET /tickers/{T} não encontra o papel: PRSN11, RZZI11, VGII11, FZDB11.
 * 410 deslistado: JPPA11, APXM11.
 */
export const PRECO_TETO_FORA_DO_SITEMAP = [
  'APXM11',
  'FZDB11',
  'JPPA11',
  'PRSN11',
  'RZZI11',
  'VGII11',
  'VVEO3',
] as const

const FORA_DO_SITEMAP = new Set<string>(PRECO_TETO_FORA_DO_SITEMAP)

/** True quando o ticker indexável tem página e portanto entra no sitemap. */
export function precoTetoNoSitemap(ticker: string): boolean {
  const t = String(ticker ?? '').trim().toUpperCase()
  return precoTetoIndexavel(t) && !FORA_DO_SITEMAP.has(t)
}

export interface PaginaPrecoTetoIndexavel {
  path: string
  title: string
  description: string
  lastmod?: string
}

const CLIQUE = new Set<string>(PRECO_TETO_COM_CLIQUE)

export function paginasPrecoTetoIndexaveis(): PaginaPrecoTetoIndexavel[] {
  const lastmod = new Map(PRECO_TETO_ELEGIVEIS.map((t) => [t.ticker, t.lastmod]))
  return [...PRECO_TETO_INDEXAVEIS]
    .filter((ticker) => lastmod.has(ticker) && precoTetoNoSitemap(ticker))
    .sort((a, b) => a.localeCompare(b))
    .map((ticker) => {
      const data = CLIQUE.has(ticker) ? lastmod.get(ticker) : PRECO_TETO_LOTE_LASTMOD
      return {
        path: `/calculadora/preco-teto/${ticker}`,
        title: `Preço Teto ${ticker} hoje`,
        description: 'Estimativa educacional, não é recomendação.',
        ...(data ? { lastmod: data } : {}),
      }
    })
}
