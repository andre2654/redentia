// Dados mockados pras preview pages de Wallet (V1-V5).
// Representa um cenário de carteira realista: patrimônio R$ 487 mil,
// 12 posições espalhadas em ações/FIIs/ETF, P&L positivo, 47 trades
// no histórico (mix swing + day-trade).
//
// Usado pelas 5 preview pages em /wallet-preview/.

export type WalletPosition = {
  ticker: string
  name: string
  type: 'STOCK' | 'REIT' | 'ETF' | 'BDR' | 'CRYPTO' | 'TREASURY' | 'FIXED'
  sector: string
  qty: number
  avgPrice: number
  currentPrice: number
  value: number          // qty * currentPrice
  weight: number         // % da carteira
  pnl: number            // value - (qty * avgPrice)
  pnlPct: number
  dividendYield: number
  sparkline: number[]
}

export type WalletTrade = {
  id: string
  date: string           // ISO
  ticker: string
  side: 'buy' | 'sell'
  qty: number
  price: number
  volume: number         // qty * price
  result?: number        // P&L da venda (só pra side=sell)
  style: 'day' | 'swing' | 'hold'
  enterTime?: string     // só pra day-trade (intraday)
  exitTime?: string
}

export type WalletGoal = {
  label: string
  target: number
  current: number
  pct: number
  deadline: string
}

export type WalletDividendEvent = {
  date: string
  ticker: string
  type: 'dividendo' | 'jcp' | 'rendimento'
  amount: number
  status: 'previsto' | 'recebido'
}

