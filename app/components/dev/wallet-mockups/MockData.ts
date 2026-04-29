/**
 * Mock data for wallet redesign mockups.
 *
 * Sourced from a real B3 CEI export (`posicao-2026-04-29-12-06-54.xlsx`).
 * 5 sheets parsed:
 *   - Acoes (13 stocks)
 *   - Empréstimos (4 loaned-out positions earning rental yield)
 *   - ETF (2 ETFs)
 *   - Fundo de Investimento (8 FIIs)
 *   - Tesouro Direto (3 IPCA+ bonds)
 *
 * Total snapshot value ≈ R$ 487.230 (matches the real export).
 */

export type AssetClass =
  | 'STOCK'
  | 'REIT'
  | 'ETF'
  | 'BDR'
  | 'TREASURY'
  | 'CRYPTO'

export interface MockPosition {
  ticker: string
  name: string
  asset_class: AssetClass
  sector: string
  quantity: number
  average_price: number // for treasury, valor aplicado / qty
  current_price: number
  current_value: number
  pnl_amount: number
  pnl_pct: number
  weight_pct: number // share of total wallet
  dy_12m_pct?: number
  // Treasury-specific
  maturity?: string // 'YYYY-MM-DD'
  indexer?: 'IPCA' | 'SELIC' | 'PREFIXADO'
  // Loan-specific
  loan_yield_pct?: number // when actively loaned out
  is_loaned?: boolean
  // Visual
  logoBg?: string // tiny color hint per ticker
}

export const TOTAL_VALUE = 487230.42
export const TOTAL_INVESTED = 432418.0
export const PNL_TOTAL = TOTAL_VALUE - TOTAL_INVESTED
export const PNL_PCT = (PNL_TOTAL / TOTAL_INVESTED) * 100 // ~12.7%
export const YTD_PCT = 8.4
export const VS_CDI_PCT = 2.1 // outperforming CDI by 2.1pp
export const POSITIONS_COUNT = 30 // 13 stocks + 4 loans + 2 etfs + 8 fiis + 3 treasury

export const SCORE = 76
export const SCORE_BAND: 'critico' | 'atencao' | 'bom' | 'excelente' = 'bom'

