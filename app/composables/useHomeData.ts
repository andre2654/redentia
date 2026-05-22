/**
 * useHomeData, composable público pra home anônima (/).
 *
 * Espelha o padrão de useHojeData (loading=true inicial → skeleton →
 * fetch em paralelo → loading=false). Como a home é anônima, só usa
 * endpoints públicos:
 *
 *   GET /api/market/snapshot                 → indices BR + macro + global
 *   GET /api/indices/ibov/prices?mode=1mo    → série diária do IBOV
 *   GET /api/news/latest?limit=20            → últimas notícias
 *
 * Retorna shape pronto pro template do index.vue, alinhado com o que
 * a página já consumia (IBOVESPA mega, curva, mini cards de fatores,
 * indices da seção "Mercado geral", news bento, etc).
 *
 * Sprint 2 vai adicionar:
 *   - causalFactors públicos (top contribuidores do IBOV)
 *   - news cruzadas com tema (factor_to_theme)
 *   - resumo determinístico público
 */

export type HomeMarketIndex = {
  key: string
  label: string
  value: number
  changePct: number
}

export type HomeMiniFactor = {
  key: 'petroleo' | 'juros' | 'dolar'
  label: string
  changePct: number
  /** Texto curto com sinal pra UI (ex: "−0,42 p.p.") */
  display: string
}

export type HomeTopMover = {
  ticker: string
  name: string | null
  pct: number
}

export type HomeNewsItem = {
  id: number
  source: string
  url: string
  title: string
  excerpt: string
  imageUrl: string | null
  category: string | null
  tickers: string[]
  publishedAt: string
}

export type HomeNewsTheme = {
  key: 'petroleo' | 'juros' | 'commodity' | 'consumo' | 'global' | 'outros'
  label: string
  icon: string
  count: number
  items: HomeNewsItem[]
}

/** Lead callout estilo "Principal impacto: X caiu Y%" / "Quem segurou: A subiu B%" */
export type HomeLead = {
  /** Cor visual: 'pos' = verde, 'neg' = vermelho */
  tone: 'pos' | 'neg'
  /** HTML pronto (com <strong>...</strong> nos destaques) */
  html: string
}

/** Pílula editorial pro "O que mais pesou" */
export type HomePesouPill = {
  key: 'petroleo' | 'juros' | 'dolar' | 'gainers' | 'losers'
  icon: string
  /** HTML pronto (com <strong>...</strong>) */
  html: string
}

/**
 * Fator causal agregado a nível de mercado. Mesmo shape que `causalFactors`
 * em useHojeData (logado), mas a unidade do `impact` é pct ponderado por
 * market_cap (anônimo não tem R$). Usado pelos 3 cards "Análise do dia"
 * na home anônima.
 */
export type HomeCausalFactor = {
  key: string
  label: string
  icon: string
  /** Variação % ponderada por market_cap dos tickers afetados. */
  impact: number
  /** 'high' | 'medium' | 'low' — magnitude relativa pra UI. */
  severity: 'high' | 'medium' | 'low'
  /** Top 3 tickers que mais contribuíram (em magnitude). */
  tickers: string[]
  /** Quantos tickers do índice carregam este fator. */
  affectedCount: number
}

