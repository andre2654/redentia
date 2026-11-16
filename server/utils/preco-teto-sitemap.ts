/**
 * URLs de /calculadora/preco-teto/{TICKER} que entram no sitemap.
 *
 * Só a allowlist do Search Console que também tem página (LPA ou dividendo).
 * Ticker sem dado não entra: a rota responde 404.
 */
import { PRECO_TETO_INDEXAVEIS } from '../../app/content/seo/preco-teto-indexaveis.ts'
import { PRECO_TETO_ELEGIVEIS } from '../data/preco-teto-elegiveis.ts'

export interface PaginaPrecoTetoIndexavel {
  path: string
  title: string
  description: string
  lastmod?: string
}

export function paginasPrecoTetoIndexaveis(): PaginaPrecoTetoIndexavel[] {
  const lastmod = new Map(PRECO_TETO_ELEGIVEIS.map((t) => [t.ticker, t.lastmod]))
  return [...PRECO_TETO_INDEXAVEIS]
    .filter((ticker) => lastmod.has(ticker))
    .sort((a, b) => a.localeCompare(b))
    .map((ticker) => {
      const data = lastmod.get(ticker)
      return {
        path: `/calculadora/preco-teto/${ticker}`,
        title: `Preço-teto calculado pelo método Bazin para ${ticker}`,
        description: 'Estimativa educacional, não é recomendação.',
        ...(data ? { lastmod: data } : {}),
      }
    })
}
