/**
 * useMockTrades — gerador deterministico de trades pra desenvolvimento
 * da pagina /wallet/resultado antes do backend estar pronto.
 *
 * Gera ~80 trades distribuidos nos ultimos 365 dias com:
 *   - mix realista de holding periods (day/swing/hold)
 *   - mix de instrumentos (acoes, FIIs, BDRs, ETFs, mini-indice WIN)
 *   - P&L distribuido com positive skew (mais ganhadores pequenos +
 *     poucos perdedores maiores, padrao de trader razoavel)
 *   - clusters de trades em dias mais ativos (segunda/quarta/sexta)
 *
 * Substituido por chamada real ao backend `/api/portfolio/trades`
 * quando a Fase 3 do plano (backend Pluggy + portfolio_trades table)
 * estiver no ar.
 */

export type TradeKind = 'day' | 'swing' | 'hold'
export type TradeSide = 'BUY' | 'SELL' | 'DIVIDEND' | 'JCP'
export type InstrumentType = 'EQUITY' | 'REIT' | 'ETF' | 'BDR' | 'TREASURY' | 'FUTURES'

export interface MockTrade {
  /** ID estavel pra v-for keying. Formato `mock-{n}`. */
  id: string
  /** ISO timestamp da entrada. */
  openedAt: string
  /** ISO timestamp do exit (null se posicao aberta). */
  closedAt: string | null
  ticker: string
  name: string
  side: TradeSide
  instrumentType: InstrumentType
  /** Multiplicador do contrato. 1 pra acoes, 0.20 pra WIN, 5 pra WDO. */
  contractMultiplier: number
  quantity: number
  /** Preco de entrada. */
  openPrice: number
  /** Preco de saida (null se aberto). */
  closePrice: number | null
  /** P&L liquido em R$. Null se aberto/dividendo. */
  resultAmount: number | null
  /** Pontos ganhos pra futuros. Null pra acoes. */
  resultPoints: number | null
  /** Notional = quantity * openPrice * contractMultiplier (exposicao). */
  notional: number
  /** Margem usada (futuros). Null pra spot/equity. */
  marginUsed: number | null
  /** Holding period em segundos. 0 pra trades abertos ou dividendos. */
  holdingSeconds: number
  /** Classificacao automatica pelo holding period. */
  kind: TradeKind
  /** Volume operado em R$ (== notional, mantido pra clareza). */
  volume: number
  fees: number
}

/** PRNG deterministico (mulberry32) — mesmo seed = mesma sequencia. */
function rng(seed: number) {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const UNIVERSE: Array<{ ticker: string; name: string; instrument: InstrumentType; basePrice: number; mult: number }> = [
  { ticker: 'PETR4', name: 'Petrobras PN', instrument: 'EQUITY', basePrice: 38.42, mult: 1 },
  { ticker: 'VALE3', name: 'Vale ON', instrument: 'EQUITY', basePrice: 64.18, mult: 1 },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', instrument: 'EQUITY', basePrice: 32.95, mult: 1 },
  { ticker: 'BBDC4', name: 'Bradesco PN', instrument: 'EQUITY', basePrice: 14.22, mult: 1 },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', instrument: 'EQUITY', basePrice: 28.71, mult: 1 },
  { ticker: 'WEGE3', name: 'WEG ON', instrument: 'EQUITY', basePrice: 52.04, mult: 1 },
  { ticker: 'MGLU3', name: 'Magazine Luiza ON', instrument: 'EQUITY', basePrice: 8.43, mult: 1 },
  { ticker: 'B3SA3', name: 'B3 ON', instrument: 'EQUITY', basePrice: 12.98, mult: 1 },
  { ticker: 'KNRI11', name: 'Kinea Renda Imobiliária', instrument: 'REIT', basePrice: 158.20, mult: 1 },
  { ticker: 'HGLG11', name: 'Cshg Logística', instrument: 'REIT', basePrice: 165.78, mult: 1 },
  { ticker: 'MXRF11', name: 'Maxi Renda', instrument: 'REIT', basePrice: 10.12, mult: 1 },
  { ticker: 'IVVB11', name: 'iShares S&P 500', instrument: 'ETF', basePrice: 348.66, mult: 1 },
  { ticker: 'BOVA11', name: 'iShares Ibovespa', instrument: 'ETF', basePrice: 124.30, mult: 1 },
  { ticker: 'AAPL34', name: 'Apple BDR', instrument: 'BDR', basePrice: 78.91, mult: 1 },
  { ticker: 'MSFT34', name: 'Microsoft BDR', instrument: 'BDR', basePrice: 84.55, mult: 1 },
  { ticker: 'WINM26', name: 'Mini Índice (Junho 26)', instrument: 'FUTURES', basePrice: 130_450, mult: 0.20 },
  { ticker: 'WDOM26', name: 'Mini Dólar (Junho 26)', instrument: 'FUTURES', basePrice: 5.482, mult: 50_000 * 0.0001 },
]

function pickFrom<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)]!
}

