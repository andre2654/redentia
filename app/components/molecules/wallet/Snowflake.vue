<!--
  Snowflake — 5-axis radar chart for portfolio profile.

  Inspired by SimplyWall.st's "Snowflake" view: a single visual that
  collapses the diagnosis into shape + size + tilt. Bigger filled
  area = stronger overall portfolio; pulled-out spokes = strengths;
  retracted spokes = weaknesses.

  The 5 axes are PT-BR mapped to investor-friendly labels:
    Valor      — quality of the underlying companies (value-investor lens)
    Futuro     — growth-sector exposure
    Passado    — historical defensiveness (low volatility)
    Saúde      — diversification + macro resilience
    Dividendos — yield engine (DY ponderado)

  Inputs are pre-aggregated by the parent so this component stays
  pure SVG + math. Each axis takes a 0-100 score and an optional
  note tooltip-style. The polygon is computed in normalized polar
  coords starting from the top axis at 12 o'clock (angle = -90°).
-->
<template>
  <article
    class="relative overflow-hidden rounded-2xl border p-6 lg:p-8"
    :style="cardStyle"
  >
    <div
      class="pointer-events-none absolute inset-0"
      :style="{
        backgroundImage: `radial-gradient(ellipse 60% 60% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 10%, transparent) 0%, transparent 60%)`,
      }"
    />

    <div class="relative grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr] lg:items-center">
      <!-- Radar SVG. Extra horizontal padding here gives the
           DIVIDENDOS / FUTURO labels (the two widest, anchored at
           the left/right tips of the pentagon) room to render
           beyond the SVG viewBox without bumping into the column
           gap. Without it the leftmost label clipped at "ENDOS" and
           the rightmost at "FUTUR". -->
      <div class="flex justify-center px-12 lg:px-8">
        <svg
          :viewBox="`0 0 ${size} ${size}`"
          overflow="visible"
          class="h-auto w-full max-w-md overflow-visible"
          aria-hidden="true"
        >
          <!-- Concentric guide rings -->
          <g>
            <polygon
              v-for="(scale, i) in [0.25, 0.5, 0.75, 1]"
              :key="`ring-${i}`"
              :points="ringPoints(scale)"
              fill="none"
              :stroke="`color-mix(in srgb, ${brand.colors.text} ${i === 3 ? 18 : 8}%, transparent)`"
              stroke-width="1"
            />
          </g>
          <!-- Spoke lines -->
          <g>
            <line
              v-for="(p, i) in axisTips"
              :key="`spoke-${i}`"
              :x1="center" :y1="center"
              :x2="p.x" :y2="p.y"
              :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`"
              stroke-width="1"
            />
          </g>
          <!-- Filled portfolio polygon -->
          <defs>
            <radialGradient id="snowflake-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" :stop-color="brand.colors.primary" stop-opacity="0.85" />
              <stop offset="100%" :stop-color="brand.colors.primary" stop-opacity="0.55" />
            </radialGradient>
          </defs>
          <polygon
            :points="polygonPoints"
            fill="url(#snowflake-fill)"
            :stroke="brand.colors.primary"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <!-- Vertex dots -->
          <g>
            <circle
              v-for="(p, i) in polygonVertices"
              :key="`vx-${i}`"
              :cx="p.x" :cy="p.y" :r="3"
              :fill="brand.colors.primary"
              :stroke="brand.colors.background"
              stroke-width="1.5"
            />
          </g>
          <!-- Axis labels -->
          <g>
            <text
              v-for="(p, i) in labelPositions"
              :key="`lbl-${i}`"
              :x="p.x" :y="p.y"
              :text-anchor="p.anchor"
              :dominant-baseline="p.baseline"
              class="snowflake-label"
              :style="{ fill: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)` }"
            >{{ axes[i].label }}</text>
          </g>
        </svg>
      </div>

      <!-- Read-out -->
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase"
            :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
          >Snowflake</span>
          <h3
            class="font-light"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(22px, 2.8vw, 32px)',
              lineHeight: 1.15,
              letterSpacing: '-0.6px',
            }"
          >{{ headline }}</h3>
          <p
            class="text-[13px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.55 }"
          >{{ subline }}</p>
        </div>

        <ul class="flex flex-col divide-y" :style="dividerStyle">
          <li
            v-for="(a, i) in axes"
            :key="a.key"
            class="flex items-center justify-between gap-3 py-2"
          >
            <div class="flex flex-col leading-tight">
              <span class="text-[12.5px] font-medium" :style="{ color: brand.colors.text }">{{ a.label }}</span>
              <span
                v-if="a.note"
                class="text-[10.5px]"
                :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
              >{{ a.note }}</span>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="h-1 w-24 overflow-hidden rounded-full"
                :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
              >
                <div
                  class="h-full rounded-full"
                  :style="{ width: a.value + '%', backgroundColor: axisColor(a.value) }"
                />
              </div>
              <span
                class="font-mono-tab text-[12px] tabular-nums w-7 text-right"
                :style="{ color: axisColor(a.value) }"
              >{{ Math.round(a.value) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
export interface SnowflakeAxis {
  key: string
  label: string
  value: number
  note?: string
}

interface Props {
  axes: SnowflakeAxis[]
  headline?: string
  subline?: string
}
const props = withDefaults(defineProps<Props>(), {
  headline: 'Sua carteira em 5 eixos',
  subline:
    'A área preenchida mostra o equilíbrio do conjunto. Picos puxados são pontos fortes; cantos retraídos pedem atenção.',
})

const brand = useBrand()

const size = 360
const center = size / 2
// Padding so labels don't get cropped at the SVG edge
const radius = size / 2 - 56
const labelOffset = radius + 22

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 8%, transparent), 0 24px 60px -34px color-mix(in srgb, ${brand.colors.primary} 24%, transparent)`,
}))

const dividerStyle = computed(() => ({
  borderColor: `color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
}))

