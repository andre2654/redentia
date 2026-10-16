<script setup lang="ts">
// Carteira própria: retorno acumulado desde a primeira rodada, num painel
// navy com a anatomia do NuPerformanceChart da tese ("A tese em números"):
// linha azul com brilho e área em degradê, Ibovespa tracejado em creme,
// Tesouro Selic pontilhado, pílula creme no fim da linha. Forma "ênfase": um
// modelo em destaque, os outros em creme apagado como contexto. Pílulas no
// topo escolhem o modelo.
// Movimento: ao entrar na tela as linhas se revelam da esquerda para a direita
// (clipPath que cresce); trocar de modelo faz a linha nova surgir; no hover
// (mouse ou toque: o toque simples já abre o cursor) um cursor vertical mostra
// data, modelo, Ibovespa e Tesouro Selic.
// Marcos: ponto fixo na linha em destaque com uma etiqueta (o começo da arena;
// depois, as rodadas mensais), para quem chega saber de onde a conta parte.
const props = defineProps<{
  labels: string[]
  ibov: number[]
  selic: number[]
  series: { id: string; name: string; values: number[] }[]
  marcos?: { i: number; label: string }[]
  footnote?: string
}>()
const selected = defineModel<string>({ required: true })

const { el, revealClass } = useReveal(0.2)
const H = 320
const n = computed(() => props.labels.length)
const domain = computed(() => {
  const vals = [...props.ibov, ...props.selic, ...props.series.flatMap((s) => s.values)]
  let min = Math.min(...vals)
  let max = Math.max(...vals)
  // faixa mínima de 10 pontos: no começo da arena as diferenças são de décimos
  // (só o custo de montar a carteira) e não podem parecer um tombo no gráfico
  if (max - min < 10) { const mid = (max + min) / 2; min = mid - 5; max = mid + 5 }
  const span = max - min
  return { lo: min - span * 0.06, hi: max + span * 0.1 }
})
const Y = (v: number) => 14 + ((domain.value.hi - v) / (domain.value.hi - domain.value.lo)) * (H - 40)
const X = (i: number) => (i / Math.max(1, n.value - 1)) * 1000
const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('')
const sel = computed(() => props.series.find((s) => s.id === selected.value) ?? props.series[0])
const others = computed(() => props.series.filter((s) => s.id !== sel.value?.id))
const area = computed(() => (sel.value ? `${path(sel.value.values)}L1000,${H}L0,${H}Z` : ''))

const grid = computed(() => {
  const { lo, hi } = domain.value
  const step = [1, 2, 5, 10, 20, 25, 50].find((c) => (hi - lo) / c <= 4) ?? 50
  const out: { top: string; lbl: string }[] = []
  for (let m = Math.ceil(lo / step) * step; m < hi; m += step) {
    if (m <= lo) continue
    out.push({ top: `${((Y(m) / H) * 100).toFixed(2)}%`, lbl: `${m > 0 ? '+' : ''}${m}%` })
  }
  return out
})
const last = (arr: number[]) => arr[arr.length - 1] ?? 0
const endSel = computed(() => (sel.value ? last(sel.value.values) : 0))
const endIbov = computed(() => last(props.ibov))
const pills = computed(() => {
  const a = (Y(endSel.value) / H) * 100
  const b = (Y(endIbov.value) / H) * 100
  const gap = 16
  if (Math.abs(a - b) >= gap) return { sel: a, ibov: b }
  const mid = (a + b) / 2
  return a < b ? { sel: mid - gap / 2, ibov: mid + gap / 2 } : { sel: mid + gap / 2, ibov: mid - gap / 2 }
})

const marks = computed(() => (props.marcos ?? [])
  .filter((m) => m.i >= 0 && m.i < n.value)
  .map((m) => ({
    key: `${m.i}-${m.label}`,
    label: m.label,
    left: `${(X(m.i) / 10).toFixed(2)}%`,
    top: `${((Y(sel.value?.values[m.i] ?? 0) / H) * 100).toFixed(2)}%`,
    // perto da borda direita a etiqueta abre para a esquerda
    flip: m.i / Math.max(1, n.value - 1) > 0.6,
  })))