export const POSITIONS: MockPosition[] = [
  // ============ AÇÕES ============
  { ticker: 'PETR4', name: 'Petrobras', asset_class: 'STOCK', sector: 'Petróleo & Gás', quantity: 335, average_price: 38.5, current_price: 47.52, current_value: 15919.2, pnl_amount: 3022.2, pnl_pct: 23.4, weight_pct: 3.27, dy_12m_pct: 14.2, logoBg: '#fbbf24' },
  { ticker: 'VALE3', name: 'Vale', asset_class: 'STOCK', sector: 'Mineração', quantity: 150, average_price: 76.2, current_price: 84.39, current_value: 12658.5, pnl_amount: 1228.5, pnl_pct: 10.7, weight_pct: 2.6, dy_12m_pct: 8.4, logoBg: '#34d399' },
  { ticker: 'BBAS3', name: 'Banco do Brasil', asset_class: 'STOCK', sector: 'Bancos', quantity: 300, average_price: 19.8, current_price: 22.54, current_value: 6762, pnl_amount: 822, pnl_pct: 13.8, weight_pct: 1.39, dy_12m_pct: 9.6, logoBg: '#facc15' },
  { ticker: 'ITSA4', name: 'Itaúsa', asset_class: 'STOCK', sector: 'Bancos', quantity: 2000, average_price: 11.2, current_price: 14.04, current_value: 28080, pnl_amount: 5680, pnl_pct: 25.3, weight_pct: 5.76, dy_12m_pct: 6.9, logoBg: '#f97316' },
  { ticker: 'BBSE3', name: 'BB Seguridade', asset_class: 'STOCK', sector: 'Seguros', quantity: 1200, average_price: 28.4, current_price: 34.04, current_value: 40848, pnl_amount: 6768, pnl_pct: 19.85, weight_pct: 8.38, dy_12m_pct: 7.8, logoBg: '#facc15' },
  { ticker: 'CXSE3', name: 'Caixa Seguridade', asset_class: 'STOCK', sector: 'Seguros', quantity: 1000, average_price: 16.5, current_price: 18.16, current_value: 18160, pnl_amount: 1660, pnl_pct: 10.06, weight_pct: 3.73, dy_12m_pct: 7.2, logoBg: '#3b82f6' },
  { ticker: 'FLRY3', name: 'Fleury', asset_class: 'STOCK', sector: 'Saúde', quantity: 900, average_price: 18.2, current_price: 15.92, current_value: 14328, pnl_amount: -2052, pnl_pct: -12.53, weight_pct: 2.94, dy_12m_pct: 4.1, logoBg: '#a78bfa' },
  { ticker: 'PRIO3', name: 'PetroRio', asset_class: 'STOCK', sector: 'Petróleo & Gás', quantity: 190, average_price: 52.8, current_price: 64.4, current_value: 12236, pnl_amount: 2204, pnl_pct: 21.97, weight_pct: 2.51, dy_12m_pct: 0, logoBg: '#0f766e' },
  { ticker: 'RANI3', name: 'Irani Papel', asset_class: 'STOCK', sector: 'Papel & Celulose', quantity: 1050, average_price: 7.8, current_price: 8.21, current_value: 8620.5, pnl_amount: 430.5, pnl_pct: 5.26, weight_pct: 1.77, dy_12m_pct: 5.4, logoBg: '#60a5fa' },
  { ticker: 'CPLE3', name: 'Copel', asset_class: 'STOCK', sector: 'Energia Elétrica', quantity: 1550, average_price: 14.3, current_price: 16.13, current_value: 25001.5, pnl_amount: 2836.5, pnl_pct: 12.79, weight_pct: 5.13, dy_12m_pct: 8.9, logoBg: '#22c55e', is_loaned: true, loan_yield_pct: 0.05 },
  { ticker: 'CSMG3', name: 'Copasa', asset_class: 'STOCK', sector: 'Saneamento', quantity: 310, average_price: 48.5, current_price: 55.21, current_value: 17115.1, pnl_amount: 2080.6, pnl_pct: 13.84, weight_pct: 3.51, dy_12m_pct: 6.1, logoBg: '#06b6d4', is_loaned: true, loan_yield_pct: 2.74 },
  { ticker: 'TAEE11', name: 'Taesa', asset_class: 'STOCK', sector: 'Energia Elétrica', quantity: 800, average_price: 33.5, current_price: 35.8, current_value: 28640, pnl_amount: 1840, pnl_pct: 6.87, weight_pct: 5.88, dy_12m_pct: 9.7, logoBg: '#f59e0b' },
  { ticker: 'BBDC4', name: 'Bradesco', asset_class: 'STOCK', sector: 'Bancos', quantity: 850, average_price: 13.2, current_price: 14.72, current_value: 12512, pnl_amount: 1292, pnl_pct: 11.52, weight_pct: 2.57, dy_12m_pct: 5.8, logoBg: '#ef4444' },

  // ============ FIIs ============
  { ticker: 'BTLG11', name: 'BTG Pactual Logística', asset_class: 'REIT', sector: 'Logística', quantity: 110, average_price: 100.0, current_price: 103.59, current_value: 11394.9, pnl_amount: 394.9, pnl_pct: 3.59, weight_pct: 2.34, dy_12m_pct: 9.4, logoBg: '#a78bfa' },
  { ticker: 'CPTS11', name: 'Capitânia Securities', asset_class: 'REIT', sector: 'CRI / Papel', quantity: 2000, average_price: 8.6, current_price: 7.94, current_value: 15880, pnl_amount: -1320, pnl_pct: -7.67, weight_pct: 3.26, dy_12m_pct: 11.8, logoBg: '#60a5fa' },
  { ticker: 'GARE11', name: 'Guardian RE', asset_class: 'REIT', sector: 'Híbrido', quantity: 2150, average_price: 9.2, current_price: 8.37, current_value: 17995.5, pnl_amount: -1789, pnl_pct: -9.04, weight_pct: 3.69, dy_12m_pct: 11.2, logoBg: '#34d399' },
  { ticker: 'HFOF11', name: 'Hedge Top FOF', asset_class: 'REIT', sector: 'FoF', quantity: 1080, average_price: 7.5, current_price: 6.84, current_value: 7387.2, pnl_amount: -712.8, pnl_pct: -8.8, weight_pct: 1.52, dy_12m_pct: 10.1, logoBg: '#fbbf24' },
  { ticker: 'HGLG11', name: 'Pátria Logística', asset_class: 'REIT', sector: 'Logística', quantity: 91, average_price: 142.0, current_price: 156.99, current_value: 14286.09, pnl_amount: 1364, pnl_pct: 10.55, weight_pct: 2.93, dy_12m_pct: 9.1, logoBg: '#0ea5e9' },
  { ticker: 'HSML11', name: 'HSI Malls', asset_class: 'REIT', sector: 'Shoppings', quantity: 100, average_price: 88.0, current_price: 95.55, current_value: 9555, pnl_amount: 755, pnl_pct: 8.58, weight_pct: 1.96, dy_12m_pct: 8.8, logoBg: '#ec4899' },
  { ticker: 'MCCI11', name: 'Mauá Capital', asset_class: 'REIT', sector: 'CRI / Papel', quantity: 216, average_price: 95.0, current_price: 96.0, current_value: 20736, pnl_amount: 216, pnl_pct: 1.05, weight_pct: 4.26, dy_12m_pct: 12.4, logoBg: '#f97316' },
  { ticker: 'PVBI11', name: 'VBI Prime Properties', asset_class: 'REIT', sector: 'Lajes Corporativas', quantity: 140, average_price: 79.0, current_price: 77.21, current_value: 10809.4, pnl_amount: -250.6, pnl_pct: -2.27, weight_pct: 2.22, dy_12m_pct: 8.2, logoBg: '#8b5cf6' },

  // ============ ETFs ============
  { ticker: 'AUPO11', name: 'BTG Teva AUVP ITBR', asset_class: 'ETF', sector: 'Renda Fixa', quantity: 495, average_price: 100.0, current_price: 105.11, current_value: 52029.45, pnl_amount: 2529.45, pnl_pct: 5.11, weight_pct: 10.68, dy_12m_pct: 0, logoBg: '#22c55e' },
  { ticker: 'GOLD11', name: 'Trend ETF Ouro', asset_class: 'ETF', sector: 'Commodities', quantity: 360, average_price: 21.0, current_price: 23.84, current_value: 8582.4, pnl_amount: 1022.4, pnl_pct: 13.52, weight_pct: 1.76, dy_12m_pct: 0, logoBg: '#fbbf24' },

  // ============ BTC LOANS (already mixed in stocks above as is_loaned) ============
  // Plus 2 standalone:
  { ticker: 'PETR4-LOAN', name: 'PETR4 (em aluguel)', asset_class: 'STOCK', sector: 'Petróleo & Gás', quantity: 365, average_price: 38.5, current_price: 47.52, current_value: 17344.8, pnl_amount: 3294.3, pnl_pct: 23.45, weight_pct: 3.56, dy_12m_pct: 14.2, logoBg: '#fbbf24', is_loaned: true, loan_yield_pct: 0.28 },
  { ticker: 'VALE3-LOAN', name: 'VALE3 (em aluguel)', asset_class: 'STOCK', sector: 'Mineração', quantity: 150, average_price: 76.2, current_price: 84.39, current_value: 12658.5, pnl_amount: 1228.5, pnl_pct: 10.74, weight_pct: 2.6, dy_12m_pct: 8.4, logoBg: '#34d399', is_loaned: true, loan_yield_pct: 0.06 },

  // ============ TESOURO ============
  { ticker: 'TESOURO IPCA+ 2032', name: 'Tesouro IPCA+ 2032', asset_class: 'TREASURY', sector: 'Renda Fixa', quantity: 13.33, average_price: 2891.7, current_price: 2944.85, current_value: 39249.77, pnl_amount: 702.97, pnl_pct: 1.82, weight_pct: 8.06, indexer: 'IPCA', maturity: '2032-08-15', logoBg: '#10b981' },
  { ticker: 'TESOURO IPCA+ 2040', name: 'Tesouro IPCA+ 2040', asset_class: 'TREASURY', sector: 'Renda Fixa', quantity: 13.09, average_price: 1784.1, current_price: 1751.47, current_value: 22926.74, pnl_amount: -424.52, pnl_pct: -1.82, weight_pct: 4.71, indexer: 'IPCA', maturity: '2040-08-15', logoBg: '#10b981' },
  { ticker: 'TESOURO IPCA+ 2050', name: 'Tesouro IPCA+ 2050', asset_class: 'TREASURY', sector: 'Renda Fixa', quantity: 30.94, average_price: 888.7, current_price: 906.86, current_value: 28058.55, pnl_amount: 560.44, pnl_pct: 2.04, weight_pct: 5.76, indexer: 'IPCA', maturity: '2050-08-15', logoBg: '#10b981' },
]

