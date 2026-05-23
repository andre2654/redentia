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

// Light mode: much softer pastel wash. The previous values (0.55/0.30/0.40)
// pulled too much amber into the canvas and stole contrast from the headline,
// CTA and trust signals — text was reading on a peach background instead of
// white. New values keep the mesh as a barely-there hint of warmth (~12-18%
// alpha) so the page reads predominantly white with pastel amber accents.
// Dark mode left alone — it works on near-black where stronger glow is
// needed to register at all.
// Mesh background, base wash e arc opacity foram migrados pra CSS-only
// (ver `<style>` nao-scoped no fim do arquivo). Computeds JS-driven
// reativos a `resolvedMode` ficavam congelados nos valores SSR durante
// hidratacao, causando flash visivel. CSS resolve via `:root.dark` /
// `:root.light` antes de qualquer JS rodar — zero flash.

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

function pauseAutoRotate() {
  if (stackTimer) {
    clearInterval(stackTimer)
    stackTimer = null
  }
}

function nextCard() {
  activeStackIdx.value = (activeStackIdx.value + 1) % STACK_TOTAL
}

function prevCard() {
  activeStackIdx.value = (activeStackIdx.value - 1 + STACK_TOTAL) % STACK_TOTAL
}

// ---- Touch swipe support (mobile) -----------------------------------------
// User-facing UX: drag a finger horizontally over the card pile to advance
// (swipe left) or rewind (swipe right). Once the user takes manual control
// the auto-rotate timer stops — re-rotating after a deliberate swipe would
// feel like the carousel is fighting the user.
//
// Implementation details that matter:
//   - SWIPE_THRESHOLD filters out tiny accidental drags so a regular tap
//     still lands on the card click handler.
//   - We compare |dx| vs |dy| so vertical scrolls (page scroll) don't get
//     mis-classified as swipes. If the user was scrolling, bail.
//   - When a swipe IS detected we set `justSwiped` for 350ms and intercept
//     the click that always follows touchend on mobile, otherwise the card
//     under the finger would also fire its own `@click="activeStackIdx=N"`
//     and undo the swipe direction.
//   - Listeners are attached via addEventListener (not Vue @-bindings) so we
//     can use `capture: true` for the click suppressor and pick the right
//     `passive` flags per event.
const stackEl = ref<HTMLDivElement | null>(null)
const SWIPE_THRESHOLD = 40
let touchStartX = 0
let touchStartY = 0
let justSwiped = false

function onTouchStart(e: TouchEvent) {
  const t = e.touches[0]
  if (!t) return
  touchStartX = t.clientX
  touchStartY = t.clientY
}

function onTouchEnd(e: TouchEvent) {
  const t = e.changedTouches[0]
  if (!t) return
  const dx = t.clientX - touchStartX
  const dy = t.clientY - touchStartY
  // Reject vertical drags (page scroll) and below-threshold gestures.
  if (Math.abs(dy) > Math.abs(dx)) return
  if (Math.abs(dx) < SWIPE_THRESHOLD) return
  justSwiped = true
  setTimeout(() => { justSwiped = false }, 350)
  pauseAutoRotate()
  if (dx < 0) nextCard()
  else prevCard()
}

function onClickCapture(e: Event) {
  if (justSwiped) {
    e.stopPropagation()
    e.preventDefault()
  }
}

onMounted(() => {
  stackTimer = setInterval(() => {
    activeStackIdx.value = (activeStackIdx.value + 1) % STACK_TOTAL
  }, 4500)

  const el = stackEl.value
  if (!el) return
  el.addEventListener('touchstart', onTouchStart, { passive: true })
  el.addEventListener('touchend', onTouchEnd, { passive: true })
  el.addEventListener('click', onClickCapture, true) // capture phase
})

