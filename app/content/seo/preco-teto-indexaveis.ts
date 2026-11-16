/**
 * Tickers de /calculadora/preco-teto/{TICKER} que voltam ao índice.
 *
 * Fonte: export do Google Search Console, 15 de agosto a 14 de novembro de
 * 2026 (3 meses). Entra quem teve pelo menos 2 cliques. Lista fixa. O resto
 * da família segue noindex, follow e fora de todo sitemap, como nos PRs 157
 * e 158, para não gastar o orçamento de rastreamento com a mesma calculadora
 * repetida.
 *
 * O casamento ignora maiúsculas. A URL canônica continua em maiúsculas:
 * https://aportou.com.br/calculadora/preco-teto/{TICKER}
 */
export const PRECO_TETO_INDEXAVEIS = [
  'BBAS3', 'BBSE3', 'VALE3', 'PETR4', 'BBDC4', 'SAPR4', 'ITSA4', 'CPFE3',
  'ITUB4', 'TAEE11', 'CMIG4', 'BBDC3', 'BPAC11', 'AXIA3', 'POMO4', 'WEGE3',
  'ALOS3', 'BRBI11', 'CXSE3', 'TAEE4', 'TAEE3', 'JHSF3', 'PSSA3', 'EGIE3',
  'EQTL3', 'SAPR11', 'CPLE3', 'BRAP4', 'B3SA3', 'ITSA3', 'ABEV3', 'ABCB4',
  'GRND3', 'CURY3', 'TASA4', 'EMBJ3', 'PRSN11',
] as const

const INDEXAVEIS = new Set<string>(PRECO_TETO_INDEXAVEIS)

/** True quando o ticker (em qualquer caixa) está na allowlist do Search Console. */
export function precoTetoIndexavel(ticker: string): boolean {
  return INDEXAVEIS.has(String(ticker ?? '').trim().toUpperCase())
}

/**
 * Robots da página por ticker. Fora da lista, o mesmo `noindex, follow` de
 * 15/11/2026 (meta robots; estas URLs não têm X-Robots-Tag próprio). Na
 * lista, undefined: sem meta robots e sem header de noindex.
 */
export function robotsDePrecoTeto(ticker: string): 'noindex, follow' | undefined {
  return precoTetoIndexavel(ticker) ? undefined : 'noindex, follow'
}
