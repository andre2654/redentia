/**
 * Dados do /tese/[slug] (PR5). Contrato de UX: designs/Redentia Tese.dc.html.
 *
 * SSR-FIRST como o /asset (PR2): o fetch roda no servidor via useAsyncData pro
 * HTML da 1ª resposta já sair indexável com o editorial completo. Política de
 * degradação POR SEÇÃO (documentada em cada builder): o seed do design (a tese
 * "A fábrica volta pra casa") só entra quando o backend INTEIRO falha e o slug
 * é o da tese exemplar do mock (reindustrializacao-eua) — pra qualquer outro
 * slug, mostrar conteúdo de outra tese seria mentir.
 *
 * Fontes de verdade por seção:
 *  - hero/números → /theses/{slug}/performance (NUNCA o sincePct do detail,
 *    que diverge — 22 vs 67 verificado) + /conviction-history + detail;
 *  - avaliação por ativo → studies[0].assets (revalidação mais recente),
 *    fallback companies[] do detail;
 *  - drivers → verdicts[] (1 por kind no runtime real);
 *  - diário → studies[] + conviction-history (pills de convicção por data).
 */
import type {
  ConvictionHistoryApi,
  TeseChartVM,
  TeseConvBadgeVM,
  TeseDecisionVariant,
  TeseDiaryVM,
  TeseDriversVM,
  TeseEditorialVM,
  TeseEvalBadgeVariant,
  TeseEvalCardVM,
  TeseEvalVM,
  TeseHeroVM,
  TeseNumbersVM,
  TesePayload,
  TeseReportPartVM,
  TeseReportSourceVM,
  TeseReportTocItemVM,
  TeseReportVM,
  TeseStudyVM,
  ThesisFullApi,
  ThesisPerformanceApi,
  ThesisReportApi,
  ThesisReportSourceApi,
  ThesisStudyApi,
} from '~/types/tese'
import type { AcaoStatRow, PriceMode, PricePointApi } from '~/types/acao'

/* ————— helpers ————— */

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** '+67%' (badges do hero, inteiro como no design). */
function pct0(n: number): string {
  return `${n > 0 ? '+' : ''}${nf0.format(n)}%`
}
/** '+67,1%' (stats e pill do chart, 1 casa como no design). */
function pct1(n: number): string {
  return `${n >= 0 ? '+' : ''}${nf1.format(n)}%`
}

/**
 * Prosa da tese (API → HTML seguro): escapa (escapeHtml de utils/format, PR7)
 * e converte {mark}…{/mark} do seeder de teses no span de destaque do design
 * (bg azul .16, w800). Tokens órfãos são removidos — nunca vaza "{mark}".
 */
function markHtml(s: string): string {
  return escapeHtml(s)
    .replace(/\{mark\}([\s\S]*?)\{\/mark\}/g, '<span class="tse-hi">$1</span>')
    .replace(/\{\/?mark\}/g, '')
}
function stripMarks(s: string): string {
  return s.replace(/\{\/?mark\}/g, '').replace(/\s+/g, ' ').trim()
}

/** '2026-07-11' → '11 jul' / '11 jul 2026' / '08 jul' (linhas, dia padded como no design).
 * NULL-SAFE: o backend manda `date: null` em alguns studies (ex.: a tese
 * o-pedagio-da-energia) — sem o guard, o `.split` estourava TypeError no
 * transform, o useAsyncData virava error e a página /tese/[slug] devolvia 503
 * (a tese caía do ar apesar do backend 200). Data ausente → string vazia,
 * a seção degrada sem badge de data em vez de derrubar a página. */
function dayMonth(iso?: string | null): string {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  if (!m || !d) return iso
  return `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m}`
}
function dayMonthYear(iso?: string | null): string {
  if (!iso) return ''
  const [y] = iso.split('-')
  return `${dayMonth(iso)} ${y}`.trim()
}
function rowDateFmt(iso?: string | null): string {
  if (!iso) return ''
  const [, m, d] = iso.split('-')
  if (!m || !d) return iso
  return `${d} ${MONTHS_PT[Number(m) - 1] ?? m}`
}

const MONTH_IDX: Record<string, number> = Object.fromEntries(MONTHS_PT.map((m, i) => [m, i]))

/**
 * 'set 2025' | 'Set' + 2025 → Date(2025, 8, 1).
 * GOTCHA runtime: publishedYear vem como STRING em parte das teses ("2025"
 * na bancos-brasileiros) e int em outras — coagir SEMPRE com Number().
 */
function parseMonthLabel(label: string | null | undefined, year?: number | string | null): Date | null {
  if (!label) return null
  const parts = label.trim().toLowerCase().split(/\s+/)
  const m = MONTH_IDX[(parts[0] ?? '').slice(0, 3)]
  const y = Number(parts[1] ?? year ?? NaN)
  if (m == null || !Number.isFinite(y)) return null
  return new Date(y, m, 1)
}

/** mode do /indices/IBOV/prices que cobre a janela desde o lançamento. */
function ibovModeFor(launch: Date | null): PriceMode {
  if (!launch) return '12mo'
  const months = (Date.now() - launch.getTime()) / (30.44 * 86_400_000)
  if (months <= 11.5) return '12mo'
  if (months <= 23.5) return '2y'
  if (months <= 35.5) return '3y'
  if (months <= 47.5) return '4y'
  if (months <= 59.5) return '5y'
  return 'full'
}

/* ————— hero ————— */