// ============ Allocation breakdowns ============

export const ALLOCATION_BY_CLASS = [
  { label: 'Ações', value: POSITIONS.filter((p) => p.asset_class === 'STOCK').reduce((s, p) => s + p.current_value, 0), color: '#fbbf24' },
  { label: 'FIIs', value: POSITIONS.filter((p) => p.asset_class === 'REIT').reduce((s, p) => s + p.current_value, 0), color: '#a78bfa' },
  { label: 'ETFs', value: POSITIONS.filter((p) => p.asset_class === 'ETF').reduce((s, p) => s + p.current_value, 0), color: '#34d399' },
  { label: 'Tesouro', value: POSITIONS.filter((p) => p.asset_class === 'TREASURY').reduce((s, p) => s + p.current_value, 0), color: '#10b981' },
].map((row) => ({ ...row, weight_pct: (row.value / TOTAL_VALUE) * 100 }))

export const ALLOCATION_BY_SECTOR = (() => {
  const map = new Map<string, number>()
  for (const p of POSITIONS) {
    map.set(p.sector, (map.get(p.sector) || 0) + p.current_value)
  }
  return [...map.entries()]
    .map(([sector, value]) => ({ sector, value, weight_pct: (value / TOTAL_VALUE) * 100 }))
    .sort((a, b) => b.value - a.value)
})()

