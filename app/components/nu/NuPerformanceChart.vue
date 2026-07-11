<script setup lang="ts">
// Chart de performance de tese vs benchmark (PR5, design Redentia Tese.dc.html,
// seção "A tese em números"). Anatomia DIFERENTE do NuPriceChart (single-series
// R$): 2 séries em % desde o lançamento — área gradiente azul + linha da tese
// (--nu-tese-line, glow azul por baixo) e benchmark DASHED creme .65 —
// gridlines em % ('+30%'…'0%'), pill 'Tese hoje' ancorada no fim da linha e
// tooltip com data + % da tese + % do IBOV. Geometria EXATA do design:
// Y = 14 + ((hi-v)/(hi-lo))*(H-40), viewBox 1000x320 preserveAspectRatio none,
// strokes non-scaling, tooltip clampado 14%-86%. O pai controla altura e o
// full-bleed (margens negativas); aqui é 100%/100%.
const props = defineProps<{
  /** % desde o lançamento (base100 - 100) */
  series: number[]
  /** benchmark no MESMO range e MESMO nº de pontos (null = sem par) */
  benchmark?: number[] | null
  /** label de data por ponto do tooltip ('set 2025'); [] = tooltip sem data */
  labels?: string[]
  benchmarkName?: string
  pillLabel?: string
  /** '+67,1%' — valor da pill do fim da linha */
  pillValue: string
}>()

const H = 320
const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmtP = (v: number) => `${v >= 0 ? '+' : ''}${nf1.format(v)}%`

const bench = computed(() =>
  props.benchmark && props.benchmark.length === props.series.length ? props.benchmark : null,
)

const domain = computed(() => {
  const vals = [...props.series, ...(bench.value ?? [])]
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || Math.abs(max) * 0.1 || 1
  // padding espelhando a proporção do design (dados 0-34 → eixo -5 a 38)
  return { lo: min - span * 0.13, hi: max + span * 0.11 }
})

function Y(v: number): number {
  const { lo, hi } = domain.value
  return 14 + ((hi - v) / (hi - lo)) * (H - 40)
}

