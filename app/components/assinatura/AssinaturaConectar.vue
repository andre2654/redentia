<script setup lang="ts">
// O "Conectar carteira" (31/10/2026): o mesmo botão no topo e no fim de cada
// seção do /assinar e do paywall, sempre abrindo o quiz (AssinaturaQuiz, que
// vive na AssinaturaVitrine). A origem vai no evento quiz_aberto, para saber
// qual seção puxou a pessoa.
withDefaults(defineProps<{ origem: string; tom?: 'azul' | 'creme' }>(), { tom: 'azul' })
const quiz = useQuizAssinatura()
</script>

<template>
  <button type="button" class="acn" :class="`acn--${tom}`" aria-haspopup="dialog" @click="quiz.abrir(origem)">
    Conectar carteira
    <svg class="acn__seta" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </button>
</template>

<style scoped>
.acn {
  display: inline-flex; align-items: center; justify-content: center; gap: 11px; padding: 19px 34px; min-height: 60px;
  border: none; border-radius: var(--nu-r-pill); cursor: pointer;
  font-family: inherit; font-size: var(--nu-fs-lg); font-weight: 800;
  transition: background .2s, transform .15s;
}
.acn--azul { background: var(--nu-blue); color: var(--nu-white); box-shadow: 0 18px 36px -18px var(--nu-blue-30); }
.acn--azul:hover { background: var(--nu-blue-hover); }
.acn--creme { background: var(--nu-cream); color: var(--nu-navy); }
.acn--creme:hover { background: var(--nu-white); }
.acn:hover { transform: translateY(-2px); }
.acn:active { transform: translateY(1px); }
.acn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }
.acn__seta { transition: transform .2s; }
.acn:hover .acn__seta { transform: translateX(3px); }
@media (prefers-reduced-motion: reduce) {
  .acn, .acn__seta { transition: none; }
}
</style>