onBeforeUnmount(() => {
  if (stackTimer) clearInterval(stackTimer)
  const el = stackEl.value
  if (!el) return
  el.removeEventListener('touchstart', onTouchStart)
  el.removeEventListener('touchend', onTouchEnd)
  el.removeEventListener('click', onClickCapture, true)
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
// Mantido por compatibilidade caso algum filho consuma; nao tem callers no arquivo.
// Fallback hex puro porque essa computed pode ser passada pra contextos
// (libs externas, SVG attribute) que nao resolvem CSS vars.
const ibovChangeColor = computed(() => props.ibovVariationColor || 'var(--brand-negative)')

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

// 4 ativos demo pro card de Open Finance — aparecem em sequência durante
// a animação. Tickers reais pra logos carregarem do brapi CDN.
const ofAssetPreview = [
  { ticker: 'PETR4', shares: '120 cotas', value: 'R$ 5.328' },
  { ticker: 'VALE3', shares: '85 cotas', value: 'R$ 7.013' },
  { ticker: 'HGLG11', shares: '40 cotas', value: 'R$ 6.520' },
  { ticker: 'ITUB4', shares: '200 cotas', value: 'R$ 7.840' },
]
</script>

<template>
  <section
    class="hero-radiograph relative overflow-hidden"
    :data-mode="resolvedMode"
    style="border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent); border-radius: 14px; margin: 16px;"
  >
    <!-- ============ BACKGROUND PASTEL + WHITE WASH ============ -->
    <!-- Stack (back → front):
           1. baseWash: top-to-bottom linear that lands on pure white at 70%
              of the section height. Pulls the canvas toward white so text
              reads on white, not on saturated amber.
           2. mesh circles: pastel (color-mix with white, ~28-35% primary)
              with low opacity (10-18%) — barely-there warm highlights, not
              dramatic mesh.
           3. SVG arc: dropped to <8% opacity for the same reason.
         Dark mode bypasses baseWash (transparent) and uses the original
         saturated mesh because it needs the glow to register on near-black. -->
    <!-- Background mesh — TODO via CSS classes (sem :style inline JS-driven)
         pra resolver via :root.dark/:root.light selectors antes de qualquer
         hidratacao. Computeds JS-driven (baseWash, meshAmber, etc.) ficavam
         congelados nos valores SSR; CSS classes resolvem instantaneamente. -->
    <div class="hero-radiograph__bg pointer-events-none absolute inset-0">
      <div class="hero-radiograph__mesh-amber absolute -right-32 -top-40 h-[680px] w-[820px] rounded-full blur-3xl" />
      <div class="hero-radiograph__mesh-rose absolute right-[10%] top-[30%] h-[480px] w-[520px] rounded-full blur-3xl" />
      <div class="hero-radiograph__mesh-soft absolute -bottom-40 -left-32 h-[560px] w-[640px] rounded-full blur-3xl" />
      <svg class="absolute -right-20 -top-20 h-[520px] w-[640px]" viewBox="0 0 640 520" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hero-radiograph-arc" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop class="hero-radiograph__arc-stop1" offset="0%" stop-color="var(--brand-primary)" />
            <stop class="hero-radiograph__arc-stop2" offset="60%" stop-color="#F96BEE" />
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
    <div class="relative mx-auto max-w-6xl px-6 pb-6 pt-6 md:pb-12 md:pt-10">
      <div class="grid items-center gap-6 md:grid-cols-12 md:gap-12 lg:gap-16">
        <!-- ============ LEFT: manifesto + input ============ -->
        <!-- order-2 on mobile so the 3D pile carousel renders ABOVE the
             headline (per UX request: "no mobile, deixe os cards em cima").
             md:order-1 reverts to the desktop layout (manifesto on the left). -->
        <div class="order-2 md:order-1 md:col-span-7">

          <!--
            Headline mobile-first: 36 px com leading apertado. A 36 px
            o texto cabe em 3 linhas curtas em 375px de largura, ainda
            sentindo "grande" sem expulsar input/chips pra fora da
            tela. sm:44px e md:60px continuam servindo telas maiores.
          -->
          <h1 class="hero-radiograph__headline mb-4 max-w-2xl text-[26px] leading-[1.08] tracking-[-0.02em] sm:text-[32px] md:mb-5 md:text-[40px] md:leading-[1.08] md:tracking-normal lg:text-[46px]" :style="{ color: 'var(--text-heading)' }">
            Do Caos do mercado ao
            <em class="hero-radiograph__headline-serif" :style="{ color: 'var(--brand-primary)' }">impacto</em>
            na sua carteira.
          </h1>

          <!--
            Subtitle só aparece a partir de md+. No mobile o headline +
            CTA já dão a mensagem; esconder libera altura. Highlight
            "o que realmente" em italic+amber pra ecoar o tom do banner
            CTA da home (/).
          -->
          <p class="mb-8 hidden max-w-xl text-[16px] leading-relaxed md:block md:text-[18px]" :style="{ color: 'var(--text-body)' }">
            Conecte seus bancos via Open Finance e a Redentia puxa
            <em class="hero-radiograph__headline-serif" :style="{ color: 'var(--brand-primary)' }">tudo automaticamente</em>:
            saldos, investimentos e transações em tempo real.
          </p>

          <!-- Trust signals alinhados com a promessa do Resumo.
               Logos dos bancos suportados + contador "+110". A tagline
               textual saiu pra evitar redundância com o subtitle acima. -->
          <div class="hero-radiograph__banks">
            <div class="hero-radiograph__banks-row">
              <div class="hero-radiograph__banks-stack" aria-hidden="true">
                <img src="/icons/logo nubank.webp" alt="" class="hero-radiograph__bank-logo" />
                <img src="/icons/logo itau.webp" alt="" class="hero-radiograph__bank-logo" />
                <img src="/icons/logo bradesco.webp" alt="" class="hero-radiograph__bank-logo" />
                <img src="/icons/logo santander.webp" alt="" class="hero-radiograph__bank-logo" />
                <span class="hero-radiograph__bank-more">+110</span>
              </div>
              <p class="hero-radiograph__banks-text">
                Conectado com <strong>114 bancos</strong> e instituições.
              </p>
            </div>
          </div>
        </div>

        <!-- ============ RIGHT: 3D PILE CAROUSEL ============ -->
        <!-- Mobile: visible (order-1 → renders ABOVE the manifesto), centered
             (mx-auto), narrower (max-w-[260px]) so the cards stay readable
             without overflowing on 360-414px viewports. The mb-6 keeps the
             dots indicator (bottom: -32px) from kissing the H1.
             Desktop (md+): same width-fluid layout as before — 5 columns,
             order-2, no horizontal centering. -->
        <aside
          class="order-1 mx-auto mb-6 block w-full max-w-[260px] md:order-2 md:col-span-5 md:mx-0 md:mb-0 md:max-w-none"
          aria-label="Showcase Redent.IA"
        >
          <div
            ref="stackEl"
            class="hero-stack relative touch-pan-y select-none"
            :style="{
              perspective: '1600px',
              perspectiveOrigin: 'center top',
              display: 'grid',
              gridTemplate: '1fr / 1fr',
              transformStyle: 'preserve-3d',
            }"
          >
            <!-- ============ CARD 0: Open Finance Connect (animacao
                 CPF -> bancos puxando -> ativos importados) ============ -->
            <article
              class="hero-stack__card of-card overflow-hidden rounded-2xl border"
              :style="[stackStyle(0), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 0"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `linear-gradient(135deg, var(--brand-primary)1A 0%, transparent 35%, #F96BEE14 80%, transparent 100%)` }"
                aria-hidden="true"
              />

              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-medium uppercase tracking-[0.18em]" :style="{ color: 'var(--text-muted)' }">OPEN FINANCE · DEMO</span>
                </div>
                <span class="of-status-badge rounded-md px-2 py-0.5 text-[10px] font-medium" :style="{ background: `color-mix(in srgb, var(--brand-primary) 14%, transparent)`, color: 'var(--brand-primary)' }">
                  Conectando
                </span>
              </header>

              <!-- Step 1: CPF input com digitacao animada -->
              <div class="relative mt-5 px-6">
                <label class="block text-[10px] font-medium uppercase tracking-[0.14em] mb-1.5" :style="{ color: 'var(--text-muted)' }">Informe seu CPF</label>
                <div class="of-cpf-field flex items-center gap-2 rounded-lg border px-3 py-2.5" :style="{ borderColor: 'var(--border-default)', background: 'var(--bg-base)' }">
                  <UIcon name="i-lucide-user" class="size-4 shrink-0" :style="{ color: 'var(--text-muted)' }" />
                  <span class="of-cpf-text font-mono-tab tabular-nums text-[14px]" :style="{ color: 'var(--text-heading)' }">
                    <span class="of-cpf-typed">123.456.789-00</span><span class="of-cpf-cursor" aria-hidden="true">|</span>
                  </span>
                  <UIcon name="i-lucide-check" class="of-cpf-check ml-auto size-4 shrink-0" :style="{ color: 'var(--brand-positive)' }" />
                </div>
              </div>

              <!-- Step 2: Bancos sincronizando -->
              <div class="of-banks-row relative mt-3 flex items-center gap-2 px-6">
                <UIcon name="i-lucide-link-2" class="size-3 shrink-0" :style="{ color: 'var(--brand-primary)' }" />
                <span class="text-[11px]" :style="{ color: 'var(--text-body)' }">Sincronizando bancos</span>
                <div class="of-banks-pulse ml-auto flex items-center gap-1">
                  <span class="of-dot of-dot-1 block size-1.5 rounded-full" :style="{ background: 'var(--brand-primary)' }" />
                  <span class="of-dot of-dot-2 block size-1.5 rounded-full" :style="{ background: 'var(--brand-primary)' }" />
                  <span class="of-dot of-dot-3 block size-1.5 rounded-full" :style="{ background: 'var(--brand-primary)' }" />
                </div>
              </div>

              <!-- Step 3: Ativos sendo importados (4 linhas que aparecem em sequencia) -->
              <div class="relative mt-4 border-t px-6 py-4" :style="{ borderColor: 'var(--border-subtle)' }">
                <p class="mb-2 text-[10px] font-medium uppercase tracking-[0.18em]" :style="{ color: 'var(--text-muted)' }">ATIVOS IMPORTADOS</p>
                <ul class="flex flex-col gap-2">
                  <li
                    v-for="(asset, i) in ofAssetPreview"
                    :key="asset.ticker"
                    class="of-asset-row flex items-center justify-between gap-2 text-[11px]"
                    :class="`of-asset-${i + 1}`"
                  >
                    <div class="flex items-center gap-2">
                      <span class="flex size-5 items-center justify-center overflow-hidden rounded border" :style="{ borderColor: 'var(--border-subtle)', background: 'var(--bg-overlay)' }">
                        <img :src="`https://icons.brapi.dev/icons/${asset.ticker}.svg`" :alt="`Logo ${asset.ticker}`" class="size-full object-cover" @error="$event.target.style.display='none'" />
                      </span>
                      <span :style="{ color: 'var(--text-heading)' }" class="font-medium">{{ asset.ticker }}</span>
                      <span :style="{ color: 'var(--text-muted)' }">{{ asset.shares }}</span>
                    </div>
                    <span class="tabular-nums" :style="{ color: 'var(--text-body)' }">{{ asset.value }}</span>
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
                :style="{ background: `linear-gradient(135deg, var(--brand-positive)14 0%, transparent 40%, var(--brand-primary)10 100%)` }"
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
                :style="{ background: `linear-gradient(135deg, var(--brand-negative)10 0%, transparent 50%, var(--brand-primary)10 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-flame" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
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
                :style="{ background: `linear-gradient(135deg, var(--brand-primary)1A 0%, transparent 50%, var(--brand-positive)10 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-coins" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
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
                  <span class="font-mono-tab tabular-nums text-[12px]" :style="{ color: 'var(--brand-primary)' }">R$ {{ d.monthlyAvg.toFixed(2) }}</span>
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
                :style="{ background: `linear-gradient(135deg, var(--brand-primary)1A 0%, transparent 50%, #F96BEE10 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-pie-chart" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
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

