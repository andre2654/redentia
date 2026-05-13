<!--
  SlideOutro — share screen.

  Each card type (Score / P&L / Risk / Divs) renders in a horizontal
  carousel. Above each card the user picks one of 4 templates
  (Editorial / Aurora / Fintech / Wrapped) via tappable dots. Below
  the active card a sticky CTA exports the chosen template+type as a
  PNG and hands it to navigator.share — Instagram / WhatsApp / etc.

  The 4 templates live in `../share-cards/templates/`. They all accept
  the same flat-prop shape so swapping is trivial.

  Notable design decisions:
    - Per-card template state, persisted only in component memory
      (resets on slide remount, which is fine).
    - Carousel uses `scroll-snap` + invisible spacers so the first/
      last card can centre fully; pagination dots stay in sync via a
      debounced scroll listener.
    - Share button is a SINGLE bottom CTA (not floating overlays per
      card) — clearer affordance, easier to thumb.
-->
<template>
  <div class="sl-share">
    <div class="sl-share__inner">
      <!-- HEAD block — title + subtitle. On desktop sits top-left of
           the grid. On mobile this is the FIRST thing the user sees. -->
      <header class="sl-share__head">
        <p class="sl-share__kicker">
          <span class="sl-share__kicker-dot" aria-hidden="true" />
          Compartilhe seu Raio-X
        </p>
        <h2 class="sl-share__title">
          Mostre seus números<br>
          <span class="sl-share__title-em">para o mundo.</span>
        </h2>
        <p class="sl-share__sub">
          Escolha o card e o template, depois manda direto pro
          Instagram, WhatsApp ou onde você quiser.
        </p>
      </header>

      <!-- CTA block — single share button for the active card.
           On desktop sits bottom-left of the grid. On mobile lives
           BELOW the carousel so the user picks a card first. -->
      <div class="sl-share__cta">
        <button
          type="button"
          class="sl-share__share-btn"
          :disabled="sharingIdx !== null"
          @click="shareCard(activeIdx)"
        >
          <svg v-if="sharingIdx !== activeIdx" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" class="sl-share__spin" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke-dasharray="14 14" />
          </svg>
          <span>{{ sharingIdx === activeIdx ? 'Gerando imagem…' : 'Compartilhar' }}</span>
        </button>
        <p v-if="shareError" class="sl-share__error" role="status">{{ shareError }}</p>
      </div>

      <!-- RIGHT column: cards carousel + pagination dots -->
      <div class="sl-share__stage">
      <!-- Carousel of cards (one per metric type) -->
      <div class="sl-share__viewport">
        <button
          v-if="cards.length > 1"
          type="button"
          class="sl-share__nav sl-share__nav--prev"
          :disabled="activeIdx === 0"
          aria-label="Card anterior"
          @click="scrollToCard(activeIdx - 1)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div class="sl-share__carousel" ref="carouselEl" @scroll.passive="onCarouselScroll">
          <div class="sl-share__pad" aria-hidden="true" />
          <article
            v-for="(card, i) in cards"
            :key="card.id"
            ref="cardEls"
            class="sl-share__card"
            :data-idx="i"
          >
            <!-- Template picker — 4 dots, one per skin -->
            <div class="sl-share__tpl-picker" role="tablist" :aria-label="`Templates do card ${card.label}`">
              <button
                v-for="t in TEMPLATES"
                :key="t.key"
                type="button"
                class="sl-share__tpl-dot"
                :class="{ 'is-active': templateByCard[card.id] === t.key }"
                :style="{ background: templateByCard[card.id] === t.key ? t.tint : undefined }"
                role="tab"
                :aria-selected="templateByCard[card.id] === t.key"
                :title="t.label"
                @click="templateByCard[card.id] = t.key"
              >
                <span class="sr-only">{{ t.label }}</span>
              </button>
            </div>

            <!-- The card itself — dynamic template by type+choice -->
            <div class="sl-share__card-frame">
              <component
                :is="templateComponentFor(card.id)"
                v-bind="card.props"
              />
            </div>

            <!-- Template name caption under the card -->
            <p class="sl-share__tpl-name">{{ templateLabelFor(card.id) }}</p>
          </article>
          <div class="sl-share__pad" aria-hidden="true" />
        </div>

        <button
          v-if="cards.length > 1"
          type="button"
          class="sl-share__nav sl-share__nav--next"
          :disabled="activeIdx === cards.length - 1"
          aria-label="Próximo card"
          @click="scrollToCard(activeIdx + 1)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <!-- Pagination dots (which card is centred) -->
      <div v-if="cards.length > 1" class="sl-share__dots" role="tablist" aria-label="Selecionar card">
        <button
          v-for="(card, i) in cards"
          :key="card.id"
          type="button"
          class="sl-share__pgdot"
          :class="{ 'is-active': i === activeIdx }"
          :aria-label="`Ir para card ${i + 1} de ${cards.length}`"
          :aria-selected="i === activeIdx"
          role="tab"
          @click="scrollToCard(i)"
        />
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from 'vue'
import type { PortfolioAnalysis } from '~/services/walletData'
import type { PortfolioReport } from '~/composables/usePortfolioScore'
import type { UnifiedPosition } from '~/services/portfolio'

