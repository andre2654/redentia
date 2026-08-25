<script setup lang="ts">
// ============================================================================
// PROTÓTIPO /simulacao — Redentia Simulação (avaliação de UX/UI do dono).
//
// TUDO AQUI É MOCK: dados ilustrativos de simMock.ts, interpretador por
// palavra-chave, nenhum fetch. O plano real (aprovado 24/08) troca as peças:
// interpretador → chat-service (gpt-4o-mini) · motor → Laravel
// ScenarioEngineService (MC mensal índice+beta) · biblioteca → tabela
// simulation_scenarios + rotina semanal · auth gate (padrão carteira.vue).
//
// EXCEÇÃO DE MOVIMENTO SANCIONADA PELO DONO: esta rota usa GSAP (lazy,
// só aqui) e quebra a política "entrada única" do DS §9 — morph entre
// séries, contadores e stagger fazem parte do produto desta tela.
// ============================================================================
import {
  runMockSimulation, fmtBRL, fmtBRLFull, QUICK_COMBOS, shocksKey, shocksTitle,
  HORIZON_MONTHS, type SimResult, type SimSeries, type SimPortfolioInput, type SimShocks,
} from '~/components/sim/simMock'

definePageMeta({ layout: 'default' })
usePageSeo({
  title: 'Simulação — o futuro da sua carteira',
  description: 'Simule cenários de 10 anos: eleições, bolhas, choques de juros. Protótipo.',
  path: '/simulacao',
  noindex: true,
})

type Phase = 'build' | 'film' | 'result'
const phase = ref<Phase>('build')
// a carteira MONTADA (pivô 24/08: concreto > texto abstrato)
const portfolio = ref<SimPortfolioInput[]>([])
// os CHOQUES desenhados pelo assessor (pivô 25/08: dólar/Selic/bolsa/petróleo)
const shocks = ref<SimShocks>({})
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
    hasShocks.value ? `Aplicando o choque: ${shocksTitle(shocks.value).toLowerCase()}` : 'Sem choque — compondo o caminho base',
  ]
})
// pills do resultado: os combos rápidos + o choque customizado atual
const morphCombos = computed(() => {
  const current = result.value?.shocks ?? shocks.value
  const currentKey = shocksKey(current)
  const inCombos = QUICK_COMBOS.some((c) => shocksKey(c.shocks) === currentKey)
  return inCombos ? QUICK_COMBOS : [{ label: 'Seu choque', shocks: current }, ...QUICK_COMBOS]
})

// ——— GSAP lazy (só esta rota paga o bundle) ———
let gsap: typeof import('gsap').gsap | null = null
const reduceMotion = ref(false)
onMounted(async () => {
  reduceMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const mod = await import('gsap')
  gsap = mod.gsap
})

function run() {
  if (!canRun.value) return
  phase.value = 'film'
  blocksIn.value = false
}

