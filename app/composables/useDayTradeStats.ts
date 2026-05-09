/**
 * useDayTradeStats — agrega trades operacionais (kind='day') em
 * metricas especificas do trader intraday.
 *
 * Janelas suportadas:
 *   - 'hoje'   → so o dia atual (00:00 a 23:59 local). Granularidade
 *                hora. Vazio comum (mercado fechado, dia sem trade).
 *   - 'semana' → ultimos 7 dias corridos. Granularidade dia.
 *   - 'mes'    → ultimos 30 dias corridos. Granularidade dia.
 *
 * Computa metricas que so fazem sentido pro day trader:
 *   - P&L do dia/janela (R$ liquido)
 *   - Win rate / Profit factor / R$/trade
 *   - Drawdown intraday (peak-to-trough da curva acumulada)
 *   - Streak atual (sequencia de wins ou losses)
 *   - Hot zones por hora do pregao (10h-17h)
 *   - Equity intraday (P&L acumulado a cada trade ordenado por close)
 *
 * Pure function de trades+period → stats. Substituido por chamada
 * real ao backend `/api/portfolio/results?style=day` na Fase 3.
 */
import type { MockTrade } from './useMockTrades'

export type DayTradePeriod = 'hoje' | 'semana' | 'mes'

export interface IntradayPoint {
  /** Timestamp do close (ISO). */
  iso: string
  /** P&L acumulado APOS este trade. */
  cumulativePnl: number
  /** Resultado isolado deste trade. */
  tradePnl: number
  ticker: string
}

export interface HourBucket {
  /** 10..17 (hora do pregao B3). */
  hour: number
  count: number
  wins: number
  losses: number
  pnl: number
  winRate: number
}

export interface RMultipleBucket {
  /** Faixa: '<-3R', '-3R', '-2R', '-1R', '0R', '+1R', '+2R', '+3R', '>+3R'. */
  label: string
  /** Valor central da faixa (-4 / -3 / -2 / -1 / 0 / 1 / 2 / 3 / 4). */
  bucket: number
  count: number
  /** Direcao agregada da faixa: positive | negative | neutral. */
  side: 'positive' | 'negative' | 'neutral'
}

export interface ByTickerBucket {
  ticker: string
  count: number
  pnl: number
  /** % do |pnl| sobre |total| da janela. */
  weightPct: number
}

export interface DayTradeStats {
  /** Trades day-trade fechados na janela, ordenados por closedAt asc. */
  trades: MockTrade[]
  /** P&L total da janela em R$. */
  totalPnL: number
  /** Numero de trades. */
  count: number
  /** wins / (wins+losses). 0-1. */
  winRate: number
  wins: number
  losses: number
  /** Soma R$ ganhos / |soma R$ perdidos|. */
  profitFactor: number
  avgWin: number
  avgLoss: number
  /** Maior trade vencedor (mock trade obj). */
  bestTrade: MockTrade | null
  /** Maior trade perdedor (mock trade obj). */
  worstTrade: MockTrade | null
  /** Media R$ por trade. */
  avgPerTrade: number
  /** Maximo drawdown da curva cumulativa (peak-to-trough). */
  maxDrawdown: number
  /** Tempo medio em operacao em segundos. */
  avgHoldingSeconds: number
  /** Sequencia atual: positivo se vencedoras seguidas, negativo se
   *  perdedoras seguidas, zero quando acabou de virar. */
  currentStreak: number
  /** Maior sequencia de vencedoras na janela. */
  longestWinStreak: number
  /** Maior sequencia de perdedoras na janela. */
  longestLossStreak: number
  /** Equity curve por trade (ordenado por close asc). */
  equityCurve: IntradayPoint[]
  /** Trades agrupados por hora (10..17). */
  hourBuckets: HourBucket[]
  /** Distribuicao de R-multiples (cada trade em qual faixa de R caiu). */
  rMultipleBuckets: RMultipleBucket[]
  /** Volume total operado (notional somado). */
  totalVolume: number
  /** Margem media usada (futures) — null se nao houver futures. */
  avgMargin: number | null
  /** Trades agrupados por ticker (top 8 por |pnl|, restante em "Outros"). */
  byTicker: ByTickerBucket[]
}

