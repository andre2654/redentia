// Logica do Redent Score: avaliacao EXTENSA da carteira do investidor.
// Funciona deterministicamente a partir dos tickers, gera analise rica
// usando fundamentos completos por ativo, projecoes, stress tests, alocacao
// por classe, calendario de dividendos, alternativas comparaveis, etc.
//
// Mock data por ticker (~50 ativos brasileiros mais citados em carteiras
// tipicas de investidor self-directed) cobre dezenas de metricas: P/L, P/VP,
// ROE, ROIC, margens, divida, payout, CAGR 5Y, beta, internacionalizacao,
// status de tese, eventos recentes, ETC.

export type PortfolioBand = 'critico' | 'atencao' | 'bom' | 'excelente'
export type AssetClass = 'renda-fixa-pos' | 'renda-fixa-pre' | 'renda-fixa-ipca' | 'acoes-br' | 'fii-tijolo' | 'fii-papel' | 'etf-br' | 'etf-intl' | 'bdr' | 'cripto'

export interface AssetFundamentals {
  pl?: number              // P/L
  pvp?: number             // P/VP
  roe?: number             // ROE %
  roic?: number            // ROIC %
  marginNet?: number       // margem liquida %
  marginEbitda?: number    // margem EBITDA %
  netDebtEbitda?: number   // divida liquida / EBITDA
  payout?: number          // % de lucro distribuido
  revenueCagr5y?: number   // CAGR receita 5 anos %
  earningsCagr5y?: number  // CAGR lucro 5 anos %
  marketCap?: number       // R$ bilhoes
  // FII-specific
  vacancia?: number        // %
  pVpa?: number            // P/VPA do FII
  ifixShare?: number       // peso no IFIX %
  numCotistas?: number
  // Cripto-specific
  marketDominance?: number // %
}

export interface PortfolioAsset {
  ticker: string
  weight: number
  category: AssetClass
  sector: string
  name: string
  dy: number               // dividend yield %
  beta: number
  internacional: boolean
  fundamentoStatus: 'estavel' | 'melhorando' | 'piorando'
  liquidez: 'alta' | 'media' | 'baixa'
  expectedReturn: number   // CAGR esperado %  ao ano
  fundamentals: AssetFundamentals
  thesisStatus: 'mantida' | 'em-atencao' | 'enfraquecida' | 'quebrada'
  thesisNote: string
  logo?: string
}

export interface PortfolioDimension {
  id: 'diversificacao' | 'concentracao' | 'qualidade' | 'renda' | 'cambial' | 'liquidez' | 'volatilidade' | 'crescimento' | 'macro'
  label: string
  score: number
  level: string
  tone: 'good' | 'mid' | 'bad'
  explanation: string
}

export interface PortfolioStrength {
  icon: string
  title: string
  description: string
}

export interface PortfolioRisk {
  icon: string
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
}

export interface PortfolioEvent {
  ticker: string
  headline: string
  source: string
  impact: 'positive' | 'negative' | 'neutral'
  date: string
}

export interface AllocationByClass {
  classId: AssetClass
  label: string
  weight: number
  color: string
}

export interface StressScenario {
  id: string
  icon: string
  title: string
  description: string
  impact: number  // % impacto na carteira
  resilience: 'forte' | 'media' | 'fraca'
}

export interface DividendForecast {
  ticker: string
  monthlyAvg: number       // R$/mes para R$ 1000 investidos
  nextDate: string
  yieldOnCost: number      // %
}

export interface AssetAlternative {
  fromTicker: string
  toTicker: string
  reason: string
  fundamentals: { label: string, current: string, alternative: string, better: 'alt' | 'current' }[]
}

export interface SuggestedQuestion {
  text: string
  href: string
}

export interface AIInsight {
  icon: string
  paragraph: string
}

export interface BenchmarkComparison {
  label: string
  expected: number     // CAGR % aa esperado
  cdiRatio: number     // x vezes o CDI (>1 bate o CDI)
  vs: 'above' | 'below' | 'inline'
}

export interface PortfolioReport {
  score: number
  band: PortfolioBand
  bandLabel: string
  bandDescription: string
  composition: PortfolioAsset[]
  dimensions: PortfolioDimension[]
  strengths: PortfolioStrength[]
  risks: PortfolioRisk[]
  events: PortfolioEvent[]
  metaCompliance: number
  sectorConcentration: { sector: string, weight: number }[]
  // EXTENSAO 2026-04-28
  allocationByClass: AllocationByClass[]
  expectedReturn: number       // CAGR ponderado %  aa
  expectedReturnLabel: string  // "Acima do CDI", etc
  dividendForecast: DividendForecast[]
  monthlyDividendsTotal: number  // R$/mes para R$ 100k
  benchmarks: BenchmarkComparison[]
  stressScenarios: StressScenario[]
  alternatives: AssetAlternative[]
  aiInsights: AIInsight[]
  suggestedQuestions: SuggestedQuestion[]
  thesesAtRisk: { ticker: string, status: string, reason: string }[]
  macroExposure: { factor: string, level: 'high' | 'medium' | 'low', impact: string }[]
}

// ----------------------------------------------------------------------
// Mock data ENRIQUECIDO
// ----------------------------------------------------------------------

interface AssetMeta extends Omit<PortfolioAsset, 'weight'> {}

function asset(props: Partial<PortfolioAsset> & Pick<PortfolioAsset, 'ticker' | 'category' | 'sector' | 'name'>): AssetMeta {
  return {
    dy: 0,
    beta: 1,
    internacional: false,
    fundamentoStatus: 'estavel',
    liquidez: 'media',
    expectedReturn: 8,
    fundamentals: {},
    thesisStatus: 'mantida',
    thesisNote: 'Sem mudanca relevante nos ultimos 90 dias.',
    ...props,
    weight: 0,
  } as AssetMeta
}

