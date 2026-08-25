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
/** a conta linha a linha de um fator na posição (auditabilidade navegável) */
export interface SimFactorLine { name: string; load: number; contributionPct: number }
export interface SimPositionImpact {
  ticker: string
  name: string
  klass: string
  weight: number
  shockPct: number
  beta: number
  factors: SimFactorLine[]
  /** carrego anual LÍQUIDO da posição no cenário (drift próprio) */
  carryPct: number
  tax: 'isento' | 'ir15'
  taxLabel: string
  /** linha extra de RF: "duration 2,6 anos × Δjuros" */
  rfNote?: string
}
export interface SimAnnual { year: number; p10: number; p50: number; p90: number }
/**
 * PIVÔ (dono, 25/08): o ASSESSOR define os choques em variáveis macro
 * concretas — dólar a R$ 5,80, Selic a 12%, bolsa −10% — e o motor propaga
 * DETERMINISTICAMENTE por regras declaradas (variável → fatores → posições).
 * As regras viram chips de premissa na leitura: nada de caixa-preta.
 */
export interface SimShocks { dolar?: number; selic?: number; bolsa?: number; petroleo?: number }

export const MACRO_NOW = { dolar: 5.15, selic: 13.9 }

export interface ShockVarDef {
  key: keyof SimShocks
  label: string
  now: string
  presets: { label: string; value: number }[]
}
export const SHOCK_VARS: ShockVarDef[] = [
  {
    key: 'dolar', label: 'Dólar', now: 'hoje R$ 5,15',
    presets: [
      { label: 'R$ 4,80', value: 4.8 }, { label: 'R$ 5,50', value: 5.5 },
      { label: 'R$ 5,80', value: 5.8 }, { label: 'R$ 6,30', value: 6.3 },
    ],
  },
  {
    key: 'selic', label: 'Selic', now: 'hoje 13,9% a.a.',
    presets: [
      { label: '10%', value: 10 }, { label: '12%', value: 12 },
      { label: '15%', value: 15 }, { label: '17%', value: 17 },
    ],
  },
  {
    key: 'bolsa', label: 'Bolsa (IBOV)', now: 'variação sobre hoje',
    presets: [
      { label: '−25%', value: -25 }, { label: '−10%', value: -10 },
      { label: '+10%', value: 10 }, { label: '+20%', value: 20 },
    ],
  },
  {
    key: 'petroleo', label: 'Petróleo', now: 'variação sobre hoje',
    presets: [
      { label: '−30%', value: -30 }, { label: '−15%', value: -15 },
      { label: '+20%', value: 20 }, { label: '+40%', value: 40 },
    ],
  },
]

/** combos de 1 toque pro morph no resultado */
export const QUICK_COMBOS: { label: string; shocks: SimShocks }[] = [
  { label: 'Sem choque', shocks: {} },
  { label: 'Dólar a R$ 5,80', shocks: { dolar: 5.8 } },
  { label: 'Selic a 12%', shocks: { selic: 12 } },
  { label: 'Bolsa −10%', shocks: { bolsa: -10 } },
]

/** DIALS: o painel v3 é de sliders que COMEÇAM em hoje — mexeu, virou choque */
export interface SimDials { dolar: number; selic: number; bolsa: number; petroleo: number }
export const DIAL_DEFAULTS: SimDials = { dolar: MACRO_NOW.dolar, selic: MACRO_NOW.selic, bolsa: 0, petroleo: 0 }
export function shocksFromDials(d: SimDials): SimShocks {
  const s: SimShocks = {}
  if (Math.abs(d.dolar - MACRO_NOW.dolar) >= 0.03) s.dolar = Math.round(d.dolar * 100) / 100
  if (Math.abs(d.selic - MACRO_NOW.selic) >= 0.2) s.selic = Math.round(d.selic * 4) / 4
  if (Math.abs(d.bolsa) >= 1) s.bolsa = Math.round(d.bolsa)
  if (Math.abs(d.petroleo) >= 2) s.petroleo = Math.round(d.petroleo)
  return s
}
export function dialsFromShocks(s: SimShocks): SimDials {
  return {
    dolar: s.dolar ?? DIAL_DEFAULTS.dolar,
    selic: s.selic ?? DIAL_DEFAULTS.selic,
    bolsa: s.bolsa ?? DIAL_DEFAULTS.bolsa,
    petroleo: s.petroleo ?? DIAL_DEFAULTS.petroleo,
  }
}

