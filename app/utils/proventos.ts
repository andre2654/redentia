/**
 * Proventos: a leitura única do GET /dividends/{t} e o DY de 12 meses do
 * site. Usado pelo /asset (useAcao) e pelo /dividendos (useDividendos), que
 * passam os MESMOS insumos e imprimem o MESMO número.
 *
 * Regras (decisão do integrador, 23/09/2026):
 *  D1. O DY do site é UM só: proventos de RENDA com data-com nos últimos 365
 *      dias (ajustados por desdobramento) ÷ preço. O número oficial é gravado
 *      pelo fundamentals-scraper (PR #8) em ticker_fundamentals_si.data.dy e
 *      chega pelo overview: scrape_extras.valuation.dividend_yield (ação e
 *      BDR) ou scrape_extras.fii.dividend_yield_12m (FII). O DY do
 *      TradingView (rendimento INDICADO, último provento anualizado) nunca é
 *      o "DY 12m": EPAR3 saía com 137,13% sem um centavo pago em 12 meses.
 *  D2. A data que decide a janela é a data-com (`ex_date`, Backend PR #54);
 *      sem ela, `payment_date`. Renda e capital da mesma data-com chegam em
 *      linhas separadas. A chave do rótulo na API é `"label "`, com espaço.
 *  D3. Toda soma de 12 meses é só renda; amortização aparece à parte.
 *
 * Auto-importado (app/utils é dir padrão do Nuxt).
 */
import type { AcaoDividendBar } from '~/types/acao'
import { spISODate } from './format'

export interface ProventoRow {
  /** 'YYYY-MM-DD' que decide a janela de 12 meses: a data-com ou, sem ela, o pagamento */
  date: string
  /** true quando `date` é a data-com de verdade (a API mandou ex_date) */
  hasExDate: boolean
  /** pagamento 'YYYY-MM-DD' (tabela, último e próximo pagamento) */
  payDate: string
  rate: number
  label: string
  /** false = devolução de capital (amortização, restituição): fica fora de soma e DY */
  income: boolean
}

/**
 * Amortização de FII ("Amortização", "Amortizacao Rf") e restituição de
 * capital ("Rest Cap Din") devolvem o dinheiro do próprio cotista. Somadas ao
 * rendimento, um fundo que amortizou R$ 10 e rendeu R$ 0,80 a R$ 90 aparecia
 * com 12% de yield: em 23/09/2026, 93 papéis tinham mais de 5% da soma de 12M
 * vindos daí. A régua é a do INCOME_TYPES do fundamentals-scraper e do
 * ScrapeDividends::INCOME_TYPES do Backend. Rótulo desconhecido conta como
 * renda; rótulo misto ("Rendimento + Amortização", a API de antes do #54)
 * também, porque não dá pra separar o valor.
 */
const CAPITAL_RE = /amortiza|rest\w* cap|restitui/
export function isCapitalLabel(label: string): boolean {
  const parts = label
    .split('+')
    .map((p) => p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase())
    .filter(Boolean)
  return parts.length > 0 && parts.every((p) => CAPITAL_RE.test(p))
}

function isoDay(v: unknown): string {
  const s = typeof v === 'string' ? v.slice(0, 10) : ''
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''
}

/** 'YYYY-MM-DD' menos N dias (aritmética em UTC, sem fuso no meio). */
export function isoMinusDays(iso: string, days: number): string {
  const t = Date.parse(`${iso}T12:00:00Z`) - days * 86_400_000
  return new Date(t).toISOString().slice(0, 10)
}

/**
 * Linhas cruas do GET /dividends/{t} → ProventoRow[] (data-com quando vem,
 * rótulo pelas duas chaves, rate string → número). Sem data ou sem valor
 * positivo, a linha sai.
 */
export function parseProventos(api: readonly unknown[] | null | undefined): ProventoRow[] {
  const out: ProventoRow[] = []
  for (const raw of api ?? []) {
    const d = (raw ?? {}) as Record<string, unknown>
    // GOTCHA runtime: a chave é `"label "` (espaço no fim); lê as duas formas.
    const label = String(d.label ?? d['label '] ?? '').trim()
    const exDate = isoDay(d.ex_date)
    const payDate = isoDay(d.payment_date) || exDate
    const rate = Number(d.rate)
    const date = exDate || payDate
    if (!date || !Number.isFinite(rate) || rate <= 0) continue
    out.push({ date, hasExDate: !!exDate, payDate, rate, label, income: !isCapitalLabel(label) })
  }
  return out
}