const MOCK_ASSETS: Record<string, AssetMeta> = {
  // ==================== BANCOS ====================
  ITUB4: asset({
    ticker: 'ITUB4', name: 'Itau Unibanco', category: 'acoes-br', sector: 'Bancos',
    dy: 5.8, beta: 0.9, liquidez: 'alta', expectedReturn: 12.5,
    fundamentals: { pl: 8.4, pvp: 1.5, roe: 19.2, marginNet: 26.8, payout: 50, revenueCagr5y: 6.8, earningsCagr5y: 9.4, marketCap: 320 },
    thesisStatus: 'mantida',
    thesisNote: 'Resultados consistentes, ROE estavel, payout aumentando.',
  }),
  BBDC4: asset({
    ticker: 'BBDC4', name: 'Bradesco', category: 'acoes-br', sector: 'Bancos',
    dy: 6.2, beta: 1.0, liquidez: 'alta', fundamentoStatus: 'piorando', expectedReturn: 8.5,
    fundamentals: { pl: 9.1, pvp: 1.0, roe: 11.4, marginNet: 18.6, payout: 30, revenueCagr5y: 3.2, earningsCagr5y: -4.8, marketCap: 145 },
    thesisStatus: 'enfraquecida',
    thesisNote: 'ROE caiu de 18% para 11% nos ultimos 3 anos. Inadimplencia em alta.',
  }),
  BBAS3: asset({
    ticker: 'BBAS3', name: 'Banco do Brasil', category: 'acoes-br', sector: 'Bancos',
    dy: 9.5, beta: 1.0, liquidez: 'alta', expectedReturn: 14.8,
    fundamentals: { pl: 4.8, pvp: 1.0, roe: 21.0, marginNet: 28.2, payout: 45, revenueCagr5y: 8.4, earningsCagr5y: 12.6, marketCap: 165 },
    thesisStatus: 'mantida',
    thesisNote: 'Valuation barato, ROE forte, distribuicoes extraordinarias frequentes.',
  }),
  SANB11: asset({
    ticker: 'SANB11', name: 'Santander Brasil', category: 'acoes-br', sector: 'Bancos',
    dy: 7.4, beta: 1.1, liquidez: 'alta', expectedReturn: 10.0,
    fundamentals: { pl: 9.6, pvp: 1.4, roe: 14.5, marginNet: 22.1, payout: 60, revenueCagr5y: 4.8, earningsCagr5y: 5.2, marketCap: 95 },
  }),

  // ==================== ENERGIA ====================
  PETR4: asset({
    ticker: 'PETR4', name: 'Petrobras', category: 'acoes-br', sector: 'Energia',
    dy: 12.4, beta: 1.4, liquidez: 'alta', fundamentoStatus: 'piorando', expectedReturn: 7.2,
    fundamentals: { pl: 4.2, pvp: 0.9, roe: 22.8, roic: 18.4, marginNet: 16.4, marginEbitda: 48.2, netDebtEbitda: 0.8, payout: 65, revenueCagr5y: 4.2, earningsCagr5y: -2.4, marketCap: 480 },
    thesisStatus: 'em-atencao',
    thesisNote: 'Petroleo Brent abaixo de US$ 65 pressiona payout. Ingerencia politica continua sendo risco.',
  }),
  PETR3: asset({
    ticker: 'PETR3', name: 'Petrobras ON', category: 'acoes-br', sector: 'Energia',
    dy: 12.1, beta: 1.4, liquidez: 'alta', fundamentoStatus: 'piorando', expectedReturn: 7.0,
    fundamentals: { pl: 4.4, pvp: 1.0, roe: 22.5, marginNet: 16.4, payout: 65, marketCap: 480 },
    thesisStatus: 'em-atencao',
    thesisNote: 'Mesmo cenario de PETR4 com voto adicional.',
  }),
  PRIO3: asset({
    ticker: 'PRIO3', name: 'PetroRio', category: 'acoes-br', sector: 'Energia',
    dy: 0, beta: 1.6, liquidez: 'alta', fundamentoStatus: 'melhorando', expectedReturn: 18.0,
    fundamentals: { pl: 6.8, pvp: 1.8, roe: 28.4, marginNet: 32.6, marginEbitda: 65.8, netDebtEbitda: 0.4, revenueCagr5y: 42.6, earningsCagr5y: 38.4, marketCap: 38 },
  }),

  // ==================== MINERACAO/SIDERURGIA ====================
  VALE3: asset({
    ticker: 'VALE3', name: 'Vale', category: 'acoes-br', sector: 'Mineracao',
    dy: 8.9, beta: 1.5, liquidez: 'alta', expectedReturn: 9.2,
    fundamentals: { pl: 5.8, pvp: 1.6, roe: 24.0, roic: 20.2, marginNet: 22.4, marginEbitda: 44.8, netDebtEbitda: 0.6, payout: 60, marketCap: 290 },
    thesisStatus: 'mantida',
    thesisNote: 'Minerio acima de US$ 100, custo caixa competitivo, payout alinhado.',
  }),
  CSNA3: asset({
    ticker: 'CSNA3', name: 'CSN', category: 'acoes-br', sector: 'Siderurgia',
    dy: 10.2, beta: 1.7, liquidez: 'media', fundamentoStatus: 'piorando', expectedReturn: 4.8,
    fundamentals: { pl: 22.4, pvp: 1.4, roe: 6.2, marginNet: 4.8, netDebtEbitda: 3.2, payout: 80, marketCap: 18 },
    thesisStatus: 'enfraquecida',
    thesisNote: 'Endividamento alto e payout > 100% do lucro recente.',
  }),
  GGBR4: asset({
    ticker: 'GGBR4', name: 'Gerdau', category: 'acoes-br', sector: 'Siderurgia',
    dy: 7.5, beta: 1.5, liquidez: 'alta', expectedReturn: 11.0,
    fundamentals: { pl: 6.4, pvp: 1.2, roe: 18.6, marginNet: 12.4, netDebtEbitda: 0.5, payout: 30, marketCap: 28 },
  }),

  // ==================== CONSUMO ====================
  ABEV3: asset({
    ticker: 'ABEV3', name: 'AmBev', category: 'acoes-br', sector: 'Bebidas',
    dy: 4.8, beta: 0.8, liquidez: 'alta', expectedReturn: 7.4,
    fundamentals: { pl: 14.6, pvp: 2.2, roe: 14.8, marginNet: 18.4, payout: 80, marketCap: 220 },
  }),
  WEGE3: asset({
    ticker: 'WEGE3', name: 'WEG', category: 'acoes-br', sector: 'Industria',
    dy: 1.4, beta: 0.9, liquidez: 'alta', internacional: true, fundamentoStatus: 'melhorando', expectedReturn: 16.2,
    fundamentals: { pl: 32.4, pvp: 6.4, roe: 22.8, roic: 24.6, marginNet: 14.8, revenueCagr5y: 22.4, earningsCagr5y: 26.8, marketCap: 195 },
    thesisStatus: 'mantida',
    thesisNote: 'Expansao internacional avanca, margens em alta, P/L premium se justifica.',
  }),
  MGLU3: asset({
    ticker: 'MGLU3', name: 'Magazine Luiza', category: 'acoes-br', sector: 'Varejo',
    dy: 0, beta: 2.1, liquidez: 'alta', fundamentoStatus: 'piorando', expectedReturn: -2.4,
    fundamentals: { pvp: 0.8, roe: -18.4, marginNet: -4.6, netDebtEbitda: 5.4, marketCap: 12 },
    thesisStatus: 'quebrada',
    thesisNote: 'Prejuizo recorrente, queima de caixa, margem negativa. Tese de crescimento quebrada.',
  }),

  // ==================== SAUDE ====================
  HAPV3: asset({
    ticker: 'HAPV3', name: 'Hapvida', category: 'acoes-br', sector: 'Saude',
    dy: 0, beta: 1.4, liquidez: 'alta', fundamentoStatus: 'piorando', expectedReturn: 4.2,
    fundamentals: { pl: 28.4, pvp: 1.6, roe: 5.8, marginNet: 1.2, netDebtEbitda: 4.8 },
    thesisStatus: 'enfraquecida',
    thesisNote: 'Sinistralidade alta pos-pandemia, integracao GNDI ainda gera atrito.',
  }),
  RDOR3: asset({
    ticker: 'RDOR3', name: "Rede D'Or", category: 'acoes-br', sector: 'Saude',
    dy: 1.8, beta: 1.0, liquidez: 'alta', expectedReturn: 13.4,
    fundamentals: { pl: 28.6, pvp: 3.2, roe: 12.8, marginNet: 8.4, payout: 35, marketCap: 65 },
  }),

  // ==================== ENERGIA ELETRICA ====================
  TAEE11: asset({
    ticker: 'TAEE11', name: 'Taesa', category: 'acoes-br', sector: 'Eletrica',
    dy: 9.6, beta: 0.5, liquidez: 'media', expectedReturn: 11.2,
    fundamentals: { pl: 9.8, pvp: 1.8, roe: 20.4, marginNet: 36.4, payout: 95, marketCap: 12 },
    thesisStatus: 'mantida',
    thesisNote: 'Receita previsivel via concessoes, dividendos consistentes, baixo beta.',
  }),
  CMIG4: asset({
    ticker: 'CMIG4', name: 'Cemig', category: 'acoes-br', sector: 'Eletrica',
    dy: 8.1, beta: 0.7, liquidez: 'alta', expectedReturn: 10.0,
    fundamentals: { pl: 5.4, pvp: 0.9, roe: 16.8, marginNet: 14.4, payout: 50, marketCap: 22 },
  }),

  // ==================== FII PAPEL ====================
  MXRF11: asset({
    ticker: 'MXRF11', name: 'Maxi Renda', category: 'fii-papel', sector: 'FII Papel',
    dy: 12.0, beta: 0.4, liquidez: 'alta', expectedReturn: 13.4,
    fundamentals: { pVpa: 1.02, vacancia: 0, ifixShare: 1.8, numCotistas: 850000 },
    thesisStatus: 'mantida',
    thesisNote: 'CRIs IPCA+ majoritarios, distribuicao mensal estavel, inadimplencia controlada.',
  }),
  KNCR11: asset({
    ticker: 'KNCR11', name: 'Kinea Recebiveis', category: 'fii-papel', sector: 'FII Papel',
    dy: 11.4, beta: 0.3, liquidez: 'alta', expectedReturn: 12.6,
    fundamentals: { pVpa: 1.00, vacancia: 0, ifixShare: 1.4, numCotistas: 320000 },
  }),
  KNRI11: asset({
    ticker: 'KNRI11', name: 'Kinea Renda Imobiliaria', category: 'fii-tijolo', sector: 'FII Hibrido',
    dy: 8.9, beta: 0.4, liquidez: 'alta', expectedReturn: 10.4,
    fundamentals: { pVpa: 0.92, vacancia: 4.2, ifixShare: 2.1, numCotistas: 380000 },
  }),

  // ==================== FII TIJOLO ====================
  HGLG11: asset({
    ticker: 'HGLG11', name: 'CSHG Logistica', category: 'fii-tijolo', sector: 'FII Logistica',
    dy: 8.0, beta: 0.5, liquidez: 'alta', expectedReturn: 11.0,
    fundamentals: { pVpa: 0.96, vacancia: 1.8, ifixShare: 3.2, numCotistas: 410000 },
    thesisStatus: 'mantida',
    thesisNote: 'Galpoes AAA, vacancia abaixo de 2%, novas locacoes em Itupeva.',
  }),
  XPLG11: asset({
    ticker: 'XPLG11', name: 'XP Logistica', category: 'fii-tijolo', sector: 'FII Logistica',
    dy: 8.6, beta: 0.5, liquidez: 'alta', expectedReturn: 11.4,
    fundamentals: { pVpa: 0.88, vacancia: 3.6, ifixShare: 2.4, numCotistas: 280000 },
  }),
  HGRE11: asset({
    ticker: 'HGRE11', name: 'CSHG Real Estate', category: 'fii-tijolo', sector: 'FII Lajes',
    dy: 8.4, beta: 0.5, liquidez: 'alta', expectedReturn: 9.8,
    fundamentals: { pVpa: 0.78, vacancia: 12.4, ifixShare: 1.6, numCotistas: 220000 },
  }),
  VISC11: asset({
    ticker: 'VISC11', name: 'Vinci Shopping Centers', category: 'fii-tijolo', sector: 'FII Shoppings',
    dy: 9.1, beta: 0.6, liquidez: 'alta', expectedReturn: 11.8,
    fundamentals: { pVpa: 0.94, vacancia: 4.8, ifixShare: 1.8, numCotistas: 180000 },
  }),

  // ==================== ETFs ====================
  IVVB11: asset({
    ticker: 'IVVB11', name: 'iShares S&P 500', category: 'etf-intl', sector: 'ETF Internacional',
    dy: 1.2, beta: 0.7, liquidez: 'alta', internacional: true, expectedReturn: 11.6,
    fundamentals: { marketCap: 12 },
    thesisStatus: 'mantida',
    thesisNote: 'Exposicao S&P 500 hedgeada em real, custo baixo, internacionalizacao automatica.',
  }),
  BOVA11: asset({
    ticker: 'BOVA11', name: 'iShares Ibovespa', category: 'etf-br', sector: 'ETF Brasil',
    dy: 6.8, beta: 1.0, liquidez: 'alta', expectedReturn: 11.2,
    fundamentals: { marketCap: 8 },
  }),

  // ==================== BDRs ====================
  AAPL34: asset({
    ticker: 'AAPL34', name: 'Apple', category: 'bdr', sector: 'BDR Tech',
    dy: 0.4, beta: 1.2, liquidez: 'alta', internacional: true, fundamentoStatus: 'melhorando', expectedReturn: 14.4,
    fundamentals: { pl: 32.4, roe: 158.0, marginNet: 25.4, revenueCagr5y: 8.4, earningsCagr5y: 11.6 },
    thesisStatus: 'mantida',
    thesisNote: 'Servicos crescendo, margens recordes, recompras agressivas.',
  }),
  TSLA34: asset({
    ticker: 'TSLA34', name: 'Tesla', category: 'bdr', sector: 'BDR Tech',
    dy: 0, beta: 2.0, liquidez: 'alta', internacional: true, expectedReturn: 12.0,
    fundamentals: { pl: 64.8, roe: 18.4, marginNet: 14.8, revenueCagr5y: 35.8, earningsCagr5y: 28.4 },
  }),
  MSFT34: asset({
    ticker: 'MSFT34', name: 'Microsoft', category: 'bdr', sector: 'BDR Tech',
    dy: 0.7, beta: 0.9, liquidez: 'alta', internacional: true, fundamentoStatus: 'melhorando', expectedReturn: 13.8,
    fundamentals: { pl: 36.4, roe: 38.6, marginNet: 36.4 },
  }),
  AMZO34: asset({
    ticker: 'AMZO34', name: 'Amazon', category: 'bdr', sector: 'BDR Tech',
    dy: 0, beta: 1.3, liquidez: 'alta', internacional: true, expectedReturn: 15.2,
    fundamentals: { pl: 42.8, roe: 18.4, marginNet: 8.6 },
  }),
  GOGL34: asset({
    ticker: 'GOGL34', name: 'Alphabet', category: 'bdr', sector: 'BDR Tech',
    dy: 0, beta: 1.0, liquidez: 'alta', internacional: true, expectedReturn: 13.2,
    fundamentals: { pl: 24.6, roe: 26.8, marginNet: 24.4 },
  }),

  // ==================== TESOURO ====================
  TESOURO_SELIC: asset({
    ticker: 'TESOURO SELIC', name: 'Tesouro Selic', category: 'renda-fixa-pos', sector: 'Renda Fixa Pos',
    dy: 0, beta: 0.05, liquidez: 'alta', expectedReturn: 11.4,
    thesisStatus: 'mantida',
    thesisNote: 'Liquidez diaria, sem marcacao a mercado relevante, paridade com Selic.',
  }),
  TESOURO_IPCA: asset({
    ticker: 'TESOURO IPCA+', name: 'Tesouro IPCA+', category: 'renda-fixa-ipca', sector: 'Renda Fixa IPCA',
    dy: 0, beta: 0.15, liquidez: 'alta', expectedReturn: 12.6,
  }),
  TESOURO_PRE: asset({
    ticker: 'TESOURO PREFIXADO', name: 'Tesouro Prefixado', category: 'renda-fixa-pre', sector: 'Renda Fixa Pre',
    dy: 0, beta: 0.20, liquidez: 'alta', expectedReturn: 12.0,
  }),

  // ==================== CRIPTO ====================
  BTC: asset({
    ticker: 'BTC', name: 'Bitcoin', category: 'cripto', sector: 'Cripto',
    dy: 0, beta: 3.0, liquidez: 'alta', internacional: true, expectedReturn: 28.0,
    fundamentals: { marketDominance: 54 },
    thesisStatus: 'em-atencao',
    thesisNote: 'Volatilidade alta, halving recente sustentando narrativa institucional.',
  }),
  ETH: asset({
    ticker: 'ETH', name: 'Ethereum', category: 'cripto', sector: 'Cripto',
    dy: 0, beta: 3.5, liquidez: 'alta', internacional: true, expectedReturn: 24.0,
    fundamentals: { marketDominance: 16 },
  }),
  SOL: asset({
    ticker: 'SOL', name: 'Solana', category: 'cripto', sector: 'Cripto',
    dy: 0, beta: 4.2, liquidez: 'alta', internacional: true, expectedReturn: 32.0,
    fundamentals: { marketDominance: 4 },
  }),
}

