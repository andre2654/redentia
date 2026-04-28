<script setup lang="ts">
/**
 * ShowcaseLanding — public landing for /help when the user isn't
 * authenticated. The previous version was a static hero card with
 * showcase chips. This redesign positions the page as a SHOWCASE of
 * the actual chat product:
 *
 *   1. Hero with live typewriter demo — a real question types itself,
 *      then a streaming-style answer appears below with simulated
 *      tool chips, ticker pills, and a propose_action chip — exactly
 *      what the authenticated user gets.
 *   2. "Como funciona" — 3 stages with iconography that match the
 *      real chat flow (Pergunta → Pesquisa → Ação).
 *   3. Rotating example carousel — three real questions from typical
 *      flows, swapping every 5s. Each one shows a snippet of the
 *      kind of answer Redentia produces (numbers, citations, chips).
 *   4. Diferenciais — three pillar cards (dado real, ferramentas
 *      visíveis, ação clicável).
 *   5. Final CTA — gradient button + reassurance line.
 *
 * Animations are kept smooth and short (no autoplay tricks). All
 * decorative visuals are aria-hidden; the CTA is the only actionable
 * element. We respect prefers-reduced-motion: if set, animations
 * become instant transitions.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  ctaLabel?: string
}>()

const emit = defineEmits<{
  (e: 'start'): void
}>()

const brand = useBrand()

// ------------------------------------------------------------------
// Reduced-motion guard. Used by the typewriter to skip the per-char
// loop and render the full string immediately.
// ------------------------------------------------------------------
const prefersReducedMotion = ref(false)
let motionMql: MediaQueryList | null = null
function onMotionChange() {
  if (motionMql) prefersReducedMotion.value = motionMql.matches
}

// ------------------------------------------------------------------
// Live typewriter demo — drives the hero question + answer.
// Cycles through a small playlist of question/response pairs so a
// visitor who lingers sees different examples without us reloading.
// ------------------------------------------------------------------
interface DemoStep {
  question: string
  /** Lines of the streamed answer. Rendered as separate <p> blocks. */
  answer: string[]
  /** Tool calls shown in the audit panel (for the visual). */
  tools: { icon: string; label: string }[]
  /** Optional ticker chip + price to render inline in the answer. */
  ticker?: { symbol: string; price: string; delta: string; positive: boolean }
  /** Final propose_action chip label. */
  proposeLabel?: string
}

const demos: DemoStep[] = [
  {
    question: 'tô de olho em BBSE3 com a queda recente',
    answer: [
      'BBSE3 está em R$ 34,27 (−1,8% mês). A "queda recente" reflete o rebaixamento do BBA — não há ruptura de tese.',
      'Suporte técnico em R$ 32 (média 200d). DY de 13,3% segue acima da média do setor.',
      'Tese de renda intacta — preço perto do seu custo médio. Faz sentido {{propose}} pra te avisar se romper R$ 32.',
    ],
    tools: [
      { icon: 'i-lucide-search', label: 'view_asset · BBSE3' },
      { icon: 'i-lucide-bar-chart-3', label: 'technical_analysis · BBSE3' },
      { icon: 'i-lucide-newspaper', label: 'search_news · BBSE3' },
    ],
    ticker: { symbol: 'BBSE3', price: 'R$ 34,27', delta: '−1,8%', positive: false },
    proposeLabel: 'Ativar Watchlist',
  },
  {
    question: 'avalie minha carteira',
    answer: [
      'Carteira diagnosticada: 35 posições, R$ 703k. Concentração em ações BR (35,7% vs alvo 20%).',
      'CAGR realista da carteira: 12,8% a.a. Sua meta exige 14,2% — viável com tilt agressivo.',
      'Stress test (queda 30% IBOV): −R$ 87k. Meta vira at_risk. {{propose}} pra simular cenários adversos.',
    ],
    tools: [
      { icon: 'i-lucide-search', label: 'view_asset · 13 tickers' },
      { icon: 'i-lucide-globe', label: 'macro_snapshot' },
      { icon: 'i-lucide-calculator', label: 'portfolio_expected_return' },
    ],
    proposeLabel: 'Simular Cenário',
  },
  {
    question: 'vale a pena comprar BTC agora?',
    answer: [
      'BTC: R$ 383.884 (−1,8% hoje). Rali de +14% desde março, fluxo institucional positivo via ETFs.',
      'Sua meta de R$ 1M em 8 meses exige 59% a.a. — matematicamente inviável só com BTC.',
      'Comprar BTC adiciona volatilidade ao gap. {{propose}} pra ver o impacto na sua meta atual.',
    ],
    tools: [
      { icon: 'i-lucide-search', label: 'view_asset · BTC' },
      { icon: 'i-lucide-bar-chart-3', label: 'technical_analysis · BTC' },
      { icon: 'i-lucide-globe', label: 'web_search · tese BTC' },
    ],
    ticker: { symbol: 'BTC', price: 'R$ 383.884', delta: '−1,8%', positive: false },
    proposeLabel: 'Simular Cenário',
  },
]

