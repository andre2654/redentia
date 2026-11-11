<script setup lang="ts">
// Cartão compacto de convite à IA (rótulo em caixa alta + frase 700), usado no
// TOC do guia; serve em qualquer sidebar.
// APORTOU (11/11/2026): cartão creme com o corte azul no rótulo; é clicável,
// então sobe 2px e ganha sombra ao passar o ponteiro, e a seta anda 3px.
// Sem `to` é um botão (o clique de quem usa abre o painel do chat, 11/11/2026).
const props = defineProps<{ kicker: string; text: string; to?: string }>()
const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : 'button'))
</script>

<template>
  <component :is="tag" :to="to" :type="to ? undefined : 'button'" class="napc">
    <span class="napc__kicker"><MarcaCorte :largura="18" />{{ kicker }}</span>
    <span class="napc__text">{{ text }}</span>
    <svg class="napc__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg>
  </component>
</template>

<style scoped>
.napc {
  display: block; width: 100%; border: 0; text-align: left; font-family: inherit; cursor: pointer; background: var(--nu-card); border-radius: var(--nu-r-panel);
  padding: 20px; box-shadow: var(--nu-shadow-quente);
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.napc:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.napc__kicker {
  display: flex; align-items: center; gap: 8px; color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
}
.napc__text {
  display: block; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700;
  line-height: 1.4; margin-top: 10px;
}
.napc__seta { display: block; margin-top: 12px; color: var(--nu-blue); transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.napc:hover .napc__seta { transform: translateX(3px); }
</style>
