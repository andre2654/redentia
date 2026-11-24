/**
 * Os 50 tickers de /imposto-de-renda/{TICKER}.
 *
 * Ordem: volume financeiro do pregão em PRECO_TETO_FICHA, do maior para o
 * menor. Empate de volume: ticker A–Z.
 * RZZI11 está no topo da ficha, mas GET /tickers/RZZI11 responde 404
 * (24/11/2026). A página seria um 404 no sitemap. Entra o seguinte, XPML11.
 * tests/imposto-renda-ticker.test.ts quebra se a ficha mudar a régua.
 */
export const TICKERS_IMPOSTO_RENDA = [
  'VALE3', 'EMBJ3', 'PETR4', 'ITUB4', 'TRXB11', 'PRIO3', 'TJKB11', 'SUZB3',
  'WEGE3', 'BPAC11', 'PETR3', 'AURA33', 'AXIA3', 'BBAS3', 'HBCR11', 'VIVT3',
  'B3SA3', 'SBSP3', 'BBDC4', 'RDOR3', 'EQTL3', 'CSMG3', 'VBBR3', 'RENT3',
  'TIMS3', 'CPOF11', 'SEED11', 'SANB11', 'BBSE3', 'UGPA3', 'MGLU3', 'ABEV3',
  'ITSA4', 'IRBR3', 'GGBR4', 'ENGI11', 'SMFT3', 'CPFE3', 'ENEV3', 'TAEE11',
  'CYRE3', 'KNCR11', 'ITUB3', 'RBRL11', 'RAIL3', 'TRXF11', 'BRAP4', 'CPLE3',
  'TOTS3', 'XPML11',
] as const

const CONJUNTO = new Set<string>(TICKERS_IMPOSTO_RENDA)

export function tickerNaListaImpostoRenda(ticker: string): boolean {
  return CONJUNTO.has(ticker.trim().toUpperCase())
}

/** URLs do sitemap. Universo vazio não apaga a lista. Alias e ticker ausente saem. */
export function pathsImpostoRenda(
  universo?: ReadonlyMap<string, { aliasOf?: string | null }>,
): string[] {
  return TICKERS_IMPOSTO_RENDA.filter((ticker) => {
    if (!universo || universo.size === 0) return true
    const entrada = universo.get(ticker)
    return !!entrada && !entrada.aliasOf
  }).map((ticker) => `/imposto-de-renda/${ticker}`)
}
