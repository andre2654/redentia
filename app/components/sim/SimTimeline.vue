<script setup lang="ts">
// PROTÓTIPO /simulacao — a régua do tempo 2026→2036: eventos (eleições,
// choque do cenário) e cursor ARRASTÁVEL sincronizado com o fan chart
// (v-model:cursor compartilhado). Pointer events puros, sem lib.
import type { SimEvent } from './simMock'

const props = defineProps<{ months: number; dates: string[]; events: SimEvent[] }>()
const cursor = defineModel<number | null>('cursor', { default: null })

const track = ref<HTMLElement | null>(null)
const dragging = ref(false)
function setFromClientX(cx: number) {
  const el = track.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const f = Math.min(1, Math.max(0, (cx - r.left) / r.width))
  cursor.value = Math.round(f * (props.months - 1))
}
function onDown(e: PointerEvent) {
  dragging.value = true
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  setFromClientX(e.clientX)
}
function onMove(e: PointerEvent) {
  if (dragging.value) setFromClientX(e.clientX)
}
function onUp() {
  dragging.value = false
}

const years = computed(() => {
  const out: { f: number; label: string }[] = []
  props.dates.forEach((d, i) => {
    if (d.startsWith('01/')) out.push({ f: i / (props.months - 1), label: d.slice(3) })
  })
  return out
})
const cursorF = computed(() => (cursor.value === null ? null : cursor.value / (props.months - 1)))
const cursorLabel = computed(() => (cursor.value === null ? null : props.dates[cursor.value]))
</script>

<template>
  <div class="stl">
    <div ref="track" class="stl__track" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
      <div class="stl__rail" />
      <span v-for="y in years" :key="y.label" class="stl__year" :style="{ left: `${y.f * 100}%` }">
        <i class="stl__tick" />{{ y.label }}
      </span>
      <span
        v-for="ev in events" :key="ev.label + ev.at" class="stl__event"
        :class="{ 'stl__event--choque': ev.kind === 'choque' }"
        :style="{ left: `${(ev.at / (months - 1)) * 100}%` }"
        :title="ev.label"
      />
      <span v-if="cursorF !== null" class="stl__cursor" :style="{ left: `${cursorF * 100}%` }">
        <i class="stl__knob" />
        <em class="stl__cursor-label">{{ cursorLabel }}</em>
      </span>
    </div>
  </div>
</template>

<style scoped>
.stl { margin-top: 34px; }
.stl__track { position: relative; height: 58px; cursor: ew-resize; touch-action: none; }
.stl__rail { position: absolute; left: 0; right: 0; top: 18px; height: 3px; border-radius: 999px; background: var(--nu-cream-text-12); }
.stl__year { position: absolute; top: 26px; transform: translateX(-50%); color: var(--nu-cream-text-45); font-size: 11.5px; font-weight: 700; display: flex; flex-direction: column; align-items: center; gap: 5px; font-variant-numeric: tabular-nums; }
.stl__tick { width: 1.5px; height: 8px; background: var(--nu-cream-text-45); display: block; margin-top: -12px; }
.stl__event {
  position: absolute; top: 13px; transform: translateX(-50%);
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--nu-cream-text-55); border: 2.5px solid var(--nu-navy);
}
.stl__event--choque { background: var(--nu-amber); width: 15px; height: 15px; top: 11.5px; }
.stl__cursor { position: absolute; top: 0; bottom: 0; transform: translateX(-50%); }
.stl__knob {
  position: absolute; top: 11px; left: 50%; transform: translateX(-50%);
  width: 17px; height: 17px; border-radius: 50%;
  background: var(--nu-blue-soft); box-shadow: 0 0 0 5px var(--nu-blue-soft-35);
}
.stl__cursor-label {
  position: absolute; top: -16px; left: 50%; transform: translateX(-50%);
  color: var(--nu-cream-text); font-size: 11.5px; font-weight: 800; font-style: normal;
  white-space: nowrap; font-variant-numeric: tabular-nums;
}
</style>
