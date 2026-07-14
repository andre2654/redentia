<script setup lang="ts">
// Switch iOS-like reutilizável (Nu). Off = trilho sand; on = trilho verde.
// role=switch + aria-checked pra acessibilidade. Usado no opt-in do resumo
// diário (NuBriefingModal) e na central de notificações (/conta).
const props = withDefaults(defineProps<{
  modelValue: boolean
  ariaLabel?: string
  disabled?: boolean
}>(), { disabled: false })

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

function toggle() {
  if (props.disabled) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    class="ntg"
    :class="{ 'ntg--on': modelValue }"
    @click="toggle"
  >
    <span class="ntg__knob" />
  </button>
</template>

<style scoped>
.ntg {
  width: 52px; height: 30px; flex-shrink: 0; border: none; cursor: pointer;
  border-radius: 999px; padding: 3px; background: var(--nu-sand-2);
  display: inline-flex; align-items: center; transition: background .2s;
}
.ntg--on { background: var(--nu-green); }
.ntg:disabled { opacity: .5; cursor: default; }
.ntg__knob {
  width: 24px; height: 24px; border-radius: 50%; background: var(--nu-white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, .22); transition: transform .2s;
}
.ntg--on .ntg__knob { transform: translateX(22px); }
</style>
