/**
 * useHojeData, composable que orquestra os endpoints da tela /hoje.
 *
 * 3 fetches em paralelo:
 *   GET /api/portfolio/today    (auth)
 *   GET /api/portfolio/history  (auth)
 *   GET /api/market/snapshot    (public, cache 1h Redis)
 *
 * Retorna shape pronto pro template, alinhado com o mock antigo
 * (useHojeMockData) pra minimizar mudanças no .vue.
 *
 * Sprint 2 vai adicionar:
 *   - causalFactors (FactorAttributionService)
 *   - news (news-today com impact)
 *   - resumoAI (template determinístico)
 *   - foreignFlow, breadth, dividendsUpcoming
 */
import type { PortfolioTodayResponse } from '~/types/portfolio-today'
import type { MarketSnapshotResponse } from '~/types/market-snapshot'

export type HojeSeverity = 'high' | 'medium' | 'low' | 'positive'

export type HojeMarketIndex = {
  key: string
  label: string
  value: number
  changePct: number
}

export type HojeHistoryBucket = {
  label: string
  amount: number
  pct: number
  sparkline: number[]
  severity: HojeSeverity
}

export type HojeAssetRow = {
  ticker: string
  name: string
  logo: string | null
  qty: number
  currentPrice: number
  priceD1: number
  value: number
  weight: number
  pnl: number
  pnlPct: number
  dayChange: number
  dayChangePct: number
  dy: number
  sparkline: number[]
  assetClass: string
  factorTags: string[]
}

export type HojeAssetGroup = {
  key: 'up' | 'down' | 'flat'
  label: string
  count: number
  totalValue: number
  totalDayChange: number
  totalDayChangePct: number
  totalWeight: number
  color: string
  positions: HojeAssetRow[]
}

export type HojeNewsGroup = {
  key: 'down' | 'up'
  label: string
  count: number
  totalImpact: number
  color: string
  items: any[]
}

export type HojeNewsTheme = {
  key: string
  label: string
  icon: string
  color: string
  count: number
  totalImpact: number
  items: any[]
}

export type HojeTopMover = {
  ticker: string
  name: string | null
  pct: number
}

export type HojeUserSummary = {
  firstName: string
}

export type HojeData = {
  loading: boolean
  empty: boolean
  user: HojeUserSummary
  date: string
  time: string
  portfolio: {
    totalValue: number
    dayChangeAmount: number
    dayChangePct: number
    weekChangeAmount: number
    weekChangePct: number
    monthChangeAmount: number
    monthChangePct: number
  }
  causalFactors: any[]
  news: any[]
  marketIndices: HojeMarketIndex[]
  topGainers: HojeTopMover[]
  topLosers: HojeTopMover[]
  topMovers: any[]
  history: HojeHistoryBucket[]
  intradayCurve: number[]
  assetsTable: HojeAssetRow[]
  assetGroups: HojeAssetGroup[]
  newsGroups: HojeNewsGroup[]
  newsThemes: HojeNewsTheme[]
  priceDates: { today: string | null; previous: string | null }
  newsSummary: {
    totalPositive: number
    totalNegative: number
    countPositive: number
    countNegative: number
    total: number
  }
  resumoAI: string
  resumoStats: { macroPct: number; specificPct: number }
  dividendsToday: { total: number; items: Array<{ ticker: string; amount?: number }> }
}

function classifySeverity(amount: number, total: number): HojeSeverity {
  if (total === 0) return 'low'
  const ratio = Math.abs(amount) / total
  if (amount > 0 && ratio >= 0.005) return 'positive'
  if (ratio >= 0.01) return 'high'
  if (ratio >= 0.005) return 'medium'
  return 'low'
}

/**
 * Factor display config. dolar_export e dolar_import agrupam em "dolar"
 * pra UI ficar simples (1 chip ao invés de 2 brigando).
 */
const FACTOR_DISPLAY: Record<string, { key: string; label: string; icon: string }> = {
  juros_sensitive:    { key: 'juros',    label: 'Juros futuros',    icon: 'i-lucide-percent' },
  petroleo_exposto:   { key: 'petroleo', label: 'Petróleo',         icon: 'i-lucide-droplet' },
  dolar_export:       { key: 'dolar',    label: 'Dólar',            icon: 'i-lucide-dollar-sign' },
  dolar_import:       { key: 'dolar',    label: 'Dólar',            icon: 'i-lucide-dollar-sign' },
  commodity:          { key: 'commodity', label: 'Commodities',     icon: 'i-lucide-package' },
  internacional:      { key: 'global',   label: 'Mercado externo',  icon: 'i-lucide-globe' },
  consumo_domestico:  { key: 'consumo',  label: 'Consumo doméstico', icon: 'i-lucide-shopping-bag' },
}