function path(arr: number[]): string {
  let d = ''
  arr.forEach((v, i) => {
    const x = (i / (arr.length - 1)) * 1000
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${Y(v).toFixed(1)}`
  })
  return d
}

const lineT = computed(() => path(props.series))
const areaT = computed(() => `${lineT.value}L1000,${H}L0,${H}Z`)
const lineB = computed(() => (bench.value ? path(bench.value) : null))

/** Gridlines em passos "redondos" de % (≤5 linhas estritamente dentro do eixo). */
const grid = computed(() => {
  const { lo, hi } = domain.value
  const span = hi - lo
  const CANDIDATES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]
  let step = CANDIDATES[CANDIDATES.length - 1]!
  for (const c of CANDIDATES) {
    if (span / c <= 5) { step = c; break }
  }
  const lines: { top: string; lbl: string }[] = []
  for (let m = Math.ceil(lo / step) * step; m < hi; m += step) {
    if (m <= lo) continue
    lines.push({
      top: `${((Y(m) / H) * 100).toFixed(2)}%`,
      lbl: `${m > 0 ? '+' : ''}${m}%`,
    })
  }
  return lines
})

const endTop = computed(() => {
  const last = props.series[props.series.length - 1]
  return last != null ? `${((Y(last) / H) * 100).toFixed(2)}%` : '0%'
})

/* crosshair */
const hovIdx = ref(-1)

function onMove(e: MouseEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  const idx = Math.round(f * (props.series.length - 1))
  if (idx !== hovIdx.value) hovIdx.value = idx
}
function onLeave() {
  hovIdx.value = -1
}

const hov = computed(() => {
  const idx = hovIdx.value
  const v = props.series[idx]
  if (idx < 0 || v == null) return null
  const frac = idx / (props.series.length - 1)
  const b = bench.value?.[idx]
  return {
    leftPct: `${(frac * 100).toFixed(2)}%`,
    topPct: `${((Y(v) / H) * 100).toFixed(2)}%`,
    tipLeft: `${(Math.min(0.86, Math.max(0.14, frac)) * 100).toFixed(2)}%`,
    date: props.labels?.[idx] ?? '',
    valT: fmtP(v),
    valB: b != null ? fmtP(b) : null,
  }
})
</script>

<template>
  <div class="nperf" @mousemove="onMove" @mouseleave="onLeave">
    <template v-for="g in grid" :key="g.lbl">
      <div class="nperf__gridline" :style="{ top: g.top }" />
      <div class="nperf__gridlbl" :style="{ top: g.top }">{{ g.lbl }}</div>
    </template>

    <svg viewBox="0 0 1000 320" preserveAspectRatio="none" class="nperf__svg" aria-hidden="true">
      <defs>
        <linearGradient id="nperf-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color: var(--nu-blue); stop-opacity: 0.40" />
          <stop offset="1" style="stop-color: var(--nu-blue); stop-opacity: 0" />
        </linearGradient>
      </defs>
      <path :d="areaT" fill="url(#nperf-area)" />
      <path
        v-if="lineB" :d="lineB" fill="none" class="nperf__bench" stroke-width="2.2"
        stroke-dasharray="7 7" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
      />
      <path
        :d="lineT" fill="none" class="nperf__glow" stroke-opacity="0.28" stroke-width="10"
        vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
      />
      <path
        :d="lineT" fill="none" class="nperf__line" stroke-width="3.4"
        vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
      />
    </svg>

    <div class="nperf__endpill" :style="{ top: endTop }">
      <span class="nperf__endpill-label">{{ pillLabel ?? 'Tese hoje' }}</span>
      <span class="nperf__endpill-val">{{ pillValue }}</span>
    </div>

    <template v-if="hov">
      <div class="nperf__cross" :style="{ left: hov.leftPct }" />
      <div class="nperf__dot" :style="{ left: hov.leftPct, top: hov.topPct }" />
      <div class="nperf__tip" :style="{ left: hov.tipLeft }">
        <div v-if="hov.date" class="nperf__tip-date">{{ hov.date }}</div>
        <div class="nperf__tip-row">
          <span class="nperf__tip-t">{{ hov.valT }}</span>
          <span v-if="hov.valB" class="nperf__tip-b">{{ benchmarkName ?? 'IBOV' }} {{ hov.valB }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.nperf { position: relative; width: 100%; height: 100%; cursor: crosshair; }
.nperf__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.nperf__line { stroke: var(--nu-tese-line); }
.nperf__glow { stroke: var(--nu-blue); }
.nperf__bench { stroke: var(--nu-cream-text-65); }
.nperf__gridline { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-cream-text-08); }
.nperf__gridlbl {
  position: absolute; right: 18px; transform: translateY(-120%);
  color: var(--nu-cream-text-35); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.nperf__endpill {
  position: absolute; right: 16px; transform: translateY(calc(-100% - 12px));
  background: var(--nu-cream); border-radius: 14px; padding: 9px 15px;
  white-space: nowrap; box-shadow: var(--nu-shadow-chart-pill);
}
.nperf__endpill-label {
  display: block; color: var(--nu-navy-55); font-size: 10.5px; font-weight: 800;
  letter-spacing: .5px; text-transform: uppercase;
}
.nperf__endpill-val {
  display: block; color: var(--nu-navy); font-size: 15px; font-weight: 800;
  font-variant-numeric: tabular-nums; margin-top: 2px;
}
.nperf__cross {
  position: absolute; top: 0; bottom: 0; width: 1px;
  background: var(--nu-cream-text-30); pointer-events: none; z-index: 2;
}
.nperf__dot {
  position: absolute; width: 15px; height: 15px; border-radius: 50%;
  background: var(--nu-white); border: 3.5px solid var(--nu-blue);
  box-shadow: 0 0 0 7px var(--nu-blue-28); transform: translate(-50%, -50%);
  pointer-events: none; z-index: 3;
}
.nperf__tip {
  position: absolute; top: 6px; transform: translateX(-50%);
  background: var(--nu-cream); border-radius: var(--nu-r-tile); padding: 12px 17px;
  box-shadow: var(--nu-shadow-chart-tip); pointer-events: none; z-index: 4; white-space: nowrap;
}
.nperf__tip-date { color: var(--nu-navy-55); font-size: 12px; font-weight: 700; }
.nperf__tip-row { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
.nperf__tip-t { color: var(--nu-blue); font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums; }
.nperf__tip-b { color: var(--nu-navy-60); font-size: 13.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
</style>