/* Banks trust row: tagline + 4 logos circulares sobrepostos + chip "+110" */
.hero-radiograph__banks {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hero-radiograph__banks-tagline {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  margin: 0;
  max-width: 44ch;
}
.hero-radiograph__banks-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.hero-radiograph__banks-stack {
  display: inline-flex;
  align-items: center;
  /* Sobreposição dos logos: cada um cobre 12px do anterior */
}
.hero-radiograph__bank-logo {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  object-fit: cover;
  background: var(--bg-elevated);
  border: 2px solid var(--bg-base);
  flex-shrink: 0;
  display: block;
}
.hero-radiograph__bank-logo + .hero-radiograph__bank-logo,
.hero-radiograph__bank-logo + .hero-radiograph__bank-more {
  margin-left: -12px;
}
.hero-radiograph__bank-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--text-heading) 14%, var(--bg-elevated));
  color: var(--text-heading);
  border: 2px solid var(--bg-base);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}
.hero-radiograph__banks-text {
  font-size: 14px;
  color: var(--text-body);
  margin: 0;
  line-height: 1.4;
}
.hero-radiograph__banks-text strong {
  color: var(--text-heading);
  font-weight: 600;
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

<!-- Estilos do background do hero (mesh + arc + base wash). Sao colocados
     num <style> NAO-SCOPED de proposito: as regras dependem da class
     `:root.dark` / `:root.light` no <html> que e adicionada pelo
     `@nuxtjs/color-mode` ANTES do CSS aplicar. Como scoped CSS adiciona
     `[data-v-XXX]` em todos seletores, ele quebra o match com `:root.X`.
     Sem JS-driven `:style` reativo, a hidratacao SSR nao tem mismatch e
     o flash some. -->
<style>
/* Default (modo nao definido, ainda no media query) — light atmosphere
   pra evitar flash quando OS=dark mas anti-flash ainda nao rodou.
   Bg um pouco mais saturado: wash de 8% (vs 4%) e meshes ~50% mais
   opacos pra dar presenca sem virar laranja editorial 100%. */
.hero-radiograph__bg {
  background: linear-gradient(180deg, color-mix(in srgb, var(--brand-primary) 8%, white) 0%, color-mix(in srgb, var(--brand-primary) 2%, white) 70%);
}
.hero-radiograph__mesh-amber {
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 45%, white), transparent 65%);
  opacity: 0.32;
}
.hero-radiograph__mesh-rose {
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 38%, white), transparent 70%);
  opacity: 0.20;
}
.hero-radiograph__mesh-soft {
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 40%, white), transparent 70%);
  opacity: 0.24;
}
.hero-radiograph__arc-stop1 { stop-opacity: 0.14; }
.hero-radiograph__arc-stop2 { stop-opacity: 0.06; }

