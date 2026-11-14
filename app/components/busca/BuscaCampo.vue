<script setup lang="ts">
// Topo da /busca (redesenho de 02/11/2026): título curto, o campo grande e os
// tipos logo embaixo, tudo na faixa creme, como o hero do /rankings (título +
// pills). Antes eram duas faixas, um chat e quatro sugestões de pergunta
// antes de qualquer resultado; agora o campo é a primeira coisa que se usa.
// O campo é um combobox: o foco fica nele e as setas andam na lista
// (aria-activedescendant aponta a linha marcada).
// Robustez (11/11/2026): o topo entra em cascata (eyebrow, título, campo,
// tipos; 60ms cada) em --nu-dur-entrada --nu-ease-saida; o campo escurece a
// borda sob o ponteiro e acende o anel cobalto no foco; o "limpar" afunda ao
// apertar. Toda transição por token.
import { BUSCA_TIPOS } from '~/composables/useBuscaIndex'
import type { BuscaType } from '~/composables/useBuscaIndex'

const props = defineProps<{
  modelValue: string
  tipo: BuscaType
  /** id da linha marcada na lista, para o leitor de tela */
  ativoId: string | null
  /** a lista abaixo tem linhas */
  comLista: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:tipo', v: BuscaType): void
  (e: 'tecla', ev: KeyboardEvent): void
}>()

const tipos = BUSCA_TIPOS.map((t) => ({ valor: t.key, rotulo: t.label }))
const input = ref<HTMLInputElement | null>(null)
const caixa = ref<HTMLElement | null>(null)

// No celular, com o teclado aberto, sobra meia tela: na primeira letra o
// campo sobe para baixo do header e da faixa do mercado, e os resultados
// aparecem embaixo dele em vez de atrás do teclado. Uma vez por foco.
let subiu = false
function aoDigitar(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
  if (subiu || !caixa.value || !window.matchMedia('(max-width: 760px)').matches) return
  subiu = true
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  caixa.value.scrollIntoView({ block: 'start', behavior: reduzido ? 'auto' : 'smooth' })
}
function soltou() { subiu = false }

function limpar() {
  emit('update:modelValue', '')
  input.value?.focus()
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <section class="bc">
    <NuEyebrow como="p">Ativos, teses e guias</NuEyebrow>
    <h1 class="bc__titulo">Busca.</h1>

    <div ref="caixa" class="bc__campo">
      <svg class="bc__lupa" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
      <input
        ref="input"
        type="search"
        class="bc__input"
        :value="props.modelValue"
        placeholder="Ticker, empresa, tese ou guia"
        aria-label="Buscar ativo, tese ou guia"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="busca-lista"
        :aria-expanded="props.comLista"
        :aria-activedescendant="props.ativoId ?? undefined"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="go"
        @input="aoDigitar"
        @blur="soltou"
        @keydown="emit('tecla', $event)"
      >
      <button
        v-if="props.modelValue" type="button" class="bc__limpar" aria-label="Limpar a busca"
        @click="limpar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      <kbd v-else class="bc__kbd" data-nu-hide aria-hidden="true">/</kbd>
    </div>

    <!-- os tipos: o trilho da base (creme, a escolhida na pílula carvão que desliza) -->
    <div class="bc__tipos">
      <NuTrilho :opcoes="tipos" :model-value="props.tipo" rotulo="Tipo de ativo" @update:model-value="emit('update:tipo', $event)" />
    </div>
  </section>
</template>

<style scoped>
/* Aportou (11/11/2026): o herói é creme, o título em 800, o campo é o da marca
   (borda 1,5px, foco cobalto de 3px) e os tipos moram no trilho de 44px. */
.bc {
  background: var(--nu-page);
  padding: clamp(40px, 5vw, 80px) var(--nu-coluna) clamp(24px, 3vw, 40px);
}
/* a entrada: em cascata, 60ms por peça */
.bc > * { animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) both; }
.bc > :nth-child(2) { animation-delay: 60ms; }
.bc > :nth-child(3) { animation-delay: 120ms; }
.bc > :nth-child(4) { animation-delay: 180ms; }
.bc__titulo {
  margin: 20px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-hero); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: .98;
}

.bc__campo {
  display: flex; align-items: center; gap: 12px;
  max-width: 880px; height: 64px; margin-top: clamp(24px, 2.8vw, 32px); padding: 0 10px 0 24px;
  background: var(--nu-white); border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-pill);
  box-shadow: var(--nu-shadow-branco); cursor: text;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor);
  /* header sticky (--nuh-h) + faixa "Mercado agora" + respiro */
  scroll-margin-top: calc(var(--nuh-h, 76px) + 64px);
}
.bc__campo:hover { border-color: color-mix(in srgb, var(--nu-ink) 45%, var(--nu-borda-campo)); }
.bc__campo:focus-within { border-color: var(--nu-blue); outline: 3px solid var(--nu-blue); outline-offset: 1px; }
.bc__lupa { flex: none; color: var(--nu-ink); }
.bc__input {
  flex: 1; min-width: 0; height: 100%; background: transparent; border: none; outline: none;
  color: var(--nu-ink); font-size: clamp(17px, 1.5vw, 19px); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  -webkit-appearance: none; appearance: none;
}
.bc__input:focus-visible { outline: none; }
.bc__input::-webkit-search-cancel-button { display: none; }
.bc__input::placeholder { color: var(--nu-gray); font-weight: var(--nu-w-texto); }
.bc__limpar {
  flex: none; width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream-2); color: var(--nu-ink); -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
  animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both;
}
.bc__limpar:hover { background: var(--nu-line-2); }
.bc__limpar:active { transform: scale(.92); }
.bc__kbd {
  flex: none; margin-right: 12px; padding: 3px 9px;
  border: 1px solid var(--nu-line); border-radius: var(--nu-r-tag);
  color: var(--nu-gray); font: inherit; font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio);
}

/* os tipos: o trilho (NuTrilho); no celular ele rola de lado por dentro */
.bc__tipos { margin-top: 18px; max-width: 880px; }

@media (max-width: 760px) {
  .bc__campo { height: 56px; padding-left: 18px; }
  .bc__tipos { margin-top: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .bc > *, .bc__limpar { animation: none; }
  .bc__campo, .bc__limpar { transition: none; }
  .bc__limpar:active { transform: none; }
}
</style>