const MOCK_EVENTS: Record<string, PortfolioEvent[]> = {
  PETR4: [{ ticker: 'PETR4', headline: 'PETR4 reage a queda do petroleo Brent abaixo de US$ 65', source: 'InfoMoney', impact: 'negative', date: '2 dias atras' }],
  ITUB4: [{ ticker: 'ITUB4', headline: 'Itau anuncia aumento de payout para 60% em 2026', source: 'Valor', impact: 'positive', date: '5 dias atras' }],
  BBAS3: [{ ticker: 'BBAS3', headline: 'BB anuncia distribuicao extraordinaria de R$ 0,68 por acao', source: 'Suno', impact: 'positive', date: '1 dia atras' }],
  MXRF11: [{ ticker: 'MXRF11', headline: 'MXRF11 mantem distribuicao mensal e reduz inadimplencia', source: 'Money Times', impact: 'neutral', date: '3 dias atras' }],
  IVVB11: [{ ticker: 'IVVB11', headline: 'IVVB11 acompanha S&P 500 em alta de 0,8% com reducao do dolar', source: 'BrazilJournal', impact: 'positive', date: 'hoje' }],
  HGLG11: [{ ticker: 'HGLG11', headline: 'HGLG11 anuncia nova locacao em Itupeva, vacancia recua para 1,8%', source: 'Suno', impact: 'positive', date: '4 dias atras' }],
  VALE3: [{ ticker: 'VALE3', headline: 'Vale corta guidance de producao e acoes recuam', source: 'InfoMoney', impact: 'negative', date: '6 dias atras' }],
  MGLU3: [{ ticker: 'MGLU3', headline: 'Magalu reporta prejuizo recorrente e fecha 12% no acumulado', source: 'Valor', impact: 'negative', date: '1 dia atras' }],
  WEGE3: [{ ticker: 'WEGE3', headline: 'Weg expande capacidade nos EUA e analistas elevam preco-alvo', source: 'Money Times', impact: 'positive', date: '3 dias atras' }],
  AAPL34: [{ ticker: 'AAPL34', headline: 'Apple bate consenso de receita no Q1 e BDR sobe 4%', source: 'BrazilJournal', impact: 'positive', date: '2 dias atras' }],
  BBDC4: [{ ticker: 'BBDC4', headline: 'Bradesco eleva provisao para PDD e ROE recua', source: 'Valor', impact: 'negative', date: '4 dias atras' }],
  HAPV3: [{ ticker: 'HAPV3', headline: 'Hapvida sinaliza sinistralidade ainda elevada no trimestre', source: 'InfoMoney', impact: 'negative', date: '7 dias atras' }],
  TAEE11: [{ ticker: 'TAEE11', headline: 'Taesa anuncia juros sobre capital proprio de R$ 0,85 por unit', source: 'Suno', impact: 'positive', date: '2 dias atras' }],
  BTC: [{ ticker: 'BTC', headline: 'Bitcoin volta a ultrapassar US$ 70 mil com fluxo de ETFs spot', source: 'Money Times', impact: 'positive', date: 'hoje' }],
  TESOURO_SELIC: [{ ticker: 'TESOURO SELIC', headline: 'Copom mantem Selic em 11,75% e abre porta para corte gradual', source: 'BCB', impact: 'neutral', date: '3 dias atras' }],
}

// Alternativas pre-definidas (DE → PARA)
const MOCK_ALTERNATIVES: AssetAlternative[] = [
  {
    fromTicker: 'BBDC4', toTicker: 'BBAS3',
    reason: 'Mesmo setor, valuation muito mais barato e ROE quase o dobro.',
    fundamentals: [
      { label: 'P/L', current: '9.1', alternative: '4.8', better: 'alt' },
      { label: 'ROE', current: '11.4%', alternative: '21.0%', better: 'alt' },
      { label: 'DY', current: '6.2%', alternative: '9.5%', better: 'alt' },
    ],
  },
  {
    fromTicker: 'BBDC4', toTicker: 'ITUB4',
    reason: 'Mesma exposicao bancaria com fundamentos significativamente melhores.',
    fundamentals: [
      { label: 'ROE', current: '11.4%', alternative: '19.2%', better: 'alt' },
      { label: 'CAGR Lucro 5Y', current: '-4.8%', alternative: '+9.4%', better: 'alt' },
    ],
  },
  {
    fromTicker: 'CSNA3', toTicker: 'GGBR4',
    reason: 'Siderurgia com balanco mais limpo e payout sustentavel.',
    fundamentals: [
      { label: 'Net Debt/EBITDA', current: '3.2', alternative: '0.5', better: 'alt' },
      { label: 'P/L', current: '22.4', alternative: '6.4', better: 'alt' },
    ],
  },
  {
    fromTicker: 'PETR4', toTicker: 'PRIO3',
    reason: 'Sem ingerencia politica, crescimento de producao acelerado.',
    fundamentals: [
      { label: 'CAGR Receita 5Y', current: '+4.2%', alternative: '+42.6%', better: 'alt' },
      { label: 'Net Debt/EBITDA', current: '0.8', alternative: '0.4', better: 'alt' },
    ],
  },
  {
    fromTicker: 'HAPV3', toTicker: 'RDOR3',
    reason: 'Mesma exposicao saude, mas com crescimento positivo e margens estaveis.',
    fundamentals: [
      { label: 'ROE', current: '5.8%', alternative: '12.8%', better: 'alt' },
      { label: 'Margem Liquida', current: '1.2%', alternative: '8.4%', better: 'alt' },
    ],
  },
  {
    fromTicker: 'MGLU3', toTicker: 'WEGE3',
    reason: 'Trocar tese de varejo brasileiro quebrada por industria global lucrativa.',
    fundamentals: [
      { label: 'ROE', current: '-18.4%', alternative: '22.8%', better: 'alt' },
      { label: 'CAGR Lucro 5Y', current: 'negativo', alternative: '+26.8%', better: 'alt' },
    ],
  },
]

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}

export function resolveTicker(input: string): AssetMeta | null {
  const normalized = input.trim().toUpperCase().replace(/\s+/g, ' ')
  const aliases: Record<string, string> = {
    'TESOURO': 'TESOURO_SELIC',
    'TESOURO SELIC': 'TESOURO_SELIC',
    'SELIC': 'TESOURO_SELIC',
    'TESOURO IPCA': 'TESOURO_IPCA',
    'TESOURO IPCA+': 'TESOURO_IPCA',
    'IPCA+': 'TESOURO_IPCA',
    'TESOURO PREFIXADO': 'TESOURO_PRE',
    'PREFIXADO': 'TESOURO_PRE',
    'BITCOIN': 'BTC',
    'ETHEREUM': 'ETH',
    'SOLANA': 'SOL',
  }
  const key = aliases[normalized] || normalized
  return MOCK_ASSETS[key] || null
}

export function inferUnknownTicker(ticker: string): AssetMeta {
  const t = ticker.toUpperCase().trim()
  if (t.endsWith('11')) {
    return asset({ ticker: t, name: t, category: 'fii-tijolo', sector: 'FII generico', dy: 7.5, beta: 0.5, expectedReturn: 9.5 })
  }
  if (/^[A-Z]{4}3[34]$/.test(t)) {
    return asset({ ticker: t, name: t, category: 'bdr', sector: 'BDR generico', dy: 0.5, beta: 1.1, internacional: true, expectedReturn: 12 })
  }
  return asset({ ticker: t, name: t, category: 'acoes-br', sector: 'Acao generica', dy: 4.0, beta: 1.1, expectedReturn: 10 })
}