/** replays históricos de 1 toque — calibração ILUSTRATIVA dos precedentes */
export const REPLAYS: { label: string; sub: string; dials: SimDials }[] = [
  { label: '2008', sub: 'crise global', dials: { dolar: 6.7, selic: 13.75, bolsa: -41, petroleo: -54 } },
  { label: 'COVID', sub: 'mar/2020', dials: { dolar: 6.65, selic: MACRO_NOW.selic, bolsa: -37, petroleo: -60 } },
  { label: '2022', sub: 'choque fiscal', dials: { dolar: 5.55, selic: 15.5, bolsa: -8, petroleo: 0 } },
]

export function shocksKey(s: SimShocks): string {
  return [s.dolar ?? '', s.selic ?? '', s.bolsa ?? '', s.petroleo ?? ''].join('|')
}

const fmtSigned = (v: number, dec = 1) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: dec })}`

/**
 * As REGRAS do motor (variável macro → choque por fator), declaradas num
 * lugar só — cada regra ativa vira um chip visível na leitura.
 */
function factorShocksFrom(s: SimShocks): { factors: Record<string, number>; rules: string[] } {
  const factors: Record<string, number> = {}
  const rules: string[] = []
  const add = (k: string, v: number) => { factors[k] = (factors[k] ?? 0) + v }
  if (s.dolar !== undefined) {
    const d = (s.dolar / MACRO_NOW.dolar - 1) * 100
    add('dolar', 0.8 * d); add('internacional', 0.45 * d); add('domestico', -0.2 * d)
    rules.push(`Dólar ${fmtSigned(d)}% → dolarizados ${fmtSigned(0.8 * d, 0)}%`)
  }
  if (s.selic !== undefined) {
    const d = s.selic - MACRO_NOW.selic
    // clamps: a resposta a juros satura em movimentos extremos (o modelo é
    // linear — sem clamp, uma Selic despencando "venceria" qualquer crash)
    const cl = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v))
    add('juros', cl(-4.2 * d, 18)); add('imobiliario', cl(-2.4 * d, 12)); add('mercado', cl(-1.6 * d, 8)); add('domestico', cl(-1.2 * d, 8))
    rules.push(`Selic ${fmtSigned(d)} p.p. → sensíveis a juros ${fmtSigned(cl(-4.2 * d, 18), 0)}%`)
    rules.push(`CDI âncora passa a ${s.selic.toLocaleString('pt-BR')}%`)
    rules.push('Δjuros → marcação por duration nos pré/IPCA+; pós carrega a Selic nova')
  }
  if (s.bolsa !== undefined) {
    const d = s.bolsa
    add('mercado', d); add('domestico', 0.5 * d); add('tech', 0.3 * d); add('defensivo', -0.15 * d)
    rules.push(`IBOV ${fmtSigned(d)}% → carga de mercado × beta`)
  }
  if (s.petroleo !== undefined) {
    const d = s.petroleo
    add('petroleo', 0.9 * d); add('commodity', 0.3 * d)
    rules.push(`Petróleo ${fmtSigned(d)}% → petroleiras ${fmtSigned(0.9 * d, 0)}%`)
  }
  return { factors, rules }
}

/** título humano do conjunto de choques ("Dólar a R$ 5,80 · Selic a 12%") */
export function shocksTitle(s: SimShocks): string {
  const parts: string[] = []
  if (s.dolar !== undefined) parts.push(`Dólar a R$ ${s.dolar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  if (s.selic !== undefined) parts.push(`Selic a ${s.selic.toLocaleString('pt-BR')}%`)
  if (s.bolsa !== undefined) parts.push(`Bolsa ${fmtSigned(s.bolsa, 0)}%`)
  if (s.petroleo !== undefined) parts.push(`Petróleo ${fmtSigned(s.petroleo, 0)}%`)
  return parts.length ? parts.join(' · ') : 'Sem choque — caminho base'
}
export interface SimScenarioOut {
  key: string
  title: string
  lead: string
  narrative: string
  sources: string[]
  filmLine: string
}
export interface SimResult {
  shocks: SimShocks
  scenario: SimScenarioOut
  series: SimSeries
  final: { p10: number; p50: number; p90: number }
  events: SimEvent[]
  annual: SimAnnual[]
  positions: SimPositionImpact[]
  /** resumo do envelope aplicado (vale, duração, recuperação) — null sem choque */
  shockSummary: { totalPct: number; durationMonths: number; recoveryMonths: number } | null
  assumptions: { anchor: number; anchorDate: string; beta: number; cdiPct: number; carryPct: number; erpPp: number; volPct: number; paths: number }
}

