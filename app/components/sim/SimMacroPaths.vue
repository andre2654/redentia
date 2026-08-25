<script setup lang="ts">
// PROTÓTIPO /simulacao — "Os indicadores na década" (dono 25/08): as
// trajetórias de dólar/Selic/IBOV/petróleo com CHECKS por indicador. A curva
// segue a base histórica mock, ATINGE o alvo no ano do cenário (dot âmbar) e
// volta a racionalizar a base dali em diante; indicadores não definidos
// reagem por correlação (solavanco transitório). Cursor compartilhado com o
// fan chart / timeline. Cada série é normalizada na PRÓPRIA escala — as
// linhas mostram FORMA, os números vivem no tooltip e no rótulo final.
import { buildMacroPaths, fmtMacro, type SimEvent, type SimMacroKey, type SimScheduledScenario } from './simMock'

const props = defineProps<{
  dates: string[]
  schedule: SimScheduledScenario[]
  events: SimEvent[]
}>()
const cursor = defineModel<number | null>('cursor', { default: null })

const W = 1000
const H = 190

const paths = computed(() => buildMacroPaths(props.schedule))

const COLOR: Record<SimMacroKey, string> = {
  dolar: 'var(--nu-green-soft)',
  selic: 'var(--nu-alloc-fii)',
  bolsa: 'var(--nu-blue-soft)',
  petroleo: 'var(--nu-class-bdr)',
}

// checks: pré-marcados os indicadores TOCADOS na etapa 2 (fallback: dólar+IBOV)
const checked = ref<Set<SimMacroKey>>(new Set())
watch(paths, (ps) => {
  const touched = ps.filter((p) => p.touched).map((p) => p.key)
  checked.value = new Set(touched.length ? touched : ['dolar', 'bolsa'])
}, { immediate: true })
function toggle(k: SimMacroKey) {
  const next = new Set(checked.value)
  if (next.has(k)) next.delete(k)
  else next.add(k)
  checked.value = next
}

const visible = computed(() => paths.value.filter((p) => checked.value.has(p.key)))

function _len(): number { return paths.value[0]?.values.length ?? 120 }
function X(i: number): number {
  return (i / (_len() - 1)) * W
}

/** normalização POR SÉRIE: forma, não escala comum */
function scaled(values: number[]): { y: (i: number) => number } {
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const span = hi - lo || 1
  return { y: (i: number) => 14 + (1 - (values[i]! - lo) / span) * (H - 40) }
}
const lines = computed(() => visible.value.map((p) => {
  const s = scaled(p.values)
  let d = ''
  p.values.forEach((_, i) => { d += `${i ? 'L' : 'M'}${X(i).toFixed(1)},${s.y(i).toFixed(1)}` })
  return {
    key: p.key,
    color: COLOR[p.key],
    d,
    anchors: p.anchors.map((a) => ({ x: X(a.at), y: s.y(a.at) })),
    endY: s.y(p.values.length - 1),
    endLabel: fmtMacro(p.key, p.values[p.values.length - 1]!),
  }
}))

const hover = ref<number | null>(null)
function onMove(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  hover.value = Math.round(f * (_len() - 1))
  cursor.value = hover.value
}
function onLeave() { hover.value = null }
const cursorIdx = computed(() => hover.value ?? cursor.value)
const tip = computed(() => {
  const i = cursorIdx.value
  if (i === null || i < 0 || !visible.value.length) return null
  return {
    x: (i / (_len() - 1)) * 100,
    date: props.dates[i] ?? '',
    rows: visible.value.map((p) => ({ key: p.key, label: p.label, color: COLOR[p.key], txt: fmtMacro(p.key, p.values[i]!) })),
  }
})
</script>

