<script setup lang="ts">
// ============================================================================
// PROTÓTIPO /simulacao — Redentia Simulação (avaliação de UX/UI do dono).
//
// O resultado vem do MOTOR (POST /simulations/run); simMock.ts sobrou como
// fallback ilustrativo quando o motor não responde. O plano real (aprovado 24/08) troca as peças:
// motor → Laravel ScenarioEngineService (MC mensal índice+beta) · biblioteca → tabela
// simulation_scenarios + rotina semanal · auth gate (padrão carteira.vue).
//
// EXCEÇÃO DE MOVIMENTO SANCIONADA PELO DONO: esta rota usa GSAP (lazy,
// só aqui) e quebra a política "entrada única" do DS §9 — morph entre
// séries, contadores e stagger fazem parte do produto desta tela.
// ============================================================================
import {
  runMockSimulation, buildClientSummary, buildCorrelation, buildSeeThrough,
  fmtBRL, fmtBRLFull, shocksTitle,
  shocksFromDials, DIAL_DEFAULTS, HORIZON_MONTHS,
  type SimResult, type SimSeries, type SimPortfolioInput, type SimShocks, type SimDials,
  type SimScheduledScenario, type SimMacroKey, type SimCorrelationOut, type SimSeeThroughItem,
} from '~/components/sim/simMock'
import { adaptResult } from '~/components/sim/simAdapter'

definePageMeta({
  layout: 'default',
  // AUTH OBRIGATÓRIA (diretriz do dono: /simulacao é só pra logado). Mesmo
  // padrão inline de carteira.vue:21-24 — anônimo vai pro /login preservando
  // o destino. Até 27/08 a rota estava só com noindex e era publicamente
  // acessível, o que não sustenta uma tela que gera peça pra cliente.
  middleware: [
    (to) => {
      const token = useCookie<string | null>('nu:token')
      if (token.value) return
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    },
  ],
})
usePageSeo({
  title: 'Simulação — o futuro da sua carteira',
  description: 'Simule cenários de 10 anos na sua carteira. Protótipo.',
  path: '/simulacao',
  noindex: true,
})

// WIZARD (dono, 25/08): carteira → choque → simulando → resultado, com o orb
// persistente mudando de posição e o fundo cream→navy na transição — a cena
// "Simulando" da referência é a fase film (orb central grande com a palavra).
// A tela abre no BUILDER e segue assets → shock → film → result.
type Phase = 'assets' | 'shock' | 'film' | 'result'
const phase = ref<Phase>('assets')
// a carteira MONTADA (pivô 24/08: concreto > texto abstrato)
// ——— MACRO REAL (F3): os dials abrem no valor de HOJE, do BCB, em vez do
// MACRO_NOW fixo do mock. Falhou o fetch → fica o default e a tela abre igual;
// o que não pode é o dial dizer "hoje" mostrando cotação de semanas atrás. ———
const { macro, load: loadMacro } = useMacroNow()
onMounted(async () => {
  const m = await loadMacro()
  if (!m) return
  if (typeof m.dolar === 'number') dials.value.dolar = Math.round(m.dolar * 100) / 100
  if (typeof m.selic === 'number') dials.value.selic = m.selic
})

const portfolio = ref<SimPortfolioInput[]>([])
// os DIALS do assessor (v3: sliders que começam em hoje) → choques derivados
const dials = ref<SimDials>({ ...DIAL_DEFAULTS })
const shocks = computed<SimShocks>(() => shocksFromDials(dials.value))
const result = ref<SimResult | null>(null)
// 422 do motor (ticker fora do universo, choque fora da faixa): a MENSAGEM
// volta pro construtor — cair no mock esconderia exatamente o que a pessoa
// precisa corrigir, com um resultado de mentira por cima.
const runError = ref<string | null>(null)
const drawing = ref(false)
const blocksIn = ref(false)
const cursor = ref<number | null>(null)

// séries EXIBIDAS (alvo do morph — o GSAP tweena estes arrays e os computed
// do SimFanChart recomputam o `d`)
const display = reactive<SimSeries>({ dates: [], p10: [], p50: [], p90: [], sample: [], baseline: [] })

const portfolioTotal = computed(() => portfolio.value.reduce((s, p) => s + p.value, 0))
const canRun = computed(() => portfolio.value.length > 0 && portfolioTotal.value > 0)
const hasShocks = computed(() => Object.keys(shocks.value).length > 0)
const filmSteps = computed(() => {
  const n = portfolio.value.length
  return [
    `Lendo sua carteira: ${n} ${n === 1 ? 'posição' : 'posições'}, ${fmtBRL(portfolioTotal.value)}`,
    'Calibrando o beta contra 5 anos de IBOV',
    'Rodando 2.000 caminhos, mês a mês, por 10 anos',
    fullSchedule.value.length > 1
      ? `Aplicando ${fullSchedule.value.length} cenários pela década`
      : fullSchedule.value.length === 1
        ? `Aplicando o cenário de ${fullSchedule.value[0]!.year}: ${shocksTitle(fullSchedule.value[0]!.shocks).toLowerCase()}`
        : 'Cenário base: compondo o caminho',
  ]
})
// CONSEQUÊNCIA AO VIVO no passo 2 (motor é puro e barato — roda por ajuste)
const liveResult = computed(() =>
  phase.value === 'shock' && canRun.value ? runMockSimulation(shocks.value, portfolio.value) : null,
)
const liveTotal = computed(() => {
  const r = liveResult.value
  if (!r) return 0
  return Math.round(r.positions.reduce((s2, p2) => s2 + p2.weight * p2.shockPct, 0) * 10) / 10
})
// o orb SENTE o choque (vermelho machuca, verde ajuda)
const orbMood = computed(() => (phase.value === 'shock' ? Math.max(-1, Math.min(1, liveTotal.value / 22)) : 0))

// ——— A DÉCADA (dono 25/08, v2: "selecionar quando acontece CADA COISA
// separadamente") — cada variável tem o próprio ano no dial-card; a agenda
// de cenários é DERIVADA agrupando as variáveis ativas por ano. ———
const dialYears = ref<Record<keyof SimDials, number>>({ dolar: 2027, selic: 2027, bolsa: 2027, petroleo: 2027 })
const fullSchedule = computed<SimScheduledScenario[]>(() => {
  const s = shocks.value
  const byYear = new Map<number, SimShocks>()
  for (const k of Object.keys(s) as (keyof SimDials)[]) {
    const y = dialYears.value[k]
    if (!byYear.has(y)) byYear.set(y, {})
    ;(byYear.get(y) as Record<string, number>)[k] = s[k]!
  }
  return [...byYear.entries()].map(([year, sh]) => ({ year, shocks: sh })).sort((a, b) => a.year - b.year)
})
// a agenda usada na última simulação (o what-if roda a MESMA)
const lastSchedule = ref<SimScheduledScenario[]>([])

