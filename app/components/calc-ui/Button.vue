<!--
  CalcUiButton — CTA V5 (amber subtle no idle, sólido no hover).
  Substitui o `UButton color="primary" size="xl" block` antigo.
-->
<template>
  <button
    type="button"
    class="cui-btn"
    :class="[`cui-btn--${variant}`, { 'cui-btn--block': block }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <UIcon
      v-if="loading"
      name="i-lucide-loader-2"
      class="cui-btn-icon animate-spin"
    />
    <UIcon
      v-else-if="icon"
      :name="icon"
      class="cui-btn-icon"
    />
    <span class="cui-btn-label">
      <slot>{{ label }}</slot>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    icon?: string
    variant?: 'primary' | 'ghost'
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', block: true }
)

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<style scoped>
.cui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  padding: 14px 28px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms ease-out, transform 100ms ease-out;
  border: 1px solid transparent;
}
@media (min-width: 640px) {
  .cui-btn { margin-top: 28px; }
}
.cui-btn--block { width: 100%; }
.cui-btn:disabled { opacity: 0.6; cursor: wait; }
.cui-btn:active:not(:disabled) { transform: translateY(1px); }

.cui-btn--primary {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: var(--brand-primary);
}
.cui-btn--primary:hover:not(:disabled) {
  background: var(--brand-primary);
  color: var(--text-heading);
  border-color: var(--brand-primary);
}

.cui-btn--ghost {
  border-color: var(--border-default);
  background: transparent;
  color: var(--text-heading);
}
.cui-btn--ghost:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-primary) 60%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
}

.cui-btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