function randomInRange(r: () => number, min: number, max: number): number {
  return min + r() * (max - min)
}

/**
 * Gera ~80 trades nos ultimos 365 dias. Mix:
 *  - 35% day trade (intraday close, predominantemente WIN/PETR4/VALE3)
 *  - 35% swing (1-30d)
 *  - 25% hold (>30d, posicoes ainda abertas em sua maioria)
 *  - 5% dividendos/JCP
 */
export function useMockTrades(): { trades: MockTrade[] } {
  const r = rng(20260509)
  const now = Date.now()
  const yearMs = 365 * 24 * 60 * 60 * 1000
  const out: MockTrade[] = []

  let id = 0
  function nextId(): string {
    id += 1
    return `mock-${id}`
  }

  // ============ Day trades (~28) ============
  // Distribuidos com mais densidade nas ultimas 4 semanas (day trader
  // ativo recente). WIN tem maior frequencia de aparicao.
  for (let i = 0; i < 28; i++) {
    // Pondera ultimas 4 semanas (60% dos trades) vs 11 meses anteriores (40%)
    const recent = r() < 0.6
    const ageMs = recent
      ? r() * 28 * 24 * 60 * 60 * 1000
      : 28 * 24 * 60 * 60 * 1000 + r() * (yearMs - 28 * 24 * 60 * 60 * 1000)

    const openedAt = new Date(now - ageMs)
    // Pula fim de semana (dom=0, sab=6)
    const dow = openedAt.getDay()
    if (dow === 0) openedAt.setDate(openedAt.getDate() + 1)
    if (dow === 6) openedAt.setDate(openedAt.getDate() + 2)
    // Hora pregao (10h-17h)
    openedAt.setHours(10 + Math.floor(r() * 7), Math.floor(r() * 60), Math.floor(r() * 60), 0)

    // 50% WIN, 25% PETR4, 15% VALE3, 10% ITUB4
    const slot = r()
    const inst = slot < 0.5
      ? UNIVERSE.find((u) => u.ticker === 'WINM26')!
      : slot < 0.75
        ? UNIVERSE.find((u) => u.ticker === 'PETR4')!
        : slot < 0.90
          ? UNIVERSE.find((u) => u.ticker === 'VALE3')!
          : UNIVERSE.find((u) => u.ticker === 'ITUB4')!

    // Holding 5min-180min
    const holdMin = 5 + Math.floor(r() * 175)
    const closedAt = new Date(openedAt.getTime() + holdMin * 60 * 1000)

    // Win rate ~ 58% nesse mock
    const isWin = r() < 0.58
    const moveFraction = randomInRange(r, 0.0008, 0.006) // 0.08% - 0.6%
    const direction = isWin ? 1 : -1
    const openPrice = inst.basePrice * (1 + (r() - 0.5) * 0.04)
    const closePrice = openPrice * (1 + moveFraction * direction)

    let qty: number
    if (inst.instrument === 'FUTURES') {
      qty = 1 + Math.floor(r() * 4) // 1-4 contratos
    } else {
      qty = 100 + Math.floor(r() * 400) // 100-500 acoes
    }

    const points = inst.instrument === 'FUTURES'
      ? Math.round((closePrice - openPrice))
      : null

    const grossResult = (closePrice - openPrice) * qty * inst.mult
    const fees = inst.instrument === 'FUTURES'
      ? 0.50 * qty * 2 // R$ 0,50 por contrato (entrada+saida)
      : qty * openPrice * 0.0003 + 5.50 // ~3 bps + 5.50 corretagem
    const netResult = grossResult - fees

    const notional = qty * openPrice * inst.mult
    const margin = inst.instrument === 'FUTURES'
      ? qty * 80 // R$ 80/contrato pra WIN intraday (margem)
      : null

    out.push({
      id: nextId(),
      openedAt: openedAt.toISOString(),
      closedAt: closedAt.toISOString(),
      ticker: inst.ticker,
      name: inst.name,
      side: 'BUY',
      instrumentType: inst.instrument,
      contractMultiplier: inst.mult,
      quantity: qty,
      openPrice: Number(openPrice.toFixed(inst.instrument === 'FUTURES' ? 0 : 2)),
      closePrice: Number(closePrice.toFixed(inst.instrument === 'FUTURES' ? 0 : 2)),
      resultAmount: Number(netResult.toFixed(2)),
      resultPoints: points,
      notional: Number(notional.toFixed(2)),
      marginUsed: margin,
      holdingSeconds: holdMin * 60,
      kind: 'day',
      volume: Number(notional.toFixed(2)),
      fees: Number(fees.toFixed(2)),
    })
  }

  // ============ Swing trades (~28) ============
  for (let i = 0; i < 28; i++) {
    const ageMs = randomInRange(r, 1 * 24 * 60 * 60 * 1000, yearMs * 0.7)
    const openedAt = new Date(now - ageMs)
    openedAt.setHours(10 + Math.floor(r() * 7), Math.floor(r() * 60), 0, 0)

    // Holding 1-30 dias
    const holdDays = 1 + Math.floor(r() * 29)
    const closedAt = new Date(openedAt.getTime() + holdDays * 24 * 60 * 60 * 1000)
    if (closedAt.getTime() > now) continue // pula trades que cairiam no futuro

    // Universo swing: acoes blue chip + FIIs, sem futuros
    const swingUniverse = UNIVERSE.filter((u) => u.instrument !== 'FUTURES')
    const inst = pickFrom(swingUniverse, r)

    // Win rate swing ~ 52%, com magnitude maior que day
    const isWin = r() < 0.52
    const moveFraction = randomInRange(r, 0.015, 0.08) // 1.5% - 8%
    const direction = isWin ? 1 : -1
    const openPrice = inst.basePrice * (1 + (r() - 0.5) * 0.10)
    const closePrice = openPrice * (1 + moveFraction * direction)

    const qty = inst.basePrice > 100
      ? 5 + Math.floor(r() * 30)
      : 50 + Math.floor(r() * 250)

    const grossResult = (closePrice - openPrice) * qty
    const fees = qty * openPrice * 0.0003 + 5.50
    const netResult = grossResult - fees

    out.push({
      id: nextId(),
      openedAt: openedAt.toISOString(),
      closedAt: closedAt.toISOString(),
      ticker: inst.ticker,
      name: inst.name,
      side: 'BUY',
      instrumentType: inst.instrument,
      contractMultiplier: 1,
      quantity: qty,
      openPrice: Number(openPrice.toFixed(2)),
      closePrice: Number(closePrice.toFixed(2)),
      resultAmount: Number(netResult.toFixed(2)),
      resultPoints: null,
      notional: Number((qty * openPrice).toFixed(2)),
      marginUsed: null,
      holdingSeconds: holdDays * 24 * 60 * 60,
      kind: 'swing',
      volume: Number((qty * openPrice).toFixed(2)),
      fees: Number(fees.toFixed(2)),
    })
  }

  // ============ Hold trades (~16, alguns ainda abertos) ============
  for (let i = 0; i < 16; i++) {
    const ageMs = randomInRange(r, 30 * 24 * 60 * 60 * 1000, yearMs)
    const openedAt = new Date(now - ageMs)

    const holdUniverse = UNIVERSE.filter((u) => u.instrument !== 'FUTURES')
    const inst = pickFrom(holdUniverse, r)

    // 50% ainda aberto, 50% fechado com ganho/perda significativo
    const stillOpen = r() < 0.5
    const openPrice = inst.basePrice * (1 + (r() - 0.5) * 0.18)
    const qty = inst.basePrice > 100
      ? 10 + Math.floor(r() * 50)
      : 100 + Math.floor(r() * 500)

    if (stillOpen) {
      // Posicao em aberto — current value via inst.basePrice atual
      const currentPrice = inst.basePrice * (1 + (r() - 0.4) * 0.30)
      const unrealized = (currentPrice - openPrice) * qty
      out.push({
        id: nextId(),
        openedAt: openedAt.toISOString(),
        closedAt: null,
        ticker: inst.ticker,
        name: inst.name,
        side: 'BUY',
        instrumentType: inst.instrument,
        contractMultiplier: 1,
        quantity: qty,
        openPrice: Number(openPrice.toFixed(2)),
        closePrice: Number(currentPrice.toFixed(2)),
        resultAmount: Number(unrealized.toFixed(2)),
        resultPoints: null,
        notional: Number((qty * openPrice).toFixed(2)),
        marginUsed: null,
        holdingSeconds: Math.floor(ageMs / 1000),
        kind: 'hold',
        volume: Number((qty * openPrice).toFixed(2)),
        fees: 0,
      })
    } else {
      const moveFraction = randomInRange(r, 0.05, 0.40) // 5% - 40%
      const isWin = r() < 0.65 // hold tem WR melhor (mercado tende a subir)
      const closePrice = openPrice * (1 + moveFraction * (isWin ? 1 : -1))
      const closedAt = new Date(openedAt.getTime() + ageMs * 0.85) // fechou ~85% do periodo

      const grossResult = (closePrice - openPrice) * qty
      const fees = qty * openPrice * 0.0003 * 2 + 11 // entrada + saida
      const netResult = grossResult - fees

      out.push({
        id: nextId(),
        openedAt: openedAt.toISOString(),
        closedAt: closedAt.toISOString(),
        ticker: inst.ticker,
        name: inst.name,
        side: 'BUY',
        instrumentType: inst.instrument,
        contractMultiplier: 1,
        quantity: qty,
        openPrice: Number(openPrice.toFixed(2)),
        closePrice: Number(closePrice.toFixed(2)),
        resultAmount: Number(netResult.toFixed(2)),
        resultPoints: null,
        notional: Number((qty * openPrice).toFixed(2)),
        marginUsed: null,
        holdingSeconds: Math.floor((closedAt.getTime() - openedAt.getTime()) / 1000),
        kind: 'hold',
        volume: Number((qty * openPrice).toFixed(2)),
        fees: Number(fees.toFixed(2)),
      })
    }
  }

  // ============ Dividendos/JCP (~5) ============
  for (let i = 0; i < 5; i++) {
    const ageMs = randomInRange(r, 7 * 24 * 60 * 60 * 1000, yearMs * 0.9)
    const date = new Date(now - ageMs)

    const dividendUniverse = UNIVERSE.filter((u) =>
      ['EQUITY', 'REIT', 'ETF'].includes(u.instrument),
    )
    const inst = pickFrom(dividendUniverse, r)
    const qty = 100 + Math.floor(r() * 500)
    const ratePerShare = inst.basePrice * randomInRange(r, 0.005, 0.025) // 0.5%-2.5% DY equivalent
    const amount = ratePerShare * qty
    const isJCP = r() < 0.3

    out.push({
      id: nextId(),
      openedAt: date.toISOString(),
      closedAt: date.toISOString(),
      ticker: inst.ticker,
      name: inst.name,
      side: isJCP ? 'JCP' : 'DIVIDEND',
      instrumentType: inst.instrument,
      contractMultiplier: 1,
      quantity: qty,
      openPrice: Number(ratePerShare.toFixed(4)),
      closePrice: Number(ratePerShare.toFixed(4)),
      resultAmount: Number(amount.toFixed(2)),
      resultPoints: null,
      notional: 0,
      marginUsed: null,
      holdingSeconds: 0,
      kind: 'hold',
      volume: 0,
      fees: 0,
    })
  }

  // Ordena cronologicamente desc (mais recente primeiro)
  out.sort((a, b) => b.openedAt.localeCompare(a.openedAt))

  return { trades: out }
}

/**
 * Helpers de auto-classificacao por holding period — usados quando
 * trades vem do backend sem `kind` setado. A regra (definida no
 * design) e:
 *   < 1 dia       → day
 *   1d a 30d      → swing
 *   > 30d         → hold
 */
export function classifyByHolding(holdingSeconds: number): TradeKind {
  if (holdingSeconds <= 0) return 'hold' // dividendos / posicoes abertas indefinidas
  if (holdingSeconds < 24 * 60 * 60) return 'day'
  if (holdingSeconds < 30 * 24 * 60 * 60) return 'swing'
  return 'hold'
}
