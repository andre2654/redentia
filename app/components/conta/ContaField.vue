<script setup lang="ts">
// Campo de formulário de /conta. Mesma linguagem do ContactForm (label 14/700 +
// input boxed), mas INSET: fundo creme pra ler como campo dentro do card branco
// do painel; foco vira branco + anel azul. readonly = campo travado (ex.: e-mail,
// que muda pela verificação por PIN). Slot `trailing` = badge/ação à direita.
withDefaults(defineProps<{
  label: string
  modelValue?: string
  type?: string
  placeholder?: string
  readonly?: boolean
  hint?: string
  autocomplete?: string
  inputmode?: 'text' | 'tel' | 'email' | 'numeric' | 'decimal'
}>(), { type: 'text', readonly: false })

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const id = useId()
</script>

<template>
  <div class="cfl">
    <label :for="id" class="cfl__label">{{ label }}</label>
    <div class="cfl__box" :class="{ 'cfl__box--ro': readonly }">
      <input
        :id="id"
        class="cfl__input"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <span v-if="$slots.trailing" class="cfl__trailing"><slot name="trailing" /></span>
    </div>
    <span v-if="hint" class="cfl__hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.cfl { display: flex; flex-direction: column; gap: 9px; min-width: 0; }
.cfl__label { color: var(--nu-gray-2); font-size: 14px; font-weight: 700; letter-spacing: -.1px; }
.cfl__box { position: relative; display: flex; align-items: center; }
.cfl__input {
  width: 100%; background: var(--nu-cream); color: var(--nu-ink);
  border: 1.5px solid transparent; border-radius: var(--nu-r-input);
  padding: 15px 18px; font-family: var(--nu-font); font-size: 16px; font-weight: 600;
  line-height: 1.4; outline: none;
  transition: background .18s, border-color .18s, box-shadow .18s;
}
.cfl__input::placeholder { color: var(--nu-placeholder); font-weight: 500; }
.cfl__input:focus { background: var(--nu-white); border-color: var(--nu-blue); box-shadow: 0 0 0 3px var(--nu-blue-tint); }
.cfl__box--ro .cfl__input { color: var(--nu-gray-2); cursor: default; }
.cfl__box--ro .cfl__input:focus { background: var(--nu-cream); border-color: transparent; box-shadow: none; }
.cfl__trailing { position: absolute; right: 16px; display: inline-flex; align-items: center; }
.cfl__hint { color: var(--nu-gray); font-size: 13px; font-weight: 500; line-height: 1.5; }
</style>