function buildHero(
  d: ThesisFullApi,
  perf: ThesisPerformanceApi | null,
  conv: ConvictionHistoryApi | null,
  latestStudy: ThesisStudyApi | null,
): TeseHeroVM {
  const cat = (d.sector ?? '').replace(/^Tese\s*·\s*/i, '').trim() || d.sector
  const title = (d.title ?? '').trim()

  // Convicção: número atual do conviction-history (fallback detail) + delta
  // do dia quando a última mudança aconteceu HOJE ('· +1 hoje', design).
  const cur = conv?.current ?? d.conviction
  let convBadge: string | null = null
  if (cur != null) {
    convBadge = `Convicção ${cur}/100`
    const lc = conv?.lastChange
    if (lc?.occurredAt && lc.occurredAt.slice(0, 10) === localISODate() && lc.fromVal != null && lc.toVal != null) {
      const delta = Number(lc.toVal) - Number(lc.fromVal)
      if (Number.isFinite(delta) && delta !== 0) convBadge += ` · ${delta > 0 ? '+' : ''}${nf0.format(delta)} hoje`
    }
  }

  const sinceBadge = perf?.deltaPct != null ? `${pct0(perf.deltaPct)} desde o lançamento` : null

  let revalBadge: string | null = null
  if (latestStudy?.date) {
    revalBadge = latestStudy.date === localISODate()
      ? `Revalidada hoje · ${dayMonth(latestStudy.date)}`
      : `Revalidada em ${dayMonth(latestStudy.date)}`
  }

  return {
    cat,
    // A API não marca trecho de destaque no título — real renderiza plano
    // (mesma decisão do carrossel do /mercado); o ponto final segue o design.
    titlePre: /[.!?…]$/.test(title) ? title : `${title}.`,
    titleHi: '',
    titlePost: '',
    subtitle: d.description,
    image: teseCover(d.image),
    convBadge,
    sinceBadge,
    ativosBadge: `${d.companiesCount} ${d.companiesCount === 1 ? 'ativo' : 'ativos'}`,
    revalBadge,
  }
}

/* ————— editorial ————— */

function buildEditorial(d: ThesisFullApi): TeseEditorialVM | null {
  const paragraphsHtml = [d.statementHtml, d.statementSubHtml]
    .filter((p): p is string => !!p?.trim())
    .map(markHtml)
  if (!paragraphsHtml.length) return null
  const heading = (d.description ?? '').trim()
  return {
    // O backend não tem um headline editorial separado (o "Quem vende as
    // picaretas." do design) — usamos o one-liner da tese, que é a mesma
    // função editorial. Documentado no relatório do PR.
    heading: /[.!?…]$/.test(heading) ? heading : `${heading}.`,
    paragraphsHtml,
  }
}

/* ————— números (stats + chart) ————— */

function interpAt(pts: { t: number; v: number }[], t: number): number | null {
  if (!pts.length) return null
  const first = pts[0]!
  const last = pts[pts.length - 1]!
  if (t <= first.t) return first.v
  if (t >= last.t) return last.v
  for (let i = 1; i < pts.length; i++) {
    const b = pts[i]!
    if (t <= b.t) {
      const a = pts[i - 1]!
      const f = (t - a.t) / ((b.t - a.t) || 1)
      return a.v + (b.v - a.v) * f
    }
  }
  return last.v
}

/**
 * Chart Tese vs IBOV: a série da tese vem SEM datas (assumimos amostragem
 * uniforme entre o lançamento e hoje — é como o backend a gera). O IBOV é
 * recortado pra MESMA janela, rebased pra 100 no início e reamostrado nas
 * mesmas colunas da tese (comparação honesta, base 100 × base 100).
 * Se o histórico do IBOV começar DEPOIS do lançamento (>10% da janela),
 * recortamos as duas séries pro intervalo comum (tese re-rebased no corte).
 */