/**
 * Polar → cartesian, with the first axis at 12 o'clock and the rest
 * walking clockwise. Padding the angle by `-Math.PI/2` rotates the
 * default math frame so the visual matches investor-radar conventions.
 */
function polar(angleIdx: number, scale: number): { x: number; y: number } {
  const total = props.axes.length
  const angle = (angleIdx / total) * Math.PI * 2 - Math.PI / 2
  return {
    x: center + Math.cos(angle) * radius * scale,
    y: center + Math.sin(angle) * radius * scale,
  }
}

const axisTips = computed(() => props.axes.map((_, i) => polar(i, 1)))

const polygonVertices = computed(() =>
  props.axes.map((a, i) => polar(i, Math.max(0.04, Math.min(1, a.value / 100)))),
)

const polygonPoints = computed(() =>
  polygonVertices.value.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
)

function ringPoints(scale: number): string {
  return props.axes
    .map((_, i) => polar(i, scale))
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
}

/**
 * Axis label positioning: pushes the text outside the outermost
 * ring and picks anchor + baseline based on the angle so the
 * label "leans away" from the center cleanly. text-anchor and
 * dominant-baseline together place the text consistently around
 * the radar without manual per-axis offsets.
 */
const labelPositions = computed(() =>
  props.axes.map((_, i) => {
    const total = props.axes.length
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2
    const x = center + Math.cos(angle) * labelOffset
    const y = center + Math.sin(angle) * labelOffset
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    let anchor: 'start' | 'middle' | 'end' = 'middle'
    if (cos > 0.3) anchor = 'start'
    else if (cos < -0.3) anchor = 'end'
    let baseline: 'auto' | 'middle' | 'hanging' = 'middle'
    if (sin > 0.3) baseline = 'hanging'
    else if (sin < -0.3) baseline = 'auto'
    return { x, y, anchor, baseline }
  }),
)

function axisColor(value: number): string {
  if (value >= 75) return brand.colors.positive
  if (value >= 50) return (brand.colors as { warning?: string }).warning || '#f59e0b'
  return brand.colors.negative
}
</script>

<style scoped>
.snowflake-label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
</style>
