<!--
  CalcUiShell — layout V5 completo (status strip + atmospheric + split grid).
  Aceita slots: hero, result, form, chart.
  Mobile: stack vertical (hero → form → result → chart).
  Desktop: split 50/50 (hero | result / form | chart).

  Uso (exemplo):
    <CalcUiShell back-to="/calculadora" back-label="Todas as calculadoras" last-updated="30/04/2026">
      <template #hero>...</template>
      <template #result>...</template>
      <template #form>...</template>
      <template #chart>...</template>
    </CalcUiShell>
-->
<template>
  <article class="cui-shell">
    <div class="cui-shell-atmo cui-shell-atmo--top" aria-hidden="true" />
    <div class="cui-shell-atmo cui-shell-atmo--bottom" aria-hidden="true" />

    <div v-if="backTo" class="cui-shell-status">
      <NuxtLink :to="backTo" class="cui-shell-back">
        <UIcon name="i-lucide-chevron-left" class="size-3.5" />
        {{ backLabel }}
      </NuxtLink>
    </div>

    <div class="cui-shell-split">
      <header class="cui-shell-hero cui-shell-block-hero">
        <slot name="hero" />
        <p v-if="lastUpdated" class="cui-shell-meta">
          Última atualização · {{ lastUpdated }}
        </p>
      </header>

      <section class="cui-shell-result cui-shell-block-result">
        <slot name="result" />
      </section>

      <section class="cui-shell-form cui-shell-block-form">
        <slot name="form" />
      </section>

      <section v-if="$slots.chart" class="cui-shell-chart cui-shell-block-chart">
        <slot name="chart" />
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    lastUpdated?: string
    backTo?: string
    backLabel?: string
  }>(),
  { backLabel: 'Voltar' }
)
</script>

<style scoped>
.cui-shell {
  position: relative;
  overflow: hidden;
}
.cui-shell-atmo {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  filter: blur(200px);
}
.cui-shell-atmo--top {
  top: -15%;
  right: -10%;
  width: 60%;
  height: 70%;
  opacity: 0.4;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--brand-primary) 28%, transparent), transparent 60%);
}
.cui-shell-atmo--bottom {
  bottom: -20%;
  left: -10%;
  width: 50%;
  height: 50%;
  opacity: 0.25;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--brand-primary) 18%, transparent), transparent 60%);
}

.cui-shell-status {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}
@media (min-width: 768px) {
  .cui-shell-status {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 16px;
    padding: 14px 24px;
  }
}

.cui-shell-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px 6px 8px;
  border: 1px solid var(--border-default);
  border-radius: 6px;
  background: var(--bg-elevated);
  color: var(--text-heading);
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  transition: all 150ms ease-out;
}
.cui-shell-back:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 60%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated));
  color: var(--text-heading);
}
.cui-shell-back :deep(*) {
  color: var(--text-muted);
  transition: color 150ms;
}
.cui-shell-back:hover :deep(*) { color: var(--brand-primary); }

.cui-shell-meta {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 24px 0 0;
}

.cui-shell-split {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
}
.cui-shell-block-hero { order: 1; }
.cui-shell-block-form { order: 2; }
.cui-shell-block-result { order: 3; }
.cui-shell-block-chart { order: 4; }

@media (min-width: 1024px) {
  .cui-shell-split {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      "hero result"
      "form chart";
    max-width: 1440px;
    margin: 0 auto;
  }
  .cui-shell-block-hero { grid-area: hero; border-right: 1px solid var(--border-subtle); order: unset; }
  .cui-shell-block-result { grid-area: result; order: unset; }
  .cui-shell-block-form { grid-area: form; border-right: 1px solid var(--border-subtle); order: unset; }
  .cui-shell-block-chart { grid-area: chart; order: unset; }
}

.cui-shell-hero {
  padding: 48px 24px 32px;
  max-width: 880px;
}
@media (min-width: 768px) {
  .cui-shell-hero { padding: 72px 32px 40px; }
}
@media (min-width: 1024px) {
  .cui-shell-hero { padding: 80px 56px 40px 32px; max-width: none; }
}

.cui-shell-result {
  padding: 32px 24px 48px;
  border-top: 1px solid var(--border-subtle);
}
@media (min-width: 768px) {
  .cui-shell-result { padding: 48px 32px 56px; }
}
@media (min-width: 1024px) {
  .cui-shell-result {
    border-top: none;
    padding: 80px 32px 32px 56px;
  }
}

.cui-shell-form {
  padding: 40px 24px;
  border-top: 1px solid var(--border-subtle);
  max-width: 880px;
}
@media (min-width: 768px) {
  .cui-shell-form { padding: 56px 32px; }
}
@media (min-width: 1024px) {
  .cui-shell-form { padding: 32px 56px 80px 32px; max-width: none; }
}

.cui-shell-chart {
  padding: 32px 24px 24px;
  border-top: 1px solid var(--border-subtle);
}
@media (min-width: 1024px) {
  .cui-shell-chart { padding: 32px 32px 56px 56px; }
}
</style>