export type HomeData = {
  loading: boolean
  asOf: string
  /** Data do último pregão (YYYY-MM-DD em BRT). Usado pra detectar "mercado fechado" */
  marketAsOfDate: string | null
  // IBOV principal (mega number + caption + intraday chart)
  ibov: {
    value: number
    changePct: number
    changePts: number
    /** Série diária (1 mês) — usada pro chart "O dia em um traço" */
    series: Array<{ price: number; date: string }>
  }
  // 3 mini cards laterais (Petróleo / Juros / Dólar)
  miniFactors: HomeMiniFactor[]
  // Fatores agregados do mercado (Attribution Nível 1 anônimo).
  // Espelha causalFactors do useHojeData mas a unidade do impact é
  // pct ponderado por market_cap em vez de R$ — anônimo não tem $.
  causalFactors: HomeCausalFactor[]
  // Leads do hp9-snapshot ("Principal impacto" + "Quem segurou")
  leads: HomeLead[]
  // 4 pílulas do "O que mais pesou"
  pesouPills: HomePesouPill[]
  // Stats footer do chart (Início / Mínima / Variação / Hoje vs S&P).
  // periodChangePct é o número cru da variação start→end (usado pra
  // colorir o chart e o stat top-right, evitando o bug onde a curva
  // cai 6% no mês mas pintava de verde porque o pct DE HOJE era +0.1%).
  chartStats: {
    open: string
    worst: string
    close: string
    deltaVsSp: string
    periodChangePct: number
  }
  // Lista de índices pra seção "Mercado geral"
  marketIndices: HomeMarketIndex[]
  // Top movers do dia (gainers/losers da bolsa inteira)
  topGainers: HomeTopMover[]
  topLosers: HomeTopMover[]
  // Notícias (raw, página decide como agrupar/exibir)
  news: HomeNewsItem[]
  // News agrupadas por tema (derivado dos tickers afetados)
  newsThemes: HomeNewsTheme[]
  // Resumo determinístico do dia (template baseado em IBOV + movers)
  resumo: string
}

function emptyShape(): HomeData {
  return {
    loading: true,
    asOf: '',
    marketAsOfDate: null,
    ibov: { value: 0, changePct: 0, changePts: 0, series: [] },
    miniFactors: [],
    causalFactors: [],
    leads: [],
    pesouPills: [],
    chartStats: { open: '', worst: '', close: '', deltaVsSp: '', periodChangePct: 0 },
    marketIndices: [],
    topGainers: [],
    topLosers: [],
    news: [],
    newsThemes: [],
    resumo: '',
  }
}

/**
 * Mapeamento de tickers (sufixados sem .SA) → tema editorial.
 * Lista curada das ações que mais aparecem em manchetes. Não é
 * exaustivo — fallback é "outros".
 */
const TICKER_THEME: Record<string, HomeNewsTheme['key']> = {
  // Petróleo
  PETR4: 'petroleo', PETR3: 'petroleo', PRIO3: 'petroleo', RECV3: 'petroleo',
  RAPT4: 'petroleo', BRDT3: 'petroleo', UGPA3: 'petroleo', VBBR3: 'petroleo',
  // Juros e bancos
  ITUB4: 'juros', ITUB3: 'juros', BBDC4: 'juros', BBDC3: 'juros', BBAS3: 'juros',
  SANB11: 'juros', BPAC11: 'juros', BBSE3: 'juros', ITSA4: 'juros', ITSA3: 'juros',
  // Commodities/mineração/exportadoras
  VALE3: 'commodity', SUZB3: 'commodity', JBSS3: 'commodity', BEEF3: 'commodity',
  MRFG3: 'commodity', BRFS3: 'commodity', KLBN11: 'commodity', RANI3: 'commodity',
  RAIZ4: 'commodity', AGRO3: 'commodity',
  // Consumo doméstico / varejo / educação
  MGLU3: 'consumo', LREN3: 'consumo', VIIA3: 'consumo', AMER3: 'consumo',
  PCAR3: 'consumo', ASAI3: 'consumo', CRFB3: 'consumo', NTCO3: 'consumo',
  YDUQ3: 'consumo', COGN3: 'consumo', FLRY3: 'consumo', RDOR3: 'consumo',
  HAPV3: 'consumo', TAEE11: 'consumo',
  // Global / BDRs / internacionalizadas
  EMBR3: 'global', WEGE3: 'global',
}
const THEME_DISPLAY: Record<HomeNewsTheme['key'], { label: string; icon: string }> = {
  petroleo: { label: 'Petróleo',          icon: 'i-lucide-droplet' },
  juros:    { label: 'Juros e bancos',    icon: 'i-lucide-percent' },
  commodity:{ label: 'Commodities',       icon: 'i-lucide-package' },
  consumo:  { label: 'Consumo doméstico', icon: 'i-lucide-shopping-bag' },
  global:   { label: 'Mercado externo',   icon: 'i-lucide-globe' },
  outros:   { label: 'Outros movimentos', icon: 'i-lucide-tag' },
}

