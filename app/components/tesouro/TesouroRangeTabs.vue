<script setup lang="ts">
// Pills de período do gráfico do título — MESMA pele do NuRangeTabs (ativa em
// creme sólido texto navy 800; inativas texto rgba(creme,.5)), com os 5
// ranges do backend do Tesouro (?range=30d|6m|1y|5y|full). Componente próprio
// porque o NuRangeTabs é tipado nos ranges do /asset (1mo|6mo|12mo).
import type { TesouroRange } from '~/types/tesouro'

const props = defineProps<{ modelValue: TesouroRange; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [TesouroRange] }>()

const TABS: { value: TesouroRange; label: string }[] = [
  { value: '30d', label: '30D' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1A' },
  { value: '5y', label: '5A' },
  { value: 'full', label: 'Tudo' },
]

function select(value: TesouroRange) {
  if (!props.disabled && value !== props.modelValue) emit('update:modelValue', value)
}
</script>

<template>
  <div class="trt" role="tablist" aria-label="Período do gráfico">
    <button
      v-for="t in TABS" :key="t.value" type="button" role="tab"
      class="trt__tab" :class="{ 'trt__tab--active': t.value === modelValue }"
      :aria-selected="t.value === modelValue"
      @click="select(t.value)"
    >{{ t.label }}</button>
  </div>
</template>

<style scoped>
.trt { display: flex; gap: 6px; flex-shrink: 0; flex-wrap: wrap; }
.trt__tab {
  padding: 11px 20px; border-radius: var(--nu-r-pill); border: none; background: transparent;
  color: var(--nu-cream-text-50); font-size: 15px; font-weight: 700; cursor: pointer;
  transition: color .2s, background .2s;
}
.trt__tab:hover { color: var(--nu-cream-text-85); }
.trt__tab--active {
  background: var(--nu-cream); color: var(--nu-navy); font-weight: 800;
}
.trt__tab--active:hover { color: var(--nu-navy); }

@media (max-width: 760px) {
  .trt__tab { padding: 9px 14px; font-size: 14px; }
}
</style>