// ——— TRAJETÓRIAS MACRO sobrepostas no fan chart (dono 25/08: "tem que
// sobrepor no mesmo gráfico") — checks na legenda, pré-marcados nos
// indicadores tocados na etapa 2. IBOV em creme (a mediana é o cobalto que lê sobre carvão).
//
// AS LINHAS VÊM DO MOTOR (28/08), no MESMO run que aplica o choque nas
// posições. Antes o `buildMacroPaths` do mock as projetava aqui, com dinâmica
// e correlação inventadas, usando o ANO DE CADA DIAL — enquanto o motor recebe
// um `shock_month` único. Dava pra desenhar o dólar chegando a R$ 6,30 em 2031
// com a carteira chocada em 2027: o gráfico e o cálculo contando histórias
// diferentes, com cara de precisão.
//
// A LINHA DE PETRÓLEO SAIU. Não existe série de preço ligada no monorepo, e o
// que não tem fonte não se desenha. O dial de petróleo fica: ele alimenta
// fatores reais em `ticker_factor_tags`.
//
// No fallback de mock (motor fora do ar) não há linha nenhuma — mesma regra do
// what-if: melhor não oferecer do que oferecer uma falsa. ———
const MACRO_COLOR: Record<SimMacroKey, string> = {
  dolar: 'var(--nu-green-soft)',
  selic: 'var(--nu-alloc-fii)',
  bolsa: 'var(--nu-creme)',
  petroleo: 'var(--nu-amber)',
}
const macroPaths = computed(() => (result.value ? (simExtra.value?.macroPaths ?? []) : []))
/** bloco "regras aplicadas" do PDF — os limites do motor, exportáveis (E5) */
const pdfRules = computed<string[]>(() => {
  const a = (simExtra.value?.assumptionsRaw ?? {}) as Record<string, unknown>
  if (!a.block_mode) return []
  const n = (v: unknown, d = 2) => (typeof v === 'number' ? v.toLocaleString('pt-BR', { maximumFractionDigits: d }) : '—')
  return [
    `beta da carteira ${n(a.beta)} (janela até ${Math.round(((a.beta_window_days as number) ?? 9600) / 365)} anos) · resposta por posição limitada a −60/+40 (valor pré-limite aberto no relatório)`,
    `bloco conjunto de 63 dias (IBOV+PTAX+Selic+Brent, 2007→hoje) · piso de −95% ao mês declarado · cargas de tilt 0,15/0,10`,
    `dólar: funil gate ${n(a.fx_gate)} · Selic: ciclo com nível travado 1,9%–30% · Brent: reversão κ=${n(a.brent_kappa_monthly)} · inflação com piso −2% a.a.`,
    `dado: pool ${String(a.vol_source ?? '')} · curva DI ${String(a.drift_as_of ?? '')} · ${n(a.paths, 0)} caminhos (ruído da mediana ~${n(a.mc_median_se_pct)}%)`,
  ]
})

/** curva DI vencida: flag calculada pelo MOTOR (drift_stale), exibida aqui e no PDF */
const driftStale = computed(() => (simExtra.value?.assumptionsRaw as Record<string, unknown> | undefined)?.drift_stale === true)
const driftAsOf = computed(() => String((simExtra.value?.assumptionsRaw as Record<string, unknown> | undefined)?.drift_as_of ?? ''))

/** números do painel de limites, direto das premissas do run (nunca chumbados) */
const limitsData = computed(() => {
  const a = (simExtra.value?.assumptionsRaw ?? {}) as Record<string, unknown>
  const num = (v: unknown) => (typeof v === 'number' ? v : null)
  return {
    erp: num(a.erp_pp) ?? 4,
    vol: num(a.index_vol_annual_pct)?.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) ?? null,
    anos: Math.round((num(a.beta_window_days) ?? 9600) / 365),
    gap: num(a.median_vs_mean_gap_pp)?.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) ?? '2,2',
    fxVivo: a.fx_model === 'ancora+funil+desvio-bootstrapado',
    selicViva: a.selic_model === 'ciclo-por-caminho-sobre-curva-di',
    fxGate: num(a.fx_gate)?.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) ?? '0,30',
    fxDrift: num(a.fx_drift_pp_aa)?.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) ?? '1,9',
  }
})
const macroChecked = ref<Set<SimMacroKey>>(new Set())
function toggleMacro(k: SimMacroKey) {
  const next = new Set(macroChecked.value)
  if (next.has(k)) next.delete(k)
  else next.add(k)
  macroChecked.value = next
}
const macroVisible = computed(() =>
  macroPaths.value.filter((p) => macroChecked.value.has(p.key)).map((p) => ({ ...p, color: MACRO_COLOR[p.key] })),
)

// ——— CORRELAÇÃO + SEE-THROUGH (dono 25/08: "já temos na Redentia — vale
// pôr aqui?"): heatmap derivado dos loadings do motor + exposição real
// somando o que está dentro dos ETFs. ———
/**
 * Correlacao REAL: GET /correlations devolve PARES {base, other, corr} com
 * corr em -1..1 e n_obs.
 *
 * O SINAL AGORA VIAJA INTEIRO (E2): a matriz guarda corr x 100 ASSINADO.
 * O |corr| x 100 de antes gravava -0,61 como 61 = "andam parecido" — a
 * anticorrelacao mais forte da tabela exibida como parentesco. O bloco
 * separa "anda junto" (+) de "protege" (-); |corr| so ordena magnitude.
 *
 * PAR AUSENTE VIRA null, nunca 0: a tabela de correlacoes nao e
 * todos-contra-todos (medido em producao: carteira de 6 ativos = 15 pares
 * esperados, 4 existentes). Com 0, a legenda traduzia ausencia de dado como
 * "se defendem" e o par sem historico podia virar O CONTRAPESO da carteira.
 * (Era -1 como sentinela na E1; com sinal legitimo, -1 e valor real.)
 */
const correlationApi = ref<SimCorrelationOut | null>(null)

async function loadCorrelation() {
  const syms = portfolio.value.map((p) => p.ticker).filter(Boolean)
  if (syms.length < 2) { correlationApi.value = null; return }
  try {
    const { publicFetch } = useApi()
    const r = await publicFetch<{ data: { base: string, other: string, corr: number }[] }>(
      `/correlations?symbols=${encodeURIComponent(syms.join(','))}&period=12m`,
    )
    const pares = new Map<string, number>()
    for (const d of r?.data ?? []) {
      if (typeof d?.corr === 'number') pares.set([d.base, d.other].sort().join('|'), d.corr * 100)
    }
    if (!pares.size) { correlationApi.value = null; return }
    const matrix = syms.map((a) => syms.map((b) => {
      if (a === b) return 100
      const v = pares.get([a, b].sort().join('|'))
      return v === undefined ? null : Math.round(v)
    }))
    const vals = [...pares.values()]
    const totalPairs = (syms.length * (syms.length - 1)) / 2
    correlationApi.value = {
      tickers: syms,
      matrix,
      // media de |corr|: INTENSIDADE (com sinal, -0,8 e +0,8 se cancelariam)
      avgPct: Math.round(vals.reduce((x, y) => x + Math.abs(y), 0) / vals.length),
      missingPairs: Math.max(0, totalPairs - pares.size),
      totalPairs,
    }
  }
  catch { correlationApi.value = null }
}

// Sem dado real a secao NAO desenha (fallback mudo pro mock era numero
// inventado — cosseno de vetores de fator do catalogo — no bloco-herói e no
// PDF, sem nenhum selo). O mock so existe em dev, pra trabalhar na UI.
const correlation = computed(() => {
  if (!result.value) return null
  if (correlationApi.value) return correlationApi.value
  return import.meta.dev ? buildCorrelation(portfolio.value) : null
})
/**
 * SEE-THROUGH REAL: quanto da carteira esta em cada empresa somando o que
 * esta DENTRO dos ETFs.
 *
 * Fonte: GET /etfs/{ticker}/xray, que devolve `tree` com os holdings e
 * `eff_weight` como FRACAO (0.108 = 10,8%) — contrato conferido contra
 * producao antes de escrever isto, porque chutar chave de API ja produziu
 * dois bugs silenciosos nesta sessao.
 *
 * A conta: exposicao indireta = peso do ETF na carteira x eff_weight do
 * holding. Somada a posicao direta, da o total real por empresa — que e
 * exatamente o ponto da secao: quem tem PETR4 e BOVA11 tem mais Petrobras
 * do que pensa.
 */
const seeThroughApi = ref<SimSeeThroughItem[] | null>(null)

