/**
 * PROTÓTIPO /simulacao — dados 100% ILUSTRATIVOS, gerados deterministicamente
 * neste módulo (nenhuma chamada de rede). Existe pra o dono avaliar a UX/UI
 * antes do motor real (plano: ScenarioEngineService no Laravel + interpretador
 * no chat-service). Nada aqui é dado de mercado; a página estampa "protótipo".
 *
 * A matemática imita o SHAPE do contrato real do plano (series mensais
 * p10/p50/p90 + baseline, events, annual, positions_impact, assumptions),
 * pra que trocar o mock pelo endpoint seja só trocar o fetch.
 */

export interface SimSeries {
  dates: string[]
  p10: number[]
  p50: number[]
  p90: number[]
  sample: number[]
  baseline: number[]
}
export interface SimEvent { at: number; kind: string; label: string }
export interface SimPositionImpact { ticker: string; name: string; weight: number; shockPct: number; factors: string[] }
export interface SimAnnual { year: number; p10: number; p50: number; p90: number }
export interface SimScenarioDef {
  slug: string
  title: string
  kind: 'base' | 'bolha_ia' | 'eleicao' | 'macro'
  chip: string
  shock: { startMonth: number; depthPct: number; durationMonths: number; recoveryMonths: number; shape: 'v' | 'u' | 'l' } | null
  /** manchete da leitura (1 frase de efeito) */
  lead: string
  /** corpo — {mark}…{/mark} vira destaque (padrão do briefing) */
  narrative: string
  /** precedentes/fontes exibidos como chips */
  sources: string[]
  filmLine: string
}
export interface SimResult {
  scenario: SimScenarioDef
  series: SimSeries
  final: { p10: number; p50: number; p90: number }
  events: SimEvent[]
  annual: SimAnnual[]
  positions: SimPositionImpact[]
  assumptions: { anchor: number; anchorDate: string; beta: number; cdiPct: number; erpPp: number; volPct: number; paths: number }
}

export const HORIZON_MONTHS = 120
const CDI = 0.139
const ERP = 0.04
const START_YEAR = 2026
const START_MONTH = 9 // set/2026

// PRNG determinístico (mulberry32) — o sample path é o MESMO em todo load
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function monthLabel(i: number): string {
  const m = (START_MONTH - 1 + i) % 12
  const y = START_YEAR + Math.floor((START_MONTH - 1 + i) / 12)
  return `${String(m + 1).padStart(2, '0')}/${y}`
}

/** envelope do choque: multiplicador ≤1 ao longo dos meses (formas v/u/l) */
function shockEnvelope(s: NonNullable<SimScenarioDef['shock']>, i: number): number {
  const { startMonth: a, depthPct, durationMonths: dur, recoveryMonths: rec, shape } = s
  const depth = depthPct / 100
  if (i < a) return 1
  if (i < a + dur) {
    const f = (i - a + 1) / dur
    return 1 + depth * Math.min(1, f * 1.25) // desce rápido até o fundo
  }
  if (i < a + dur + rec) {
    const f = (i - a - dur) / rec
    const curve = shape === 'v' ? f : shape === 'u' ? f * f : f * 0.55 // 'l' não recupera tudo
    return 1 + depth * (1 - curve)
  }
  return shape === 'l' ? 1 + depth * 0.45 : 1
}

function buildSeries(def: SimScenarioDef, anchor: number, beta: number, vol: number): SimSeries {
  const dates: string[] = []
  const p10: number[] = []; const p50: number[] = []; const p90: number[] = []
  const base: number[] = []; const sample: number[] = []
  const driftM = Math.pow(1 + CDI + beta * ERP, 1 / 12) - 1
  const rnd = mulberry32(def.slug.length * 7919 + 42)
  let samp = anchor
  for (let i = 0; i < HORIZON_MONTHS; i++) {
    dates.push(monthLabel(i))
    const growth = Math.pow(1 + driftM, i + 1)
    const env = def.shock ? 1 + ((shockEnvelope(def.shock, i) - 1) * beta) : 1
    const mid = anchor * growth * env
    const sd = vol * Math.sqrt((i + 1) / 12)
    base.push(Math.round(anchor * growth))
    p50.push(Math.round(mid))
    p90.push(Math.round(mid * Math.exp(1.2816 * sd)))
    p10.push(Math.round(mid * Math.exp(-1.2816 * sd)))
    const shockKick = def.shock && i >= def.shock.startMonth && i < def.shock.startMonth + def.shock.durationMonths
      ? (def.shock.depthPct / 100) * beta / def.shock.durationMonths : 0
    samp *= 1 + driftM + shockKick + (rnd() - 0.5) * (vol / Math.sqrt(12)) * 2
    sample.push(Math.round(samp))
  }
  return { dates, p10, p50, p90, sample, baseline: base }
}