const hov = ref(-1)
function onMove(e: PointerEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  hov.value = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (n.value - 1))
}
const tip = computed(() => {
  const i = hov.value
  if (i < 0 || !sel.value) return null
  const frac = i / Math.max(1, n.value - 1)
  return {
    left: `${(frac * 100).toFixed(2)}%`,
    tipLeft: `${(Math.min(0.82, Math.max(0.18, frac)) * 100).toFixed(2)}%`,
    top: `${((Y(sel.value.values[i] ?? 0) / H) * 100).toFixed(2)}%`,
    date: props.labels[i],
    sel: fmtBench.signedPct(sel.value.values[i] ?? 0),
    ibov: fmtBench.signedPct(props.ibov[i] ?? 0),
    selic: fmtBench.signedPct(props.selic[i] ?? 0),
  }
})
</script>

<template>
  <div ref="el" class="blv" :class="revealClass">
    <div class="blv__pick" role="radiogroup" aria-label="Modelo em destaque">
      <button
        v-for="s in series" :key="s.id" type="button" role="radio" class="blv__pill"
        :class="{ 'blv__pill--on': s.id === sel?.id }" :aria-checked="s.id === sel?.id" @click="selected = s.id"
      >{{ s.name }}</button>
    </div>
    <!-- estreito: as dez pílulas ocupavam quatro linhas; vira o mesmo seletor nativo do menu -->
    <label class="blv__select">
      <span class="blv__select-lbl">Modelo em destaque</span>
      <span class="blv__select-val">{{ sel?.name }}</span>
      <svg class="blv__select-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      <select :value="sel?.id" aria-label="Modelo em destaque" @change="selected = ($event.target as HTMLSelectElement).value">
        <option v-for="s in series" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </label>

    <div class="blv__legend" aria-hidden="true">
      <span><i class="blv__sw blv__sw--sel" />{{ sel?.name }}</span>
      <span><i class="blv__sw blv__sw--ibov" />Ibovespa</span>
      <span><i class="blv__sw blv__sw--selic" />Tesouro Selic</span>
      <span><i class="blv__sw blv__sw--other" />Outros modelos</span>
    </div>

    <div
      class="blv__plot" role="img"
      :aria-label="`Retorno acumulado: ${sel?.name} ${fmtBench.signedPct(endSel)}, Ibovespa ${fmtBench.signedPct(endIbov)}`"
      @pointerdown="onMove" @pointermove="onMove" @pointerleave="hov = -1"
    >
      <template v-for="g in grid" :key="g.lbl">
        <div class="blv__gridline" :style="{ top: g.top }" />
        <div class="blv__gridlbl" :style="{ top: g.top }">{{ g.lbl }}</div>
      </template>
      <svg viewBox="0 0 1000 320" preserveAspectRatio="none" class="blv__svg" aria-hidden="true">
        <defs>
          <linearGradient id="blv-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" class="blv__stop-a" />
            <stop offset="1" class="blv__stop-b" />
          </linearGradient>
          <clipPath id="blv-clip"><rect class="blv__clip" x="0" y="0" width="1000" height="320" /></clipPath>
        </defs>
        <g clip-path="url(#blv-clip)">
          <path v-for="s in others" :key="s.id" :d="path(s.values)" fill="none" class="blv__other" stroke-width="1.4" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
          <path :d="path(selic)" fill="none" class="blv__selic" stroke-width="2" stroke-dasharray="1 6" vector-effect="non-scaling-stroke" stroke-linecap="round" />
          <path :d="path(ibov)" fill="none" class="blv__ibov" stroke-width="2" stroke-dasharray="7 7" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
          <g v-if="sel" :key="sel.id" class="blv__selg">
            <path :d="area" fill="url(#blv-area)" />
            <path :d="path(sel.values)" fill="none" class="blv__glow" stroke-width="10" stroke-opacity=".28" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
            <path :d="path(sel.values)" fill="none" class="blv__sel" stroke-width="3.2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
          </g>
        </g>
      </svg>
      <div class="blv__end blv__end--sel" :style="{ top: `${pills.sel}%` }">
        <span class="blv__end-lbl">{{ sel?.name }}</span>
        <span class="blv__end-val">{{ fmtBench.signedPct(endSel) }}</span>
      </div>
      <div class="blv__end blv__end--ibov" :style="{ top: `${pills.ibov}%` }">
        <span class="blv__end-lbl">Ibovespa</span>
        <span class="blv__end-val">{{ fmtBench.signedPct(endIbov) }}</span>
      </div>
      <div v-for="m in marks" :key="m.key" class="blv__mark" :class="{ 'blv__mark--flip': m.flip }" :style="{ left: m.left, top: m.top }">
        <span class="blv__mark-dot" />
        <span class="blv__mark-lbl">{{ m.label }}</span>
      </div>
      <template v-if="tip">
        <div class="blv__cross" :style="{ left: tip.left }" />
        <div class="blv__dot" :style="{ left: tip.left, top: tip.top }" />
        <div class="blv__tip" :style="{ left: tip.tipLeft }">
          <div class="blv__tip-date">{{ tip.date }}</div>
          <div class="blv__tip-main">{{ tip.sel }}</div>
          <div class="blv__tip-row">Ibovespa {{ tip.ibov }}</div>
          <div class="blv__tip-row">Tesouro Selic {{ tip.selic }}</div>
        </div>
      </template>
    </div>
    <div class="blv__axis" aria-hidden="true"><span>{{ labels[0] }}</span><span>{{ labels[labels.length - 1] }}</span></div>
    <p v-if="footnote" class="blv__foot">{{ footnote }}</p>
  </div>