async function loadSeeThrough() {
  const r = result.value
  if (!r) { seeThroughApi.value = null; return }
  const total = portfolio.value.reduce((x, p) => x + p.value, 0)
  if (total <= 0) { seeThroughApi.value = null; return }

  const etfs = r.positions.filter((p) => (p.klass ?? '').toUpperCase().includes('ETF'))
  const acc = new Map<string, SimSeeThroughItem>()

  // posicoes diretas
  for (const p of portfolio.value) {
    const meta = r.positions.find((x) => x.ticker === p.ticker)
    const pct = (p.value / total) * 100
    acc.set(p.ticker, {
      code: p.ticker,
      name: meta?.name ?? p.ticker,
      directPct: Math.round(pct * 10) / 10,
      directVia: p.ticker,
      viaEtf: [],
      totalPct: pct,
    })
  }

  const { publicFetch } = useApi()
  await Promise.all(etfs.map(async (etf) => {
    try {
      const x = await publicFetch<{ tree?: { ticker?: string, name?: string, eff_weight?: number }[] }>(
        `/etfs/${encodeURIComponent(etf.ticker)}/xray`,
      )
      for (const h of x?.tree ?? []) {
        const code = (h.ticker ?? '').toUpperCase()
        if (!code || typeof h.eff_weight !== 'number') continue
        // peso do ETF na carteira x peso do papel dentro do ETF
        const pct = etf.weight * h.eff_weight * 100
        if (pct < 0.05) continue // ruido: some da lista em vez de poluir
        const cur = acc.get(code) ?? {
          code, name: h.name ?? code, directPct: 0, directVia: null, viaEtf: [], totalPct: 0,
        }
        cur.viaEtf.push({ etf: etf.ticker, pct: Math.round(pct * 100) / 100 })
        cur.totalPct += pct
        acc.set(code, cur)
      }
    }
    catch { /* ETF sem raio-x publicado: entra so pela posicao direta */ }
  }))

  const out = [...acc.values()]
    .map((i) => ({ ...i, totalPct: Math.round(i.totalPct * 10) / 10 }))
    .filter((i) => i.viaEtf.length > 0)
    .sort((a, b) => b.totalPct - a.totalPct)
    .slice(0, 8)

  // [] e um resultado VALIDO: "carregou e nao ha sobreposicao relevante" —
  // a secao some com honestidade. null continua sendo "nao carregou".
  // Antes, [] caia no ?? e servia os holdings CHUMBADOS do mock pra
  // qualquer carteira sem ETF.
  seeThroughApi.value = out
}

// Sem dado real nao desenha; mock so em dev.
const seeThrough = computed(() => {
  if (!result.value) return []
  if (seeThroughApi.value !== null) return seeThroughApi.value
  return import.meta.dev ? buildSeeThrough(portfolio.value) : []
})

// ——— WHAT-IF de realocação (gap nº4, 25/08): carteira PROPOSTA roda no
// MESMO cenário; mediana B entra no fan chart + painel de deltas. ———
const portfolioB = ref<SimPortfolioInput[] | null>(null)
const whatifDraft = ref<SimPortfolioInput[]>([])
const whatifOpen = ref(false)
const whatifCardRef = ref<HTMLElement | null>(null)
useModalA11y(whatifCardRef, whatifOpen)
function onWhatifKey(e: KeyboardEvent) {
  // Esc com a BUSCA aberta fecha só ela (o listener do builder cuida)
  if (e.key === 'Escape' && !document.querySelector('.spbm')) whatifOpen.value = false
}
watch(whatifOpen, (o) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) document.addEventListener('keydown', onWhatifKey)
  else document.removeEventListener('keydown', onWhatifKey)
})
onBeforeUnmount(() => {
  if (import.meta.client) document.removeEventListener('keydown', onWhatifKey)
})
function openWhatif() {
  whatifDraft.value = (portfolioB.value ?? portfolio.value).map((p) => ({ ...p }))
  whatifOpen.value = true
}
async function applyWhatif() {
  portfolioB.value = whatifDraft.value.filter((p) => p.value > 0)
  whatifOpen.value = false
  // re-roda contra o motor pra trazer o compare; sem isso a B nunca chega
  try {
    const r = await fetchResult()
    result.value = r
    Object.assign(display, JSON.parse(JSON.stringify(r.series)))
  }
  catch { /* mantém o resultado atual; o botão continua disponível */ }
}
function clearWhatif() {
  portfolioB.value = null
  resultBApi.value = null
  anchorGap.value = null
}
/**
 * A carteira B vem do MOTOR, dentro do mesmo payload da A. Antes rodava
 * runMockSimulation aqui — o resultado principal era real e a coluna de
 * comparação era mock, lado a lado, sem nada indicando a diferença. E o selo
 * de "dados ilustrativos" só cobria o principal. Era a única parte da tela
 * que mostrava número de mock sem avisar, justamente na hora em que a pessoa
 * decide realocar.
 *
 * No fallback de mock (motor fora do ar) o que-if fica indisponível em vez de
 * inventar: melhor não oferecer a comparação do que oferecer uma falsa.
 */
const resultB = computed(() => (usingMock.value ? null : resultBApi.value))

// ——— RESUMO PRO CLIENTE + PDF (gap nº5, 25/08): dois botões, decisão do
// dono. Resumo = modal com blocos copiáveis; PDF = window.print() sobre o
// SimPrintDoc (o @media print esconde o resto da página). ———
/**
 * O resumo pro cliente vem do MOTOR (`client_summary` no payload), nao do
 * mock. E a peca que o F1 construiu com cuidado justamente pra garantir que
 * nenhum numero passe por LLM e que a FAIXA esteja sempre presente — a tela
 * estava ignorando e templetizando por conta propria.
 *
 * Importa mais que as outras trocas porque este texto sai da tela: vira
 * mensagem de WhatsApp e PDF entregues a um investidor. O motor tambem manda
 * o `disclaimer` no mesmo payload, pelo mesmo motivo (o front nao pode
 * esquecer de exibir).
 *
 * As chaves diferem: o motor manda snake_case, a tela consome camelCase.
 * Fallback no mock so quando o motor nao respondeu — e ai o selo de "dados
 * ilustrativos" ja esta na tela avisando.
 */
const clientSummary = computed(() => {
  const api = simExtra.value?.clientSummary
  if (api) {
    return {
      whatsapp: api.whatsapp,
      emailSubject: api.email_subject,
      emailBody: api.email_body,
      footer: api.footer,
    }
  }
  return result.value ? buildClientSummary(result.value) : null
})
const summaryOpen = ref(false)
const summaryCardRef = ref<HTMLElement | null>(null)
useModalA11y(summaryCardRef, summaryOpen)
function onSummaryKey(e: KeyboardEvent) {
  if (e.key === 'Escape') summaryOpen.value = false
}
watch(summaryOpen, (o) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = o ? 'hidden' : ''
  if (o) document.addEventListener('keydown', onSummaryKey)
  else document.removeEventListener('keydown', onSummaryKey)
})
onBeforeUnmount(() => {
  if (import.meta.client) document.removeEventListener('keydown', onSummaryKey)
})
const copiedKey = ref<string | null>(null)
async function copyBlock(key: string, text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    setTimeout(() => { if (copiedKey.value === key) copiedKey.value = null }, 1600)
  }
  catch { /* clipboard bloqueado — sem estado de erro no protótipo */ }
}
function printDoc() {
  window.print()
}

// ——— GSAP lazy (só esta rota paga o bundle) ———
let gsap: typeof import('gsap').gsap | null = null
const reduceMotion = ref(false)
onMounted(async () => {
  reduceMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const mod = await import('gsap')
  gsap = mod.gsap
})

// copy mínima (pedido do dono, 25/08: "tão intuitivo que não precise ler")
const WIZ_COPY: Record<string, { title: string }> = {
  assets: { title: 'Monte a carteira.' },
  shock: { title: 'Desenhe o cenário.' },
  film: { title: '' },
}
const wizCopy = computed(() => WIZ_COPY[phase.value] ?? WIZ_COPY.assets!)