function startMsForPeriod(period: DayTradePeriod, now: number): number {
  const day = 24 * 60 * 60 * 1000
  if (period === 'hoje') {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  if (period === 'semana') return now - 7 * day
  return now - 30 * day
}

export function useDayTradeStats(
  trades: MockTrade[] | Ref<MockTrade[]>,
  period: DayTradePeriod | Ref<DayTradePeriod>,
) {
  const tradesRef = isRef(trades) ? trades : ref(trades)
  const periodRef = isRef(period) ? period : ref(period)

  const stats = computed<DayTradeStats>(() => {
    const now = Date.now()
    const startMs = startMsForPeriod(periodRef.value, now)

    // Filtra: kind='day', closedAt nao null, dentro da janela.
    const filtered = tradesRef.value
      .filter((t) => t.kind === 'day' && t.closedAt && t.side !== 'DIVIDEND' && t.side !== 'JCP')
      .filter((t) => {
        const closeMs = new Date(t.closedAt!).getTime()
        return closeMs >= startMs && closeMs <= now
      })
      .sort((a, b) =>
        new Date(a.closedAt!).getTime() - new Date(b.closedAt!).getTime(),
      )

    // ========== Wins / losses / profit factor ==========
    const winners = filtered.filter((t) => (t.resultAmount ?? 0) > 0)
    const losers = filtered.filter((t) => (t.resultAmount ?? 0) < 0)
    const wins = winners.length
    const losses = losers.length
    const winRate = wins + losses > 0 ? wins / (wins + losses) : 0

    const grossProfit = winners.reduce((s, t) => s + (t.resultAmount ?? 0), 0)
    const grossLoss = Math.abs(losers.reduce((s, t) => s + (t.resultAmount ?? 0), 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0)
    const avgWin = wins > 0 ? grossProfit / wins : 0
    const avgLoss = losses > 0 ? -grossLoss / losses : 0

    const totalPnL = filtered.reduce((s, t) => s + (t.resultAmount ?? 0), 0)
    const avgPerTrade = filtered.length ? totalPnL / filtered.length : 0

    const bestTrade = winners.length
      ? winners.reduce((b, t) => ((t.resultAmount ?? 0) > (b.resultAmount ?? 0) ? t : b))
      : null
    const worstTrade = losers.length
      ? losers.reduce((w, t) => ((t.resultAmount ?? 0) < (w.resultAmount ?? 0) ? t : w))
      : null

    // ========== Equity curve + drawdown ==========
    const equityCurve: IntradayPoint[] = []
    let acc = 0
    let peak = 0
    let maxDrawdown = 0
    for (const t of filtered) {
      acc += t.resultAmount ?? 0
      if (acc > peak) peak = acc
      const dd = peak - acc // distancia do pico (sempre >= 0)
      if (dd > maxDrawdown) maxDrawdown = dd
      equityCurve.push({
        iso: t.closedAt!,
        cumulativePnl: acc,
        tradePnl: t.resultAmount ?? 0,
        ticker: t.ticker,
      })
    }

    // ========== Holding average ==========
    const avgHoldingSeconds = filtered.length
      ? filtered.reduce((s, t) => s + t.holdingSeconds, 0) / filtered.length
      : 0

    // ========== Streaks ==========
    let currentStreak = 0
    let longestWinStreak = 0
    let longestLossStreak = 0
    let curWinRun = 0
    let curLossRun = 0
    for (const t of filtered) {
      const r = t.resultAmount ?? 0
      if (r > 0) {
        curWinRun += 1
        curLossRun = 0
        if (curWinRun > longestWinStreak) longestWinStreak = curWinRun
      } else if (r < 0) {
        curLossRun += 1
        curWinRun = 0
        if (curLossRun > longestLossStreak) longestLossStreak = curLossRun
      }
    }
    if (curWinRun > 0) currentStreak = curWinRun
    else if (curLossRun > 0) currentStreak = -curLossRun

    // ========== Hour buckets (10h-17h) ==========
    const buckets: Record<number, HourBucket> = {}
    for (let h = 10; h <= 17; h++) {
      buckets[h] = { hour: h, count: 0, wins: 0, losses: 0, pnl: 0, winRate: 0 }
    }
    for (const t of filtered) {
      const h = new Date(t.closedAt!).getHours()
      const bucket = buckets[h]
      if (!bucket) continue
      bucket.count += 1
      bucket.pnl += t.resultAmount ?? 0
      const r = t.resultAmount ?? 0
      if (r > 0) bucket.wins += 1
      else if (r < 0) bucket.losses += 1
    }
    const hourBuckets = Object.values(buckets).map((b) => {
      const total = b.wins + b.losses
      return { ...b, winRate: total > 0 ? b.wins / total : 0 }
    })

    // ========== Volume + margin ==========
    const totalVolume = filtered.reduce((s, t) => s + t.volume, 0)
    const futures = filtered.filter((t) => t.marginUsed != null)
    const avgMargin = futures.length
      ? futures.reduce((s, t) => s + (t.marginUsed ?? 0), 0) / futures.length
      : null

    // ========== R-multiple buckets ==========
    // Sem dado real de risk-per-trade, aproximamos: 1R = avgLoss
    // (magnitude). Cada trade vira um numero R = pnl / |avgLoss|. Faixas:
    //   <-3R | -3R | -2R | -1R | 0R | +1R | +2R | +3R | >+3R
    // Bucket "0R" abriga trades de impacto desprezivel (|R| < 0.5).
    const rUnit = Math.abs(avgLoss) || 1
    const rBuckets: RMultipleBucket[] = [
      { label: '<−3R', bucket: -4, count: 0, side: 'negative' },
      { label: '−3R', bucket: -3, count: 0, side: 'negative' },
      { label: '−2R', bucket: -2, count: 0, side: 'negative' },
      { label: '−1R', bucket: -1, count: 0, side: 'negative' },
      { label: '0R', bucket: 0, count: 0, side: 'neutral' },
      { label: '+1R', bucket: 1, count: 0, side: 'positive' },
      { label: '+2R', bucket: 2, count: 0, side: 'positive' },
      { label: '+3R', bucket: 3, count: 0, side: 'positive' },
      { label: '>+3R', bucket: 4, count: 0, side: 'positive' },
    ]
    for (const t of filtered) {
      const r = (t.resultAmount ?? 0) / rUnit
      let bucketIdx: number
      if (r < -3.5) bucketIdx = 0
      else if (r < -2.5) bucketIdx = 1
      else if (r < -1.5) bucketIdx = 2
      else if (r < -0.5) bucketIdx = 3
      else if (r <= 0.5) bucketIdx = 4
      else if (r <= 1.5) bucketIdx = 5
      else if (r <= 2.5) bucketIdx = 6
      else if (r <= 3.5) bucketIdx = 7
      else bucketIdx = 8
      rBuckets[bucketIdx].count += 1
    }

    // ========== By-ticker breakdown ==========
    const tickerMap = new Map<string, { count: number; pnl: number }>()
    for (const t of filtered) {
      const cur = tickerMap.get(t.ticker) || { count: 0, pnl: 0 }
      cur.count += 1
      cur.pnl += t.resultAmount ?? 0
      tickerMap.set(t.ticker, cur)
    }
    const totalAbsPnl = Array.from(tickerMap.values()).reduce(
      (s, v) => s + Math.abs(v.pnl),
      0,
    ) || 1
    const byTickerSorted: ByTickerBucket[] = Array.from(tickerMap.entries())
      .map(([ticker, v]) => ({
        ticker,
        count: v.count,
        pnl: v.pnl,
        weightPct: (Math.abs(v.pnl) / totalAbsPnl) * 100,
      }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))

    // Cap em 8 tickers + "Outros" se sobrar
    const TICKER_LIMIT = 8
    const byTicker: ByTickerBucket[] =
      byTickerSorted.length <= TICKER_LIMIT
        ? byTickerSorted
        : (() => {
            const top = byTickerSorted.slice(0, TICKER_LIMIT - 1)
            const rest = byTickerSorted.slice(TICKER_LIMIT - 1)
            const restPnl = rest.reduce((s, r) => s + r.pnl, 0)
            const restCount = rest.reduce((s, r) => s + r.count, 0)
            const restWeight = rest.reduce((s, r) => s + r.weightPct, 0)
            return [
              ...top,
              { ticker: 'Outros', count: restCount, pnl: restPnl, weightPct: restWeight },
            ]
          })()

    return {
      trades: filtered,
      totalPnL,
      count: filtered.length,
      winRate,
      wins,
      losses,
      profitFactor,
      avgWin,
      avgLoss,
      bestTrade,
      worstTrade,
      avgPerTrade,
      maxDrawdown,
      avgHoldingSeconds,
      currentStreak,
      longestWinStreak,
      longestLossStreak,
      equityCurve,
      hourBuckets,
      rMultipleBuckets: rBuckets,
      totalVolume,
      avgMargin,
      byTicker,
    }
  })

  return { stats }
}

/**
 * Detecta se o mercado B3 esta aberto agora. Pregao regular: seg-sex,
 * 10h-17h horario de Brasilia. Aproximacao client-side (nao considera
 * after-market, leiloes, feriados — esses casos especiais entram
 * quando o backend trouxer o calendario oficial da B3).
 */
export function isMarketOpen(now: Date = new Date()): boolean {
  const dow = now.getDay() // 0 dom, 6 sab
  if (dow === 0 || dow === 6) return false
  const hour = now.getHours()
  const minute = now.getMinutes()
  const after10 = hour > 10 || (hour === 10 && minute >= 0)
  const before17 = hour < 17
  return after10 && before17
}