function buildNumbers(
  d: ThesisFullApi,
  perf: ThesisPerformanceApi | null,
  conv: ConvictionHistoryApi | null,
  ibovPts: PricePointApi[] | null,
): TeseNumbersVM | null {
  // Sem série de performance → seção inteira some (o chart é a anatomia
  // central; convicção/ativos já aparecem no hero).
  if (!perf || (perf.series?.length ?? 0) < 2) return null

  const launch = parseMonthLabel(perf.startLabel)
    ?? parseMonthLabel(d.publishedLabel, d.publishedYear)
  const now = new Date()

  let tese = perf.series
  let windowStart = launch
  let benchmark: number[] | null = null

  const ibov = (ibovPts ?? [])
    .filter((p) => p.market_price != null && !!p.price_at)
    .map((p) => ({ t: new Date(`${p.price_at}T12:00:00`).getTime(), v: p.market_price as number }))

  if (launch && ibov.length >= 2) {
    const t0 = launch.getTime()
    const t1 = now.getTime()
    const inWindow = ibov.filter((p) => p.t >= t0)
    if (inWindow.length >= 2) {
      const gapFrac = (inWindow[0]!.t - t0) / ((t1 - t0) || 1)
      if (gapFrac > 0.1) {
        // intervalo comum: corta o início da tese e re-rebase no corte
        const k = Math.round(gapFrac * (tese.length - 1))
        const cut = tese.slice(k)
        const baseV = cut[0]
        if (cut.length >= 2 && baseV) {
          tese = cut.map((v) => (v / baseV) * 100)
          windowStart = new Date(t0 + (k / (perf.series.length - 1)) * (t1 - t0))
        }
      }
      if (windowStart) {
        const w0 = windowStart.getTime()
        const base = interpAt(inWindow, w0)
        if (base) {
          benchmark = tese.map((_, i) => {
            const t = w0 + (i / (tese.length - 1)) * (t1 - w0)
            const v = interpAt(inWindow, t)
            return v != null ? (v / base) * 100 : 100
          })
        }
      }
    }
  }

  const tesePct = tese.map((v) => v - 100)
  const benchPct = benchmark ? benchmark.map((v) => v - 100) : null

  // Labels do tooltip: interpolação uniforme na janela → só 'mmm aaaa'
  // (dia exato seria inventado — a série real não tem datas).
  let labels: string[] = []
  if (windowStart) {
    const w0 = windowStart.getTime()
    const t1 = now.getTime()
    labels = tesePct.map((_, i) => {
      const dt = new Date(w0 + (i / (tesePct.length - 1)) * (t1 - w0))
      return `${MONTHS_PT[dt.getMonth()]} ${dt.getFullYear()}`
    })
  }

  const lastT = tesePct[tesePct.length - 1]!
  const stats: AcaoStatRow[] = [
    { l: 'Desde o lançamento', v: pct1(lastT), ...(lastT >= 0 ? { accent: 'green' as const } : {}) },
  ]
  if (benchPct) stats.push({ l: 'IBOV no período', v: pct1(benchPct[benchPct.length - 1]!) })
  const cur = conv?.current ?? d.conviction
  if (cur != null) stats.push({ l: 'Convicção', v: `${cur}/100` })
  stats.push({ l: 'Ativos', v: String(d.companiesCount) })
  if (perf.startLabel) stats.push({ l: 'Lançada em', v: perf.startLabel })
  if (d.sourcesCount != null) stats.push({ l: 'Fontes acumuladas', v: nf0.format(d.sourcesCount) })

  const chart: TeseChartVM = { series: tesePct, benchmark: benchPct, labels, pillValue: pct1(lastT) }
  return { stats, chart }
}

/* ————— avaliação por ativo ————— */

/** pares bg/fg dos tiles (cores do design, ciclo determinístico por índice). */
const TILE_PAIRS: [string, string][] = [
  ['var(--nu-tile-amber-bg)', 'var(--nu-tile-amber-fg)'],
  ['var(--nu-tile-blue-bg)', 'var(--nu-blue-deep)'],
  ['var(--nu-tile-red-bg)', 'var(--nu-red-2)'],
  ['var(--nu-tile-green-bg)', 'var(--nu-green-2)'],
  ['var(--nu-tile-orange-bg)', 'var(--nu-tile-orange-fg)'],
]

/**
 * decision/status real → badge do design. 'Mantém'=verde, 'Acompanhar'=azul,
 * 'Entra…'=azul sólido + border no card; runtime real tem ainda 'Em risco'
 * (→ vermelho) e 'Núcleo' (composição, não veredito → verde 'Mantém'-like).
 */
function evalBadge(decision: string, isToday: boolean): { text: string; variant: TeseEvalBadgeVariant; highlight: boolean } {
  const norm = decision.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (norm.startsWith('mantem') || norm.startsWith('nucleo')) return { text: decision, variant: 'green', highlight: false }
  if (norm.startsWith('acompanhar')) return { text: decision, variant: 'blue', highlight: false }
  if (norm.startsWith('entra')) return { text: isToday ? 'Entra hoje' : decision, variant: 'blue-solid', highlight: true }
  if (norm.startsWith('em risco') || norm.startsWith('sai') || norm.startsWith('reduz')) return { text: decision, variant: 'red', highlight: false }
  return { text: decision, variant: 'neutral', highlight: false }
}

function buildEval(d: ThesisFullApi): TeseEvalVM | null {
  const latest = d.studies?.[0] ?? null
  const isToday = latest?.date === localISODate()

  let cards: TeseEvalCardVM[] = []
  if (latest?.assets?.length) {
    cards = latest.assets.map((a, i) => {
      const badge = evalBadge(a.decision, isToday)
      const [tileBg, tileFg] = TILE_PAIRS[i % TILE_PAIRS.length]!
      return {
        ticker: a.ticker,
        name: a.name,
        letter: a.ticker.charAt(0) || '?',
        tileBg,
        tileFg,
        badgeText: badge.text,
        badgeVariant: badge.variant,
        highlight: badge.highlight,
        txt: a.assessment,
        pq: a.why,
      }
    })
  } else if (d.companies?.length) {
    // Fallback: revalidação sem assets → composição atual do detail
    // (status vira o badge; rationale/catalyst viram avaliação/por quê).
    cards = d.companies.map((c, i) => {
      const badge = evalBadge(c.status ?? '', false)
      const [tileBg, tileFg] = TILE_PAIRS[i % TILE_PAIRS.length]!
      return {
        ticker: c.ticker,
        name: c.name,
        letter: c.ticker.charAt(0) || '?',
        tileBg,
        tileFg,
        badgeText: badge.text || 'Acompanhar',
        badgeVariant: badge.text ? badge.variant : 'blue',
        highlight: badge.highlight,
        txt: c.rationale ?? '',
        pq: c.catalyst ?? c.role ?? '',
      }
    })
  }
  if (!cards.length) return null

  const metaLine = latest?.date
    ? isToday
      ? `Da revalidação de hoje · ${dayMonthYear(latest.date)}`
      : `Da revalidação de ${dayMonthYear(latest.date)}`
    : 'Composição atual da tese'
  return { metaLine, cards }
}

