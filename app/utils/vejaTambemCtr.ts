/**
 * Bloco "Veja também" das páginas do ctr-top20.
 *
 * Os /dividendos/{TICKER} saem de PRECO_TETO_COM_CLIQUE, que é o conjunto
 * já usado no site, ordenado pelo volume financeiro de PRECO_TETO_FICHA.
 * No papel, o mesmo setor vem primeiro quando há pelo menos dois pares.
 * Âncora descritiva: diz o que a página é, sem recomendar compra.
 */
import { PRECO_TETO_COM_CLIQUE } from '../content/seo/preco-teto-indexaveis.ts'
import { FIIS_PATH } from '../content/seo/fiis-hub.ts'
import { PRECO_TETO_FICHA } from '../../server/data/preco-teto-lotes.ts'

export interface VejaLink { href: string; label: string }
export interface TrilhaItem { name: string; path: string }

export type PaginaVeja =
  | 'juros'
  | 'acoes'
  | 'dy'
  | 'ir'
  | 'quanto-investir'
  | 'preco-teto'
  | 'preco-teto-ticker'
  | 'tesouro'
  | 'quanto-rende'
  | 'asset'
  | 'dividendos'

const HUBS: VejaLink[] = [
  { href: '/dividendos/agenda', label: 'Agenda de dividendos' },
  { href: FIIS_PATH, label: 'Fundos imobiliários' },
  { href: '/rankings', label: 'Rankings da B3' },
]

function setorDe(ticker: string): string {
  return String(PRECO_TETO_FICHA[ticker]?.setor ?? '').trim().toLowerCase()
}

/** Tickers já usados no site, do maior volume financeiro ao menor. */
export function dividendosMaisLiquidos(excluir = ''): string[] {
  const fora = excluir.trim().toUpperCase()
  return [...PRECO_TETO_COM_CLIQUE]
    .filter((t) => t !== fora && PRECO_TETO_FICHA[t])
    .sort((a, b) => (PRECO_TETO_FICHA[b]!.volume - PRECO_TETO_FICHA[a]!.volume) || a.localeCompare(b))
}

function paresDeDividendo(ticker: string, limite: number): string[] {
  const pool = dividendosMaisLiquidos(ticker)
  const setor = setorDe(ticker)
  if (setor) {
    const mesmo = pool.filter((t) => setorDe(t) === setor)
    if (mesmo.length >= 2) return mesmo.slice(0, limite)
  }
  return pool.slice(0, limite)
}

function unico(links: VejaLink[]): VejaLink[] {
  const vistos = new Set<string>()
  const out: VejaLink[] = []
  for (const l of links) {
    if (vistos.has(l.href)) continue
    vistos.add(l.href)
    out.push(l)
  }
  return out
}

export function linksVejaTambem(opts: {
  pagina: PaginaVeja
  ticker?: string
  /**
   * A página já aponta para /dividendos/{ticker} (o card ou o "Veja também"
   * do ativo). O bloco não repete esse destino.
   */
  proprioJaLinkado?: boolean
}): VejaLink[] {
  const ticker = String(opts.ticker ?? '').trim().toUpperCase()
  const links: VejaLink[] = []
  const paginaDoTicker = opts.pagina === 'asset' || opts.pagina === 'quanto-rende' || opts.pagina === 'preco-teto-ticker'
  if (ticker && paginaDoTicker && !opts.proprioJaLinkado) {
    links.push({ href: `/dividendos/${ticker}`, label: `Dividendos de ${ticker}` })
  }
  for (const t of paresDeDividendo(ticker, 4)) {
    links.push({ href: `/dividendos/${t}`, label: `Dividendos de ${t}` })
  }
  links.push(...HUBS)
  if (opts.pagina === 'dividendos' && ticker) {
    return unico(links).filter((l) => l.href !== `/dividendos/${ticker}`)
  }
  return unico(links)
}

/** A mesma trilha do BreadcrumbList de /asset/{TICKER}. */
export function trilhaAtivo(ticker: string): TrilhaItem[] {
  const t = ticker.trim().toUpperCase()
  return [
    { name: 'Início', path: '/' },
    { name: t, path: `/asset/${t}` },
  ]
}