import EditorialTpl from '../share-cards/templates/Editorial.vue'
import AuroraTpl from '../share-cards/templates/Aurora.vue'
import FintechTpl from '../share-cards/templates/Fintech.vue'
import WrappedTpl from '../share-cards/templates/Wrapped.vue'

interface PnlPoint { date: string; value: number }
type CardId = 'score' | 'pnl' | 'risk' | 'divs'
type TemplateKey = 'editorial' | 'aurora' | 'fintech' | 'wrapped'

interface Props {
  score?: number
  analysis?: PortfolioAnalysis | null
  report?: PortfolioReport | null
  positions?: UnifiedPosition[]
  totalValue?: number
  equityCurve?: PnlPoint[]
  userName?: string
}
const props = withDefaults(defineProps<Props>(), {
  score: 0,
  analysis: null,
  report: null,
  positions: () => [],
  totalValue: 0,
  equityCurve: () => [],
  userName: '',
})

defineEmits<{ close: [] }>()

// ============ Templates registry ============
// shallowRef on the components themselves so Vue doesn't deeply track
// the (large) component definitions — just the reference.
const TEMPLATES: Array<{ key: TemplateKey; label: string; tint: string; comp: any }> = [
  { key: 'editorial', label: 'Editorial', tint: '#b8861e', comp: shallowRef(EditorialTpl).value },
  { key: 'aurora',    label: 'Aurora',    tint: '#f3c870', comp: shallowRef(AuroraTpl).value },
  { key: 'fintech',   label: 'Fintech',   tint: '#5cd99a', comp: shallowRef(FintechTpl).value },
  { key: 'wrapped',   label: 'Wrapped',   tint: '#a070ff', comp: shallowRef(WrappedTpl).value },
]
const TEMPLATE_BY_KEY = Object.fromEntries(TEMPLATES.map((t) => [t.key, t]))

// Per-card-type template selection — initialised to a sensible default.
const templateByCard = reactive<Record<CardId, TemplateKey>>({
  score: 'wrapped',
  pnl: 'wrapped',
  risk: 'editorial',
  divs: 'aurora',
})

function templateComponentFor(id: string): any {
  return TEMPLATE_BY_KEY[templateByCard[id as CardId]]?.comp ?? EditorialTpl
}
function templateLabelFor(id: string): string {
  return TEMPLATE_BY_KEY[templateByCard[id as CardId]]?.label ?? ''
}

// ============ Carousel state ============
const carouselEl = ref<HTMLElement | null>(null)
const cardEls = ref<HTMLElement[]>([])
const activeIdx = ref(0)
const sharingIdx = ref<number | null>(null)
const shareError = ref('')

let scrollDebounce: ReturnType<typeof setTimeout> | null = null
function onCarouselScroll() {
  if (scrollDebounce) clearTimeout(scrollDebounce)
  scrollDebounce = setTimeout(() => {
    const el = carouselEl.value
    if (!el || !cardEls.value.length) return
    const viewportCentre = el.scrollLeft + el.clientWidth / 2
    let bestIdx = 0
    let bestDist = Infinity
    cardEls.value.forEach((cardEl, i) => {
      const centre = cardEl.offsetLeft + cardEl.offsetWidth / 2
      const dist = Math.abs(centre - viewportCentre)
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = i
      }
    })
    activeIdx.value = bestIdx
  }, 80)
}

function scrollToCard(idx: number) {
  const target = cardEls.value[idx]
  const el = carouselEl.value
  if (!target || !el) return
  const left = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2
  el.scrollTo({ left, behavior: 'smooth' })
}

// ============ Derived data ============
const scoreVal = computed(() => Math.round(props.score || props.analysis?.score || 0))
const band = computed(() =>
  (props.analysis?.score_band || props.report?.band || 'bom') as 'critico' | 'atencao' | 'bom' | 'excelente')

const pnlAmount = computed(() => {
  const c = props.equityCurve
  if (!c?.length) return 0
  return (c[c.length - 1]?.value ?? 0) - (c[0]?.value ?? 0)
})
const pnlPct = computed(() => {
  const c = props.equityCurve
  if (!c?.length) return 0
  const first = c[0]?.value ?? 0
  const last = c[c.length - 1]?.value ?? 0
  if (!first) return 0
  return ((last - first) / Math.abs(first)) * 100
})

