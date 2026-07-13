<script setup lang="ts">
// PR10 — gráfico de área de projeção (client-side, sem dados de mercado —
// NÃO confundir com NuPriceChart). Porte exato do SVG do design (Redentia
// Calculadoras Nu.dc.html): viewBox 0 0 1000 320 preserveAspectRatio none,
// área com gradient azul .34→0, linha principal azul 3.4 non-scaling, linha
// secundária navy tracejada 7 6, 3 gridlines (75/50/25% do teto) com label à
// direita e eixo x hoje/+N/2/+N.
const props = defineProps<{
  /** série principal (ex.: patrimônio ano a ano) */
  values: number[]
  /** série secundária tracejada (ex.: total aportado) */
  secondary?: number[]
  /** labels do eixo x: [esquerda, meio, direita] */
  xLabels?: [string, string, string]
  /** formatação dos labels das gridlines (default: valor bruto) */
  formatY?: (v: number) => string
}>()

const H = 320
const uid = useId()
const gradId = computed(() => 'calcarea-' + String(uid).replace(/[^a-zA-Z0-9_-]/g, ''))

const hi = computed(() => (Math.max(...props.values, 0) * 1.06) || 1)

function y(v: number) {
  return 12 + ((hi.value - v) / hi.value) * (H - 24)
}

function path(vals: number[]) {
  const last = vals.length - 1
  if (last < 1) return ''
  let d = ''
  vals.forEach((v, k) => {
    const x = (k / last) * 1000
    d += (k ? 'L' : 'M') + x.toFixed(1) + ',' + y(v).toFixed(1)
  })
  return d
}

const lineMain = computed(() => path(props.values))
const areaMain = computed(() => (lineMain.value ? `${lineMain.value}L1000,${H}L0,${H}Z` : ''))
const lineSecondary = computed(() => (props.secondary ? path(props.secondary) : ''))

const grid = computed(() =>
  [0.75, 0.5, 0.25].map((f) => ({
    top: ((y(hi.value * f) / H) * 100).toFixed(2) + '%',
    label: props.formatY ? props.formatY(hi.value * f) : String(Math.round(hi.value * f)),
  })),
)
</script>

<template>
  <div>
    <div class="cac">
      <template v-for="g in grid" :key="g.top">
        <div class="cac__line" :style="{ top: g.top }" />
        <div class="cac__lbl" :style="{ top: g.top }">{{ g.label }}</div>
      </template>
      <!-- .attr obrigatório: sem ele a hidratação seta viewBox como DOM prop
           e SVGSVGElement.viewBox é getter-only (warn no console) -->
      <svg :viewBox.attr="`0 0 1000 ${H}`" preserveAspectRatio="none" class="cac__svg" aria-hidden="true">
        <defs>
          <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="var(--nu-blue)" stop-opacity="0.34" />
            <stop offset="1" stop-color="var(--nu-blue)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path :d="areaMain" :fill="`url(#${gradId})`" />
        <path :d="lineMain" fill="none" stroke="var(--nu-blue)" stroke-width="3.4" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
        <path v-if="lineSecondary" :d="lineSecondary" fill="none" stroke="var(--nu-navy)" stroke-width="2.4" stroke-dasharray="7 6" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
      </svg>
    </div>
    <div v-if="xLabels" class="cac__x">
      <span>{{ xLabels[0] }}</span>
      <span>{{ xLabels[1] }}</span>
      <span>{{ xLabels[2] }}</span>
    </div>
  </div>
</template>

<style scoped>
.cac { position: relative; height: clamp(220px, 26vw, 320px); }
.cac__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.cac__line { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-navy-07); }
.cac__lbl {
  position: absolute; right: 2px; transform: translateY(-120%);
  color: var(--nu-sand); font-size: 11.5px; font-weight: 700; font-variant-numeric: tabular-nums;
}
.cac__x { display: flex; justify-content: space-between; margin-top: 10px; }
.cac__x span { color: var(--nu-gray); font-size: 13px; font-weight: 700; }
</style>