/* Dark — saturated mesh on near-black, baseWash transparente */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not(.dark) .hero-radiograph__bg { background: transparent; }
  :root:not(.light):not(.dark) .hero-radiograph__mesh-amber {
    background: radial-gradient(circle, var(--brand-primary), transparent 65%);
    opacity: 0.30;
  }
  :root:not(.light):not(.dark) .hero-radiograph__mesh-rose {
    background: radial-gradient(circle, var(--brand-primary), transparent 70%);
    opacity: 0.18;
  }
  :root:not(.light):not(.dark) .hero-radiograph__mesh-soft {
    background: radial-gradient(circle, var(--brand-primary), transparent 70%);
    opacity: 0.20;
  }
  :root:not(.light):not(.dark) .hero-radiograph__arc-stop1 { stop-opacity: 0.22; }
  :root:not(.light):not(.dark) .hero-radiograph__arc-stop2 { stop-opacity: 0.08; }
}
:root.dark .hero-radiograph__bg { background: transparent; }
:root.dark .hero-radiograph__mesh-amber {
  background: radial-gradient(circle, var(--brand-primary), transparent 65%);
  opacity: 0.30;
}
:root.dark .hero-radiograph__mesh-rose {
  background: radial-gradient(circle, var(--brand-primary), transparent 70%);
  opacity: 0.18;
}
:root.dark .hero-radiograph__mesh-soft {
  background: radial-gradient(circle, var(--brand-primary), transparent 70%);
  opacity: 0.20;
}
:root.dark .hero-radiograph__arc-stop1 { stop-opacity: 0.22; }
:root.dark .hero-radiograph__arc-stop2 { stop-opacity: 0.08; }

