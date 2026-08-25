<script setup lang="ts">
// PROTÓTIPO /simulacao — fan chart de 10 anos sobre navy: banda p10-p90 como
// área, mediana com glow (anatomia do NuPerformanceChart), baseline tracejada,
// marcos de evento e cursor compartilhado com a timeline (v-model:cursor).
// Entrada: desenho de path (técnica do error.vue). Troca de cenário: MORPH —
// o pai tweena os arrays (GSAP) e os computed recomputam o `d`.
import type { SimSeries, SimEvent } from './simMock'
import { fmtBRL } from './simMock'

const props = defineProps<{
  series: SimSeries
  events: SimEvent[]
  drawing: boolean
  /** what-if (25/08): mediana da carteira PROPOSTA sobreposta em amber */
  compare?: SimSeries | null
}>()
const cursor = defineModel<number | null>('cursor', { default: null })

const W = 1000
const H = 340

const domain = computed(() => {
  const cmp = props.compare?.p50 ?? []
  const lo = Math.min(...props.series.p10, ...cmp)
  const hi = Math.max(...props.series.p90, ...cmp)
  const span = hi - lo || 1
  return { lo: lo - span * 0.06, hi: hi + span * 0.08 }
})
function Y(v: number): number {
  const { lo, hi } = domain.value
  return 16 + ((hi - v) / (hi - lo)) * (H - 44)
}
function X(i: number): number {
  return (i / (props.series.p50.length - 1)) * W
}
function line(arr: number[]): string {
  let d = ''
  arr.forEach((v, i) => { d += `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}` })
  return d
}
const bandPath = computed(() => {
  const up = props.series.p90
  const dn = props.series.p10
  let d = ''
  up.forEach((v, i) => { d += `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}` })
  for (let i = dn.length - 1; i >= 0; i--) d += `L${X(i).toFixed(1)},${Y(dn[i]!).toFixed(1)}`
  return d + 'Z'
})
const p50Path = computed(() => line(props.series.p50))
const comparePath = computed(() => (props.compare && props.compare.p50.length === props.series.p50.length ? line(props.compare.p50) : null))

const grid = computed(() => {
  const { lo, hi } = domain.value
  return [0.25, 0.5, 0.75].map((f) => ({ y: 16 + f * (H - 44), v: hi - f * (hi - lo) }))
})

// eixo X: um label por ano cheio
const xLabels = computed(() => {
  const out: { x: number; label: string }[] = []
  props.series.dates.forEach((d, i) => {
    if (d.startsWith('01/')) out.push({ x: (i / (props.series.dates.length - 1)) * 100, label: d.slice(3) })
  })
  return out.filter((_, k) => k % 2 === 0)
})

// rótulos vizinhos (<14% de distância) sobem uma linha — nada se atropela.
// O cenário ganha rótulo CURTO (o ano, em âmbar) — identifica a linha
// amarela sem repetir o título gigante (iterações do dono, 25/08).
const eventLabels = computed(() => {
  const n = props.series.p50.length - 1
  const sorted = [...props.events].sort((a, b) => a.at - b.at)
  let lastPct = -100
  let lastRow = 1
  return sorted.map((ev) => {
    const pct = (ev.at / n) * 100
    const row = pct - lastPct < 14 ? (lastRow === 0 ? 1 : 0) : 0
    lastPct = pct
    lastRow = row
    return { ...ev, pct, row }
  })
})

const hover = ref<number | null>(null)
function onMove(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  hover.value = Math.round(f * (props.series.p50.length - 1))
  cursor.value = hover.value
}
function onLeave() {
  hover.value = null
}
const cursorIdx = computed(() => hover.value ?? cursor.value)
const cursorInfo = computed(() => {
  const i = cursorIdx.value
  if (i === null || i < 0) return null
  return {
    x: (i / (props.series.p50.length - 1)) * 100,
    date: props.series.dates[i]!,
    p10: props.series.p10[i]!,
    p50: props.series.p50[i]!,
    p90: props.series.p90[i]!,
  }
})
const fmt = fmtBRL
</script>