/* ————— drivers (o que sustenta / ameaça) ————— */

function buildDrivers(d: ThesisFullApi): TeseDriversVM | null {
  const verdicts = d.verdicts ?? []
  if (!verdicts.length) return null
  // No runtime real cada kind tem 1 verdict com title+body — vira 1 bullet
  // "title: body" (o mock do design tinha 4 bullets soltos no favor).
  const bullet = (v: { title: string; body: string }) => `${v.title.replace(/[.:]$/, '')}: ${v.body}`
  const favor = verdicts.filter((v) => v.kind === 'favor').map(bullet)
  const sinal = verdicts.filter((v) => v.kind === 'sinal').map(bullet)
  const riscoV = verdicts.find((v) => v.kind === 'risco') ?? null
  const risco = riscoV ? { title: riscoV.title, body: riscoV.body } : null
  if (!favor.length && !sinal.length && !risco) return null
  return { favor, sinal, risco }
}

/* ————— diário da tese ————— */

const DECISION_VARIANTS: [RegExp, TeseDecisionVariant][] = [
  [/^convic/, 'green'],
  [/^composi/, 'blue'],
  [/^macro/, 'neutral'],
  [/^risc/, 'red'],
]

function decisionVariant(label: string): TeseDecisionVariant {
  const norm = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  for (const [re, v] of DECISION_VARIANTS) {
    if (re.test(norm)) return v
  }
  return 'neutral'
}

function buildDiary(d: ThesisFullApi, conv: ConvictionHistoryApi | null): TeseDiaryVM | null {
  const studies = d.studies ?? []
  if (!studies.length) return null
  const today = localISODate()

  // convicção por data: série diária do conviction-history + o valor atual
  // pra hoje (a série termina ontem). Estudo fora da janela → pill omitida.
  const entries: [string, number][] = (conv?.series ?? []).map((p) => [p.date, p.conviction])
  if (conv?.current != null) entries.push([today, conv.current])
  entries.sort((a, b) => a[0].localeCompare(b[0]))
  const convFor = (date: string): TeseConvBadgeVM | null => {
    let cur: number | null = null
    let prev: number | null = null
    for (const [dt, v] of entries) {
      if (dt === date) { cur = v; break }
      if (dt > date) break
      prev = v
    }
    if (cur == null) return null
    const changed = prev != null && prev !== cur
    return { from: changed ? String(prev) : null, to: String(cur), changed }
  }

  const vms: TeseStudyVM[] = studies.map((s) => {
    const isToday = s.date === today
    return {
      id: s.id,
      dateBadge: isToday ? `Hoje · ${dayMonthYear(s.date)}` : dayMonthYear(s.date),
      isToday,
      conv: convFor(s.date),
      title: s.title,
      summary: s.summary,
      decisions: (s.decisions ?? []).map((dec) => ({
        tag: dec.label,
        variant: decisionVariant(dec.label),
        txt: dec.detail,
      })),
      sources: (s.sources ?? [])
        .filter((f) => !!f.title)
        .map((f) => ({ title: f.title, url: f.url, meta: [f.type, f.publisher].filter(Boolean).join(' · ') })),
      rowDate: rowDateFmt(s.date),
    }
  })

  // 3 linhas de estudos anteriores visíveis; o botão revela o resto.
  const hidden = vms.length - 1 - 3
  return {
    metaLine: 'Revalidação automática da IA, todos os dias',
    studies: vms,
    moreLabel: hidden > 0 ? `Ver os ${hidden} estudos anteriores` : null,
  }
}

/* ————— relatório completo (JSONB `report`, nullable) ————— */

/** fontes do report → VM (label obrigatória; url vazia vira null → <span>). */
function reportSources(list: ThesisReportSourceApi[] | null | undefined): TeseReportSourceVM[] {
  return (list ?? [])
    .filter((s) => !!s?.label?.trim())
    .map((s) => ({ label: s.label.trim(), url: s.url?.trim() || null }))
}

/** parágrafos/bullets do report → HTML seguro (MESMO tratamento do editorial). */
function reportHtml(list: string[] | null | undefined): string[] {
  return (list ?? []).filter((p) => !!p?.trim()).map(markHtml)
}

/**
 * report JSONB → VM da seção "O relatório completo". Toda subseção é opcional
 * (JSONB curado à mão): ausente → não renderiza, e o TOC de âncoras lista só
 * o que existe. Prosa e bullets passam pelo markHtml do editorial ({mark} →
 * .tse-hi, escape ANTES); campos atômicos (headings, premissas, fairValue)
 * são texto puro — stripMarks garante que "{mark}" nunca vaza literal.
 */
