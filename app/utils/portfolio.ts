/**
 * Domínio carteira compartilhado entre a Home logada (PR7) e /carteira (PR8).
 * EXTRAÍDO do useHome no PR8 (regra "1 implementação por responsabilidade"):
 * valor de posição, total do patrimônio, mapas de classe/tile do design e o
 * builder do gráfico navy (equity-curve + IBOV + CDI) — as duas telas plotam
 * a MESMA curva com a MESMA âncora, então o número nunca diverge entre elas.
 */
import type { EquityCurvePointApi, HomeChartVM, PortfolioPositionApi, PortfolioTodayApi } from '~/types/home'
import type { SeriesPoint } from '~/types/acao'

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** valor de uma posição na precedência do backend (current_value > mtm > custo). */
export function positionValue(p: PortfolioPositionApi): number {
  if (p.current_value != null) return p.current_value
  if (p.current_price != null) return p.current_price * p.quantity
  return (p.average_price ?? 0) * p.quantity
}

/**
 * Patrimônio total — MESMA precedência nas duas telas (coerência Home ×
 * Carteira): /portfolio/today marca a mercado com o preço mais fresco;
 * fallback = soma das posições do /portfolio.
 */
export function portfolioTotalValue(
  portfolio: PortfolioPositionApi[] | null,
  today: PortfolioTodayApi | null,
): number {
  if (today?.totals?.value_now && today.totals.value_now > 0) return today.totals.value_now
  return (portfolio ?? []).reduce((s, p) => s + positionValue(p), 0)
}

/* ————— classes de ativo (labels/cores/ordem do design) ————— */

export const CLASS_LABEL: Record<string, string> = {
  STOCK: 'Ações', BDR: 'Ações', ETF: 'Ações',
  REIT: 'FIIs',
  TREASURY: 'Renda Fixa', FIXED_INCOME: 'Renda Fixa',
  CRYPTO: 'Cripto',
}
/**
 * Cor por classe (mapa clsColors do design posicoes-v2 — 12 classes). Hoje o
 * CLASS_LABEL só produz as 5 primeiras ('Caixa' do design = nosso 'Outros');
 * as demais já têm cor pronta pra quando o backend passar a classificá-las
 * (classe fora deste mapa cai no fallback --nu-alloc-cash de quem consome).
 */
export const CLASS_COLOR: Record<string, string> = {
  'Ações': 'var(--nu-alloc-stock)',
  'FIIs': 'var(--nu-alloc-fii)',
  'Renda Fixa': 'var(--nu-alloc-fixed)',
  'Cripto': 'var(--nu-alloc-crypto)',
  'Outros': 'var(--nu-alloc-cash)',
  'Caixa': 'var(--nu-alloc-cash)',
  'BDRs': 'var(--nu-class-bdr)',
  'ETFs': 'var(--nu-class-etf)',
  'Debêntures': 'var(--nu-class-deb)',
  'Ouro': 'var(--nu-class-gold)',
  'Previdência': 'var(--nu-class-prev)',
  'Fundos': 'var(--nu-class-fund)',
  'Câmbio': 'var(--nu-class-fx)',
}
/** ordem fixa do design (Ações → FIIs → RF → Cripto → Outros). */
export const CLASS_ORDER = ['Ações', 'FIIs', 'Renda Fixa', 'Cripto', 'Outros']

/* ————— tiles de ticker (mapa TL do design + ciclo do PR5) ————— */

export const TILE_MAP: Record<string, [bg: string, fg: string]> = {
  PETR4: ['var(--nu-tile-petr-bg)', 'var(--nu-white)'],
  VALE3: ['var(--nu-tile-vale-bg)', 'var(--nu-tile-vale-fg)'],
  BBAS3: ['var(--nu-tile-bbas-bg)', 'var(--nu-tile-bbas-fg)'],
  WEGE3: ['var(--nu-tile-wege-bg)', 'var(--nu-tile-wege-fg)'],
  ITUB4: ['var(--nu-tile-itub-bg)', 'var(--nu-tile-itub-fg)'],
  MXRF11: ['var(--nu-tile-mxrf-bg)', 'var(--nu-tile-mxrf-fg)'],
}
export const TILE_CYCLE: [string, string][] = [
  ['var(--nu-tile-blue-bg)', 'var(--nu-blue-deep)'],
  ['var(--nu-tile-amber-bg)', 'var(--nu-tile-amber-fg)'],
  ['var(--nu-tile-green-bg)', 'var(--nu-green-2)'],
  ['var(--nu-tile-orange-bg)', 'var(--nu-tile-orange-fg)'],
]

/** par bg/fg do tile de um ticker por classe (PR8: RF/Cripto têm par próprio). */
export function tileFor(ticker: string, assetClass: string | null, idx: number): [string, string] {
  const known = TILE_MAP[ticker]
  if (known) return known
  if (assetClass === 'TREASURY' || assetClass === 'FIXED_INCOME') return ['var(--nu-tile-rf-bg)', 'var(--nu-alloc-fixed)']
  if (assetClass === 'CRYPTO') {
    if (/^ETH/i.test(ticker)) return ['var(--nu-tile-mxrf-bg)', 'var(--nu-tile-mxrf-fg)']
    return ['var(--nu-tile-btc-bg)', 'var(--nu-tile-btc-fg)']
  }
  return TILE_CYCLE[idx % TILE_CYCLE.length]!
}

/* ————— gráfico navy (equity-curve + comparativos de legenda) ————— */

/**
 * Fiel ao design: a curva plota o PATRIMÔNIO em R$ (gridlines 'R$ NNk', pill
 * 'Patrimônio hoje', tooltip R$ + delta% no período) — IBOV e CDI entram como
 * COMPARATIVOS DE LEGENDA (Você/IBOV/CDI %), não como linhas.
 * Estados: null = seção some (sem curva/sem conexão); collecting = curva com
 * <10 pontos ("coletando histórico", sem gráfico falso).
 */
export function buildEquityChartVM(
  curve: EquityCurvePointApi[] | null,
  ibov12m: SeriesPoint[] | null,
  cdiRate: number | null,
  totalValue: number,
): HomeChartVM | null {
  if (!curve?.length) return null
  // corta o prólogo sem preço confiável (position_value 0 vira parede no chart)
  const firstIdx = curve.findIndex((p) => p.position_value > 0)
  if (firstIdx < 0) return null
  const points: SeriesPoint[] = curve.slice(firstIdx).map((p) => ({ t: p.date, v: p.position_value }))
  // Coerência hero×chart: o último ponto da curva ancora no MESMO total do
  // hero (/portfolio/today marca a mercado com o preço mais fresco; a curva
  // fecha com sum(current_value) do Pluggy — duas verdades verificadas ao
  // vivo: 346.227 vs 335.132). O backend já faz override do último ponto;
  // aqui só trocamos a âncora pela mais fresca.
  const last = points[points.length - 1]!
  if (totalValue > 0) last.v = totalValue
  return {
    points,
    collecting: points.length < 10,
    currentLabel: `R$ ${nf0.format(last.v)}`,
    ibov12m,
    cdiRate,
  }
}
