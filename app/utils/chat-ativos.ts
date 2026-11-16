/**
 * Os cartões de ativo da resposta da IA (o evento asset.card do chat-service,
 * quando a IA consulta um papel com view_asset). O prompt manda a IA não
 * repetir no texto o preço e a variação que "o cartão" mostra; até 16/11 o
 * site descartava o cartão e a resposta saía sem o preço. Aqui ele vira um
 * chip com o preço e a variação, que leva à página do ativo.
 */
export interface AtivoDoChat {
  ticker: string
  nome?: string
  preco?: number
  variacao?: number
}

export const MAX_ATIVOS_NA_RESPOSTA = 4

/** O cartão do evento, conferido (ticker de B3, números finitos), ou null. */
export function ativoDoCartao(data: unknown): AtivoDoChat | null {
  const d = (data ?? {}) as { ticker?: unknown; snapshot?: { name?: unknown; price?: unknown; changePct?: unknown } }
  const ticker = typeof d.ticker === 'string' ? d.ticker.trim().toUpperCase() : ''
  if (!/^[A-Z0-9]{4,12}$/.test(ticker)) return null
  const s = d.snapshot ?? {}
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
  return {
    ticker,
    nome: typeof s.name === 'string' && s.name.trim() ? s.name.trim() : undefined,
    preco: num(s.price),
    variacao: num(s.changePct),
  }
}

/** Junta o cartão novo à lista da resposta: sem repetir o ticker, no máximo MAX_ATIVOS_NA_RESPOSTA. */
export function juntarAtivo(lista: AtivoDoChat[], novo: AtivoDoChat | null): AtivoDoChat[] {
  if (!novo || lista.some((a) => a.ticker === novo.ticker) || lista.length >= MAX_ATIVOS_NA_RESPOSTA) return lista
  return [...lista, novo]
}

const numero = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "R$ 30,12" e "+1,24%" (ou null quando o cartão não trouxe). */
export function rotulosDoAtivo(a: AtivoDoChat): { preco: string | null; variacao: string | null; sobe: boolean | null } {
  const v = a.variacao
  return {
    preco: a.preco === undefined ? null : `R$ ${numero.format(a.preco)}`,
    variacao: v === undefined ? null : `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2).replace('.', ',')}%`,
    sobe: v === undefined || v === 0 ? null : v > 0,
  }
}

/** As marcas de fonte [1] do texto viram um número pequeno (o HTML já vem escapado do chatMarkdown). */
export function marcasDeFonte(html: string): string {
  return html.replace(/\s?\[(\d{1,2})\]/g, '<sup class="cms__ref">$1</sup>')
}
