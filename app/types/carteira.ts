/**
 * Tipos do domínio Carteira (PR8 `/carteira`).
 *  - *Api = shapes REAIS do backend (verificados em Backend/app/... 2026-07-11:
 *    PortfolioTradesController (index/income/equityCurve), DividendCalendar-
 *    Controller (upcoming), PortfolioAnalysisController, PluggyController)
 *  - Carteira*VM = view-models por seção (shape do design Redentia Carteira
 *    Nu.dc.html — CONTRATO de UX)
 *
 * DIRETRIZ Nº1 (dono): tela dinâmica por card — cada VM carrega o contrato
 * de estado (cheio | parcial | vazio); `null` = seção some. Nunca número
 * inventado, nunca card quebrado.
 */
import type { NuDir } from '~/types/market'
import type { HomeChartVM } from '~/types/home'

/* ————— shapes da API ————— */

/**
 * GET /portfolio/trades?period= → { data[], meta } (auth). Três espécies na
 * MESMA lista (id prefixado):
 *  - 'round-*'  venda pareada FIFO (openedAt=1ª compra, closedAt=venda,
 *               openPrice=PM dos lotes, closePrice=preço de venda, resultAmount=P&L)
 *  - 'open-*'   posição em aberto AGREGADA por ticker (openedAt=1ª compra,
 *               openPrice=PM, resultAmount=P&L não realizado)
 *  - 'income-*' provento (side DIVIDEND/JCP/INCOME, resultAmount=valor,
 *               quantity=cotas na data → rate = amount/qty)
 */
export interface TradeApi {
  id: string
  openedAt: string // ISO8601
  closedAt: string | null
  ticker: string
  name: string | null
  side: string // BUY | DIVIDEND | JCP | INCOME
  quantity: number
  openPrice: number | null
  closePrice: number | null
  resultAmount: number | null
  kind: 'day' | 'swing' | 'hold'
  volume: number
}
export interface TradesApi {
  data: TradeApi[]
  meta: { period: string; from: string | null; to: string; total_trades: number; closed_trades: number; open_trades: number; income_entries: number }
}

/** GET /dividends/upcoming?days=&limit= (PUB) — agrupado por payment_date. */
export interface UpcomingDividendsApi {
  data: {
    date: string // 'YYYY-MM-DD'
    count: number
    items: {
      ticker: string
      name: string | null
      logo: string | null
      type: string | null
      label: string // 'Dividendos' | 'JCP' | 'JCP + Dividendos'…
      rate: number // R$/ação
      payment_date: string
      last_date_prior: string | null
    }[]
  }[]
  total: number
}

/** GET /portfolio/analysis → { analysis } (404 `no_analysis_yet` tolerado). */
export interface PortfolioAnalysisApi {
  analysis: {
    score: number
    score_band: 'critico' | 'atencao' | 'bom' | 'excelente' | string
    dimensions: { key: string; label?: string | null; value: number; note?: string | null }[] | null
    strengths: { title: string; body?: string | null }[] | null
    risks: { title: string; body?: string | null; severity: 'low' | 'medium' | 'high' }[] | null
    recommendations: { title: string; body?: string | null }[] | null
    thesis_per_asset: { ticker: string; thesis?: string | null; status: string }[] | null
    summary_md: string | null
    generated_at: string | null
  }
}

/** GET /pluggy/connections → { data[] } (shape do PluggyController). */
export interface PluggyConnectionApi {
  id: number
  item_id: string
  institution_name: string
  institution_logo: string | null
  status: string // UPDATED | OUTDATED | LOGIN_ERROR | UPDATING | …
  last_synced_at: string | null
}

/* ————— view-models por seção ————— */

/** Hero: 'patrimonio' (tem carteira) | 'connect' (a página vira conexão). */
export interface CarteiraHeroVM {
  state: 'patrimonio' | 'connect'
  patrimonio: string | null // 'R$ 84.321,24'
  hojeTxt: string | null // '+R$ 761,20 (0,91%) hoje' — null = parcial (sem /today)
  hojeDir: NuDir
  metaLine: string | null // '6 ativos · atualizado hoje, 08:30'
  /** 3 stats do design — só as com dado real (Retorno total some sem custo) */
  stats: { label: string; value: string; tone: 'green' | 'red' | 'ink' }[]
}

export interface CarteiraAllocationVM {
  name: string
  pctNum: number
  pct: string // '71,9%'
  val: string // 'R$ 60.647' (mascarável)
  color: string // var(--nu-alloc-*)
}

