<script setup lang="ts">
// Pills de período sobre fundo dark (design Acoes Nu): ativa em creme sólido
// texto navy 800; inativas texto rgba(creme,.5) 700 sem bg. No design são
// estáticas — aqui são funcionais via v-model (spec NuRangeTabs).
import type { AcaoRange } from '~/types/acao'

const props = defineProps<{ modelValue: AcaoRange; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [AcaoRange] }>()

const TABS: { value: AcaoRange; label: string }[] = [
  { value: '1mo', label: '1M' },
  { value: '6mo', label: '6M' },
  { value: '12mo', label: '12M' },
]

function select(value: AcaoRange) {
  if (!props.disabled && value !== props.modelValue) emit('update:modelValue', value)
}
</script>

<template>
  <div class="nrt" role="tablist" aria-label="Período do gráfico">
    <button
      v-for="t in TABS" :key="t.value" type="button" role="tab"
      class="nrt__tab" :class="{ 'nrt__tab--active': t.value === modelValue }"
      :aria-selected="t.value === modelValue"
      @click="select(t.value)"
    >{{ t.label }}</button>
  </div>
</template>

<style scoped>
.nrt { display: flex; gap: 6px; flex-shrink: 0; }
.nrt__tab {
  padding: 11px 20px; border-radius: var(--nu-r-pill); border: none; background: transparent;
  color: var(--nu-cream-text-50); font-size: 15px; font-weight: 700; cursor: pointer;
  transition: color .2s, background .2s;
}
.nrt__tab:hover { color: var(--nu-cream-text-85); }
.nrt__tab--active {
  background: var(--nu-cream); color: var(--nu-navy); font-weight: 800;
}
.nrt__tab--active:hover { color: var(--nu-navy); }
</style>
