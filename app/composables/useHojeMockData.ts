// Mock que alimenta /wallet/hoje (snapshot do dia da carteira).
// Representa um dia tipico: carteira em queda moderada (-2,05%), pressao
// macro (juros + petroleo), algumas posicoes salvando (dolar/IVVB11).
//
// Shape pensado pra cobrir todas as secoes da pagina: hero P&L, breakdown
// causal (juros/petroleo/dolar), news, top movers, market geral,
// upcoming events, historico (hoje/ontem/7d), resumo IA.
// TODO: substituir por endpoint dedicado quando o backend expor.

export type ImpactSeverity = 'high' | 'medium' | 'low' | 'positive'

export type CausalFactor = {
  key: 'juros' | 'petroleo' | 'dolar' | 'ibov' | 'global' | 'setor'
  label: string
  icon: string
  impact: number
  pctOfPortfolio: number
  severity: ImpactSeverity
  note: string
}

export type DayNews = {
  id: string
  headline: string
  category: string
  impact: number
  impactPct: number
  severity: ImpactSeverity
  affectedAssets: string[]
  pctOfPortfolio: number
  image: string
  summary: string
  source: string
  time: string
}

export type TopMover = {
  ticker: string
  name: string
  impact: number
  pct: number
  sparkline: number[]
  factor: 'juros' | 'petroleo' | 'dolar' | 'setor'
  factorLabel: string
}

// Module-private: the canonical, auto-imported `MarketIndex` is the one in
// stores/market.ts. Keeping this un-exported avoids a Nuxt auto-import name
// collision (two exported `MarketIndex` -> "Duplicated imports" warning, with
// the composable's silently ignored).
type MarketIndex = {
  key: string
  label: string
  value: number
  changePct: number
  /** Lucide icon name (sem prefixo `i-lucide-`) usado na lista de secundários. */
  icon?: string
}

export type UpcomingEvent = {
  key: string
  title: string
  note: string
  icon: string
  severity: 'high' | 'medium' | 'low'
  when: string
}

export type HistoryBucket = {
  label: string
  amount: number
  pct: number
  sparkline: number[]
  severity: ImpactSeverity
}