<template>
  <div class="smp">
    <div class="smp__head">
      <span class="smp__label">Os indicadores na década</span>
      <div class="smp__checks">
        <button
          v-for="p in paths" :key="p.key" type="button"
          class="smp__check" :class="{ 'smp__check--on': checked.has(p.key) }"
          :aria-pressed="checked.has(p.key)" @click="toggle(p.key)"
        >
          <i class="smp__dot" :style="{ background: checked.has(p.key) ? COLOR[p.key] : 'transparent', borderColor: COLOR[p.key] }" />
          {{ p.label }}
        </button>
      </div>
    </div>

    <div class="smp__chart" @mousemove="onMove" @mouseleave="onLeave">
      <svg class="smp__svg" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
        <!-- marcos dos cenários (mesmas linhas âmbar do gráfico principal) -->
        <line
          v-for="ev in events.filter((e) => e.kind === 'choque')" :key="'m' + ev.at"
          :x1="X(ev.at)" y1="6" :x2="X(ev.at)" :y2="H - 10"
          stroke="var(--nu-amber)" stroke-width="1.2" opacity="0.55" vector-effect="non-scaling-stroke"
        />
        <g v-for="l in lines" :key="l.key">
          <path :d="l.d" fill="none" :stroke="l.color" stroke-width="2" vector-effect="non-scaling-stroke" class="smp__line" />
          <!-- a âncora: o ponto que o cenário CRAVA -->
          <circle v-for="(a, i) in l.anchors" :key="i" :cx="a.x" :cy="a.y" r="4.5" :fill="l.color" stroke="var(--nu-navy)" stroke-width="2" />
        </g>
        <line v-if="tip" :x1="(tip.x / 100) * W" y1="6" :x2="(tip.x / 100) * W" :y2="H - 10" stroke="var(--nu-cream-text-45)" stroke-width="1" vector-effect="non-scaling-stroke" />
      </svg>

      <!-- rótulo do valor FINAL de cada linha, na cor dela -->
      <span
        v-for="l in lines" :key="'e' + l.key" class="smp__end"
        :style="{ top: `${(l.endY / H) * 100}%`, color: l.color }"
      >{{ l.endLabel }}</span>

      <div v-if="tip" class="smp__tip" :style="{ left: `${Math.min(80, Math.max(16, tip.x))}%` }">
        <span class="smp__tip-date">{{ tip.date }}</span>
        <span v-for="r in tip.rows" :key="r.key" class="smp__tip-row"><i :style="{ background: r.color }" />{{ r.label }} <b>{{ r.txt }}</b></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.smp { margin-top: 34px; }
.smp__head { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.smp__label { color: var(--nu-cream-text-55); font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.smp__checks { display: flex; gap: 6px; flex-wrap: wrap; }
.smp__check {
  display: inline-flex; align-items: center; gap: 7px;
  border: 1.5px solid var(--nu-cream-text-12); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-cream-text-55);
  padding: 7px 13px; font-size: 12.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: color 0.15s, border-color 0.15s;
}
.smp__check--on { color: var(--nu-cream-text); border-color: var(--nu-cream-text-22); }
.smp__check:hover { border-color: var(--nu-cream-text-45); }
.smp__dot { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid; transition: background 0.15s; }

.smp__chart { position: relative; margin-top: 14px; height: 190px; }
.smp__svg { display: block; width: 100%; height: 100%; overflow: visible; }
.smp__line { animation: nu-fade 0.5s ease both; }
.smp__end {
  position: absolute; right: 0; transform: translateY(-50%);
  font-size: 11.5px; font-weight: 800; font-variant-numeric: tabular-nums;
  background: var(--nu-navy); padding-left: 6px;
}
.smp__tip {
  position: absolute; top: 2px; transform: translateX(-50%);
  display: flex; flex-direction: column; gap: 3px;
  background: var(--nu-navy-2); border-radius: 12px; padding: 9px 12px;
  pointer-events: none; box-shadow: var(--nu-shadow-float);
}
.smp__tip-date { color: var(--nu-cream-text-55); font-size: 10.5px; font-weight: 800; }
.smp__tip-row { display: flex; align-items: center; gap: 6px; color: var(--nu-cream-text-70); font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.smp__tip-row i { width: 8px; height: 8px; border-radius: 50%; }
.smp__tip-row b { color: var(--nu-cream-text); font-weight: 800; font-variant-numeric: tabular-nums; margin-left: auto; }
</style>
