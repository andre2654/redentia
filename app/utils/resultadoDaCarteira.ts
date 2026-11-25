/**
 * "Quanto eu ganhei?" e "quem subiu, quem caiu?" (24/11/2026).
 *
 * A /carteira e a home diziam o % contra o CDI e o dia do total, mas não o
 * ganho em reais nem o que cada ativo fez: a pessoa ia ao Status Invest para
 * ver. Aqui sai tudo do que já é pedido: o /portfolio (quantidade, preço médio
 * e valor) e o /portfolio/today (o dia de cada papel).
 *
 * O que é verdade nos números:
 *  - `ganho` é a valorização sobre o preço médio: valor de hoje menos o que
 *    custou. NÃO inclui proventos recebidos nem resultado de vendas passadas.
 *  - Só entra na conta o ativo que tem preço médio. `cobertura` diz que parte
 *    do patrimônio isso é; com cobertura parcial a tela diz "em N de M ativos".
 *  - O dia é o do /portfolio/today. O Tesouro não vem nele: fica sem dia, e
 *    não entra em "subiu" nem em "caiu".
 */
import type { PortfolioPositionApi, PortfolioTodayApi } from '~/types/home'

export interface LinhaDoResultado {
  ticker: string
  nome: string
  classe: string
  valor: number
  /** quanto custou (preço médio × quantidade); null sem preço médio */
  custo: number | null
  ganho: number | null
  ganhoPct: number | null
  /** o dia em R$ e em %; null quando o /today não precificou o papel */
  diaValor: number | null
  diaPct: number | null
}

export interface ResultadoDaCarteira {
  linhas: LinhaDoResultado[]
  /** a soma do ganho dos ativos com preço médio; null se nenhum tem */
  ganho: number | null
  ganhoPct: number | null
  custo: number | null
  /** quantos ativos têm preço médio, e a fração do patrimônio que eles somam (0 a 1) */
  comCusto: number
  cobertura: number
  /** quem mais subiu e quem mais caiu no dia (em %), no máximo `n` de cada */
  sobem: LinhaDoResultado[]
  caem: LinhaDoResultado[]
  /** quantos subiram e quantos caíram no dia, entre os que têm preço do dia */
  nSobem: number
  nCaem: number
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

export function montarResultado(
  portfolio: PortfolioPositionApi[] | null | undefined,
  today: PortfolioTodayApi | null | undefined,
  n = 3,
): ResultadoDaCarteira | null {
  const dia = new Map<string, { valor: number; pct: number }>()
  for (const p of today?.positions ?? []) {
    const v = num(p.day_change_amount), pct = num(p.day_change_pct)
    if (v != null && pct != null) dia.set(p.ticker.toUpperCase(), { valor: v, pct })
  }

  const linhas: LinhaDoResultado[] = []
  for (const p of portfolio ?? []) {
    const valor = num(p.current_value) ?? (num(p.current_price) != null ? (p.current_price as number) * p.quantity : null)
    if (valor == null || valor <= 0) continue
    const pm = num(p.average_price)
    const custo = pm != null && pm > 0 && p.quantity > 0 ? pm * p.quantity : null
    const d = dia.get(p.ticker.toUpperCase())
    linhas.push({
      ticker: p.ticker,
      nome: p.name || p.ticker,
      classe: p.asset_class ?? 'STOCK',
      valor,
      custo,
      ganho: custo != null ? valor - custo : null,
      ganhoPct: custo != null ? (valor / custo - 1) * 100 : null,
      diaValor: d?.valor ?? null,
      diaPct: d?.pct ?? null,
    })
  }
  if (!linhas.length) return null

  const total = linhas.reduce((s, l) => s + l.valor, 0)
  const comCusto = linhas.filter((l) => l.custo != null)
  const custo = comCusto.reduce((s, l) => s + (l.custo as number), 0)
  const valorComCusto = comCusto.reduce((s, l) => s + l.valor, 0)
  const temCusto = comCusto.length > 0 && custo > 0

  const comDia = linhas.filter((l) => l.diaPct != null)
  const sobem = comDia.filter((l) => (l.diaPct as number) > 0).sort((a, b) => (b.diaPct as number) - (a.diaPct as number))
  const caem = comDia.filter((l) => (l.diaPct as number) < 0).sort((a, b) => (a.diaPct as number) - (b.diaPct as number))

  return {
    linhas: linhas.sort((a, b) => b.valor - a.valor),
    ganho: temCusto ? valorComCusto - custo : null,
    ganhoPct: temCusto ? (valorComCusto / custo - 1) * 100 : null,
    custo: temCusto ? custo : null,
    comCusto: comCusto.length,
    cobertura: total > 0 ? valorComCusto / total : 0,
    sobem: sobem.slice(0, n),
    caem: caem.slice(0, n),
    nSobem: sobem.length,
    nCaem: caem.length,
  }
}

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** '+R$ 1.234' / '−R$ 87' (sem centavos: é a leitura, não o extrato) */
export function reaisComSinal(v: number): string {
  return `${v < 0 ? '−' : '+'}R$ ${nf0.format(Math.abs(v))}`
}

export function direcao(v: number | null | undefined): 'up' | 'down' | 'flat' {
  if (v == null || Math.abs(v) < 0.005) return 'flat'
  return v > 0 ? 'up' : 'down'
}