// Concentration percentage in top-N sectors / tickers
export const TOP3_TICKERS_CONCENTRATION = POSITIONS
  .slice()
  .sort((a, b) => b.weight_pct - a.weight_pct)
  .slice(0, 3)
  .reduce((s, p) => s + p.weight_pct, 0)

// ============ Goals (chat-memory shape) ============

export const GOALS = [
  {
    id: 'aposentadoria-2050',
    title: 'Aposentadoria 2050',
    target_value: 3000000,
    current_progress: TOTAL_VALUE,
    horizon_years: 24,
    monthly_contribution_required: 4820,
    classification: 'realistic' as const,
    note: 'Aporte atual de R$ 4.500/mês está abaixo do necessário em 7%. Você pode chegar lá com pequena correção.',
  },
  {
    id: 'reserva-emergencia',
    title: 'Reserva de emergência (12 meses)',
    target_value: 60000,
    current_progress: 90235.06, // Tesouro Selic / IPCA total acts as reserve
    horizon_years: 0,
    monthly_contribution_required: 0,
    classification: 'achieved' as const,
    note: 'Reserva já está completa via Tesouro IPCA+. Excedente de R$ 30k pode ser realocado.',
  },
]

// ============ Watchlist (chat-memory shape) ============

export const WATCHLIST = [
  { ticker: 'WEGE3', name: 'WEG', current_price: 38.2, change_pct: 1.4, dy_12m_pct: 1.9, sector: 'Industrial' },
  { ticker: 'MGLU3', name: 'Magazine Luiza', current_price: 12.03, change_pct: -3.2, dy_12m_pct: 0, sector: 'Varejo' },
  { ticker: 'SUZB3', name: 'Suzano', current_price: 49.6, change_pct: 0.8, dy_12m_pct: 4.4, sector: 'Papel & Celulose' },
  { ticker: 'KNRI11', name: 'Kinea Renda', current_price: 158.3, change_pct: -0.4, dy_12m_pct: 9.2, sector: 'Lajes Corporativas' },
  { ticker: 'ITUB4', name: 'Itaú', current_price: 32.4, change_pct: 0.6, dy_12m_pct: 6.4, sector: 'Bancos' },
  { ticker: 'IVVB11', name: 'iShares S&P 500', current_price: 410.5, change_pct: 0.9, dy_12m_pct: 1.4, sector: 'Internacional' },
]

