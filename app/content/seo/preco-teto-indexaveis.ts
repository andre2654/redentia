/**
 * Tickers de /calculadora/preco-teto/{TICKER} que voltam ao índice.
 *
 * A base é a allowlist do Search Console, 15 de agosto a 14 de novembro de
 * 2026, quem teve pelo menos 2 cliques. Em cima dela entram os lotes de
 * liquidez já abertos (server/data/preco-teto-lotes.ts). Robots, sitemap e
 * os links internos usam este mesmo conjunto. HGLG11, PETR3 e KNRI11 não
 * estão na ordem dos lotes.
 *
 * O casamento ignora maiúsculas. A URL canônica continua em maiúsculas:
 * https://aportou.com.br/calculadora/preco-teto/{TICKER}
 */
import { PRECO_TETO_FICHA, tickersDosLotesAbertos } from '../../../server/data/preco-teto-lotes.ts'

export const PRECO_TETO_COM_CLIQUE = [
  'BBAS3', 'BBSE3', 'VALE3', 'PETR4', 'BBDC4', 'SAPR4', 'ITSA4', 'CPFE3',
  'ITUB4', 'TAEE11', 'CMIG4', 'BBDC3', 'BPAC11', 'AXIA3', 'POMO4', 'WEGE3',
  'ALOS3', 'BRBI11', 'CXSE3', 'TAEE4', 'TAEE3', 'JHSF3', 'PSSA3', 'EGIE3',
  'EQTL3', 'SAPR11', 'CPLE3', 'BRAP4', 'B3SA3', 'ITSA3', 'ABEV3', 'ABCB4',
  'GRND3', 'CURY3', 'TASA4', 'EMBJ3', 'PRSN11',
] as const

function juntarIndexaveis(): string[] {
  const vistos = new Set<string>()
  const saida: string[] = []
  for (const ticker of [...PRECO_TETO_COM_CLIQUE, ...tickersDosLotesAbertos()]) {
    if (vistos.has(ticker)) continue
    vistos.add(ticker)
    saida.push(ticker)
  }
  return saida
}

/** Allowlist de cliques mais os lotes abertos. A ordem não é a do sitemap. */
export const PRECO_TETO_INDEXAVEIS: readonly string[] = juntarIndexaveis()

const INDEXAVEIS = new Set<string>(PRECO_TETO_INDEXAVEIS)

export function tickersPrecoTetoIndexaveis(): readonly string[] {
  return PRECO_TETO_INDEXAVEIS
}

/** True quando o ticker (em qualquer caixa) está no conjunto indexável. */
export function precoTetoIndexavel(ticker: string): boolean {
  return INDEXAVEIS.has(String(ticker ?? '').trim().toUpperCase())
}

/**
 * Robots da página por ticker. Fora do conjunto, o mesmo `noindex, follow`
 * de 15/11/2026 (meta robots; estas URLs não têm X-Robots-Tag próprio). No
 * conjunto, undefined: sem meta robots e sem header de noindex.
 */
export function robotsDePrecoTeto(ticker: string): 'noindex, follow' | undefined {
  return precoTetoIndexavel(ticker) ? undefined : 'noindex, follow'
}

function setorNormal(valor: string | null | undefined): string {
  const s = String(valor ?? '').trim().toLowerCase()
  if (!s || s === 'n/a') return ''
  return s
}

/**
 * 3 a 6 papéis do mesmo setor que também estão no conjunto indexável,
 * do maior volume financeiro ao menor. Menos de 3 no setor: devolve os
 * que existem. Setor vazio não agrupa o resto.
 */
export function relacionadosPrecoTeto(
  ticker: string,
  setorVivo?: string | null,
): { ticker: string; href: string }[] {
  const eu = String(ticker ?? '').trim().toUpperCase()
  const setor = setorNormal(setorVivo) || setorNormal(PRECO_TETO_FICHA[eu]?.setor)
  if (!setor) return []
  return Object.entries(PRECO_TETO_FICHA)
    .filter(([outro, ficha]) => outro !== eu && precoTetoIndexavel(outro) && setorNormal(ficha.setor) === setor)
    .sort((a, b) => b[1].volume - a[1].volume || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([outro]) => ({ ticker: outro, href: `/calculadora/preco-teto/${outro}` }))
}