export function useHojeMockData() {
  const user = { firstName: 'Andre' }
  const date = '22 de novembro de 2025'
  const time = '16:42'

  const portfolio = {
    totalValue: 184_750.42,
    dayChangeAmount: -3_868.0,
    dayChangePct: -2.05,
    weekChangeAmount: -1_245.0,
    weekChangePct: -0.63,
    ytdAmount: 24_180.0,
    ytdPct: 15.07,
  }

  const topReason = {
    headline: 'Alta dos juros futuros pressionou bancos e FIIs.',
    impact: -2_280.0,
    assets: ['ITUB4', 'BBDC4', 'KNRI11'],
  }

  const causalFactors: CausalFactor[] = [
    {
      key: 'juros',
      label: 'Juros futuros',
      icon: 'i-lucide-percent',
      impact: -1_820.0,
      pctOfPortfolio: 32.0,
      severity: 'high',
      note: 'Alta nos contratos DI pressionou bancos e FIIs.',
    },
    {
      key: 'petroleo',
      label: 'Petróleo',
      icon: 'i-lucide-droplet',
      impact: -1_260.0,
      pctOfPortfolio: 21.0,
      severity: 'medium',
      note: 'Queda do Brent impactou PETR4 e PRIO3.',
    },
    {
      key: 'dolar',
      label: 'Dólar',
      icon: 'i-lucide-dollar-sign',
      impact: -610.0,
      pctOfPortfolio: 12.0,
      severity: 'low',
      note: 'Real mais fraco elevou custos.',
    },
    {
      key: 'global',
      label: 'Mercado externo',
      icon: 'i-lucide-globe',
      impact: 380.0,
      pctOfPortfolio: 6.0,
      severity: 'positive',
      note: 'S&P 500 +0,25% ajudou exposição internacional.',
    },
  ]

  const news: DayNews[] = [
    {
      id: 'n1',
      headline: 'Banco Central sinaliza juros altos por mais tempo',
      category: 'Macro · Juros',
      impact: -1_240.0,
      impactPct: -0.67,
      severity: 'high',
      affectedAssets: ['ITUB4', 'BBDC4', 'KNRI11'],
      pctOfPortfolio: 32.0,
      image: 'building',
      summary: 'Ata do Copom indica taxa terminal acima do esperado, com Selic em torno de 12,5% no horizonte de 12 meses. Bancos e FIIs imobiliários reagem mal a juros longos elevados.',
      source: 'Valor Econômico',
      time: '08:14',
    },
    {
      id: 'n2',
      headline: 'Petróleo recua no exterior após estoques nos EUA',
      category: 'Commodities',
      impact: -980.0,
      impactPct: -0.53,
      severity: 'medium',
      affectedAssets: ['PETR4', 'PRIO3'],
      pctOfPortfolio: 21.0,
      image: 'oil',
      summary: 'Brent fechou em US$ 82,41 (-0,38%) depois que estoques semanais nos EUA vieram acima do esperado. Petroleiras brasileiras seguem o movimento.',
      source: 'Reuters Brasil',
      time: '11:32',
    },
    {
      id: 'n3',
      headline: 'Dólar sobe 1,1% e beneficia exposição internacional',
      category: 'Câmbio',
      impact: 610.0,
      impactPct: 0.33,
      severity: 'positive',
      affectedAssets: ['IVVB11', 'AAPL34'],
      pctOfPortfolio: 12.0,
      image: 'dollar',
      summary: 'Real fechou em R$ 5,49 após dado de inflação americana acima do consenso. ETFs e BDRs em dólar capturaram parte do movimento.',
      source: 'InfoMoney',
      time: '14:08',
    },
    {
      id: 'n4',
      headline: 'Vale apresenta produção do trimestre',
      category: 'Empresa · VALE3',
      impact: -180.0,
      impactPct: -0.10,
      severity: 'low',
      affectedAssets: ['VALE3'],
      pctOfPortfolio: 6.0,
      image: 'mining',
      summary: 'Volume de minério em linha com guidance. Preço médio realizado abaixo do consenso pressionou ação no after-hours.',
      source: 'Bloomberg',
      time: '15:55',
    },
  ]

  // Sparkline em pct desvio percentual no dia (pra graph mini)
  const spk = (vals: number[]) => vals

  const topMovers: TopMover[] = [
    {
      ticker: 'PETR4',
      name: 'Petrobras PN',
      impact: -720.0,
      pct: -1.25,
      sparkline: spk([0, -0.2, -0.4, -0.3, -0.8, -1.1, -1.0, -1.25]),
      factor: 'petroleo',
      factorLabel: 'Petróleo',
    },
    {
      ticker: 'ITUB4',
      name: 'Itaú Unibanco PN',
      impact: -610.0,
      pct: -0.94,
      sparkline: spk([0, -0.1, -0.3, -0.6, -0.7, -0.9, -0.8, -0.94]),
      factor: 'juros',
      factorLabel: 'Juros',
    },
    {
      ticker: 'KNRI11',
      name: 'Kinea Renda Imob.',
      impact: -430.0,
      pct: -0.72,
      sparkline: spk([0, -0.1, -0.2, -0.5, -0.6, -0.7, -0.65, -0.72]),
      factor: 'juros',
      factorLabel: 'Juros',
    },
    {
      ticker: 'IVVB11',
      name: 'iShares S&P 500',
      impact: 380.0,
      pct: 0.58,
      sparkline: spk([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.55, 0.58]),
      factor: 'dolar',
      factorLabel: 'Dólar',
    },
    {
      ticker: 'BBAS3',
      name: 'Banco do Brasil',
      impact: -280.0,
      pct: -0.45,
      sparkline: spk([0, -0.1, -0.2, -0.3, -0.4, -0.42, -0.45, -0.45]),
      factor: 'juros',
      factorLabel: 'Juros',
    },
  ]

  const marketIndices: MarketIndex[] = [
    { key: 'ibov', label: 'Ibovespa', value: 127_102, changePct: -1.98, icon: 'bar-chart-3' },
    { key: 'dolar', label: 'Dólar', value: 5.49, changePct: -0.52, icon: 'dollar-sign' },
    { key: 'brent', label: 'Petróleo (Brent)', value: 82.41, changePct: -0.38, icon: 'droplet' },
    { key: 'sp500', label: 'S&P 500', value: 5_320, changePct: 0.25, icon: 'globe' },
  ]

  const topGainers = [
    { ticker: 'EMBR3', pct: 4.12 },
    { ticker: 'BBAS3', pct: 2.31 },
    { ticker: 'KLBN11', pct: 1.87 },
  ]
  const topLosers = [
    { ticker: 'PETR4', pct: -3.21 },
    { ticker: 'ITUB4', pct: -2.89 },
    { ticker: 'VALE3', pct: -2.47 },
  ]

  const upcomingEvents: UpcomingEvent[] = [
    {
      key: 'copom',
      title: 'Copom amanhã',
      note: 'Pode impactar bancos, FIIs e títulos longos.',
      icon: 'i-lucide-landmark',
      severity: 'high',
      when: 'Amanhã, 18h',
    },
    {
      key: 'oil',
      title: 'Petróleo segue volátil',
      note: 'Monitore PETR4 e PRIO3.',
      icon: 'i-lucide-droplet',
      severity: 'medium',
      when: 'Esta semana',
    },
    {
      key: 'earnings',
      title: 'Temporada de resultados',
      note: 'Itaú divulga números nesta semana.',
      icon: 'i-lucide-bar-chart-3',
      severity: 'medium',
      when: 'Quinta, 19h',
    },
  ]

  const history: HistoryBucket[] = [
    {
      label: 'Hoje',
      amount: -3_868.0,
      pct: -2.05,
      sparkline: [0, -0.5, -0.8, -1.2, -1.5, -1.8, -2.0, -2.05],
      severity: 'high',
    },
    {
      label: 'Ontem',
      amount: 2_135.0,
      pct: 1.16,
      sparkline: [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.1, 1.16],
      severity: 'positive',
    },
    {
      label: 'Últimos 7 dias',
      amount: -1_245.0,
      pct: -0.63,
      sparkline: [0, 0.5, 1.2, 0.8, -0.2, -0.8, -0.5, -0.63],
      severity: 'medium',
    },
  ]

  const resumoAI =
    '72% da queda de hoje veio de fatores macro, principalmente juros. O movimento parece mais setorial do que específico dos seus ativos, sua carteira está reagindo ao stress de juros futuros, não a problemas de balanço das empresas.'

  const aiSuggestions = [
    'Por que minha carteira caiu hoje?',
    'Isso é risco ou oportunidade?',
    'Qual notícia mais pesou?',
    'O que devo monitorar amanhã?',
  ]

  // Proventos creditados hoje (D+0 da data). Se total = 0, callout some na UI.
  // Contraponto positivo ao P&L do dia: mesmo no vermelho, dinheiro entrou.
  const dividendsToday = {
    total: 412.50,
    count: 3,
    items: [
      { ticker: 'BBAS3', amount: 187.30, type: 'JCP' as const },
      { ticker: 'TAEE11', amount: 145.20, type: 'Dividendo' as const },
      { ticker: 'KLBN11', amount: 80.00, type: 'Dividendo' as const },
    ],
  }

  // Intraday curve (pct) — 50 pontos do dia, da abertura ao fechamento
  const intradayCurve = [
    0, -0.1, -0.05, 0.02, -0.1, -0.3, -0.5, -0.7, -0.9, -1.1,
    -1.0, -0.9, -1.1, -1.3, -1.4, -1.5, -1.6, -1.5, -1.4, -1.3,
    -1.4, -1.5, -1.7, -1.9, -2.0, -2.1, -2.2, -2.3, -2.2, -2.1,
    -2.0, -1.9, -2.0, -2.1, -2.2, -2.3, -2.2, -2.1, -2.0, -1.95,
    -1.9, -1.95, -2.0, -2.1, -2.05, -2.0, -2.05, -2.05, -2.05, -2.05,
  ]

  return {
    user,
    date,
    time,
    portfolio,
    topReason,
    causalFactors,
    news,
    topMovers,
    marketIndices,
    topGainers,
    topLosers,
    upcomingEvents,
    history,
    resumoAI,
    aiSuggestions,
    intradayCurve,
    dividendsToday,
  }
}