/**
 * Attribution Nível 1: agrega day_change_amount por fator macro.
 *
 * Para cada position, soma o P&L do dia ponderado pelo `weight` de
 * cada tag. Tags com mesmo `display.key` agrupam (ex: dolar_export +
 * dolar_import → "dolar"). Retorna top 4 por |impact|, com threshold
 * de 0.1% do patrimônio pra evitar ruído.
 *
 * Nível 2 (Sprint 2 backend) vai adicionar:
 *   - Validação direcional (juros subiu → bancos caíram → atribui)
 *   - Cálculo macroPct vs específico (residual model)
 *   - Texto narrativo determinístico (não LLM)
 */
function buildCausalFactors(positions: any[], total: number): any[] {
  if (total <= 0 || !positions?.length) return []

  const agg: Record<string, {
    impact: number
    tickers: { ticker: string; impact: number }[]
    key: string
    label: string
    icon: string
  }> = {}

  for (const p of positions) {
    const dayChange = Number(p.day_change_amount ?? 0)
    if (dayChange === 0) continue
    const tags = Array.isArray(p.factor_tags) ? p.factor_tags : []
    for (const tag of tags) {
      const display = FACTOR_DISPLAY[tag.factor]
      if (!display) continue
      const weight = Number(tag.weight ?? 1)
      const groupKey = display.key
      if (!agg[groupKey]) {
        agg[groupKey] = { impact: 0, tickers: [], key: display.key, label: display.label, icon: display.icon }
      }
      const weighted = dayChange * weight
      agg[groupKey].impact += weighted
      const existing = agg[groupKey].tickers.find((t) => t.ticker === p.ticker)
      if (existing) {
        existing.impact += weighted
      } else {
        agg[groupKey].tickers.push({ ticker: p.ticker, impact: weighted })
      }
    }
  }

  return Object.values(agg)
    // Threshold de 0.01% (R$ 50 sobre R$ 500k) elimina apenas ruído
    // numérico. Para a tela editorial, mesmo R$ 100 de impacto é
    // narrativa válida.
    .filter((f) => Math.abs(f.impact) / total >= 0.0001)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 4)
    .map((f) => ({
      key: f.key,
      label: f.label,
      icon: f.icon,
      impact: Math.round(f.impact * 100) / 100,
      severity: classifySeverity(f.impact, total),
      // Top 3 tickers que mais contribuiram (em magnitude)
      tickers: f.tickers
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 3)
        .map((t) => t.ticker),
      pctOfPortfolio: Math.round((Math.abs(f.impact) / total) * 10000) / 100,
    }))
}

/**
 * Resumo determinístico Nível 1: gera texto narrativo + stats
 * (macroPct vs específico) sem IA.
 *
 * Heurística do split macro vs específico:
 *   - macroAbs = Σ |impact| dos causalFactors (fatores macro)
 *   - specificAbs = Σ |day_change| dos tickers SEM nenhuma tag macro
 *   - macroPct = macroAbs / (macroAbs + specificAbs) × 100
 *
 * Isso aproxima o residual model do Nível 2 sem precisar de regressão
 * de betas. Erra um pouco quando um ticker tem múltiplas tags
 * sobrepostas (PETR4 = petroleo + dolar_export), mas dá o sinal
 * editorial certo na maioria dos dias.
 */