export interface CarteiraRowVM {
  ticker: string
  /** rótulo da linha (ticker, ou nome pro Tesouro/CDB) */
  label: string
  sub: string // '520 cotas · PM R$ 24,10' (máscara: PM R$ ••)
  letter: string
  tileBg: string
  tileFg: string
  val: string // 'R$ 14.274' (mascarável)
  ret: string | null // '+13,90%' — null quando sem custo (coluna honesta)
  retDir: NuDir
  href: string | null // /asset/{t} pra equities; null = linha sem link
}

export interface CarteiraGroupVM {
  name: string // 'Ações'
  color: string // var(--nu-alloc-*) / var(--nu-class-*)
  count: string // '5 ativos'
  total: string // 'R$ 60.647' (mascarável)
  share: string // '71,9%'
  /** participação numérica 0-100 — largura da barra da sidebar (posicoes-v2) */
  shareNum: number
  ret: string | null // '+12,4%' — null = sem custo no grupo (pill some)
  retKind: 'up' | 'down' | 'flat'
  rows: CarteiraRowVM[]
  desc: string | null // editorial do /portfolio/analysis — null = coluna só com CTA
  cta: string
  ctaHref: string
}

export interface RaioXMetricVM {
  label: string // 'DIVERSIFICAÇÃO'
  value: string // '62/100' | 'Beta 0,84' | 'DY 6,1%'
  tag: string // 'Atenção' | 'Controlado' | 'Excelente'
  tagTone: 'green' | 'amber'
  fillPct: number // 0-100
  fillTone: 'green' | 'amber'
  note: string
}

export interface CarteiraRaioXVM {
  score: number // 0-100
  badge: string // 'Boa saúde · 1 ponto de atenção'
  metrics: RaioXMetricVM[]
  /** insight do /portfolio/analysis — null = banner some (sem IA inventada) */
  insight: string | null
}

export interface CarteiraIncomeVM {
  sub: string // 'R$ 4.980 nos últimos 12 meses' (mascarável)
  month: {
    label: string // 'JULHO'
    countBadge: string // '4 pagamentos'
    total: string // '+R$ 512,40' (mascarável)
    subLabel: string // 'recebidos até agora' | 'recebidos no mês'
    payments: { d: string; ticker: string; tipo: string; val: string }[]
  } | null
  record: {
    value: string // 'R$ 618' (mascarável)
    sub: string // 'recorde em um mês · mai 2026'
    bars: { mes: string; hPct: number; top: boolean }[]
    avg: string // 'R$ 502' (mascarável)
  } | null
  agenda: {
    rows: { d: string; m: string; ticker: string; tipo: string; val: string }[]
    footLabel: string // 'Previsto até setembro'
    footVal: string // '+R$ 406' (mascarável)
  } | null
}

export interface CarteiraMovementVM {
  key: string
  d: string // '05'
  m: string // 'JUL'
  ticker: string
  letter: string
  tileBg: string
  tileFg: string
  badge: 'Provento' | 'Compra' | 'Venda'
  sub: string
  valRaw: number
  val: string // '+R$ 217,40' / '-R$ 758,00' (mascarável)
}

export interface CarteiraMovementsVM {
  monthLabel: string // 'Julho 2026'
  saldo: string // '+R$ 418,40' (mascarável)
  saldoDir: NuDir
  monthEvents: CarteiraMovementVM[]
  /** janela completa buscada (12m) — revelada pelo 'Ver extrato completo' */
  allEvents: CarteiraMovementVM[]
}

export interface CarteiraHeatmapCellVM {
  txt: string // '+2,8%'
  alpha: number // 0.12–1 (função hmCell portada)
  neg: boolean
  inkWhite: boolean
}

export interface CarteiraHeatmapVM {
  sub: string // 'Retorno mensal da carteira, com proventos · 2023–2026'
  years: {
    y: string
    cells: (CarteiraHeatmapCellVM | null)[] // 12 posições; null = vazia
    ano: string // '+11,3%'
    anoNeg: boolean
  }[]
  note: string // 'jul/2026 é parcial · células vazias são meses futuros'
}

/** Payload único do useAsyncData da /carteira. */
export interface CarteiraPayload {
  /** token morto → a página limpa a sessão e redireciona pro /login */
  unauthenticated?: boolean
  hero: CarteiraHeroVM
  allocation: CarteiraAllocationVM[]
  chart: HomeChartVM | null
  positionsSub: string | null // '5 classes · role para explorar' (posicoes-v2)
  groups: CarteiraGroupVM[]
  raiox: CarteiraRaioXVM | null
  income: CarteiraIncomeVM | null
  movements: CarteiraMovementsVM | null
  heatmap: CarteiraHeatmapVM | null
}
