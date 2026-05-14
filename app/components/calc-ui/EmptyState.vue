<!--
  CalcUiEmptyState — empty state V5 unificado.
  Substitui o border-dashed bg-white/5 do FairPrice e similares.
  quickPicks: array de tickers ou cenários para 1-click select.
-->
<template>
  <div class="cui-empty">
    <UIcon v-if="icon" :name="icon" class="cui-empty-icon" />
    <p class="cui-empty-title">{{ title }}</p>
    <p v-if="description" class="cui-empty-description">{{ description }}</p>

    <div v-if="quickPicks?.length" class="cui-empty-picks">
      <span class="cui-empty-picks-label">{{ quickPicksLabel ?? 'Populares' }}:</span>
      <button
        v-for="pick in quickPicks"
        :key="pick.value"
        type="button"
        class="cui-empty-pick"
        @click="$emit('pick', pick.value)"
      >
        {{ pick.label }}
      </button>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title: string
    description?: string
    quickPicks?: Array<{ value: string; label: string }>
    quickPicksLabel?: string
  }>(),
  { icon: 'i-lucide-search' }
)

defineEmits<{ pick: [value: string] }>()
</script>

<style scoped>
.cui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-elevated);
}
.cui-empty-icon {
  width: 40px;
  height: 40px;
  color: color-mix(in srgb, var(--brand-primary) 60%, transparent);
  margin-bottom: 12px;
}
.cui-empty-title {
  font-size: 17px;
  font-weight: 500;
  color: var(--text-heading);
  margin: 0 0 6px;
}
.cui-empty-description {
  font-size: 14px;
  color: var(--text-body);
  line-height: 1.55;
  max-width: 36ch;
  margin: 0 0 20px;
}
.cui-empty-picks {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}
.cui-empty-picks-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-right: 4px;
}
.cui-empty-pick {
  padding: 5px 12px;
  border: 1px solid var(--border-default);
  background: var(--bg-overlay);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-heading);
  cursor: pointer;
  transition: all 150ms;
}
.cui-empty-pick:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 60%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 10%, var(--bg-overlay));
}
</style>
