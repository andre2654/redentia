<script setup lang="ts">
// Campo de formulário de /conta, no padrão da Aportou (o campo do login):
// rótulo 15/700 acima, caixa branca de 56px com borda de 1,5px e raio 16; o
// foco é o anel cobalto de 3px. readonly = campo travado (ex.: e-mail, que muda
// pela verificação por PIN): fica no creme, sem anel. Slot `trailing` =
// badge/ação à direita.
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
.cfl__label { color: var(--nu-ink); font-size: 15px; font-weight: 700; }
.cfl__box { position: relative; display: flex; align-items: center; }
.cfl__input {
  width: 100%; height: 56px; background: var(--nu-white); color: var(--nu-ink);
  border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input);
  padding: 0 18px; font-family: var(--nu-font); font-size: 17px; font-weight: 500;
  outline: none;
  transition: border-color .2s, background .2s;
}
.cfl__input::placeholder { color: var(--nu-placeholder); font-weight: 500; }
.cfl__input:hover { border-color: var(--nu-gray); }
.cfl__input:focus, .cfl__input:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.cfl__box--ro .cfl__input { background: var(--nu-page); border-color: var(--nu-line); color: var(--nu-gray); cursor: default; }
.cfl__box--ro .cfl__input:hover { border-color: var(--nu-line); }
.cfl__box--ro .cfl__input:focus, .cfl__box--ro .cfl__input:focus-visible { outline: 2px solid var(--nu-line); outline-offset: 1px; border-color: var(--nu-line); }
.cfl__trailing { position: absolute; right: 16px; display: inline-flex; align-items: center; }
.cfl__hint { color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.5; }
</style>
