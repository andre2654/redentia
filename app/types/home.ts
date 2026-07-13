/**
 * Tipos do domínio portfólio (nasceu na Home logada do PR7; hoje serve a
 * página /carteira e o resumo compacto da home — useCarteira/utils/portfolio).
 *  - *Api = shapes REAIS do backend (verificados em Backend/app/... 2026-07-11:
 *    PortfolioController, PortfolioTodayController, MacroController)
 *  - HomeChartVM = view-model do gráfico navy (buildEquityChartVM em
 *    utils/portfolio — compartilhado; nome mantido pelo histórico do PR7)
 *
 * DIRETRIZ Nº1 (dono): a tela é dinâmica por card. Cada VM de seção carrega o
 * seu contrato de estado (cheio | parcial | vazio) — `null` = seção some,
 * campos opcionais = renderiza só o que tem dado real. Nunca número inventado.
 */
import type { SeriesPoint } from '~/types/acao'

/* ————— shapes da API (auth:sanctum salvo indicação) ————— */

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

/** GET /macro/snapshot (PUB) — campo usado: CDI % a.a. */
export interface MacroSnapshotApi {
  cdi?: { value: number | null; label?: string | null } | null
}

/* ————— view-models ————— */

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