const demoIndex = ref(0)
const currentDemo = computed(() => demos[demoIndex.value]!)

// Typewriter state for the question.
const typedQuestion = ref('')
const typedQuestionDone = ref(false)
// Whether each answer paragraph has fully appeared yet.
const visibleAnswerLines = ref<number>(0)
// When all paragraphs are out, show the propose chip.
const showProposeChip = ref(false)

let timerId: ReturnType<typeof setTimeout> | null = null
function clearTimer() {
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }
}

async function runDemo(idx: number): Promise<void> {
  clearTimer()
  const demo = demos[idx]
  if (!demo) return

  // Reset state.
  typedQuestion.value = ''
  typedQuestionDone.value = false
  visibleAnswerLines.value = 0
  showProposeChip.value = false

  if (prefersReducedMotion.value) {
    typedQuestion.value = demo.question
    typedQuestionDone.value = true
    visibleAnswerLines.value = demo.answer.length
    showProposeChip.value = !!demo.proposeLabel
    return
  }

  // Type the question, char by char (~28ms cadence — fast enough to
  // not feel sluggish, slow enough to read).
  await new Promise<void>((resolve) => {
    let i = 0
    const tick = () => {
      i++
      typedQuestion.value = demo.question.slice(0, i)
      if (i >= demo.question.length) {
        typedQuestionDone.value = true
        resolve()
        return
      }
      timerId = setTimeout(tick, 28)
    }
    tick()
  })

  // Brief pause — feels like the agent "thinking".
  await new Promise<void>((resolve) => {
    timerId = setTimeout(resolve, 450)
  })

  // Reveal answer paragraphs one at a time.
  for (let i = 0; i < demo.answer.length; i++) {
    await new Promise<void>((resolve) => {
      timerId = setTimeout(() => {
        visibleAnswerLines.value = i + 1
        resolve()
      }, 700)
    })
  }

  // Reveal the propose chip after the last paragraph.
  if (demo.proposeLabel) {
    await new Promise<void>((resolve) => {
      timerId = setTimeout(() => {
        showProposeChip.value = true
        resolve()
      }, 350)
    })
  }
}

let cycleId: ReturnType<typeof setTimeout> | null = null
function scheduleCycle() {
  if (cycleId) clearTimeout(cycleId)
  // Hold the finished demo on screen for ~3.5s, then move on.
  cycleId = setTimeout(() => {
    demoIndex.value = (demoIndex.value + 1) % demos.length
    void runDemo(demoIndex.value).then(scheduleCycle)
  }, 3500)
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = motionMql.matches
    motionMql.addEventListener('change', onMotionChange)
  }
  void runDemo(demoIndex.value).then(scheduleCycle)
})

onBeforeUnmount(() => {
  clearTimer()
  if (cycleId) clearTimeout(cycleId)
  if (motionMql) motionMql.removeEventListener('change', onMotionChange)
})

// Click handler — kicks the parent into the login redirect.
function onCta() {
  emit('start')
}

