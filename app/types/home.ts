/**
 * Tipos do domínio Home logada (PR7 `/`).
 *  - *Api = shapes REAIS do backend (verificados em Backend/app/... 2026-07-11:
 *    PortfolioController, PortfolioTradesController, PortfolioTodayController,
 *    ThesisFavoriteController, BriefingController, AuthController/UserResource)
 *  - Home*VM = view-models por seção (shape do design Redentia Home Nu.dc.html)
 *
 * DIRETRIZ Nº1 (dono): a tela é dinâmica por card. Cada VM de seção carrega o
 * seu contrato de estado (cheio | parcial | vazio) — `null` = seção some,
 * campos opcionais = renderiza só o que tem dado real. Nunca número inventado.
 */
import type { NuDir, NuNewsBadge, NuStatPill } from '~/types/market'
import type { SeriesPoint } from '~/types/acao'

/* ————— shapes da API (auth:sanctum salvo indicação) ————— */

/** GET /auth/me → { user } (UserResource). */
export interface MeApi {
  user: {
    id: number
    name: string
    email: string | null
    celular: string | null
    investor_experience: string | null
    investor_goal: string | null
  }
}

/** GET /portfolio → { positions[] } (PortfolioPosition + joins). */
export interface PortfolioPositionApi {
  ticker: string
  asset_class: string | null // STOCK | REIT | ETF | BDR | CRYPTO | TREASURY | FIXED_INCOME
  name: string | null
  quantity: number
  average_price: number | null
  current_price: number | null
  current_value: number | null
  sector: string | null
  industry: string | null
  institution_name: string | null
  connection_status: string | null
  /** DY 12m em PERCENT (ex.: 7.6) — key_statistics mais recente */
  dividend_yield: number | string | null
}

/** GET /portfolio/today → snapshot hoje + D-1 (cache 1h por user). */
export interface PortfolioTodayApi {
  as_of: string
  price_dates: { today: string | null; previous: string | null }
  totals: {
    value_now: number
    value_d1: number
    day_change_amount: number
    day_change_pct: number
  }
  positions: {
    ticker: string
    name: string | null
    logo: string | null
    asset_class: string
    quantity: number
    price_now: number | null
    value_now: number | null
    day_change_amount: number | null
    day_change_pct: number | null
    pnl_pct: number | null
    sector_key: string | null
    flags: string[]
  }[]
  flags: string[]
}

/** GET /portfolio/equity-curve → { data[], meta } (mark-to-market diário). */
export interface EquityCurvePointApi {
  date: string // 'YYYY-MM-DD'
  equity: number // P&L acumulado (compat)
  position_value: number // patrimônio real via back-walk
  realized: number
  unrealized: number
  income: number
}

/** GET /portfolio/composition → setores (atual vs ideal). */
export interface CompositionApi {
  sectors: { label: string; actualValue: number; actualPercent: number; idealPercent: number }[]
  totalValue: number
  insight: unknown
}

/** GET /portfolio/income → proventos agrupados por mês. */
export interface IncomeApi {
  months: {
    month: string // 'YYYY-MM'
    label: string // 'Jul'
    total: number
    entries: { ticker: string; side: string; trade_date: string; amount: number }[]
  }[]
  summary: { totalAll: number; monthsCovered: number; from: string; to: string }
}

/** GET /portfolio/news-today → notícias 24h × carteira (cache 1h por user). */
export interface NewsTodayItemApi {
  id: string
  headline: string
  summary: string
  source: string // já humanizado pelo backend
  time: string // 'HH:MM' America/Sao_Paulo
  published_at: string
  affectedAssets: string[]
  pctOfPortfolio: number // % do valor d-1 exposto aos tickers da notícia
  impact: number // R$ do P&L do dia nos tickers afetados
  severity: 'high' | 'medium' | 'low' | 'positive' | string
}

export interface NewsTodayApi {
  as_of: string
  items: NewsTodayItemApi[]
}

/** GET /thesis-favorites → { favorites: slugs } (added_at NÃO é exposto). */
export interface ThesisFavoritesApi {
  favorites: string[]
}

/** GET /macro/snapshot (PUB) — campo usado: CDI % a.a. */
export interface MacroSnapshotApi {
  cdi?: { value: number | null; label?: string | null } | null
}

/* ————— view-models por seção ————— */