export interface Proventos12m {
  /** renda com data-com (ou pagamento) nos últimos 365 dias, R$ por ação/cota */
  income12: number
  /** proventos de renda DISTINTOS no período (um por data-com) */
  events12: number
  /** amortização no período: capital de volta, fora da soma e do DY */
  capital12: number
}

/**
 * A janela é a do DY oficial (fundamentals-scraper, loadTrailingDividends):
 * data-com de hoje − 365 dias até hoje, as duas pontas inclusas. Provento com
 * data-com no período entra mesmo que o pagamento ainda não tenha caído: quem
 * tinha o papel na data-com já tem direito a ele.
 */
export function proventos12m(rows: readonly ProventoRow[], today = spISODate()): Proventos12m {
  const cutoff = isoMinusDays(today, 365)
  const inWindow = rows.filter((r) => r.date >= cutoff && r.date <= today)
  const income = inWindow.filter((r) => r.income)
  // Evento = data-com. Com ex_date, duas linhas na mesma data (JCP + dividendo)
  // são UM provento; sem ele, cada linha já é uma data-com (a API agrupa por
  // ela) e duas datas-com podem pagar no mesmo dia (BBDC4, 15/09/2026).
  const keys = new Set(income.map((r, i) => (r.hasExDate ? r.date : `${r.payDate}#${i}`)))
  return {
    income12: income.reduce((a, r) => a + r.rate, 0),
    events12: keys.size,
    capital12: inWindow.filter((r) => !r.income).reduce((a, r) => a + r.rate, 0),
  }
}

/** Cadência observada em 12 meses: ≥10 Mensal · ≥4 Trimestral · ≥2 Semestral · 1 Anual. */
export function proventosFrequency(events12: number): string | null {
  if (events12 <= 0) return null
  return events12 >= 10 ? 'Mensal' : events12 >= 4 ? 'Trimestral' : events12 >= 2 ? 'Semestral' : 'Anual'
}

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Barras por ano (mesma régua nas duas páginas): anos fechados somam pela
 * data do provento; o ano corrente é a soma dos últimos 12 meses (`current12`),
 * e o rodapé da barra explica. `income` escolhe renda ou capital.
 */
export function proventosBars(
  rows: readonly ProventoRow[],
  current12: number,
  income: boolean,
  today = spISODate(),
): AcaoDividendBar[] {
  const cy = Number(today.slice(0, 4))
  const byYear = new Map<string, number>()
  for (const r of rows) {
    if (r.income !== income || r.date > today) continue
    const y = r.date.slice(0, 4)
    byYear.set(y, (byYear.get(y) ?? 0) + r.rate)
  }
  const bars: { year: string; val: number }[] = []
  for (let y = cy - 5; y <= cy; y++) {
    const val = y === cy ? current12 : byYear.get(String(y)) ?? 0
    if (val > 0) bars.push({ year: String(y), val })
  }
  const max = Math.max(...bars.map((b) => b.val), 0)
  if (!bars.length || max <= 0) return []
  return bars.map((b) => ({
    year: b.year,
    valFmt: `R$ ${nf2.format(b.val)}`,
    hPct: Math.round((b.val / max) * 1000) / 10,
    current: b.year === String(cy),
  }))
}

export interface ProventosChart {
  /** 'capital' só quando não houve renda em 12 meses e houve amortização */
  kind: 'renda' | 'capital'
  bars: AcaoDividendBar[]
  /** rodapé: o que as barras somam e, se a última é o ano corrente, que ela é a janela de 12 meses */
  note: string
}

/**
 * O gráfico anual das duas páginas. Renda por padrão; papel que só devolveu
 * capital em 12 meses (BRIP11, INFB11, ENJU3... 16 em 23/09/2026) mostra as
 * barras de amortização, com rodapé próprio, em vez de um gráfico de renda
 * sem o ano corrente (ou de nenhum gráfico).
 */