// "Como funciona" steps — extracted to script setup so the v-for in
// the template doesn't have to host a multi-line literal (Vue's
// attribute parser chokes on string boundaries inside quoted attrs).
interface Step {
  num: string
  title: string
  desc: string
  icon: string
}
const stages: Step[] = [
  {
    num: '01',
    title: 'Pergunte naturalmente',
    desc: 'PT-BR informal — "tô de olho em PETR4", "vale a pena BBSE3?", "minha carteira tá ok?". Sem comandos especiais.',
    icon: 'i-lucide-message-circle',
  },
  {
    num: '02',
    title: 'Vê o pensamento',
    desc: 'Tools rodando em paralelo: preço atual, fundamentos, técnica, notícias, macro. Cada chamada visível no painel.',
    icon: 'i-lucide-search',
  },
  {
    num: '03',
    title: 'Recebe ação clicável',
    desc: 'Resposta com ticker chips, citações [N], e chips de ação inline. Confirma um alerta sem digitar de novo.',
    icon: 'i-lucide-zap',
  },
]

interface Pillar {
  title: string
  desc: string
  icon: string
}
const pillars: Pillar[] = [
  {
    title: 'Dado real, sempre',
    desc: 'Preço, dividendos, notícias e macro vêm de tools que rodam na hora. Nada de "conhecimento de treinamento".',
    icon: 'i-lucide-database',
  },
  {
    title: 'Tools visíveis',
    desc: 'Você vê cada chamada no painel: view_asset, technical_analysis, search_news. Sem caixa preta.',
    icon: 'i-lucide-eye',
  },
  {
    title: 'Decisão como ação',
    desc: 'Sugestões viram chips clicáveis. Um clique configura alerta, registra decisão, ou simula cenário.',
    icon: 'i-lucide-target',
  },
]

// Render a single answer line, replacing `{{propose}}` with the
// propose chip placeholder so the chip appears INLINE in the prose
// (mimics the real chat's marker mechanic).
function answerSegments(line: string): Array<{ kind: 'text' | 'propose'; value: string }> {
  if (!line.includes('{{propose}}')) return [{ kind: 'text', value: line }]
  const parts = line.split('{{propose}}')
  const segs: Array<{ kind: 'text' | 'propose'; value: string }> = []
  parts.forEach((p, i) => {
    if (p) segs.push({ kind: 'text', value: p })
    if (i < parts.length - 1) segs.push({ kind: 'propose', value: '' })
  })
  return segs
}
</script>