/** Hero: estado 'patrimonio' (conectado) | 'connect' (sem carteira). */
export interface HomeHeroVM {
  greeting: string // 'Boa tarde, Rafael.' (sem nome quando /auth/me degradou)
  dateLine: string // 'sexta-feira, 11 de julho · mercado aberto'
  state: 'patrimonio' | 'connect'
  /** patrimônio total formatado — só no estado 'patrimonio' */
  patrimonio: string | null
  /** '+R$ 761,20 (0,91%) hoje' — null quando /portfolio/today degradou (parcial) */
  hojeTxt: string | null
  hojeDir: NuDir
}

export interface HomeChartVM {
  /** curva completa (o componente fatia por período client-side) */
  points: SeriesPoint[]
  /** < ~10 pontos ⇒ estado "coletando histórico" (sem gráfico falso) */
  collecting: boolean
  /** 'R$ 84.321' — pill "Patrimônio hoje" */
  currentLabel: string
  /** IBOV 12mo pré-buscado no SSR (demais períodos: lazy no client) */
  ibov12m: SeriesPoint[] | null
  /** CDI % a.a. vigente (macro/snapshot) — null = legenda CDI some */
  cdiRate: number | null
}

export interface HomePositionRowVM {
  ticker: string
  sub: string // 'Banco do Brasil · 520 cotas'
  letter: string
  tileBg: string // SEMPRE var(--nu-*)
  tileFg: string
  peso: string | null // '16,9%' — null quando total indisponível
  valor: string // 'R$ 14.274' (mascarável)
  valorRaw: number
  pct: string | null // '+1,89%' — null no estado parcial (sem /today)
  dir: NuDir
  href: string
}

export interface HomeAllocationVM {
  name: string
  pct: string // '60%'
  pctNum: number
  val: string // 'R$ 50.421' (mascarável)
  color: string // var(--nu-alloc-*)
}

export interface HomePositionsVM {
  state: 'full' | 'empty'
  summary: string | null // '6 ativos · maior posição BBAS3 (16,9%)'
  allocation: HomeAllocationVM[]
  rows: HomePositionRowVM[]
}

export interface HomeThesisCardVM {
  slug: string
  title: string
  /** categoria/setor da tese (topo do card do carrossel) */
  cat: string
  /** tickers da tese (chips "Ativos da tese"); vazio se a API não trouxe */
  tickers: string[]
  /** o usuário segue esta tese (pill "Seguindo") — true no modo 'favorites' */
  following: boolean
  image: string | null
  /** 'Convicção 88 · +1 hoje' | 'Convicção 82 · estável' | 'Explorar' */
  badge: string
  badgeTone: 'green' | 'neutral' | 'blue'
  /** '+12,4%' — retorno do backtest (label diz "desde o lançamento") */
  perf: string | null
  perfLabel: string
  ativos: string // '7 ativos'
  /** box do rodapé: dot azul = mudança hoje, dot bege = estável */
  boxStrong: string // 'Hoje:' | '8 jul:' | 'A tese:'
  boxText: string
  boxDot: 'blue' | 'sand'
}

export interface HomeThesesVM {
  mode: 'favorites' | 'discover'
  sub: string
  cards: HomeThesisCardVM[]
}

export interface HomeActionCardVM {
  kind: 'reinvest' | 'rebalance' | 'opportunity'
  kicker: string
  badge: string
  badgeTone: 'priority' | 'warning' | 'positive'
  hero: string // número gigante (mascarável quando kind='reinvest')
  heroTone: 'cream' | 'green'
  sublabel: string
  body: string
  /** mini barra empilhada (só rebalance) */
  bars: { pct: number; label: string; value: string }[] | null
  /** par atual/alvo (só opportunity) */
  pair: { current: string; target: string; targetSub: string } | null
  cta: string
  ctaHref: string
  ctaVariant: 'filled' | 'outline'
}

export interface HomeBriefingVM {
  byline: string // 'O fechamento de hoje, escrito pelo Atlas'
  headline: string
  pills: NuStatPill[]
  paragraphs: string[] // HTML já escapado ({mark} → <strong>)
  extraParagraphs: string[]
}

export interface HomeNewsFeaturedVM {
  badge: NuNewsBadge | null
  source: string
  title: string
  dek: string
}

export interface HomeNewsVM {
  mode: 'personal' | 'general'
  featured: HomeNewsFeaturedVM | null
  rows: { title: string; source: string; ticker: NuNewsBadge | null }[]
}

/** Payload único do useAsyncData da Home. */
export interface HomePayload {
  /** token expirado/revogado → index.vue limpa a sessão e cai pro anônimo */
  unauthenticated?: boolean
  hero: HomeHeroVM
  chart: HomeChartVM | null
  positions: HomePositionsVM
  theses: HomeThesesVM | null
  actions: HomeActionCardVM[]
  briefing: HomeBriefingVM | null
  news: HomeNewsVM
}
