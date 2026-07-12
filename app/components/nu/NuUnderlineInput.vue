<script setup lang="ts">
// Input minimalista do design de auth: só border-bottom 2px (repouso
// --nu-underline → --nu-blue no focus), radius 0, fonte grande fluida.
// Variante tel aplica tabular-nums e a máscara BR do design (fmtPhone:
// strip não-dígitos, cap 11, '(dd) ddddd-dddd').
const props = withDefaults(
  defineProps<{
    modelValue: string
    type?: 'tel' | 'email' | 'text'
    placeholder?: string
    autocomplete?: string
    name?: string
  }>(),
  { type: 'text' },
)
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function fmtPhone(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const next = props.type === 'tel' ? fmtPhone(el.value) : el.value
  // Reflete a máscara no DOM mesmo quando o valor formatado não muda
  // (ex.: digitar uma letra) — sem isso o caractere inválido fica visível.
  if (props.type === 'tel' && el.value !== next) el.value = next
  emit('update:modelValue', next)
}
</script>

<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :name="name"
    :inputmode="type === 'tel' ? 'numeric' : undefined"
    class="nui"
    :class="{ 'nui--tabular': type === 'tel' }"
    @input="onInput"
  >
</template>

<style scoped>
.nui {
  width: 100%; background: transparent;
  border: none; border-bottom: 2px solid var(--nu-underline);
  outline: none; border-radius: 0;
  padding: 12px 0 14px; color: var(--nu-ink);
  font-size: clamp(20px, 2vw, 24px); font-weight: 600;
  transition: border-color .2s;
}
.nui--tabular { font-variant-numeric: tabular-nums; }
.nui::placeholder { color: var(--nu-placeholder); font-weight: 600; }
.nui:focus { border-bottom-color: var(--nu-blue); }
</style>