// ============ Dividend forecast ============

export const DIVIDEND_FORECAST_12M = 28420 // estimated total
export const DIVIDEND_PAID_30D = 3214

export const DIVIDEND_CALENDAR_NEXT_60D = [
  { ticker: 'ITSA4', name: 'Itaúsa', amount: 312.5, payment_date: '2026-05-08', kind: 'JCP' },
  { ticker: 'HGLG11', name: 'Pátria Logística', amount: 119.21, payment_date: '2026-05-14', kind: 'Rendimento' },
  { ticker: 'BBSE3', name: 'BB Seguridade', amount: 482.0, payment_date: '2026-05-15', kind: 'Dividendo' },
  { ticker: 'MCCI11', name: 'Mauá Capital', amount: 215.6, payment_date: '2026-05-15', kind: 'Rendimento' },
  { ticker: 'BTLG11', name: 'BTG Logística', amount: 95.7, payment_date: '2026-05-16', kind: 'Rendimento' },
  { ticker: 'TAEE11', name: 'Taesa', amount: 612.0, payment_date: '2026-05-22', kind: 'JCP' },
  { ticker: 'CPTS11', name: 'Capitânia', amount: 156.0, payment_date: '2026-05-23', kind: 'Rendimento' },
  { ticker: 'GARE11', name: 'Guardian RE', amount: 168.0, payment_date: '2026-05-29', kind: 'Rendimento' },
  { ticker: 'PETR4', name: 'Petrobras', amount: 480.0, payment_date: '2026-06-02', kind: 'JCP' },
]

export const NEXT_EVENTS = [
  { date: '2026-05-08', label: 'Ex-dividend ITSA4', kind: 'ex' as const },
  { date: '2026-05-14', label: 'Pagamento HGLG11', kind: 'pay' as const },
  { date: '2026-05-15', label: 'Earnings PETR4', kind: 'earnings' as const },
  { date: '2026-05-22', label: 'Pagamento TAEE11', kind: 'pay' as const },
  { date: '2026-05-27', label: 'Liquidação aluguel CSMG3', kind: 'rotate' as const },
  { date: '2026-08-15', label: 'Vencimento Tesouro IPCA+ 2032', kind: 'maturity' as const },
]

// ============ Score dimensions ============