function bandFor(score: number): { band: PortfolioBand, label: string, description: string } {
  if (score < 45) return { band: 'critico', label: 'Critica', description: 'Carteira com riscos relevantes que merecem acao imediata.' }
  if (score < 65) return { band: 'atencao', label: 'Em atencao', description: 'Carteira funcional, mas com gaps importantes para fortalecer.' }
  if (score < 82) return { band: 'bom', label: 'Boa', description: 'Carteira solida, com pontos de melhoria identificados.' }
  return { band: 'excelente', label: 'Excelente', description: 'Carteira bem balanceada, com diversificacao e qualidade altas.' }
}

// ----------------------------------------------------------------------
// Dimensoes (9 agora, vs 7 antes)
// ----------------------------------------------------------------------

function calcDiversificacao(assets: PortfolioAsset[]): PortfolioDimension {
  const n = assets.length
  let score = 0
  if (n <= 2) score = 25
  else if (n <= 4) score = 50
  else if (n <= 6) score = 70
  else if (n <= 9) score = 88
  else score = 95
  const sectors = new Set(assets.map(a => a.sector))
  if (sectors.size === 1) score = Math.min(score, 30)
  const level = score < 45 ? 'Fraca' : score < 70 ? 'Media' : 'Forte'
  const tone: PortfolioDimension['tone'] = score < 45 ? 'bad' : score < 70 ? 'mid' : 'good'
  return {
    id: 'diversificacao', label: 'Diversificacao', score, level, tone,
    explanation: `${n} ativos em ${sectors.size} setores diferentes.`,
  }
}

function calcConcentracao(assets: PortfolioAsset[]): PortfolioDimension {
  const max = Math.max(...assets.map(a => a.weight))
  const bySector = new Map<string, number>()
  for (const a of assets) bySector.set(a.sector, (bySector.get(a.sector) || 0) + a.weight)
  const maxSector = Math.max(...bySector.values())
  const ativoScore = max < 0.15 ? 95 : max < 0.25 ? 78 : max < 0.40 ? 55 : max < 0.55 ? 32 : 12
  const setorScore = maxSector < 0.25 ? 95 : maxSector < 0.40 ? 70 : maxSector < 0.55 ? 45 : maxSector < 0.70 ? 22 : 8
  const score = Math.round((ativoScore + setorScore) / 2)
  const level = score < 40 ? 'Alta' : score < 70 ? 'Moderada' : 'Saudavel'
  const tone: PortfolioDimension['tone'] = score < 40 ? 'bad' : score < 70 ? 'mid' : 'good'
  return {
    id: 'concentracao', label: 'Concentracao', score, level, tone,
    explanation: `Maior ativo: ${(max * 100).toFixed(0)}%. Maior setor: ${(maxSector * 100).toFixed(0)}%.`,
  }
}

function calcQualidade(assets: PortfolioAsset[]): PortfolioDimension {
  const piorando = assets.filter(a => a.fundamentoStatus === 'piorando').reduce((s, a) => s + a.weight, 0)
  const melhorando = assets.filter(a => a.fundamentoStatus === 'melhorando').reduce((s, a) => s + a.weight, 0)
  const score = clamp(70 + (melhorando * 30) - (piorando * 60), 10, 98)
  const level = score < 45 ? 'Fraca' : score < 70 ? 'Media' : 'Forte'
  const tone: PortfolioDimension['tone'] = score < 45 ? 'bad' : score < 70 ? 'mid' : 'good'
  return {
    id: 'qualidade', label: 'Fundamentos', score: Math.round(score), level, tone,
    explanation: `${(piorando * 100).toFixed(0)}% da carteira em ativos com fundamentos piorando.`,
  }
}

function calcRendaPassiva(assets: PortfolioAsset[]): PortfolioDimension {
  const dyPonderado = assets.reduce((s, a) => s + a.dy * a.weight, 0)
  const score = dyPonderado < 2 ? 25 : dyPonderado < 4 ? 50 : dyPonderado < 6 ? 70 : dyPonderado < 9 ? 88 : 95
  const level = score < 45 ? 'Baixa' : score < 70 ? 'Media' : 'Forte'
  const tone: PortfolioDimension['tone'] = score < 45 ? 'mid' : score < 70 ? 'mid' : 'good'
  return {
    id: 'renda', label: 'Renda passiva', score, level, tone,
    explanation: `DY ponderado de ${dyPonderado.toFixed(1)}% ao ano.`,
  }
}

function calcCambial(assets: PortfolioAsset[]): PortfolioDimension {
  const exposicao = assets.filter(a => a.internacional).reduce((s, a) => s + a.weight, 0)
  let score = 0
  if (exposicao < 0.05) score = 22
  else if (exposicao < 0.10) score = 48
  else if (exposicao < 0.20) score = 78
  else if (exposicao < 0.35) score = 92
  else if (exposicao < 0.55) score = 70
  else score = 45
  const level = exposicao < 0.05 ? 'Inexistente' : exposicao < 0.10 ? 'Baixa' : exposicao < 0.30 ? 'Saudavel' : 'Elevada'
  const tone: PortfolioDimension['tone'] = score < 45 ? 'bad' : score < 70 ? 'mid' : 'good'
  return {
    id: 'cambial', label: 'Protecao cambial', score, level, tone,
    explanation: `${(exposicao * 100).toFixed(0)}% da carteira em ativos dolarizados.`,
  }
}

function calcLiquidez(assets: PortfolioAsset[]): PortfolioDimension {
  const baixa = assets.filter(a => a.liquidez === 'baixa').reduce((s, a) => s + a.weight, 0)
  const score = baixa > 0.3 ? 30 : baixa > 0.15 ? 55 : 88
  const level = score < 45 ? 'Baixa' : score < 70 ? 'Media' : 'Alta'
  const tone: PortfolioDimension['tone'] = score < 45 ? 'bad' : score < 70 ? 'mid' : 'good'
  return {
    id: 'liquidez', label: 'Liquidez', score, level, tone,
    explanation: `${(baixa * 100).toFixed(0)}% em ativos de baixa liquidez.`,
  }
}

function calcVolatilidade(assets: PortfolioAsset[]): PortfolioDimension {
  const beta = assets.reduce((s, a) => s + a.beta * a.weight, 0)
  let score = 0
  if (beta < 0.5) score = 88
  else if (beta < 0.8) score = 80
  else if (beta < 1.1) score = 68
  else if (beta < 1.4) score = 50
  else if (beta < 1.8) score = 32
  else score = 15
  const level = score < 45 ? 'Alta' : score < 70 ? 'Moderada' : 'Controlada'
  const tone: PortfolioDimension['tone'] = score < 45 ? 'bad' : score < 70 ? 'mid' : 'good'
  return {
    id: 'volatilidade', label: 'Volatilidade', score, level, tone,
    explanation: `Beta ponderado: ${beta.toFixed(2)} (mercado = 1.00).`,
  }
}

function calcCrescimento(assets: PortfolioAsset[]): PortfolioDimension {
  const cagrPonderado = assets.reduce((s, a) => s + a.expectedReturn * a.weight, 0)
  const score = cagrPonderado < 6 ? 30 : cagrPonderado < 10 ? 55 : cagrPonderado < 14 ? 75 : cagrPonderado < 18 ? 88 : 95
  const level = score < 45 ? 'Baixo' : score < 70 ? 'Moderado' : 'Forte'
  const tone: PortfolioDimension['tone'] = score < 45 ? 'mid' : score < 70 ? 'mid' : 'good'
  return {
    id: 'crescimento', label: 'Potencial de retorno', score, level, tone,
    explanation: `Retorno esperado de ${cagrPonderado.toFixed(1)}% ao ano.`,
  }
}

function calcMacro(assets: PortfolioAsset[]): PortfolioDimension {
  // Sensibilidade a Selic, dolar, IPCA, commodities
  const rfPosWeight = assets.filter(a => a.category === 'renda-fixa-pos').reduce((s, a) => s + a.weight, 0)
  const intl = assets.filter(a => a.internacional).reduce((s, a) => s + a.weight, 0)
  const ipca = assets.filter(a => a.category === 'renda-fixa-ipca').reduce((s, a) => s + a.weight, 0)
  // Carteira balanceada: 10-25% RF pos, 10-25% intl, 5-15% IPCA, resto variavel
  const balance = (rfPosWeight > 0.05 ? 25 : 0) + (intl > 0.10 ? 25 : intl > 0.05 ? 15 : 0)
    + (ipca > 0.05 ? 20 : 0) + 30  // baseline
  const score = clamp(balance, 25, 95)
  const level = score < 45 ? 'Fragil' : score < 70 ? 'Media' : 'Resistente'
  const tone: PortfolioDimension['tone'] = score < 45 ? 'bad' : score < 70 ? 'mid' : 'good'
  return {
    id: 'macro', label: 'Resiliencia macro', score, level, tone,
    explanation: `Mix RF pos ${(rfPosWeight * 100).toFixed(0)}% / IPCA ${(ipca * 100).toFixed(0)}% / Internacional ${(intl * 100).toFixed(0)}%.`,
  }
}

// ----------------------------------------------------------------------
// Novas analises
// ----------------------------------------------------------------------

function calcAllocationByClass(assets: PortfolioAsset[], primary: string): AllocationByClass[] {
  const labelMap: Record<AssetClass, { label: string, color: string }> = {
    'renda-fixa-pos': { label: 'Renda Fixa Pos', color: '#22c55e' },
    'renda-fixa-pre': { label: 'Renda Fixa Pre', color: '#16a34a' },
    'renda-fixa-ipca': { label: 'Renda Fixa IPCA+', color: '#15803d' },
    'acoes-br': { label: 'Acoes Brasil', color: primary },
    'fii-tijolo': { label: 'FII Tijolo', color: '#fb923c' },
    'fii-papel': { label: 'FII Papel', color: '#f97316' },
    'etf-br': { label: 'ETF Brasil', color: '#3b82f6' },
    'etf-intl': { label: 'ETF Internacional', color: '#6366f1' },
    'bdr': { label: 'BDR', color: '#8b5cf6' },
    'cripto': { label: 'Cripto', color: '#a855f7' },
  }
  const map = new Map<AssetClass, number>()
  for (const a of assets) map.set(a.category, (map.get(a.category) || 0) + a.weight)
  return Array.from(map.entries())
    .map(([classId, weight]) => ({ classId, label: labelMap[classId]?.label || classId, color: labelMap[classId]?.color || primary, weight }))
    .sort((a, b) => b.weight - a.weight)
}

