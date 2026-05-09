/**
 * useResultadoStats — agrega trades em metricas derivadas pra alimentar
 * os componentes da pagina /wallet/resultado.
 *
 * Pure function de trades → stats. Nao faz fetch nem persiste — recebe
 * trades como input e devolve um snapshot computado. Permite alimentar
 * com mock (useMockTrades) hoje e com dados reais do backend amanha
 * sem mexer nos componentes consumidores.
 *
 * Periodos suportados: '7d' | '30d' | '90d' | 'ytd' | '12m' | 'all'.
 *
 * Tudo que envolve "P&L em R$" usa SEMPRE `resultAmount` (resultado
 * real). Notional/volume operado fica em metricas separadas e NUNCA
 * entra em hero/ROI — ver decisao de UX sobre alavancagem em
 * /wallet/resultado.vue.
 */
import type { MockTrade, TradeKind } from './useMockTrades'

export type ResultPeriod = '7d' | '30d' | '90d' | 'ytd' | '12m' | 'all'

export interface DailyPnLPoint {
  date: string // ISO YYYY-MM-DD
  pnl: number
  trades: number
}

export interface ResultadoStats {
  /** Soma de resultAmount no periodo. */
  totalPnL: number
  /** Soma so de trades realizados (closedAt nao null) no periodo. */
  realizedPnL: number
  /** Soma so de trades em aberto (closedAt null). */
  unrealizedPnL: number
  /** Soma de dividendos/JCP no periodo. */
  incomePnL: number
  /** Numero de trades fechados (exclui posicoes abertas). */
  closedTradesCount: number
  /** Numero de trades abertos (posicoes correntes). */
  openTradesCount: number
  /** Numero de trades vencedores (resultAmount > 0 e closed). */
  wins: number
  /** Numero de trades perdedores (resultAmount < 0 e closed). */
  losses: number
  /** wins / (wins + losses), 0-1. */
  winRate: number
  /** Soma R$ ganhos / |soma R$ perdidos|. >1 = lucrativo. */
  profitFactor: number
  /** Media de resultAmount entre vencedores. */
  avgWin: number
  /** Media de resultAmount entre perdedores (numero negativo). */
  avgLoss: number
  /** Maior trade vencedor. */
  bestTrade: MockTrade | null
  /** Maior trade perdedor. */
  worstTrade: MockTrade | null
  /** Volume total operado (notional somado). */
  totalVolume: number
  /** Margem media usada (so trades de futures). */
  avgMargin: number | null
  /** Series diaria de P&L pra equity curve. */
  dailySeries: DailyPnLPoint[]
  /** Equity curve cumulativa (P&L acumulado dia a dia). */
  cumulativeSeries: DailyPnLPoint[]
  /** Distribuicao por kind. */
  byKind: Record<TradeKind, { count: number; pnl: number }>
  /** Distribuicao por instrument type. */
  byInstrument: Record<string, { count: number; pnl: number; volume: number }>
  /** Trades ordenados por data desc (mais recente primeiro). */
  trades: MockTrade[]
}

function periodStartMs(period: ResultPeriod, now: number): number {
  const day = 24 * 60 * 60 * 1000
  switch (period) {
    case '7d': return now - 7 * day
    case '30d': return now - 30 * day
    case '90d': return now - 90 * day
    case 'ytd': {
      const d = new Date(now)
      return new Date(d.getFullYear(), 0, 1).getTime()
    }
    case '12m': return now - 365 * day
    case 'all': return 0
  }
}

