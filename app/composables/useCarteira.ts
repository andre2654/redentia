/**
 * Dados da carteira (PR8) — página /carteira (o miolo vive no
 * CarteiraContent). Contrato de UX: designs/Redentia Carteira Nu.dc.html.
 * A home `/` (Mercado auth-aware) consome o RESUMO via useCarteiraResumo
 * (fim do arquivo) — mesmos fetchers/mesmos builders, payload da banda
 * "Sua carteira" + mini-dashboard do hero (proventos/score/movimentações/
 * pontos de atenção).
 *
 * SSR-FIRST: fetch no servidor via useAsyncData com o Bearer
 * do cookie `nu:token` — a 1ª resposta já sai com o patrimônio real.
 *
 * DIRETRIZ Nº1 (dono): tela DINÂMICA por card. Política POR SEÇÃO:
 *  - hero       cheio (patrimônio + dia + stats) | parcial (sem /today →
 *               badge do dia some; sem custo → stat Retorno/Aportado some) |
 *               vazio (sem carteira → a página VIRA a experiência de conexão)
 *  - alocação   derivada das posições por CLASSE (sem posições → card some)
 *  - chart      MESMO builder da Home (buildEquityChartVM): cheio | parcial
 *               (<10 pontos → 'Coletando histórico') | some
 *  - posições   posicoes-v2: sidebar de navegação (scrollspy) + 1 card por
 *               classe; retorno % só onde há custo (average_price) — coluna
 *               honesta, nunca inventada; só classes com dados aparecem
 *  - raio-x     DETERMINÍSTICO de dado real (regras portadas do
 *               usePortfolioScore do Frontend /raio-x — ver buildRaioX);
 *               insight do banner SÓ do /portfolio/analysis; sem carteira → some
 *  - renda      /portfolio/income + /dividends/upcoming × posições (janela máx
 *               180d do backend); sem proventos E sem agenda → seção some
 *  - movim.     /portfolio/trades (12m): Proventos/Vendas reais; 'Compra' =
 *               abertura agregada da posição (limitação do contrato FIFO —
 *               documentada); sem eventos → some
 *  - heatmap    agregação mensal PORTADA de Frontend wallet/resultado.vue
 *               (byMonth) sobre a equity-curve; <2 meses → some
 *
 * 401/403 no /portfolio ⇒ token morto → `unauthenticated: true`; a página
 * /carteira limpa a sessão e redireciona pro /login (padrão useApi).
 */
import type {
  CarteiraAllocationVM,
  CarteiraGroupVM,
  CarteiraHeatmapVM,
  CarteiraHeroVM,
  CarteiraIncomeVM,
  CarteiraMovementsVM,
  CarteiraMovementVM,
  CarteiraPayload,
  CarteiraRaioXVM,
  CarteiraResumoVM,
  CarteiraRowVM,
  PortfolioAnalysisApi,
  RaioXMetricVM,
  TradeApi,
  UpcomingDividendsApi,
} from '~/types/carteira'
import type {
  EquityCurvePointApi,
  IncomeApi,
  PortfolioPositionApi,
  PortfolioTodayApi,
} from '~/types/home'
import type { ScoreRowApi, SeriesPoint } from '~/types/acao'
import type { NuDir } from '~/types/market'

/* ————— helpers ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nfRate = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })
const nfQty = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 })

const ok = <X>(r: PromiseSettledResult<X>): X | null => (r.status === 'fulfilled' ? r.value : null)

/** '+2,8%' com 1 casa (formato das células do heatmap no design). */
function pct1(n: number): string {
  return `${n > 0 ? '+' : ''}${nf1.format(n)}%`
}

const SIDE_LABEL: Record<string, string> = {
  DIVIDEND: 'Dividendos', JCP: 'JCP', INCOME: 'Rendimento',
}

/** linha interna derivada de uma posição (valor/custo/classe). */
interface PosRow {
  ticker: string
  name: string | null
  assetClass: string
  className: string
  qty: number
  value: number
  cost: number | null
  dy: number | null
  sector: string | null
  indexer: string | null
  maturity: string | null
  /** banco/corretora da conexão Open Finance (sub das linhas de Renda Fixa) */
  institution: string | null
}

function toRows(portfolio: PortfolioPositionApi[] | null): PosRow[] {
  return (portfolio ?? [])
    .map((p) => {
      const value = positionValue(p)
      const avg = p.average_price != null && p.average_price > 0 ? p.average_price : null
      const dyNum = Number(p.dividend_yield)
      const raw = p as PortfolioPositionApi & { indexer?: string | null; maturity?: string | null }
      return {
        ticker: p.ticker,
        name: p.name,
        assetClass: p.asset_class ?? 'STOCK',
        className: CLASS_LABEL[p.asset_class ?? 'STOCK'] ?? 'Outros',
        qty: p.quantity,
        value,
        cost: avg != null ? avg * p.quantity : null,
        dy: Number.isFinite(dyNum) && dyNum > 0 ? dyNum : null,
        sector: p.sector,
        indexer: raw.indexer ?? null,
        maturity: raw.maturity ?? null,
        institution: p.institution_name ?? null,
      }
    })
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value)
}

/* ————— hero + alocação ————— */

/**
 * Estados: 'patrimonio' | 'connect' (a página vira a experiência de conexão).
 * Parciais: sem /today → badge do dia some (hojeTxt null); sem custo
 * (average_price ausente) → stats Retorno total/Aportado somem; /income
 * falhou → stat Proventos some. Nunca número inventado.
 */
