<!--
  SlideSnowflake — animated radar reveal.

  Choreography:
    1. Rings fade in
    2. Spokes draw outward one-by-one (path stroke-dasharray reveal)
    3. Polygon morphs from a centre dot to its final shape
    4. Vertex bursts (bloom flare) when each vertex lands
    5. Labels fade in
    6. Subline appears
-->
<template>
  <div class="sl-snow">
    <p class="sl-snow__kicker rxh-stagger" style="--rxh-delay: 0ms">
      Sua carteira em 5 eixos
    </p>

    <div class="sl-snow__viz">
      <svg :viewBox="`0 0 ${size} ${size}`" overflow="visible" class="sl-snow__svg" aria-hidden="true">
        <defs>
          <radialGradient id="sl-snow-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="var(--brand-primary, #f5a623)" stop-opacity="0.9" />
            <stop offset="100%" stop-color="var(--brand-primary, #f5a623)" stop-opacity="0.45" />
          </radialGradient>
          <filter id="sl-snow-bloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Guide rings — fade in first -->
        <g class="sl-snow__rings">
          <polygon
            v-for="(scale, i) in [0.25, 0.5, 0.75, 1]"
            :key="`ring-${i}`"
            :points="ringPoints(scale)"
            fill="none"
            :stroke="i === 3 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'"
            stroke-width="1"
          />
        </g>

        <!-- Spokes draw from centre outward -->
        <g>
          <line
            v-for="(p, i) in axisTips"
            :key="`spoke-${i}`"
            :x1="center" :y1="center"
            :x2="p.x" :y2="p.y"
            stroke="rgba(255,255,255,0.28)"
            stroke-width="1.2"
            stroke-linecap="round"
            class="sl-snow__spoke"
            :style="{ '--spoke-delay': `${i * 110 + 300}ms` }"
            pathLength="100"
          />
        </g>

        <!-- Filled polygon morphs from centre -->
        <polygon
          class="sl-snow__poly"
          :points="polygonPoints"
          fill="url(#sl-snow-fill)"
          stroke="var(--brand-primary, #f5a623)"
          stroke-width="1.5"
          filter="url(#sl-snow-bloom)"
        />

        <!-- Vertex bloom flares (the flash when a vertex "lands") -->
        <g>
          <circle
            v-for="(p, i) in vertexPoints"
            :key="`flare-${i}`"
            :cx="p.x" :cy="p.y"
            r="0"
            fill="var(--brand-primary, #f5a623)"
            class="sl-snow__flare"
            :style="{ '--flare-delay': `${i * 110 + 1100}ms` }"
          />
        </g>

        <!-- Vertex dots (final state) -->
        <g>
          <circle
            v-for="(p, i) in vertexPoints"
            :key="`vx-${i}`"
            :cx="p.x" :cy="p.y" r="4.5"
            fill="var(--brand-primary, #f5a623)"
            stroke="#fff"
            stroke-width="1.2"
            class="sl-snow__vertex"
            :style="{ '--vx-delay': `${i * 110 + 1180}ms` }"
          />
        </g>

        <!-- Axis labels -->
        <g class="sl-snow__labels">
          <text
            v-for="(p, i) in labelPoints"
            :key="`lbl-${i}`"
            :x="p.x" :y="p.y"
            :text-anchor="p.anchor"
            :dominant-baseline="p.baseline"
            class="sl-snow__label"
            :style="{ '--lbl-delay': `${i * 110 + 900}ms` }"
          >
            <tspan class="sl-snow__label-name">{{ axes[i]?.label }}</tspan>
            <tspan
              class="sl-snow__label-val"
              :x="p.x"
              :dy="'1.3em'"
            >{{ Math.round(axes[i]?.value ?? 0) }}</tspan>
          </text>
        </g>
      </svg>
    </div>

    <p class="sl-snow__subline rxh-stagger" style="--rxh-delay: 1900ms">
      Mais forte em <strong>{{ topAxis?.label.toLowerCase() }}</strong>.
      Mais fraco em <strong>{{ bottomAxis?.label.toLowerCase() }}</strong>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PortfolioAnalysis } from '~/services/walletData'
import type { PortfolioReport } from '~/composables/usePortfolioScore'

interface Props {
  analysis: PortfolioAnalysis | null
  report?: PortfolioReport | null
}
const props = withDefaults(defineProps<Props>(), { report: null })

const size = 380
const center = size / 2
const maxRadius = (size / 2) - 40

function dimByKey(key: string): number {
  const d = props.analysis?.dimensions?.find((x) => x.key === key)
  return d?.value ?? 0
}

const axes = computed(() => {
  const quality = dimByKey('quality')
  const growth = dimByKey('growth')
  const volatility = dimByKey('volatility')
  const income = dimByKey('income')
  const diversification = dimByKey('diversification')
  const concentration = dimByKey('concentration')
  const macro = dimByKey('macro')
  const healthInputs = [diversification, concentration, macro].filter((x) => x > 0)
  const health = healthInputs.length
    ? Math.round(healthInputs.reduce((s, v) => s + v, 0) / healthInputs.length)
    : 0
  return [
    { key: 'valor', label: 'Valor', value: quality },
    { key: 'futuro', label: 'Futuro', value: growth },
    { key: 'passado', label: 'Passado', value: volatility },
    { key: 'saude', label: 'Saúde', value: health },
    { key: 'dividendos', label: 'Dividendos', value: income },
  ]
})