const topRisk = computed(() => {
  const risks = [...(props.analysis?.risks ?? [])]
  if (!risks.length) return null
  const weight = (s: string) => (s === 'high' ? 3 : s === 'medium' ? 2 : 1)
  risks.sort((a, b) => weight(b.severity) - weight(a.severity))
  return risks[0] ?? null
})

const riskCardProps = computed(() => {
  const r = topRisk.value
  if (!r) return null
  const text = `${r.title} ${r.body}`
  const pctMatch = text.match(/(\d{1,3})\s*%/)
  const value: number | string = pctMatch ? parseInt(pctMatch[1]!, 10) : '!'
  const suffix = pctMatch ? '%' : ''

  // Trim long bodies down to just the asset list when available.
  const body = r.body ?? ''
  const parenMatch = body.match(/\(([^)]+)\)/)
  let shortBody = ''
  if (parenMatch?.[1]) {
    shortBody = parenMatch[1].trim()
  } else {
    const firstClause = body.split(/[.;]/)[0]?.trim() ?? ''
    shortBody = firstClause.length > 90 ? `${firstClause.slice(0, 88).trim()}…` : firstClause
  }
  return { riskValue: value, riskSuffix: suffix, riskBody: shortBody, riskSeverity: (r.severity as 'low' | 'medium' | 'high') }
})

const monthlyDivs = computed(() => {
  if (!props.report) return 0
  const ratio = (props.totalValue || 0) / 100000
  return (props.report.monthlyDividendsTotal || 0) * ratio
})

interface CardEntry {
  id: CardId
  label: string
  props: Record<string, any>
}

const cards = computed<CardEntry[]>(() => {
  const out: CardEntry[] = []

  if (scoreVal.value > 0) {
    out.push({
      id: 'score',
      label: 'Score',
      props: { type: 'score', score: scoreVal.value, band: band.value },
    })
  }
  if (props.equityCurve?.length >= 2 && pnlAmount.value !== 0) {
    out.push({
      id: 'pnl',
      label: 'P&L',
      props: { type: 'pnl', pnlAmount: pnlAmount.value, pnlPct: pnlPct.value, pnlDays: props.equityCurve.length },
    })
  }
  if (riskCardProps.value) {
    out.push({
      id: 'risk',
      label: 'Risco',
      props: { type: 'risk', ...riskCardProps.value },
    })
  }
  if (monthlyDivs.value > 0) {
    out.push({
      id: 'divs',
      label: 'Dividendos',
      props: { type: 'divs', monthly: monthlyDivs.value },
    })
  }
  return out
})

// ============ Share flow ============
async function shareCard(idx: number) {
  shareError.value = ''
  const cardEl = cardEls.value[idx]
  const card = cards.value[idx]
  if (!cardEl || !card) return

  // Capture ONLY the rendered template, not the picker dots / caption.
  const target = cardEl.querySelector('.sl-share__card-frame') as HTMLElement | null
  if (!target) return

  sharingIdx.value = idx
  try {
    const html2canvas = (await import('html2canvas-pro')).default
    const canvas = await html2canvas(target, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
      logging: false,
    })
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob falhou'))), 'image/png', 0.95)
    })

    const tpl = templateByCard[card.id]
    const filename = `meu-raio-x-${card.id}-${tpl}.png`
    const file = new File([blob], filename, { type: 'image/png' })

    if (typeof navigator !== 'undefined'
      && 'canShare' in navigator
      && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Meu Raio-X · Redentia',
        text: 'Olha meu Raio-X de carteira pela Redentia',
      })
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      shareError.value = 'Imagem salva. Abra o Instagram ou WhatsApp para postar.'
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      shareError.value = ''
    } else {
      console.warn('[share] failed', err)
      shareError.value = 'Não consegui gerar a imagem. Tenta de novo?'
    }
  } finally {
    sharingIdx.value = null
  }
}
</script>

<style scoped>
.sl-share {
  position: relative;
  width: 100%;
  max-width: 1100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Two-column grid on desktop — head + cta stacked on the left,
   stage (carousel) spanning the right column. On mobile we collapse
   to one column AND reorder so the read flow is:
     head → stage → cta
   (title first, pick a card, then share). */
.sl-share__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  grid-template-rows: auto auto;
  grid-template-areas:
    "head stage"
    "cta  stage";
  align-items: center;
  gap: 24px 48px;
  width: 100%;
}