interface SimEnvelope { startMonth: number; depthPct: number; durationMonths: number; recoveryMonths: number; shape: 'v' | 'u' | 'l' }

export const HORIZON_MONTHS = 120
const ERP = 0.04
const IPCA_PROXY = 0.04 // inflação de referência dos IPCA+ (ilustrativo)
const TAX_RATE = 0.15 // IR estimado dos tributados (regressiva >2 anos / RV)
const START_YEAR = 2026
const START_MONTH = 9 // set/2026

/** isento vs tributado (gap tributário, 25/08): FII rende isento; LCI e
 * incentivadas isentas; o resto paga IR estimado de 15% sobre o ganho. */
function taxInfo(a: SimAsset): { tax: 'isento' | 'ir15'; label: string } {
  if (a.rf) return a.rf.isento ? { tax: 'isento', label: 'isenta de IR' } : { tax: 'ir15', label: 'IR 15%' }
  if (a.klass === 'FII') return { tax: 'isento', label: 'rendimentos isentos' }
  return { tax: 'ir15', label: 'IR 15%' }
}

/**
 * CARREGO anual LÍQUIDO por posição (drift próprio, gap RF):
 *  - pós: Selic VIGENTE × mult (choque de Selic muda o carrego)
 *  - pré: taxa CONTRATADA, travada — não acompanha o choque
 *  - ipca: inflação de referência + taxa real contratada
 *  - RV/FII: Selic vigente + beta × prêmio de risco
 * Líquido = ganho × (1 − 15%) nos tributados; isentos sem desconto.
 */