function buildHero(rows: PosRow[], today: PortfolioTodayApi | null, income: IncomeApi | null, totalValue: number): CarteiraHeroVM {
  if (totalValue <= 0) {
    return { state: 'connect', patrimonio: null, hojeTxt: null, hojeDir: 'up', metaLine: null, stats: [] }
  }

  let hojeTxt: string | null = null
  let hojeDir: NuDir = 'up'
  if (today?.totals && today.totals.value_d1 > 0) {
    const amt = today.totals.day_change_amount
    const pctDay = today.totals.day_change_pct
    hojeDir = dirOf(amt)
    hojeTxt = `${amt >= 0 ? '+' : '−'}R$ ${nf2.format(Math.abs(amt))} (${nf2.format(Math.abs(pctDay))}%) hoje`
  }

  const n = rows.length
  const updated = relTime(today?.as_of ?? null)
  const metaLine = `${n} ${n === 1 ? 'ativo' : 'ativos'}${updated ? ` · atualizado ${updated}` : ''}`

  const stats: CarteiraHeroVM['stats'] = []
  const cost = rows.reduce((s, r) => s + (r.cost ?? 0), 0)
  const hasFullCost = cost > 0 && rows.every((r) => r.cost != null)
  if (hasFullCost) {
    const ret = totalValue - cost
    const retPct = (ret / cost) * 100
    stats.push({
      label: 'Retorno total',
      value: `${ret >= 0 ? '+' : '−'}R$ ${nf0.format(Math.abs(ret))} (${ret >= 0 ? '+' : '−'}${nf1.format(Math.abs(retPct))}%)`,
      tone: ret >= 0 ? 'green' : 'red',
    })
  }
  if (income?.summary) {
    stats.push({ label: 'Proventos (12M)', value: `R$ ${nf0.format(income.summary.totalAll)}`, tone: 'ink' })
  }
  if (hasFullCost) {
    stats.push({ label: 'Aportado', value: `R$ ${nf0.format(cost)}`, tone: 'ink' })
  }

  return {
    state: 'patrimonio',
    patrimonio: `R$ ${nf2.format(totalValue)}`,
    hojeTxt,
    hojeDir,
    metaLine,
    stats,
  }
}

/** Alocação por CLASSE (card lateral do hero — design agrega por classe). */
function buildAllocation(rows: PosRow[]): CarteiraAllocationVM[] {
  const total = rows.reduce((s, r) => s + r.value, 0)
  if (total <= 0) return []
  const byClass = new Map<string, number>()
  for (const r of rows) byClass.set(r.className, (byClass.get(r.className) ?? 0) + r.value)
  return [...byClass.entries()]
    .sort((a, b) => CLASS_ORDER.indexOf(a[0]) - CLASS_ORDER.indexOf(b[0]))
    .map(([name, val]) => ({
      name,
      pctNum: (val / total) * 100,
      pct: `${nf1.format((val / total) * 100)}%`,
      val: `R$ ${nf0.format(val)}`,
      color: CLASS_COLOR[name] ?? 'var(--nu-alloc-cash)',
    }))
}

/* ————— posições por classe (posicoes-v2: sidebar + card por classe) ————— */

/** CTAs por classe — copy verbatim do design; destinos = rotas Nu reais. */
const GROUP_CTA: Record<string, { cta: string; href: string }> = {
  'Ações': { cta: 'Analisar ações com a IA', href: '/busca' },
  // o antigo hub '/mercado' morreu (301 → '/'); o filtro de FIIs do hub de
  // rankings é o destino honesto.
  'FIIs': { cta: 'Explorar mais FIIs', href: '/rankings?classe=fiis' },
  'Renda Fixa': { cta: 'Simular renda fixa', href: '/calculadoras' },
  'Cripto': { cta: 'Ver análise de risco', href: '/busca' },
  'Outros': { cta: 'Reinvestir agora', href: '/busca' },
}
const GROUP_UNIT: Record<string, [one: string, many: string]> = {
  'Ações': ['ativo', 'ativos'],
  'FIIs': ['ativo', 'ativos'],
  'Renda Fixa': ['título', 'títulos'],
  'Cripto': ['moeda', 'moedas'],
  'Outros': ['ativo', 'ativos'],
}

function rowSub(r: PosRow): string {
  if (r.className === 'Renda Fixa') {
    const parts: string[] = []
    if (r.indexer) parts.push(r.indexer)
    if (r.maturity) {
      const d = r.maturity.slice(0, 10)
      parts.push(`venc. ${d.slice(5, 7)}/${d.slice(2, 4)}`)
    }
    if (parts.length) return parts.join(' · ')
    // sem indexador/vencimento (Tesouro e CDBs vindos do Pluggy): o banco diz
    // mais que a quantidade de unidades (o agregado de caixinhas soma milhões
    // de "un." sem significado nenhum pro investidor)
    if (r.institution) return r.institution
    return `${nfQty.format(r.qty)} un.`
  }
  if (r.className === 'Cripto') return `${nfQty.format(r.qty)} ${r.ticker.toUpperCase()}`
  const cotas = `${nfQty.format(r.qty)} ${r.qty === 1 ? 'cota' : 'cotas'}`
  const avg = r.cost != null && r.qty > 0 ? r.cost / r.qty : null
  return avg != null ? `${cotas} · PM R$ ${nf2.format(avg)}` : cotas
}

/**
 * Editorial por grupo: SÓ quando o /portfolio/analysis tem tese aplicável
 * (thesis_per_asset da maior posição do grupo). Sem análise → coluna sai só
 * com o CTA (nada de texto inventado) — diretriz documentada.
 */
function groupDesc(groupRows: PosRow[], analysis: PortfolioAnalysisApi['analysis'] | null): string | null {
  const theses = analysis?.thesis_per_asset ?? []
  if (!theses.length) return null
  for (const r of groupRows) {
    const hit = theses.find((t) => t.ticker?.toUpperCase() === r.ticker.toUpperCase() && t.thesis?.trim())
    if (hit?.thesis) {
      const text = hit.thesis.trim()
      const capped = text.length > 240 ? `${text.slice(0, 237).trimEnd()}…` : text
      return `${r.ticker}: ${capped}`
    }
  }
  return null
}

