<script setup lang="ts">
/**
 * NuAcordeao: UM item que abre e fecha (11/11/2026, robustez). Para o que é
 * longo e secundário: a pergunta do FAQ, "Ver os anteriores", a seção do
 * relatório. O NuFaqAccordion é uma lista destes.
 *
 *   <NuAcordeao v-model:aberto="aberto" fio>
 *     <template #titulo>Como a Aportou lê a carteira?</template>
 *     <p>…</p>
 *   </NuAcordeao>
 *
 * Props
 *   aberto (v-model:aberto)  sem v-model, o item guarda o próprio estado (começa fechado)
 *   fio          o fio de 1px (--nu-line) embaixo do item, para empilhar numa lista
 *   como         a tag em volta do botão do cabeçalho: div (padrão) ou h2/h3 quando
 *                o título é título de seção (o leitor de tela navega por eles)
 *   tamanhoMais  o círculo do "+": 28 · 32 (padrão) · 36
 * Slots: `titulo` (o cabeçalho) e o padrão (o conteúdo).
 * Evento: update:aberto.
 *
 * O cabeçalho é um <button> com aria-expanded e aria-controls; o "+" (NuMais)
 * gira 45° ao abrir e, sob o ponteiro, o título fica cobalto. O conteúdo está
 * SEMPRE no HTML do servidor (o Google e o print leem tudo): fechado, ele fica
 * com altura 0 (grid-template-rows 0fr → 1fr) e `inert`, não sai do DOM. A
 * altura e a opacidade animam juntas em --nu-dur-lenta --nu-ease-troca.
 * O texto do conteúdo vem em 16px/500, --nu-gray-3, a 24px do fio.
 */
withDefaults(defineProps<{ fio?: boolean; como?: string; tamanhoMais?: 28 | 32 | 36 }>(), {
  fio: false, como: 'div', tamanhoMais: 32,
})
const aberto = defineModel<boolean>('aberto', { default: false })
const dobraId = `${useId()}-dobra`
</script>

<template>
  <div class="nac" :class="{ 'nac--aberto': aberto, 'nac--fio': fio }">
    <component :is="como" class="nac__cabeca">
      <button type="button" class="nac__cab" :aria-expanded="aberto" :aria-controls="dobraId" @click="aberto = !aberto">
        <span class="nac__titulo"><slot name="titulo" /></span>
        <NuMais class="nac__mais" :aberto="aberto" :tamanho="tamanhoMais" />
      </button>
    </component>
    <div :id="dobraId" class="nac__dobra" :inert="!aberto || undefined">
      <div class="nac__dentro">
        <div class="nac__corpo"><slot /></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:where(.nac--fio) { border-bottom: 1px solid var(--nu-line); }
.nac__cabeca { margin: 0; font: inherit; }
.nac__cab {
  position: relative; display: flex; align-items: center; justify-content: space-between; gap: 16px;
  width: 100%; min-height: 44px; padding: 18px 0; border: 0; border-radius: var(--nu-r-tag);
  background: none; color: var(--nu-ink); cursor: pointer; text-align: left;
  font: inherit; -webkit-tap-highlight-color: transparent;
}
.nac__titulo {
  min-width: 0; font-size: var(--nu-fs-lg); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-titulo); line-height: 1.3;
  transition: color var(--nu-dur-media) var(--nu-ease-cor);
}
.nac__cab:hover .nac__titulo { color: var(--nu-blue-text); }
.nac__cab:hover .nac__mais { background-color: var(--nu-blue); }
/* o anel de foco abraça o título e o "+" (o cabeçalho é a linha inteira, sem respiro dos lados) */
.nac__cab:focus-visible { outline: none; }
.nac__cab:focus-visible::after {
  content: ''; position: absolute; inset: 8px -8px; border-radius: var(--nu-r-chip); pointer-events: none;
  outline: 3px solid var(--nu-blue); outline-offset: 0;
}
/* a altura anima de 0 ao conteúdo, com a opacidade junto */
.nac__dobra {
  display: grid; grid-template-rows: 0fr; opacity: 0;
  transition: grid-template-rows var(--nu-dur-lenta) var(--nu-ease-troca), opacity var(--nu-dur-lenta) var(--nu-ease-troca);
}
.nac--aberto .nac__dobra { grid-template-rows: 1fr; opacity: 1; }
.nac__dentro { min-height: 0; overflow: hidden; }
.nac__corpo { padding-bottom: 24px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.6; }
</style>
