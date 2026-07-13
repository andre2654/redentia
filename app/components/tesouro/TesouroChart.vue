<script setup lang="ts">
// Area chart do histórico do título — MESMA pele do NuPriceChart (design
// Acoes Nu: viewBox 1000x320 preserveAspectRatio none, gradiente de área
// azul, glow stroke, gridlines, dot de fechamento com pill, crosshair com
// tooltip clampado). Componente próprio porque os eixos são outros: o toggle
// preço↔taxa muda a formatação (R$ × % a.a.) e o delta do tooltip (variação %
// × pontos percentuais) — genérico demais pro NuPriceChart sem inchá-lo.
import type { TesouroChartMode, TesouroSeriesPoint } from '~/types/tesouro'

const props = defineProps<{
  points: TesouroSeriesPoint[]
  mode: TesouroChartMode
  /** rótulo da pill de fechamento ('Venda hoje') */
  pillLabel: string
  /** 'R$ 3.378,43' | '8,37% a.a.' — valor da pill no eixo ativo */
  currentLabel: string
}>()

const H = 320
const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

const domain = computed(() => {
  const vals = props.points.map((p) => p.v)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || Math.abs(max) * 0.1 || 1
  return { lo: min - span * 0.15, hi: max + span * 0.1 }
})

function Y(v: number): number {
  const { lo, hi } = domain.value
  return 18 + ((hi - v) / (hi - lo)) * (H - 58)
}

const line = computed(() => {
  const pts = props.points
  let d = ''
  pts.forEach((p, i) => {
    const x = (i / (pts.length - 1)) * 1000
    d += `${i ? 'L' : 'M'}${x.toFixed(1)},${Y(p.v).toFixed(1)}`
  })
  return d
})
const area = computed(() => `${line.value}L1000,${H}L0,${H}Z`)

/** passos "redondos" das gridlines (mesma heurística do NuPriceChart). */
function niceStep(raw: number): number {
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10
  return nice * mag
}
const grid = computed(() => {
  const { lo, hi } = domain.value
  const span = hi - lo
  if (span <= 0) return []
  const step = niceStep(span / 5)
  const fmt = (m: number) => {
    if (props.mode === 'rate') return `${step >= 1 ? nf0.format(m) : nf2.format(m)}%`
    if (step >= 1000) return `R$ ${nf0.format(m / 1000)} mil`
    return `R$ ${step >= 1 ? nf0.format(m) : nf2.format(m)}`
  }
  const lines: { top: string; lbl: string }[] = []
  for (let m = Math.ceil(lo / step) * step; m < hi; m += step) {
    if (m <= lo) continue
    lines.push({ top: `${((Y(m) / H) * 100).toFixed(2)}%`, lbl: fmt(m) })
  }
  return lines
})

const endTop = computed(() => {
  const last = props.points[props.points.length - 1]
  return last ? `${((Y(last.v) / H) * 100).toFixed(2)}%` : '0%'
})

/* crosshair */
const hovIdx = ref(-1)

function onMove(e: MouseEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  const idx = Math.round(f * (props.points.length - 1))
  if (idx !== hovIdx.value) hovIdx.value = idx
}
function onLeave() {
  hovIdx.value = -1
}

const hov = computed(() => {
  const idx = hovIdx.value
  const pts = props.points
  const p = pts[idx]
  if (idx < 0 || !p) return null
  const frac = idx / (pts.length - 1)
  const first = pts[0]!.v
  const [y, m, d] = p.t.split('-')
  // preço: variação % no período · taxa: variação em pontos percentuais
  let delta: string
  let dir: 'up' | 'down'
  if (props.mode === 'rate') {
    const dpp = p.v - first
    delta = `${dpp > 0 ? '+' : ''}${nf2.format(dpp)} p.p. no período`
    dir = dpp >= 0 ? 'up' : 'down'
  } else {
    const dp = first ? ((p.v - first) / first) * 100 : 0
    delta = `${dp > 0 ? '+' : ''}${nf2.format(dp)}% no período`
    dir = dp >= 0 ? 'up' : 'down'
  }
  return {
    leftPct: `${(frac * 100).toFixed(2)}%`,
    topPct: `${((Y(p.v) / H) * 100).toFixed(2)}%`,
    tipLeft: `${(Math.min(0.86, Math.max(0.14, frac)) * 100).toFixed(2)}%`,
    date: `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`,
    val: props.mode === 'rate' ? `${nf2.format(p.v)}% a.a.` : `R$ ${nf2.format(p.v)}`,
    delta,
    dir,
  }
})
</script>

