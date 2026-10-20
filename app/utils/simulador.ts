/**
 * Link pro simulador de /calculadora/acoes a partir de um ativo.
 *
 * A /calculadora/acoes é a DONA do cluster "calculadora/simulador de
 * dividendos" + "simulador de ações" (decisão de 23/09/2026, bloco DONO DO
 * CLUSTER em pages/calculadora/acoes.vue). /asset e /dividendos linkam pra ela
 * por aqui, com as âncoras "Simulador de ações" e "Simulador de dividendos".
 *
 * FRAGMENTO, não query string, de propósito. Este link sai de ~1.700 páginas
 * de /asset e /dividendos. Com `?tickers=PETR4` cada template publicaria uma
 * URL própria, ~1.700 variantes do mesmo documento que o Googlebot rastreia e
 * depois colapsa pelo canonical. Com `#tickers=PETR4` o Google descarta o
 * fragmento e TODAS as âncoras caem exatamente em /calculadora/acoes, sem
 * gastar rastreio. O simulador lê o fragmento igual à query
 * (CalcAcoesSimulator.vue, deepLinkParams).
 */

/**
 * Tipos do /tickers-full que o simulador resolve (CalcAcoesSimulator filtra por
 * esta lista). BDR, US_STOCK, US_ETF e cripto ficam de fora: o link abriria a
 * calculadora vazia, prometendo um contexto que ela não tem.
 */
export const SIMULADOR_TYPES: ReadonlySet<string> = new Set(['STOCK', 'FUND', 'REIT', 'ETF'])

/** `type` é o do /tickers/{t} (ProfileResource), mesmo vocabulário do /tickers-full. */
export function simuladorAcoesHref(ticker: string, type: string | null | undefined): string | null {
  if (!SIMULADOR_TYPES.has(String(type ?? '').toUpperCase())) return null
  return `/calculadora/acoes#tickers=${encodeURIComponent(ticker)}&reinvest=1`
}