<template>
  <div class="sfc" @mousemove="onMove" @mouseleave="onLeave">
    <svg class="sfc__svg" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
      <line v-for="g in grid" :key="g.y" x1="0" :y1="g.y" x2="1000" :y2="g.y" stroke="var(--nu-cream-text-12)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <path :d="bandPath" fill="var(--nu-blue-soft)" opacity="0.14" class="sfc__band" :class="{ 'sfc__band--in': !drawing }" />
      <!-- marcos de evento -->
      <line
        v-for="ev in events" :key="ev.label + ev.at"
        :x1="X(ev.at)" y1="10" :x2="X(ev.at)" :y2="H - 26"
        :stroke="ev.kind === 'choque' ? 'var(--nu-amber)' : 'var(--nu-cream-text-45)'"
        stroke-width="1.4" :stroke-dasharray="ev.kind === 'choque' ? 'none' : '2 5'"
        vector-effect="non-scaling-stroke" opacity="0.85"
      />
      <!-- mediana: glow + linha, com desenho de entrada (pathLength) -->
      <path :d="p50Path" fill="none" stroke="var(--nu-blue)" stroke-width="9" opacity="0.28" vector-effect="non-scaling-stroke" pathLength="1" class="sfc__line" :class="{ 'sfc__line--draw': drawing }" />
      <path :d="p50Path" fill="none" stroke="var(--nu-blue-soft)" stroke-width="2.6" vector-effect="non-scaling-stroke" pathLength="1" class="sfc__line" :class="{ 'sfc__line--draw': drawing }" />
      <!-- mediana da carteira PROPOSTA (what-if) -->
      <path v-if="comparePath" :d="comparePath" fill="none" stroke="var(--nu-amber)" stroke-width="2.2" vector-effect="non-scaling-stroke" class="sfc__cmp" />
      <!-- cursor -->
      <line v-if="cursorInfo" :x1="(cursorInfo.x / 100) * W" y1="10" :x2="(cursorInfo.x / 100) * W" :y2="H - 26" stroke="var(--nu-cream-text-60)" stroke-width="1.2" vector-effect="non-scaling-stroke" />
    </svg>

    <!-- rótulo ancorado pra DENTRO perto das bordas + escalonado em 2 linhas
         quando vizinho (feedback do dono: texto cortado/atropelado) -->
    <div
      v-for="ev in eventLabels" :key="'l' + ev.label"
      class="sfc__event" :class="{ 'sfc__event--choque': ev.kind === 'choque' }"
      :style="{
        left: `${ev.pct}%`,
        top: ev.row === 1 ? '-22px' : '-4px',
        transform: ev.pct < 8 ? 'translateX(6px)'
          : ev.pct > 92 ? 'translateX(calc(-100% - 6px))'
            : 'translateX(-50%)',
      }"
    >
      {{ ev.label }}
    </div>

    <div v-for="g in grid" :key="'g' + g.y" class="sfc__ylabel" :style="{ top: `${(g.y / H) * 100}%` }">{{ fmt(g.v) }}</div>
    <div class="sfc__xrow">
      <span v-for="l in xLabels" :key="l.label" class="sfc__xlabel" :style="{ left: `${l.x}%` }">{{ l.label }}</span>
    </div>

    <div v-if="cursorInfo" class="sfc__tip" :style="{ left: `${Math.min(84, Math.max(14, cursorInfo.x))}%` }">
      <span class="sfc__tip-date">{{ cursorInfo.date }}</span>
      <span class="sfc__tip-row"><i class="sfc__dot sfc__dot--hi" />otimista <b>{{ fmt(cursorInfo.p90) }}</b></span>
      <span class="sfc__tip-row"><i class="sfc__dot sfc__dot--mid" />mediana <b>{{ fmt(cursorInfo.p50) }}</b></span>
      <span class="sfc__tip-row"><i class="sfc__dot sfc__dot--lo" />pessimista <b>{{ fmt(cursorInfo.p10) }}</b></span>
    </div>
  </div>
</template>

<style scoped>
.sfc { position: relative; width: 100%; height: 100%; }
.sfc__svg { display: block; width: 100%; height: calc(100% - 26px); overflow: visible; }
.sfc__band { opacity: 0; transition: opacity 1.1s ease 0.9s; }
.sfc__band--in { opacity: 0.14; }
.sfc__cmp { animation: nu-fade 0.5s ease both; }
.sfc__line { stroke-dasharray: 1; stroke-dashoffset: 0; }
.sfc__line--draw { animation: sfc-draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) both; }
@keyframes sfc-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
.sfc__event {
  position: absolute; top: -4px; transform: translateX(-50%);
  color: var(--nu-cream-text-55); font-size: 10.5px; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
}
.sfc__event--choque { color: var(--nu-amber); }
.sfc__ylabel {
  position: absolute; right: 0; transform: translateY(-120%);
  color: var(--nu-cream-text-45); font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.sfc__xrow { position: relative; height: 22px; }
.sfc__xlabel {
  position: absolute; transform: translateX(-50%);
  color: var(--nu-cream-text-45); font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.sfc__tip {
  position: absolute; top: 12px; transform: translateX(-50%);
  display: flex; flex-direction: column; gap: 3px;
  background: var(--nu-navy-2); border-radius: 12px; padding: 10px 13px;
  box-shadow: 0 16px 40px -18px rgba(5, 10, 25, 0.8);
  pointer-events: none;
}
.sfc__tip-date { color: var(--nu-cream-text-60); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
.sfc__tip-row { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-cream-text-78); font-size: 12.5px; font-weight: 600; }
.sfc__tip-row b { color: var(--nu-cream-text); font-variant-numeric: tabular-nums; }
.sfc__dot { width: 8px; height: 8px; border-radius: 50%; }
.sfc__dot--hi { background: var(--nu-green-soft); }
.sfc__dot--mid { background: var(--nu-blue-soft); }
.sfc__dot--lo { background: var(--nu-red-soft); }
</style>
