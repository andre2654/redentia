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
  runMockSimulation, buildClientSummary, buildMacroPaths, buildCorrelation, buildSeeThrough,
  fmtBRL, fmtBRLFull, shocksTitle,
  shocksFromDials, DIAL_DEFAULTS, HORIZON_MONTHS,
  type SimResult, type SimSeries, type SimPortfolioInput, type SimShocks, type SimDials,
  type SimScheduledScenario, type SimMacroKey, type SimCorrelationOut,
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
    `Lendo sua carteira — ${n} ${n === 1 ? 'posição' : 'posições'}, ${fmtBRL(portfolioTotal.value)}`,
    'Calibrando o beta contra 5 anos de IBOV',
    'Rodando 2.000 caminhos, mês a mês, por 10 anos',
    fullSchedule.value.length > 1
      ? `Aplicando ${fullSchedule.value.length} cenários pela década`
      : fullSchedule.value.length === 1
        ? `Aplicando o cenário de ${fullSchedule.value[0]!.year}: ${shocksTitle(fullSchedule.value[0]!.shocks).toLowerCase()}`
        : 'Cenário base — compondo o caminho',
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
// indicadores tocados na etapa 2. IBOV em teal (a mediana é azul). ———
const MACRO_COLOR: Record<SimMacroKey, string> = {
  dolar: 'var(--nu-green-soft)',
  selic: 'var(--nu-alloc-fii)',
  bolsa: 'color-mix(in srgb, var(--nu-class-etf) 55%, var(--nu-white))',
  petroleo: 'color-mix(in srgb, var(--nu-class-bdr) 78%, var(--nu-white))',
}
const macroPaths = computed(() => (result.value ? buildMacroPaths(lastSchedule.value) : []))
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
 * corr em -1..1 e n_obs. A tela consome matriz triangular 0-100, entao a
 * conversao acontece aqui: |corr| x 100, porque o que a secao responde e
 * "andam juntas?" — anticorrelacao forte tambem e movimento acoplado.
 *
 * Par ausente (sem historico em comum) vira 0 e NAO entra na media: contar
 * ausencia como "descorrelacionado" inflaria a nota de diversificacao.
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
      if (typeof d?.corr === 'number') pares.set([d.base, d.other].sort().join('|'), Math.abs(d.corr) * 100)
    }
    if (!pares.size) { correlationApi.value = null; return }
    const matrix = syms.map((a) => syms.map((b) => (a === b ? 100 : Math.round(pares.get([a, b].sort().join('|')) ?? 0))))
    const vals = [...pares.values()]
    correlationApi.value = {
      tickers: syms,
      matrix,
      avgPct: Math.round(vals.reduce((x, y) => x + y, 0) / vals.length),
    }
  }
  catch { correlationApi.value = null }
}

// Sem dado real cai no derivado dos fatores — a secao nunca some do resultado.
const correlation = computed(() =>
  result.value ? (correlationApi.value ?? buildCorrelation(portfolio.value)) : null,
)
const seeThrough = computed(() => (result.value ? buildSeeThrough(portfolio.value) : []))

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
const clientSummary = computed(() => (result.value ? buildClientSummary(result.value) : null))
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
    ...(Object.keys(dials).length ? { custom_shocks: dials, shock_month: monthOfFirstScenario() } : {}),
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

/** Mês em que o primeiro cenário agendado bate (a agenda vive nos dial-cards). */
function monthOfFirstScenario(): number {
  const first = fullSchedule.value[0]
  if (!first) return 12
  return Math.max(0, Math.min(119, (first.year - new Date().getFullYear()) * 12))
}