.sl-share__head  { grid-area: head; align-self: end; }
.sl-share__cta   { grid-area: cta;  align-self: start; }
.sl-share__stage {
  grid-area: stage;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

@media (max-width: 880px) {
  .sl-share__inner {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      "head"
      "stage"
      "cta";
    gap: 16px;
  }
  .sl-share__head,
  .sl-share__cta {
    align-self: center;
    text-align: center;
    align-items: center;
  }
  /* Strip the header way down on mobile — the kicker carries the
     framing ("Compartilhe seu Raio-X") and the title is the hero.
     The subtitle prose is dead weight on a small screen, hide it. */
  .sl-share__head {
    padding: 0 16px;
    gap: 6px;
  }
  .sl-share__sub { display: none; }
  .sl-share__title {
    font-size: clamp(20px, 6vw, 26px);
    line-height: 1.15;
  }
}

/* ============ Header ============ */
.sl-share__head {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sl-share__kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--brand-primary, #f5a623);
  font-weight: 500;
  margin: 0;
}
.sl-share__kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}
.sl-share__title {
  font-size: clamp(24px, 4vw, 36px);
  line-height: 1.1;
  font-weight: 300;
  letter-spacing: -0.025em;
  color: #fff;
  margin: 0;
}
.sl-share__title-em {
  font-family: 'Instrument Serif', 'Didot', serif;
  font-style: italic;
  font-weight: 400;
  color: #d9a635;
}

.sl-share__sub {
  font-size: 13.5px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.55);
  margin: 6px 0 0;
  max-width: 320px;
}

/* ============ Carousel ============ */
.sl-share__viewport {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sl-share__carousel {
  display: flex;
  gap: 28px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0 22px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  width: 100%;
  /* touch-action ensures horizontal pan goes to scroll, not the
     parent modal's hold-to-pause / etc. */
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
}
.sl-share__carousel::-webkit-scrollbar { display: none; }

/* Spacers so first/last card can centre fully in the viewport. */
.sl-share__pad {
  flex: 0 0 calc(50% - 160px);
}

.sl-share__card {
  flex: 0 0 320px;
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  scroll-snap-align: center;
  scroll-snap-stop: always;
}

/* The card frame holds the actual rendered template. Sized 9:16,
   used as the html2canvas capture target. */
.sl-share__card-frame {
  position: relative;
  width: 320px;
  aspect-ratio: 9 / 16;
  border-radius: 18px;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 22px 60px -22px rgba(0, 0, 0, 0.65);
}

/* ============ Template picker ============ */
.sl-share__tpl-picker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  isolation: isolate;
}
.sl-share__tpl-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform 140ms ease-out, border-color 140ms ease-out;
  padding: 0;
  position: relative;
}
.sl-share__tpl-dot:hover {
  transform: scale(1.15);
  border-color: rgba(255, 255, 255, 0.6);
}
.sl-share__tpl-dot.is-active {
  border-color: #fff;
  transform: scale(1.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
}
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0);
  white-space: nowrap; border: 0;
}

.sl-share__tpl-name {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
  margin: 0;
}

/* ============ Side arrows (desktop) ============ */
.sl-share__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(20, 12, 6, 0.85);
  border: 1px solid rgba(217, 166, 53, 0.4);
  color: #f3c870;
  cursor: pointer;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: background 180ms ease-out, transform 120ms ease-out, opacity 180ms ease-out;
  box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.6);
}
.sl-share__nav:hover {
  background: rgba(40, 24, 10, 0.92);
  color: #fff5d6;
}
.sl-share__nav:active { transform: translateY(calc(-50% + 1px)); }
.sl-share__nav:disabled { opacity: 0.25; cursor: not-allowed; }
.sl-share__nav--prev { left: 8px; }
.sl-share__nav--next { right: 8px; }

@media (max-width: 720px) {
  .sl-share__nav { display: none; }
}

/* ============ Pagination dots ============ */
.sl-share__dots {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  isolation: isolate;
  position: relative;
  z-index: 2;
  margin-top: 4px;
}
.sl-share__pgdot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition: background 180ms ease-out, width 180ms ease-out;
  padding: 0;
  box-shadow: none;
  filter: none;
  outline: none;
  mix-blend-mode: normal;
}
.sl-share__pgdot:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}
.sl-share__pgdot:hover { background: rgba(255, 255, 255, 0.4); }
.sl-share__pgdot.is-active {
  width: 22px;
  background: rgba(255, 255, 255, 0.85);
}

/* ============ CTA block ============ */
.sl-share__cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.sl-share__share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 28px;
  width: 100%;
  max-width: 320px;
  border: 0;
  background: linear-gradient(180deg, #f3c870 0%, #d9a635 100%);
  color: #1a1408;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 120ms ease-out, filter 180ms ease-out;
  box-shadow: 0 10px 24px -8px rgba(243, 200, 112, 0.5);
}
.sl-share__share-btn:hover { filter: brightness(1.05); }
.sl-share__share-btn:active { transform: translateY(1px); }
.sl-share__share-btn:disabled {
  opacity: 0.7;
  cursor: progress;
  filter: none;
}

.sl-share__spin { animation: sl-share-spin 800ms linear infinite; }
@keyframes sl-share-spin { to { transform: rotate(360deg); } }

.sl-share__error {
  margin: 0;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12.5px;
  text-align: center;
}

</style>
