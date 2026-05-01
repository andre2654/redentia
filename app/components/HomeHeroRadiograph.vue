<!--
  HERO: RADIOGRAPH (Redentia v3 reposicionada)

  Tese:
    "A IA que monitora sua carteira e explica o que voce precisa saber."

  Layout split 50/50:
  - Esquerda: eyebrow + headline outcome-driven + subtitle + INPUT embutido + trust
  - Direita: 3D pile carousel (5 cards rotativos showcase do produto)

  Mantem DNA quiet:
  - paleta amber + aubergine warm + tokens semanticos
  - weight 300 nas display
  - radii 4-16px (hero card pode ir a 16px)
  - tabular-nums em numeros financeiros
  - mesh radial offset top-right
-->
<script setup lang="ts">
import { analyzePortfolio, DEMO_PORTFOLIO } from '~/composables/usePortfolioScore'

interface Props {
  ibovSeries?: any[]
  ibovLastPrice?: number | null
  ibovIndicator?: string | null
  ibovVariationColor?: string | null
  ifixLastPrice?: number | null
  ifixIndicator?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  ibovSeries: () => [],
  ibovLastPrice: null,
  ibovIndicator: null,
  ibovVariationColor: null,
  ifixLastPrice: null,
  ifixIndicator: null,
})

const brand = useBrand()
const fmt = useFormat()
const colorMode = useColorMode()

const eyebrow = computed(() => {
  const e = (brand.hero as any).eyebrow
  if (typeof e === 'string' && e.length > 0) return e
  return 'PLATAFORMA DE IA PARA SUA CARTEIRA'
})

const demoReport = computed(() => analyzePortfolio(DEMO_PORTFOLIO))

const resolvedMode = computed(() => colorMode.value === 'dark' ? 'dark' : 'light')

const meshOpacity = computed(() => {
  if (resolvedMode.value === 'dark') return { amber: 0.30, rose: 0.18, amberSoft: 0.20 }
  return { amber: 0.55, rose: 0.30, amberSoft: 0.40 }
})

const meshAmber = computed(() => `radial-gradient(circle, ${brand.colors.primary}, transparent 65%)`)
const meshRose = computed(() => `radial-gradient(circle, ${brand.colors.primary}, transparent 70%)`)
const meshAmberSoft = computed(() => `radial-gradient(circle, ${brand.colors.primary}, transparent 70%)`)

const heroCardShadow = computed(() => {
  if (resolvedMode.value === 'dark') {
    return '0 40px 80px -20px rgba(0,0,0,0.55), 0 18px 36px -18px color-mix(in srgb, var(--brand-primary) 16%, transparent)'
  }
  return '0 40px 80px -20px color-mix(in srgb, var(--brand-primary) 22%, transparent), 0 18px 36px -18px rgba(0, 0, 0, 0.10)'
})

// ============ 3D PILE CAROUSEL ============
const STACK_TOTAL = 5
const activeStackIdx = ref(0)
let stackTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  stackTimer = setInterval(() => {
    activeStackIdx.value = (activeStackIdx.value + 1) % STACK_TOTAL
  }, 4500)
})
onBeforeUnmount(() => {
  if (stackTimer) clearInterval(stackTimer)
})

function stackStyle(absoluteIdx: number) {
  const pos = (absoluteIdx - activeStackIdx.value + STACK_TOTAL) % STACK_TOTAL
  const visiblePos = Math.min(pos, 3)

  const translateX = visiblePos * 14
  const translateY = visiblePos * 16
  const translateZ = -visiblePos * 80
  const scale = 1 - visiblePos * 0.045
  const rotateX = visiblePos * 2
  const rotateY = visiblePos * 5
  const rotateZ = visiblePos * -1.5

  let opacity = 1
  if (pos === 1) opacity = 0.92
  else if (pos === 2) opacity = 0.7
  else if (pos === 3) opacity = 0.4
  else if (pos === 4) opacity = 0

  return {
    gridArea: '1 / 1',
    alignSelf: 'start',
    transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
    opacity,
    zIndex: STACK_TOTAL - pos,
    pointerEvents: pos === 0 ? 'auto' : 'none',
    transition: 'transform 850ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 700ms ease',
    transformOrigin: 'center center',
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden',
    cursor: 'pointer',
    willChange: 'transform, opacity',
  } as Record<string, string | number>
}