<template>
  <div class="tch" @mousemove="onMove" @mouseleave="onLeave">
    <template v-for="g in grid" :key="g.lbl">
      <div class="tch__gridline" :style="{ top: g.top }" />
      <div class="tch__gridlbl" :style="{ top: g.top }">{{ g.lbl }}</div>
    </template>

    <svg viewBox="0 0 1000 320" preserveAspectRatio="none" class="tch__svg" aria-hidden="true">
      <defs>
        <linearGradient id="tsr-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color: var(--nu-blue); stop-opacity: 0.42" />
          <stop offset="1" style="stop-color: var(--nu-blue); stop-opacity: 0" />
        </linearGradient>
        <linearGradient id="tsr-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style="stop-color: var(--nu-blue)" />
          <stop offset="1" style="stop-color: var(--nu-blue-soft)" />
        </linearGradient>
      </defs>
      <path :d="area" fill="url(#tsr-area)" />
      <path
        :d="line" fill="none" class="tch__glow" stroke-opacity="0.26" stroke-width="10"
        vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
      />
      <path
        :d="line" fill="none" stroke="url(#tsr-line)" stroke-width="3.4"
        vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
      />
    </svg>

    <div class="tch__enddot" :style="{ top: endTop }" />
    <div class="tch__endpill" :style="{ top: endTop }">
      <span class="tch__endpill-label">{{ pillLabel }}</span>
      <span class="tch__endpill-val">{{ currentLabel }}</span>
    </div>

    <template v-if="hov">
      <div class="tch__cross" :style="{ left: hov.leftPct }" />
      <div class="tch__dot" :style="{ left: hov.leftPct, top: hov.topPct }" />
      <div class="tch__tip" :style="{ left: hov.tipLeft }">
        <div class="tch__tip-date">{{ hov.date }}</div>
        <div class="tch__tip-val">{{ hov.val }}</div>
        <div class="tch__tip-delta" :class="`tch__tip-delta--${hov.dir}`">{{ hov.delta }}</div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tch { position: relative; width: 100%; height: 100%; cursor: crosshair; }
.tch__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.tch__glow { stroke: var(--nu-blue); }
.tch__gridline { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-cream-text-08); }
.tch__gridlbl {
  position: absolute; right: 18px; transform: translateY(-120%);
  color: var(--nu-cream-text-35); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.tch__enddot {
  position: absolute; right: -1px; width: 13px; height: 13px; border-radius: 50%;
  background: var(--nu-blue-soft); border: 3px solid var(--nu-navy);
  box-shadow: 0 0 0 6px var(--nu-blue-soft-18); transform: translate(30%, -50%);
}
.tch__endpill {
  position: absolute; right: 16px; transform: translateY(calc(-100% - 14px));
  background: var(--nu-cream); border-radius: 14px; padding: 9px 15px;
  white-space: nowrap; box-shadow: var(--nu-shadow-chart-pill);
}
.tch__endpill-label {
  display: block; color: var(--nu-navy-55); font-size: 10.5px; font-weight: 800;
  letter-spacing: .5px; text-transform: uppercase;
}
.tch__endpill-val {
  display: block; color: var(--nu-navy); font-size: 15px; font-weight: 800;
  font-variant-numeric: tabular-nums; margin-top: 2px;
}
.tch__cross {
  position: absolute; top: 0; bottom: 0; width: 1px;
  background: var(--nu-cream-text-30); pointer-events: none; z-index: 2;
}
.tch__dot {
  position: absolute; width: 15px; height: 15px; border-radius: 50%;
  background: var(--nu-white); border: 3.5px solid var(--nu-blue);
  box-shadow: 0 0 0 7px var(--nu-blue-28); transform: translate(-50%, -50%);
  pointer-events: none; z-index: 3;
}
.tch__tip {
  position: absolute; top: 6px; transform: translateX(-50%);
  background: var(--nu-cream); border-radius: var(--nu-r-tile); padding: 12px 17px;
  box-shadow: var(--nu-shadow-chart-tip); pointer-events: none; z-index: 4; white-space: nowrap;
}
.tch__tip-date { color: var(--nu-navy-55); font-size: 12px; font-weight: 700; }
.tch__tip-val {
  color: var(--nu-navy); font-size: 21px; font-weight: 800; margin-top: 3px;
  font-variant-numeric: tabular-nums;
}
.tch__tip-delta { font-size: 13px; font-weight: 800; margin-top: 2px; }
.tch__tip-delta--up { color: var(--nu-green-2); }
.tch__tip-delta--down { color: var(--nu-red-2); }

/* mobile: sem o marcador de fim de linha (mesma UX do NuPriceChart) */
@media (max-width: 760px) {
  .tch__endpill { display: none; }
}
</style>