function calcExpectedReturn(assets: PortfolioAsset[]): { value: number, label: string } {
  const value = assets.reduce((s, a) => s + a.expectedReturn * a.weight, 0)
  const cdiAssumed = 11.0
  const label = value >= cdiAssumed * 1.2 ? `Acima do CDI (~${(value / cdiAssumed).toFixed(1)}x)`
    : value >= cdiAssumed ? 'No nivel do CDI'
    : 'Abaixo do CDI'
  return { value, label }
}

function calcDividendForecast(assets: PortfolioAsset[]): { forecasts: DividendForecast[], total: number } {
  const forecasts: DividendForecast[] = []
  let total = 0
  for (const a of assets) {
    if (a.dy <= 0) continue
    // R$ 1000 investidos em cada ativo, peso ja considerado no total
    const monthlyAvg = (1000 * (a.dy / 100)) / 12
    forecasts.push({
      ticker: a.ticker,
      monthlyAvg: Math.round(monthlyAvg * 100) / 100,
      nextDate: ['hoje', 'em 5 dias', 'em 12 dias', 'em 18 dias', 'mes que vem'][forecasts.length % 5] || '—',
      yieldOnCost: a.dy,
    })
    // Para uma carteira de R$ 100k, dividendo mensal = peso * R$100k * dy/12
    total += a.weight * 100000 * (a.dy / 100) / 12
  }
  return { forecasts: forecasts.sort((a, b) => b.yieldOnCost - a.yieldOnCost).slice(0, 6), total: Math.round(total) }
}

function calcBenchmarks(assets: PortfolioAsset[]): BenchmarkComparison[] {
  const expected = assets.reduce((s, a) => s + a.expectedReturn * a.weight, 0)
  const cdi = 11.0
  const ibov = 11.2
  const sp500 = 11.6
  const ifix = 10.4
  const ratio = (a: number, b: number): 'above' | 'below' | 'inline' => a > b * 1.05 ? 'above' : a < b * 0.95 ? 'below' : 'inline'
  return [
    { label: 'CDI (Selic)', expected: cdi, cdiRatio: 1.0, vs: ratio(expected, cdi) },
    { label: 'Ibovespa', expected: ibov, cdiRatio: ibov / cdi, vs: ratio(expected, ibov) },
    { label: 'IFIX', expected: ifix, cdiRatio: ifix / cdi, vs: ratio(expected, ifix) },
    { label: 'S&P 500 em BRL', expected: sp500, cdiRatio: sp500 / cdi, vs: ratio(expected, sp500) },
  ]
}

function calcStressScenarios(assets: PortfolioAsset[]): StressScenario[] {
  const ibovExposure = assets.filter(a => a.category === 'acoes-br' || a.category === 'etf-br').reduce((s, a) => s + a.weight, 0)
  const dollarExposure = assets.filter(a => a.internacional).reduce((s, a) => s + a.weight, 0)
  const fiiExposure = assets.filter(a => a.category === 'fii-tijolo' || a.category === 'fii-papel').reduce((s, a) => s + a.weight, 0)
  const cryptoExposure = assets.filter(a => a.category === 'cripto').reduce((s, a) => s + a.weight, 0)
  const rfExposure = assets.filter(a => a.category.startsWith('renda-fixa')).reduce((s, a) => s + a.weight, 0)

  const scenarios: StressScenario[] = []

  // Cenario 1: Crash de 20% no Ibov
  const crashImpact = -(ibovExposure * 20 + fiiExposure * 8 + cryptoExposure * 30) + (rfExposure * 0.5)
  scenarios.push({
    id: 'crash-ibov',
    icon: 'i-lucide-trending-down',
    title: 'Crash de -20% no Ibovespa',
    description: 'Cenario de queda forte do mercado domestico, similar a marco/2020.',
    impact: crashImpact,
    resilience: crashImpact > -10 ? 'forte' : crashImpact > -18 ? 'media' : 'fraca',
  })

  // Cenario 2: Alta de 30% do dolar
  const dollarImpact = (dollarExposure * 28) - (ibovExposure * 4)
  scenarios.push({
    id: 'dollar-spike',
    icon: 'i-lucide-globe',
    title: 'Alta de +30% do dolar',
    description: 'Real desvaloriza, ativos dolarizados se valorizam, mercado domestico sofre.',
    impact: dollarImpact,
    resilience: dollarImpact > -2 ? 'forte' : dollarImpact > -8 ? 'media' : 'fraca',
  })

  // Cenario 3: Selic sobe 4pp (de 11% pra 15%)
  const selicImpact = (rfExposure * 4) - (ibovExposure * 8) - (fiiExposure * 12)
  scenarios.push({
    id: 'selic-up',
    icon: 'i-lucide-arrow-up-right',
    title: 'Selic sobe para 15%',
    description: 'Renda fixa atrai fluxo, FIIs e acoes pagam o pato.',
    impact: selicImpact,
    resilience: selicImpact > -2 ? 'forte' : selicImpact > -8 ? 'media' : 'fraca',
  })

  // Cenario 4: Selic cai 4pp (pra 7%)
  const selicDownImpact = (ibovExposure * 14) + (fiiExposure * 18) - (rfExposure * 2)
  scenarios.push({
    id: 'selic-down',
    icon: 'i-lucide-arrow-down-right',
    title: 'Selic cai para 7%',
    description: 'Bull market classico para variavel. Renda fixa perde atratividade.',
    impact: selicDownImpact,
    resilience: selicDownImpact > 5 ? 'forte' : selicDownImpact > 0 ? 'media' : 'fraca',
  })

  return scenarios
}

function calcAlternatives(assets: PortfolioAsset[]): AssetAlternative[] {
  const myTickers = new Set(assets.map(a => a.ticker))
  return MOCK_ALTERNATIVES.filter(alt => myTickers.has(alt.fromTicker))
}

function calcMacroExposure(assets: PortfolioAsset[]): { factor: string, level: 'high' | 'medium' | 'low', impact: string }[] {
  const ibov = assets.filter(a => a.category === 'acoes-br' || a.category === 'etf-br' || a.category === 'fii-tijolo').reduce((s, a) => s + a.weight, 0)
  const dollar = assets.filter(a => a.internacional).reduce((s, a) => s + a.weight, 0)
  const ipca = assets.filter(a => a.category === 'renda-fixa-ipca' || a.sector.includes('Eletrica')).reduce((s, a) => s + a.weight, 0)
  const commodities = assets.filter(a => a.sector === 'Mineracao' || a.sector === 'Energia' || a.sector === 'Siderurgia').reduce((s, a) => s + a.weight, 0)

  const ll = (w: number, hi: number, mi: number): 'high' | 'medium' | 'low' => w > hi ? 'high' : w > mi ? 'medium' : 'low'

  return [
    { factor: 'Selic / juros domestico', level: ll(ibov, 0.5, 0.25), impact: `${(ibov * 100).toFixed(0)}% da carteira sensivel a politica monetaria do Brasil.` },
    { factor: 'Cambio (USD/BRL)', level: ll(dollar, 0.25, 0.10), impact: `${(dollar * 100).toFixed(0)}% em ativos dolarizados, ganha com desvalorizacao do real.` },
    { factor: 'Inflacao (IPCA)', level: ll(ipca, 0.20, 0.10), impact: `${(ipca * 100).toFixed(0)}% indexada ao IPCA, protege contra inflacao.` },
    { factor: 'Commodities globais', level: ll(commodities, 0.25, 0.10), impact: `${(commodities * 100).toFixed(0)}% atrelada a precos de minerio, petroleo e aco.` },
  ]
}

function calcThesesAtRisk(assets: PortfolioAsset[]): { ticker: string, status: string, reason: string }[] {
  return assets
    .filter(a => a.thesisStatus !== 'mantida')
    .map(a => ({
      ticker: a.ticker,
      status: a.thesisStatus,
      reason: a.thesisNote,
    }))
    .sort((x, y) => {
      const order = { quebrada: 3, enfraquecida: 2, 'em-atencao': 1, mantida: 0 }
      return (order[y.status as keyof typeof order] || 0) - (order[x.status as keyof typeof order] || 0)
    })
}

function buildAIInsights(report: Pick<PortfolioReport, 'composition' | 'expectedReturn' | 'monthlyDividendsTotal' | 'allocationByClass' | 'sectorConcentration' | 'thesesAtRisk' | 'dimensions'>): AIInsight[] {
  const out: AIInsight[] = []
  const dims = new Map(report.dimensions.map(d => [d.id, d]))
  const stocksWeight = report.allocationByClass.find(a => a.classId === 'acoes-br')?.weight || 0
  const fiiWeight = (report.allocationByClass.find(a => a.classId === 'fii-tijolo')?.weight || 0) + (report.allocationByClass.find(a => a.classId === 'fii-papel')?.weight || 0)
  const intlWeight = (report.allocationByClass.find(a => a.classId === 'etf-intl')?.weight || 0) + (report.allocationByClass.find(a => a.classId === 'bdr')?.weight || 0)
  const rfWeight = report.allocationByClass.filter(a => a.classId.startsWith('renda-fixa')).reduce((s, a) => s + a.weight, 0)

  // Insight 1: composicao da carteira em linguagem natural
  const composicao: string[] = []
  if (stocksWeight > 0.20) composicao.push(`${(stocksWeight * 100).toFixed(0)}% em acoes brasileiras`)
  if (fiiWeight > 0.10) composicao.push(`${(fiiWeight * 100).toFixed(0)}% em fundos imobiliarios`)
  if (intlWeight > 0.05) composicao.push(`${(intlWeight * 100).toFixed(0)}% dolarizado`)
  if (rfWeight > 0.05) composicao.push(`${(rfWeight * 100).toFixed(0)}% em renda fixa`)
  if (composicao.length > 0) {
    out.push({
      icon: 'i-lucide-pie-chart',
      paragraph: `Sua carteira esta dividida em ${composicao.join(', ')}. Esta composicao retorna ${report.expectedReturn.toFixed(1)}% ao ano em media, baseado nos fundamentais e historico de cada ativo.`,
    })
  }

  // Insight 2: dividendos
  if (report.monthlyDividendsTotal > 0) {
    out.push({
      icon: 'i-lucide-coins',
      paragraph: `Para cada R$ 100 mil investidos seguindo essa composicao, voce receberia em torno de R$ ${report.monthlyDividendsTotal.toLocaleString('pt-BR')} por mes em dividendos e juros sobre capital proprio. Isso significa ${(report.monthlyDividendsTotal * 12 / 1000).toFixed(1)}% ao ano em renda passiva.`,
    })
  }

  // Insight 3: top setor
  const top = report.sectorConcentration[0]
  if (top && top.weight > 0.30) {
    out.push({
      icon: 'i-lucide-target',
      paragraph: `O setor "${top.sector}" representa ${(top.weight * 100).toFixed(0)}% da sua carteira. Isso significa que eventos macro contra esse setor (regulatorios, ciclicos, tributarios) impactam de forma desproporcional. Considere reduzir para 25-30%.`,
    })
  }

  // Insight 4: teses em risco
  if (report.thesesAtRisk.length > 0) {
    const critical = report.thesesAtRisk.filter(t => t.status === 'quebrada' || t.status === 'enfraquecida')
    if (critical.length > 0) {
      out.push({
        icon: 'i-lucide-alert-triangle',
        paragraph: `${critical.length} ${critical.length > 1 ? 'ativos' : 'ativo'} (${critical.map(t => t.ticker).join(', ')}) ${critical.length > 1 ? 'tem' : 'tem'} a tese original enfraquecida ou quebrada. Vale revisar se a razao de compra original ainda se aplica.`,
      })
    }
  }

  // Insight 5: protecao cambial
  if ((dims.get('cambial')?.score ?? 0) < 50) {
    out.push({
      icon: 'i-lucide-globe',
      paragraph: `Sua carteira tem baixa exposicao internacional. Em cenarios de desvalorizacao do real (alta do dolar), seu poder de compra cai junto. ETFs como IVVB11 ou BDRs como AAPL34/MSFT34 podem corrigir isso sem precisar abrir conta no exterior.`,
    })
  }

  // Insight 6: fundamentos vs preco
  const piorando = report.composition.filter(a => a.fundamentoStatus === 'piorando')
  if (piorando.length > 0) {
    out.push({
      icon: 'i-lucide-trending-down',
      paragraph: `${piorando.length} ${piorando.length > 1 ? 'ativos' : 'ativo'} com fundamentos deteriorando: ${piorando.map(a => a.ticker).join(', ')}. Margens, ROE e CAGR de lucro mostram piora consistente. Vale comparar com pares do mesmo setor.`,
    })
  }

  return out.slice(0, 6)
}