function buildReport(d: ThesisFullApi): TeseReportVM | null {
  const r = d.report
  if (!r) return null

  const opportunityHtml = reportHtml(r.opportunity?.paragraphs)
  const thesisHtml = reportHtml(r.thesis)
  const risksHtml = reportHtml(r.risks)
  const conclusionHtml = reportHtml(r.conclusion?.paragraphs)
  const milestones = (r.conclusion?.milestones ?? [])
    .map((m) => stripMarks(m ?? ''))
    .filter(Boolean)

  const parts: TeseReportPartVM[] = (r.parts ?? [])
    .filter((p) => !!p?.heading?.trim() && (p.paragraphs ?? []).some((x) => !!x?.trim()))
    .map((p, i) => ({
      id: `rel-parte-${i + 1}`,
      heading: stripMarks(p.heading),
      paragraphsHtml: reportHtml(p.paragraphs),
      sources: reportSources(p.sources),
    }))

  const v = r.valuation
  const assumptions = (v?.assumptions ?? [])
    .filter((a) => !!a?.label?.trim() && !!a?.value?.trim())
    .map((a) => ({ label: stripMarks(a.label), value: stripMarks(a.value), note: a.note?.trim() ? stripMarks(a.note) : null }))
  const mathHtml = reportHtml(v?.math)
  const valuation = v && (v.intro?.trim() || assumptions.length || mathHtml.length || v.fairValue?.trim())
    ? {
        introHtml: v.intro?.trim() ? markHtml(v.intro) : null,
        assumptions,
        mathHtml,
        fairValue: v.fairValue?.trim() ? stripMarks(v.fairValue) : null,
        vsPrice: v.vsPrice?.trim() ? stripMarks(v.vsPrice) : null,
      }
    : null

  const sources = reportSources(r.sources)

  // report presente mas vazio (JSONB rascunho) → seção não existe. Honesto.
  if (!opportunityHtml.length && !thesisHtml.length && !risksHtml.length
    && !parts.length && !valuation && !conclusionHtml.length) return null

  const metaParts: string[] = []
  if (r.readMinutes != null && r.readMinutes > 0) metaParts.push(`Leitura de ${nf0.format(r.readMinutes)} min`)
  if (r.publishedAt) metaParts.push(`Publicado em ${dayMonthYear(r.publishedAt)}`)

  const toc: TeseReportTocItemVM[] = []
  if (opportunityHtml.length) toc.push({ id: 'rel-oportunidade', label: 'A oportunidade' })
  if (thesisHtml.length) toc.push({ id: 'rel-tese', label: 'A tese em pilares' })
  if (risksHtml.length) toc.push({ id: 'rel-riscos', label: 'Os riscos' })
  for (const p of parts) toc.push({ id: p.id, label: p.heading.replace(/[.]$/, '') })
  if (valuation) toc.push({ id: 'rel-valuation', label: 'Valuation' })
  if (conclusionHtml.length || milestones.length) toc.push({ id: 'rel-conclusao', label: 'Conclusão' })
  if (sources.length) toc.push({ id: 'rel-fontes', label: 'Fontes' })

  return {
    metaLine: metaParts.length ? metaParts.join(' · ') : null,
    toc,
    opportunityHtml,
    thesisHtml,
    risksHtml,
    parts,
    valuation,
    conclusionHtml,
    milestones,
    sources,
  }
}

/** contagem de palavras do report (Article.wordCount do JSON-LD). */
function reportWordCount(r: ThesisReportApi | null | undefined): number | null {
  if (!r) return null
  const texts: string[] = [
    ...(r.opportunity?.paragraphs ?? []),
    ...(r.thesis ?? []),
    ...(r.risks ?? []),
    ...(r.parts ?? []).flatMap((p) => [p?.heading ?? '', ...(p?.paragraphs ?? [])]),
    r.valuation?.intro ?? '',
    ...(r.valuation?.math ?? []),
    ...(r.conclusion?.paragraphs ?? []),
    ...(r.conclusion?.milestones ?? []),
  ]
  const n = texts.reduce((acc, t) => acc + (stripMarks(t ?? '').match(/\S+/g)?.length ?? 0), 0)
  return n > 0 ? n : null
}

/* ————— SEO ————— */

function buildSeo(d: ThesisFullApi): TesePayload['seo'] {
  const statement = stripMarks(d.statementHtml ?? '')
  let description = d.description ?? ''
  if (statement) {
    const room = 158 - description.length - 1
    if (room > 40) {
      const cut = statement.length > room ? `${statement.slice(0, room - 1).replace(/\s+\S*$/, '')}…` : statement
      description = `${description} ${cut}`
    }
  }
  const studies = d.studies ?? []
  const oldest = studies[studies.length - 1]?.date ?? null
  const latest = studies[0]?.date ?? null
  const launch = parseMonthLabel(d.publishedLabel, d.publishedYear)
  return {
    title: `Tese ${d.title}: análise, ativos e convicção da IA`,
    description,
    image: teseCover(d.image),
    // publishedAt do report (quando existe) é a data editorial real do
    // artigo — mais fiel que o estudo mais antigo da revalidação.
    datePublished: d.report?.publishedAt ?? oldest ?? (launch ? localISODate(launch) : null),
    dateModified: latest,
    wordCount: reportWordCount(d.report),
  }
}

/* ————— seed do design (reindustrializacao-eua) — só pra backend 100% offline ————— */

export const TESE_SEED_SLUG = 'reindustrializacao-eua'

/** Mesma geração do <script text/x-dc> do design: keyframes + mulberry32. */
function seedSeries(kf: [number, number][], jit: number, seed: number, n = 130): number[] {
  let s = seed
  const rng = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const interp = (f: number) => {
    for (let i = 1; i < kf.length; i++) {
      const a = kf[i - 1]!, b = kf[i]!
      if (f <= b[0]) return a[1] + (b[1] - a[1]) * ((f - a[0]) / ((b[0] - a[0]) || 1))
    }
    return kf[kf.length - 1]![1]
  }
  const out: number[] = []
  for (let i = 0; i < n; i++) out.push(interp(i / (n - 1)) + (rng() - 0.5) * jit)
  out[0] = kf[0]![1]
  out[n - 1] = kf[kf.length - 1]![1]
  return out
}