/* ============ OPEN FINANCE ANIMATION (CARD 0) ============
   Loop de 8s: 0-2s digita CPF, 2-2.5s pisca check, 2.5-4.5s sincroniza
   bancos (dots), 4.5-7.5s ativos aparecem em cascata, 7.5-8s reset. */
.of-card { position: relative; }

/* Step 1: CPF typing — width vai de 0 ao tamanho total */
.of-cpf-typed {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: bottom;
  animation: of-cpf-type 8s infinite steps(14, end);
}
@keyframes of-cpf-type {
  0%   { max-width: 0; }
  25%  { max-width: 14ch; } /* 14 chars: 123.456.789-00 */
  100% { max-width: 14ch; }
}

/* Cursor pisca durante a digitacao, some quando termina */
.of-cpf-cursor {
  display: inline-block;
  color: var(--brand-primary);
  font-weight: 400;
  margin-left: 1px;
  animation: of-cursor-blink 0.7s infinite step-end, of-cursor-fade 8s infinite;
}
@keyframes of-cursor-blink {
  0%, 50%   { opacity: 1; }
  51%, 100% { opacity: 0; }
}
@keyframes of-cursor-fade {
  0%, 28%  { opacity: 1; }
  30%, 100% { opacity: 0; }
}

/* Checkmark aparece depois que CPF foi digitado */
.of-cpf-check {
  opacity: 0;
  transform: scale(0.5);
  animation: of-check-pop 8s infinite;
}
@keyframes of-check-pop {
  0%, 28% { opacity: 0; transform: scale(0.5); }
  32%     { opacity: 1; transform: scale(1.15); }
  38%, 100% { opacity: 1; transform: scale(1); }
}