function buildSuggestedQuestions(assets: PortfolioAsset[]): SuggestedQuestion[] {
  const tickers = assets.map(a => a.ticker).filter(t => !t.includes('TESOURO')).slice(0, 3)
  const questions: SuggestedQuestion[] = [
    { text: 'Minha carteira esta bem diversificada?', href: '/help?q=Minha+carteira+esta+bem+diversificada%3F' },
    { text: 'O que mais afetou minha carteira hoje?', href: '/help?q=O+que+mais+afetou+minha+carteira+hoje%3F' },
    { text: 'Quais ativos estao mais arriscados?', href: '/help?q=Quais+ativos+estao+mais+arriscados%3F' },
    { text: 'Tenho exposicao demais a algum setor?', href: '/help?q=Tenho+exposicao+demais+a+algum+setor%3F' },
    { text: 'Minha renda passiva e sustentavel?', href: '/help?q=Minha+renda+passiva+e+sustentavel%3F' },
    { text: 'Minha carteira esta melhor que o CDI?', href: '/help?q=Minha+carteira+esta+melhor+que+o+CDI%3F' },
  ]
  if (tickers[0]) questions.push({ text: `Como esta o ${tickers[0]} nos fundamentos?`, href: `/help?q=Como+esta+o+${tickers[0]}+nos+fundamentos%3F` })
  if (tickers[1]) questions.push({ text: `Devo manter ${tickers[1]} ou trocar por outro?`, href: `/help?q=Devo+manter+${tickers[1]}+ou+trocar%3F` })
  return questions.slice(0, 6)
}

// ----------------------------------------------------------------------
// Strengths / Risks (mantidos, com mais variantes)
// ----------------------------------------------------------------------

function detectStrengths(report: Pick<PortfolioReport, 'composition' | 'dimensions' | 'expectedReturn'>): PortfolioStrength[] {
  const out: PortfolioStrength[] = []
  const dims = new Map(report.dimensions.map(d => [d.id, d]))
  if ((dims.get('renda')?.score ?? 0) >= 70) out.push({ icon: 'i-lucide-coins', title: 'Renda passiva acima da media', description: dims.get('renda')!.explanation })
  if ((dims.get('cambial')?.score ?? 0) >= 70) out.push({ icon: 'i-lucide-globe', title: 'Boa protecao cambial', description: dims.get('cambial')!.explanation })
  if ((dims.get('liquidez')?.score ?? 0) >= 70) out.push({ icon: 'i-lucide-zap', title: 'Carteira liquida', description: 'Voce consegue desfazer posicoes sem virar lentamente.' })
  if ((dims.get('diversificacao')?.score ?? 0) >= 70) out.push({ icon: 'i-lucide-shapes', title: 'Diversificacao saudavel', description: dims.get('diversificacao')!.explanation })
  if ((dims.get('volatilidade')?.score ?? 0) >= 70) out.push({ icon: 'i-lucide-shield-check', title: 'Volatilidade sob controle', description: dims.get('volatilidade')!.explanation })
  if ((dims.get('crescimento')?.score ?? 0) >= 70) out.push({ icon: 'i-lucide-trending-up', title: 'Potencial de retorno forte', description: `Retorno esperado de ${report.expectedReturn.toFixed(1)}% ao ano supera o CDI.` })
  if ((dims.get('macro')?.score ?? 0) >= 70) out.push({ icon: 'i-lucide-anchor', title: 'Resiliencia macro', description: dims.get('macro')!.explanation })
  if ((dims.get('qualidade')?.score ?? 0) >= 75) out.push({ icon: 'i-lucide-award', title: 'Fundamentos solidos', description: 'A maioria dos ativos esta com fundamentos estaveis ou melhorando.' })
  if (out.length === 0) out.push({ icon: 'i-lucide-thumbs-up', title: 'Voce ja comecou', description: 'Ter uma carteira ja e mais do que a maioria. Agora vamos refina-la.' })
  return out.slice(0, 6)
}

function detectRisks(report: Pick<PortfolioReport, 'composition' | 'dimensions' | 'sectorConcentration' | 'thesesAtRisk'>): PortfolioRisk[] {
  const out: PortfolioRisk[] = []
  const dims = new Map(report.dimensions.map(d => [d.id, d]))

  const topSector = report.sectorConcentration[0]
  if (topSector && topSector.weight > 0.30) {
    out.push({
      icon: 'i-lucide-target',
      severity: topSector.weight > 0.45 ? 'high' : 'medium',
      title: `${(topSector.weight * 100).toFixed(0)}% concentrado em ${topSector.sector}`,
      description: 'Eventos macro contra esse setor te impactam de forma desproporcional.',
    })
  }

  if ((dims.get('cambial')?.score ?? 0) < 45) {
    out.push({
      icon: 'i-lucide-globe',
      severity: 'medium',
      title: 'Baixa exposicao internacional',
      description: 'Toda sua renda esta amarrada ao real. Considere ETF/BDR para proteger contra desvalorizacao.',
    })
  }

  const piorando = report.composition.filter(a => a.fundamentoStatus === 'piorando')
  if (piorando.length > 0) {
    const tickers = piorando.map(a => a.ticker).join(', ')
    out.push({
      icon: 'i-lucide-trending-down',
      severity: piorando.length >= 2 ? 'high' : 'medium',
      title: `${piorando.length} ativo${piorando.length > 1 ? 's' : ''} com fundamentos deteriorando`,
      description: piorando.length > 1
        ? `Atencao: ${tickers} mostram piora em margens ou endividamento.`
        : `Atencao: ${tickers} mostra piora em margens ou endividamento.`,
    })
  }

  if ((dims.get('volatilidade')?.score ?? 0) < 45) {
    out.push({
      icon: 'i-lucide-activity',
      severity: 'medium',
      title: 'Carteira com volatilidade alta',
      description: dims.get('volatilidade')!.explanation,
    })
  }

  const max = Math.max(...report.composition.map(a => a.weight))
  if (max > 0.40) {
    const top = report.composition.find(a => a.weight === max)!
    out.push({
      icon: 'i-lucide-pie-chart',
      severity: max > 0.55 ? 'high' : 'medium',
      title: `${top.ticker} representa ${(max * 100).toFixed(0)}% da carteira`,
      description: 'Um unico ativo com peso desproporcional eleva o risco idiossincratico.',
    })
  }

  // Tese quebrada
  const broken = report.thesesAtRisk.filter(t => t.status === 'quebrada')
  if (broken.length > 0) {
    out.push({
      icon: 'i-lucide-alert-octagon',
      severity: 'high',
      title: `Tese de ${broken.map(b => b.ticker).join(', ')} quebrada`,
      description: 'A razao original da compra nao se sustenta mais. Revisar urgentemente.',
    })
  }

  // Macro
  if ((dims.get('macro')?.score ?? 0) < 45) {
    out.push({
      icon: 'i-lucide-anchor',
      severity: 'medium',
      title: 'Carteira fragil a choques macro',
      description: 'Falta colchao de renda fixa pos ou hedge cambial em proporcao saudavel.',
    })
  }

  return out.slice(0, 7)
}

function pickEvents(assets: PortfolioAsset[]): PortfolioEvent[] {
  const out: PortfolioEvent[] = []
  for (const a of assets) {
    const ev = MOCK_EVENTS[a.ticker]
    if (ev) out.push(...ev)
  }
  if (out.length === 0) out.push({ ticker: '—', headline: 'Selic mantida em 11,75% pelo Copom', source: 'BCB', impact: 'neutral', date: 'hoje' })
  return out.slice(0, 6)
}

function calcSectorConcentration(assets: PortfolioAsset[]) {
  const map = new Map<string, number>()
  for (const a of assets) map.set(a.sector, (map.get(a.sector) || 0) + a.weight)
  return Array.from(map.entries()).map(([sector, weight]) => ({ sector, weight })).sort((a, b) => b.weight - a.weight)
}

// ----------------------------------------------------------------------
// API publica
// ----------------------------------------------------------------------

export interface PortfolioInput {
  ticker: string
  weight?: number
}