function teseSeed(): TesePayload {
  const N = 130
  const serieT = seedSeries(
    [[0, 0], [0.1, 3.2], [0.2, 7.5], [0.3, 5.1], [0.42, 12.4], [0.55, 17.2], [0.65, 14.8], [0.75, 22.5], [0.85, 27.1], [0.93, 31.4], [1, 34.0]],
    1.4, 20260711, N,
  )
  const serieI = seedSeries(
    [[0, 0], [0.15, 2.1], [0.3, 4.8], [0.5, 5.9], [0.7, 8.6], [0.85, 10.2], [1, 9.4]],
    0.7, 20260209, N,
  )
  const t0 = Date.UTC(2026, 1, 9)
  const t1 = Date.UTC(2026, 6, 11)
  const labels = serieT.map((_, i) => {
    const dt = new Date(t0 + ((t1 - t0) * i) / (N - 1))
    return `${dt.getUTCDate()} ${MONTHS_PT[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
  })

  const tile = (i: number) => TILE_PAIRS[i]!
  const evalCard = (
    t: string, nm: string, badge: string, txt: string, pq: string, pair: [string, string], variant: TeseEvalBadgeVariant, highlight = false,
  ): TeseEvalCardVM => ({
    ticker: t, name: nm, letter: t.charAt(0), tileBg: pair[0], tileFg: pair[1],
    badgeText: badge, badgeVariant: variant, highlight, txt, pq,
  })

  return {
    slug: TESE_SEED_SLUG,
    title: 'A fábrica volta para casa',
    hero: {
      cat: 'Reindustrialização',
      titlePre: 'A fábrica ',
      titleHi: 'volta',
      titlePost: ' para casa.',
      subtitle: 'Os EUA decidiram fabricar de novo, e quem vende as picaretas ganha primeiro.',
      image: '/teses/reindustrializacao-eua.webp',
      convBadge: 'Convicção 88/100 · +1 hoje',
      sinceBadge: '+34% desde o lançamento',
      ativosBadge: '7 ativos',
      revalBadge: 'Revalidada hoje · 11 jul',
    },
    editorial: {
      heading: 'Quem vende as picaretas.',
      paragraphsHtml: [
        'Depois de trinta anos terceirizando a produção para a Ásia, os Estados Unidos resolveram construir fábrica em casa de novo. Mas <span class="tse-hi">o dinheiro de verdade não está em quem monta a fábrica: está em quem vende o que faz a fábrica funcionar.</span>',
        'Empresas já anunciaram mais de <strong>US$ 1,4 trilhão</strong> em novas plantas americanas, puxadas por semicondutores e farmacêuticos. Cada uma precisa de energia, automação e máquina pesada antes de produzir o primeiro parafuso.',
        'E essa remontagem de cadeia tem uma perna brasileira: o reshoring que ergue a fábrica nos EUA é o outro lado do nearshoring que redesenha as rotas em <a href="/tese/a-nova-geografia-do-frete">A nova geografia do frete</a>, onde o Brasil herda a comida, o minério e o frete que alimentam os dois lados.',
        'Há ainda o eixo do silício: as fábricas de chip que essa tese traz de volta (AMD, Texas Instruments) existem para abastecer a demanda que nasce nos data centers de IA (<a href="/tese/imovel-mais-disputado-data-center">O imóvel mais disputado do mundo</a>). São os dois extremos da mesma cadeia: aqui se remonta a fábrica, lá se consome o chip.',
      ],
    },
    numbers: {
      stats: [
        { l: 'Desde o lançamento', v: '+34,0%', accent: 'green' },
        { l: 'IBOV no período', v: '+9,4%' },
        { l: 'Convicção', v: '88/100' },
        { l: 'Ativos', v: '7' },
        { l: 'Lançada em', v: '9 fev 2026' },
        { l: 'Fontes acumuladas', v: '246' },
      ],
      chart: { series: serieT, benchmark: serieI, labels, pillValue: '+34,0%' },
    },
    evalSection: {
      metaLine: 'Da revalidação de hoje · 11 jul 2026',
      cards: [
        evalCard('CATP34', 'Caterpillar', 'Mantém', 'Backlog recorde de US$ 63 bi e Power Gen +41%, com quatro pedidos de 1 GW ou mais e capacidade triplicada.', 'Núcleo com catalisador progredindo, vendida até 2027-2028.', tile(0), 'green'),
        evalCard('E1TN34', 'Eaton', 'Mantém', 'Pedidos de data center +240% e receita do segmento +50%; margem de 25,6% no 1T abaixo do esperado, guia exit acima de 30% no 2S26.', 'Gatilho de margem pendente mas no prazo, guidance elevado para 10%.', tile(1), 'green'),
        evalCard('TEXA34', 'Texas Instruments', 'Acompanhar', 'Ciclo analógico virando, SM1 rampando com CHIPS Act, mira US$ 8+ de FCF por ação.', 'Perna de caixa da tese, recuperação ainda em curso.', tile(2), 'blue'),
        evalCard('DEEC34', 'Deere', 'Acompanhar', '2T26 bate, pedidos de Construção +50%, fundo do agro reafirmado.', 'Catalisador de fundo cumprido, retomada de máquinas grandes ainda por vir.', tile(3), 'blue'),
        evalCard('A1MD34', 'AMD', 'Acompanhar', 'MI450 em amostragem, 1 GW da OpenAI no 2S26, demanda lead superando planos.', 'Lastro plurianual sólido: a execução do primeiro deployment é o teste.', tile(2), 'blue'),
        evalCard('GGBR4', 'Gerdau', 'Mantém', 'Produção americana +12,3% em 2025, tarifa de aço a 50% favorece a operação NA, BTG eleva para compra em 6/jul.', 'Âncora BR com tailwind de tarifa e Selic; contrapeso da tarifa de 25% sobre o Brasil.', tile(1), 'green'),
        evalCard('TUPY3', 'Tupy', 'Entra hoje', 'XP eleva para compra em 10/jul citando a recuperação de caminhões pesados nos EUA; fundição exposta à cadeia industrial americana.', 'Segunda perna brasileira da tese: entra em observação a R$ 14,34.', tile(4), 'blue-solid', true),
      ],
    },
    studiesCount: 152,
    drivers: {
      favor: [
        'Backlog recorde de US$ 63 bi na Caterpillar, com pedidos de 1 GW e capacidade triplicada',
        'Tarifa do aço a 50% nos EUA reforça a Gerdau North America',
        'Selic em queda: IPCA de junho a 0,16% reforça o ciclo de cortes',
        'Fundo do agro confirmado pela Deere: pedidos de construção +50%',
      ],
      sinal: [
        'Margem da Eaton a 25,6% no 1T, abaixo do esperado. Gatilho do 2S26 ainda pendente',
        'Retomada de máquinas grandes da Deere ainda por vir: catalisador cumprido só no fundo',
        'Execução do primeiro deployment de 1 GW da AMD é o teste do eixo do silício',
      ],
      risco: {
        title: 'Tarifa Section 301 de 25% sobre o Brasil',
        body: 'Pesa diretamente sobre a Gerdau e é o contrapeso da convicção. Mitigada por possíveis exclusões de aço e equipamento já protegidos sob a Section 232. Audiência acompanhada dia a dia pela IA.',
      },
    },
    diary: {
      metaLine: 'Revalidação automática da IA, todos os dias',
      studies: [
        {
          id: 'seed-hoje',
          dateBadge: 'Hoje · 11 jul 2026',
          isToday: true,
          conv: { from: '87', to: '88', changed: true },
          title: 'Reindustrialização segue confirmando: backlog, aço a 50% e Selic em queda.',
          summary: 'Os catalisadores caminham na direção certa: Caterpillar com backlog recorde e pedidos de 1 GW, Deere confirmando o fundo do agro, e a tarifa de aço a 50% nos EUA reforçando a Gerdau North America. A Selic em queda entra como combustível da reindustrialização, e o upgrade da Tupy pela XP adiciona uma segunda perna brasileira. A convicção sobe modestamente, com a tarifa de 25% sobre o Brasil como contrapeso.',
          decisions: [
            { tag: 'Convicção', variant: 'green', txt: '87 → 88, alta modesta com histerese: catalisadores confirmando (CAT, Deere, tarifa do aço, Selic) contra o overhang da tarifa de 25% sobre o Brasil.' },
            { tag: 'Composição', variant: 'blue', txt: 'Entra TUPY3 como segunda perna brasileira (Acompanhar), ao lado de GGBR4. Nenhuma empresa sai.' },
            { tag: 'Macro', variant: 'neutral', txt: 'IPCA de junho a 0,16% e 4,64% em 12 meses reforça o corte da Selic, citado pela imprensa como combustível direto da reindustrialização.' },
            { tag: 'Risco', variant: 'red', txt: 'Tarifa Section 301 de 25% sobre o Brasil (audiência em 6/jul) pesa sobre a Gerdau, mitigada por possíveis exclusões de aço e equipamento já sob a Section 232.' },
          ],
          sources: [
            { title: 'Citi corta preços-alvo de CSN e CSN Mineração à espera de 2T26 misto', url: null, meta: 'Notícia · Money Times' },
            { title: 'Ibovespa entra no modo Bolt e dispara após IPCA surpreender', url: null, meta: 'Notícia · Seu Dinheiro' },
            { title: 'Tupy (TUPY3): XP vê ciclo de recuperação ganhar força e eleva para compra', url: null, meta: 'Notícia · Money Times' },
            { title: 'Caterpillar to triple power generation capacity, raises 2030 targets', url: null, meta: 'Relatório · Manufacturing Dive' },
            { title: 'Eaton Reports Record First Quarter 2026 Results, Raises Guidance to 10%', url: null, meta: 'Documento · Eaton' },
            { title: 'AMD & OpenAI to Deploy 6GW of Instinct GPUs, With 1GW of MI450 in 2H 2026', url: null, meta: 'Notícia · WCCFTech' },
            { title: 'Gerdau reshapes North American footprint as tariffs squeeze imports', url: null, meta: 'Relatório · Steel Market Update' },
          ],
          rowDate: '11 jul',
        },
        { id: 'seed-1', dateBadge: '10 jul 2026', isToday: false, conv: { from: null, to: '87', changed: false }, title: 'Tupy entra no radar: XP vê ciclo de caminhões pesados virando', summary: '', decisions: [], sources: [], rowDate: '10 jul' },
        { id: 'seed-2', dateBadge: '9 jul 2026', isToday: false, conv: { from: null, to: '87', changed: false }, title: 'Margem da Eaton testa o gatilho do 2S26; guidance segura a tese', summary: '', decisions: [], sources: [], rowDate: '09 jul' },
        { id: 'seed-3', dateBadge: '8 jul 2026', isToday: false, conv: { from: '86', to: '87', changed: true }, title: 'Deere bate o 2T26 e confirma o fundo do agro', summary: '', decisions: [], sources: [], rowDate: '08 jul' },
      ],
      moreLabel: 'Ver os 152 estudos anteriores',
    },
    // O seed do design NÃO tem report — a tese exemplar renderiza sem a
    // seção, exatamente como hoje (zero regressão offline).
    report: null,
    seo: {
      title: 'Tese A fábrica volta para casa: análise, ativos e convicção da IA',
      description: 'Os EUA decidiram fabricar de novo, e quem vende as picaretas ganha primeiro. Convicção 88/100, +34% desde o lançamento, 7 ativos revalidados diariamente pela IA.',
      image: '/teses/reindustrializacao-eua.webp',
      datePublished: '2026-02-09',
      dateModified: '2026-07-11',
      wordCount: null,
    },
  }
}

/* ————— carga SSR ————— */

function statusOf(e: unknown): number | null {
  const err = e as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return err?.statusCode ?? err?.status ?? err?.response?.status ?? null
}

async function loadTese(base: string, slug: string): Promise<TesePayload> {
  let detail: ThesisFullApi
  try {
    detail = (await teseFetchDetail(base, slug)).data
  } catch (e) {
    const status = statusOf(e)
    if (status === 404) {
      throw createError({ statusCode: 404, statusMessage: 'Tese não encontrada' })
    }
    // Backend fora do ar: só a tese exemplar do design degrada pro seed
    // completo; qualquer outro slug responde 503 (temporário, não 404 —
    // mesma política do PR2: um 404 transitório envenenaria o índice).
    if (slug === TESE_SEED_SLUG) return teseSeed()
    throw createError({ statusCode: 503, statusMessage: 'Dados temporariamente indisponíveis' })
  }

  // O mode do IBOV é derivado do lançamento do detail (evita serializar os
  // fetches atrás do performance — o startLabel confirma a mesma janela).
  const launchHint = parseMonthLabel(detail.publishedLabel, detail.publishedYear)
  const [perfR, convR, ibovR] = await Promise.allSettled([
    teseFetchPerformance(base, slug),
    teseFetchConviction(base, slug),
    acaoFetchIbovPrices(base, ibovModeFor(launchHint)),
  ])
  const ok = <X>(r: PromiseSettledResult<X>): X | null => (r.status === 'fulfilled' ? r.value : null)

  const perf = ok(perfR)?.data ?? null
  const conv = ok(convR)?.data ?? null
  const ibov = ok(ibovR)?.data ?? null
  const latestStudy = detail.studies?.[0] ?? null

  // Degradação POR SEÇÃO de verdade (política documentada no topo do arquivo):
  // cada builder roda num guard. Antes, um throw em QUALQUER builder (ex.: um
  // perf/conv/ibov que degradou pra null num blip Vercel↔VPS, ou um campo nulo
  // inesperado do backend) rejeitava o loadTese inteiro → useAsyncData error →
  // a página 503ava (intermitente). Agora a seção problemática vira null (o
  // template já a esconde com v-if) e o resto da tese renderiza normal.
  const safe = <T>(fn: () => T, fallback: T, tag: string): T => {
    try {
      return fn()
    } catch (e) {
      console.error(`[tese:${slug}] build ${tag} falhou (seção degradada):`, e)
      return fallback
    }
  }

  // Hero é obrigatório (SEO/título): se crashar, um hero mínimo do detail em
  // vez de derrubar a página.
  const heroFallback: TeseHeroVM = {
    cat: detail.sector ?? '',
    titlePre: (detail.title ?? '').trim() || 'Tese',
    titleHi: '', titlePost: '',
    subtitle: detail.description ?? '',
    image: teseCover(detail.image),
    convBadge: null, sinceBadge: null,
    ativosBadge: `${detail.companiesCount ?? 0} ativos`,
    revalBadge: null,
  }

  return {
    slug,
    title: detail.title,
    hero: safe(() => buildHero(detail, perf, conv, latestStudy), heroFallback, 'hero'),
    editorial: safe(() => buildEditorial(detail), null, 'editorial'),
    numbers: safe(() => buildNumbers(detail, perf, conv, ibov), null, 'numbers'),
    evalSection: safe(() => buildEval(detail), null, 'eval'),
    studiesCount: detail.studiesCount ?? 0,
    drivers: safe(() => buildDrivers(detail), null, 'drivers'),
    diary: safe(() => buildDiary(detail, conv), null, 'diary'),
    report: safe(() => buildReport(detail), null, 'report'),
    seo: buildSeo(detail),
  }
}

/* ————— composable ————— */

export async function useTese(slug: string) {
  const config = useRuntimeConfig()
  // Server: URL direta do Laravel (sem loopback no próprio Nitro).
  // Client: proxy same-origin /api/backend (zero CORS).
  const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
  const clientBase = '/api/backend'

  const { data, error } = await useAsyncData<TesePayload>(
    `tese:${slug}`,
    () => loadTese(import.meta.server ? serverBase : clientBase, slug),
  )

  return { data, error }
}