// Mock data para os cards do showcase (depois das integraçoes reais com APIs)
const ibovChangeColor = computed(() => props.ibovVariationColor || brand.colors.negative || '#FF4747')

const topStockMock = computed(() => [
  { ticker: 'BBAS3', name: 'Banco do Brasil', dy: '9.5%', change: '+2.84%', up: true },
  { ticker: 'WEGE3', name: 'WEG', dy: '1.4%', change: '+1.92%', up: true },
  { ticker: 'PETR4', name: 'Petrobras', dy: '12.4%', change: '-1.64%', up: false },
])

// Stress test mini para card
const stressMini = [
  { label: 'Crash IBOV -20%', impact: -9.4, resilience: 'Forte' },
  { label: 'Selic +4pp', impact: -5.5, resilience: 'Media' },
  { label: 'Dolar +30%', impact: 5.5, resilience: 'Forte' },
]

// Dividendos mini
const divMini = [
  { ticker: 'MXRF11', monthlyAvg: 10.00 },
  { ticker: 'HGLG11', monthlyAvg: 6.67 },
  { ticker: 'BBDC4', monthlyAvg: 5.17 },
  { ticker: 'ITUB4', monthlyAvg: 4.83 },
]

// Riscos preview (top 3 da demo report)
const risksPreview = computed(() => demoReport.value.risks.slice(0, 3))
</script>