function buildResumo(
  causalFactors: any[],
  positions: any[],
  totals: { dayChangeAmount: number; dayChangePct: number; totalValue: number },
): {
  resumoAI: string
  macroPct: number
  specificPct: number
  topMovers: Array<{ ticker: string; impact: number; pct: number }>
} {
  // Topo: tickers que mais moveram em magnitude (independente de fator)
  const topMovers = (positions || [])
    .filter((p: any) => Number(p.day_change_amount ?? 0) !== 0)
    .map((p: any) => ({
      ticker: p.ticker,
      impact: Number(p.day_change_amount),
      pct: Number(p.day_change_pct ?? 0),
    }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 8)

  // Macro vs específico (heurística de tickers tagged/untagged)
  const taggedTickers = new Set<string>()
  for (const f of causalFactors) for (const t of f.tickers ?? []) taggedTickers.add(t)
  const untaggedPositions = (positions || []).filter(
    (p: any) => !taggedTickers.has(p.ticker) && Number(p.day_change_amount ?? 0) !== 0,
  )
  const macroAbs = causalFactors.reduce((s, f) => s + Math.abs(f.impact), 0)
  const specificAbs = untaggedPositions.reduce(
    (s: number, p: any) => s + Math.abs(Number(p.day_change_amount)),
    0,
  )
  const totalAbs = macroAbs + specificAbs
  const macroPct = totalAbs > 0 ? Math.round((macroAbs / totalAbs) * 100) : 0
  const specificPct = totalAbs > 0 ? 100 - macroPct : 0

  // Texto narrativo
  const dayPct = totals.dayChangePct
  const direction = Math.abs(dayPct) < 0.1 ? 'neutral' : dayPct > 0 ? 'up' : 'down'
  const topFactor = causalFactors[0]

  let resumoAI = ''
  if (!topFactor) {
    resumoAI =
      direction === 'up'
        ? `Dia positivo pra carteira (${formatPctText(dayPct)}). Sem fator macro dominante hoje, o movimento parece distribuído entre os ativos.`
        : direction === 'down'
          ? `Dia negativo pra carteira (${formatPctText(dayPct)}). Sem fator macro dominante hoje, o movimento parece específico dos papéis.`
          : `Dia praticamente neutro (${formatPctText(dayPct)}). Mercado descansando, sem fator macro dominante.`
  } else {
    const factorLabel = topFactor.label.toLowerCase()
    const factorImpactBRL = brlCompactText(topFactor.impact)
    const reactionWord =
      direction === 'up' ? 'subindo' : direction === 'down' ? 'caindo' : 'reagindo'
    const causeWord = specificPct >= 50 ? 'mais específica' : 'mais setorial'
    const narrative =
      direction === 'neutral'
        ? `Dia praticamente neutro pra carteira (${formatPctText(dayPct)}).`
        : direction === 'up'
          ? `Dia positivo pra carteira (${formatPctText(dayPct)}).`
          : `Dia negativo pra carteira (${formatPctText(dayPct)}).`

    resumoAI = `${narrative} ${macroPct}% do movimento veio de fatores macro, principalmente ${factorLabel} (${factorImpactBRL}). A reação parece ${causeWord}, com sua carteira ${reactionWord} junto com ${factorLabel} mais que com problemas específicos das empresas.`
  }

  return { resumoAI, macroPct, specificPct, topMovers }
}

/**
 * Sumário das news pro lead editorial no topo da seção.
 *
 * IMPORTANTE: total é por tickers ÚNICOS, não soma de impactos das news,
 * pra evitar double-counting do mesmo movimento (3 news sobre PETR4
 * dariam 3× o mesmo impacto). O movimento real do ticker conta 1×.
 */
function summarizeNews(
  items: any[],
  positions: any[],
): {
  totalPositive: number
  totalNegative: number
  countPositive: number
  countNegative: number
  total: number
} {
  if (!Array.isArray(items)) {
    return { totalPositive: 0, totalNegative: 0, countPositive: 0, countNegative: 0, total: 0 }
  }

  // Lookup ticker → day_change_amount
  const positionImpact = new Map<string, number>()
  for (const p of positions ?? []) {
    positionImpact.set(p.ticker, Number(p.day_change_amount ?? 0))
  }

  // Separa news em positiva/negativa pelo impact individual da news
  // (preserva semântica narrativa). Pra o total, soma por tickers únicos.
  const upTickers = new Set<string>()
  const downTickers = new Set<string>()
  let countPositive = 0
  let countNegative = 0

  for (const n of items) {
    const newsImpact = Number(n.impact ?? 0)
    const tickers = Array.isArray(n.affectedAssets) ? n.affectedAssets : []
    if (newsImpact >= 0) {
      countPositive++
      for (const t of tickers) upTickers.add(t)
    } else {
      countNegative++
      for (const t of tickers) downTickers.add(t)
    }
  }

  let totalPositive = 0
  for (const t of upTickers) totalPositive += positionImpact.get(t) ?? 0
  let totalNegative = 0
  for (const t of downTickers) totalNegative += positionImpact.get(t) ?? 0

  return {
    totalPositive: Math.round(totalPositive * 100) / 100,
    totalNegative: Math.round(totalNegative * 100) / 100,
    countPositive,
    countNegative,
    total: items.length,
  }
}

/**
 * Mapeia factor (do ticker_factor_tags) → tema visual da seção de news.
 * `dolar_export` e `dolar_import` colapsam em "dolar" pra UI simples.
 */
const FACTOR_TO_THEME: Record<string, string> = {
  juros_sensitive: 'juros',
  petroleo_exposto: 'petroleo',
  dolar_export: 'dolar',
  dolar_import: 'dolar',
  commodity: 'commodity',
  internacional: 'internacional',
  consumo_domestico: 'consumo',
}

const THEME_DISPLAY: Record<string, { label: string; icon: string; color: string }> = {
  petroleo: { label: 'Petróleo', icon: 'i-lucide-droplet', color: '#d97706' },
  commodity: { label: 'Commodities e mineração', icon: 'i-lucide-mountain', color: '#b45309' },
  juros: { label: 'Juros e bancos', icon: 'i-lucide-percent', color: 'var(--brand-primary)' },
  dolar: { label: 'Câmbio', icon: 'i-lucide-dollar-sign', color: 'var(--brand-positive)' },
  internacional: { label: 'Mercado externo', icon: 'i-lucide-globe', color: '#2563eb' },
  consumo: { label: 'Consumo doméstico', icon: 'i-lucide-shopping-bag', color: '#7c3aed' },
  outros: { label: 'Outros movimentos', icon: 'i-lucide-tag', color: 'var(--text-muted)' },
}

/**
 * Agrupa news por TEMA (não por sinal). Tema é derivado do factor_tags
 * dominante entre os tickers afetados pela news.
 *
 * Ex: news afetando PETR4+PRIO3 (ambos `petroleo_exposto`) → tema "petroleo".
 *     news afetando ITUB4+BBSE3 (ambos `juros_sensitive`) → tema "juros".
 *
 * Total por tema é por tickers ÚNICOS (não soma de news, evita double-count).
 */
function buildNewsThemes(items: any[], positions: any[]): HojeNewsTheme[] {
  if (!Array.isArray(items) || items.length === 0) return []

  const positionTags = new Map<string, string[]>()
  const positionImpact = new Map<string, number>()
  for (const p of positions ?? []) {
    positionTags.set(
      p.ticker,
      (p.factor_tags ?? []).map((t: any) => t.factor),
    )
    positionImpact.set(p.ticker, Number(p.day_change_amount ?? 0))
  }

  // Indexa news por tema dominante
  const byTheme = new Map<string, any[]>()
  const tickersByTheme = new Map<string, Set<string>>()

  for (const news of items) {
    const affected = Array.isArray(news.affectedAssets) ? news.affectedAssets : []
    if (affected.length === 0) continue

    const themeCounts: Record<string, number> = {}
    for (const ticker of affected) {
      for (const factor of positionTags.get(ticker) ?? []) {
        const themeKey = FACTOR_TO_THEME[factor] ?? 'outros'
        themeCounts[themeKey] = (themeCounts[themeKey] ?? 0) + 1
      }
    }
    // Tema dominante = mais votado entre as tags dos affectedAssets
    const sortedThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])
    const dominant = sortedThemes[0]?.[0] ?? 'outros'

    if (!byTheme.has(dominant)) byTheme.set(dominant, [])
    byTheme.get(dominant)!.push(news)

    if (!tickersByTheme.has(dominant)) tickersByTheme.set(dominant, new Set())
    for (const t of affected) tickersByTheme.get(dominant)!.add(t)
  }

  const themes: HojeNewsTheme[] = []
  for (const [key, themeNews] of byTheme.entries()) {
    const display = THEME_DISPLAY[key] ?? THEME_DISPLAY.outros
    let totalImpact = 0
    for (const ticker of tickersByTheme.get(key) ?? []) {
      totalImpact += positionImpact.get(ticker) ?? 0
    }
    // Sort items por |impact| desc dentro do tema
    const sorted = [...themeNews].sort(
      (a: any, b: any) => Math.abs(Number(b.impact ?? 0)) - Math.abs(Number(a.impact ?? 0)),
    )
    themes.push({
      key,
      label: display.label,
      icon: display.icon,
      color: display.color,
      count: themeNews.length,
      totalImpact: Math.round(totalImpact * 100) / 100,
      items: sorted,
    })
  }

  // Ordena temas por |totalImpact| desc — tema mais relevante primeiro
  return themes.sort((a, b) => Math.abs(b.totalImpact) - Math.abs(a.totalImpact))
}