// direção da navegação → o slide do conteúdo acompanha (fwd empurra pra
// esquerda; back devolve pra direita)
const stepDir = ref<'fwd' | 'back'>('fwd')
function goShock() {
  if (!canRun.value) return
  stepDir.value = 'fwd'
  phase.value = 'shock'
  window.scrollTo({ top: 0, behavior: reduceMotion.value ? 'auto' : 'smooth' })
}
function backToAssets() {
  stepDir.value = 'back'
  phase.value = 'assets'
}
function run() {
  if (!canRun.value) return
  lastSchedule.value = fullSchedule.value
  phase.value = 'film'
  blocksIn.value = false
  window.scrollTo({ top: 0, behavior: reduceMotion.value ? 'auto' : 'smooth' })
}

const finalP50 = ref(0)
/**
 * O resultado passa a vir do MOTOR (Laravel), não do mock. O adapter traduz o
 * payload pra forma que os componentes já consomem — a tela não muda de forma
 * por causa da troca de fonte.
 *
 * Falhou a chamada → cai no mock e MARCA isso em `usingMock`, pra tela poder
 * dizer que aquilo é ilustrativo. Resultado silenciosamente falso é pior que
 * erro visível numa tela que gera peça pra cliente.
 */
const usingMock = ref(false)
const simExtra = ref<import('~/components/sim/simAdapter').SimResultExtra | null>(null)

/** Resultado da carteira B, vindo do MESMO payload — nunca do mock. */
const resultBApi = ref<SimResult | null>(null)
const anchorGap = ref<number | null>(null)

async function fetchResult(): Promise<SimResult> {
  const dials: Record<string, number> = {}
  for (const [k, v] of Object.entries(shocks.value)) {
    if (typeof v === 'number') dials[k] = v
  }
  const body = {
    positions: portfolio.value.map((p) => ({ ticker: p.ticker, value: p.value })),
    // What-if no MESMO request: o motor roda a carteira B com a MESMA seed
    // (common random numbers), então a diferença entre A e B é efeito da
    // realocação, não do sorteio de Monte Carlo.
    ...(portfolioB.value?.length
      ? { positions_b: portfolioB.value.map((p) => ({ ticker: p.ticker, value: p.value })) }
      : {}),
    horizon_years: 10,
    ...(Object.keys(dials).length ? { custom_shocks: dials, shock_month: shockMonthMap() } : {}),
  }
  const { authFetch } = useApi()
  const api = await authFetch<import('~/composables/useSimulacao').SimResultApi>('/simulations/run', {
    method: 'POST',
    body,
  })
  const { result: r, extra } = adaptResult(api)
  simExtra.value = extra
  usingMock.value = false

  // compare vem pronto do motor: série, final e impacto por posição da B
  if (api.compare) {
    const { result: rb } = adaptResult({ ...api, series: api.compare.series, final: api.compare.final, positions_impact: api.compare.positions_impact })
    resultBApi.value = rb
    // carteiras de tamanhos diferentes é maçã-laranja; a UI precisa avisar
    anchorGap.value = api.compare.anchor_gap
  }
  else {
    resultBApi.value = null
    anchorGap.value = null
  }
  return r
}

/**
 * O ANO DE CADA DIAL vira mês por variável (E3). Antes ia só o mês do
 * PRIMEIRO cenário (monthOfFirstScenario) e o motor rodava "dólar 2027 +
 * bolsa 2031" inteiro em 2027 — o controle de ano existia na UI desde
 * 25/08 e era descartado no caminho.
 */
function shockMonthMap(): Record<string, number> {
  const toMonth = (year: number) => Math.max(0, Math.min(119, (year - new Date().getFullYear()) * 12))
  const out: Record<string, number> = {}
  for (const k of Object.keys(shocks.value) as (keyof SimDials)[]) {
    out[k] = toMonth(dialYears.value[k])
  }
  return out
}

async function onFilmDone() {
  runError.value = null
  let r: SimResult
  try {
    r = await fetchResult()
  }
  catch (e) {
    const err = e as { statusCode?: number; status?: number; data?: { message?: string } }
    if ((err?.statusCode ?? err?.status) === 422) {
      runError.value = err?.data?.message ?? 'A carteira não pôde ser simulada. Confira os ativos.'
      phase.value = 'assets'
      return
    }
    r = runMockSimulation(shocks.value, portfolio.value, lastSchedule.value)
    simExtra.value = null
    usingMock.value = true
  }
  result.value = r
  // correlação real em paralelo: não bloqueia o desenho do gráfico
  loadCorrelation()
  loadSeeThrough()
  // checks macro nascem marcados nos indicadores TOCADOS pelo cenário — o
  // motor é quem diz quais foram, no mesmo payload das linhas
  macroChecked.value = new Set(macroPaths.value.filter((p) => p.touched).map((p) => p.key))
  Object.assign(display, JSON.parse(JSON.stringify(r.series)))
  drawing.value = true
  phase.value = 'result'
  cursor.value = null
  animateCounter(r.final.p50, 1.9)
  setTimeout(() => { drawing.value = false }, 2000)
  setTimeout(() => { blocksIn.value = true }, 650)
  nextTick(() => document.getElementById('sim-resultado')?.scrollIntoView({ behavior: reduceMotion.value ? 'auto' : 'smooth', block: 'start' }))
}

function animateCounter(to: number, dur: number) {
  if (!gsap || reduceMotion.value) { finalP50.value = to; return }
  const obj = { v: finalP50.value || result.value!.assumptions.anchor }
  gsap.to(obj, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { finalP50.value = Math.round(obj.v) } })
}

function reset() {
  // volta pro wizard MANTENDO carteira e choques (re-simular é o caso comum)
  phase.value = 'assets'
  result.value = null
  cursor.value = null
  finalP50.value = 0
  window.scrollTo({ top: 0, behavior: reduceMotion.value ? 'auto' : 'smooth' })
}

const fmt = fmtBRL
const fmtFull = fmtBRLFull

/** corpo da leitura: escape SEMPRE antes (regra da casa), depois {mark}→span */
const readingHtml = computed(() => {
  if (!result.value) return ''
  return escapeHtml(result.value.scenario.narrative)
    .replaceAll('{mark}', '<span class="sim__mark">')
    .replaceAll('{/mark}', '</span>')
})
</script>