</template>

<style scoped>
.blv { background: var(--nu-navy); border-radius: var(--nu-r-panel); padding: clamp(20px, 2.6vw, 32px); container-type: inline-size; }
.blv__pick { display: flex; gap: 6px; flex-wrap: wrap; }
.blv__pill {
  padding: 7px 13px; border-radius: var(--nu-r-pill); cursor: pointer; font-family: inherit;
  border: 1px solid var(--nu-cream-text-18); background: transparent;
  color: var(--nu-cream-text-78); font-size: var(--nu-fs-dense); font-weight: 700;
  transition: background .2s, color .2s, border-color .2s, transform .2s;
}
.blv__pill:hover { border-color: var(--nu-cream-text-45); color: var(--nu-cream-text); transform: translateY(-1px); }
.blv__pill--on, .blv__pill--on:hover { background: var(--nu-cream); border-color: var(--nu-cream); color: var(--nu-navy); }
.blv__pill:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

.blv__legend {
  display: flex; gap: 6px 18px; flex-wrap: wrap; margin-top: 18px;
  color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500;
}
.blv__legend span { display: inline-flex; align-items: center; gap: 8px; }
.blv__sw { display: inline-block; width: 18px; height: 3px; border-radius: 2px; }
.blv__sw--sel { background: var(--nu-tese-line); height: 4px; }
.blv__sw--ibov { background: repeating-linear-gradient(90deg, var(--nu-cream-text-65) 0 5px, transparent 5px 9px); }
.blv__sw--selic { background: repeating-linear-gradient(90deg, var(--nu-cream-text-55) 0 2px, transparent 2px 6px); }
.blv__sw--other { background: var(--nu-cream-text-30); height: 2px; }

