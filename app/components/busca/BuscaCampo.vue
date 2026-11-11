<script setup lang="ts">
// Topo da /busca (redesenho de 02/11/2026): título curto, o campo grande e os
// tipos logo embaixo, tudo na faixa creme, como o hero do /rankings (título +
// pills). Antes eram duas faixas, um chat e quatro sugestões de pergunta
// antes de qualquer resultado; agora o campo é a primeira coisa que se usa.
// O campo é um combobox: o foco fica nele e as setas andam na lista
// (aria-activedescendant aponta a linha marcada).
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

    <div class="bc__tipos" role="group" aria-label="Tipo de ativo">
      <button
        v-for="t in BUSCA_TIPOS" :key="t.key" type="button"
        class="bc__tipo" :class="{ 'bc__tipo--on': t.key === props.tipo }"
        :aria-pressed="t.key === props.tipo"
        @click="emit('update:tipo', t.key)"
      >{{ t.label }}</button>
    </div>
  </section>
</template>

<style scoped>
/* Aportou (11/11/2026): o herói é creme, o título em 800, o campo é o da marca
   (borda 1,5px, foco cobalto de 3px) e os tipos são chips de 44px. */
.bc {
  background: var(--nu-page);
  padding: clamp(36px, 5vw, 76px) clamp(20px, 5.5vw, 80px) clamp(24px, 3vw, 40px);
  animation: nu-fade .5s ease both;
}
.bc__titulo {
  margin: 18px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-hero); font-weight: 800; letter-spacing: -0.035em; line-height: .98;
}

.bc__campo {
  display: flex; align-items: center; gap: 12px;
  max-width: 880px; height: 64px; margin-top: clamp(22px, 2.8vw, 34px); padding: 0 10px 0 24px;
  background: var(--nu-white); border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-pill);
  box-shadow: var(--nu-shadow-branco); transition: border-color .2s;
  /* header sticky (--nuh-h) + faixa "Mercado agora" + respiro */
  scroll-margin-top: calc(var(--nuh-h, 76px) + 64px);
}
.bc__campo:focus-within { border-color: var(--nu-blue); outline: 3px solid var(--nu-blue); outline-offset: 1px; }
.bc__lupa { flex: none; color: var(--nu-ink); }
.bc__input {
  flex: 1; min-width: 0; height: 100%; background: transparent; border: none; outline: none;
  color: var(--nu-ink); font-size: clamp(17px, 1.5vw, 19px); font-weight: 600;
  -webkit-appearance: none; appearance: none;
}
.bc__input:focus-visible { outline: none; }
.bc__input::-webkit-search-cancel-button { display: none; }
.bc__input::placeholder { color: var(--nu-gray); font-weight: 500; }
.bc__limpar {
  flex: none; width: 44px; height: 44px; border-radius: 50%; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--nu-cream-2); color: var(--nu-ink); transition: background .2s;
}
.bc__limpar:hover { background: var(--nu-line-2); }
.bc__kbd {
  flex: none; margin-right: 12px; padding: 3px 9px;
  border: 1.5px solid var(--nu-line); border-radius: var(--nu-r-tag);
  color: var(--nu-gray); font: inherit; font-size: var(--nu-fs-dense); font-weight: 700;
}

/* tipos: a pílula carvão ligada, o chip creme desligado */
.bc__tipos { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px; max-width: 880px; }
.bc__tipo {
  min-height: 44px; padding: 0 18px; border-radius: var(--nu-r-pill);
  border: 0; background: var(--nu-cream-2); color: var(--nu-ink);
  font-size: 14.5px; font-weight: 600; white-space: nowrap; cursor: pointer;
  transition: color .2s, background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.bc__tipo:hover { background: var(--nu-line-2); }
.bc__tipo:active { transform: scale(.98); }
.bc__tipo--on, .bc__tipo--on:hover { background: var(--nu-ink); color: var(--nu-white); font-weight: 700; }

@media (max-width: 760px) {
  .bc__campo { height: 56px; padding-left: 18px; }
  /* no celular os tipos são uma fileira só que rola de lado (a página não
     rola no X; o container rola), para os resultados subirem junto do campo */
  .bc__tipos {
    flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none;
    margin: 14px calc(-1 * clamp(20px, 5.5vw, 80px)) 0; padding: 2px clamp(20px, 5.5vw, 80px);
    scroll-padding-inline: clamp(20px, 5.5vw, 80px);
  }
  .bc__tipos::-webkit-scrollbar { display: none; }
}
</style>