const finalP50 = ref(0)
function onFilmDone() {
  const r = runMockSimulation(shocks.value, portfolio.value)
  result.value = r
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

/** troca de choque no resultado = MORPH da curva, nunca redesenho seco */
function morphTo(next: SimShocks) {
  if (!result.value || shocksKey(next) === shocksKey(result.value.shocks)) return
  shocks.value = next
  const target = runMockSimulation(next, portfolio.value)
  result.value = target
  animateCounter(target.final.p50, 1.1)
  // re-dispara os staggers dos blocos
  blocksIn.value = false
  setTimeout(() => { blocksIn.value = true }, 60)
  if (!gsap || reduceMotion.value) {
    Object.assign(display, JSON.parse(JSON.stringify(target.series)))
    return
  }
  const from = { p10: [...display.p10], p50: [...display.p50], p90: [...display.p90], baseline: [...display.baseline] }
  const to = target.series
  display.dates = to.dates
  display.sample = to.sample
  const state = { t: 0 }
  gsap.to(state, {
    t: 1, duration: 1.15, ease: 'power2.inOut',
    onUpdate: () => {
      const t = state.t
      for (const k of ['p10', 'p50', 'p90', 'baseline'] as const) {
        display[k] = from[k].map((v, i) => v + ((to[k][i] ?? v) - v) * t)
      }
    },
  })
}

function reset() {
  // volta pro builder MANTENDO a carteira montada (re-simular é o caso comum)
  phase.value = 'build'
  result.value = null
  cursor.value = null
  finalP50.value = 0
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
    <!-- ============ HERO-PERGUNTA (creme) — o único bloco do SSR ============ -->
    <section class="sim__hero">
      <div class="sim__hero-orb"><SimOrb :state="phase === 'film' ? 'thinking' : 'idle'" :size="360" /></div>
      <span class="sim__proto">Protótipo · dados ilustrativos</span>
      <p class="sim__eyebrow">Redentia Simulação</p>
      <h1 class="sim__title">Monte a carteira.<br>Pergunte ao futuro.</h1>
      <p class="sim__dek">Escolha os ativos, defina os valores e teste a década contra eleições, bolhas e choques de juros.</p>

      <!-- passo 1: o montador -->
      <div class="sim__builder">
        <SimPortfolioBuilder v-model="portfolio" />
      </div>

      <!-- passo 2: os choques (o assessor desenha; o motor propaga por regra) -->
      <div class="sim__scenario-step" :class="{ 'sim__scenario-step--off': !canRun }">
        <p class="sim__echo-lead">{{ canRun ? 'Agora, desenhe o choque — e se…' : 'Monte a carteira acima pra desenhar o choque.' }}</p>
        <fieldset class="sim__shocks" :disabled="!canRun">
          <SimShockPanel v-model="shocks" />
        </fieldset>
        <button type="button" class="sim__run" :disabled="!canRun || phase === 'film'" @click="run">Rodar a simulação · 10 anos</button>
      </div>
      <p class="sim__honest">Projeção estatística com premissas explícitas — não é previsão nem promessa de retorno.</p>
    </section>

    <!-- ============ FILME + RESULTADO (navy) ============ -->
    <section v-if="phase === 'film' || phase === 'result'" id="sim-resultado" class="sim__navy">
      <SimFilm v-if="phase === 'film'" :steps="filmSteps" @done="onFilmDone" />

      <template v-else-if="result">
        <div class="sim__result-head">
          <div>
            <p class="sim__navy-eyebrow">{{ result.scenario.title }}</p>
            <h2 class="sim__navy-title">Daqui a 10 anos, a mediana diz<br><span class="sim__counter">{{ fmtFull(finalP50) }}</span></h2>
            <p class="sim__range">entre <b class="sim__range-lo">{{ fmt(result.final.p10) }}</b> (pessimista) e <b class="sim__range-hi">{{ fmt(result.final.p90) }}</b> (otimista) — a faixa é o dado; a mediana é só o meio dela.</p>
          </div>
          <div class="sim__pills">
            <button
              v-for="c in morphCombos" :key="c.label" type="button"
              class="sim__pill" :class="{ 'sim__pill--on': shocksKey(c.shocks) === shocksKey(result.shocks) }"
              @click="morphTo(c.shocks)"
            >{{ c.label }}</button>
          </div>
        </div>

        <div class="sim__chart">
          <SimFanChart v-model:cursor="cursor" :series="display" :events="result.events" :drawing="drawing" />
        </div>
        <div class="sim__chart-legend">
          <span><i class="sim__leg sim__leg--band" />faixa p10–p90</span>
          <span><i class="sim__leg sim__leg--p50" />mediana do cenário</span>
          <span><i class="sim__leg sim__leg--base" />caminho sem choque</span>
          <span><i class="sim__leg sim__leg--ev" />ruptura</span>
        </div>

        <SimTimeline v-model:cursor="cursor" :months="HORIZON_MONTHS" :dates="display.dates" :events="result.events" />

        <!-- a leitura editorial, anatomia do briefing: selo + manchete grande +
             corpo com {mark} destacado + precedentes em chips (v3, feedback do
             dono — parágrafo solto não tem presença) -->
        <div class="sim__reading">
          <div class="sim__reading-head">
            <span class="sim__reading-badge"><img src="/logo-branca.svg" alt="" class="sim__reading-logo"></span>
            <span class="sim__reading-label">Leitura da Redentia</span>
            <span class="sim__reading-date">regras do motor abertas abaixo · dados de 24/08/2026</span>
          </div>
          <p class="sim__reading-lead">{{ result.scenario.lead }}</p>
          <!-- eslint-disable-next-line vue/no-v-html — escapeHtml aplicado no computed -->
          <p class="sim__reading-text" v-html="readingHtml" />
          <div class="sim__reading-sources">
            <span v-for="s in result.scenario.sources" :key="s" class="sim__reading-src">{{ s }}</span>
          </div>
        </div>
      </template>
    </section>

    <!-- ============ QUEM SANGRA, QUEM SEGURA (branco) ============ -->
    <section v-if="phase === 'result' && result" class="sim__band sim__band--white">
      <NuSectionHeading eyebrow="O choque, posição a posição">
        Quem sangra,<br>quem segura.
        <template #dek>Impacto estimado do cenário em cada posição, pelo mapa de fatores da carteira — peso × sensibilidade.</template>
      </NuSectionHeading>
      <div class="sim__block sim__block--full">
        <SimPositionsImpact :positions="result.positions" :active="blocksIn" />
      </div>
    </section>

    <!-- ============ ANO A ANO + PREMISSAS (creme) ============ -->
    <section v-if="phase === 'result' && result" class="sim__band sim__band--cream">
      <NuSectionHeading eyebrow="A década, ano a ano">
        Cada ano é uma faixa,<br>não um número.
        <template #dek>O honesto em 10 anos é o intervalo: a caixa é o espaço entre o pessimista e o otimista; o traço azul, a mediana.</template>
      </NuSectionHeading>
      <div class="sim__block sim__block--full">
        <SimAnnualBands :annual="result.annual" :active="blocksIn" />
      </div>

      <div class="sim__subsection">
        <NuSectionHeading eyebrow="Como a conta é feita">
          As premissas,<br>abertas.
        </NuSectionHeading>
      </div>
      <div class="sim__block">
        <SimAssumptions :assumptions="result.assumptions" />
      </div>

      <div class="sim__again">
        <button type="button" class="sim__again-btn" @click="reset">Fazer outra pergunta</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sim { background: var(--nu-white); }

/* ——— hero ——— */
.sim__hero {
  position: relative; overflow: hidden;
  background: var(--nu-cream);
  padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px) clamp(60px, 8vw, 100px);
  animation: nu-fade 0.5s ease both;
}
.sim__hero-orb {
  /* junto do título (o hero cresceu com o builder — no meio ele sumia) */
  position: absolute; right: clamp(-60px, 2vw, 90px); top: clamp(40px, 5vw, 76px);
  pointer-events: none;
}
.sim__hero > *:not(.sim__hero-orb) { position: relative; }
@media (max-width: 1080px) { .sim__hero-orb { opacity: 0.35; right: -140px; } }
.sim__proto {
  display: inline-flex; padding: 6px 13px; border-radius: var(--nu-r-pill);
  background: var(--nu-sand-2); color: var(--nu-gray-2);
  font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
}
.sim__eyebrow { margin: 22px 0 0; color: var(--nu-blue); font-size: 13px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
.sim__title {
  margin: 10px 0 0; color: var(--nu-ink);
  font-size: clamp(38px, 4.8vw, 62px); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.sim__dek { margin: 16px 0 0; max-width: 560px; color: var(--nu-gray-2); font-size: 17px; font-weight: 500; line-height: 1.5; }
.sim__ask {
  margin-top: 30px; display: flex; gap: 10px; max-width: 720px;
  background: var(--nu-white); border-radius: var(--nu-r-pill); padding: 8px 8px 8px 24px;
  box-shadow: var(--nu-shadow-card);
}
.sim__input {
  flex: 1; min-width: 0; border: none; background: transparent; outline: none;
  color: var(--nu-ink); font-size: 16.5px; font-weight: 600; font-family: inherit;
}
.sim__input::placeholder { color: var(--nu-sand); }
.sim__go {
  border: none; border-radius: var(--nu-r-pill); background: var(--nu-blue); color: var(--nu-white);
  padding: 13px 26px; font-size: 15.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: background 0.2s;
}
.sim__go:hover { background: var(--nu-blue-hover); }
.sim__go:disabled { opacity: 0.5; cursor: default; }
.sim__examples { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; max-width: 760px; }
.sim__example {
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-gray-2);
  padding: 9px 16px; font-size: 13.5px; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, color 0.15s, transform 0.15s;
}
.sim__example:hover { border-color: var(--nu-blue); color: var(--nu-blue); transform: translateY(-1px); }
.sim__honest { margin: 14px 0 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }

/* builder + passo dos choques */
.sim__builder { margin-top: 30px; position: relative; }
.sim__scenario-step { margin-top: 30px; transition: opacity 0.3s ease; }
.sim__scenario-step--off { opacity: 0.45; }
.sim__shocks { border: none; padding: 0; margin: 0; min-width: 0; }
.sim__run { margin-top: 20px; }
.sim__echo-lead { margin: 0 0 10px; color: var(--nu-gray-2); font-size: 14px; font-weight: 700; }
.sim__echo-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.sim__chip {
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: var(--nu-white); color: var(--nu-ink);
  padding: 10px 17px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.sim__chip--fixed { background: var(--nu-blue-tint); color: var(--nu-blue); border-color: transparent; cursor: default; }
.sim__chip--on { background: var(--nu-ink); color: var(--nu-white); border-color: var(--nu-ink); }
.sim__run {
  margin-top: 18px; border: none; border-radius: var(--nu-r-pill);
  background: var(--nu-ink); color: var(--nu-white);
  padding: 15px 30px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: transform 0.15s, background 0.2s;
}
.sim__run:hover { transform: translateY(-2px); }
.sim__run:disabled { opacity: 0.45; cursor: default; transform: none; }
.sim__chip:disabled { cursor: default; }

/* ——— navy ——— */
.sim__navy {
  background: var(--nu-navy);
  padding: clamp(48px, 6.5vw, 84px) clamp(22px, 5.5vw, 80px) clamp(56px, 7vw, 90px);
}
.sim__result-head { display: flex; justify-content: space-between; gap: 26px; flex-wrap: wrap; align-items: flex-start; }
.sim__navy-eyebrow { margin: 0; color: var(--nu-blue-soft); font-size: 13px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
.sim__navy-title {
  margin: 10px 0 0; color: var(--nu-cream-text);
  font-size: clamp(28px, 3.4vw, 42px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.08;
}
.sim__counter { color: var(--nu-blue-soft); font-variant-numeric: tabular-nums; }
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
/* a leitura editorial: card navy-2, anatomia do briefing */
.sim__reading {
  margin-top: 52px;
  background: var(--nu-navy-2); border-radius: var(--nu-r-panel);
  padding: clamp(26px, 3vw, 40px) clamp(24px, 3.2vw, 44px);
  max-width: 980px;
}
.sim__reading-head { display: flex; align-items: center; gap: 11px; flex-wrap: wrap; }
.sim__reading-badge {
  width: 30px; height: 30px; border-radius: 9px; background: var(--nu-blue);
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.sim__reading-logo { width: 16px; height: 16px; display: block; }
.sim__reading-label {
  color: var(--nu-blue-soft); font-size: 12.5px; font-weight: 800;
  letter-spacing: 0.09em; text-transform: uppercase;
}
.sim__reading-date { color: var(--nu-cream-text-45); font-size: 12.5px; font-weight: 700; }
.sim__reading-lead {
  margin: 20px 0 0; color: var(--nu-cream-text);
  font-size: clamp(22px, 2.6vw, 31px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.12;
}
.sim__reading-text {
  margin: 16px 0 0; color: var(--nu-cream-text-75);
  font-size: 16.5px; font-weight: 500; line-height: 1.7; max-width: 820px;
}
.sim__reading-text :deep(.sim__mark) {
  background: var(--nu-blue-soft-35); color: var(--nu-cream-text);
  border-radius: 6px; padding: 1px 6px; font-weight: 700;
}
.sim__reading-sources { margin-top: 22px; display: flex; gap: 8px; flex-wrap: wrap; }
.sim__reading-src {
  display: inline-flex; padding: 7px 14px; border-radius: var(--nu-r-pill);
  background: var(--nu-navy-3); color: var(--nu-cream-text-70);
  font-size: 12.5px; font-weight: 700;
}
.sim__leg { width: 14px; height: 4px; border-radius: 999px; }
.sim__leg--band { background: var(--nu-blue-soft-35); height: 10px; }
.sim__leg--p50 { background: var(--nu-blue-soft); }
.sim__leg--base { background: var(--nu-cream-text-45); }
.sim__leg--ev { background: var(--nu-amber); width: 4px; height: 12px; }

/* ——— bandas claras ——— */
.sim__band { padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); animation: nu-fade 0.5s ease both; }
.sim__band--white { background: var(--nu-white); }
.sim__band--cream { background: var(--nu-cream); }
.sim__block { margin-top: 38px; max-width: 900px; }
.sim__block--full { max-width: none; }
/* respiro entre sub-seções da mesma banda (a legenda das faixas colava no
   eyebrow "Como a conta é feita" — feedback do dono) */
.sim__subsection { margin-top: clamp(64px, 8vw, 104px); }
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