export function proventosChart(
  rows: readonly ProventoRow[],
  w: Proventos12m,
  isFii: boolean,
  today = spISODate(),
): ProventosChart {
  const kind: ProventosChart['kind'] = w.income12 <= 0 && w.capital12 > 0 ? 'capital' : 'renda'
  const bars = kind === 'capital'
    ? proventosBars(rows, w.capital12, false, today)
    : proventosBars(rows, w.income12, true, today)
  const what = kind === 'capital' ? 'Amortização' : isFii ? 'Rendimentos' : 'Dividendos + JCP'
  const last = bars[bars.length - 1]
  return {
    kind,
    bars,
    note: `${what} por ${isFii ? 'cota' : 'ação'}, por ano${last?.current ? ` · ${last.year} considera os últimos 12 meses` : ''}`,
  }
}

/** O DY do overview (o número oficial do scraper), em %. */
export function overviewDyOf(ov: {
  scrape_extras?: { valuation?: { dividend_yield?: number | null } | null; fii?: { dividend_yield_12m?: number | null } | null } | null
  key_statistics?: { dividend_yield?: string | number | null } | null
} | null | undefined): number | null {
  const raw = ov?.scrape_extras?.valuation?.dividend_yield
    ?? ov?.scrape_extras?.fii?.dividend_yield_12m
    ?? ov?.key_statistics?.dividend_yield
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export type SiteDyBasis = 'oficial' | 'renda-12m' | 'sem-renda'

export interface SiteDy {
  /** DY de 12 meses em % — o número que a página imprime em todo lugar; null = não imprime */
  value: number | null
  /**
   * 'oficial' = o do overview · 'renda-12m' = renda com data-com em 12 meses ÷
   * cotação, calculada aqui · 'sem-renda' = zero, porque o histórico existe e
   * não tem provento de renda com data-com nos últimos 12 meses.
   */
  basis: SiteDyBasis | null
  /** renda com data-com em 12 meses (R$ por ação/cota); null = histórico indisponível ou vazio */
  income12: number | null
}

/**
 * Quanto o DY oficial pode se afastar da renda de 12 meses ÷ cotação antes
 * de a página deixar de imprimi-lo. O oficial é calculado sobre o preço do
 * snapshot do scraper (06h30/18h30); a cotação da página é a de agora, e um
 * pregão comum move bem menos que 5%. Diferença maior é outro número (o
 * rendimento indicado do TradingView quando o histórico do papel parou, ou
 * soma inflada), e a página não imprime um DY que não fecha com a soma de 12
 * meses que ela mesma mostra.
 */
const DY_TOLERANCE = 0.05

/**
 * O DY de 12 meses do site (D1). Mesmos insumos, mesmo número, no /asset e no
 * /dividendos:
 *  - histórico indisponível (fetch falhou) ou vazio: o oficial, se positivo;
 *  - histórico com linhas e SEM renda com data-com em 12 meses: 0 (a página
 *    diz "sem pagamentos" e o DY concorda — era aqui que o indicado do
 *    TradingView vazava: EPAR3 137,13%, COCE6, BSLI4, RAIL3, RAPT4);
 *  - renda em 12 meses: o oficial quando fecha com renda ÷ cotação (±5%);
 *    senão (ausente, zero, ou outro número), a própria conta renda ÷ cotação.
 *
 * Limite conhecido: a soma daqui não é ajustada por desdobramento. Papel com
 * evento de quantidade dentro da janela discorda do oficial e sai com a conta
 * local; o conserto é a API entregar o provento já ajustado.
 */
export function resolveSiteDy(input: {
  overviewDy: number | null | undefined
  price: number | null | undefined
  /** null = o GET /dividends falhou */
  rows: readonly ProventoRow[] | null
  today?: string
}): SiteDy {
  const official = input.overviewDy != null && Number.isFinite(input.overviewDy) ? input.overviewDy : null
  const price = input.price != null && input.price > 0 ? input.price : null
  if (input.rows == null || input.rows.length === 0) {
    return official != null && official > 0
      ? { value: official, basis: 'oficial', income12: null }
      : { value: null, basis: null, income12: null }
  }
  const { income12 } = proventos12m(input.rows, input.today)
  if (income12 <= 0) return { value: 0, basis: 'sem-renda', income12: 0 }
  const local = price != null ? (income12 / price) * 100 : null
  if (official != null && official > 0 && (local == null || Math.abs(official - local) <= DY_TOLERANCE * local)) {
    return { value: official, basis: 'oficial', income12 }
  }
  if (local != null) return { value: local, basis: 'renda-12m', income12 }
  return { value: null, basis: null, income12 }
}
