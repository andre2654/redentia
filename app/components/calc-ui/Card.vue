<!--
  CalcUiCard — wrapper de card unificado V5.
  Substitui .quiet-card + cards inline com color-mix.
  Uso: <CalcUiCard title="Título" icon="i-lucide-trending-up">...</CalcUiCard>
-->
<template>
  <section class="cui-card">
    <header v-if="title || icon || $slots.header" class="cui-card-header">
      <UIcon v-if="icon" :name="icon" class="cui-card-icon" />
      <component :is="headingTag" v-if="title" class="cui-card-title">
        {{ title }}
      </component>
      <slot name="header" />
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    icon?: string
    headingTag?: 'h2' | 'h3' | 'h4'
  }>(),
  { headingTag: 'h2' }
)
</script>

<style scoped>
.cui-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}
@media (min-width: 640px) {
  .cui-card { gap: 24px; padding: 24px; }
}

.cui-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}
.cui-card-icon {
  width: 20px;
  height: 20px;
  color: var(--brand-primary);
  flex-shrink: 0;
}
@media (min-width: 640px) {
  .cui-card-icon { width: 24px; height: 24px; }
}
.cui-card-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.012em;
  color: var(--text-heading);
  margin: 0;
}
@media (min-width: 640px) {
  .cui-card-title { font-size: 20px; }
}
</style>