<template>
  <div class="showcase-root">
    <!-- ============================================================
         Hero — animated chat demo + headline + CTA
         ============================================================ -->
    <section class="showcase-hero relative overflow-hidden px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-16">
      <!-- Ambient halo -->
      <div
        class="pointer-events-none absolute inset-0"
        :style="{
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 16%, transparent) 0%, transparent 65%), radial-gradient(ellipse 70% 50% at 50% 100%, color-mix(in srgb, ${brand.colors.primary} 8%, transparent) 0%, transparent 65%)`,
        }"
        aria-hidden="true"
      />
      <!-- Top accent line -->
      <div
        class="showcase-topline pointer-events-none absolute inset-x-0 top-0 h-[2px]"
        :style="{ '--c': brand.colors.primary } as Record<string, string>"
        aria-hidden="true"
      />

      <div class="relative mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-stretch md:gap-14">
        <!-- LEFT: copy + CTA -->
        <div class="flex w-full max-w-xl flex-col items-start gap-7">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono-tab text-[10px] font-bold uppercase tracking-[0.2em]"
            :style="{
              background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.text}) 100%)`,
              color: brand.colors.background,
              boxShadow: `0 6px 16px -4px color-mix(in srgb, ${brand.colors.primary} 50%, transparent)`,
            }"
          >
            <UIcon name="i-lucide-sparkles" class="size-3" aria-hidden="true" />
            Redentia MAX
          </span>

          <h1
            class="font-display text-[34px] font-semibold leading-[1.05] tracking-tight md:text-[52px]"
            :style="{ color: brand.colors.text }"
          >
            Análise multi-passo, com dado <span :style="{ color: brand.colors.primary }">de verdade</span>.
          </h1>

          <p class="text-[15px] leading-relaxed md:text-[17px]" :style="{ color: brand.colors.textMuted }">
            Cada número conferido via tools antes de virar resposta. Cada decisão entra como chip clicável. Carteira analisada em 9 camadas — não em palpite.
          </p>

          <div class="flex flex-col items-start gap-3 md:flex-row md:items-center">
            <button
              type="button"
              class="showcase-cta inline-flex items-center gap-2 rounded-full px-7 py-3 text-[15px] font-semibold transition-[transform,filter,box-shadow]"
              :style="{
                background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.text}) 100%)`,
                color: brand.colors.background,
                boxShadow: `0 16px 32px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 30%, transparent)`,
              }"
              @click="onCta"
            >
              <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
              {{ ctaLabel ?? 'Entrar para conversar' }}
              <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
            </button>
            <span
              class="font-mono-tab text-[10.5px] uppercase tracking-[0.18em]"
              :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 70%, transparent)` }"
            >Acesso gratuito · Sem cartão</span>
          </div>
        </div>

        <!-- RIGHT: live demo -->
        <div class="relative w-full max-w-xl">
          <div
            class="showcase-stage relative flex flex-col gap-3 rounded-[24px] p-5 backdrop-blur-md md:p-6"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 92%, transparent)`,
              boxShadow: `0 24px 80px -24px color-mix(in srgb, ${brand.colors.primary} 35%, transparent), 0 0 0 1px color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
            }"
            aria-label="Demonstração do chat"
          >
            <!-- Header dots -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full" :style="{ backgroundColor: 'color-mix(in srgb, currentColor 25%, transparent)' }" />
                <span class="size-2 rounded-full" :style="{ backgroundColor: 'color-mix(in srgb, currentColor 25%, transparent)' }" />
                <span class="size-2 rounded-full" :style="{ backgroundColor: 'color-mix(in srgb, currentColor 25%, transparent)' }" />
              </div>
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.16em]"
                :style="{ color: brand.colors.textMuted }"
              >redentia / chat</span>
            </div>

            <!-- USER bubble: typewritten question -->
            <div
              class="self-end rounded-2xl px-4 py-2.5 text-[14px] leading-snug"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 12%, ${brand.colors.surface})`,
                color: brand.colors.text,
                maxWidth: '88%',
              }"
            >
              <span>{{ typedQuestion }}</span>
              <span
                v-if="!typedQuestionDone"
                class="showcase-caret ml-px inline-block w-px align-baseline"
                :style="{ borderRight: `1px solid ${brand.colors.text}` }"
                aria-hidden="true"
              />
            </div>

            <!-- AGENT side: tools chips + answer body -->
            <Transition name="showcase-fade">
              <div v-if="typedQuestionDone" class="flex flex-col gap-3">
                <!-- Tool calls panel -->
                <ul
                  class="flex flex-wrap items-center gap-1.5"
                  aria-label="Tools chamadas pelo agente"
                >
                  <li
                    v-for="(t, i) in currentDemo.tools"
                    :key="t.label + '-' + i"
                    class="showcase-tool-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]"
                    :style="{
                      backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
                      color: brand.colors.textMuted,
                      animationDelay: `${i * 110}ms`,
                    }"
                  >
                    <UIcon
                      :name="t.icon"
                      class="size-3"
                      :style="{ color: brand.colors.primary }"
                      aria-hidden="true"
                    />
                    <span class="font-mono-tab">{{ t.label }}</span>
                  </li>
                </ul>

                <!-- Answer paragraphs (revealed one at a time) -->
                <div class="flex flex-col gap-2">
                  <p
                    v-for="(line, lineIdx) in currentDemo.answer"
                    v-show="visibleAnswerLines > lineIdx"
                    :key="line + '-' + lineIdx"
                    class="showcase-answer-line text-[13.5px] leading-relaxed md:text-[14px]"
                    :style="{ color: brand.colors.text }"
                  >
                    <template v-for="(seg, segIdx) in answerSegments(line)" :key="segIdx">
                      <!-- Inline ticker chip on first segment of first line -->
                      <span
                        v-if="seg.kind === 'text' && lineIdx === 0 && segIdx === 0 && currentDemo.ticker"
                        class="showcase-ticker-chip mr-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 align-middle"
                        :style="{
                          backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, ${brand.colors.surface})`,
                          border: `1px solid color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
                          color: brand.colors.text,
                        }"
                      >
                        <span
                          class="font-mono-tab text-[10.5px] font-semibold tracking-tight"
                        >{{ currentDemo.ticker.symbol }}</span>
                        <span
                          class="font-mono-tab text-[10.5px] tabular-nums"
                          :style="{
                            color: currentDemo.ticker.positive ? (brand.colors.positive ?? brand.colors.primary) : brand.colors.negative,
                          }"
                        >{{ currentDemo.ticker.price }} <span class="opacity-80">{{ currentDemo.ticker.delta }}</span></span>
                      </span>

                      <span v-if="seg.kind === 'text'">{{ seg.value }}</span>

                      <!-- Inline propose chip -->
                      <Transition v-else name="showcase-fade-fast">
                        <span
                          v-if="showProposeChip || lineIdx < currentDemo.answer.length - 1"
                          class="showcase-propose-chip inline-flex items-center gap-1 rounded-full align-middle"
                          :style="{
                            backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, ${brand.colors.surface})`,
                            border: `1px solid color-mix(in srgb, ${brand.colors.primary} 38%, transparent)`,
                            color: brand.colors.text,
                            padding: '2px 9px 2px 4px',
                            gap: '4px',
                            fontSize: '11.5px',
                            position: 'relative',
                            top: '-1px',
                          }"
                        >
                          <span
                            class="inline-flex size-4 items-center justify-center rounded-full"
                            :style="{
                              backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
                            }"
                          >
                            <UIcon
                              name="i-heroicons-bell-alert-20-solid"
                              class="size-2.5"
                              :style="{ color: brand.colors.primary }"
                              aria-hidden="true"
                            />
                          </span>
                          <span class="font-semibold leading-none">{{ currentDemo.proposeLabel ?? 'Confirmar' }}</span>
                        </span>
                      </Transition>
                    </template>
                  </p>
                </div>
              </div>
            </Transition>

            <!-- Demo progress dots -->
            <div class="mt-1 flex items-center justify-center gap-1.5 pt-1">
              <span
                v-for="(_, i) in demos"
                :key="i"
                class="size-1.5 rounded-full transition-[background-color,opacity]"
                :style="{
                  backgroundColor: i === demoIndex ? brand.colors.primary : `color-mix(in srgb, ${brand.colors.textMuted} 30%, transparent)`,
                }"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         Como funciona — 3 stages
         ============================================================ -->
    <section class="px-5 py-16 md:px-10 md:py-20">
      <div class="mx-auto max-w-6xl">
        <div class="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
          <span
            class="font-mono-tab text-[10.5px] uppercase tracking-[0.22em]"
            :style="{ color: brand.colors.primary }"
          >Como funciona</span>
          <h2
            class="font-display text-[28px] font-semibold leading-[1.1] md:text-[40px]"
            :style="{ color: brand.colors.text }"
          >Você pergunta. A Redentia pesquisa. Você decide.</h2>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
          <article
            v-for="(step, i) in stages"
            :key="step.num"
            class="showcase-step relative flex flex-col gap-4 rounded-3xl p-6 md:p-7"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 80%, transparent)`,
              border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
              animationDelay: `${i * 120}ms`,
            }"
          >
            <span
              class="font-mono-tab text-[12px] font-bold tracking-[0.18em]"
              :style="{ color: brand.colors.primary }"
            >{{ step.num }}</span>
            <div
              class="flex size-11 items-center justify-center rounded-2xl"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                color: brand.colors.primary,
              }"
            >
              <UIcon :name="step.icon" class="size-5" aria-hidden="true" />
            </div>
            <h3
              class="text-[18px] font-semibold leading-tight md:text-[20px]"
              :style="{ color: brand.colors.text }"
            >{{ step.title }}</h3>
            <p class="text-[13.5px] leading-relaxed md:text-[14.5px]" :style="{ color: brand.colors.textMuted }">
              {{ step.desc }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- ============================================================
         Diferenciais — 3 pillars
         ============================================================ -->
    <section class="px-5 pb-20 pt-4 md:px-10 md:pb-28">
      <div class="mx-auto max-w-6xl">
        <div class="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
          <span
            class="font-mono-tab text-[10.5px] uppercase tracking-[0.22em]"
            :style="{ color: brand.colors.primary }"
          >Por que Redentia</span>
          <h2
            class="font-display text-[28px] font-semibold leading-[1.1] md:text-[40px]"
            :style="{ color: brand.colors.text }"
          >Não é mais um chatbot.</h2>
        </div>

        <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
          <article
            v-for="pillar in pillars"
            :key="pillar.title"
            class="flex flex-col gap-3 rounded-3xl p-6 md:p-7"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 4%, ${brand.colors.surface})`,
              border: `1px solid color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
            }"
          >
            <UIcon
              :name="pillar.icon"
              class="size-7"
              :style="{ color: brand.colors.primary }"
              aria-hidden="true"
            />
            <h3
              class="text-[17px] font-semibold leading-tight md:text-[19px]"
              :style="{ color: brand.colors.text }"
            >{{ pillar.title }}</h3>
            <p class="text-[13.5px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
              {{ pillar.desc }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- ============================================================
         Final CTA
         ============================================================ -->
    <section class="px-5 pb-24 md:px-10 md:pb-32">
      <div
        class="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-[28px] px-6 py-10 text-center md:px-10 md:py-14"
        :style="{
          background: `radial-gradient(ellipse 100% 80% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 22%, ${brand.colors.surface}) 0%, color-mix(in srgb, ${brand.colors.surface} 96%, transparent) 65%)`,
          border: `1px solid color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
        }"
      >
        <h2
          class="font-display text-[26px] font-semibold leading-[1.1] md:text-[36px]"
          :style="{ color: brand.colors.text }"
        >Sua próxima decisão tem dado por trás dela.</h2>
        <p class="max-w-xl text-[14.5px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Análise multi-passo, validação cruzada, framework de carteira de 9 camadas. Tudo conferido antes de virar resposta.
        </p>
        <button
          type="button"
          class="showcase-cta inline-flex items-center gap-2 rounded-full px-7 py-3 text-[15px] font-semibold transition-[transform,filter,box-shadow]"
          :style="{
            background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.text}) 100%)`,
            color: brand.colors.background,
            boxShadow: `0 16px 32px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 30%, transparent)`,
          }"
          @click="onCta"
        >
          <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
          {{ ctaLabel ?? 'Entrar para conversar' }}
          <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.showcase-root {
  /* Box-sizing isolation in case parent leaks. */
  isolation: isolate;
}

/* Topline subtle scanline animation — same vocabulary as the chat shell. */
.showcase-topline {
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--c) 60%, transparent) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: showcase-scanline 6s linear infinite;
}
@keyframes showcase-scanline {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Caret blink for the typewriter. */
.showcase-caret {
  height: 1em;
  animation: showcase-blink 0.9s steps(2) infinite;
}
@keyframes showcase-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Tool chips pop in with a stagger driven by inline `animation-delay`. */
.showcase-tool-chip {
  opacity: 0;
  transform: translateY(4px);
  animation: showcase-pop 320ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}
@keyframes showcase-pop {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Answer paragraphs slide in. */
.showcase-answer-line {
  animation: showcase-rise 360ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
@keyframes showcase-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Generic enter/leave used by Transition wrappers. */
.showcase-fade-enter-active,
.showcase-fade-leave-active {
  transition: opacity 220ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
.showcase-fade-enter-from,
.showcase-fade-leave-to {
  opacity: 0;
}
.showcase-fade-fast-enter-active {
  transition: opacity 180ms cubic-bezier(0.2, 0.7, 0.2, 1), transform 180ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
.showcase-fade-fast-enter-from {
  opacity: 0;
  transform: translateY(2px);
}

/* Step cards rise in on mount. */
.showcase-step {
  opacity: 0;
  transform: translateY(10px);
  animation: showcase-rise-slow 520ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
}
@keyframes showcase-rise-slow {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* CTA hover/focus. */
.showcase-cta:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
}
.showcase-cta:focus-visible {
  outline: none;
  box-shadow:
    0 16px 32px -10px color-mix(in srgb, var(--brand-primary, #f5a300) 60%, transparent),
    inset 0 1px 0 0 color-mix(in srgb, white 30%, transparent),
    0 0 0 3px color-mix(in srgb, var(--brand-primary, #f5a300) 35%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .showcase-topline,
  .showcase-caret,
  .showcase-tool-chip,
  .showcase-answer-line,
  .showcase-step {
    animation: none !important;
  }
  .showcase-tool-chip,
  .showcase-step {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