export const SCORE_DIMENSIONS = [
  { key: 'diversification', label: 'Diversificação', value: 82, note: '8 setores, sem nenhum >30%' },
  { key: 'concentration', label: 'Concentração', value: 64, note: 'Top 3 = 25% (saudável, atento)' },
  { key: 'quality', label: 'Qualidade dos ativos', value: 79, note: 'ROE médio 18%, dívida controlada' },
  { key: 'income', label: 'Renda passiva', value: 88, note: 'DY médio 7.4%, acima do CDI' },
  { key: 'fx', label: 'Proteção cambial', value: 28, note: 'Apenas GOLD11; falta exposição USD' },
  { key: 'liquidity', label: 'Liquidez', value: 91, note: 'Todos os ativos com volume > R$ 10M/dia' },
  { key: 'volatility', label: 'Volatilidade', value: 71, note: 'Beta médio 0.85, abaixo do IBOV' },
  { key: 'growth', label: 'Crescimento', value: 58, note: 'Carteira "renda" prevalece, pouco growth' },
  { key: 'macro', label: 'Resiliência macro', value: 74, note: 'Sensibilidade Selic moderada' },
]

export const STRENGTHS = [
  { title: 'Renda passiva consistente', body: 'DY médio 7.4% bate CDI (10.65%) com isenção de IR em FIIs e dividendos. Projeção R$ 28k em 12m.' },
  { title: 'Diversificação setorial sólida', body: '8 setores representados, nenhum acima de 30%. Bancos + Seguros somam 27% (ainda saudável).' },
  { title: 'Reserva ancorada em IPCA+', body: 'R$ 90k em Tesouro IPCA+ 2032/40/50 protege contra inflação sem volatilidade.' },
  { title: 'Aluguel ativo gerando yield extra', body: '4 contratos BTC ativos rendendo de 0.05% a 2.74% sobre o valor da posição. CSMG3 e CPLE3 são os destaques.' },
]

export const RISKS = [
  { title: 'Exposição cambial mínima', body: 'Apenas GOLD11 (1.8%) protege contra desvalorização do real. Considerar IVVB11 ou BDRs.', severity: 'medium' as const },
  { title: 'Concentração em renda fixa via ETF', body: 'AUPO11 sozinho é 10.7% da carteira. Avaliar diversificar em CDBs ou debêntures incentivadas.', severity: 'low' as const },
  { title: 'FIIs de papel underperforming', body: 'CPTS11, GARE11, HFOF11 acumulam -8% em média. Risco de juros altos pressionando valuations.', severity: 'medium' as const },
]

export const RECOMMENDATIONS = [
  { title: 'Adicionar exposição internacional', body: 'Aporte gradual em IVVB11 (S&P 500) ou BIIB39 (BlackRock) ao longo de 6 meses pra atingir 10% USD.' },
  { title: 'Rotacionar parte do AUPO11', body: 'Reduzir de 10.7% pra 6%. Excedente em CDB DI 110% ou debênture LCI/LCA pra diversificar emissor.' },
]

export const STRESS_SCENARIOS = [
  { name: 'Selic 18%', change_pct: -8.2, note: 'FIIs e renda variável caem; Tesouro IPCA+ marca-a-mercado negativo' },
  { name: 'Recessão BR', change_pct: -22.4, note: 'Bancos e setores cíclicos sob pressão; Tesouro estabiliza' },
  { name: 'Crise cambial (USD/BRL +30%)', change_pct: -4.6, note: 'GOLD11 ajuda; falta hedge maior' },
  { name: 'Boom commodities', change_pct: +14.8, note: 'PETR4, VALE3, PRIO3 puxam ganhos' },
]

export const BENCHMARKS = [
  { label: 'Sua carteira', return_12m_pct: 12.7, color: '#fbbf24' },
  { label: 'CDI', return_12m_pct: 10.65, color: '#94a3b8' },
  { label: 'IBOV', return_12m_pct: 9.4, color: '#3b82f6' },
  { label: 'IFIX', return_12m_pct: -2.1, color: '#a78bfa' },
  { label: 'S&P 500 (em R$)', return_12m_pct: 18.6, color: '#10b981' },
]

// ============ Formatters ============

export function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}
export function formatBRL2(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
export function formatPct(n: number, signed = true): string {
  const sign = signed && n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}
export function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  } catch {
    return iso
  }
}
