<!--
  SlideScore — the headline gauge.

  Visual recipe:
    1. Outer halo pulse — radial gradient breathing behind everything
    2. Tick marks (60 of them) around the circumference, with the active
       ones (under the score arc) glowing amber and the rest dim
    3. Gradient ring tracing 0→score over 1.7s with a drop-shadow glow
    4. KineticNumber centered, emerges from blur fog
    5. Band badge slides up with a colored pulse dot
    6. Summary text appears last
-->
<template>
  <div class="sl-score">
    <p class="sl-score__kicker rxh-stagger" style="--rxh-delay: 60ms">
      Sua nota geral
    </p>

    <div class="sl-score__viz">
      <!-- Pulsing halo behind the gauge -->
      <div
        class="sl-score__halo"
        :style="{ background: `radial-gradient(circle, ${bandColor}55, transparent 65%)` }"
        aria-hidden="true"
      />

      <svg
        class="sl-score__ring"
        viewBox="0 0 220 220"
        aria-hidden="true"
      >
        <defs>
          <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :stop-color="ringStart" />
            <stop offset="100%" :stop-color="ringEnd" />
          </linearGradient>
          <filter :id="glowFilterId" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Tick marks ring (60 ticks) -->
        <g class="sl-score__ticks">
          <line
            v-for="(t, i) in ticks"
            :key="i"
            :x1="t.x1" :y1="t.y1"
            :x2="t.x2" :y2="t.y2"
            :stroke="t.active ? bandColor : 'rgba(255,255,255,0.12)'"
            :stroke-width="t.active ? 2 : 1"
            stroke-linecap="round"
            :style="{ '--tick-delay': `${300 + i * 14}ms`, '--tick-final-opacity': t.active ? 1 : 0.6 }"
          />
        </g>

        <!-- Idle track -->
        <circle
          cx="110" cy="110" r="84"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="6"
        />

        <!-- Animated arc -->
        <circle
          class="sl-score__arc"
          cx="110" cy="110" r="84"
          fill="none"
          :stroke="`url(#${gradientId})`"
          stroke-width="6"
          stroke-linecap="round"
          :filter="`url(#${glowFilterId})`"
          :style="{ '--sl-score-target': dashOffsetTarget }"
        />
      </svg>

      <div class="sl-score__center">
        <AtomsKineticNumber
          :value="score"
          :duration="1700"
          :delay-ms="280"
          class="sl-score__number"
        />
        <span class="sl-score__outof">de 100</span>
      </div>
    </div>

    <div class="sl-score__band rxh-stagger" style="--rxh-delay: 1600ms">
      <span class="sl-score__band-dot" :style="{ background: bandColor, boxShadow: `0 0 12px ${bandColor}` }" />
      <span class="sl-score__band-label" :style="{ color: bandColor }">{{ bandLabel }}</span>
    </div>

    <p
      v-if="summary"
      class="sl-score__summary rxh-stagger"
      style="--rxh-delay: 1900ms"
    >
      {{ shortSummary }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AtomsKineticNumber from '~/components/atoms/KineticNumber.vue'

interface Props {
  score: number
  band: 'critico' | 'atencao' | 'bom' | 'excelente'
  summary?: string
}
const props = withDefaults(defineProps<Props>(), { summary: '' })

const circumference = 2 * Math.PI * 84 // ~527.78
const dashOffsetTarget = computed(() => {
  const pct = Math.max(0, Math.min(100, props.score)) / 100
  return circumference - circumference * pct
})

const bandLabel = computed(() => {
  switch (props.band) {
    case 'excelente': return 'Excelente'
    case 'bom': return 'Boa'
    case 'atencao': return 'Atenção'
    case 'critico': return 'Crítica'
    default: return ''
  }
})

const bandColor = computed(() => {
  switch (props.band) {
    case 'excelente': return '#10b981'
    case 'bom': return '#84cc16'
    case 'atencao': return '#f59e0b'
    case 'critico': return '#ef4444'
    default: return '#fff'
  }
})

const ringStart = computed(() => bandColor.value)
const ringEnd = computed(() => 'var(--brand-primary, #f5a623)')

const uid = Math.random().toString(36).slice(2, 8)
const gradientId = `sl-score-grad-${uid}`
const glowFilterId = `sl-score-glow-${uid}`

// Build 60 ticks around a 100-radius circle, centered on (110, 110).
// Each tick rotates from the top (12 o'clock) going clockwise.
// The first `score% * 60` ticks are highlighted as "active".
const ticks = computed(() => {
  const total = 60
  const activeCount = Math.round((Math.max(0, Math.min(100, props.score)) / 100) * total)
  const out: Array<{ x1: number; y1: number; x2: number; y2: number; active: boolean }> = []
  const cx = 110
  const cy = 110
  const inner = 96
  const outer = 104
  for (let i = 0; i < total; i++) {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / total
    out.push({
      x1: cx + Math.cos(angle) * inner,
      y1: cy + Math.sin(angle) * inner,
      x2: cx + Math.cos(angle) * outer,
      y2: cy + Math.sin(angle) * outer,
      active: i < activeCount,
    })
  }
  return out
})

const shortSummary = computed(() => {
  if (!props.summary) return ''
  const clean = props.summary
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return clean.length > 200 ? clean.slice(0, 197) + '...' : clean
})
</script>

<style scoped>
.sl-score {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
}

.sl-score__kicker {
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}

.sl-score__viz {
  position: relative;
  width: clamp(260px, 44vw, 360px);
  height: clamp(260px, 44vw, 360px);
}

.sl-score__halo {
  position: absolute;
  inset: -20%;
  filter: blur(40px);
  opacity: 0;
  animation: sl-score-halo-in 1.4s ease-out 200ms forwards, sl-score-halo-breathe 4.5s ease-in-out 1.4s infinite;
}

@keyframes sl-score-halo-in {
  to { opacity: 0.7; }
}
@keyframes sl-score-halo-breathe {
  0%, 100% { opacity: 0.55; transform: scale(0.96); }
  50%      { opacity: 0.85; transform: scale(1.04); }
}

.sl-score__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.sl-score__ticks line {
  opacity: 0;
  animation: sl-score-tick-in 380ms ease-out var(--tick-delay, 0ms) forwards;
  transform-origin: center;
  transform-box: fill-box;
}

@keyframes sl-score-tick-in {
  from { opacity: 0; }
  to   { opacity: var(--tick-final-opacity, 1); }
}

.sl-score__arc {
  stroke-dasharray: 527.78;
  stroke-dashoffset: 527.78;
  animation: sl-score-arc 1700ms cubic-bezier(0.16, 1, 0.3, 1) 280ms forwards;
}

@keyframes sl-score-arc {
  to { stroke-dashoffset: var(--sl-score-target); }
}

.sl-score__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.sl-score__number {
  font-size: clamp(78px, 14vw, 140px);
  line-height: 1;
  font-weight: 200;
  letter-spacing: -0.04em;
  color: #fff;
  text-shadow: 0 0 32px color-mix(in srgb, var(--brand-primary, #f5a623) 32%, transparent);
  filter: blur(14px);
  opacity: 0;
  animation: sl-score-number-defog 900ms cubic-bezier(0.16, 1, 0.3, 1) 320ms forwards;
}

@keyframes sl-score-number-defog {
  0%   { filter: blur(14px); opacity: 0; transform: scale(0.85); }
  100% { filter: blur(0); opacity: 1; transform: scale(1); }
}

.sl-score__outof {
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 6px;
  opacity: 0;
  animation: sl-score-outof 600ms ease-out 1500ms forwards;
}

@keyframes sl-score-outof {
  to { opacity: 1; }
}

.sl-score__band {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

.sl-score__band-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.sl-score__band-label {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06em;
}

.sl-score__summary {
  max-width: 540px;
  font-size: clamp(14px, 2.2vw, 16px);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

.rxh-stagger {
  opacity: 0;
  transform: translate3d(0, 14px, 0);
  animation: rxh-stagger-in 700ms cubic-bezier(0.16, 1, 0.3, 1) var(--rxh-delay, 0ms) forwards;
}

@keyframes rxh-stagger-in {
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .sl-score__arc { animation: none; stroke-dashoffset: var(--sl-score-target); }
  .sl-score__number,
  .sl-score__halo,
  .sl-score__ticks line,
  .sl-score__outof,
  .rxh-stagger {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