function buildGroups(
  rows: PosRow[],
  analysis: PortfolioAnalysisApi['analysis'] | null,
): { positionsSub: string | null; groups: CarteiraGroupVM[] } {
  if (!rows.length) return { positionsSub: null, groups: [] }
  const total = rows.reduce((s, r) => s + r.value, 0)

  const byClass = new Map<string, PosRow[]>()
  for (const r of rows) {
    if (!byClass.has(r.className)) byClass.set(r.className, [])
    byClass.get(r.className)!.push(r)
  }

  const groups: CarteiraGroupVM[] = [...byClass.entries()]
    .sort((a, b) => CLASS_ORDER.indexOf(a[0]) - CLASS_ORDER.indexOf(b[0]))
    .map(([name, list]) => {
      const gTotal = list.reduce((s, r) => s + r.value, 0)
      const withCost = list.filter((r) => r.cost != null)
      const gCost = withCost.reduce((s, r) => s + (r.cost ?? 0), 0)
      const gValueCosted = withCost.reduce((s, r) => s + r.value, 0)
      const retPct = gCost > 0 ? (gValueCosted / gCost - 1) * 100 : null
      const [one, many] = GROUP_UNIT[name] ?? ['ativo', 'ativos']
      const isEquity = (c: string) => ['STOCK', 'REIT', 'ETF', 'BDR'].includes(c)

      const rowsVM: CarteiraRowVM[] = list.map((r, i) => {
        const tile = tileFor(r.ticker, r.assetClass, i)
        const retP = r.cost != null && r.cost > 0 ? (r.value / r.cost - 1) * 100 : null
        const label = r.className === 'Renda Fixa' ? (r.name || r.ticker) : r.ticker
        return {
          ticker: r.ticker,
          label,
          sub: rowSub(r),
          letter: label.charAt(0).toUpperCase(),
          tileBg: tile[0],
          tileFg: tile[1],
          val: `R$ ${nf0.format(r.value)}`,
          ret: retP != null ? pctFmt(retP) : null,
          retDir: dirOf(retP ?? 0),
          href: isEquity(r.assetClass) ? `/asset/${r.ticker}` : null,
        }
      })

      return {
        name,
        color: CLASS_COLOR[name] ?? 'var(--nu-alloc-cash)',
        count: `${list.length} ${list.length === 1 ? one : many}`,
        total: `R$ ${nf0.format(gTotal)}`,
        share: `${nf1.format((gTotal / total) * 100)}%`,
        shareNum: (gTotal / total) * 100,
        ret: retPct != null ? pctFmt(retPct) : null,
        retKind: retPct == null ? 'flat' : retPct >= 0 ? 'up' : 'down',
        rows: rowsVM,
        desc: groupDesc(list, analysis),
        cta: GROUP_CTA[name]?.cta ?? 'Ver na busca',
        ctaHref: GROUP_CTA[name]?.href ?? '/busca',
      }
    })

  // sub do design posicoes-v2: '{N} classes · role para explorar'
  const nc = byClass.size
  const positionsSub = `${nc} ${nc === 1 ? 'classe' : 'classes'} · role para explorar`
  return { positionsSub, groups }
}

/* ————— Raio-X (regras PORTADAS do usePortfolioScore do Frontend /raio-x) ————— */

/**
 * 4 métricas do design, todas DETERMINÍSTICAS de dado real:
 *  - Diversificação: thresholds de calcDiversificacao (nº de ativos: ≤2→25,
 *    ≤4→50, ≤6→70, ≤9→88, +→95; 1 setor só capa em 30)
 *  - Risco: beta REAL da carteira vs IBOV — cov/var dos retornos diários
 *    (equity-curve × série IBOV 12m, mínimo 60 pregões em comum); score pelos
 *    thresholds de calcVolatilidade (<0.5→88, <0.8→80, <1.1→68, <1.4→50,
 *    <1.8→32, senão 15). Sem série suficiente → card some (sem beta chutado)
 *  - Renda: DY 12m ponderado por valor (campo dividend_yield do /portfolio);
 *    thresholds de calcRendaPassiva (<2→25, <4→50, <6→70, <9→88, senão 95)
 *  - Qualidade: média ponderada do Redentia Score (0-10 → ×10 pra /100 — NÃO
 *    ×20, gotcha documentado) dos ativos cobertos pelo ranking; exige ≥2
 *    ativos cobertos, senão some
 * Score geral = média ponderada com os pesos do usePortfolioScore
 * (diversificação 1.4 · risco/volatilidade 1.1 · renda 0.9 · qualidade 1.5)
 * sobre as métricas PRESENTES. Badge = bandas portadas (<45 crítica, <65
 * atenção, <82 boa, senão excelente) + nº de pontos de atenção (score <70).
 * Tags do design: <70 'Atenção' âmbar · 70-84 'Controlado' · ≥85 'Excelente'.
 */