/* Step 2: bancos sincronizando — dots pulsando em sequencia */
.of-banks-row {
  opacity: 0.4;
  animation: of-banks-show 8s infinite;
}
@keyframes of-banks-show {
  0%, 32%  { opacity: 0; transform: translateY(4px); }
  36%, 58% { opacity: 1; transform: translateY(0); }
  62%, 100% { opacity: 0.5; transform: translateY(0); }
}
.of-dot {
  opacity: 0.25;
  animation: of-dot-bounce 1.2s infinite;
}
.of-dot-1 { animation-delay: 0s; }
.of-dot-2 { animation-delay: 0.18s; }
.of-dot-3 { animation-delay: 0.36s; }
@keyframes of-dot-bounce {
  0%, 100% { opacity: 0.25; transform: scale(0.7); }
  40%      { opacity: 1; transform: scale(1.2); }
}

/* Step 3: ativos importados aparecem em cascata */
.of-asset-row {
  opacity: 0;
  transform: translateY(6px);
  animation: of-asset-in 8s infinite;
}
.of-asset-1 { animation-delay: 0s; }
.of-asset-2 { animation-delay: 0s; }
.of-asset-3 { animation-delay: 0s; }
.of-asset-4 { animation-delay: 0s; }
@keyframes of-asset-in {
  0%, 55% { opacity: 0; transform: translateY(6px); }
  100%    { opacity: 1; transform: translateY(0); }
}
.of-asset-1 { animation-name: of-asset-in-1; }
.of-asset-2 { animation-name: of-asset-in-2; }
.of-asset-3 { animation-name: of-asset-in-3; }
.of-asset-4 { animation-name: of-asset-in-4; }
@keyframes of-asset-in-1 {
  0%, 56% { opacity: 0; transform: translateY(6px); }
  62%, 100% { opacity: 1; transform: translateY(0); }
}
@keyframes of-asset-in-2 {
  0%, 62% { opacity: 0; transform: translateY(6px); }
  68%, 100% { opacity: 1; transform: translateY(0); }
}
@keyframes of-asset-in-3 {
  0%, 68% { opacity: 0; transform: translateY(6px); }
  74%, 100% { opacity: 1; transform: translateY(0); }
}
@keyframes of-asset-in-4 {
  0%, 74% { opacity: 0; transform: translateY(6px); }
  80%, 100% { opacity: 1; transform: translateY(0); }
}

/* Status badge alterna texto via pseudo-element pra acompanhar o estado */
.of-status-badge {
  position: relative;
}

@media (prefers-reduced-motion: reduce) {
  .of-cpf-typed,
  .of-cpf-cursor,
  .of-cpf-check,
  .of-banks-row,
  .of-dot,
  .of-asset-row {
    animation: none;
    opacity: 1;
    transform: none;
    max-width: 14ch;
  }
}
</style>
