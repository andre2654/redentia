<script setup lang="ts">
// Pill branca de busca do hero — lupa, input controlado, kbd '/' (some ≤760
// via [data-nu-hide] do base.css) e CTA "Perguntar à IA".
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 66-71).
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'ask'): void
  (e: 'activate'): void
}>()

const input = ref<HTMLInputElement | null>(null)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  emit('activate')
}

defineExpose({
  focus: () => input.value?.focus(),
})
</script>

<template>
  <div class="bsb">
    <svg class="bsb__lupa" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
    <input
      ref="input"
      type="text"
      class="bsb__input"
      :value="props.modelValue"
      placeholder="Busque um ativo, tese, guia ou pergunte qualquer coisa"
      aria-label="Buscar um ativo, tese ou guia"
      @input="onInput"
      @focus="emit('activate')"
    >
    <span class="bsb__kbd" data-nu-hide aria-hidden="true">/</span>
    <button type="button" class="bsb__cta" @click="emit('ask')">Perguntar à IA</button>
  </div>
</template>

<style scoped>
.bsb {
  display: flex; align-items: center; gap: 12px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 8px 8px 8px 26px; margin-top: 32px; max-width: 860px;
  box-shadow: var(--nu-shadow-search);
}
.bsb__lupa { flex-shrink: 0; color: var(--nu-ink); }
.bsb__input {
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: var(--nu-ink); font-size: clamp(16px, 1.6vw, 18px); font-weight: 600; padding: 12px 0;
}
.bsb__input::placeholder { color: var(--nu-sand); font-weight: 500; }
.bsb__kbd {
  color: var(--nu-sand); font-size: 12.5px; font-weight: 700; flex-shrink: 0;
  border: 1.5px solid var(--nu-cream-3); border-radius: 8px; padding: 4px 9px;
}
.bsb__cta {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-blue); color: var(--nu-white); border: none;
  border-radius: var(--nu-r-pill); padding: 14px 24px;
  font-size: 15px; font-weight: 800; cursor: pointer; white-space: nowrap;
  flex-shrink: 0; transition: background .2s;
}
.bsb__cta:hover { background: var(--nu-blue-hover); }
.bsb__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bsb__input:focus-visible { outline: none; }
</style>