<template>
  <div class="sim">
    <!-- ============ WIZARD (orb persistente + fundo que transiciona) ============ -->
    <section v-if="phase !== 'result'" class="sim__wiz" :class="`sim__wiz--${phase}`">
      <!-- o orb: UMA instância, coreografada por fase (direita → esquerda →
           centro grande com "Simulando" dentro, a cena da referência) -->
      <div class="sim__wiz-orb" aria-hidden="true">
        <SimOrb :state="phase === 'film' ? 'thinking' : 'idle'" :size="460" :mood="orbMood" />
      </div>
      <!-- passo 2: manchetes REAIS derivando pro orb ("considera o noticiário") -->
      <Transition name="nu-soft">
        <div v-if="phase === 'shock'" class="sim__orbfeed">
          <SimOrbFeed />
        </div>
      </Transition>
      <!-- filme: a palavra vive DENTRO do orb (mesmo padrão do feed — overlay
           nas coordenadas do orb, sem herdar o scale); os passos ficam embaixo -->
      <div v-if="phase === 'film'" class="sim__wiz-wordwrap" aria-hidden="true">
        <span class="sim__wiz-word">
          <i v-for="(l, i) in 'Simulando'.split('')" :key="i" class="sim__wiz-letter" :style="{ animationDelay: `${i * 0.1}s` }">{{ l }}</i>
        </span>
      </div>

      <div class="sim__wiz-body">
        <!-- SEM out-in: o passo que sai vira absolute e desliza POR CIMA
             enquanto o novo já entra no fluxo — mata o frame vazio que
             colapsava a altura (o "glitch" do dono, 25/08) -->
        <Transition :name="stepDir === 'fwd' ? 'wstep' : 'wstepb'">
          <div v-if="phase === 'assets'" key="assets" class="sim__step">
            <div class="sim__passo">
              <NuEyebrow>Simulação</NuEyebrow>
              <span class="sim__dots" role="img" aria-label="Passo 1 de 2"><i class="sim__dot sim__dot--on" /><i class="sim__dot" /></span>
            </div>
            <h1 class="sim__title">{{ wizCopy.title }}</h1>
            <p v-if="runError" class="sim__run-error" role="alert">{{ runError }}</p>
            <div class="sim__builder">
              <SimPortfolioBuilder v-model="portfolio" />
            </div>
            <div class="sim__wiz-nav">
              <NuBotaoSeta tamanho="m" :disabled="!canRun" @click="goShock">Continuar</NuBotaoSeta>
            </div>
          </div>

          <div v-else-if="phase === 'shock'" key="shock" class="sim__step">
            <div class="sim__passo">
              <NuEyebrow>Simulação</NuEyebrow>
              <span class="sim__dots" role="img" aria-label="Passo 2 de 2"><i class="sim__dot sim__dot--on" /><i class="sim__dot sim__dot--on" /></span>
            </div>
            <h1 class="sim__title">{{ wizCopy.title }}</h1>
            <div class="sim__shockgrid">
              <SimShockPanel v-model="dials" v-model:years="dialYears" />
            </div>
            <div class="sim__wiz-nav">
              <button type="button" class="sim__back" @click="backToAssets">Voltar</button>
              <NuBotaoSeta tamanho="m" @click="run">Simular · 10 anos</NuBotaoSeta>
            </div>
          </div>

          <div v-else-if="phase === 'film'" key="film" class="sim__step sim__step--film">
            <SimFilm :steps="filmSteps" @done="onFilmDone" />
          </div>
        </Transition>
      </div>
      <p v-if="phase !== 'film'" class="sim__honest">Projeção estatística com premissas explícitas. Não é previsão nem promessa de retorno.</p>
    </section>

    <!-- ============ RESULTADO (carvão) ============ -->
    <section v-if="phase === 'result'" id="sim-resultado" class="sim__navy">
      <template v-if="result">
        <div class="sim__result-head">
          <div>
            <NuEyebrow sobre="escuro">Sua carteira em 10 anos</NuEyebrow>
            <h2 class="sim__navy-title">Daqui a 10 anos, a mediana diz<br><span class="sim__counter">{{ fmtFull(finalP50) }}</span></h2>
            <!-- O rótulo de unidade só vale pro número do MOTOR. O mock é
                 nominal; carimbar "poder de compra" nele seria mentir sobre o
                 dado justamente na linha que existe pra ser honesta. -->
            <p v-if="!usingMock" class="sim__unit">em poder de compra de hoje</p>
            <p class="sim__range">entre <b class="sim__range-lo">{{ fmt(result.final.p10) }}</b> e <b class="sim__range-hi">{{ fmt(result.final.p90) }}</b></p>
            <!-- Proveniência: cenário da biblioteca foi estudado e tem fonte;
                 montado nos dials, não. E resultado de mock nunca pode passar
                 por número real numa tela que gera peça pra cliente. -->
            <p v-if="usingMock" class="sim__flag sim__flag--mock">Dados ilustrativos: o motor não respondeu</p>
            <p v-else-if="simExtra && !simExtra.calibrated" class="sim__flag">Cenário que você montou, sem precedente histórico calibrado</p>
            <!-- A curva DI é digitada à mão e ancora TODO o drift; vencida,
                 o PDF sai com âncora velha sem ninguém notar. O motor manda
                 a flag; a tela obedece. -->
            <p v-if="!usingMock && driftStale" class="sim__flag">Curva de juros da projeção datada de {{ driftAsOf }}: premissa com mais de 90 dias, peça atualização</p>
          </div>
          <div class="sim__pills">
            <NuBotaoSeta v-if="!resultB" variante="creme" tamanho="m" @click="openWhatif">Testar realocação</NuBotaoSeta>
          </div>
        </div>

        <div class="sim__chart">
          <SimFanChart v-model:cursor="cursor" :series="display" :events="result.events" :drawing="drawing" :compare="resultB?.series ?? null" :macro="macroVisible" />
        </div>
        <div class="sim__chart-legend">
          <span><i class="sim__leg sim__leg--band" />faixa provável</span>
          <span><i class="sim__leg sim__leg--p50" />mediana</span>
          <span v-if="resultB"><i class="sim__leg sim__leg--b" />proposta</span>
          <span><i class="sim__leg sim__leg--ev" />cenário</span>
          <!-- checks das trajetórias macro, no mesmo gráfico -->
          <button
            v-for="p in macroPaths" :key="p.key" type="button"
            class="sim__leg-check" :class="{ 'sim__leg-check--on': macroChecked.has(p.key) }"
            :aria-pressed="macroChecked.has(p.key)" @click="toggleMacro(p.key)"
          >
            <i class="sim__leg-dot" :style="{ background: macroChecked.has(p.key) ? MACRO_COLOR[p.key] : 'transparent', borderColor: MACRO_COLOR[p.key] }" />
            {{ p.label }}
          </button>
        </div>

        <!-- Comparar carteiras de tamanhos diferentes e maca-laranja: parte do
             delta vem do aporte, nao da realocacao. O motor marca; a tela avisa. -->
        <p v-if="anchorGap" class="sim__flag">As duas carteiras diferem {{ anchorGap }}% em tamanho. Parte da diferença vem disso, não da realocação</p>
        <SimCompare v-if="resultB" :a="result" :b="resultB" @edit="openWhatif" @clear="clearWhatif" />

        <SimTimeline v-model:cursor="cursor" :months="HORIZON_MONTHS" :dates="display.dates" :events="result.events" />
      </template>
    </section>

    <!-- ============ LEITURA DA APORTOU: o painel azul da marca (gradiente
         cobalto, raio 40, o corte gigante a 8%); a anatomia segue a do "O dia
         no mercado" (pedido do dono, 25/08) ============ -->
    <section v-if="phase === 'result' && result" class="sim__blue">
      <div class="sim__blue-painel">
      <MarcaCorte class="sim__blue-corte nu-corte-fundo" :largura="520" cor="var(--nu-white)" />
      <div class="sim__blue-body">
        <NuEyebrow sobre="azul" class="sim__blue-eyebrow">Leitura da Aportou</NuEyebrow>
        <p class="sim__blue-lead">{{ result.scenario.lead }}</p>
        <!-- eslint-disable-next-line vue/no-v-html — escapeHtml aplicado no computed -->
        <p class="sim__blue-text" v-html="readingHtml" />
      </div>
      <!-- entregável do assessor, no layout do "O dia no mercado" (dono 25/08) -->
      <div class="sim__blue-cta">
        <NuBotaoSeta variante="creme" @click="summaryOpen = true">Gerar resumo</NuBotaoSeta>
        <button type="button" class="sim__blue-btn2" @click="printDoc">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3v5h5" /><path d="M19 8v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7Z" /><path d="M9 13h6M9 17h6" /></svg>
          Gerar PDF
        </button>
      </div>
      </div>
    </section>

    <!-- ============ QUEM SANGRA, QUEM SEGURA (faixa quente) ============ -->
    <section v-if="phase === 'result' && result" class="sim__band sim__band--faixa">
      <NuSectionHeading eyebrow="O cenário, posição a posição">
        Quem sangra,<br>quem segura.
        <template #dek>Impacto estimado do cenário em cada posição, pelo mapa de fatores da carteira: peso × sensibilidade.</template>
      </NuSectionHeading>
      <div class="sim__block sim__block--full">
        <SimPositionsImpact :positions="result.positions" :active="blocksIn" />
      </div>

      <!-- correlação + sobreposição — dado REAL (/correlations); sem dado a
           seção declara indisponibilidade em vez de desenhar número inventado -->
      <template v-if="correlation">
        <div class="sim__subsection">
          <NuSectionHeading eyebrow="Correlação e sobreposição">
            Por que sangra<br>junto.
          </NuSectionHeading>
        </div>
        <div class="sim__block sim__block--full">
          <SimCorrelation :corr="correlation" :see-through="seeThrough" :active="blocksIn" />
        </div>
      </template>
      <p v-else-if="!usingMock" class="sim__corr-off">
        Correlação indisponível para esta carteira: falta histórico em comum suficiente entre os ativos.
      </p>
    </section>

    <!-- ============ ANO A ANO (creme da página) ============ -->
    <section v-if="phase === 'result' && result" class="sim__band sim__band--cream">
      <NuSectionHeading eyebrow="A década, ano a ano">
        Cada ano é uma faixa,<br>não um número.
        <template #dek>O honesto em 10 anos é o intervalo: a caixa é o espaço entre o pessimista e o otimista; o traço azul, a mediana.</template>
      </NuSectionHeading>
      <div class="sim__block sim__block--full">
        <SimAnnualBands :annual="result.annual" :active="blocksIn" />
      </div>

      <!-- o painel de limites (E2): divulgar a incerteza SÓ dos modelos que
           rodam — falar de meia-vida de Selic implicaria rodar Selic. Por
           isso o texto muda por etapa do motor, e no mock não aparece. -->
      <div v-if="!usingMock" class="sim__limits sim__block sim__block--full">
        <b class="sim__limits-title">O que este número não sabe</b>
        <ul class="sim__limits-list">
          <li v-if="limitsData.fxVivo">"Historicamente o dólar sempre sobe" é falso: o drift nominal de +4,06% a.a. em 26 anos não é estatisticamente significativo, e 54,8% das janelas de 10 anos têm drift REAL negativo. O modelo usa paridade de inflação (+{{ limitsData.fxDrift }}% a.a. nominal; em poder de compra o dólar perde ~2,5% a.a.), e o funil da âncora (gate {{ limitsData.fxGate }}) é o que garante FAIXA no ano do alvo: sem ele o cenário viraria número único, e número único é proibido.</li>
          <li v-else>O dólar é degrau (salta para o alvo no mês do cenário). A dinâmica própria chega nas próximas versões do motor.</li>
          <li v-if="limitsData.selicViva">A Selic de cada caminho tem ciclo próprio sobre a curva DI (nível travado em 1,90%–30%), e cada caminho é deflacionado pela SUA inflação, mas a meia-vida do ciclo NÃO é identificada nos dados (30 a 77 meses conforme o modelo). O Brent reverte à média com κ=0,03/mês, escolha fixa dentro de uma faixa larga (meia-vida de 11 a 69 meses); livre, a faixa de 10 anos iria de US$ 8 a 767.</li>
          <li v-else>O petróleo não desenha linha própria e a Selic segue a curva DI da casa. A dinâmica própria dessas duas chega nas próximas versões do motor.</li>
          <li v-if="limitsData.selicViva">Cada mês de cada caminho tem piso de −95% (o truncamento da cauda extrema é declarado, não silencioso), e a inflação implícita tem piso de −2% a.a. (deflação moderada existe; piso zero daria retorno real de graça aos caminhos de juro baixo).</li>
          <li>O prêmio de risco de {{ limitsData.erp }} p.p. é premissa editorial, não estimativa: o intervalo de confiança do dado histórico vai de −15,2 a +8,2 p.p.: o dado não distingue −3 de +6.</li>
          <li>A cauda da faixa se apoia em 4 grandes episódios de crise{{ limitsData.vol ? ` (vol do índice: ${limitsData.vol}% a.a. na série 2001→hoje)` : '' }}; 2008 sozinho responde por 133 dos 211 dias de maior volatilidade da série.</li>
          <li>Nenhum ajuste de reversão à média foi aplicado ao índice: o teste de variância (VR 252/21 = 0,664, p = 0,114) não sustenta nem exige o ajuste.</li>
          <li>O beta de cada papel usa todo o histórico disponível (até {{ limitsData.anos }} anos; a janela real de cada um está no bloco "Quem sangra", com pregões e o beta de estresse). A mediana fica ~{{ limitsData.gap }} p.p. a.a. abaixo do retorno médio esperado: é a matemática do caminho do meio, não pessimismo.</li>
        </ul>
      </div>

      <div class="sim__again">
        <NuBotaoSeta variante="carvao" tamanho="m" @click="reset">Fazer outra pergunta</NuBotaoSeta>
      </div>
    </section>

    <!-- o documento do "Gerar PDF" — invisível na tela, único visível no print -->
    <SimPrintDoc
      v-if="result && clientSummary" :result="result" :summary="clientSummary"
      :drift-warning="driftStale ? `Curva de juros da projeção datada de ${driftAsOf}: premissa da casa com mais de 90 dias.` : null"
      :fx-note="limitsData.fxVivo ? `Dólar simulado por âncora + funil (gate ${limitsData.fxGate}) + desvio histórico: parâmetro de compliance carimbado.` : null"
      :engine-rules="pdfRules"
    />

    <!-- ——— modal do RESUMO pro cliente: blocos copiáveis ——— -->
    <Teleport to="body">
      <div v-if="summaryOpen && clientSummary" class="simw" role="presentation" @click.self="summaryOpen = false">
        <div ref="summaryCardRef" class="simw__card simw__card--summary" role="dialog" aria-modal="true" aria-label="Resumo pro cliente" tabindex="-1">
          <div class="simw__head">
            <b class="simw__title">Resumo pro cliente</b>
            <button type="button" class="simw__close" aria-label="Fechar" @click="summaryOpen = false">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          <div class="sims__block">
            <div class="sims__block-head">
              <span class="sims__block-label">WhatsApp</span>
              <button type="button" class="sims__copy" :class="{ 'sims__copy--ok': copiedKey === 'wa' }" @click="copyBlock('wa', clientSummary.whatsapp)">{{ copiedKey === 'wa' ? 'Copiado' : 'Copiar' }}</button>
            </div>
            <p class="sims__text">{{ clientSummary.whatsapp }}</p>
          </div>

          <div class="sims__block">
            <div class="sims__block-head">
              <span class="sims__block-label">E-mail</span>
              <button type="button" class="sims__copy" :class="{ 'sims__copy--ok': copiedKey === 'mail' }" @click="copyBlock('mail', `${clientSummary.emailSubject}\n\n${clientSummary.emailBody}`)">{{ copiedKey === 'mail' ? 'Copiado' : 'Copiar' }}</button>
            </div>
            <p class="sims__subject">{{ clientSummary.emailSubject }}</p>
            <p class="sims__text">{{ clientSummary.emailBody }}</p>
          </div>

          <p class="sims__footer">{{ clientSummary.footer }}</p>
        </div>
      </div>
    </Teleport>

    <!-- ——— modal do what-if: monta a carteira PROPOSTA (padrão da casa) ——— -->
    <Teleport to="body">
      <div v-if="whatifOpen" class="simw" role="presentation" @click.self="whatifOpen = false">
        <div ref="whatifCardRef" class="simw__card" role="dialog" aria-modal="true" aria-label="Testar uma realocação" tabindex="-1">
          <div class="simw__head">
            <b class="simw__title">Testar uma realocação</b>
            <button type="button" class="simw__close" aria-label="Fechar" @click="whatifOpen = false">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <p class="simw__sub">O mesmo cenário roda nas duas carteiras.</p>
          <SimPortfolioBuilder v-model="whatifDraft" />
          <div class="simw__foot">
            <button type="button" class="sim__back sim__back--modal" @click="whatifOpen = false">Cancelar</button>
            <NuBotaoSeta tamanho="m" :disabled="!whatifDraft.some((p) => p.value > 0)" @click="applyWhatif">Comparar</NuBotaoSeta>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): a página veste a marca sem mudar o fluxo. Creme da
   página no passo 1, sálvia no passo 2, carvão no filme e no resultado; a
   leitura mora no painel azul da marca; as bandas claras alternam faixa e
   página (não existe faixa branca de ponta a ponta). */