.blv__plot { position: relative; height: clamp(240px, 30vw, 340px); margin-top: 14px; cursor: crosshair; touch-action: pan-y; }
.blv__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.blv__selic { stroke: var(--nu-cream-text-55); }
.blv__other { stroke: var(--nu-cream-text-30); }
.blv__ibov { stroke: var(--nu-cream-text-65); }
.blv__glow { stroke: var(--nu-blue); }
.blv__sel { stroke: var(--nu-tese-line); }
.blv__stop-a { stop-color: var(--nu-blue); stop-opacity: .35; }
.blv__stop-b { stop-color: var(--nu-blue); stop-opacity: 0; }
.blv__gridline { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-cream-text-08); }
.blv__gridlbl {
  position: absolute; left: 0; transform: translateY(-120%);
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums;
}
.blv__end {
  position: absolute; right: 0; transform: translateY(-50%); display: flex; flex-direction: column; align-items: flex-end;
  border-radius: 12px; padding: 6px 11px; white-space: nowrap; pointer-events: none; transition: top .4s ease;
}
.blv__end--sel { background: var(--nu-cream); box-shadow: var(--nu-shadow-chart-pill); }
.blv__end--ibov { background: var(--nu-navy-2); }
.blv__end-lbl { font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
.blv__end--sel .blv__end-lbl { color: var(--nu-navy-55); }
.blv__end--ibov .blv__end-lbl { color: var(--nu-cream-text-55); }
.blv__end-val { font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.blv__end--sel .blv__end-val { color: var(--nu-navy); }
.blv__end--ibov .blv__end-val { color: var(--nu-cream-text); }
.blv__cross { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--nu-cream-text-30); pointer-events: none; }
.blv__dot {
  position: absolute; width: 14px; height: 14px; border-radius: 50%; background: var(--nu-white); border: 3px solid var(--nu-blue);
  box-shadow: 0 0 0 6px var(--nu-blue-28); transform: translate(-50%, -50%); pointer-events: none;
}
.blv__mark { position: absolute; width: 0; height: 0; pointer-events: none; z-index: 2; }
.blv__mark-dot {
  position: absolute; width: 12px; height: 12px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-cream); border: 3px solid var(--nu-blue); box-shadow: 0 0 0 5px var(--nu-blue-28);
}
.blv__mark-lbl {
  position: absolute; left: 12px; top: 12px; white-space: nowrap; border-radius: var(--nu-r-pill); padding: 4px 10px;
  background: var(--nu-cream); color: var(--nu-navy); font-size: var(--nu-fs-xs); font-weight: 700; box-shadow: var(--nu-shadow-chart-pill);
}
.blv__mark--flip .blv__mark-lbl { left: auto; right: 12px; }
.blv__tip {
  position: absolute; top: 4px; transform: translateX(-50%); z-index: 3; background: var(--nu-cream);
  border-radius: var(--nu-r-tile); padding: 10px 14px; box-shadow: var(--nu-shadow-chart-tip); pointer-events: none; white-space: nowrap;
}
.blv__tip-date { color: var(--nu-navy-55); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
.blv__tip-main { color: var(--nu-navy); font-size: var(--nu-fs-lg); font-weight: 800; font-variant-numeric: tabular-nums; }
.blv__tip-row { color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 500; font-variant-numeric: tabular-nums; }
.blv__axis { display: flex; justify-content: space-between; margin-top: 10px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; }
.blv__foot { margin: 14px 0 0; color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— entrada: as linhas se revelam da esquerda; troca de modelo faz a nova surgir ——— */
.blv__clip { transform-box: fill-box; transform-origin: left; }
.is-pending .blv__clip { transform: scaleX(0); }
.is-in .blv__clip { transform: scaleX(1); transition: transform 1.4s cubic-bezier(.45, .05, .2, 1); }
.is-pending .blv__end, .is-pending .blv__mark { opacity: 0; }
.is-in .blv__mark { transition: opacity .4s ease .3s; }
.is-in .blv__end { transition: opacity .4s ease 1.1s, top .4s ease; }
.blv__selg { animation: blv-pop .45s ease; }
@keyframes blv-pop { from { opacity: 0; } to { opacity: 1; } }

.blv__select { display: none; }
@container (max-width: 640px) {
  .blv__pick { display: none; }
  .blv__select {
    position: relative; display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 14px;
    border-radius: var(--nu-r-input); border: 1px solid var(--nu-cream-text-18); color: var(--nu-cream-text);
  }
  .blv__select:has(select:focus-visible) { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
  .blv__select-lbl { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; }
  .blv__select-val { flex: 1; min-width: 0; font-size: var(--nu-fs-md); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .blv__select-chev { width: 18px; height: 18px; flex-shrink: 0; color: var(--nu-cream-text-55); }
  .blv__select select { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; font-size: var(--nu-fs-md); }
}
</style>