function buildRaioX(
  rows: PosRow[],
  income: IncomeApi | null,
  scoreRows: ScoreRowApi[] | null,
  curve: EquityCurvePointApi[] | null,
  ibov12m: SeriesPoint[] | null,
  analysis: PortfolioAnalysisApi['analysis'] | null,
): CarteiraRaioXVM | null {
  if (!rows.length) return null
  const total = rows.reduce((s, r) => s + r.value, 0)
  if (total <= 0) return null

  const tagFor = (score: number): Pick<RaioXMetricVM, 'tag' | 'tagTone' | 'fillTone'> =>
    score < 70
      ? { tag: 'Atenção', tagTone: 'amber', fillTone: 'amber' }
      : score < 85
        ? { tag: 'Controlado', tagTone: 'green', fillTone: 'green' }
        : { tag: 'Excelente', tagTone: 'green', fillTone: 'green' }

  const dims: { weight: number; score: number; vm: RaioXMetricVM }[] = []

  /* Diversificação */
  {
    const n = rows.length
    let score = n <= 2 ? 25 : n <= 4 ? 50 : n <= 6 ? 70 : n <= 9 ? 88 : 95
    const sectors = new Set(rows.map((r) => r.sector ?? r.className))
    if (sectors.size === 1) score = Math.min(score, 30)
    const byClass = new Map<string, number>()
    for (const r of rows) byClass.set(r.className, (byClass.get(r.className) ?? 0) + r.value)
    const topClass = [...byClass.entries()].sort((a, b) => b[1] - a[1])[0]!
    const bySector = new Map<string, number>()
    for (const r of rows) { if (r.sector) bySector.set(r.sector, (bySector.get(r.sector) ?? 0) + r.value) }
    const topSector = [...bySector.entries()].sort((a, b) => b[1] - a[1])[0]
    // display minúsculo do design ('71,9% em ações') — FIIs é sigla, não desce
    const classLower: Record<string, string> = { 'Ações': 'ações', 'FIIs': 'FIIs', 'Renda Fixa': 'renda fixa', 'Cripto': 'cripto', 'Outros': 'outros' }
    const note = topSector
      ? `${nf1.format((topClass[1] / total) * 100)}% em ${classLower[topClass[0]] ?? topClass[0]}. Maior setor: ${topSector[0]} (${nf0.format((topSector[1] / total) * 100)}% do total).`
      : `${n} ${n === 1 ? 'ativo' : 'ativos'} em ${sectors.size} ${sectors.size === 1 ? 'setor' : 'setores'}.`
    dims.push({ weight: 1.4, score, vm: { label: 'Diversificação', value: `${score}/100`, fillPct: score, note, ...tagFor(score) } })
  }

  /* Risco (beta real carteira × IBOV) */
  const beta = computeBeta(curve, ibov12m)
  if (beta) {
    const b = beta.beta
    const score = b < 0.5 ? 88 : b < 0.8 ? 80 : b < 1.1 ? 68 : b < 1.4 ? 50 : b < 1.8 ? 32 : 15
    const note = `Sua carteira oscila ${beta.volP < beta.volI ? 'menos' : 'mais'} que o IBOV: ${nf1.format(beta.volP)}% vs ${nf1.format(beta.volI)}% a.a.`
    dims.push({ weight: 1.1, score, vm: { label: 'Risco', value: `Beta ${nf2.format(b)}`, fillPct: score, note, ...tagFor(score) } })
  }

  /* Renda — DY REAL observado (proventos 12M ÷ patrimônio) quando há income;
     fallback = DY ponderado dos ativos com dado (dividend_yield é null pra
     FIIs no /portfolio — usar só ele subestimaria; decisão documentada). */
  {
    const totalAll = income?.summary?.totalAll ?? 0
    const dyPond = rows.reduce((s, r) => s + (r.dy ?? 0) * r.value, 0) / total
    const dy = totalAll > 0 ? (totalAll / total) * 100 : dyPond
    const score = dy < 2 ? 25 : dy < 4 ? 50 : dy < 6 ? 70 : dy < 9 ? 88 : 95
    const note = totalAll > 0
      ? `R$ ${nf0.format(totalAll)} em proventos nos últimos 12 meses.`
      : 'Sem proventos registrados nos últimos 12 meses.'
    dims.push({ weight: 0.9, score, vm: { label: 'Renda', value: `DY ${nf1.format(dy)}%`, fillPct: score, note, ...tagFor(score) } })
  }

  /* Qualidade (Redentia Score real, 0-10 → ×10) */
  {
    const scoreMap = new Map((scoreRows ?? []).filter((s) => s.redentia_score != null).map((s) => [s.ticker.toUpperCase(), s.redentia_score as number]))
    const matched = rows.filter((r) => scoreMap.has(r.ticker.toUpperCase()))
    if (matched.length >= 2) {
      const mTotal = matched.reduce((s, r) => s + r.value, 0)
      const q = Math.round(matched.reduce((s, r) => s + (scoreMap.get(r.ticker.toUpperCase())! * 10) * r.value, 0) / mTotal)
      const top = [...matched].sort((a, b) => scoreMap.get(b.ticker.toUpperCase())! - scoreMap.get(a.ticker.toUpperCase())!).slice(0, 2)
      const note = `Score médio de ${matched.length} dos seus ativos: ${top.map((t) => t.ticker).join(' e ')} ${top.length > 1 ? 'puxam' : 'puxa'} para cima.`
      dims.push({ weight: 1.5, score: q, vm: { label: 'Qualidade', value: `${q}/100`, fillPct: q, note, ...tagFor(q) } })
    }
  }

  if (!dims.length) return null
  const totalW = dims.reduce((s, d) => s + d.weight, 0)
  const score = Math.round(dims.reduce((s, d) => s + d.score * d.weight, 0) / totalW)

  const band = score < 45 ? 'Saúde crítica' : score < 65 ? 'Atenção' : score < 82 ? 'Boa saúde' : 'Excelente'
  const attention = dims.filter((d) => d.score < 70).length
  const badge = attention > 0 ? `${band} · ${attention} ${attention === 1 ? 'ponto' : 'pontos'} de atenção` : band
  // band/attention saem isolados no VM: o mini-dashboard da home reusa os
  // MESMOS números desta função (zero regra duplicada — refinamento 2026-07-13)

  /* insight do banner: só do /portfolio/analysis (severity high > medium > low) */
  let insight: string | null = null
  const risks = analysis?.risks ?? []
  if (risks.length) {
    const order = { high: 0, medium: 1, low: 2 } as Record<string, number>
    const top = [...risks].sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))[0]!
    const text = [top.title, top.body].filter(Boolean).join(': ')
    insight = text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text
  }

  // Data da análise da IA quando NÃO é de hoje: a análise é um snapshot LLM
  // persistido (portfolio_analyses) que pode ter semanas — sem a data, o
  // banner apresenta texto antigo como diagnóstico atual (auditoria
  // 2026-07-16: banner citava composição de 22/05 como se fosse de hoje).
  let insightDate: string | null = null
  if (insight && analysis?.generated_at) {
    const gen = new Date(analysis.generated_at)
    if (!Number.isNaN(gen.getTime()) && gen.toDateString() !== new Date().toDateString()) {
      insightDate = `${String(gen.getDate()).padStart(2, '0')}/${String(gen.getMonth() + 1).padStart(2, '0')}`
    }
  }

  return { score, badge, band, attention, metrics: dims.map((d) => d.vm), insight, insightDate }
}

