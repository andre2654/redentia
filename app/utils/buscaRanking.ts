/**
 * Ordem e rótulos dos resultados da /busca (redesenho de 02/11/2026).
 *
 * Antes, dentro da mesma faixa de casamento a ordem era alfabética: "petr"
 * dava PETR3, PETR4, E1CO34, OXY, PRIO3, RECV3, e a Ecopetrol vinha antes da
 * PRIO só pelo E. Agora, na mesma faixa, vence quem vale mais na bolsa (o
 * market_cap do /tickers-full); sem valor de mercado, alfabético.
 *
 * Sem import de valor de propósito: os testes (node --test) importam direto.
 */

/** Normaliza para comparar: minúsculas, sem acento. */
export function normBusca(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/**
 * Faixa de casamento (menor é melhor): 0 ticker idêntico, 1 ticker começa
 * com a busca, 2 nome começa com a busca, 3 ticker contém, 4 nome contém
 * (início de palavra), 5 nome contém em qualquer lugar. -1 não casa.
 * `ql` já vem normalizado.
 */
export function faixaDoCasamento(ql: string, ticker: string, nome: string): number {
  if (!ql) return -1
  const t = normBusca(ticker)
  const n = normBusca(nome)
  if (t === ql) return 0
  if (t.startsWith(ql)) return 1
  if (n.startsWith(ql)) return 2
  if (t.includes(ql)) return 3
  if (n.split(/[\s.,/&-]+/).some((w) => w.startsWith(ql))) return 4
  if (n.includes(ql)) return 5
  return -1
}

export interface Casado<T> {
  item: T
  faixa: number
  ticker: string
  cap: number | null
}

/** Mesma faixa: maior valor de mercado primeiro; empate ou sem valor, alfabético. */
export function compararCasados<T>(a: Casado<T>, b: Casado<T>): number {
  return a.faixa - b.faixa || (b.cap ?? 0) - (a.cap ?? 0) || a.ticker.localeCompare(b.ticker)
}

/** O tipo do /tickers-full em palavra curta, para a linha do resultado. */
export function rotuloDoTipo(type: string): string {
  switch (type) {
    case 'STOCK': return 'Ação'
    case 'REIT': return 'FII'
    case 'BDR': return 'BDR'
    case 'ETF': return 'ETF'
    case 'US_STOCK': return 'EUA'
    case 'US_ETF': return 'ETF EUA'
    case 'AGRI_FUND': return 'Fiagro'
    case 'CRYPTO': return 'Cripto'
    default: return ''
  }
}

/**
 * Uma linha por empresa na lista das maiores: PETR3 e PETR4 são a mesma
 * Petrobras, e mostrar as duas gasta uma linha com o mesmo número.
 * Raiz do ticker B3 = as 4 letras.
 */
export function umaLinhaPorEmpresa<T extends { ticker: string }>(lista: T[], quantas: number): T[] {
  const vistas = new Set<string>()
  const saida: T[] = []
  for (const a of lista) {
    const raiz = a.ticker.slice(0, 4)
    if (vistas.has(raiz)) continue
    vistas.add(raiz)
    saida.push(a)
    if (saida.length >= quantas) break
  }
  return saida
}
