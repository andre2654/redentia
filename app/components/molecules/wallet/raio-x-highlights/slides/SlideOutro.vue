<!--
  SlideOutro — share screen with 4 polaroid-style cards (Score, P&L,
  Risk, Dividends). Each one captures-to-PNG via html2canvas-pro and
  hands the file to navigator.share so the user picks Instagram /
  WhatsApp / Stories from the native share sheet.

  Templates live under `../share-cards/`. The chrome (paper, stars,
  halftone, footer) is shared via <ShareCardChrome>.
-->
<template>
  <div class="sl-share">
    <div class="sl-share__inner">
      <header class="sl-share__head">
        <p class="sl-share__kicker">
          <span class="sl-share__dot" aria-hidden="true" />
          Compartilhe seu Raio-X
        </p>
        <h2 class="sl-share__title">
          Mostre seus números<br />
          <span class="sl-share__title-em">para o mundo.</span>
        </h2>
      </header>

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
          <article
            v-for="(card, i) in cards"
            :key="card.id"
            ref="cardEls"
            class="sl-share__card"
          >
            <component :is="card.component" v-bind="card.props" />

            <div class="sl-share__card-actions">
              <button
                type="button"
                class="sl-share__share-btn"
                :disabled="sharingIdx === i"
                @click="shareCard(i)"
              >
                <svg v-if="sharingIdx !== i" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" class="sl-share__spin" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke-dasharray="14 14" />
                </svg>
                <span>{{ sharingIdx === i ? 'Gerando…' : 'Compartilhar' }}</span>
              </button>
            </div>
          </article>
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

      <!-- Pagination dots — shows which card is centred + tap to jump -->
      <div v-if="cards.length > 1" class="sl-share__dots" role="tablist" aria-label="Selecionar card">
        <button
          v-for="(card, i) in cards"
          :key="card.id"
          type="button"
          class="sl-share__dot"
          :class="{ 'is-active': i === activeIdx }"
          :aria-label="`Ir para card ${i + 1} de ${cards.length}`"
          :aria-selected="i === activeIdx"
          role="tab"
          @click="scrollToCard(i)"
        />
      </div>

      <p v-if="shareError" class="sl-share__error">{{ shareError }}</p>

      <button type="button" class="sl-share__close-cta" @click="$emit('close')">
        Ver Raio-X completo
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PortfolioAnalysis } from '~/services/walletData'
import type { PortfolioReport } from '~/composables/usePortfolioScore'
import type { UnifiedPosition } from '~/services/portfolio'

import ShareCardScore from '../share-cards/ShareCardScore.vue'
import ShareCardPnl from '../share-cards/ShareCardPnl.vue'
import ShareCardRisk from '../share-cards/ShareCardRisk.vue'
import ShareCardDivs from '../share-cards/ShareCardDivs.vue'

interface PnlPoint { date: string; value: number }

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

const carouselEl = ref<HTMLElement | null>(null)
const cardEls = ref<HTMLElement[]>([])
const sharingIdx = ref<number | null>(null)
const shareError = ref('')

// Active card index — derived from scrollLeft so swipe + arrow keys
// keep the dot indicator in sync.
const activeIdx = ref(0)

