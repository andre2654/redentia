<!--
  CalcUiSegmented — segmented control V5 (mode picker).
  Substitui AtomsSegmented direto. Uniform across all calcs.
-->
<template>
  <div class="cui-segmented" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="opt in options"
      :key="opt.value"
      role="tab"
      :aria-selected="opt.value === modelValue"
      :class="['cui-seg-btn', { 'cui-seg-btn--active': opt.value === modelValue }]"
      @click="$emit('update:modelValue', opt.value)"
    >
      <UIcon v-if="opt.icon" :name="opt.icon" class="cui-seg-icon" />
      <span>{{ opt.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number
  options: Array<{ value: string | number; label: string; icon?: string }>
  ariaLabel?: string
}>()

defineEmits<{ 'update:modelValue': [value: string | number] }>()
</script>

<style scoped>
.cui-segmented {
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  align-self: flex-start;
  gap: 2px;
  margin: 8px 0 16px;
  padding: 3px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  flex-wrap: wrap;
}
.cui-seg-btn {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: 4px;
  cursor: pointer;
  transition: all 150ms;
  white-space: nowrap;
}
@media (min-width: 640px) {
  .cui-seg-btn { padding: 7px 14px; font-size: 13px; }
}
.cui-seg-btn:hover {
  color: var(--text-heading);
}
.cui-seg-btn--active {
  background: var(--brand-primary);
  color: #1A0A2E;
}
.cui-seg-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