/**
 * Beta e volatilidades REAIS: retornos diários da carteira = ΔP&L (equity) ÷
 * patrimônio do dia anterior (fluxo de aporte não vira "retorno") × retornos
 * diários do IBOV, casados por data. Exige ≥60 pregões em comum.
 */
function computeBeta(
  curve: EquityCurvePointApi[] | null,
  ibov: SeriesPoint[] | null,
): { beta: number; volP: number; volI: number } | null {
  if (!curve || curve.length < 2 || !ibov || ibov.length < 2) return null
  const rp = new Map<string, number>()
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1]!
    const cur = curve[i]!
    if (prev.position_value > 0) rp.set(cur.date, (cur.equity - prev.equity) / prev.position_value)
  }
  const pairs: [number, number][] = []
  for (let i = 1; i < ibov.length; i++) {
    const prev = ibov[i - 1]!
    const cur = ibov[i]!
    const key = cur.t.slice(0, 10)
    const p = rp.get(key)
    if (p != null && prev.v > 0) pairs.push([p, cur.v / prev.v - 1])
  }
  if (pairs.length < 60) return null
  const n = pairs.length
  const meanP = pairs.reduce((s, x) => s + x[0], 0) / n
  const meanI = pairs.reduce((s, x) => s + x[1], 0) / n
  let cov = 0; let varI = 0; let varP = 0
  for (const [p, i] of pairs) {
    cov += (p - meanP) * (i - meanI)
    varI += (i - meanI) ** 2
    varP += (p - meanP) ** 2
  }
  cov /= n; varI /= n; varP /= n
  if (varI <= 0) return null
  const ann = (v: number) => Math.sqrt(v) * Math.sqrt(252) * 100
  return { beta: cov / varI, volP: ann(varP), volI: ann(varI) }
}

/* ————— renda passiva ————— */

/**
 * Estados: cheio | parcial (só histórico OU só agenda — cards ausentes somem
 * do grid auto-fit) | null (sem proventos E sem agenda → seção some).
 * Agenda: /dividends/upcoming (janela máx 180d — gotcha do backend) cruzado
 * com as posições; valor estimado = rate × qty da posição. 'Previsão IA' NÃO
 * existe no backend → só badge 'Confirmado' (decisão documentada).
 */
function buildIncome(
  income: IncomeApi | null,
  upcoming: UpcomingDividendsApi | null,
  rows: PosRow[],
): CarteiraIncomeVM | null {
  const months = income?.months ?? []
  const totalAll = income?.summary?.totalAll ?? 0

  /* card 1 — mês corrente (ou o último mês COM pagamento, rotulado honesto) */
  const nowKey = spISODate().slice(0, 7)
  const current = months.find((m) => m.month === nowKey)
  const bucket = current && current.total > 0
    ? current
    : [...months].reverse().find((m) => m.total > 0) ?? null
  let month: CarteiraIncomeVM['month'] = null
  if (bucket) {
    const isCurrent = bucket.month === nowKey
    const entries = [...bucket.entries].sort((a, b) => b.trade_date.localeCompare(a.trade_date))
    month = {
      label: (MONTH_LONG_PT[Number(bucket.month.slice(5)) - 1] ?? bucket.label).toUpperCase(),
      countBadge: `${bucket.entries.length} ${bucket.entries.length === 1 ? 'pagamento' : 'pagamentos'}`,
      total: `+R$ ${nf2.format(bucket.total)}`,
      subLabel: isCurrent ? 'recebidos até agora' : 'recebidos no mês',
      payments: entries.slice(0, 5).map((e) => ({
        d: e.trade_date.slice(8, 10),
        ticker: e.ticker,
        tipo: [SIDE_LABEL[e.side] ?? 'Provento', e.name].filter(Boolean).join(' · '),
        val: `+R$ ${nf2.format(e.amount)}`,
      })),
    }
  }

  /* card 2 — recorde + mini bar chart 6M + média */
  let record: CarteiraIncomeVM['record'] = null
  const paid = months.filter((m) => m.total > 0)
  if (paid.length) {
    const rec = [...months].sort((a, b) => b.total - a.total)[0]!
    const last6 = months.slice(-6)
    const max6 = Math.max(...last6.map((m) => m.total), 1)
    const avg6 = last6.reduce((s, m) => s + m.total, 0) / Math.max(last6.length, 1)
    record = {
      value: `R$ ${nf0.format(rec.total)}`,
      sub: `recorde em um mês · ${MONTHS_PT[Number(rec.month.slice(5)) - 1]} ${rec.month.slice(0, 4)}`,
      bars: last6.map((m) => ({
        mes: MONTHS_PT[Number(m.month.slice(5)) - 1] ?? m.label.toLowerCase(),
        hPct: Math.max((m.total / max6) * 100, 0),
        top: m.month === rec.month,
      })),
      avg: `R$ ${nf0.format(avg6)}`,
    }
  }

  /* card 3 — agenda de próximos pagamentos (× posições) */
  let agenda: CarteiraIncomeVM['agenda'] = null
  const qtyBy = new Map(rows.map((r) => [r.ticker.toUpperCase(), r.qty]))
  const future: { date: string; ticker: string; label: string; est: number }[] = []
  for (const day of upcoming?.data ?? []) {
    for (const it of day.items) {
      const qty = qtyBy.get(it.ticker.toUpperCase())
      if (!qty || !(it.rate > 0)) continue
      future.push({ date: it.payment_date, ticker: it.ticker, label: `${it.label} · R$ ${nfRate.format(it.rate)}/ação`, est: it.rate * qty })
    }
  }
  if (future.length) {
    future.sort((a, b) => a.date.localeCompare(b.date))
    const shown = future.slice(0, 4)
    const last = future[future.length - 1]!
    const totalEst = future.reduce((s, f) => s + f.est, 0)
    agenda = {
      rows: shown.map((f) => ({
        d: f.date.slice(8, 10),
        m: (MONTHS_PT[Number(f.date.slice(5, 7)) - 1] ?? '').toUpperCase(),
        ticker: f.ticker,
        tipo: f.label,
        val: `+R$ ${nf0.format(f.est)}`,
      })),
      footLabel: `Previsto até ${MONTH_LONG_PT[Number(last.date.slice(5, 7)) - 1]}`,
      footVal: `+R$ ${nf0.format(totalEst)}`,
    }
  }

  if (totalAll <= 0 && !agenda) return null
  return {
    sub: `R$ ${nf0.format(totalAll)} nos últimos 12 meses`,
    month,
    record,
    agenda,
  }
}

