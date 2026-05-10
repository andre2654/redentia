<template>
  <label class="color-field">
    <span class="color-field__label">
      {{ label }}
    </span>
    <div class="color-field__input">
      <!-- Native color picker. v-model="..." nao funciona com optional
           hex (ex: '#F5A623AA' com alpha) — usamos :value + @input
           pra preservar o que admin digitou. -->
      <input
        type="color"
        :value="hexOnly"
        class="color-field__swatch"
        @input="onColorChange"
      />
      <input
        type="text"
        :value="modelValue || ''"
        :placeholder="placeholder || '#000000'"
        class="color-field__hex"
        spellcheck="false"
        @input="onTextChange"
      />
    </div>
    <span v-if="hint" class="color-field__hint">{{ hint }}</span>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  modelValue: string
  hint?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

/**
 * Native color input so accept apenas `#RRGGBB`. Se o admin tem
 * `#RRGGBBAA` (alpha), strip o alpha pro picker exibir certo, mas
 * preserva no text input pra nao perder o canal alpha quando salvar.
 */
const hexOnly = computed(() => {
  const v = props.modelValue
  if (typeof v !== 'string') return '#000000'
  // valid #RGB / #RGBA / #RRGGBB / #RRGGBBAA -> normalize pra #RRGGBB
  const m = v.match(/^#([0-9a-fA-F]{6,8}|[0-9a-fA-F]{3,4})$/)
  if (!m) return '#000000'
  let h = m[1]
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  if (h.length === 4) h = h.slice(0, 3).split('').map(c => c + c).join('')
  if (h.length === 8) h = h.slice(0, 6)
  return `#${h}`
})

function onColorChange(ev: Event) {
  const v = (ev.target as HTMLInputElement).value
  emit('update:modelValue', v.toUpperCase())
}

function onTextChange(ev: Event) {
  const v = (ev.target as HTMLInputElement).value.trim()
  emit('update:modelValue', v)
}
</script>

<style scoped>
.color-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-field__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.color-field__input {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 4px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text) 1.5%, transparent);
  transition: border-color 0.15s ease;
}
.color-field__input:focus-within {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

.color-field__swatch {
  flex: 0 0 auto;
  appearance: none;
  border: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
}
.color-field__swatch::-webkit-color-swatch {
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 4px;
}
.color-field__swatch::-moz-color-swatch {
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 4px;
}

.color-field__hex {
  flex: 1 1 auto;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--brand-text);
  text-transform: uppercase;
  min-width: 0;
}

.color-field__hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
</style>