function formatPctText(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(2).replace('.', ',')}%`
}
/** Só magnitude (sem sinal). Útil quando o verbo do texto já carrega direção. */
function formatMagnitudePct(v: number): string {
  return `${Math.abs(v).toFixed(2).replace('.', ',')}%`
}
function formatNumberPtBR(v: number): string {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}

function ppText(v: number): string {
  // "−0,42 p.p." — usa sinal explícito. Use SÓ pra delta absoluto entre
  // 2 leituras do mesmo indicador (ex: IPCA mês X vs mês Y). Variação
  // diária de preço (Brent, USD/BRL) NÃO é p.p., é %.
  const sign = v >= 0 ? '+' : '−'
  return `${sign}${Math.abs(v).toFixed(2).replace('.', ',')} p.p.`
}

/**
 * % do dia com sinal explícito (ex: "+1,77%" / "−0,45%"). Usado pros
 * mini factors quando a fonte é uma variação intraday de preço (Brent,
 * USD/BRL, S&P) — NÃO é p.p. porque não está comparando dois pcts.
 */
function pctText(v: number): string {
  const sign = v >= 0 ? '+' : '−'
  return `${sign}${Math.abs(v).toFixed(2).replace('.', ',')}%`
}

/**
 * Mapeia factor (do ticker_factor_tags) → display config. Idêntico ao
 * FACTOR_DISPLAY do useHojeData (logado) — único source of truth pra
 * que os 2 lugares rendam exatamente o mesmo card visualmente.
 *
 * `dolar_export` e `dolar_import` agrupam em "dolar" pra UI ter 1 card
 * só, mesmo motivo do logado.
 */
const FACTOR_DISPLAY: Record<string, { key: string; label: string; icon: string }> = {
  juros_sensitive:    { key: 'juros',     label: 'Juros futuros',     icon: 'i-lucide-percent' },
  petroleo_exposto:   { key: 'petroleo',  label: 'Petróleo',          icon: 'i-lucide-droplet' },
  dolar_export:       { key: 'dolar',     label: 'Dólar',             icon: 'i-lucide-dollar-sign' },
  dolar_import:       { key: 'dolar',     label: 'Dólar',             icon: 'i-lucide-dollar-sign' },
  commodity:          { key: 'commodity', label: 'Commodities',       icon: 'i-lucide-package' },
  internacional:      { key: 'global',    label: 'Mercado externo',   icon: 'i-lucide-globe' },
  consumo_domestico:  { key: 'consumo',   label: 'Consumo doméstico', icon: 'i-lucide-shopping-bag' },
}

/**
 * Severity bucket pro pill "Alto/Médio/Baixo impacto" no card. Threshold
 * em valor absoluto do impact pct (pondedado por market_cap):
 *   high   ≥ 0.5  (movimentou ≥ 0.5% do índice)
 *   medium ≥ 0.15
 *   low    < 0.15
 */
function classifyMarketSeverity(impactPct: number): 'high' | 'medium' | 'low' {
  const abs = Math.abs(impactPct)
  if (abs >= 0.5) return 'high'
  if (abs >= 0.15) return 'medium'
  return 'low'
}

/**
 * Attribution Nível 1 (anônimo): agrega change_pct ponderado por
 * market_cap × tag.weight pra cada fator macro. Espelha buildCausalFactors
 * do useHojeData (logado), só que sem R$.
 *
 * Cada constituente do IBOV contribui pro fator X como:
 *   contribution = (change_pct × market_cap × tag.weight) / Σ market_cap
 *
 * Resultado é o "impact" em pct que o fator representou do movimento
 * do índice. Retorna top 3 fatores por |impact|.
 */
function buildMarketCausalFactors(constituents: any[]): HomeCausalFactor[] {
  if (!Array.isArray(constituents) || constituents.length === 0) return []

  // Total market cap do índice — denominador da ponderação.
  let totalMarketCap = 0
  for (const c of constituents) {
    const mc = Number(c.market_cap ?? 0)
    if (Number.isFinite(mc) && mc > 0) totalMarketCap += mc
  }
  if (totalMarketCap <= 0) return []

  const agg: Record<string, {
    impact: number
    tickers: { ticker: string; impact: number }[]
    affectedCount: number
    key: string
    label: string
    icon: string
  }> = {}

  for (const c of constituents) {
    const changePct = Number(c.change_pct ?? 0)
    const marketCap = Number(c.market_cap ?? 0)
    if (!Number.isFinite(changePct) || changePct === 0) continue
    if (!Number.isFinite(marketCap) || marketCap <= 0) continue

    const tags = Array.isArray(c.factor_tags) ? c.factor_tags : []
    // Seen pra evitar dupla contagem quando 2 tags do mesmo ticker
    // mapeiam pro mesmo `display.key` (raro mas possível: dolar_export
    // + dolar_import num mesmo ticker importador/exportador agrupam em
    // "dolar"). Soma os weights nesse caso.
    const seenInThisTicker = new Set<string>()
    for (const tag of tags) {
      const display = FACTOR_DISPLAY[tag.factor]
      if (!display) continue
      const weight = Number(tag.weight ?? 1)
      const groupKey = display.key
      if (!agg[groupKey]) {
        agg[groupKey] = {
          impact: 0,
          tickers: [],
          affectedCount: 0,
          key: display.key,
          label: display.label,
          icon: display.icon,
        }
      }
      // Contribuição: pct do dia × peso do mc × weight do tag.
      const contribution = changePct * (marketCap / totalMarketCap) * weight
      agg[groupKey].impact += contribution
      if (!seenInThisTicker.has(groupKey)) {
        agg[groupKey].affectedCount++
        seenInThisTicker.add(groupKey)
      }
      const existing = agg[groupKey].tickers.find((t) => t.ticker === c.ticker)
      if (existing) {
        existing.impact += contribution
      } else {
        agg[groupKey].tickers.push({ ticker: c.ticker, impact: contribution })
      }
    }
  }

  return Object.values(agg)
    // Threshold mínimo: 0.05 pct do índice. Abaixo disso é ruído.
    .filter((f) => Math.abs(f.impact) >= 0.05)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3)
    .map((f) => ({
      key: f.key,
      label: f.label,
      icon: f.icon,
      impact: Math.round(f.impact * 100) / 100,
      severity: classifyMarketSeverity(f.impact),
      tickers: f.tickers
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 3)
        .map((t) => t.ticker),
      affectedCount: f.affectedCount,
    }))
}

/**
 * Mercado B3 aberto agora (10:00-17:30 BRT, seg-sex)? Usado pra alternar
 * tempo verbal: "está caindo" (mercado aberto) vs "caiu" (pós-fechamento
 * / fim de semana). Sem isso, na sexta-feira às 11h o copy diz "BEEF3
 * caiu hoje" enquanto o pregão ainda está rolando.
 *
 * Ignora feriados B3 — fim de semana cobre 95% dos dias não-pregão e
 * feriado raro com texto no passado é estranho mas não falso.
 */
function isMarketOpenBRT(): boolean {
  // Hora atual em BRT (UTC-3) usando Intl pra ficar imune ao TZ da
  // máquina/container do user.
  const brtNow = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
  // ex: "Fri, 11:48"
  const m = brtNow.match(/^(\w{3}),?\s+(\d{1,2}):(\d{2})/)
  if (!m) return false
  const weekday = m[1]
  const h = Number(m[2])
  const min = Number(m[3])
  const minutes = h * 60 + min
  const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)
  // Pregão: 10:00 (600) até 17:30 (1050). After-market e leilão fora.
  return isWeekday && minutes >= 600 && minutes <= 1050
}

async function fetchHomeData(): Promise<HomeData> {
  const baseURL = useRuntimeConfig().public.apiBaseUrl as string

  // 3 fetches em paralelo. Cada um falha individualmente sem derrubar
  // a tela inteira (graceful degradation conforme ADR-007).
  // ?scope=ibov filtra top movers às constituintes do Ibovespa
  // (sem isso o backend retorna top movers de TODA a B3 — DOTZ3, etc).
  // 4 endpoints em paralelo. `/market/today` é o novo (Sprint 2 do /hoje
  // v9) que espelha `/portfolio/today` do logado: retorna IBOV constituents
  // enriquecidas com factor_tags pro frontend agregar causal factors
  // exatamente como o /wallet/hoje faz com positions × factor_tags.
  const [snapshotRes, ibovSeriesRes, newsRes, marketTodayRes] = await Promise.allSettled([
    $fetch<any>(`${baseURL}/market/snapshot?scope=ibov`),
    $fetch<any>(`${baseURL}/indices/ibov/prices?mode=1mo`),
    $fetch<any>(`${baseURL}/news/latest?limit=20`),
    $fetch<any>(`${baseURL}/market/today`),
  ])

  const snapshot = snapshotRes.status === 'fulfilled' ? snapshotRes.value : null
  const ibovSeriesRaw =
    ibovSeriesRes.status === 'fulfilled'
      ? ibovSeriesRes.value?.data ?? ibovSeriesRes.value
      : []
  const newsList =
    newsRes.status === 'fulfilled' ? newsRes.value?.data ?? newsRes.value : []
  const marketToday =
    marketTodayRes.status === 'fulfilled' ? marketTodayRes.value : null

  // --- IBOV mega + caption ---
  const ibovRaw = snapshot?.indices_br?.IBOV ?? snapshot?.indices_br?.['^BVSP']
  const ibovValue = ibovRaw?.value ?? 0
  const ibovChangePct = ibovRaw?.change_pct ?? 0
  // Aproxima Δ em pontos a partir do %: value × pct/100 ÷ (1 + pct/100)
  const ibovChangePts = ibovValue && ibovChangePct
    ? (ibovValue * ibovChangePct) / (100 + ibovChangePct)
    : 0

  // --- Série diária ---
  const series = Array.isArray(ibovSeriesRaw)
    ? ibovSeriesRaw.map((d: any) => ({
        price: Number(d.market_price ?? d.price ?? 0),
        date: String(d.price_at ?? d.date ?? ''),
      }))
    : []

  // --- 3 mini factor cards ---
  // Não temos atribuição exata do IBOV ainda; usamos as variações do dia
  // dos drivers principais como proxy editorial honesto.
  //
  // Unidades:
  //  - Brent / USD-BRL: change_pct é VARIAÇÃO DO DIA (%) → display como "%"
  //    (não p.p.! p.p. é diferença entre dois pcts, ex: IPCA mês X vs Y)
  //  - IPCA 12m: mostrar VALOR ATUAL do índice (ex: 4,39%), não delta_pct
  //    (que é a variação relativa m/m, dá impressão errada de "IPCA pulou
  //    6 p.p.")
  const brentChangePct = snapshot?.global?.brent?.change_pct ?? 0
  const usdChangePct = snapshot?.macro?.usd_brl?.delta_pct ?? 0
  const ipcaValue = snapshot?.macro?.ipca_12m?.value ?? 0
  const ipcaDeltaAbs = snapshot?.macro?.ipca_12m?.delta ?? 0
  // Display IPCA: nível atual + tendência discreta vinda do delta absoluto
  // (em p.p., porque AQUI sim é diferença entre dois pcts do mesmo indicador
  // entre 2 leituras). Ex: "4,39% (+0,25 p.p.)"
  const ipcaDisplay = ipcaValue
    ? `${ipcaValue.toFixed(2).replace('.', ',')}%`
    : '—'
  const miniFactors: HomeMiniFactor[] = [
    { key: 'petroleo', label: 'Petróleo',  changePct: brentChangePct, display: pctText(brentChangePct) },
    { key: 'juros',    label: 'IPCA 12m',  changePct: ipcaDeltaAbs,   display: ipcaDisplay },
    { key: 'dolar',    label: 'Dólar',     changePct: usdChangePct,   display: pctText(usdChangePct) },
  ]

  // --- Chart stats footer ---
  // Abertura aprox: primeiro preço da série; Pior momento: mínimo;
  // Fechamento: último; Δ vs S&P: IBOV pct − S&P pct
  const sp500ChangePct = snapshot?.global?.sp500?.change_pct ?? 0
  const open = series[0]?.price ?? 0
  const worst = series.length
    ? Math.min(...series.map((s) => s.price))
    : 0
  const close = series[series.length - 1]?.price ?? ibovValue
  const worstPctFromOpen = open > 0 ? ((worst - open) / open) * 100 : 0
  const closePctFromOpen = open > 0 ? ((close - open) / open) * 100 : ibovChangePct
  const chartStats = {
    open: open
      ? open.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
      : '—',
    worst: worst && open ? formatPctText(worstPctFromOpen) : '—',
    close: formatPctText(closePctFromOpen),
    deltaVsSp: ppText(ibovChangePct - sp500ChangePct),
    periodChangePct: closePctFromOpen,
  }

  // --- Market indices list ---
  const marketIndices: HomeMarketIndex[] = []
  if (snapshot?.indices_br?.IBOV) {
    marketIndices.push({
      key: 'ibov', label: 'Ibovespa',
      value: snapshot.indices_br.IBOV.value ?? 0,
      changePct: snapshot.indices_br.IBOV.change_pct ?? 0,
    })
  }
  if (snapshot?.indices_br?.IFIX) {
    marketIndices.push({
      key: 'ifix', label: 'IFIX',
      value: snapshot.indices_br.IFIX.value ?? 0,
      changePct: snapshot.indices_br.IFIX.change_pct ?? 0,
    })
  }
  if (snapshot?.macro?.usd_brl) {
    marketIndices.push({
      key: 'dolar', label: 'Dólar',
      value: snapshot.macro.usd_brl.value ?? 0,
      changePct: snapshot.macro.usd_brl.delta_pct ?? 0,
    })
  }
  if (snapshot?.global?.brent) {
    marketIndices.push({
      key: 'brent', label: 'Petróleo (Brent)',
      value: snapshot.global.brent.value ?? 0,
      changePct: snapshot.global.brent.change_pct ?? 0,
    })
  }
  if (snapshot?.global?.sp500) {
    marketIndices.push({
      key: 'sp500', label: 'S&P 500',
      value: snapshot.global.sp500.value ?? 0,
      changePct: snapshot.global.sp500.change_pct ?? 0,
    })
  }

  // --- Top movers ---
  const topGainers: HomeTopMover[] = Array.isArray(snapshot?.top_gainers)
    ? snapshot.top_gainers.slice(0, 5).map((t: any) => ({
        ticker: t.ticker,
        name: t.name ?? null,
        pct: Number(t.pct ?? 0),
      }))
    : []
  const topLosers: HomeTopMover[] = Array.isArray(snapshot?.top_losers)
    ? snapshot.top_losers.slice(0, 5).map((t: any) => ({
        ticker: t.ticker,
        name: t.name ?? null,
        pct: Number(t.pct ?? 0),
      }))
    : []

  // --- News ---
  const news: HomeNewsItem[] = Array.isArray(newsList)
    ? newsList.map((n: any) => ({
        id: n.id,
        source: n.source ?? '',
        url: n.url ?? '#',
        title: n.title ?? '',
        excerpt: n.excerpt ?? '',
        imageUrl: n.image_url ?? null,
        category: n.category ?? null,
        tickers: Array.isArray(n.tickers) ? n.tickers : [],
        publishedAt: n.published_at ?? '',
      }))
    : []

  // ============ DERIVADOS (Sprint 2 — client-side, sem backend novo) ============

  // --- Leads "Principal impacto / Quem segurou" ---
  // Derivado dos top losers (negativo) e top gainers (positivo) reais.
  // Tempo verbal alterna: mercado aberto = presente contínuo
  // ("está caindo / está segurando"), pós-fechamento = passado
  // ("caiu / segurou"). Evita o texto "BEEF3 caiu" enquanto o pregão
  // ainda está rolando (11h da sexta).
  const marketOpen = isMarketOpenBRT()
  const verbFall = marketOpen ? 'está caindo' : 'caiu'
  const verbRise = marketOpen ? 'está subindo' : 'subiu'
  const labelHolding = marketOpen ? 'Quem está segurando' : 'Quem segurou'
  const verbPressuring = marketOpen ? 'pressionando' : 'pressionou'
  const verbCushioning = marketOpen ? 'amortecendo' : 'amorteceu'
  const leads: HomeLead[] = []
  if (topLosers.length >= 2) {
    const a = topLosers[0]
    const b = topLosers[1]
    leads.push({
      tone: 'neg',
      html: `<strong>Principal impacto:</strong> <strong>${a.ticker}</strong> ${verbFall} ${formatPctText(a.pct)} e <strong>${b.ticker}</strong> ${formatPctText(b.pct)}, ${verbPressuring} o índice.`,
    })
  }
  if (topGainers.length >= 2) {
    const a = topGainers[0]
    const b = topGainers[1]
    leads.push({
      tone: 'pos',
      html: `<strong>${labelHolding}:</strong> <strong>${a.ticker}</strong> ${verbRise} <strong class="pos">${formatPctText(a.pct)}</strong> e <strong>${b.ticker}</strong> <strong class="pos">${formatPctText(b.pct)}</strong>, ${verbCushioning} a queda.`,
    })
  }

  // --- "O que mais pesou" pílulas ---
  // Mix do top loser dominante + top gainer dominante + petróleo (Brent) + dólar.
  // Cada pílula combina um movimento setorial real com seu driver macro.
  // Verbos seguem a regra de mercado aberto/fechado.
  const verbLed = marketOpen ? 'lidera' : 'liderou'
  const verbPulling = marketOpen ? 'puxando' : 'puxou'
  const verbSignaling = marketOpen ? 'sinalizando' : 'sinalizou'
  const verbStirring = marketOpen ? 'mexendo' : 'mexeu'
  const verbImpacting = marketOpen ? 'impactando' : 'impactou'
  const pesouPills: HomePesouPill[] = []
  if (topLosers[0]) {
    const t = topLosers[0]
    pesouPills.push({
      key: 'losers',
      icon: 'i-lucide-trending-down',
      html: `<strong>${t.ticker}</strong> ${verbLed} as quedas com <strong class="neg">${formatPctText(t.pct)}</strong>, ${verbPulling} o setor pra baixo.`,
    })
  }
  if (topGainers[0]) {
    const t = topGainers[0]
    pesouPills.push({
      key: 'gainers',
      icon: 'i-lucide-trending-up',
      html: `<strong>${t.ticker}</strong> ${verbLed} as altas com <strong class="pos">${formatPctText(t.pct)}</strong>, ${verbSignaling} apetite no setor.`,
    })
  }
  if (Math.abs(brentChangePct) >= 0.1) {
    const direction = brentChangePct >= 0
      ? (marketOpen ? 'sobe' : 'subiu')
      : (marketOpen ? 'cai' : 'caiu')
    const tone = brentChangePct >= 0 ? 'pos' : 'neg'
    pesouPills.push({
      key: 'petroleo',
      icon: 'i-lucide-droplet',
      html: `<strong>Petróleo Brent</strong> ${direction} <strong class="${tone}">${formatMagnitudePct(brentChangePct)}</strong>, ${verbStirring} com exportadoras e Petrobras.`,
    })
  }
  if (Math.abs(usdChangePct) >= 0.1) {
    const direction = usdChangePct >= 0
      ? (marketOpen ? 'se fortalece' : 'fortaleceu')
      : (marketOpen ? 'enfraquece' : 'enfraqueceu')
    const tone = usdChangePct >= 0 ? 'neg' : 'pos'
    pesouPills.push({
      key: 'dolar',
      icon: 'i-lucide-dollar-sign',
      html: `<strong>Dólar</strong> ${direction} <strong class="${tone}">${formatMagnitudePct(usdChangePct)}</strong>, ${verbImpacting} importadoras e exportadoras de forma cruzada.`,
    })
  }

  // --- News classificadas por tema ---
  const themeBuckets = new Map<HomeNewsTheme['key'], HomeNewsItem[]>()
  for (const n of news) {
    let themeKey: HomeNewsTheme['key'] = 'outros'
    for (const t of n.tickers) {
      const k = TICKER_THEME[t.toUpperCase()]
      if (k) { themeKey = k; break }
    }
    if (!themeBuckets.has(themeKey)) themeBuckets.set(themeKey, [])
    themeBuckets.get(themeKey)!.push(n)
  }
  const newsThemes: HomeNewsTheme[] = []
  // Ordem fixa pra render previsível, "outros" sempre no fim
  const themeOrder: HomeNewsTheme['key'][] = ['petroleo', 'juros', 'commodity', 'consumo', 'global', 'outros']
  for (const key of themeOrder) {
    const items = themeBuckets.get(key)
    if (!items?.length) continue
    const display = THEME_DISPLAY[key]
    newsThemes.push({
      key,
      label: display.label,
      icon: display.icon,
      count: items.length,
      items,
    })
  }

  // --- Resumo Redentia (template determinístico) ---
  const dir = Math.abs(ibovChangePct) < 0.1 ? 'neutral' : ibovChangePct > 0 ? 'up' : 'down'
  const dirWord = dir === 'up' ? 'positivo' : dir === 'down' ? 'negativo' : 'praticamente neutro'
  const topLoser = topLosers[0]
  const topGainer = topGainers[0]
  let resumo = `Dia ${dirWord} pra bolsa brasileira: Ibovespa fechou em ${formatPctText(ibovChangePct)} (${formatNumberPtBR(ibovValue)} pts).`
  if (topLoser && topGainer) {
    resumo += ` Quem mais caiu foi ${topLoser.ticker} (${formatPctText(topLoser.pct)}), e quem mais subiu foi ${topGainer.ticker} (${formatPctText(topGainer.pct)}).`
  }
  if (Math.abs(brentChangePct) >= 0.5) {
    const brentDir = brentChangePct >= 0 ? 'subiu' : 'caiu'
    resumo += ` Petróleo Brent ${brentDir} ${formatMagnitudePct(brentChangePct)}, ajudando a explicar o movimento das exportadoras.`
  }
  if (Math.abs(usdChangePct) >= 0.3) {
    const usdDir = usdChangePct >= 0 ? 'fortaleceu' : 'enfraqueceu'
    resumo += ` Dólar ${usdDir} ${formatMagnitudePct(usdChangePct)} contra o real.`
  }

  // ---- Attribution Nível 1 (anônimo) ---------------------------
  // Espelha buildCausalFactors do useHojeData (logado) com 2 diferenças:
  //   - Usa `change_pct` ponderado por market_cap como "impact"
  //     (anônimo não tem R$ pra somar)
  //   - Aplica em IBOV constituents (não positions de carteira)
  // Mesmo shape de output → mesmo template renderiza nos dois lugares.
  const constituents = Array.isArray(marketToday?.constituents)
    ? marketToday.constituents
    : []
  const causalFactors = buildMarketCausalFactors(constituents)

  return {
    loading: false,
    asOf: snapshot?.as_of ?? '',
    marketAsOfDate: ibovRaw?.as_of_date ?? null,
    ibov: {
      value: ibovValue,
      changePct: ibovChangePct,
      changePts: Math.round(ibovChangePts),
      series,
    },
    miniFactors,
    causalFactors,
    leads,
    pesouPills,
    chartStats,
    marketIndices,
    topGainers,
    topLosers,
    news,
    newsThemes,
    resumo,
  }
}

/**
 * Composable reativo. Padrão idêntico ao useHojeData:
 * `loading=true` inicial (skeletons aparecem), fetch em onMounted,
 * `loading=false` ao terminar.
 */
export function useHomeData() {
  const data = ref<HomeData>(emptyShape())
  const loading = ref(true)

  async function refresh() {
    loading.value = true
    try {
      data.value = await fetchHomeData()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refresh()
  })

  return { data, loading, refresh }
}