export function analyzePortfolio(inputs: PortfolioInput[], primaryColor = '#F5A623'): PortfolioReport {
  if (inputs.length === 0) return emptyReport()

  const totalWeight = inputs.reduce((s, i) => s + (i.weight ?? 0), 0)
  const useEqual = totalWeight === 0
  const equalWeight = 1 / inputs.length

  const composition: PortfolioAsset[] = inputs.map((input) => {
    const meta = resolveTicker(input.ticker) || inferUnknownTicker(input.ticker)
    const weight = useEqual ? equalWeight : (input.weight! / totalWeight)
    return { ...meta, weight }
  })

  const dimensions = [
    calcDiversificacao(composition),
    calcConcentracao(composition),
    calcQualidade(composition),
    calcRendaPassiva(composition),
    calcCambial(composition),
    calcLiquidez(composition),
    calcVolatilidade(composition),
    calcCrescimento(composition),
    calcMacro(composition),
  ]

  const weights: Record<PortfolioDimension['id'], number> = {
    diversificacao: 1.4, concentracao: 1.4, qualidade: 1.5, renda: 0.9,
    cambial: 1.0, liquidez: 0.7, volatilidade: 1.1, crescimento: 1.0, macro: 1.0,
  }
  let total = 0; let totalW = 0
  for (const d of dimensions) {
    const w = weights[d.id]
    total += d.score * w
    totalW += w
  }
  const score = Math.round(total / totalW)
  const bandData = bandFor(score)
  const sectorConcentration = calcSectorConcentration(composition)
  const allocationByClass = calcAllocationByClass(composition, primaryColor)
  const expReturn = calcExpectedReturn(composition)
  const div = calcDividendForecast(composition)
  const benchmarks = calcBenchmarks(composition)
  const stressScenarios = calcStressScenarios(composition)
  const alternatives = calcAlternatives(composition)
  const macroExposure = calcMacroExposure(composition)
  const thesesAtRisk = calcThesesAtRisk(composition)
  const events = pickEvents(composition)

  const partial = {
    composition, dimensions, sectorConcentration, allocationByClass,
    expectedReturn: expReturn.value, monthlyDividendsTotal: div.total,
    thesesAtRisk,
  }
  const strengths = detectStrengths({ ...partial })
  const risks = detectRisks({ ...partial })
  const aiInsights = buildAIInsights({ ...partial })
  const suggestedQuestions = buildSuggestedQuestions(composition)
  const metaCompliance = clamp(Math.round(score * 0.95 + 5), 30, 98)

  return {
    score,
    band: bandData.band,
    bandLabel: bandData.label,
    bandDescription: bandData.description,
    composition,
    dimensions,
    strengths,
    risks,
    events,
    metaCompliance,
    sectorConcentration,
    allocationByClass,
    expectedReturn: expReturn.value,
    expectedReturnLabel: expReturn.label,
    dividendForecast: div.forecasts,
    monthlyDividendsTotal: div.total,
    benchmarks,
    stressScenarios,
    alternatives,
    aiInsights,
    suggestedQuestions,
    thesesAtRisk,
    macroExposure,
  }
}

function emptyReport(): PortfolioReport {
  return {
    score: 0, band: 'atencao', bandLabel: 'Aguardando',
    bandDescription: 'Adicione ativos para comecar a analise.',
    composition: [], dimensions: [], strengths: [], risks: [],
    events: [], metaCompliance: 0, sectorConcentration: [],
    allocationByClass: [], expectedReturn: 0, expectedReturnLabel: '—',
    dividendForecast: [], monthlyDividendsTotal: 0, benchmarks: [],
    stressScenarios: [], alternatives: [], aiInsights: [],
    suggestedQuestions: [], thesesAtRisk: [], macroExposure: [],
  }
}

export const DEMO_PORTFOLIO: PortfolioInput[] = [
  { ticker: 'PETR4', weight: 24 },
  { ticker: 'ITUB4', weight: 18 },
  { ticker: 'MXRF11', weight: 16 },
  { ticker: 'HGLG11', weight: 14 },
  { ticker: 'IVVB11', weight: 12 },
  { ticker: 'TESOURO_SELIC', weight: 16 },
]

export const SUGGESTED_TICKERS = [
  'PETR4', 'ITUB4', 'BBAS3', 'VALE3', 'WEGE3', 'MXRF11', 'HGLG11', 'IVVB11', 'BBDC4', 'ABEV3',
]

// ----------------------------------------------------------------------
// Integracao com APIs reais (fundamentals-scraper + Laravel + news-scraper)
// ----------------------------------------------------------------------
//
// Endpoints consumidos:
//  - GET /tickers/{ticker}                    -> preco, type, name, logo, market_cap
//  - GET /fundamentals/{ticker}/overview      -> 51 campos do StatusInvest scrape
//  - GET /news/ticker/{ticker}?limit=2        -> eventos do news-scraper
//  - GET /dividends/{ticker}                  -> historico de dividendos (opcional)
//
// Estrategia: Promise.allSettled por ticker, paraleliza tudo.
// Quando a API falha (ticker desconhecido/sem fundamentos), cai pro mock
// estatico do composable como fallback gracioso.

interface TickerApiResponse {
  ticker: string
  name?: string
  logo?: string
  type?: 'STOCK' | 'REIT' | 'ETF' | 'BDR' | string
  market_price?: number
  change_percent?: number
  market_cap?: number
}

interface FundamentusScrapeResponse {
  ticker: string
  scrape_extras: any | null
  key_statistics?: any
  financial_data?: any
}

interface NewsArticleResponse {
  title?: string
  url?: string
  source?: string
  source_name?: string
  published_at?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

function timeAgoLabel(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'hoje'
  if (days === 1) return '1 dia atras'
  if (days <= 14) return `${days} dias atras`
  return d.toLocaleDateString('pt-BR')
}

function num(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v)
  return Number.isFinite(n) ? n : undefined
}

// Normaliza valor que pode vir do backend em decimal (0.058 = 5.8%) OU
// ja em formato % (5.8). Heuristica: se |v| < 2.5, e decimal e multiplica
// por 100. Se >= 2.5, assume que ja esta em % (DY de cripto chega a 30%,
// ROE de empresas top chega a 100%+, mas nada acima de 2.5 e razoavelmente
// "decimal").
function pct(v: number | undefined): number | undefined {
  if (v === undefined) return undefined
  return Math.abs(v) >= 2.5 ? v : v * 100
}

function inferCategoryFromApi(type: string | undefined, sector?: string, ticker?: string, anbimaSegment?: string): AssetClass {
  const t = (type || '').toUpperCase()
  const s = (sector || '').toLowerCase()
  const a = (anbimaSegment || '').toLowerCase()
  if (t === 'STOCK') return 'acoes-br'
  if (t === 'REIT') {
    // Tabela conhecida de FIIs papel
    const FII_PAPEL_KNOWN = new Set(['MXRF11', 'KNCR11', 'KNIP11', 'KNHY11', 'IRDM11', 'BCFF11', 'RBRR11', 'VGIR11', 'VGIP11', 'RECT11'])
    if (ticker && FII_PAPEL_KNOWN.has(ticker.toUpperCase())) return 'fii-papel'
    if (a.includes('papel') || a.includes('recebivel') || a.includes('cri') || a.includes('renda fixa')) return 'fii-papel'
    if (s.includes('papel') || s.includes('cri') || s.includes('recebivel')) return 'fii-papel'
    return 'fii-tijolo'
  }
  if (t === 'ETF') {
    if (sector && /(s&p|nasdaq|exterior|internacional|global)/i.test(sector)) return 'etf-intl'
    if (ticker && /^(IVVB|BIVB|ACWI|SPXI|XINA|EURP)/i.test(ticker)) return 'etf-intl'
    return 'etf-br'
  }
  if (t === 'BDR') return 'bdr'
  return 'acoes-br'
}

function computeFundamentoStatus(
  earningsCagr5y: number | undefined,
  revenueCagr5y: number | undefined,
): PortfolioAsset['fundamentoStatus'] {
  const e = earningsCagr5y ?? 0
  const r = revenueCagr5y ?? 0
  if (e > 12 && r > 8) return 'melhorando'
  if (e < -3 || (e < 2 && r < 0)) return 'piorando'
  return 'estavel'
}

function estimateExpectedReturn(
  category: AssetClass,
  dy: number,
  earningsCagr5y: number | undefined,
): number {
  // Heuristica simples: DY + crescimento real esperado por classe.
  if (category === 'renda-fixa-pos') return 11.4
  if (category === 'renda-fixa-ipca') return 12.6
  if (category === 'renda-fixa-pre') return 12.0
  if (category === 'cripto') return 24.0
  const growth = earningsCagr5y !== undefined ? Math.max(-5, Math.min(20, earningsCagr5y * 0.6)) : 5
  return Math.max(0, Math.min(28, dy + growth))
}

function inferLogoBeta(category: AssetClass, ticker: string): number {
  if (category === 'renda-fixa-pos') return 0.05
  if (category === 'renda-fixa-pre') return 0.20
  if (category === 'renda-fixa-ipca') return 0.15
  if (category === 'fii-papel') return 0.4
  if (category === 'fii-tijolo') return 0.5
  if (category === 'etf-intl') return 0.7
  if (category === 'etf-br') return 1.0
  if (category === 'bdr') return 1.2
  if (category === 'cripto') return 3.0
  // Stock: heuristica por ticker
  const known: Record<string, number> = {
    PETR4: 1.4, PETR3: 1.4, VALE3: 1.5, ITUB4: 0.9, BBAS3: 1.0,
    BBDC4: 1.0, WEGE3: 0.9, MGLU3: 2.1, PRIO3: 1.6,
  }
  return known[ticker] || 1.1
}