/**
 * Agrupa news em "Pressionaram" (impact < 0) e "Beneficiaram" (impact >= 0).
 * Cada grupo ordena por |impact| desc. Cap em 6 cards por grupo (UI mostra 3,
 * sobra reserva pra expansão).
 *
 * IMPORTANTE: `totalImpact` é por tickers ÚNICOS do grupo, não soma das
 * news. Múltiplas news sobre o mesmo ticker → 1× no total. Evita o
 * double-counting que dava +R$ 2,30 mil quando o movimento real era
 * +R$ 435 reportado de 5 ângulos editoriais diferentes.
 */
function buildNewsGroups(items: any[], positions: any[]): HojeNewsGroup[] {
  if (!Array.isArray(items) || items.length === 0) return []
  const up: any[] = []
  const down: any[] = []
  for (const n of items) {
    const impact = Number(n.impact ?? 0)
    if (impact < 0) down.push(n)
    else up.push(n)
  }
  const sortByAbs = (a: any, b: any) => Math.abs(b.impact ?? 0) - Math.abs(a.impact ?? 0)
  up.sort(sortByAbs)
  down.sort(sortByAbs)

  // Lookup ticker → day_change_amount (uma vez, reusado pelos 2 grupos)
  const positionImpact = new Map<string, number>()
  for (const p of positions ?? []) {
    positionImpact.set(p.ticker, Number(p.day_change_amount ?? 0))
  }

  const computeUniqueImpact = (groupItems: any[]): number => {
    const tickers = new Set<string>()
    for (const n of groupItems) {
      const arr = Array.isArray(n.affectedAssets) ? n.affectedAssets : []
      for (const t of arr) tickers.add(t)
    }
    let total = 0
    for (const t of tickers) total += positionImpact.get(t) ?? 0
    return Math.round(total * 100) / 100
  }

  const groups: HojeNewsGroup[] = []
  if (down.length) {
    groups.push({
      key: 'down',
      label: 'Pressionaram a carteira',
      count: down.length,
      totalImpact: computeUniqueImpact(down),
      color: 'var(--brand-negative)',
      items: down.slice(0, 6),
    })
  }
  if (up.length) {
    groups.push({
      key: 'up',
      label: 'Beneficiaram a carteira',
      count: up.length,
      totalImpact: computeUniqueImpact(up),
      color: 'var(--brand-positive)',
      items: up.slice(0, 6),
    })
  }
  return groups
}