let scrollDebounce: ReturnType<typeof setTimeout> | null = null
function onCarouselScroll() {
  if (scrollDebounce) clearTimeout(scrollDebounce)
  scrollDebounce = setTimeout(() => {
    const el = carouselEl.value
    if (!el || !cardEls.value.length) return
    // Pick whichever card centre is closest to the viewport centre.
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

// ============ Derived values ============
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

// Top risk by severity, with concentration risk preferred if present.
const topRisk = computed(() => {
  const risks = [...(props.analysis?.risks ?? [])]
  if (!risks.length) return null
  const weight = (s: string) => (s === 'high' ? 3 : s === 'medium' ? 2 : 1)
  risks.sort((a, b) => weight(b.severity) - weight(a.severity))
  return risks[0] ?? null
})

// Try to extract the headline number from the risk body (e.g. "62%").
// Falls back to severity tag if no number is present.
const riskCardProps = computed(() => {
  const r = topRisk.value
  if (!r) return null
  const text = `${r.title} ${r.body}`
  const pctMatch = text.match(/(\d{1,3})\s*%/)
  const value: number | string = pctMatch ? parseInt(pctMatch[1]!, 10) : '!'
  const suffix = pctMatch ? '%' : ''
  return {
    value,
    suffix,
    body: r.body,
    pillLabel: r.severity === 'high' ? 'Risco alto' : r.severity === 'medium' ? 'Risco médio' : 'Risco baixo',
  }
})

const monthlyDivs = computed(() => {
  if (!props.report) return 0
  const ratio = (props.totalValue || 0) / 100000
  return (props.report.monthlyDividendsTotal || 0) * ratio
})

const cards = computed(() => {
  const out: Array<{ id: string; component: any; props: Record<string, any> }> = []

  if (scoreVal.value > 0) {
    out.push({
      id: 'score',
      component: ShareCardScore,
      props: { score: scoreVal.value, band: band.value },
    })
  }

  if (props.equityCurve?.length >= 2 && pnlAmount.value !== 0) {
    out.push({
      id: 'pnl',
      component: ShareCardPnl,
      props: {
        amount: pnlAmount.value,
        pct: pnlPct.value,
        days: props.equityCurve.length,
        positive: pnlAmount.value >= 0,
      },
    })
  }

  if (riskCardProps.value) {
    out.push({
      id: 'risk',
      component: ShareCardRisk,
      props: riskCardProps.value,
    })
  }

  if (monthlyDivs.value > 0) {
    out.push({
      id: 'divs',
      component: ShareCardDivs,
      props: { monthly: monthlyDivs.value },
    })
  }

  return out
})

// ============ Share flow ============
async function shareCard(idx: number) {
  shareError.value = ''
  const target = cardEls.value[idx]
  if (!target) return

  sharingIdx.value = idx
  try {
    const html2canvas = (await import('html2canvas-pro')).default
    const canvas = await html2canvas(target, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    })
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob falhou'))), 'image/png', 0.95)
    })

    const filename = `meu-raio-x-${cards.value[idx]?.id}.png`
    const file = new File([blob], filename, { type: 'image/png' })

    if (typeof navigator !== 'undefined'
      && 'canShare' in navigator
      && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Meu Raio-X · Redent.IA',
        text: 'Olha meu Raio-X de carteira pela Redent.IA',
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
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sl-share__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.sl-share__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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

.sl-share__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}

.sl-share__title {
  font-size: clamp(26px, 4.5vw, 40px);
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

/* ============ Carousel ============ */
.sl-share__viewport {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Make sure the side arrows have room to live without overlapping
     the card on smaller screens. */
}

.sl-share__carousel {
  display: flex;
  gap: 22px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px 0 36px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  width: 100%;
  /* Centre-pad so first and last cards can fully centre in the viewport. */
  scroll-padding-inline: 50%;
}

.sl-share__carousel::-webkit-scrollbar { display: none; }

.sl-share__carousel::before,
.sl-share__carousel::after {
  content: '';
  flex: 0 0 calc(50% - (var(--card-w) / 2));
}

/* Fixed dimensions: same on desktop and mobile so users get the
   same composition + the share PNG renders identically across devices. */
.sl-share__card {
  --card-w: 320px;
  flex: 0 0 var(--card-w);
  width: var(--card-w);
  aspect-ratio: 9 / 16;
  border-radius: 18px;
  position: relative;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  isolation: isolate;
}

/* ============ Side arrows (desktop primarily — still tappable mobile) ============ */
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
  transition: background 180ms ease-out, transform 120ms ease-out, opacity 180ms ease-out;
  box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.6);
}

.sl-share__nav:hover {
  background: rgba(40, 24, 10, 0.92);
  color: #fff5d6;
}

.sl-share__nav:active {
  transform: translateY(calc(-50% + 1px));
}

.sl-share__nav:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.sl-share__nav--prev { left: 8px; }
.sl-share__nav--next { right: 8px; }

@media (max-width: 720px) {
  /* On phones the swipe gesture is the primary nav, so hide the
     side arrows and lean on the bottom dots. */
  .sl-share__nav { display: none; }
}

/* ============ Pagination dots ============ */
.sl-share__dots {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: -8px;
  /* Isolation kills any blend-mode bleed from the backdrop particles
     so the dots render flat (no halo around them). */
  isolation: isolate;
  position: relative;
  z-index: 2;
}

.sl-share__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition: background 180ms ease-out, width 180ms ease-out;
  padding: 0;
  /* Belt-and-suspenders against ambient glow / focus rings / blur. */
  box-shadow: none;
  filter: none;
  outline: none;
  mix-blend-mode: normal;
}

.sl-share__dot:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

.sl-share__dot:hover {
  background: rgba(255, 255, 255, 0.4);
}

.sl-share__dot.is-active {
  width: 22px;
  background: rgba(255, 255, 255, 0.85);
}

/* ============ Share button overlay ============ */
.sl-share__card-actions {
  position: absolute;
  left: 50%;
  bottom: -22px;
  transform: translateX(-50%);
  z-index: 10;
}

.sl-share__share-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid rgba(217, 166, 53, 0.5);
  background: rgba(20, 12, 6, 0.85);
  backdrop-filter: blur(10px);
  color: #f3c870;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 180ms ease-out, transform 120ms ease-out, color 180ms ease-out;
  box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.6);
}

.sl-share__share-btn:hover {
  background: rgba(40, 24, 10, 0.92);
  color: #fff5d6;
}
.sl-share__share-btn:active { transform: translate(-50%, 1px); }
.sl-share__share-btn:disabled {
  opacity: 0.7;
  cursor: progress;
}

.sl-share__spin { animation: sl-share-spin 800ms linear infinite; }
@keyframes sl-share-spin {
  to { transform: rotate(360deg); }
}

.sl-share__error {
  margin: 0;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12.5px;
  max-width: 480px;
}

.sl-share__close-cta {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 22px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 14px;
  transition: background 180ms ease-out, transform 120ms ease-out;
}

.sl-share__close-cta:hover { background: rgba(255, 255, 255, 0.08); }
.sl-share__close-cta:active { transform: translateY(1px); }
</style>
