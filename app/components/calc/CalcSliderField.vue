<script setup lang="ts">
// PR10 — campo de slider do kit das calculadoras. Valores exatos do design
// (Redentia Calculadoras Nu.dc.html): linha label (14px w700 muted) vs valor
// formatado (19px w800 tabular-nums); track 8px creme radius 999 com fill azul
// até o valor; thumb 26px azul com borda branca 4px e sombra; chips de preset
// opcionais (ativo = pill preta, inativo = branco com borda sand).
const props = defineProps<{
  label: string
  modelValue: number
  min: number
  max: number
  step: number
  /** valor já formatado pra exibição (ex.: 'R$ 1.000', '11% a.a.') */
  valueText: string
  presets?: { label: string; value: number }[]
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>()

const fillPct = computed(() => {
  const span = props.max - props.min
  if (span <= 0) return 0
  return Math.max(0, Math.min(100, ((props.modelValue - props.min) / span) * 100))
})

function onInput(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}

function isActive(v: number) {
  return Math.abs(props.modelValue - v) < 0.01
}
</script>

<template>
  <div class="csf">
    <div class="csf__row">
      <span class="csf__label">{{ label }}</span>
      <span class="csf__value">{{ valueText }}</span>
    </div>
    <input
      class="csf__range"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :aria-label="label"
      :style="{ background: `linear-gradient(to right, var(--nu-blue) 0% ${fillPct}%, var(--nu-sand-2) ${fillPct}% 100%)` }"
      @input="onInput"
    >
    <div v-if="presets?.length" class="csf__chips">
      <button
        v-for="p in presets"
        :key="p.label"
        type="button"
        class="csf__chip"
        :class="{ 'csf__chip--active': isActive(p.value) }"
        @click="emit('update:modelValue', p.value)"
      >{{ p.label }}</button>
    </div>
  </div>
</template>

<style scoped>
.csf__row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.csf__label { color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.csf__value { color: var(--nu-ink); font-size: 19px; font-weight: 800; font-variant-numeric: tabular-nums; }

.csf__range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: var(--nu-r-pill);
  outline: none;
  margin-top: 14px;
  display: block;
}
.csf__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--nu-blue);
  border: 4px solid var(--nu-white);
  box-shadow: var(--nu-shadow-slider-thumb);
  cursor: pointer;
}
.csf__range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--nu-blue);
  border: 4px solid var(--nu-white);
  box-shadow: var(--nu-shadow-slider-thumb);
  cursor: pointer;
}

.csf__chips { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.csf__chip {
  padding: 8px 14px;
  border-radius: var(--nu-r-pill);
  font-size: 12.5px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  border: 2px solid var(--nu-sand-border);
  background: var(--nu-white);
  color: var(--nu-gray-2);
  transition: all .2s;
}
.csf__chip--active {
  border-color: var(--nu-ink);
  background: var(--nu-ink);
  color: var(--nu-white);
}
</style>