function formatPctText(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(2).replace('.', ',')}%`
}

function brlCompactText(v: number): string {
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : '+'
  if (abs >= 1000) return `${sign}R$ ${(abs / 1000).toFixed(1).replace('.', ',')}k`
  return `${sign}R$ ${abs.toFixed(0)}`
}

/**
 * Constrói sparkline em pct cumulativo a partir de uma serie de
 * deltas pct dia-a-dia, OU normaliza serie de equity em pct rel.
 */
function ensureSparklineFromBucket(b: any): number[] {
  if (!b) return [0, 0]
  const s = b.sparkline ?? []
  if (Array.isArray(s) && s.length > 0) return s
  return [0, b.pct ?? 0]
}

/**
 * Empty shape pra quando user nao tem positions ainda.
 */
function emptyShape(firstName: string): HojeData {
  const now = new Date()
  return {
    loading: false,
    empty: true,
    user: { firstName },
    date: now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    portfolio: {
      totalValue: 0, dayChangeAmount: 0, dayChangePct: 0,
      weekChangeAmount: 0, weekChangePct: 0, monthChangeAmount: 0, monthChangePct: 0,
    },
    causalFactors: [],
    news: [],
    marketIndices: [],
    topGainers: [],
    topLosers: [],
    topMovers: [],
    history: [],
    intradayCurve: [],
    assetsTable: [],
    assetGroups: [],
    newsGroups: [],
    newsThemes: [],
    priceDates: { today: null, previous: null },
    newsSummary: { totalPositive: 0, totalNegative: 0, countPositive: 0, countNegative: 0, total: 0 },
    dividendsToday: { total: 0, items: [] },
    resumoAI: 'Conecte sua corretora para ver a análise da sua carteira.',
    resumoStats: { macroPct: 0, specificPct: 0 },
  }
}

async function fetchHojeData(firstName: string): Promise<HojeData> {
  const auth = useAuthStore()
  if (!auth.token) {
    return emptyShape(firstName)
  }
  const baseURL = useRuntimeConfig().public.apiBaseUrl as string
  const authHeaders = {
    Authorization: `Bearer ${auth.token}`,
    Accept: 'application/json',
  }

  // 4 fetches em paralelo. Cada um pode falhar individualmente sem
  // derrubar a tela inteira (graceful degradation conforme ADR-007).
  // Pattern alinhado com useInbox: $fetch direto com baseURL explícita.
  const [todayRes, historyRes, marketRes, newsRes] = await Promise.allSettled([
    $fetch<any>(`${baseURL}/portfolio/today`,      { headers: authHeaders }),
    $fetch<any>(`${baseURL}/portfolio/history`,    { headers: authHeaders }),
    $fetch<any>(`${baseURL}/market/snapshot`),
    $fetch<any>(`${baseURL}/portfolio/news-today`, { headers: authHeaders }),
  ])

  const today = todayRes.status === 'fulfilled' ? extractData(todayRes.value) : null
  const history = historyRes.status === 'fulfilled' ? extractData(historyRes.value) : null
  const market = marketRes.status === 'fulfilled' ? marketRes.value : null
  const newsData = newsRes.status === 'fulfilled' ? extractData(newsRes.value) : null

  if (!today || !today.positions || today.positions.length === 0) {
    return emptyShape(firstName)
  }

  const now = new Date()
  const total = today.totals?.value_now ?? 0

  // Asset table, sorted by value desc
  const assetsTable: HojeAssetRow[] = (today.positions || []).map((p: any) => {
    const weight = total > 0 ? (p.value_now / total) * 100 : 0
    return {
      ticker: p.ticker,
      name: p.name ?? p.ticker,
      logo: p.logo ?? null,
      qty: p.quantity,
      currentPrice: p.price_now ?? p.average_price,
      priceD1: p.price_d1 ?? p.average_price,
      value: p.value_now ?? 0,
      weight,
      pnl: p.pnl_amount ?? 0,
      pnlPct: p.pnl_pct ?? 0,
      dayChange: p.day_change_amount ?? 0,
      dayChangePct: p.day_change_pct ?? 0,
      dy: 0,
      // Sparkline placeholder, vamos popular com history daily se quiser
      sparkline: buildPositionSparklineFromDayChange(p.day_change_pct ?? 0),
      assetClass: p.asset_class ?? 'STOCK',
      factorTags: (p.factor_tags ?? []).map((t: any) => t.factor),
    }
  })

  // Agrupa por sinal do impacto do dia (subiram / caíram / neutro)
  // Dentro de cada grupo ordena por |dayChange| desc.
  const FLAT_THRESHOLD_PCT = 0.05 // < 0.05% considera neutro
  const upGroup: HojeAssetRow[] = []
  const downGroup: HojeAssetRow[] = []
  const flatGroup: HojeAssetRow[] = []
  for (const r of assetsTable) {
    if (Math.abs(r.dayChangePct) < FLAT_THRESHOLD_PCT) flatGroup.push(r)
    else if (r.dayChange > 0) upGroup.push(r)
    else downGroup.push(r)
  }
  const sortByImpact = (a: HojeAssetRow, b: HojeAssetRow) =>
    Math.abs(b.dayChange) - Math.abs(a.dayChange)
  upGroup.sort(sortByImpact)
  downGroup.sort(sortByImpact)
  flatGroup.sort((a, b) => b.value - a.value)

  const buildGroup = (
    key: 'up' | 'down' | 'flat',
    label: string,
    color: string,
    positions: HojeAssetRow[],
  ): HojeAssetGroup => {
    const totalValue = positions.reduce((s, r) => s + r.value, 0)
    const totalDayChange = positions.reduce((s, r) => s + r.dayChange, 0)
    const totalValueD1 = positions.reduce((s, r) => s + r.qty * r.priceD1, 0)
    const totalDayChangePct = totalValueD1 > 0 ? (totalDayChange / totalValueD1) * 100 : 0
    const totalWeight = total > 0 ? (totalValue / total) * 100 : 0
    return {
      key,
      label,
      count: positions.length,
      totalValue,
      totalDayChange,
      totalDayChangePct: Math.round(totalDayChangePct * 100) / 100,
      totalWeight: Math.round(totalWeight * 10) / 10,
      color,
      positions,
    }
  }

  const assetGroups: HojeAssetGroup[] = [
    buildGroup('up', 'Subiram hoje', 'var(--brand-positive)', upGroup),
    buildGroup('down', 'Caíram hoje', 'var(--brand-negative)', downGroup),
    buildGroup('flat', 'Sem movimento', 'var(--text-muted)', flatGroup),
  ].filter((g) => g.count > 0)

  // History buckets: today, yesterday, 7d
  const historyBuckets: HojeHistoryBucket[] = []
  if (history?.today) {
    historyBuckets.push({
      label: 'Hoje',
      amount: history.today.amount,
      pct: history.today.pct,
      sparkline: ensureSparklineFromBucket(history.today),
      severity: classifySeverity(history.today.amount, total),
    })
  }
  if (history?.yesterday) {
    historyBuckets.push({
      label: 'Ontem',
      amount: history.yesterday.amount,
      pct: history.yesterday.pct,
      sparkline: ensureSparklineFromBucket(history.yesterday),
      severity: classifySeverity(history.yesterday.amount, total),
    })
  }
  if (history?.['7d']) {
    historyBuckets.push({
      label: 'Últimos 7 dias',
      amount: history['7d'].amount,
      pct: history['7d'].pct,
      sparkline: ensureSparklineFromBucket(history['7d']),
      severity: classifySeverity(history['7d'].amount, total),
    })
  }

  // Hero chart: trocou intraday por sparkline do bucket 7d (decisão de v9 atualizada)
  const intradayCurve: number[] = history?.['7d']?.sparkline ?? historyBuckets[0]?.sparkline ?? []

  // Market indices, normaliza shape do /market/snapshot
  const marketIndices: HojeMarketIndex[] = []
  if (market?.indices_br) {
    const bovs = market.indices_br['IBOV'] ?? market.indices_br['^BVSP']
    const ifix = market.indices_br['IFIX'] ?? market.indices_br['IFIX.SA']
    if (bovs) marketIndices.push({ key: 'ibov', label: 'Ibovespa', value: bovs.value ?? 0, changePct: bovs.change_pct ?? 0 })
    if (ifix) marketIndices.push({ key: 'ifix', label: 'IFIX', value: ifix.value ?? 0, changePct: ifix.change_pct ?? 0 })
  }
  if (market?.macro?.usd_brl) {
    marketIndices.push({ key: 'dolar', label: 'Dólar', value: market.macro.usd_brl.value ?? 0, changePct: market.macro.usd_brl.delta_pct ?? 0 })
  }
  if (market?.global?.brent) {
    marketIndices.push({ key: 'brent', label: 'Petróleo (Brent)', value: market.global.brent.value ?? 0, changePct: market.global.brent.change_pct ?? 0 })
  }
  if (market?.global?.sp500) {
    marketIndices.push({ key: 'sp500', label: 'S&P 500', value: market.global.sp500.value ?? 0, changePct: market.global.sp500.change_pct ?? 0 })
  }

  // Top gainers / losers globais
  const topGainers: HojeTopMover[] = (market?.top_gainers ?? []).slice(0, 5).map((t: any) => ({
    ticker: t.ticker, name: t.name ?? null, pct: t.pct,
  }))
  const topLosers: HojeTopMover[] = (market?.top_losers ?? []).slice(0, 5).map((t: any) => ({
    ticker: t.ticker, name: t.name ?? null, pct: t.pct,
  }))

  // Fallback Sprint 2: enquanto news-today com LeIA + intraday não
  // estão prontos, usamos o mock antigo como placeholder pra preservar
  // o visual editorial intacto. Substituímos campo-a-campo conforme
  // os endpoints vão entrando.
  const mock = useHojeMockData()

  // Attribution Nível 1 (causalFactors) + Resumo determinístico Nível 1
  const causalFactorsArr = buildCausalFactors(today.positions || [], total)
  const resumo = buildResumo(causalFactorsArr, today.positions || [], {
    dayChangeAmount: today.totals?.day_change_amount ?? 0,
    dayChangePct: today.totals?.day_change_pct ?? 0,
    totalValue: total,
  })

  return {
    loading: false,
    empty: false,
    user: { firstName },
    date: now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    portfolio: {
      totalValue: today.totals?.value_now ?? 0,
      dayChangeAmount: today.totals?.day_change_amount ?? 0,
      dayChangePct: today.totals?.day_change_pct ?? 0,
      weekChangeAmount: history?.['7d']?.amount ?? 0,
      weekChangePct: history?.['7d']?.pct ?? 0,
      monthChangeAmount: history?.['30d']?.amount ?? 0,
      monthChangePct: history?.['30d']?.pct ?? 0,
    },
    // Attribution Nível 1: derivado das positions × factor_tags reais.
    // Substitui o mock placeholder. Top 4 fatores por |impact| ponderado.
    causalFactors: causalFactorsArr,
    // News reais cruzadas com positions (calculado no backend)
    // Aumentado pra 6 (zig-zag editorial renderiza melhor com mais itens)
    news: newsData?.items?.length ? newsData.items.slice(0, 6) : mock.news,
    // Agrupa news por sinal do impacto pra renderização editorial.
    // Total do grupo é calculado por tickers ÚNICOS (não soma de news)
    // pra evitar double-counting do mesmo movimento (várias news sobre
    // o mesmo evento PETR4 → R$ 435 que aparece 3 vezes).
    newsGroups: buildNewsGroups(
      newsData?.items?.length ? newsData.items : mock.news,
      today.positions || [],
    ),
    newsThemes: buildNewsThemes(
      newsData?.items?.length ? newsData.items : mock.news,
      today.positions || [],
    ),
    newsSummary: summarizeNews(
      newsData?.items?.length ? newsData.items : mock.news,
      today.positions || [],
    ),
    // Resumo Nível 1 determinístico (sem IA): texto + stats + topMovers
    topMovers: resumo.topMovers,
    resumoAI: resumo.resumoAI,
    resumoStats: { macroPct: resumo.macroPct, specificPct: resumo.specificPct },
    // dividends_today vem real do /portfolio/today (cruzando ticker_dividends_si × positions)
    dividendsToday: today.dividends_today ?? { total: 0, items: [] },
    // Day 3 já popula com dados reais
    marketIndices,
    topGainers,
    topLosers,
    history: historyBuckets,
    intradayCurve: mock.intradayCurve, // Sprint 2: trocar por bucket 7d real
    assetsTable,
    assetGroups,
    priceDates: today.price_dates ?? { today: null, previous: null },
  }
}

/**
 * Composable reativo. Retorna `data` (HojeData) + `loading` + `refresh`.
 * Padrão idêntico ao /wallet: `loading=true` inicial, fetch em onMounted,
 * `loading=false` ao terminar. Sem useAsyncData (que cacheia agressivamente
 * por key e pula o estado pending em re-mounts), só ref simples + lifecycle.
 */
export function useHojeData() {
  const auth = useAuthStore()
  const firstName = (auth.me?.name ?? 'Investidor').split(' ')[0] || 'Investidor'

  const data = ref<HojeData>(emptyShape(firstName))
  const loading = ref(true)

  async function refresh() {
    loading.value = true
    try {
      data.value = await fetchHojeData(firstName)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refresh()
  })

  return { data, loading, refresh }
}

function extractData(res: any): any {
  // useCustomFetch retorna { data } as wrapper, mas a API Laravel
  // retorna o objeto direto. Suporta os 2 shapes.
  if (res && typeof res === 'object' && 'data' in res && res.data && typeof res.data === 'object') {
    return res.data
  }
  return res
}

function buildPositionSparklineFromDayChange(dayChangePct: number): number[] {
  // Aproximação simples ate termos historico daily por ticker:
  // gera linha que termina no day_change_pct atual a partir de 0
  const steps = 8
  const out: number[] = []
  for (let i = 0; i <= steps; i++) {
    out.push(Math.round((dayChangePct * (i / steps)) * 100) / 100)
  }
  return out
}