/**
 * Catálogo de ativos do builder — cada um com carga por FATOR (0-1, o mapa do
 * ticker_factor_tags do plano real) e beta ilustrativo. O impacto por cenário
 * é COMPUTADO: shock = Σ carga_fator × choque_fator do cenário — funciona pra
 * QUALQUER carteira montada, não só a de exemplo.
 */
export interface SimAsset {
  ticker: string
  name: string
  klass: 'Ação' | 'FII' | 'ETF' | 'BDR'
  beta: number
  factors: Record<string, number>
}
export const ASSET_CATALOG: SimAsset[] = [
  { ticker: 'IVVB11', name: 'ETF S&P 500', klass: 'ETF', beta: 0.7, factors: { internacional: 1, tech: 0.35, dolar: 1 } },
  { ticker: 'NASD11', name: 'ETF Nasdaq-100', klass: 'ETF', beta: 0.75, factors: { internacional: 1, tech: 1, dolar: 1 } },
  { ticker: 'BOVA11', name: 'ETF Ibovespa', klass: 'ETF', beta: 1, factors: { mercado: 1 } },
  { ticker: 'SMAL11', name: 'ETF Small Caps', klass: 'ETF', beta: 1.25, factors: { mercado: 1, domestico: 0.6 } },
  { ticker: 'GOLD11', name: 'ETF Ouro', klass: 'ETF', beta: 0.1, factors: { dolar: 0.8, defensivo: 1 } },
  { ticker: 'PETR4', name: 'Petrobras PN', klass: 'Ação', beta: 1.1, factors: { petroleo: 1, estatal: 1, mercado: 0.5 } },
  { ticker: 'VALE3', name: 'Vale ON', klass: 'Ação', beta: 0.95, factors: { commodity: 1, dolar: 0.6, mercado: 0.4 } },
  { ticker: 'ITUB4', name: 'Itaú PN', klass: 'Ação', beta: 1.05, factors: { juros: 1, mercado: 0.6 } },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', klass: 'Ação', beta: 1.1, factors: { juros: 1, estatal: 1, mercado: 0.5 } },
  { ticker: 'WEGE3', name: 'WEG ON', klass: 'Ação', beta: 0.85, factors: { dolar: 0.6, tech: 0.4, mercado: 0.4 } },
  { ticker: 'PRIO3', name: 'PRIO ON', klass: 'Ação', beta: 1.3, factors: { petroleo: 1, mercado: 0.5 } },
  { ticker: 'TAEE11', name: 'Taesa UNT', klass: 'Ação', beta: 0.55, factors: { juros: 0.8, defensivo: 0.6 } },
  { ticker: 'HGLG11', name: 'CSHG Logística', klass: 'FII', beta: 0.45, factors: { juros: 1, imobiliario: 1 } },
  { ticker: 'MXRF11', name: 'Maxi Renda', klass: 'FII', beta: 0.35, factors: { juros: 1, imobiliario: 0.8 } },
  { ticker: 'KNRI11', name: 'Kinea Renda', klass: 'FII', beta: 0.4, factors: { juros: 1, imobiliario: 1 } },
  { ticker: 'AAPL34', name: 'Apple BDR', klass: 'BDR', beta: 0.8, factors: { internacional: 1, tech: 0.9, dolar: 1 } },
  { ticker: 'NVDC34', name: 'NVIDIA BDR', klass: 'BDR', beta: 1.4, factors: { internacional: 1, tech: 1.4, dolar: 1 } },
  { ticker: 'GOGL34', name: 'Alphabet BDR', klass: 'BDR', beta: 0.9, factors: { internacional: 1, tech: 0.9, dolar: 1 } },
]

