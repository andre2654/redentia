<!--
  CalcUiChart — wrapper de chart V5 (label + period pills opcionais + altura responsiva).
  Uso: <CalcUiChart label="Evolução do patrimônio" :periods="..."><AtomsGraphLine ... /></CalcUiChart>
-->
<template>
  <section class="cui-chart">
    <header v-if="label || periods?.length" class="cui-chart-header">
      <p v-if="label" class="cui-chart-label">{{ label }}</p>
      <div v-if="periods?.length" class="cui-chart-periods">
        <button
          v-for="p in periods"
          :key="p.value"
          :class="['cui-chart-pill', { 'cui-chart-pill--active': p.value === active }]"
          @click="$emit('update:active', p.value)"
        >
          {{ p.label }}
        </button>
      </div>
    </header>
    <div class="cui-chart-canvas" :style="customHeight ? { height: customHeight } : undefined">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  periods?: Array<{ value: number | string; label: string }>
  active?: number | string
  customHeight?: string
}>()

defineEmits<{ 'update:active': [value: number | string] }>()
</script>

<style scoped>
.cui-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cui-chart-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.cui-chart-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin: 0;
}
.cui-chart-periods {
  display: flex;
  gap: 4px;
}
.cui-chart-pill {
  padding: 4px 10px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: 4px;
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: all 150ms;
}
.cui-chart-pill:hover { color: var(--text-heading); }
.cui-chart-pill--active {
  background: var(--brand-primary);
  color: #1A0A2E;
}
.cui-chart-canvas {
  height: 280px;
}
@media (min-width: 768px) {
  .cui-chart-canvas { height: 380px; }
}
</style>