export function useResultadoStats(
  trades: MockTrade[] | Ref<MockTrade[]>,
  period: ResultPeriod | Ref<ResultPeriod>,
) {
  const tradesRef = isRef(trades) ? trades : ref(trades)
  const periodRef = isRef(period) ? period : ref(period)

  const stats = computed<ResultadoStats>(() => {
    const now = Date.now()
    const startMs = periodStartMs(periodRef.value, now)

    // Filtra trades que abriram OU fecharam dentro do periodo. Pra hold
    // posicoes abertas, considera incluida se openedAt cai no periodo
    // OU se ainda esta aberta (P&L unrealized atualiza no periodo).
    const filtered = tradesRef.value.filter((t) => {
      const openMs = new Date(t.openedAt).getTime()
      const closeMs = t.closedAt ? new Date(t.closedAt).getTime() : now
      // Trade tem que ter alguma sobreposicao com a janela
      return closeMs >= startMs && openMs <= now
    })

    // ============ P&L splits ============
    let realizedPnL = 0
    let unrealizedPnL = 0
    let incomePnL = 0
    let totalVolume = 0
    let closedTradesCount = 0
    let openTradesCount = 0

    for (const t of filtered) {
      const r = t.resultAmount ?? 0
      totalVolume += t.volume
      if (t.side === 'DIVIDEND' || t.side === 'JCP') {
        incomePnL += r
      } else if (t.closedAt) {
        realizedPnL += r
        closedTradesCount += 1
      } else {
        unrealizedPnL += r
        openTradesCount += 1
      }
    }
    const totalPnL = realizedPnL + unrealizedPnL + incomePnL

    // ============ Win/Loss ============
    // Conta apenas trades CLOSED de operacao (exclui dividendos e abertos —
    // dividendo nao tem "win/loss" semantico, posicao aberta ainda esta
    // viva e seria injusto contar como win/loss).
    const closedOps = filtered.filter(
      (t) => t.closedAt && t.side !== 'DIVIDEND' && t.side !== 'JCP',
    )
    const winners = closedOps.filter((t) => (t.resultAmount ?? 0) > 0)
    const losers = closedOps.filter((t) => (t.resultAmount ?? 0) < 0)
    const wins = winners.length
    const losses = losers.length

    const winRate = wins + losses > 0 ? wins / (wins + losses) : 0

    const grossProfit = winners.reduce((s, t) => s + (t.resultAmount ?? 0), 0)
    const grossLoss = Math.abs(losers.reduce((s, t) => s + (t.resultAmount ?? 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0)

    const avgWin = wins > 0 ? grossProfit / wins : 0
    const avgLoss = losses > 0 ? -grossLoss / losses : 0

    const bestTrade = winners.length
      ? winners.reduce((b, t) => ((t.resultAmount ?? 0) > (b.resultAmount ?? 0) ? t : b))
      : null
    const worstTrade = losers.length
      ? losers.reduce((w, t) => ((t.resultAmount ?? 0) < (w.resultAmount ?? 0) ? t : w))
      : null

    // ============ Margin (futures) ============
    const futuresTrades = filtered.filter((t) => t.marginUsed != null)
    const avgMargin = futuresTrades.length
      ? futuresTrades.reduce((s, t) => s + (t.marginUsed ?? 0), 0) / futuresTrades.length
      : null

    // ============ Daily series ============
    // Agrupa trades por dia. Pra trades fechados usa data de close; pra
    // dividendos, data do credito; pra POSICOES ABERTAS, marca o dia de
    // HOJE — porque o resultAmount delas e mark-to-market AGORA, nao na
    // data de abertura. Marcar na openedAt distorce a curva (uma posicao
    // de 2021 jogaria todo o lucro/prejuizo unrealized no extremo
    // esquerdo do grafico).
    const todayIso = new Date(now).toISOString().slice(0, 10)
    const dailyMap = new Map<string, { pnl: number; trades: number }>()
    for (const t of filtered) {
      const isOpen = !t.closedAt && t.side !== 'DIVIDEND' && t.side !== 'JCP'
      const ref = isOpen ? todayIso : (t.closedAt ?? t.openedAt)
      const date = ref.slice(0, 10) // YYYY-MM-DD
      const cur = dailyMap.get(date) || { pnl: 0, trades: 0 }
      cur.pnl += t.resultAmount ?? 0
      cur.trades += 1
      dailyMap.set(date, cur)
    }
    const dailySeries: DailyPnLPoint[] = Array.from(dailyMap.entries())
      .map(([date, v]) => ({ date, pnl: v.pnl, trades: v.trades }))
      .sort((a, b) => a.date.localeCompare(b.date))

    let acc = 0
    const cumulativeSeries: DailyPnLPoint[] = dailySeries.map((p) => {
      acc += p.pnl
      return { date: p.date, pnl: acc, trades: p.trades }
    })

    // ============ By kind ============
    const byKind: Record<TradeKind, { count: number; pnl: number }> = {
      day: { count: 0, pnl: 0 },
      swing: { count: 0, pnl: 0 },
      hold: { count: 0, pnl: 0 },
    }
    for (const t of filtered) {
      byKind[t.kind].count += 1
      byKind[t.kind].pnl += t.resultAmount ?? 0
    }

    // ============ By instrument ============
    const byInstrument: Record<string, { count: number; pnl: number; volume: number }> = {}
    for (const t of filtered) {
      const k = t.instrumentType
      if (!byInstrument[k]) byInstrument[k] = { count: 0, pnl: 0, volume: 0 }
      byInstrument[k].count += 1
      byInstrument[k].pnl += t.resultAmount ?? 0
      byInstrument[k].volume += t.volume
    }

    return {
      totalPnL,
      realizedPnL,
      unrealizedPnL,
      incomePnL,
      closedTradesCount,
      openTradesCount,
      wins,
      losses,
      winRate,
      profitFactor,
      avgWin,
      avgLoss,
      bestTrade,
      worstTrade,
      totalVolume,
      avgMargin,
      dailySeries,
      cumulativeSeries,
      byKind,
      byInstrument,
      trades: filtered,
    }
  })

  return { stats }
}