/** choques por fator de cada cenário (em %, no vale) */
const FACTOR_SHOCKS: Record<string, Record<string, number>> = {
  'base': {},
  'bolha-ia-estoura': { tech: -22, internacional: -12, mercado: -10, dolar: 3, juros: -3, defensivo: 2 },
  'eleicao-2026-expansao': { juros: -14, imobiliario: -4, estatal: -8, mercado: -9, domestico: -6, dolar: 9, internacional: 7, defensivo: 2 },
  'eleicao-2026-consolidacao': { juros: 11, imobiliario: 4, estatal: 6, mercado: 7, domestico: 6, dolar: -3, internacional: -2 },
  'selic-mais-3pp': { juros: -12, imobiliario: -6, mercado: -7, domestico: -5, dolar: 2, defensivo: 2, tech: -2 },
}

export interface SimPortfolioInput { ticker: string; value: number }
export const EXAMPLE_PORTFOLIO: SimPortfolioInput[] = [
  { ticker: 'IVVB11', value: 55_000 },
  { ticker: 'PETR4', value: 40_000 },
  { ticker: 'ITUB4', value: 35_000 },
  { ticker: 'VALE3', value: 30_000 },
  { ticker: 'HGLG11', value: 27_000 },
  { ticker: 'WEGE3', value: 25_000 },
  { ticker: 'TAEE11', value: 22_000 },
  { ticker: 'BOVA11', value: 15_000 },
]

function assetShock(asset: SimAsset, slug: string): number {
  const shocks = FACTOR_SHOCKS[slug] ?? {}
  let s = 0
  for (const [f, load] of Object.entries(asset.factors)) s += (shocks[f] ?? 0) * load
  return Math.round(Math.max(-60, Math.min(40, s)))
}

export const SCENARIOS: SimScenarioDef[] = [
  {
    slug: 'base', title: 'Caminho base', kind: 'base', chip: 'Base',
    shock: null,
    filmLine: 'nenhum choque — só o tempo e os juros',
    lead: 'Sem choque no caminho, o tempo é o único protagonista.',
    narrative: 'A carteira compõe {mark}CDI mais o prêmio de risco{/mark} escalado pelo beta. Em 10 anos, a diferença entre o pessimista e o otimista vem inteira da volatilidade — e é por isso que {mark}a faixa abre com o tempo{/mark}.',
    sources: ['Modelo: CDI + prêmio × beta', 'Vol: IBOV 5 anos'],
  },
  {
    slug: 'bolha-ia-estoura', title: 'A bolha de IA estoura', kind: 'bolha_ia', chip: 'Bolha de IA',
    shock: { startMonth: 42, depthPct: -32, durationMonths: 8, recoveryMonths: 26, shape: 'u' },
    filmLine: 'choque: techs globais -32% ao longo de 8 meses',
    lead: 'O golpe entraria quase todo por uma porta: a exposição internacional.',
    narrative: 'Num estouro como o modelado ({mark}techs globais caindo um terço em 8 meses{/mark}, recuperação em U), uma carteira com esse perfil teria sentido o baque via {mark}IVVB11 — a maior parte da perda{/mark}. Nas quedas de tech de 2000 e 2022, quem carregava caixa e renda doméstica atravessou melhor.',
    sources: ['Precedente: Nasdaq 2000 (-78%)', 'Precedente: techs 2022 (-33%)'],
  },
  {
    slug: 'eleicao-2026-expansao', title: 'Eleições 2026: expansão fiscal', kind: 'eleicao', chip: 'Eleições: expansão',
    shock: { startMonth: 2, depthPct: -17, durationMonths: 6, recoveryMonths: 30, shape: 'l' },
    filmLine: 'choque: prêmio de risco fiscal + juros longos abrindo',
    lead: 'Juros longos abrindo cobram primeiro de quem vive de juros baixos.',
    narrative: 'Num desfecho de expansão fiscal pós-out/2026, o precedente é {mark}nov/2022{/mark}: bancos e fundos imobiliários teriam sofrido primeiro, e {mark}parte da perda não se recupera{/mark} no horizonte — o mercado reprecifica o risco Brasil. Dolarizados amortecem.',
    sources: ['Precedente: nov/2022 · juros longos +2,5pp', 'Cicatriz: re-rating do risco fiscal'],
  },
  {
    slug: 'eleicao-2026-consolidacao', title: 'Eleições 2026: consolidação fiscal', kind: 'eleicao', chip: 'Eleições: consolidação',
    shock: { startMonth: 2, depthPct: 11, durationMonths: 5, recoveryMonths: 0, shape: 'v' },
    filmLine: 'choque positivo: compressão de juros longos',
    lead: 'Consolidação fiscal historicamente paga na pata doméstica.',
    narrative: 'O precedente é {mark}2016-2017{/mark}: compressão dos juros longos e {mark}re-rating de bancos e fundos imobiliários{/mark}. Uma carteira com esse perfil teria capturado a alta principalmente pelos sensíveis a juros.',
    sources: ['Precedente: 2016-17 · IBOV +65% em 24 meses'],
  },
  {
    slug: 'selic-mais-3pp', title: 'Selic +3 pontos', kind: 'macro', chip: 'Selic +3pp',
    shock: { startMonth: 6, depthPct: -13, durationMonths: 7, recoveryMonths: 22, shape: 'u' },
    filmLine: 'choque: aperto monetário de 3 p.p.',
    lead: 'Aperto de juros morde os imobiliários — e engorda o caixa.',
    narrative: 'Com a Selic 3 pontos acima, o precedente do {mark}ciclo 2021-22{/mark} diz que {mark}FIIs e utilities teriam liderado a queda{/mark}, enquanto o caixa passa a render mais e amortece o total. A recuperação depende de quanto o aperto dura.',
    sources: ['Precedente: ciclo 2021-22 · Selic 2%→13,75%'],
  },
]

