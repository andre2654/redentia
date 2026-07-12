<script setup lang="ts">
// Area chart SVG interativo dark (design Acoes Nu, seção "em 12 meses"):
// viewBox 1000x320 preserveAspectRatio none, gradiente de área azul, linha com
// gradiente azul→azul-claro + glow stroke por baixo, gridlines com labels R$,
// dot de fechamento com halo + pill 'TICKER hoje', crosshair com tooltip
// clampado 14%-86%. Geometria EXATA do design: Y = 18 + ((hi-v)/(hi-lo))*(H-58).
// O pai controla altura e o full-bleed (margens negativas); aqui é 100%/100%.
import type { SeriesPoint } from '~/types/acao'

const props = defineProps<{
  points: SeriesPoint[]
  ticker: string
  /** 'R$ 39,60' — valor da pill de fechamento */
  currentLabel: string
  /**
   * PR7 (Home): modo "valores ocultos" — o R$ do tooltip vira 'R$ ••••••'
   * (o delta % fica, igual ao mock; a pill é mascarada pelo pai via
   * currentLabel). Sem efeito nas telas públicas (default false).
   */
  masked?: boolean
}>()

const H = 320
const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

const uid = computed(() => props.ticker.toLowerCase())

const domain = computed(() => {
  const vals = props.points.map((p) => p.v)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || Math.abs(max) * 0.1 || 1
  // padding espelhando a proporção do design (dados 28-49 → eixo 25-51)
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

/**
 * Gridlines em passos "redondos" (3-6 linhas), em QUALQUER magnitude — a lista
 * fixa antiga capava em 5.000 e um patrimônio de R$ 346k virava ~20 linhas
 * (feedback do dono 2026-07-11). Passo = "nice number" de span/5; labels de
 * milhar viram compactos ('R$ 340 mil') pra não poluir o eixo.
 */
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
  const dp = first ? ((p.v - first) / first) * 100 : 0
  const [y, m, d] = p.t.split('-')
  return {
    leftPct: `${(frac * 100).toFixed(2)}%`,
    topPct: `${((Y(p.v) / H) * 100).toFixed(2)}%`,
    tipLeft: `${(Math.min(0.86, Math.max(0.14, frac)) * 100).toFixed(2)}%`,
    date: `${Number(d)} ${MONTHS_PT[Number(m) - 1] ?? m} ${y}`,
    val: props.masked ? 'R$ ••••••' : `R$ ${nf2.format(p.v)}`,
    delta: `${dp > 0 ? '+' : ''}${nf2.format(dp)}% no período`,
    dir: dp >= 0 ? 'up' : 'down',
  }
})
</script>

<template>
  <div class="npc" @mousemove="onMove" @mouseleave="onLeave">
    <template v-for="g in grid" :key="g.lbl">
      <div class="npc__gridline" :style="{ top: g.top }" />
      <div class="npc__gridlbl" :style="{ top: g.top }">{{ g.lbl }}</div>
    </template>

    <svg viewBox="0 0 1000 320" preserveAspectRatio="none" class="npc__svg" aria-hidden="true">
      <defs>
        <linearGradient :id="`nuarea-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color: var(--nu-blue); stop-opacity: 0.42" />
          <stop offset="1" style="stop-color: var(--nu-blue); stop-opacity: 0" />
        </linearGradient>
        <linearGradient :id="`nuline-${uid}`" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style="stop-color: var(--nu-blue)" />
          <stop offset="1" style="stop-color: var(--nu-blue-soft)" />
        </linearGradient>
      </defs>
      <path :d="area" :fill="`url(#nuarea-${uid})`" />
      <path
        :d="line" fill="none" class="npc__glow" stroke-opacity="0.26" stroke-width="10"
        vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
      />
      <path
        :d="line" fill="none" :stroke="`url(#nuline-${uid})`" stroke-width="3.4"
        vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
      />
    </svg>

    <div class="npc__enddot" :style="{ top: endTop }" />
    <div class="npc__endpill" :style="{ top: endTop }">
      <span class="npc__endpill-label">{{ ticker }} hoje</span>
      <span class="npc__endpill-val">{{ currentLabel }}</span>
    </div>

    <template v-if="hov">
      <div class="npc__cross" :style="{ left: hov.leftPct }" />
      <div class="npc__dot" :style="{ left: hov.leftPct, top: hov.topPct }" />
      <div class="npc__tip" :style="{ left: hov.tipLeft }">
        <div class="npc__tip-date">{{ hov.date }}</div>
        <div class="npc__tip-val">{{ hov.val }}</div>
        <div class="npc__tip-delta" :class="`npc__tip-delta--${hov.dir}`">{{ hov.delta }}</div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.npc { position: relative; width: 100%; height: 100%; cursor: crosshair; }
.npc__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.npc__glow { stroke: var(--nu-blue); }
.npc__gridline { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-cream-text-08); }
.npc__gridlbl {
  position: absolute; right: 18px; transform: translateY(-120%);
  color: var(--nu-cream-text-35); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.npc__enddot {
  position: absolute; right: -1px; width: 13px; height: 13px; border-radius: 50%;
  background: var(--nu-blue-soft); border: 3px solid var(--nu-navy);
  box-shadow: 0 0 0 6px var(--nu-blue-soft-18); transform: translate(30%, -50%);
}
.npc__endpill {
  position: absolute; right: 16px; transform: translateY(calc(-100% - 14px));
  background: var(--nu-cream); border-radius: 14px; padding: 9px 15px;
  white-space: nowrap; box-shadow: var(--nu-shadow-chart-pill);
}
.npc__endpill-label {
  display: block; color: var(--nu-navy-55); font-size: 10.5px; font-weight: 800;
  letter-spacing: .5px; text-transform: uppercase;
}
.npc__endpill-val {
  display: block; color: var(--nu-navy); font-size: 15px; font-weight: 800;
  font-variant-numeric: tabular-nums; margin-top: 2px;
}
.npc__cross {
  position: absolute; top: 0; bottom: 0; width: 1px;
  background: var(--nu-cream-text-30); pointer-events: none; z-index: 2;
}
.npc__dot {
  position: absolute; width: 15px; height: 15px; border-radius: 50%;
  background: var(--nu-white); border: 3.5px solid var(--nu-blue);
  box-shadow: 0 0 0 7px var(--nu-blue-28); transform: translate(-50%, -50%);
  pointer-events: none; z-index: 3;
}
.npc__tip {
  position: absolute; top: 6px; transform: translateX(-50%);
  background: var(--nu-cream); border-radius: var(--nu-r-tile); padding: 12px 17px;
  box-shadow: var(--nu-shadow-chart-tip); pointer-events: none; z-index: 4; white-space: nowrap;
}
.npc__tip-date { color: var(--nu-navy-55); font-size: 12px; font-weight: 700; }
.npc__tip-val {
  color: var(--nu-navy); font-size: 21px; font-weight: 800; margin-top: 3px;
  font-variant-numeric: tabular-nums;
}
.npc__tip-delta { font-size: 13px; font-weight: 800; margin-top: 2px; }
.npc__tip-delta--up { color: var(--nu-green-2); }
.npc__tip-delta--down { color: var(--nu-red-2); }

/* mobile: sem o marcador de fim de linha (UX do dono 2026-07-11) */
@media (max-width: 760px) {
  .npc__endpill { display: none; }
}
</style>