async function fetchAssetReal(ticker: string, apiBase: string): Promise<AssetMeta | null> {
  const t = ticker.trim().toUpperCase()
  // Casos de mock fixo (Tesouro / Cripto)
  if (t.startsWith('TESOURO') || t === 'BTC' || t === 'ETH' || t === 'SOL' || t === 'BITCOIN' || t === 'ETHEREUM' || t === 'SOLANA') {
    return resolveTicker(t)
  }

  const [tickerResp, fundResp, newsResp] = await Promise.allSettled([
    $fetch<any>(`${apiBase}/tickers/${t}`, { method: 'GET' }).catch(() => null),
    $fetch<any>(`${apiBase}/fundamentals/${t}/overview`, { method: 'GET' }).catch(() => null),
    $fetch<any>(`${apiBase}/news/ticker/${t}?limit=2`, { method: 'GET' }).catch(() => null),
  ])

  const tickerRaw: TickerApiResponse | null = tickerResp.status === 'fulfilled' && tickerResp.value
    ? (tickerResp.value.data || tickerResp.value)
    : null

  const fundRaw: FundamentusScrapeResponse | null = fundResp.status === 'fulfilled' && fundResp.value
    ? (fundResp.value.data || fundResp.value)
    : null

  const news: NewsArticleResponse[] = newsResp.status === 'fulfilled' && newsResp.value
    ? (newsResp.value.data || newsResp.value || [])
    : []

  if (!tickerRaw && !fundRaw) {
    // Sem dado real, cai pro mock conhecido ou inferido
    const fallback = resolveTicker(t) || inferUnknownTicker(t)
    if (news.length > 0) {
      // Pega os eventos reais mesmo no fallback
      MOCK_EVENTS[t] = news.slice(0, 2).map(n => ({
        ticker: t,
        headline: n.title || '',
        source: n.source_name || n.source || '',
        impact: (n.sentiment as any) || 'neutral',
        date: timeAgoLabel(n.published_at),
      }))
    }
    return fallback
  }

  const extras = fundRaw?.scrape_extras
  const isStock = !extras || extras.asset_type === undefined || extras.asset_type === 'stock'
  const isFII = extras?.asset_type === 'fii'
  const isETF = extras?.asset_type === 'etf'

  // Identidade
  const sector = extras?.identity?.sector || (fundRaw as any)?.financial_data?.sector || tickerRaw?.type || 'Acoes'
  const name = extras?.identity?.company_name || tickerRaw?.name || t
  const logo = extras?.identity?.logo || tickerRaw?.logo
  const anbimaSegment = extras?.fii?.anbima_segment

  const category = inferCategoryFromApi(tickerRaw?.type, sector, t, anbimaSegment)

  // Fundamentos por tipo
  const fundamentals: AssetFundamentals = {}

  if (isStock) {
    const v = extras?.valuation || {}
    const l = extras?.leverage || {}
    const q = extras?.quality || {}
    const g = extras?.growth || {}
    fundamentals.pl = num(v.price_to_earnings)
    fundamentals.pvp = num(v.price_to_book)
    fundamentals.evEbitda = num(v.ev_ebitda)
    fundamentals.netDebtEbitda = num(l.net_debt_to_ebitda)
    fundamentals.roe = pct(num(q.return_on_equity))
    fundamentals.roic = pct(num(q.return_on_invested_capital))
    fundamentals.marginNet = pct(num(q.net_margin)) ?? pct(num((fundRaw as any)?.financial_data?.profit_margins))
    fundamentals.marginEbitda = pct(num(q.ebitda_margin))
    fundamentals.revenueCagr5y = pct(num(g.revenue_cagr_5y))
    fundamentals.earningsCagr5y = pct(num(g.earnings_cagr_5y))
    fundamentals.payout = pct(num((extras as any)?.dividends?.payout_ratio))
    fundamentals.marketCap = num(v.market_cap) ? num(v.market_cap)! / 1e9 : undefined
  } else if (isFII) {
    const f = extras.fii || {}
    fundamentals.pVpa = num(f.price_to_book)
    fundamentals.ifixShare = pct(num(f.ifix_share))
    fundamentals.numCotistas = num(f.num_shareholders)
  } else if (isETF) {
    const e = extras.etf || {}
    fundamentals.marketCap = num(e.market_cap) ? num(e.market_cap)! / 1e9 : undefined
  }

  // DY de varias fontes possiveis (sempre normalizado pra %)
  let dy = 0
  const dyCandidate
    = (isFII && num(extras?.fii?.dividend_yield_12m))
    ?? (isStock && num(extras?.valuation?.dividend_yield))
    ?? num((fundRaw as any)?.key_statistics?.dividend_yield)
  if (dyCandidate !== undefined && dyCandidate !== null && dyCandidate !== false) {
    dy = pct(dyCandidate as number) ?? 0
  }

  // Heuristicas para os campos sem API
  const beta = inferLogoBeta(category, t)
  const internacional = category === 'etf-intl' || category === 'bdr' || category === 'cripto'
  const expectedReturn = estimateExpectedReturn(category, dy, fundamentals.earningsCagr5y)
  const fundamentoStatus = computeFundamentoStatus(fundamentals.earningsCagr5y, fundamentals.revenueCagr5y)
  const liquidez: PortfolioAsset['liquidez'] = (fundamentals.marketCap || 0) > 5 ? 'alta' : (fundamentals.marketCap || 0) > 1 ? 'media' : 'baixa'

  // Status da tese: derivado de fundamentoStatus (sem API que cubra isso semanticamente)
  let thesisStatus: PortfolioAsset['thesisStatus'] = 'mantida'
  let thesisNote = 'Fundamentos estaveis nos ultimos trimestres.'
  if (fundamentoStatus === 'piorando') {
    thesisStatus = (fundamentals.earningsCagr5y ?? 0) < -10 ? 'quebrada' : 'enfraquecida'
    thesisNote = `Lucro com CAGR ${(fundamentals.earningsCagr5y ?? 0).toFixed(1)}% nos ultimos 5 anos. Vale revisar.`
  } else if (fundamentoStatus === 'melhorando') {
    thesisStatus = 'mantida'
    thesisNote = `Crescimento consistente: receita +${(fundamentals.revenueCagr5y ?? 0).toFixed(1)}% e lucro +${(fundamentals.earningsCagr5y ?? 0).toFixed(1)}% (5Y CAGR).`
  }
  // Override com mock se existe (tem nota mais rica)
  const mock = resolveTicker(t)
  if (mock?.thesisNote && mock.thesisNote.length > thesisNote.length) {
    thesisNote = mock.thesisNote
    if (mock.thesisStatus !== 'mantida') thesisStatus = mock.thesisStatus
  }

  // Salva eventos reais no MOCK_EVENTS (consumido por pickEvents)
  if (news.length > 0) {
    MOCK_EVENTS[t] = news.slice(0, 2).map(n => ({
      ticker: t,
      headline: n.title || '',
      source: n.source_name || n.source || 'Redent News',
      impact: (n.sentiment as any) || 'neutral',
      date: timeAgoLabel(n.published_at),
    }))
  }

  return {
    ticker: t,
    name,
    category,
    sector: sector || 'Acoes',
    dy,
    beta,
    internacional,
    fundamentoStatus,
    liquidez,
    expectedReturn,
    fundamentals,
    thesisStatus,
    thesisNote,
    logo,
    weight: 0,
  } as AssetMeta
}

export async function analyzePortfolioAsync(
  inputs: PortfolioInput[],
  apiBase: string,
  primaryColor = '#F5A623',
): Promise<PortfolioReport> {
  if (inputs.length === 0) return analyzePortfolio([], primaryColor)

  // Fetch real (com fallback) por ticker em paralelo
  const settled = await Promise.allSettled(
    inputs.map(i => fetchAssetReal(i.ticker, apiBase)),
  )

  const totalWeight = inputs.reduce((s, i) => s + (i.weight ?? 0), 0)
  const useEqual = totalWeight === 0
  const equalWeight = 1 / inputs.length

  const composition: PortfolioAsset[] = settled.map((res, idx) => {
    const input = inputs[idx]!
    const weight = useEqual ? equalWeight : (input.weight! / totalWeight)
    const meta = res.status === 'fulfilled' && res.value
      ? res.value
      : (resolveTicker(input.ticker) || inferUnknownTicker(input.ticker))
    return { ...meta, weight } as PortfolioAsset
  })

  // Reusa o pipeline sincrono passando uma carteira pre-resolvida
  return analyzePortfolioFromComposition(composition, primaryColor)
}

// Permite que analyzePortfolio reuse a mesma logica quando ja temos composition
function analyzePortfolioFromComposition(composition: PortfolioAsset[], primaryColor: string): PortfolioReport {
  const dimensions = [
    calcDiversificacao(composition),
    calcConcentracao(composition),
    calcQualidade(composition),
    calcRendaPassiva(composition),
    calcCambial(composition),
    calcLiquidez(composition),
    calcVolatilidade(composition),
    calcCrescimento(composition),
    calcMacro(composition),
  ]

  const weights: Record<PortfolioDimension['id'], number> = {
    diversificacao: 1.4, concentracao: 1.4, qualidade: 1.5, renda: 0.9,
    cambial: 1.0, liquidez: 0.7, volatilidade: 1.1, crescimento: 1.0, macro: 1.0,
  }
  let total = 0; let totalW = 0
  for (const d of dimensions) {
    const w = weights[d.id]
    total += d.score * w
    totalW += w
  }
  const score = Math.round(total / totalW)
  const bandData = bandFor(score)
  const sectorConcentration = calcSectorConcentration(composition)
  const allocationByClass = calcAllocationByClass(composition, primaryColor)
  const expReturn = calcExpectedReturn(composition)
  const div = calcDividendForecast(composition)
  const benchmarks = calcBenchmarks(composition)
  const stressScenarios = calcStressScenarios(composition)
  const alternatives = calcAlternatives(composition)
  const macroExposure = calcMacroExposure(composition)
  const thesesAtRisk = calcThesesAtRisk(composition)
  const events = pickEvents(composition)

  const partial = {
    composition, dimensions, sectorConcentration, allocationByClass,
    expectedReturn: expReturn.value, monthlyDividendsTotal: div.total,
    thesesAtRisk,
  }
  const strengths = detectStrengths({ ...partial })
  const risks = detectRisks({ ...partial })
  const aiInsights = buildAIInsights({ ...partial })
  const suggestedQuestions = buildSuggestedQuestions(composition)
  const metaCompliance = clamp(Math.round(score * 0.95 + 5), 30, 98)

  return {
    score, band: bandData.band, bandLabel: bandData.label, bandDescription: bandData.description,
    composition, dimensions, strengths, risks, events, metaCompliance, sectorConcentration,
    allocationByClass, expectedReturn: expReturn.value, expectedReturnLabel: expReturn.label,
    dividendForecast: div.forecasts, monthlyDividendsTotal: div.total, benchmarks,
    stressScenarios, alternatives, aiInsights, suggestedQuestions, thesesAtRisk, macroExposure,
  }
}

export function usePortfolioScore() {
  return { analyzePortfolio, analyzePortfolioAsync, resolveTicker, inferUnknownTicker, DEMO_PORTFOLIO, SUGGESTED_TICKERS }
}
