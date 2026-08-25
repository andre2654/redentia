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
  shocksFromDials, dialsFromShocks, DIAL_DEFAULTS, HORIZON_MONTHS,
  type SimResult, type SimSeries, type SimPortfolioInput, type SimShocks, type SimDials,
} from '~/components/sim/simMock'

definePageMeta({ layout: 'default' })
usePageSeo({
  title: 'Simulação — o futuro da sua carteira',
  description: 'Simule cenários de 10 anos: eleições, bolhas, choques de juros. Protótipo.',
  path: '/simulacao',
  noindex: true,
})

// WIZARD (dono, 25/08): carteira → choque → simulando → resultado, com o orb
// persistente mudando de posição e o fundo cream→navy na transição — a cena
// "Simulando" da referência é a fase film (orb central grande com a palavra).
type Phase = 'assets' | 'shock' | 'film' | 'result'
const phase = ref<Phase>('assets')
// a carteira MONTADA (pivô 24/08: concreto > texto abstrato)
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
    hasShocks.value ? `Aplicando o choque: ${shocksTitle(shocks.value).toLowerCase()}` : 'Sem choque — compondo o caminho base',
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

// copy mínima (pedido do dono, 25/08: "tão intuitivo que não precise ler")
const WIZ_COPY: Record<string, { title: string }> = {
  assets: { title: 'Monte a carteira.' },
  shock: { title: 'Desenhe o choque.' },
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
  phase.value = 'film'
  blocksIn.value = false
  window.scrollTo({ top: 0, behavior: reduceMotion.value ? 'auto' : 'smooth' })
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
  dials.value = dialsFromShocks(next)
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
              <SimShockPanel v-model="dials" />
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
.sim__back {
  border: 1.5px solid var(--nu-cream-2); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-gray-2);
  padding: 13px 22px; font-size: 14px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}
.sim__back:hover { border-color: var(--nu-ink); color: var(--nu-ink); }
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