.sim { background: var(--nu-page); }

/* ——— wizard (fundo e orb coreografados por fase) ——— */
.sim__wiz {
  position: relative; overflow: hidden;
  background: var(--nu-page);
  padding: clamp(48px, 6.5vw, 84px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(48px, 6vw, 76px);
  transition: background-color 0.9s ease;
  animation: nu-fade 0.5s ease both;
}
.sim__wiz--film {
  background: var(--nu-ink);
  min-height: 82vh;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
}
/* o orb: sempre left/top + translate + scale → todas as fases transicionam */
.sim__wiz-orb {
  position: absolute; z-index: 0; pointer-events: none;
  left: 86%; top: 30%;
  transform: translate(-50%, -50%) scale(0.68);
  opacity: 0.95;
  transition: left 1s cubic-bezier(0.22, 0.61, 0.36, 1), top 1s cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 1s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.6s ease;
}
/* passo 2: orb maior, no corredor DIREITO, com o centro vertical alinhado ao
   centro dos dial-cards (~470px do topo da seção — px porque a altura da seção
   varia com o conteúdo abaixo). O fundo é a sálvia da marca: os dial-cards
   carvão saltam e a progressão fica creme → sálvia → carvão do filme. */
.sim__wiz--shock { background: var(--nu-sage); }
.sim__wiz--shock .sim__wiz-orb {
  left: 85%;
  top: 470px;
  transform: translate(-50%, -50%) scale(0.92);
  opacity: 0.9;
}
/* filme: orb um pouco menor, mais alto — a palavra fica embaixo dele */
.sim__wiz--film .sim__wiz-orb { left: 50%; top: 30%; transform: translate(-50%, -50%) scale(0.74); opacity: 1; }
/* a palavra no CENTRO do orb do filme (coords da coreografia --film, sem
   herdar o scale — texto em tamanho real) */
.sim__wiz-wordwrap {
  position: absolute; z-index: 1; pointer-events: none;
  left: 50%; top: 30%;
  transform: translate(-50%, -50%);
}
.sim__wiz-word { display: inline-flex; justify-content: center; }
.sim__step--film { display: flex; flex-direction: column; align-items: center; }
.sim__wiz-letter {
  color: var(--nu-white); font-size: var(--nu-fs-2xl); font-weight: 800; font-style: normal;
  letter-spacing: 0.02em;
  animation: sim-letter 2s ease-in-out infinite;
  opacity: 0.4;
}
@keyframes sim-letter {
  0%, 100% { opacity: 0.4; transform: translateY(0); }
  20% { opacity: 1; transform: scale(1.15); }
  40% { opacity: 0.7; transform: translateY(0); }
}
.sim__wiz-body { position: relative; z-index: 1; }
.sim__orbfeed {
  /* sobre o CENTRO do orb do passo 2 (left/top espelham a coreografia
     .sim__wiz--shock do orb, sem herdar o scale — texto em tamanho real) */
  position: absolute; z-index: 1; pointer-events: none;
  left: 85%;
  top: 470px;
  transform: translate(-50%, -50%);
  width: 224px;
}
.nu-soft-enter-active { transition: opacity 0.6s ease 0.5s; }
.nu-soft-leave-active { transition: opacity 0.25s ease; }
.nu-soft-enter-from, .nu-soft-leave-to { opacity: 0; }
@media (max-width: 1100px) { .sim__orbfeed { display: none; } }
/* slide direcional SOBREPOSTO: o que sai fica absolute (sem colapsar a
   altura) e desliza por cima; o que entra já ocupa o fluxo com um delay
   mínimo — sem frame vazio, sem pulo de layout */
.wstep-enter-active, .wstepb-enter-active { transition: opacity 0.5s ease 0.08s, transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) 0.08s; }
.wstep-leave-active, .wstepb-leave-active {
  position: absolute; top: 0; left: 0; width: 100%;
  transition: opacity 0.32s ease, transform 0.32s ease;
  pointer-events: none;
}
.wstep-enter-from { opacity: 0; transform: translateX(56px); }
.wstep-leave-to { opacity: 0; transform: translateX(-44px); }
.wstepb-enter-from { opacity: 0; transform: translateX(-56px); }
.wstepb-leave-to { opacity: 0; transform: translateX(44px); }
.sim__wiz--film .sim__wiz-body { padding-bottom: 6vh; }
.sim__wiz-nav { margin-top: 28px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
/* a segunda ação: pílula branca de contorno carvão, da altura do botão da seta */
.sim__back {
  display: inline-flex; align-items: center; justify-content: center; min-height: 52px;
  border: none; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  background: var(--nu-white); color: var(--nu-ink);
  padding: 0 26px; font-size: 16.5px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background 0.2s, transform 0.15s cubic-bezier(.2, .8, .2, 1);
}
.sim__back:hover { background: var(--nu-row-hover); }
.sim__back:active { transform: scale(.98); }
.sim__shockgrid { max-width: 880px; }

@media (max-width: 1080px) { .sim__wiz-orb { opacity: 0.3; } .sim__wiz--film .sim__wiz-orb { opacity: 1; } }
/* o eyebrow da marca abre o passo; os pontos dizem em que passo está */
.sim__passo { display: flex; align-items: center; gap: 14px; }
.sim__dots { display: inline-flex; gap: 6px; }
.sim__dot {
  width: 22px; height: 6px; border-radius: var(--nu-r-pill);
  background: var(--nu-line); transition: background 0.3s ease;
}
.sim__dot--on { background: var(--nu-blue); }
/* sobre a sálvia o corte e os pontos vão no carvão (o cobalto some ali) */
.sim__wiz--shock .sim__passo :deep(.mkc path) { fill: var(--nu-ink); }
.sim__wiz--shock .sim__dot { background: var(--nu-sage-line); }
.sim__wiz--shock .sim__dot--on { background: var(--nu-ink); }
.sim__title {
  margin: 18px 0 26px; color: var(--nu-ink);
  font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02;
}
.sim__honest { margin: 16px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.45; position: relative; z-index: 1; }
.sim__wiz--shock .sim__honest { color: var(--nu-gray-3); }

/* builder + passo dos choques */
.sim__builder { position: relative; }

/* ——— resultado: carvão ——— */
.sim__navy {
  background: var(--nu-ink);
  padding: clamp(48px, 6.5vw, 84px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(56px, 7vw, 90px);
}
.sim__result-head { display: flex; justify-content: space-between; gap: 26px; flex-wrap: wrap; align-items: flex-start; }
.sim__navy-title {
  margin: 18px 0 0; color: var(--nu-white);
  font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.025em; line-height: 1.05;
}
/* o número-herói: o cobalto que lê sobre carvão */
.sim__counter {
  display: inline-block; margin-top: 10px; color: var(--nu-blue-on-dark); font-variant-numeric: tabular-nums;
  font-size: clamp(46px, 5.2vw, 68px); letter-spacing: -0.035em; line-height: 1;
}
.sim__unit { margin: 10px 0 0; font-size: 13.5px; font-weight: 600; color: var(--nu-on-dark-2); }
/* o selo "atenção" sobre carvão */
.sim__flag {
  margin: 14px 0 0; display: inline-flex; align-items: center;
  font-size: 13.5px; font-weight: 700; line-height: 1.35;
  padding: 6px 12px; border-radius: var(--nu-r-tag);
  background: var(--nu-warning-bg); color: var(--nu-amber-soft);
}
.sim__flag--mock { background: color-mix(in srgb, var(--nu-red-soft) 22%, transparent); color: var(--nu-red-soft); }

.sim__range { margin: 14px 0 0; color: var(--nu-on-dark); font-size: var(--nu-fs-lg); font-weight: 500; max-width: 560px; }
.sim__range b { font-weight: 800; font-variant-numeric: tabular-nums; }
.sim__range-lo { color: var(--nu-red-soft); }
.sim__range-hi { color: var(--nu-green-soft); }
.sim__pills { display: flex; gap: 8px; flex-wrap: wrap; }
.sim__chart { margin-top: 38px; height: clamp(300px, 42vw, 400px); }
.sim__chart-legend { margin-top: 14px; display: flex; align-items: center; gap: 10px 20px; flex-wrap: wrap; color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 600; }
.sim__chart-legend span { display: inline-flex; align-items: center; gap: 7px; }
.sim__leg { width: 14px; height: 4px; border-radius: 999px; }
.sim__leg--band { background: var(--nu-blue-soft-35); height: 10px; }
.sim__leg--p50 { background: var(--nu-blue-on-dark); }
.sim__leg--b { background: var(--nu-amber); }
.sim__leg--ev { background: var(--nu-amber); width: 4px; height: 12px; }

/* checks das trajetórias macro na legenda: o chip sobre carvão */
.sim__leg-check {
  display: inline-flex; align-items: center; gap: 8px; min-height: 44px;
  border: 1.5px solid var(--nu-dark-chip-line); border-radius: var(--nu-r-pill);
  background: var(--nu-dark-chip); color: var(--nu-on-dark-2);
  padding: 0 16px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.sim__leg-check--on { color: var(--nu-white); border-color: var(--nu-on-dark-2); }
.sim__leg-check:hover { background: var(--nu-navy-3); color: var(--nu-white); }
.sim__leg-dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid; transition: background 0.2s; }

/* modais (what-if e resumo): o fundo surge, a folha sobe */
.simw {
  position: fixed; inset: 0; z-index: 120;
  display: flex; align-items: flex-start; justify-content: center;
  padding: clamp(18px, 6vh, 64px) 18px 18px;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: nu-surgir 0.2s ease both;
}
.simw__card {
  width: min(940px, 100%); max-height: calc(100dvh - 36px); overflow-y: auto;
  background: var(--nu-page); border-radius: var(--nu-r-card-lg);
  padding: clamp(20px, 3vw, 30px) clamp(18px, 3vw, 30px) clamp(18px, 2.4vw, 24px); box-shadow: var(--nu-shadow-day-modal);
  outline: none; animation: nu-subir 0.32s cubic-bezier(.2, .8, .2, 1) both;
}
.simw__head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.simw__title { color: var(--nu-ink); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.025em; line-height: 1.1; }
.simw__close {
  width: 44px; height: 44px; flex-shrink: 0; border: none; border-radius: 50%;
  background: var(--nu-cream-2); color: var(--nu-ink); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.simw__close:hover { background: var(--nu-line-2); }
.simw__sub { margin: 6px 0 18px; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; }
.simw__foot { margin-top: 20px; display: flex; justify-content: flex-end; align-items: center; gap: 10px; flex-wrap: wrap; }
.simw__card--summary { width: min(640px, 100%); }
/* "Cancelar": discreto, sem contorno */
.sim__back--modal { box-shadow: none; background: transparent; }
.sim__back--modal:hover { background: var(--nu-cream-2); }

/* ——— leitura da Aportou: o painel azul da marca, com o corte gigante ——— */
.sim__blue {
  background: var(--nu-page);
  padding: clamp(28px, 4vw, 56px) max(clamp(16px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade 0.5s ease both;
}
.sim__blue-painel {
  position: relative; overflow: hidden;
  background: var(--nu-grad-cobalto); border-radius: var(--nu-r-secao);
  padding: clamp(44px, 6vw, 84px) clamp(22px, 5vw, 72px);
}
.sim__blue-corte { position: absolute; right: -70px; bottom: -110px; opacity: 0.08; pointer-events: none; }
.sim__blue-body { position: relative; max-width: 860px; margin: 0 auto; }
.sim__blue-eyebrow { justify-content: center; margin-bottom: 20px; }
.sim__blue-lead {
  margin: 0; color: var(--nu-white); text-align: center;
  font-size: var(--nu-fs-h3); font-weight: 800;
  letter-spacing: -0.025em; line-height: 1.05; text-wrap: balance;
}
.sim__blue-text {
  margin: 22px auto 0; color: var(--nu-blue-on-blue);
  font-size: clamp(17px, 1.5vw, 19px); font-weight: 500; line-height: 1.6; max-width: 780px;
}
.sim__blue-text :deep(.sim__mark) {
  background: var(--nu-white-18); color: var(--nu-white);
  border-radius: 6px; padding: 1px 6px; font-weight: 700;
}
/* entregável: a pílula creme com a seta + a pílula de contorno com o ícone */
.sim__blue-cta { position: relative; display: flex; justify-content: center; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: clamp(32px, 4vw, 44px); }
.sim__blue-btn2 {
  display: inline-flex; align-items: center; gap: 9px; min-height: 62px;
  background: transparent; color: var(--nu-white); border: 1.5px solid var(--nu-white-35);
  border-radius: var(--nu-r-pill); padding: 0 28px; font-size: 17px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 0.2s, border-color 0.2s, transform 0.15s cubic-bezier(.2, .8, .2, 1);
}
.sim__blue-btn2:hover { background: var(--nu-white-14); border-color: var(--nu-white-60); }
.sim__blue-btn2:active { transform: scale(.98); }

/* blocos do resumo: cartão branco dentro da folha */
.sims__block { margin-top: 16px; background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 18px 20px; box-shadow: var(--nu-shadow-quente); }
.sims__block-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.sims__block-label { color: var(--nu-ink); font-size: 13.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
.sims__copy {
  min-height: 44px; border: none; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1.5px var(--nu-ink);
  background: var(--nu-white); color: var(--nu-ink);
  padding: 0 18px; font-size: 14.5px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.sims__copy:hover { background: var(--nu-row-hover); }
.sims__copy--ok { background: var(--nu-green-bg); color: var(--nu-green-text); box-shadow: none; }
.sims__subject { margin: 0 0 6px; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.sims__text { margin: 0; color: var(--nu-gray-3); font-size: 15px; font-weight: 500; line-height: 1.6; white-space: pre-line; }
.sims__footer { margin: 16px 2px 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.5; }

/* ——— GERAR PDF: no print, só o documento existe ——— */
@media print {
  :global(body *) { visibility: hidden; }
  :global(.spd), :global(.spd *) { visibility: visible; }
  :global(.spd) { position: absolute; left: 0; top: 0; width: 100%; }
}

/* ——— bandas claras: faixa quente e página, alternadas ——— */
.sim__band { padding: clamp(64px, 7vw, 100px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)); animation: nu-fade 0.5s ease both; }
.sim__subsection { margin-top: clamp(64px, 8vw, 104px); }
.sim__band--faixa { background: var(--nu-band); }
.sim__band--cream { background: var(--nu-page); }
.sim__block { margin-top: 38px; max-width: 900px; }
.sim__block--full { max-width: none; }
/* correlação sem dado: uma linha honesta no lugar da seção */
.sim__corr-off { margin: 26px auto 0; max-width: 640px; text-align: center; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

/* 422 do motor: a mensagem acionável, no lugar onde se corrige */
.sim__run-error {
  margin: 0 0 18px; padding: 12px 18px; max-width: 640px;
  background: var(--nu-red-bg); color: var(--nu-red-text); border-radius: var(--nu-r-tile);
  font-size: 15px; font-weight: 700; line-height: 1.45;
}

/* painel de limites: o cartão quente, tipografia de nota — não compete com os blocos */
.sim__limits { margin-top: 40px; padding: clamp(22px, 3vw, 34px); background: var(--nu-band); border-radius: var(--nu-r-card); box-shadow: var(--nu-shadow-quente); }
.sim__limits-title { display: block; color: var(--nu-ink); font-size: 13.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
.sim__limits-list { margin: 16px 0 0; padding-left: 18px; display: flex; flex-direction: column; gap: 10px; }
.sim__limits-list li { color: var(--nu-gray-3); font-size: 14.5px; font-weight: 500; line-height: 1.5; }
.sim__again { margin-top: 48px; }

@media (max-width: 760px) {
  .sim__chart { height: 300px; }
  .sim__blue-painel { border-radius: var(--nu-r-card-lg); }
  .sim__blue-corte { right: -160px; bottom: -150px; }
  .sim__wiz-nav > * { flex: 1 1 auto; }
}
</style>
