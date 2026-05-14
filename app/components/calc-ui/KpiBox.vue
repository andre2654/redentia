<!--
  CalcUiKpiBox — KPI compacto V5 (label uppercase + value tabular).
  Usado em grids dentro de results pra mostrar Total Investido, Juros etc.
  color: 'heading' (default), 'positive' (verde), 'negative' (vermelho), 'primary' (amber).
-->
<template>
  <div class="cui-kpi">
    <p class="cui-kpi-label">{{ label }}</p>
    <p
      class="cui-kpi-value"
      :class="[`cui-kpi-value--${color}`, { 'cui-kpi-value--nowrap': nowrap }]"
    >
      <slot>{{ value }}</slot>
    </p>
    <p v-if="caption || $slots.caption" class="cui-kpi-caption">
      <slot name="caption">{{ caption }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value?: string | number
    caption?: string
    color?: 'heading' | 'positive' | 'negative' | 'primary' | 'body'
    nowrap?: boolean
  }>(),
  { color: 'heading', nowrap: true }
)
</script>

<style scoped>
.cui-kpi {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cui-kpi-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0;
}
.cui-kpi-value {
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.018em;
  margin: 0;
  line-height: 1.1;
}
.cui-kpi-value--nowrap {
  white-space: nowrap;
}
.cui-kpi-value--heading { color: var(--text-heading); }
.cui-kpi-value--body { color: var(--text-body); }
.cui-kpi-value--positive { color: var(--brand-positive); }
.cui-kpi-value--negative { color: var(--brand-negative); }
.cui-kpi-value--primary { color: var(--brand-primary); }
.cui-kpi-caption {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}
</style>
