<!--
  CalcUiResultMega — hero result V5 (mega number + KPIs em grid).
  Substitui o block "Resultados da Simulação" inline com text-2xl espalhado.
  Uso: <CalcUiResultMega eyebrow="Valor projetado" :value="formatBRL(result.finalValue)" :kpis="[...]" />
-->
<template>
  <section class="cui-result">
    <p v-if="eyebrow" class="cui-result-eyebrow">{{ eyebrow }}</p>
    <p class="cui-result-mega" :class="`cui-result-mega--${megaColor}`">
      <slot name="value">{{ value }}</slot>
    </p>
    <p v-if="caption || $slots.caption" class="cui-result-caption">
      <slot name="caption">{{ caption }}</slot>
    </p>

    <div v-if="kpis?.length" class="cui-result-divider" />

    <dl v-if="kpis?.length" class="cui-result-kpis">
      <div v-for="k in kpis" :key="k.label">
        <dt>{{ k.label }}</dt>
        <dd
          class="cui-result-kpi-value"
          :class="`cui-result-kpi-value--${k.color ?? 'heading'}`"
        >
          {{ k.value }}
        </dd>
      </div>
    </dl>

    <slot name="footer" />
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    value?: string | number
    caption?: string
    megaColor?: 'primary' | 'positive' | 'negative' | 'heading'
    kpis?: Array<{
      label: string
      value: string | number
      color?: 'heading' | 'positive' | 'negative' | 'primary' | 'body'
    }>
  }>(),
  { megaColor: 'primary' }
)
</script>

<style scoped>
.cui-result {
  display: flex;
  flex-direction: column;
}
.cui-result-eyebrow {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  margin: 0 0 16px;
}
.cui-result-mega {
  font-size: clamp(40px, 11vw, 96px);
  font-weight: 300;
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  margin: 0;
  text-shadow: 0 8px 32px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}
@media (min-width: 1024px) {
  .cui-result-mega { font-size: clamp(48px, 5.5vw, 88px); }
}
.cui-result-mega--primary { color: var(--brand-primary); }
.cui-result-mega--positive { color: var(--brand-positive); }
.cui-result-mega--negative { color: var(--brand-negative); }
.cui-result-mega--heading {
  color: var(--text-heading);
  text-shadow: none;
}
.cui-result-caption {
  font-size: 15px;
  color: var(--text-body);
  margin: 12px 0 0;
  font-variant-numeric: tabular-nums;
  line-height: 1.55;
}
.cui-result-caption :deep(.hl) { color: var(--text-heading); font-weight: 500; }
.cui-result-caption :deep(.positive) { color: var(--brand-positive); font-weight: 500; }
.cui-result-caption :deep(.negative) { color: var(--brand-negative); font-weight: 500; }

.cui-result-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: 36px 0 24px;
}
.cui-result-kpis {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin: 0;
}
@media (min-width: 640px) {
  .cui-result-kpis { grid-template-columns: repeat(3, 1fr); gap: 40px; }
}
.cui-result-kpis dt {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.cui-result-kpi-value {
  font-size: clamp(22px, 4vw, 30px);
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  margin: 0;
  white-space: nowrap;
}
.cui-result-kpi-value--heading { color: var(--text-heading); }
.cui-result-kpi-value--body { color: var(--text-body); }
.cui-result-kpi-value--positive { color: var(--brand-positive); }
.cui-result-kpi-value--negative { color: var(--brand-negative); }
.cui-result-kpi-value--primary { color: var(--brand-primary); }
</style>
