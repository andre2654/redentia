<script setup lang="ts">
// PR10 — wrapper da seção da calculadora, 2 colunas do design: eyebrow azul +
// h2 (ou h1) + colunas flex com wrap (controles = card creme flex:1 1 320px
// max-width 460px; resultado flex:1.6 1 480px). Fundo alterna branco/creme
// via prop (quando creme, o card de controles vira branco pra manter
// contraste — mesma lógica de alternância dos designs Nu).
// Aportou (11/11/2026): não existe mais faixa branca de ponta a ponta. O tom
// 'white' é o creme da página (--nu-page) e o 'cream' é o creme de faixa
// (--nu-band). Dentro da faixa no creme da página, o cartão "creme" de quem
// ocupa o slot (var(--nu-cream), quase igual ao fundo novo) passa a ser o
// creme de faixa: é o cartão do quadro Home, sem tocar em cada página.
defineProps<{
  eyebrow?: string
  bg?: 'white' | 'cream'
  headingTag?: 'h1' | 'h2'
  sectionId?: string
}>()
</script>

<template>
  <section :id="sectionId" class="csh" :class="{ 'csh--cream': bg === 'cream' }">
    <div v-if="eyebrow" class="csh__eyebrow">{{ eyebrow }}</div>
    <div class="csh__titlerow">
      <component :is="headingTag ?? 'h2'" class="csh__title"><slot name="title" /></component>
      <!-- utilitário ao lado do título (ex.: botão Histórico das simulações) -->
      <div v-if="$slots['title-side']" class="csh__title-side"><slot name="title-side" /></div>
    </div>
    <div v-if="$slots.lead" class="csh__lead"><slot name="lead" /></div>
    <div class="csh__cols">
      <div class="csh__controls">
        <div class="csh__card"><slot name="controls" /></div>
      </div>
      <div class="csh__result"><slot name="result" /></div>
    </div>
    <!-- faixa sob as duas colunas (ex.: "Minhas simulações") -->
    <div v-if="$slots.below" class="csh__below"><slot name="below" /></div>
  </section>
</template>

<style scoped>
.csh {
  background: var(--nu-page);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.csh--cream { background: var(--nu-band); }
/* o cartão "creme" do slot vira o creme de faixa sobre o creme da página */
.csh:not(.csh--cream) { --nu-cream: var(--nu-band); }
.csh__eyebrow { color: var(--nu-blue-text); font-size: var(--nu-fs-eyebrow); font-weight: 800; }
.csh__title {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.02;
}
.csh__lead {
  color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500;
  line-height: 1.65; margin-top: 20px; max-width: 720px;
}
.csh__cols {
  display: flex; gap: clamp(28px, 5vw, 72px);
  align-items: flex-start; flex-wrap: wrap; margin-top: 44px;
}
/* .csh__below sem margem própria: quem espaça é o conteúdo (a faixa pode
   renderizar vazia — deslogado/sem itens — e margem aqui viraria vão fantasma) */
.csh__titlerow {
  display: flex; align-items: center; justify-content: space-between;
  gap: 14px 20px; flex-wrap: wrap;
}
.csh__title-side { flex-shrink: 0; }
.csh__controls { flex: 1 1 320px; min-width: min(300px, 100%); max-width: 460px; }
.csh__card { background: var(--nu-cream); border-radius: var(--nu-r-card-lg); padding: 28px; }
.csh--cream .csh__card { background: var(--nu-white); }
.csh__result { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