async function onFilmDone() {
  let r: SimResult
  try {
    r = await fetchResult()
  }
  catch {
    r = runMockSimulation(shocks.value, portfolio.value, lastSchedule.value)
    simExtra.value = null
    usingMock.value = true
  }
  result.value = r
  // correlação real em paralelo: não bloqueia o desenho do gráfico
  loadCorrelation()
  // checks macro nascem marcados nos indicadores TOCADOS na etapa 2
  macroChecked.value = new Set(buildMacroPaths(lastSchedule.value).filter((p) => p.touched).map((p) => p.key))
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
            <span class="sim__dots" aria-hidden="true"><i class="sim__dot sim__dot--on" /><i class="sim__dot" /></span>
            <h1 class="sim__title">{{ wizCopy.title }}</h1>
            <div class="sim__builder">
              <SimPortfolioBuilder v-model="portfolio" />
            </div>
            <div class="sim__wiz-nav">
              <button type="button" class="sim__run" :disabled="!canRun" @click="goShock">Continuar</button>
            </div>
          </div>

          <div v-else-if="phase === 'shock'" key="shock" class="sim__step">
            <span class="sim__dots" aria-hidden="true"><i class="sim__dot sim__dot--on" /><i class="sim__dot sim__dot--on" /></span>
            <h1 class="sim__title">{{ wizCopy.title }}</h1>
            <div class="sim__shockgrid">
              <SimShockPanel v-model="dials" v-model:years="dialYears" />
            </div>
            <div class="sim__wiz-nav">
              <button type="button" class="sim__back" @click="backToAssets">Voltar</button>
              <button type="button" class="sim__run" @click="run">Simular · 10 anos</button>
            </div>
          </div>

          <div v-else-if="phase === 'film'" key="film" class="sim__step sim__step--film">
            <SimFilm :steps="filmSteps" @done="onFilmDone" />
          </div>
        </Transition>
      </div>
      <p v-if="phase !== 'film'" class="sim__honest">Projeção estatística com premissas explícitas — não é previsão nem promessa de retorno.</p>
    </section>

    <!-- ============ RESULTADO (navy) ============ -->
    <section v-if="phase === 'result'" id="sim-resultado" class="sim__navy">
      <template v-if="result">
        <div class="sim__result-head">
          <div>
            <h2 class="sim__navy-title">Daqui a 10 anos, a mediana diz<br><span class="sim__counter">{{ fmtFull(finalP50) }}</span></h2>
            <!-- O rótulo de unidade só vale pro número do MOTOR. O mock é
                 nominal; carimbar "poder de compra" nele seria mentir sobre o
                 dado justamente na linha que existe pra ser honesta. -->
            <p v-if="!usingMock" class="sim__unit">em poder de compra de hoje</p>
            <p class="sim__range">entre <b class="sim__range-lo">{{ fmt(result.final.p10) }}</b> e <b class="sim__range-hi">{{ fmt(result.final.p90) }}</b></p>
            <!-- Proveniência: cenário da biblioteca foi estudado e tem fonte;
                 montado nos dials, não. E resultado de mock nunca pode passar
                 por número real numa tela que gera peça pra cliente. -->
            <p v-if="usingMock" class="sim__flag sim__flag--mock">Dados ilustrativos — o motor não respondeu</p>
            <p v-else-if="simExtra && !simExtra.calibrated" class="sim__flag">Cenário que você montou — sem precedente histórico calibrado</p>
          </div>
          <div class="sim__pills">
            <button v-if="!resultB" type="button" class="sim__pill sim__pill--whatif" @click="openWhatif">Testar realocação</button>
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
        <p v-if="anchorGap" class="sim__flag">As duas carteiras diferem {{ anchorGap }}% em tamanho — parte da diferença vem disso, não da realocação</p>
        <SimCompare v-if="resultB" :a="result" :b="resultB" @edit="openWhatif" @clear="clearWhatif" />

        <SimTimeline v-model:cursor="cursor" :months="HORIZON_MONTHS" :dates="display.dates" :events="result.events" />
      </template>
    </section>

    <!-- ============ LEITURA DA REDENTIA (azul, anatomia do "O dia no
         mercado" — pedido do dono, 25/08) ============ -->
    <section v-if="phase === 'result' && result" class="sim__blue">
      <div class="sim__blue-body">
        <p class="sim__blue-lead">{{ result.scenario.lead }}</p>
        <!-- eslint-disable-next-line vue/no-v-html — escapeHtml aplicado no computed -->
        <p class="sim__blue-text" v-html="readingHtml" />
      </div>
      <!-- entregável do assessor, no layout do "O dia no mercado" (dono 25/08) -->
      <div class="sim__blue-cta">
        <button type="button" class="sim__blue-btn" @click="summaryOpen = true">
          Gerar resumo<span class="sim__blue-btn-arrow" aria-hidden="true">→</span>
        </button>
        <button type="button" class="sim__blue-btn2" @click="printDoc">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3v5h5" /><path d="M19 8v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7Z" /><path d="M9 13h6M9 17h6" /></svg>
          Gerar PDF
        </button>
      </div>
    </section>

    <!-- ============ QUEM SANGRA, QUEM SEGURA (branco) ============ -->
    <section v-if="phase === 'result' && result" class="sim__band sim__band--white">
      <NuSectionHeading eyebrow="O cenário, posição a posição">
        Quem sangra,<br>quem segura.
        <template #dek>Impacto estimado do cenário em cada posição, pelo mapa de fatores da carteira — peso × sensibilidade.</template>
      </NuSectionHeading>
      <div class="sim__block sim__block--full">
        <SimPositionsImpact :positions="result.positions" :active="blocksIn" />
      </div>

      <!-- correlação + sobreposição (a Redentia já tem — aqui em mock coerente) -->
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
    </section>

    <!-- ============ ANO A ANO (creme) ============ -->
    <section v-if="phase === 'result' && result" class="sim__band sim__band--cream">
      <NuSectionHeading eyebrow="A década, ano a ano">
        Cada ano é uma faixa,<br>não um número.
        <template #dek>O honesto em 10 anos é o intervalo: a caixa é o espaço entre o pessimista e o otimista; o traço azul, a mediana.</template>
      </NuSectionHeading>
      <div class="sim__block sim__block--full">
        <SimAnnualBands :annual="result.annual" :active="blocksIn" />
      </div>

      <div class="sim__again">
        <button type="button" class="sim__again-btn" @click="reset">Fazer outra pergunta</button>
      </div>
    </section>

    <!-- o documento do "Gerar PDF" — invisível na tela, único visível no print -->
    <SimPrintDoc v-if="result && clientSummary" :result="result" :summary="clientSummary" />

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
              <button type="button" class="sims__copy" @click="copyBlock('wa', clientSummary.whatsapp)">{{ copiedKey === 'wa' ? 'Copiado ✓' : 'Copiar' }}</button>
            </div>
            <p class="sims__text">{{ clientSummary.whatsapp }}</p>
          </div>

          <div class="sims__block">
            <div class="sims__block-head">
              <span class="sims__block-label">E-mail</span>
              <button type="button" class="sims__copy" @click="copyBlock('mail', `${clientSummary.emailSubject}\n\n${clientSummary.emailBody}`)">{{ copiedKey === 'mail' ? 'Copiado ✓' : 'Copiar' }}</button>
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
            <button type="button" class="sim__back" @click="whatifOpen = false">Cancelar</button>
            <button type="button" class="sim__run" :disabled="!whatifDraft.some((p) => p.value > 0)" @click="applyWhatif">Comparar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.sim { background: var(--nu-white); }

/* ——— wizard (fundo e orb coreografados por fase) ——— */
.sim__wiz {
  position: relative; overflow: hidden;
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 84px) clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 76px);
  transition: background-color 0.9s ease;
  animation: nu-fade 0.5s ease both;
}
.sim__wiz--film {
  background: var(--nu-navy);
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
/* passo 2 (v3 do feedback, 25/08): orb maior, no corredor DIREITO, com o
   centro vertical alinhado ao centro dos dial-cards (~450px do topo da
   seção — px porque a altura da seção varia com o conteúdo abaixo) */
/* fundo frio claro (não branco, pedido do dono 25/08): mistura de dois
   tokens frios — os dial-cards navy saltam e a progressão de cor fica
   creme quente → azul frio → navy do filme */
.sim__wiz--shock { background: color-mix(in srgb, var(--nu-score-track) 76%, var(--nu-blue-soft) 24%); }
.sim__wiz--shock .sim__wiz-orb {
  left: 85%;
  top: 450px;
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
  color: var(--nu-cream-text); font-size: 26px; font-weight: 800; font-style: normal;
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
  /* v2: sobre o CENTRO do orb do passo 2 (left/top espelham a coreografia
     .sim__wiz--shock do orb, sem herdar o scale — texto em tamanho real) */
  position: absolute; z-index: 1; pointer-events: none;
  left: 85%;
  top: 450px;
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
.sim__wiz-nav { margin-top: 24px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
/* sólido branco (dono 25/08: "igual ao gerar resumo") — o outline sumia
   no fundo azul-gelo do passo 2 */
.sim__back {
  border: none; border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-ink);
  padding: 14px 24px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background 0.15s, transform 0.15s;
}
.sim__back:hover { background: var(--nu-cream); transform: translateY(-1px); }
.sim__shockgrid { max-width: 880px; }

@media (max-width: 1080px) { .sim__wiz-orb { opacity: 0.3; } .sim__wiz--film .sim__wiz-orb { opacity: 1; } }
.sim__dots { display: inline-flex; gap: 7px; }
.sim__dot {
  width: 9px; height: 9px; border-radius: 999px;
  background: var(--nu-cream-3); transition: background 0.3s ease;
}
.sim__dot--on { background: var(--nu-blue); }
.sim__title {
  margin: 12px 0 22px; color: var(--nu-ink);
  font-size: clamp(34px, 4.2vw, 54px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.sim__honest { margin: 14px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* builder + passo dos choques */
.sim__builder { position: relative; }
.sim__run {
  border: none; border-radius: var(--nu-r-pill);
  background: var(--nu-ink); color: var(--nu-white);
  padding: 15px 30px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: transform 0.15s, background 0.2s;
}
.sim__run:hover { transform: translateY(-2px); }
.sim__run:disabled { opacity: 0.45; cursor: default; transform: none; }

/* ——— navy ——— */
.sim__navy {
  background: var(--nu-navy);
  padding: clamp(48px, 6.5vw, 84px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 90px);
}
.sim__result-head { display: flex; justify-content: space-between; gap: 26px; flex-wrap: wrap; align-items: flex-start; }
.sim__navy-title {
  margin: 10px 0 0; color: var(--nu-cream-text);
  font-size: clamp(28px, 3.4vw, 42px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
}
.sim__counter { color: var(--nu-blue-soft); font-variant-numeric: tabular-nums; }
.sim__unit {
  margin: 6px 0 0; font-size: 14px; font-weight: 600;
  color: var(--nu-cream-text-70); letter-spacing: -0.01em;
}
.sim__flag {
  margin: 12px 0 0; display: inline-flex; align-items: center;
  font-size: 12.5px; font-weight: 700; letter-spacing: 0.01em;
  padding: 6px 13px; border-radius: var(--nu-r-pill);
  background: var(--nu-blue-soft-35); color: var(--nu-cream-text);
}
.sim__flag--mock { background: rgba(255, 179, 184, 0.28); }

.sim__range { margin: 14px 0 0; color: var(--nu-cream-text-70); font-size: 15px; font-weight: 600; max-width: 560px; }
.sim__range b { font-variant-numeric: tabular-nums; }
.sim__range-lo { color: var(--nu-red-soft); }
.sim__range-hi { color: var(--nu-green-soft); }
.sim__pills { display: flex; gap: 8px; flex-wrap: wrap; }
.sim__pill {
  border: 1.5px solid var(--nu-cream-text-12); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-cream-text-70);
  padding: 9px 16px; font-size: 13.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.sim__pill:hover { border-color: var(--nu-blue-soft); color: var(--nu-cream-text); }
.sim__pill--on { background: var(--nu-blue-soft); border-color: var(--nu-blue-soft); color: var(--nu-navy); }
.sim__chart { margin-top: 38px; height: clamp(300px, 42vw, 400px); }
.sim__chart-legend { margin-top: 14px; display: flex; gap: 20px; flex-wrap: wrap; color: var(--nu-cream-text-55); font-size: 12.5px; font-weight: 600; }
.sim__chart-legend span { display: inline-flex; align-items: center; gap: 7px; }
.sim__leg { width: 14px; height: 4px; border-radius: 999px; }
.sim__leg--band { background: var(--nu-blue-soft-35); height: 10px; }
.sim__leg--p50 { background: var(--nu-blue-soft); }
.sim__leg--b { background: var(--nu-amber); }
.sim__leg--ev { background: var(--nu-amber); width: 4px; height: 12px; }

/* checks das trajetórias macro na legenda */
.sim__leg-check {
  display: inline-flex; align-items: center; gap: 7px;
  border: 1.5px solid var(--nu-cream-text-12); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-cream-text-55);
  padding: 6px 12px; font-size: 12px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: color 0.15s, border-color 0.15s;
}
.sim__leg-check--on { color: var(--nu-cream-text); border-color: var(--nu-cream-text-22); }
.sim__leg-check:hover { border-color: var(--nu-cream-text-45); }
.sim__leg-dot { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid; transition: background 0.15s; }

/* pill de abrir o what-if — outline amber pra casar com a linha B */
.sim__pill--whatif { border-color: var(--nu-amber); color: var(--nu-amber); }
.sim__pill--whatif:hover { background: var(--nu-amber); color: var(--nu-navy); }

/* modal do what-if (anatomia da casa: scrim + card dia, largura do builder) */
.simw {
  position: fixed; inset: 0; z-index: 120;
  display: flex; align-items: flex-start; justify-content: center;
  padding: clamp(18px, 6vh, 64px) 18px 18px;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: nu-fade 0.22s ease both;
}
.simw__card {
  width: min(940px, 100%); max-height: calc(100dvh - 36px); overflow-y: auto;
  background: var(--nu-cream); border-radius: var(--nu-r-card-lg);
  padding: 26px 28px 22px; box-shadow: var(--nu-shadow-day-modal);
  outline: none; animation: nu-fade 0.28s ease both;
}
.simw__head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.simw__title { color: var(--nu-ink); font-size: 21px; font-weight: 800; letter-spacing: -0.02em; }
.simw__close {
  width: 36px; height: 36px; flex-shrink: 0; border: none; border-radius: 50%;
  background: var(--nu-white); color: var(--nu-ink); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.simw__close:hover { background: var(--nu-cream-hover); }
.simw__sub { margin: 4px 0 16px; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.simw__foot { margin-top: 18px; display: flex; justify-content: flex-end; gap: 10px; }
.simw__card--summary { width: min(640px, 100%); }

/* botões do entregável na banda azul — anatomia dos CTAs do "O dia no
   mercado" (NuDaySection): pill creme sólida com seta + pill ghost com ícone */
.sim__blue-cta { display: flex; justify-content: center; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: clamp(36px, 4vw, 44px); }
.sim__blue-btn {
  display: inline-flex; align-items: center; gap: 11px; background: var(--nu-cream); color: var(--nu-day-btn-ink);
  border: none; border-radius: var(--nu-r-pill); padding: 18px 32px; font-size: 17px; font-weight: 800;
  letter-spacing: -0.01em; cursor: pointer; font-family: inherit; transition: transform 0.15s ease, background 0.15s ease;
}
.sim__blue-btn:hover { background: var(--nu-white); transform: translateY(-1px); }
.sim__blue-btn-arrow { font-size: 19px; line-height: 1; }
.sim__blue-btn2 {
  display: inline-flex; align-items: center; gap: 9px;
  background: transparent; color: var(--nu-cream-text); border: 1.5px solid var(--nu-cream-text-22);
  border-radius: var(--nu-r-pill); padding: 17px 26px; font-size: 15.5px; font-weight: 800;
  cursor: pointer; font-family: inherit; transition: background 0.15s, border-color 0.15s;
}
.sim__blue-btn2:hover { background: var(--nu-cream-text-12); border-color: var(--nu-cream-text-45); }

/* blocos do resumo */
.sims__block { margin-top: 18px; background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 16px 18px; }
.sims__block-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
.sims__block-label { color: var(--nu-gray); font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.sims__copy {
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-blue);
  padding: 7px 14px; font-size: 12.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.sims__copy:hover { border-color: var(--nu-blue); background: var(--nu-blue-tint-2); }
.sims__subject { margin: 0 0 6px; color: var(--nu-ink); font-size: 14px; font-weight: 800; }
.sims__text { margin: 0; color: var(--nu-gray-3); font-size: 14px; font-weight: 500; line-height: 1.65; }
.sims__footer { margin: 16px 2px 0; color: var(--nu-gray); font-size: 11.5px; font-weight: 600; line-height: 1.55; }

/* ——— GERAR PDF: no print, só o documento existe ——— */
@media print {
  :global(body *) { visibility: hidden; }
  :global(.spd), :global(.spd *) { visibility: visible; }
  :global(.spd) { position: absolute; left: 0; top: 0; width: 100%; }
}

/* ——— leitura da Redentia: banda AZUL, anatomia do "O dia no mercado" ——— */
.sim__blue {
  background: var(--nu-blue);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade 0.5s ease both;
}
.sim__blue-body { max-width: 860px; margin: 0 auto; }
.sim__blue-lead {
  margin: 0; color: var(--nu-cream-text); text-align: center;
  font-size: clamp(22px, 2.6vw, 31px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.14;
}
.sim__blue-text {
  margin: 20px auto 0; color: var(--nu-cream-text-78);
  font-size: 17px; font-weight: 500; line-height: 1.7; max-width: 780px;
}
.sim__blue-text :deep(.sim__mark) {
  background: var(--nu-cream-text-12); color: var(--nu-white);
  border-radius: 6px; padding: 1px 6px; font-weight: 700;
}
/* ——— bandas claras ——— */
.sim__band { padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); animation: nu-fade 0.5s ease both; }
.sim__subsection { margin-top: clamp(64px, 8vw, 104px); }
.sim__band--white { background: var(--nu-white); }
.sim__band--cream { background: var(--nu-cream); }
.sim__block { margin-top: 38px; max-width: 900px; }
.sim__block--full { max-width: none; }
/* respiro entre sub-seções da mesma banda (a legenda das faixas colava no
   eyebrow "Como a conta é feita" — feedback do dono) */
.sim__again { margin-top: 54px; }
.sim__again-btn {
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-blue);
  padding: 14px 28px; font-size: 15.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background 0.2s;
}
.sim__again-btn:hover { background: var(--nu-blue-tint-2); }

@media (max-width: 760px) {
  .sim__ask { flex-direction: column; border-radius: var(--nu-r-card); padding: 12px; }
  .sim__input { padding: 8px 6px; }
  .sim__chart { height: 300px; }
}
</style>
