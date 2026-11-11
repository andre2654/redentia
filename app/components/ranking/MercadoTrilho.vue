<script setup lang="ts">
// O filtro das páginas de mercado (Aportou, 2ª rodada, 11/11/2026): UM padrão
// só. Um trilho creme com as opções dentro e a escolhida numa pílula carvão,
// 44px de toque. Serve às abas de tipo dos rankings, ao indexador do Tesouro,
// às categorias das notícias e da busca e ao tipo/ordem da /teses.
// Aceita a lista de rótulos (como o NuFilterPills) ou itens com id, contagem e
// estado desligado. No celular o trilho rola de lado por dentro: a página não.
type Item = string | { id: string; rotulo: string; n?: number | null; desligado?: boolean }

const props = withDefaults(defineProps<{
  itens: readonly Item[]
  modelValue: string
  /** o nome do grupo para o leitor de tela */
  rotulo?: string
  /** 'tablist' quando troca um painel; 'radiogroup' quando é uma escolha; 'group' para filtro */
  papel?: 'tablist' | 'radiogroup' | 'group'
  /** sobre o carvão: trilho no chip escuro, escolhida em creme */
  sobre?: 'claro' | 'escuro'
}>(), { rotulo: 'Filtrar', papel: 'group', sobre: 'claro' })
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const lista = computed(() => props.itens.map((i) => (typeof i === 'string' ? { id: i, rotulo: i, n: null, desligado: false } : { n: null, desligado: false, ...i })))
const papelItem = computed(() => (props.papel === 'tablist' ? 'tab' : props.papel === 'radiogroup' ? 'radio' : undefined))
function estado(on: boolean) {
  if (props.papel === 'tablist') return { 'aria-selected': on }
  if (props.papel === 'radiogroup') return { 'aria-checked': on }
  return { 'aria-pressed': on }
}
</script>

<template>
  <div class="mtr" :class="{ 'mtr--escuro': sobre === 'escuro' }" :role="papel" :aria-label="rotulo">
    <button
      v-for="i in lista" :key="i.id" type="button" class="mtr__b" :class="{ 'mtr__b--on': i.id === modelValue }"
      :role="papelItem" v-bind="estado(i.id === modelValue)" :disabled="i.desligado"
      @click="emit('update:modelValue', i.id)"
    >{{ i.rotulo }}<span v-if="i.n != null" class="mtr__n">{{ i.n }}</span></button>
  </div>
</template>

<style scoped>
.mtr {
  display: inline-flex; align-items: center; gap: 2px; max-width: 100%; padding: 4px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); overflow-x: auto; scrollbar-width: none; vertical-align: top;
}
.mtr::-webkit-scrollbar { display: none; }
.mtr__b {
  flex: none; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border: 0; border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-gray-3); font: inherit; font-size: 14.5px; font-weight: 600; white-space: nowrap; cursor: pointer;
  transition: background .2s ease, color .2s ease, transform .15s var(--nu-ease-saida);
}
.mtr__b:hover:not(:disabled) { color: var(--nu-ink); background: color-mix(in srgb, var(--nu-ink) 6%, transparent); }
.mtr__b:active:not(:disabled) { transform: scale(.98); }
.mtr__b--on, .mtr__b--on:hover:not(:disabled) { background: var(--nu-ink); color: var(--nu-white); font-weight: var(--nu-w-medio); }
.mtr__b:disabled { opacity: .4; cursor: not-allowed; }
.mtr__b:focus-visible { outline-offset: -3px; }
.mtr__n { color: var(--nu-gray); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.mtr__b--on .mtr__n { color: var(--nu-on-dark-2); }

/* sobre o carvão */
.mtr--escuro { background: var(--nu-dark-chip); box-shadow: inset 0 0 0 1px var(--nu-dark-chip-line); }
.mtr--escuro .mtr__b { color: var(--nu-on-dark); }
.mtr--escuro .mtr__b:hover:not(:disabled) { color: var(--nu-white); background: color-mix(in srgb, var(--nu-white) 8%, transparent); }
.mtr--escuro .mtr__b--on, .mtr--escuro .mtr__b--on:hover:not(:disabled) { background: var(--nu-creme); color: var(--nu-ink); }
.mtr--escuro .mtr__b--on .mtr__n { color: var(--nu-gray); }

@media (max-width: 560px) { .mtr__b { padding: 0 15px; } }
@media (prefers-reduced-motion: reduce) { .mtr__b { transition: none; } .mtr__b:active:not(:disabled) { transform: none; } }
</style>