export function useWalletMockData() {
  const totalEquity = 487_320.45
  const totalPnl = 42_180.30
  const totalPnlPct = 9.47
  const dividendForecast12m = 28_540.00
  const portfolioScore = 78
  const lastUpdated = '30 de abril de 2026'

  const positions: WalletPosition[] = [
    { ticker: 'PETR4',  name: 'Petrobras',          type: 'STOCK', sector: 'Petróleo',       qty: 1200, avgPrice: 28.50, currentPrice: 32.15, value: 38_580.00, weight: 7.92,  pnl: 4_380.00,  pnlPct: 12.81, dividendYield: 7.2,  sparkline: [28, 29.5, 30.8, 30.2, 31, 31.8, 32.15] },
    { ticker: 'TAEE11', name: 'Taesa',              type: 'STOCK', sector: 'Energia',        qty: 1500, avgPrice: 30.20, currentPrice: 33.21, value: 49_815.00, weight: 10.22, pnl: 4_515.00,  pnlPct: 9.97,  dividendYield: 12.4, sparkline: [30, 31, 30.5, 32, 31.8, 32.5, 33.21] },
    { ticker: 'ITUB4',  name: 'Itaú Unibanco',      type: 'STOCK', sector: 'Bancos',         qty: 2000, avgPrice: 25.10, currentPrice: 28.45, value: 56_900.00, weight: 11.68, pnl: 6_700.00,  pnlPct: 13.35, dividendYield: 8.7,  sparkline: [25.5, 26, 26.8, 27.2, 27.5, 28, 28.45] },
    { ticker: 'BBAS3',  name: 'Banco do Brasil',    type: 'STOCK', sector: 'Bancos',         qty: 800,  avgPrice: 38.00, currentPrice: 45.10, value: 36_080.00, weight: 7.40,  pnl: 5_680.00,  pnlPct: 18.68, dividendYield: 8.2,  sparkline: [38, 40, 42, 41, 43, 44.5, 45.10] },
    { ticker: 'VALE3',  name: 'Vale',               type: 'STOCK', sector: 'Mineração',      qty: 700,  avgPrice: 64.00, currentPrice: 58.40, value: 40_880.00, weight: 8.39,  pnl: -3_920.00, pnlPct: -8.75, dividendYield: 9.5,  sparkline: [64, 62, 60, 59, 58.5, 58.2, 58.40] },
    { ticker: 'HGLG11', name: 'CSHG Logística',     type: 'REIT',  sector: 'FII Logístico',  qty: 400,  avgPrice: 158.00, currentPrice: 165.20, value: 66_080.00, weight: 13.56, pnl: 2_880.00,  pnlPct: 4.56,  dividendYield: 9.1,  sparkline: [158, 160, 162, 161, 163, 164, 165.20] },
    { ticker: 'MXRF11', name: 'Maxi Renda',         type: 'REIT',  sector: 'FII Papel',      qty: 4000, avgPrice: 9.80, currentPrice: 10.30, value: 41_200.00, weight: 8.46,  pnl: 2_000.00,  pnlPct: 5.10,  dividendYield: 11.8, sparkline: [9.8, 9.9, 10.1, 10.0, 10.2, 10.25, 10.30] },
    { ticker: 'KNRI11', name: 'Kinea Renda Imob.',  type: 'REIT',  sector: 'FII Híbrido',    qty: 200,  avgPrice: 130.00, currentPrice: 142.80, value: 28_560.00, weight: 5.86,  pnl: 2_560.00,  pnlPct: 9.85,  dividendYield: 8.4,  sparkline: [130, 132, 135, 138, 140, 141, 142.80] },
    { ticker: 'IVVB11', name: 'iShares S&P 500',    type: 'ETF',   sector: 'Internacional',  qty: 300,  avgPrice: 280.00, currentPrice: 312.50, value: 93_750.00, weight: 19.24, pnl: 9_750.00,  pnlPct: 11.61, dividendYield: 1.8,  sparkline: [280, 290, 300, 305, 308, 310, 312.50] },
    { ticker: 'ABEV3',  name: 'Ambev',              type: 'STOCK', sector: 'Bebidas',        qty: 1800, avgPrice: 12.50, currentPrice: 14.20, value: 25_560.00, weight: 5.24,  pnl: 3_060.00,  pnlPct: 13.60, dividendYield: 5.4,  sparkline: [12.5, 13, 13.5, 13.8, 14, 14.1, 14.20] },
    { ticker: 'CPLE6',  name: 'Copel',              type: 'STOCK', sector: 'Energia',        qty: 600,  avgPrice: 9.50, currentPrice: 11.50, value: 6_900.00,  weight: 1.42,  pnl: 1_200.00,  pnlPct: 21.05, dividendYield: 6.9,  sparkline: [9.5, 10, 10.4, 10.7, 11, 11.3, 11.50] },
    { ticker: 'BTC',    name: 'Bitcoin',            type: 'CRYPTO',sector: 'Cripto',         qty: 0.05, avgPrice: 280_000, currentPrice: 290_500, value: 14_525.00, weight: 2.98,  pnl: 525.00,    pnlPct: 3.75,  dividendYield: 0,    sparkline: [280, 282, 285, 288, 287, 289, 290.5] },
  ]

  const trades: WalletTrade[] = [
    // Day trades últimos 7 dias
    { id: '1',  date: '2026-04-30', ticker: 'PETR4', side: 'sell', qty: 200, price: 32.15, volume: 6430, result: 230,  style: 'day', enterTime: '10:30', exitTime: '14:15' },
    { id: '2',  date: '2026-04-30', ticker: 'ITUB4', side: 'sell', qty: 100, price: 28.45, volume: 2845, result: 145,  style: 'day', enterTime: '11:00', exitTime: '15:30' },
    { id: '3',  date: '2026-04-29', ticker: 'VALE3', side: 'sell', qty: 50,  price: 58.40, volume: 2920, result: -85,  style: 'day', enterTime: '09:45', exitTime: '11:30' },
    { id: '4',  date: '2026-04-29', ticker: 'BBAS3', side: 'sell', qty: 100, price: 45.10, volume: 4510, result: 320,  style: 'day', enterTime: '13:20', exitTime: '16:00' },
    { id: '5',  date: '2026-04-28', ticker: 'PETR4', side: 'sell', qty: 150, price: 31.80, volume: 4770, result: 195,  style: 'day', enterTime: '10:15', exitTime: '12:45' },
    { id: '6',  date: '2026-04-28', ticker: 'ABEV3', side: 'sell', qty: 200, price: 14.20, volume: 2840, result: -42,  style: 'day', enterTime: '14:00', exitTime: '15:45' },
    { id: '7',  date: '2026-04-25', ticker: 'PETR4', side: 'sell', qty: 100, price: 31.40, volume: 3140, result: 90,   style: 'day', enterTime: '11:30', exitTime: '13:00' },
    { id: '8',  date: '2026-04-24', ticker: 'VALE3', side: 'sell', qty: 100, price: 58.90, volume: 5890, result: -110, style: 'day', enterTime: '09:30', exitTime: '10:45' },
    { id: '9',  date: '2026-04-24', ticker: 'ITUB4', side: 'sell', qty: 150, price: 28.30, volume: 4245, result: 180,  style: 'day', enterTime: '13:45', exitTime: '15:15' },
    { id: '10', date: '2026-04-23', ticker: 'BBAS3', side: 'sell', qty: 50,  price: 44.80, volume: 2240, result: 75,   style: 'day', enterTime: '10:00', exitTime: '11:30' },
    // Swing trades últimos 30d
    { id: '11', date: '2026-04-22', ticker: 'IVVB11', side: 'sell', qty: 30, price: 308.50, volume: 9255, result: 855,  style: 'swing' },
    { id: '12', date: '2026-04-18', ticker: 'TAEE11', side: 'sell', qty: 100, price: 32.80, volume: 3280, result: 260,  style: 'swing' },
    { id: '13', date: '2026-04-15', ticker: 'HGLG11', side: 'sell', qty: 50,  price: 164.50, volume: 8225, result: 325,  style: 'swing' },
    { id: '14', date: '2026-04-10', ticker: 'ABEV3', side: 'sell', qty: 300, price: 14.00, volume: 4200, result: 450,  style: 'swing' },
    { id: '15', date: '2026-04-05', ticker: 'PETR4', side: 'sell', qty: 200, price: 30.50, volume: 6100, result: 400,  style: 'swing' },
    { id: '16', date: '2026-03-28', ticker: 'CPLE6', side: 'sell', qty: 200, price: 10.90, volume: 2180, result: 280,  style: 'swing' },
    { id: '17', date: '2026-03-20', ticker: 'VALE3', side: 'sell', qty: 100, price: 62.00, volume: 6200, result: -200, style: 'swing' },
    { id: '18', date: '2026-03-15', ticker: 'KNRI11', side: 'sell', qty: 50, price: 140.00, volume: 7000, result: 500,  style: 'swing' },
  ]

  const goals: WalletGoal[] = [
    { label: 'Patrimônio R$ 1MM',     target: 1_000_000, current: 487_320, pct: 48.7, deadline: 'Dez 2029' },
    { label: 'Renda mensal R$ 3k',    target: 36_000,    current: 28_540,  pct: 79.3, deadline: 'Dez 2026' },
    { label: 'Reserva emergência',    target: 60_000,    current: 60_000,  pct: 100,  deadline: 'Concluído' },
  ]

  const upcomingDividends: WalletDividendEvent[] = [
    { date: '2026-05-05', ticker: 'TAEE11', type: 'dividendo',  amount: 1_245.00, status: 'previsto' },
    { date: '2026-05-12', ticker: 'ITUB4',  type: 'jcp',         amount: 845.00,   status: 'previsto' },
    { date: '2026-05-15', ticker: 'HGLG11', type: 'rendimento',  amount: 502.00,   status: 'previsto' },
    { date: '2026-05-15', ticker: 'MXRF11', type: 'rendimento',  amount: 412.00,   status: 'previsto' },
    { date: '2026-05-20', ticker: 'BBAS3',  type: 'dividendo',   amount: 980.00,   status: 'previsto' },
    { date: '2026-04-28', ticker: 'KNRI11', type: 'rendimento',  amount: 168.00,   status: 'recebido' },
    { date: '2026-04-25', ticker: 'MXRF11', type: 'rendimento',  amount: 412.00,   status: 'recebido' },
    { date: '2026-04-20', ticker: 'PETR4',  type: 'dividendo',   amount: 720.00,   status: 'recebido' },
  ]

  // Equity curve mockada: 90 pontos (últimos 90 dias), começando em 445k
  // subindo gradualmente até 487k com volatilidade realista.
  const equityCurve: number[] = (() => {
    const points: number[] = []
    let val = 445_000
    for (let i = 0; i < 90; i++) {
      const dailyChange = (Math.sin(i * 0.3) * 0.008 + Math.cos(i * 0.15) * 0.005 + (i / 90) * 0.005)
      val *= (1 + dailyChange)
      points.push(Math.round(val))
    }
    return points
  })()

  // Stats day-trade (últimos 7 dias)
  const dayTradeStats = {
    count: 10,
    winRate: 70,
    profitFactor: 2.4,
    totalPnl: 998,
    avgWin: 205,
    avgLoss: -79,
    bestTrade: 320,
    worstTrade: -110,
  }

  // Stats swing/carteira (últimos 12 meses)
  const swingStats = {
    realizedPnl: 38_240,
    unrealizedPnl: 42_180,
    income12m: 24_580,
    winRate: 76,
    profitFactor: 3.1,
    avgWin: 410,
    avgLoss: -132,
    bestTrade: 1_840,
    worstTrade: -420,
    totalTrades: 47,
  }

  // Raio-X — 9 dimensões com score 0-100 e diagnóstico
  const raioXDimensions = [
    { name: 'Diversificação',     score: 82, status: 'good',   summary: 'Boa distribuição entre ações, FIIs e ETF internacional.' },
    { name: 'Concentração',       score: 65, status: 'medium', summary: 'IVVB11 (19,2%) está acima do limite saudável de 15%.' },
    { name: 'Risco geográfico',   score: 78, status: 'good',   summary: '20% em ativos internacionais reduz dependência do Brasil.' },
    { name: 'Setores',            score: 71, status: 'good',   summary: '7 setores cobertos. Energia e Bancos concentrados.' },
    { name: 'Renda passiva',      score: 88, status: 'good',   summary: 'DY médio 7,4% acima da Selic. Renda mensal previsível.' },
    { name: 'Crescimento',        score: 62, status: 'medium', summary: 'Foco em maduras. Considere small caps de crescimento.' },
    { name: 'Valuation',          score: 73, status: 'good',   summary: 'Maioria com P/L abaixo da média setorial. ITUB4 caro.' },
    { name: 'Volatilidade',       score: 81, status: 'good',   summary: 'Beta médio 0.78. Carteira mais defensiva que o IBOV.' },
    { name: 'Liquidez',           score: 95, status: 'good',   summary: 'Todos os ativos têm volume diário acima de R$ 10M.' },
  ]

  // Bank accounts (Pluggy mock)
  const bankAccounts = [
    { id: '1', bank: 'Itaú',     type: 'Corrente',  balance: 18_450.32, lastSync: '5 min' },
    { id: '2', bank: 'XP',       type: 'Investim.', balance: 234_120.50, lastSync: '12 min' },
    { id: '3', bank: 'BTG',      type: 'Investim.', balance: 156_800.00, lastSync: '12 min' },
    { id: '4', bank: 'Clear',    type: 'Investim.', balance: 78_180.45, lastSync: '8 min' },
  ]

  // Heatmap 6 meses — array de 180 dias com valor diário (P&L do dia)
  // Cada cell = { date, pnl, isWeekend }
  type HeatmapCell = { date: string; pnl: number; isWeekend: boolean }
  const heatmap6m: HeatmapCell[] = (() => {
    const cells: HeatmapCell[] = []
    const today = new Date('2026-04-30')
    for (let i = 180; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const isWeekend = d.getDay() === 0 || d.getDay() === 6
      // P&L distribuído com mais positivos que negativos
      let pnl = 0
      if (!isWeekend) {
        const r = Math.sin(i * 0.5) + Math.cos(i * 0.3) + Math.random() - 0.3
        pnl = Math.round(r * 800)
      }
      cells.push({ date: d.toISOString().slice(0, 10), pnl, isWeekend })
    }
    return cells
  })()

  // Week heatmap (day trade) — 5 dias × 8 horas (9h às 17h)
  const weekHeatmap = (() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
    const hours = ['09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h']
    return days.map((day, di) => ({
      day,
      cells: hours.map((hour, hi) => ({
        hour,
        // Pico de performance no início (10h) e final (15h)
        pnl: Math.round((Math.sin((hi - 1) * 0.6) * 200 + Math.cos(di * 0.5) * 100 + Math.random() * 100 - 30)),
      })),
    }))
  })()

  // Open Finance status
  const openFinanceStatus = {
    connected: true,
    bankCount: 4,
    lastSync: '12 minutos',
    pendingItems: 0,
  }

  function formatBRL(value: number, opts?: { compact?: boolean }) {
    if (opts?.compact) {
      const abs = Math.abs(value)
      const sign = value < 0 ? '-' : ''
      if (abs >= 1e6) return `${sign}R$ ${(abs / 1e6).toFixed(1)}M`
      if (abs >= 1e3) return `${sign}R$ ${(abs / 1e3).toFixed(1)}k`
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  function formatPct(value: number, withSign = true) {
    const sign = value >= 0 && withSign ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  // Aggregations
  const allocationByType = computed(() => {
    const groups = positions.reduce<Record<string, number>>((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + p.value
      return acc
    }, {})
    return Object.entries(groups).map(([type, value]) => ({
      label: type,
      value,
      pct: (value / totalEquity) * 100,
    })).sort((a, b) => b.value - a.value)
  })

  const allocationBySector = computed(() => {
    const groups = positions.reduce<Record<string, number>>((acc, p) => {
      acc[p.sector] = (acc[p.sector] || 0) + p.value
      return acc
    }, {})
    return Object.entries(groups).map(([sector, value]) => ({
      label: sector,
      value,
      pct: (value / totalEquity) * 100,
    })).sort((a, b) => b.value - a.value)
  })

  return {
    totalEquity,
    totalPnl,
    totalPnlPct,
    dividendForecast12m,
    portfolioScore,
    lastUpdated,
    positions,
    trades,
    goals,
    upcomingDividends,
    equityCurve,
    dayTradeStats,
    swingStats,
    raioXDimensions,
    bankAccounts,
    heatmap6m,
    weekHeatmap,
    openFinanceStatus,
    allocationByType,
    allocationBySector,
    formatBRL,
    formatPct,
  }
}