function carryOf(a: SimAsset, selicPct: number): number {
  const net = (gross: number, isento: boolean) => (isento ? gross : gross * (1 - TAX_RATE))
  if (a.rf) {
    if (a.rf.indexer === 'pos') return net((selicPct / 100) * (a.rf.cdiMult ?? 1), !!a.rf.isento)
    if (a.rf.indexer === 'pre') return net(a.rf.ratePct / 100, !!a.rf.isento)
    return net(IPCA_PROXY + a.rf.ratePct / 100, !!a.rf.isento)
  }
  return net(selicPct / 100 + a.beta * ERP, taxInfo(a).tax === 'isento')
}

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
function shockEnvelope(s: SimEnvelope, i: number): number {
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

function buildSeries(env: SimEnvelope | null, seedKey: string, anchor: number, vol: number, carry: number, baseCarry: number): SimSeries {
  const dates: string[] = []
  const p10: number[] = []; const p50: number[] = []; const p90: number[] = []
  const base: number[] = []; const sample: number[] = []
  // carrego LÍQUIDO ponderado da carteira (por posição — RF tem drift próprio)
  const driftM = Math.pow(1 + carry, 1 / 12) - 1
  const baseDriftM = Math.pow(1 + baseCarry, 1 / 12) - 1 // baseline com a Selic de hoje
  const rnd = mulberry32(seedKey.length * 7919 + 42)
  let samp = anchor
  for (let i = 0; i < HORIZON_MONTHS; i++) {
    dates.push(monthLabel(i))
    const growth = Math.pow(1 + driftM, i + 1)
    // envelope já vem em nível de CARTEIRA (Σ peso×impacto) — não reescala por beta
    const envM = env ? shockEnvelope(env, i) : 1
    const mid = anchor * growth * envM
    const sd = vol * Math.sqrt((i + 1) / 12)
    base.push(Math.round(anchor * Math.pow(1 + baseDriftM, i + 1)))
    p50.push(Math.round(mid))
    p90.push(Math.round(mid * Math.exp(1.2816 * sd)))
    p10.push(Math.round(mid * Math.exp(-1.2816 * sd)))
    const shockKick = env && i >= env.startMonth && i < env.startMonth + env.durationMonths
      ? (env.depthPct / 100) / env.durationMonths : 0
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
  klass: 'Ação' | 'FII' | 'ETF' | 'BDR' | 'Renda fixa'
  beta: number
  factors: Record<string, number>
  /**
   * RENDA FIXA (gap nº1 da demo, 25/08): indexador define o CARREGO; a
   * marcação a mercado entra pelo sistema de fatores existente — carga de
   * `juros` = duration/4.2 (a regra de juros dá −4,2%/p.p. por carga 1),
   * com sensibilidade nominal 0,65 pros IPCA+. `ratePct` é a taxa contratada
   * (nominal no pré, REAL no ipca). Pós não marca (duration ~0).
   */
  rf?: {
    indexer: 'pos' | 'pre' | 'ipca'
    ratePct: number
    cdiMult?: number
    durationYears?: number
    isento?: boolean
  }
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
  // ——— renda fixa (cargas de juros = duration/4.2; IPCA+ com 0,65 de
  // sensibilidade nominal). Taxas ilustrativas coerentes com Selic 13,9%. ———
  { ticker: 'TSELIC29', name: 'Tesouro Selic 2029', klass: 'Renda fixa', beta: 0, factors: {}, rf: { indexer: 'pos', ratePct: 0, cdiMult: 1 } },
  { ticker: 'CDB105', name: 'CDB 105% do CDI', klass: 'Renda fixa', beta: 0, factors: {}, rf: { indexer: 'pos', ratePct: 0, cdiMult: 1.05 } },
  { ticker: 'LCI92', name: 'LCI 92% do CDI', klass: 'Renda fixa', beta: 0, factors: {}, rf: { indexer: 'pos', ratePct: 0, cdiMult: 0.92, isento: true } },
  { ticker: 'PRE29', name: 'Tesouro Prefixado 2029', klass: 'Renda fixa', beta: 0, factors: { juros: 0.62 }, rf: { indexer: 'pre', ratePct: 13.4, durationYears: 2.6 } },
  { ticker: 'IPCA35', name: 'Tesouro IPCA+ 2035', klass: 'Renda fixa', beta: 0, factors: { juros: 1.08 }, rf: { indexer: 'ipca', ratePct: 7, durationYears: 7 } },
  { ticker: 'DEBI32', name: 'Debênture incentivada IPCA+', klass: 'Renda fixa', beta: 0, factors: { juros: 0.77 }, rf: { indexer: 'ipca', ratePct: 6.6, durationYears: 5, isento: true } },
]

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

/** a conta por posição, linha a linha — cada fator com carga e contribuição
 * (auditabilidade navegável: é o que o accordion do "quem sangra" abre) */
function assetShockDetail(asset: SimAsset, factorShocks: Record<string, number>): { total: number; lines: SimFactorLine[] } {
  let s = 0
  const lines: SimFactorLine[] = []
  for (const [f, load] of Object.entries(asset.factors)) {
    const contribution = (factorShocks[f] ?? 0) * load
    s += contribution
    if (contribution !== 0) lines.push({ name: f, load, contributionPct: Math.round(contribution * 10) / 10 })
  }
  lines.sort((a, b) => Math.abs(b.contributionPct) - Math.abs(a.contributionPct))
  return { total: Math.round(Math.max(-60, Math.min(40, s))), lines }
}

export function runMockSimulation(shocks: SimShocks, portfolio: SimPortfolioInput[] = EXAMPLE_PORTFOLIO): SimResult {
  const key = shocksKey(shocks)
  const title = shocksTitle(shocks)
  const { factors, rules } = factorShocksFrom(shocks)
  const isBase = Object.keys(factors).length === 0

  const held = portfolio
    .map((p) => ({ ...p, asset: ASSET_CATALOG.find((a) => a.ticker === p.ticker) }))
    .filter((p): p is typeof p & { asset: SimAsset } => !!p.asset && p.value > 0)
  const anchor = held.reduce((s, p) => s + p.value, 0) || 1
  const beta = held.reduce((s, p) => s + (p.value / anchor) * p.asset.beta, 0)
  const vol = 0.02 + 0.18 * beta // vol escala com o beta (RF pura ≈ 2% a.a.)

  // carrego LÍQUIDO ponderado — no cenário (Selic do choque) e no base (hoje)
  const selicShocked = shocks.selic ?? MACRO_NOW.selic
  const carry = held.reduce((s, p) => s + (p.value / anchor) * carryOf(p.asset, selicShocked), 0) || 0.1
  const baseCarry = held.reduce((s, p) => s + (p.value / anchor) * carryOf(p.asset, MACRO_NOW.selic), 0) || 0.1

  // impacto por posição (regras × cargas), com a conta aberta linha a linha
  const positions: SimPositionImpact[] = held
    .map((p) => {
      const detail = assetShockDetail(p.asset, factors)
      const t = taxInfo(p.asset)
      return {
        ticker: p.ticker,
        name: p.asset.name,
        klass: p.asset.klass,
        weight: p.value / anchor,
        shockPct: detail.total,
        beta: p.asset.beta,
        factors: detail.lines,
        carryPct: Math.round(carryOf(p.asset, selicShocked) * 1000) / 10,
        tax: t.tax,
        taxLabel: t.label,
        rfNote: p.asset.rf?.durationYears
          ? `marcação ≈ −duration ${p.asset.rf.durationYears.toLocaleString('pt-BR')} anos × Δjuros${p.asset.rf.indexer === 'ipca' ? ' (sensibilidade nominal 0,65)' : ''}`
          : p.asset.rf
            ? 'pós-fixado: sem marcação relevante — o efeito é no carrego'
            : undefined,
      }
    })
    .sort((a, b) => b.weight - a.weight)
  const totalShock = positions.reduce((s, p) => s + p.weight * p.shockPct, 0)

  const env: SimEnvelope | null = isBase || Math.abs(totalShock) < 0.5
    ? null
    : {
        startMonth: 2,
        depthPct: Math.round(totalShock * 10) / 10,
        durationMonths: 6,
        recoveryMonths: totalShock < 0 ? 24 : 4,
        shape: totalShock < 0 ? 'u' : 'v',
      }
  const series = buildSeries(env, key || 'base', anchor, vol, carry, baseCarry)
  const last = HORIZON_MONTHS - 1

  let events: SimEvent[] = [
    { at: 1, kind: 'eleicao', label: 'Eleições 2026' },
    { at: 49, kind: 'eleicao', label: 'Eleições 2030' },
    { at: 97, kind: 'eleicao', label: 'Eleições 2034' },
  ]
  if (env) {
    events = events.filter((e) => Math.abs(e.at - env.startMonth) > 6)
    events.push({ at: env.startMonth, kind: 'choque', label: title })
  }
  const annual: SimAnnual[] = []
  for (let i = 11; i < HORIZON_MONTHS; i += 12) {
    annual.push({ year: START_YEAR + Math.ceil((START_MONTH + i) / 12) - 1, p10: series.p10[i]!, p50: series.p50[i]!, p90: series.p90[i]! })
  }

  // leitura TEMPLATED: números só do motor, regras viram os chips
  const lead = isBase
    ? 'Sem choque, o tempo é o único protagonista.'
    : `A conta do choque desenhado: ${fmtSigned(totalShock)}% na carteira, no ${totalShock < 0 ? 'vale' : 'pico'}.`
  const worst = [...positions].sort((a, b) => a.shockPct - b.shockPct)[0]
  const best = [...positions].sort((a, b) => b.shockPct - a.shockPct)[0]
  const narrative = isBase
    ? 'A carteira compõe {mark}CDI mais o prêmio de risco{/mark} escalado pelo beta. Em 10 anos, a diferença entre o pessimista e o otimista vem inteira da volatilidade — e é por isso que {mark}a faixa abre com o tempo{/mark}.'
    : `Com ${title.toLowerCase()}, as regras do motor dão {mark}${fmtSigned(totalShock)}% na carteira{/mark}, aplicados ao longo de 6 meses${totalShock < 0 ? ' com recuperação em U' : ''}. ${worst && worst.shockPct < 0 ? `Quem mais sente é {mark}${worst.ticker} (${fmtSigned(worst.shockPct, 0)}%){/mark}` : ''}${best && best.shockPct > 0 ? `${worst && worst.shockPct < 0 ? '; ' : ''}quem segura é {mark}${best.ticker} (${fmtSigned(best.shockPct, 0)}%){/mark}` : ''}. Cada regra usada está aberta aqui embaixo — mude o choque e a conta refaz.`
  const filmLine = isBase ? 'nenhum choque — só o tempo e os juros' : title.toLowerCase()

  return {
    shocks,
    scenario: {
      key, title, lead, narrative, filmLine,
      sources: isBase ? ['Modelo: CDI + prêmio × beta', 'Vol: IBOV 5 anos'] : rules,
    },
    series,
    final: { p10: series.p10[last]!, p50: series.p50[last]!, p90: series.p90[last]! },
    events: events.sort((a, b) => a.at - b.at),
    annual,
    positions,
    shockSummary: env
      ? { totalPct: env.depthPct, durationMonths: env.durationMonths, recoveryMonths: env.recoveryMonths }
      : null,
    assumptions: {
      anchor: Math.round(anchor), anchorDate: '2026-08-24',
      beta: Math.round(beta * 100) / 100,
      cdiPct: Math.round((selicShocked / 100) * 1000) / 10,
      carryPct: Math.round(carry * 1000) / 10,
      erpPp: ERP * 100, volPct: Math.round(vol * 1000) / 10, paths: 2000,
    },
  }
}

export const fmtBRL = (v: number): string =>
  v >= 1_000_000
    ? `R$ ${(v / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`
    : `R$ ${Math.round(v / 1000).toLocaleString('pt-BR')} mil`
export const fmtBRLFull = (v: number): string => `R$ ${Math.round(v).toLocaleString('pt-BR')}`

/**
 * RESUMO PRO CLIENTE (gap nº5, 25/08) — 100% templetizado do resultado do
 * motor, no formato da skill redentia-por-que-moveu: bloco WhatsApp (1ª
 * pessoa do assessor, 2-3 frases), bloco e-mail (assunto + parágrafo denso)
 * e rodapé de compliance. A FAIXA aparece em todo bloco — nunca só a mediana.
 */
export interface SimClientSummary { whatsapp: string; emailSubject: string; emailBody: string; footer: string }
export function buildClientSummary(r: SimResult): SimClientSummary {
  const hoje = new Date().toLocaleDateString('pt-BR')
  const anchor = fmtBRLFull(r.assumptions.anchor)
  const faixa = `${fmtBRL(r.final.p10)} no pessimista e ${fmtBRL(r.final.p90)} no otimista`
  const worst = [...r.positions].sort((a, b) => a.shockPct - b.shockPct)[0]
  const best = [...r.positions].sort((a, b) => b.shockPct - a.shockPct)[0]
  const s = r.shockSummary

  const choqueTxt = s
    ? ` No curto prazo, esse cenário custaria ${fmtSigned(s.totalPct)}% no vale, com recuperação estimada em ~${s.recoveryMonths} meses.${worst && worst.shockPct < 0 ? ` Quem mais sentiria é ${worst.ticker} (${fmtSigned(worst.shockPct, 0)}%)` : ''}${best && best.shockPct > 0 ? `${worst && worst.shockPct < 0 ? '; ' : ' '}quem seguraria é ${best.ticker} (${fmtSigned(best.shockPct, 0)}%)` : ''}.`
    : ''

  const whatsapp
    = `Rodei uma simulação de 10 anos da sua carteira (${anchor}) no cenário "${r.scenario.title}". `
      + `O caminho central termina em ${fmtBRL(r.final.p50)} — mas o honesto é a faixa: entre ${faixa}.`
      + `${choqueTxt} Os números já são líquidos de IR estimado. Te mostro as premissas quando quiser.`

  const emailSubject = `Simulação da sua carteira — ${r.scenario.title}`
  const emailBody
    = `Simulei o comportamento da sua carteira (${anchor} hoje) ao longo de 10 anos no cenário "${r.scenario.title}". `
      + `A mediana da simulação termina em ${fmtBRL(r.final.p50)}, com a faixa estatística entre ${faixa} — a faixa é o dado; a mediana é só o meio dela.`
      + `${choqueTxt} O carrego líquido estimado da carteira nesse cenário é de ${r.assumptions.carryPct.toLocaleString('pt-BR')}% ao ano, com beta ${r.assumptions.beta.toLocaleString('pt-BR')} contra o IBOV. `
      + `Posso abrir a conta posição a posição na nossa próxima conversa.`

  const footer = `Simulação de ${hoje} · protótipo Redentia · faixa estatística com premissas explícitas — não é previsão nem recomendação de investimento · valores líquidos de IR estimado (isentos sem desconto).`

  return { whatsapp, emailSubject, emailBody, footer }
}