const angles = computed(() =>
  axes.value.map((_, i) => (-Math.PI / 2) + (i * 2 * Math.PI) / axes.value.length),
)

const axisTips = computed(() =>
  angles.value.map((a) => ({
    x: center + Math.cos(a) * maxRadius,
    y: center + Math.sin(a) * maxRadius,
  })),
)

function ringPoints(scale: number): string {
  return angles.value
    .map((a) => {
      const x = center + Math.cos(a) * maxRadius * scale
      const y = center + Math.sin(a) * maxRadius * scale
      return `${x},${y}`
    })
    .join(' ')
}

const vertexPoints = computed(() =>
  axes.value.map((ax, i) => {
    const a = angles.value[i]!
    const r = (ax.value / 100) * maxRadius
    return { x: center + Math.cos(a) * r, y: center + Math.sin(a) * r }
  }),
)

const polygonPoints = computed(() =>
  vertexPoints.value.map((p) => `${p.x},${p.y}`).join(' '),
)

const labelPoints = computed(() =>
  angles.value.map((a) => {
    const r = maxRadius + 26
    const x = center + Math.cos(a) * r
    const y = center + Math.sin(a) * r
    let anchor: 'start' | 'middle' | 'end' = 'middle'
    if (x > center + 6) anchor = 'start'
    else if (x < center - 6) anchor = 'end'
    let baseline: 'middle' | 'hanging' | 'auto' = 'middle'
    if (y < center - 6) baseline = 'auto'
    else if (y > center + 6) baseline = 'hanging'
    return { x, y, anchor, baseline }
  }),
)

const sorted = computed(() => [...axes.value].sort((a, b) => b.value - a.value))
const topAxis = computed(() => sorted.value[0])
const bottomAxis = computed(() => sorted.value[sorted.value.length - 1])
</script>

<style scoped>
.sl-snow {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.sl-snow__kicker {
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}

.sl-snow__viz {
  width: clamp(300px, 52vw, 460px);
  height: clamp(300px, 52vw, 460px);
  position: relative;
}

.sl-snow__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Rings */
.sl-snow__rings {
  opacity: 0;
  animation: sl-snow-fade-in 600ms ease-out 80ms forwards;
}

/* Spokes — draw outward */
.sl-snow__spoke {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: sl-snow-spoke-draw 520ms cubic-bezier(0.16, 1, 0.3, 1) var(--spoke-delay, 0ms) forwards;
}

@keyframes sl-snow-spoke-draw {
  to { stroke-dashoffset: 0; }
}

/* Polygon morph from a single centre point */
.sl-snow__poly {
  transform-origin: 50% 50%;
  transform: scale(0);
  opacity: 0;
  animation: sl-snow-poly-bloom 1100ms cubic-bezier(0.34, 1.56, 0.64, 1) 950ms forwards;
}

@keyframes sl-snow-poly-bloom {
  0%   { transform: scale(0); opacity: 0; }
  60%  { opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Vertex flare burst (then fades out) */
.sl-snow__flare {
  opacity: 0;
  animation: sl-snow-flare-burst 700ms ease-out var(--flare-delay, 0ms) forwards;
  filter: blur(2px);
}

@keyframes sl-snow-flare-burst {
  0%   { r: 0; opacity: 0; }
  30%  { r: 14; opacity: 0.9; }
  100% { r: 28; opacity: 0; }
}

/* Vertex dots (final solid state) */
.sl-snow__vertex {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: 50% 50%;
  animation: sl-snow-vertex-pop 380ms cubic-bezier(0.34, 1.56, 0.64, 1) var(--vx-delay, 0ms) forwards;
  filter: drop-shadow(0 0 6px var(--brand-primary, #f5a623));
}

@keyframes sl-snow-vertex-pop {
  0%   { opacity: 0; transform: scale(0.2); }
  100% { opacity: 1; transform: scale(1); }
}

/* Labels */
.sl-snow__label {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  fill: rgba(255, 255, 255, 0.65);
  opacity: 0;
  animation: sl-snow-fade-in 380ms ease-out var(--lbl-delay, 0ms) forwards;
}

.sl-snow__label-name { font-weight: 500; }
.sl-snow__label-val {
  font-size: 13px;
  font-weight: 300;
  fill: #fff;
  font-variant-numeric: tabular-nums;
}

.sl-snow__subline {
  font-size: clamp(14px, 2vw, 16px);
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  max-width: 480px;
}

.sl-snow__subline strong {
  color: #fff;
  font-weight: 500;
}

.rxh-stagger {
  opacity: 0;
  transform: translate3d(0, 14px, 0);
  animation: rxh-stagger-in 700ms cubic-bezier(0.16, 1, 0.3, 1) var(--rxh-delay, 0ms) forwards;
}

@keyframes rxh-stagger-in {
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

@keyframes sl-snow-fade-in {
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .sl-snow__poly,
  .sl-snow__vertex,
  .sl-snow__spoke,
  .sl-snow__rings,
  .sl-snow__label,
  .sl-snow__flare,
  .rxh-stagger {
    animation: none;
    opacity: 1;
    transform: none;
    stroke-dashoffset: 0;
    filter: none;
  }
}
</style>