<template>
  <section class="hero-radiograph relative overflow-hidden md:-mx-4 md:-mt-4" :data-mode="resolvedMode">
    <!-- ============ MESH GRADIENT DRAMATICO ============ -->
    <div class="hero-radiograph__bg pointer-events-none absolute inset-0">
      <div class="absolute -right-32 -top-40 h-[680px] w-[820px] rounded-full blur-3xl" :style="{ background: meshAmber, opacity: meshOpacity.amber }" />
      <div class="absolute right-[10%] top-[30%] h-[480px] w-[520px] rounded-full blur-3xl" :style="{ background: meshRose, opacity: meshOpacity.rose }" />
      <div class="absolute -bottom-40 -left-32 h-[560px] w-[640px] rounded-full blur-3xl" :style="{ background: meshAmberSoft, opacity: meshOpacity.amberSoft }" />
      <svg class="absolute -right-20 -top-20 h-[520px] w-[640px]" viewBox="0 0 640 520" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hero-radiograph-arc" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="brand.colors.primary" stop-opacity="0.22" />
            <stop offset="60%" stop-color="#F96BEE" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#F96BEE" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path d="M 640 0 L 640 240 Q 480 360 320 320 Q 160 280 0 380 L 0 0 Z" fill="url(#hero-radiograph-arc)" />
      </svg>
    </div>

    <!--
      Padding vertical: bem apertado no mobile pra o hero não ocupar
      a viewport inteira. Desktop continua generoso (pt-20 pb-28) pq
      o split 50/50 com o stack 3D precisa de respiro.
    -->
    <div class="relative mx-auto max-w-6xl px-6 pb-10 pt-8 md:pb-28 md:pt-20">
      <div class="grid items-center gap-6 md:grid-cols-12 md:gap-12 lg:gap-16">
        <!-- ============ LEFT: manifesto + input ============ -->
        <div class="md:col-span-7">
          <!--
            Eyebrow descritivo "PLATAFORMA DE IA PARA SUA CARTEIRA" só
            aparece a partir de md+. No mobile o headline + input já
            comunicam a proposta sem precisar dessa linha de contexto;
            cortando ela ganhamos ~32 px de altura crítica acima da
            dobra.
          -->
          <p class="eyebrow mb-5 hidden md:block">{{ eyebrow }}</p>

          <!--
            Headline mobile-first: 36 px com leading apertado. A 36 px
            o texto cabe em 3 linhas curtas em 375px de largura, ainda
            sentindo "grande" sem expulsar input/chips pra fora da
            tela. sm:44px e md:60px continuam servindo telas maiores.
          -->
          <h1 class="hero-radiograph__headline mb-4 max-w-2xl text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-[44px] md:mb-6 md:text-[60px] md:leading-[1.04] md:tracking-normal lg:text-[72px]" :style="{ color: 'var(--text-heading)' }">
            Descubra os riscos escondidos da sua
            <em class="hero-radiograph__headline-serif" :style="{ color: 'var(--brand-primary)' }">carteira</em><span :style="{ color: 'var(--brand-primary)' }">.</span>
          </h1>

          <!--
            Subtitle de 30+ palavras só aparece a partir de md+. No
            mobile ela ocupava 5 linhas e basicamente repetia o que o
            headline já diz. Esconder libera a maior parte do ganho de
            altura sem custo de mensagem (CTA "Analisar minha carteira
            grátis" do input já tem promessa concreta).
          -->
          <p class="mb-8 hidden max-w-xl text-[16px] leading-relaxed md:block md:text-[18px]" :style="{ color: 'var(--text-body)' }">
            Adicione seus ativos e a Redent.IA cruza fundamentos, noticias, dividendos, concentracao e mercado para mostrar o que esta bom, o que esta ruim e o que mudou.
          </p>

          <div class="mb-3 md:mb-5">
            <AtomsPortfolioInput variant="hero" cta-label="Analisar minha carteira gratis" :show-suggestions="true" />
          </div>

          <!-- Trust signals: ficam só os dois que continuam verdadeiros
               em qualquer plano. "Sempre grátis" foi removido porque a
               plataforma vai entrar no modelo Free/Pro/Max e o
               freemium não cobre todas as funções, então prometer
               "sempre grátis" no hero principal seria propaganda
               enganosa cedo demais. -->
          <ul class="hero-radiograph__trust">
            <li>
              <UIcon name="i-lucide-shield-check" class="size-3.5 shrink-0" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
              <span>Sem cadastro</span>
            </li>
            <li>
              <UIcon name="i-lucide-clock" class="size-3.5 shrink-0" :style="{ color: 'var(--brand-primary)' }" aria-hidden="true" />
              <span>Resultado em 2 min</span>
            </li>
          </ul>
        </div>

        <!-- ============ RIGHT: 3D PILE CAROUSEL ============ -->
        <aside class="hidden md:col-span-5 md:block" aria-label="Showcase Redent.IA">
          <div
            class="hero-stack relative"
            :style="{
              perspective: '1600px',
              perspectiveOrigin: 'center top',
              display: 'grid',
              gridTemplate: '1fr / 1fr',
              transformStyle: 'preserve-3d',
            }"
          >
            <!-- ============ CARD 0: Redent Score (principal) ============ -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(0), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 0"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `linear-gradient(135deg, ${brand.colors.primary}1A 0%, transparent 35%, #F96BEE14 80%, transparent 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-medium uppercase tracking-[0.18em]" :style="{ color: 'var(--text-muted)' }">REDENT SCORE · DEMO</span>
                </div>
                <span class="rounded-md px-2 py-0.5 text-[10px] font-medium" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
                  Exemplo
                </span>
              </header>
              <div class="relative px-6 pt-5">
                <div class="flex items-center gap-5">
                  <MoleculesPortfolioScoreDial :report="demoReport" size="sm" :show-band="false" />
                  <div class="flex flex-col gap-2">
                    <span
                      class="rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.06em]"
                      :style="{
                        background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`,
                        color: brand.colors.primary,
                        borderColor: `color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
                      }"
                    >{{ demoReport.bandLabel }}</span>
                    <ul class="flex flex-col gap-1.5 text-[11px]">
                      <li class="flex items-center gap-2">
                        <span class="size-1.5 rounded-full" :style="{ background: brand.colors.positive }" />
                        <span :style="{ color: 'var(--text-body)' }">{{ demoReport.strengths.length }} pontos fortes</span>
                      </li>
                      <li class="flex items-center gap-2">
                        <span class="size-1.5 rounded-full" :style="{ background: brand.colors.negative }" />
                        <span :style="{ color: 'var(--text-body)' }">{{ demoReport.risks.length }} riscos</span>
                      </li>
                      <li class="flex items-center gap-2">
                        <span class="size-1.5 rounded-full" :style="{ background: brand.colors.primary }" />
                        <span :style="{ color: 'var(--text-body)' }">{{ demoReport.events.length }} eventos hoje</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="relative mt-4 border-t px-6 py-4" :style="{ borderColor: 'var(--border-subtle)' }">
                <p class="mb-2 text-[10px] font-medium uppercase tracking-[0.18em]" :style="{ color: 'var(--text-muted)' }">RISCOS DESTA CARTEIRA</p>
                <ul class="flex flex-col gap-1.5">
                  <li
                    v-for="(risk, i) in risksPreview"
                    :key="i"
                    class="flex items-start gap-2 text-[11px] leading-snug"
                    :style="{ color: 'var(--text-body)' }"
                  >
                    <UIcon
                      name="i-lucide-alert-triangle"
                      class="mt-[2px] size-3 shrink-0"
                      :style="{ color: risk.severity === 'high' ? brand.colors.negative : brand.colors.primary }"
                    />
                    <span>{{ risk.title }}</span>
                  </li>
                </ul>
              </div>
            </article>

            <!-- ============ CARD 1: Top Acoes (quem subiu hoje) ============ -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(1), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 1"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `linear-gradient(135deg, ${brand.colors.positive}14 0%, transparent 40%, ${brand.colors.primary}10 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <span class="size-1.5 rounded-full" :style="{ backgroundColor: 'var(--brand-positive)' }" />
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Movimentos hoje</span>
                </div>
                <span class="rounded-md border px-2 py-0.5 text-[11px] font-medium" :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-body)' }">B3</span>
              </header>
              <div class="relative px-6 pt-5">
                <h3 class="font-light text-[26px] leading-tight" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }">
                  Quem subiu <em class="font-['Instrument_Serif'] italic" :style="{ color: 'var(--brand-primary)' }">hoje.</em>
                </h3>
                <p class="mt-1 text-[12px]" :style="{ color: 'var(--text-muted)' }">Maiores altas em tempo real</p>
              </div>
              <ul class="relative mt-4 flex flex-col">
                <li
                  v-for="(stock, i) in topStockMock"
                  :key="stock.ticker"
                  class="flex items-center gap-3 border-t px-6 py-3"
                  :style="{ borderColor: 'var(--border-subtle)' }"
                >
                  <span
                    class="font-mono-tab flex size-8 items-center justify-center rounded-md text-[10px] font-bold"
                    :style="{ backgroundColor: 'var(--bg-overlay)', color: 'var(--text-label)', border: '1px solid var(--border-subtle)' }"
                  >{{ stock.ticker.slice(0, 2) }}</span>
                  <div class="flex flex-1 flex-col">
                    <span class="text-[13px] font-medium leading-none" :style="{ color: 'var(--text-heading)' }">{{ stock.ticker }}</span>
                    <span class="mt-1 text-[10px]" :style="{ color: 'var(--text-muted)' }">{{ stock.name }}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-[12px] tabular-nums" :style="{ color: stock.up ? 'var(--brand-positive)' : 'var(--brand-negative)' }">{{ stock.change }}</span>
                    <span class="mt-0.5 text-[10px] tabular-nums" :style="{ color: 'var(--text-muted)' }">DY {{ stock.dy }}</span>
                  </div>
                </li>
              </ul>
            </article>

            <!-- ============ CARD 2: Stress Test (cenarios) ============ -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(2), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 2"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `linear-gradient(135deg, ${brand.colors.negative}10 0%, transparent 50%, ${brand.colors.primary}10 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-flame" class="size-3.5" :style="{ color: brand.colors.primary }" />
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Stress test</span>
                </div>
                <span class="rounded-md border px-2 py-0.5 text-[11px] font-medium" :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-body)' }">3 cenarios</span>
              </header>
              <div class="relative px-6 pt-5">
                <h3 class="font-light text-[26px] leading-tight" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }">
                  Aguenta <em class="font-['Instrument_Serif'] italic" :style="{ color: 'var(--brand-primary)' }">queda?</em>
                </h3>
                <p class="mt-1 text-[12px]" :style="{ color: 'var(--text-muted)' }">Simulacoes em cenarios adversos</p>
              </div>
              <ul class="relative mt-4 flex flex-col">
                <li
                  v-for="(s, i) in stressMini"
                  :key="i"
                  class="flex items-center gap-3 border-t px-6 py-3"
                  :style="{ borderColor: 'var(--border-subtle)' }"
                >
                  <UIcon
                    :name="s.impact >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                    class="size-4"
                    :style="{ color: s.impact >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
                  />
                  <div class="flex flex-1 flex-col">
                    <span class="text-[13px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ s.label }}</span>
                    <span class="mt-0.5 text-[10px]" :style="{ color: 'var(--text-muted)' }">Resiliencia {{ s.resilience.toLowerCase() }}</span>
                  </div>
                  <span
                    class="font-light tabular-nums text-[18px]"
                    :style="{ color: s.impact >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
                  >{{ s.impact >= 0 ? '+' : '' }}{{ s.impact.toFixed(1) }}%</span>
                </li>
              </ul>
            </article>

            <!-- ============ CARD 3: Dividendos Projetados ============ -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(3), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 3"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `linear-gradient(135deg, ${brand.colors.primary}1A 0%, transparent 50%, ${brand.colors.positive}10 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-coins" class="size-3.5" :style="{ color: brand.colors.primary }" />
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Renda passiva</span>
                </div>
                <span class="rounded-md border px-2 py-0.5 text-[11px] font-medium" :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-body)' }">Mensal</span>
              </header>
              <div class="relative px-6 pt-5">
                <p class="text-[10px] font-medium uppercase tracking-[0.18em]" :style="{ color: 'var(--text-muted)' }">RENDA ESTIMADA</p>
                <p class="mt-1 font-light tabular-nums text-[36px] leading-none" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }">
                  R$ {{ demoReport.monthlyDividendsTotal.toLocaleString('pt-BR') }}
                </p>
                <p class="mt-2 text-[12px]" :style="{ color: 'var(--text-muted)' }">por mes para R$ 100k</p>
              </div>
              <ul class="relative mt-4 flex flex-col">
                <li
                  v-for="d in divMini"
                  :key="d.ticker"
                  class="flex items-center justify-between gap-3 border-t px-6 py-2.5"
                  :style="{ borderColor: 'var(--border-subtle)' }"
                >
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ d.ticker }}</span>
                  <span class="font-mono-tab tabular-nums text-[12px]" :style="{ color: brand.colors.primary }">R$ {{ d.monthlyAvg.toFixed(2) }}</span>
                </li>
              </ul>
            </article>

            <!-- ============ CARD 4: Allocation ============ -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(4), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 4"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `linear-gradient(135deg, ${brand.colors.primary}1A 0%, transparent 50%, #F96BEE10 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-pie-chart" class="size-3.5" :style="{ color: brand.colors.primary }" />
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Alocacao</span>
                </div>
                <span class="rounded-md border px-2 py-0.5 text-[11px] font-medium" :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-body)' }">{{ demoReport.allocationByClass.length }} classes</span>
              </header>
              <div class="relative px-6 pt-5">
                <h3 class="font-light text-[24px] leading-tight" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }">
                  Como sua carteira <em class="font-['Instrument_Serif'] italic" :style="{ color: 'var(--brand-primary)' }">se divide.</em>
                </h3>
              </div>
              <ul class="relative mt-4 flex flex-col">
                <li
                  v-for="seg in demoReport.allocationByClass.slice(0, 5)"
                  :key="seg.classId"
                  class="border-t px-6 py-3"
                  :style="{ borderColor: 'var(--border-subtle)' }"
                >
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <span class="size-2 rounded-full" :style="{ background: seg.color }" />
                      <span class="text-[12px]" :style="{ color: 'var(--text-heading)' }">{{ seg.label }}</span>
                    </div>
                    <span class="tabular-nums text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">{{ (seg.weight * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="mt-1.5 h-[3px] w-full overflow-hidden rounded-full" :style="{ background: 'color-mix(in srgb, var(--text-heading) 5%, transparent)' }">
                    <div class="h-full rounded-full" :style="{ width: `${seg.weight * 100}%`, background: seg.color }" />
                  </div>
                </li>
              </ul>
            </article>

            <!-- Stack indicator dots -->
            <div class="hero-stack__dots">
              <button
                v-for="i in STACK_TOTAL"
                :key="i"
                type="button"
                class="hero-stack__dot"
                :class="{ 'is-active': i - 1 === activeStackIdx }"
                :aria-label="`Ver card ${i}`"
                @click="activeStackIdx = i - 1"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-radiograph__headline {
  font-weight: 300;
  letter-spacing: -0.03em;
  word-spacing: 0.01em;
}

.hero-radiograph__headline-serif {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 1.06em;
  display: inline;
  white-space: nowrap;
}

/* Trust signals row, mais legivel: pill com icon + bg sutil */
.hero-radiograph__trust {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.hero-radiograph__trust li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-body);
  letter-spacing: 0.005em;
}

[data-mode='dark'] .hero-radiograph__trust li {
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
  color: var(--text-heading);
}

.hero-stack__card {
  position: relative;
  width: 100%;
  pointer-events: auto;
}

.hero-stack__dots {
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 20;
}

.hero-stack__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-heading) 18%, transparent);
  border: 0;
  transition: background 200ms, width 200ms;
  cursor: pointer;
}

.hero-stack__dot.is-active {
  width: 18px;
  background: var(--brand-primary);
}
</style>