export function runMockSimulation(slug: string, portfolio: SimPortfolioInput[] = EXAMPLE_PORTFOLIO): SimResult {
  const def = SCENARIOS.find((s) => s.slug === slug) ?? SCENARIOS[0]!
  const held = portfolio
    .map((p) => ({ ...p, asset: ASSET_CATALOG.find((a) => a.ticker === p.ticker) }))
    .filter((p): p is typeof p & { asset: SimAsset } => !!p.asset && p.value > 0)
  const anchor = held.reduce((s, p) => s + p.value, 0) || 1
  const beta = held.reduce((s, p) => s + (p.value / anchor) * p.asset.beta, 0) || 1
  const vol = 0.06 + 0.14 * beta // vol da carteira escala com o beta (ilustrativo)
  const series = buildSeries(def, anchor, beta, vol)
  const last = HORIZON_MONTHS - 1
  let events: SimEvent[] = [
    { at: 1, kind: 'eleicao', label: 'Eleições 2026' },
    { at: 49, kind: 'eleicao', label: 'Eleições 2030' },
    { at: 97, kind: 'eleicao', label: 'Eleições 2034' },
  ]
  if (def.shock) {
    // o marco âmbar ENGOLE eleição vizinha (rótulos coincidentes se atropelam
    // na borda — feedback do dono 24/08)
    events = events.filter((e) => Math.abs(e.at - def.shock!.startMonth) > 6)
    events.push({ at: def.shock.startMonth, kind: 'choque', label: def.title })
  }
  const annual: SimAnnual[] = []
  for (let i = 11; i < HORIZON_MONTHS; i += 12) {
    annual.push({ year: START_YEAR + Math.ceil((START_MONTH + i) / 12) - 1, p10: series.p10[i]!, p50: series.p50[i]!, p90: series.p90[i]! })
  }
  return {
    scenario: def,
    series,
    final: { p10: series.p10[last]!, p50: series.p50[last]!, p90: series.p90[last]! },
    events: events.sort((a, b) => a.at - b.at),
    annual,
    positions: held
      .map((p) => ({
        ticker: p.ticker,
        name: p.asset.name,
        weight: p.value / anchor,
        factors: Object.keys(p.asset.factors),
        shockPct: assetShock(p.asset, def.slug),
      }))
      .sort((a, b) => b.weight - a.weight),
    assumptions: {
      anchor: Math.round(anchor), anchorDate: '2026-08-24',
      beta: Math.round(beta * 100) / 100,
      cdiPct: CDI * 100, erpPp: ERP * 100, volPct: Math.round(vol * 1000) / 10, paths: 2000,
    },
  }
}

export const fmtBRL = (v: number): string =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`
    : `R$ ${Math.round(v / 1000).toLocaleString('pt-BR')} mil`
export const fmtBRLFull = (v: number): string => `R$ ${Math.round(v).toLocaleString('pt-BR')}`