/* ————— movimentações ————— */

/**
 * Do /portfolio/trades (12m): Proventos (income-*) e Vendas (round-*) são
 * eventos REAIS datados; 'Compra' vem da abertura agregada da posição
 * (open-*: 1ª compra + PM médio) porque o contrato FIFO NÃO expõe execuções
 * individuais de compra — sub honesta 'N cotas · PM R$ X' (não 'N × R$ X').
 * Limitação documentada no relatório. Sem eventos → seção some.
 */
function buildMovements(trades: TradeApi[] | null): CarteiraMovementsVM | null {
  if (!trades?.length) return null

  const events: (CarteiraMovementVM & { date: string })[] = []
  for (const t of trades) {
    let date: string; let badge: CarteiraMovementVM['badge']; let sub: string; let valRaw: number
    if (t.id.startsWith('income-')) {
      if (t.resultAmount == null) continue
      date = t.openedAt.slice(0, 10)
      badge = 'Provento'
      valRaw = t.resultAmount
      const rate = t.quantity > 0 ? t.resultAmount / t.quantity : null
      sub = [
        SIDE_LABEL[t.side] ?? 'Provento',
        rate != null ? `R$ ${nfRate.format(rate)}/ação` : null,
        t.quantity > 0 ? `${nfQty.format(t.quantity)} cotas` : null,
      ].filter(Boolean).join(' · ')
    } else if (t.id.startsWith('round-')) {
      if (!t.closedAt || t.closePrice == null) continue
      date = t.closedAt.slice(0, 10)
      badge = 'Venda'
      valRaw = t.quantity * t.closePrice
      sub = `${nfQty.format(t.quantity)} cotas × R$ ${nf2.format(t.closePrice)}`
    } else if (t.id.startsWith('open-')) {
      if (t.openPrice == null) continue
      date = t.openedAt.slice(0, 10)
      badge = 'Compra'
      valRaw = -(t.quantity * t.openPrice)
      sub = `${nfQty.format(t.quantity)} cotas · PM R$ ${nf2.format(t.openPrice)}`
    } else {
      continue
    }
    events.push({
      key: t.id,
      date,
      d: date.slice(8, 10),
      m: (MONTHS_PT[Number(date.slice(5, 7)) - 1] ?? '').toUpperCase(),
      ticker: t.ticker,
      letter: t.ticker.charAt(0).toUpperCase(),
      tileBg: '', tileFg: '', // preenchidos abaixo (tileFor precisa de índice estável)
      badge,
      sub,
      valRaw,
      val: `${valRaw < 0 ? '-' : '+'}R$ ${nf2.format(Math.abs(valRaw))}`,
    })
  }
  if (!events.length) return null

  events.sort((a, b) => b.date.localeCompare(a.date))
  events.forEach((e, i) => {
    const tile = tileFor(e.ticker, null, i)
    e.tileBg = tile[0]
    e.tileFg = tile[1]
  })

  const monthKey = events[0]!.date.slice(0, 7)
  const monthEvents = events.filter((e) => e.date.startsWith(monthKey))
  const saldoNum = monthEvents.reduce((s, e) => s + e.valRaw, 0)
  const monthName = MONTH_LONG_PT[Number(monthKey.slice(5)) - 1] ?? ''
  const monthLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${monthKey.slice(0, 4)}`

  return {
    monthLabel,
    saldo: `${saldoNum < 0 ? '-' : '+'}R$ ${nf2.format(Math.abs(saldoNum))}`,
    saldoDir: dirOf(saldoNum),
    monthEvents: monthEvents.map(({ date: _date, ...vm }) => vm),
    allEvents: events.map(({ date: _date, ...vm }) => vm),
  }
}

/* ————— P&L mês a mês (heatmap) ————— */

/**
 * Agregação mensal PORTADA de Frontend/app/pages/wallet/resultado.vue:1034
 * (byMonth: agrupa a série diária por chave 'YYYY-MM') aplicada à
 * equity-curve — `equity` = P&L acumulado (realized + unrealized + INCOME),
 * então o retorno mensal JÁ inclui proventos, como pede o design.
 * Fórmula por mês: pnl% = (equityFimDoMês − equityFimDoMêsAnterior)
 *                        ÷ patrimônioFimDoMêsAnterior × 100
 * (1º mês usa o primeiro ponto do próprio mês como base). Total do ano =
 * composto dos meses. Células: função hmCell EXATA do design
 * (α = 0.12 + 0.88·min(1, |v|/3.5); ink branco quando α > 0.5).
 * Meses futuros/sem histórico = null (célula vazia). <2 meses → seção some.
 */
function buildHeatmap(curve: EquityCurvePointApi[] | null): CarteiraHeatmapVM | null {
  if (!curve?.length) return null
  const firstIdx = curve.findIndex((p) => p.position_value > 0)
  if (firstIdx < 0) return null
  const pts = curve.slice(firstIdx)

  // byMonth (portado): agrupa pontos diários por 'YYYY-MM' preservando ordem
  const byMonth = new Map<string, EquityCurvePointApi[]>()
  for (const p of pts) {
    const key = p.date.slice(0, 7)
    if (!byMonth.has(key)) byMonth.set(key, [])
    byMonth.get(key)!.push(p)
  }
  const keys = [...byMonth.keys()].sort()
  if (keys.length < 2) return null

  const pctByKey = new Map<string, number>()
  for (let i = 0; i < keys.length; i++) {
    const cells = byMonth.get(keys[i]!)!
    const end = cells[cells.length - 1]!
    const base = i > 0
      ? (() => { const prev = byMonth.get(keys[i - 1]!)!; const p = prev[prev.length - 1]!; return { equity: p.equity, pos: p.position_value } })()
      : { equity: cells[0]!.equity, pos: cells[0]!.position_value }
    if (base.pos > 0) pctByKey.set(keys[i]!, ((end.equity - base.equity) / base.pos) * 100)
  }
  if (pctByKey.size < 2) return null

  const firstYear = Number(keys[0]!.slice(0, 4))
  const lastKey = keys[keys.length - 1]!
  const lastYear = Number(lastKey.slice(0, 4))

  const years: CarteiraHeatmapVM['years'] = []
  for (let y = lastYear; y >= firstYear; y--) {
    const cells = Array.from({ length: 12 }, (_, m) => {
      const key = `${y}-${String(m + 1).padStart(2, '0')}`
      const v = pctByKey.get(key)
      if (v == null) return null
      const alpha = 0.12 + 0.88 * Math.min(1, Math.abs(v) / 3.5)
      return { txt: pct1(v), alpha: Number(alpha.toFixed(2)), neg: v < 0, inkWhite: alpha > 0.5 }
    })
    const monthPcts = Array.from({ length: 12 }, (_, m) => pctByKey.get(`${y}-${String(m + 1).padStart(2, '0')}`)).filter((v): v is number => v != null)
    if (!monthPcts.length) continue
    const anoPct = (monthPcts.reduce((acc, v) => acc * (1 + v / 100), 1) - 1) * 100
    years.push({ y: String(y), cells, ano: pct1(anoPct), anoNeg: anoPct < 0 })
  }
  if (!years.length) return null

  const nowKey = spISODate().slice(0, 7)
  const partial = lastKey === nowKey
  const note = partial
    ? `${MONTHS_PT[Number(lastKey.slice(5)) - 1]}/${lastKey.slice(0, 4)} é parcial · células vazias são meses futuros`
    : 'células vazias são meses sem histórico'

  return {
    sub: `Retorno mensal da carteira, com proventos · ${firstYear === lastYear ? firstYear : `${firstYear}–${lastYear}`}`,
    years,
    note,
  }
}

/* ————— loader ————— */

function emptyPayload(unauthenticated: boolean): CarteiraPayload {
  return {
    unauthenticated,
    hero: { state: 'connect', patrimonio: null, hojeTxt: null, hojeDir: 'up', metaLine: null, stats: [] },
    allocation: [],
    chart: null,
    positionsSub: null,
    groups: [],
    raiox: null,
    income: null,
    movements: null,
    heatmap: null,
  }
}

async function loadCarteira(base: string, token: string): Promise<CarteiraPayload> {
  const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  const [
    portfolioR, todayR, curveR, incomeR, tradesR, analysisR,
    upcomingR, macroR, ibovR, scoreR,
  ] = await Promise.allSettled([
    homeFetchPortfolio(base, headers),
    homeFetchToday(base, headers),
    homeFetchEquityCurve(base, headers),
    homeFetchIncome(base, headers),
    carteiraFetchTrades(base, headers, '12m'),
    carteiraFetchAnalysis(base, headers), // 404 'no_analysis_yet' cai no ok() → null
    carteiraFetchUpcomingDividends(base, 180),
    homeFetchMacro(base),
    acaoFetchIbovPrices(base, '12mo'),
    acaoFetchScoreRanking(base),
  ])

  // token morto: /portfolio (a fonte de verdade da página) respondeu 401/403
  if (portfolioR.status === 'rejected') {
    const e = portfolioR.reason as { statusCode?: number; response?: { status?: number } }
    const status = e?.statusCode ?? e?.response?.status
    if (status === 401 || status === 403) return emptyPayload(true)
  }

  const portfolio = ok(portfolioR)?.positions ?? null
  const today = ok(todayR)
  const curve = ok(curveR)?.data ?? null
  const income = ok(incomeR)
  const trades = ok(tradesR)?.data ?? null
  const analysis = ok(analysisR)?.analysis ?? null
  const upcoming = ok(upcomingR)
  const cdiRate = cdiAnnualPct(ok(macroR)?.cdi)
  const ibov12m: SeriesPoint[] = (ok(ibovR)?.data ?? [])
    .filter((p) => p.market_price != null)
    .map((p) => ({ t: p.price_at, v: p.market_price as number }))
  const scoreRows = ok(scoreR)?.data ?? null

  const rows = toRows(portfolio)
  const totalValue = portfolioTotalValue(portfolio, today)
  const { positionsSub, groups } = buildGroups(rows, analysis)

  return {
    hero: buildHero(rows, today, income, totalValue),
    allocation: buildAllocation(rows),
    chart: buildEquityChartVM(curve, ibov12m.length ? ibov12m : null, cdiRate, totalValue),
    positionsSub,
    groups,
    raiox: buildRaioX(rows, income, scoreRows, curve, ibov12m.length ? ibov12m : null, analysis),
    income: buildIncome(income, upcoming, rows),
    movements: buildMovements(trades),
    heatmap: buildHeatmap(curve),
  }
}

/* ————— composable ————— */

export async function useCarteira() {
  const config = useRuntimeConfig()
  const { token } = useAuthState()
  // Server: URL direta do Laravel (sem loopback no próprio Nitro).
  // Client: proxy same-origin /api/backend (zero CORS).
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'

  const { data, pending, refresh } = await useAsyncData<CarteiraPayload>(
    'carteira',
    () => {
      const t = token.value
      if (!t) return Promise.resolve(emptyPayload(true))
      return loadCarteira(import.meta.server ? serverBase : clientBase, t)
    },
  )

  return { data, pending, refresh }
}

/* ————— resumo da home `/` (banda "Sua carteira" + mini-dashboard do hero) ————— */

const RESUMO_CONNECT: CarteiraResumoVM = {
  state: 'connect', patrimonio: null, hojeTxt: null, hojeDir: 'up',
  proventos12m: null, score: null, movCount: null, movLabel: null, atencao: null,
}

/**
 * Payload da home Mercado logada (refinamento 2026-07-13): patrimônio +
 * variação do dia (banda azul) + os 4 KPIs do mini-dashboard do hero
 * (proventos 12M, score do Raio-X, movimentações, pontos de atenção).
 * REUSA os builders da página /carteira (buildRaioX/buildMovements + os
 * mesmos fetchers) — zero regra duplicada, MESMOS números nas duas telas.
 * Estados honestos:
 *  - state 'patrimonio'  conectado com valor → resumo cheio; cada KPI só sai
 *                        quando o dado real existe (campo null → mini-card some)
 *  - state 'connect'     sem Open Finance → convite compacto (hero e banda)
 *  - unauthenticated     token morto (401/403) → quem consome limpa a sessão
 *  - fetch do /portfolio falhou (não-auth) → `null` → banda some e o hero
 *    mantém a animação (nada inventado)
 */
async function loadCarteiraResumo(base: string, token: string): Promise<CarteiraResumoVM | null> {
  const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` }

  const [portfolioR, todayR, incomeR, tradesR, curveR, ibovR, scoreR, analysisR] = await Promise.allSettled([
    homeFetchPortfolio(base, headers),
    homeFetchToday(base, headers),
    homeFetchIncome(base, headers),
    carteiraFetchTrades(base, headers, '12m'),
    homeFetchEquityCurve(base, headers),
    acaoFetchIbovPrices(base, '12mo'),
    acaoFetchScoreRanking(base),
    carteiraFetchAnalysis(base, headers), // 404 'no_analysis_yet' cai no ok() → null
  ])

  if (portfolioR.status === 'rejected') {
    const e = portfolioR.reason as { statusCode?: number; response?: { status?: number } }
    const status = e?.statusCode ?? e?.response?.status
    if (status === 401 || status === 403) return { ...RESUMO_CONNECT, unauthenticated: true }
    return null // dado indisponível (não-auth) → seção some
  }

  const portfolio = ok(portfolioR)?.positions ?? null
  const today = ok(todayR)
  const rows = toRows(portfolio)
  const totalValue = portfolioTotalValue(portfolio, today)

  if (totalValue <= 0) return { ...RESUMO_CONNECT }

  // badge do dia: MESMA regra do buildHero (só com /today válido; nunca inventado)
  let hojeTxt: string | null = null
  let hojeDir: NuDir = 'up'
  if (today?.totals && today.totals.value_d1 > 0) {
    const amt = today.totals.day_change_amount
    const pctDay = today.totals.day_change_pct
    hojeDir = dirOf(amt)
    hojeTxt = `${amt >= 0 ? '+' : '−'}R$ ${nf2.format(Math.abs(amt))} (${nf2.format(Math.abs(pctDay))}%) hoje`
  }

  const income = ok(incomeR)
  const ibov12m: SeriesPoint[] = (ok(ibovR)?.data ?? [])
    .filter((p) => p.market_price != null)
    .map((p) => ({ t: p.price_at, v: p.market_price as number }))

  // Raio-X: MESMA função da /carteira → score/band/attention idênticos lá e cá.
  // raiox null (sem carteira, já excluído acima) não acontece aqui; ainda assim
  // os campos degradam pra null (mini-cards somem, atalho de atenção some).
  const raiox = buildRaioX(
    rows,
    income,
    ok(scoreR)?.data ?? null,
    ok(curveR)?.data ?? null,
    ibov12m.length ? ibov12m : null,
    ok(analysisR)?.analysis ?? null,
  )

  // Movimentações: allEvents do MESMO builder do extrato (janela 12m do fetch)
  const movements = buildMovements(ok(tradesR)?.data ?? null)

  // Proventos: só com valor real >0 — quando sai, a seção #renda-passiva da
  // /carteira também existe (mesma condição do buildIncome), âncora garantida
  const totalAll = income?.summary?.totalAll ?? 0

  return {
    state: 'patrimonio',
    patrimonio: `R$ ${nf2.format(totalValue)}`,
    hojeTxt,
    hojeDir,
    proventos12m: totalAll > 0 ? `R$ ${nf0.format(totalAll)}` : null,
    score: raiox ? { val: raiox.score, band: raiox.band, tone: raiox.score < 65 ? 'amber' : 'green' } : null,
    movCount: movements ? movements.allEvents.length : null,
    movLabel: movements ? 'últimos 12 meses' : null,
    atencao: raiox ? raiox.attention : null,
  }
}

/** Resumo da carteira pra home `/` (Mercado logado). null = anônimo/indisponível. */
export async function useCarteiraResumo() {
  const config = useRuntimeConfig()
  const { token } = useAuthState()
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'

  const { data, pending, refresh } = await useAsyncData<CarteiraResumoVM | null>(
    'carteira-resumo',
    () => {
      const t = token.value
      if (!t) return Promise.resolve(null)
      return loadCarteiraResumo(import.meta.server ? serverBase : clientBase, t)
    },
  )

  return { data, pending, refresh }
}
