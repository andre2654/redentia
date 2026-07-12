<script setup lang="ts">
// PR10 — wrapper da seção da calculadora, 2 colunas do design: eyebrow azul +
// h2 (ou h1) + colunas flex com wrap (controles = card creme flex:1 1 320px
// max-width 460px; resultado flex:1.6 1 480px). Fundo alterna branco/creme
// via prop (quando creme, o card de controles vira branco pra manter
// contraste — mesma lógica de alternância dos designs Nu).
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
    <component :is="headingTag ?? 'h2'" class="csh__title"><slot name="title" /></component>
    <div v-if="$slots.lead" class="csh__lead"><slot name="lead" /></div>
    <div class="csh__cols">
      <div class="csh__controls">
        <div class="csh__card"><slot name="controls" /></div>
      </div>
      <div class="csh__result"><slot name="result" /></div>
    </div>
  </section>
</template>

<style scoped>
.csh {
  background: var(--nu-white);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.csh--cream { background: var(--nu-cream); }
.csh__eyebrow { color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.csh__title {
  margin: 12px 0 0; color: var(--nu-ink);
  font-size: clamp(38px, 4.8vw, 62px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.02;
}
.csh__lead {
  color: var(--nu-gray-2); font-size: 17px; font-weight: 500;
  line-height: 1.65; margin-top: 20px; max-width: 720px;
}
.csh__cols {
  display: flex; gap: clamp(28px, 5vw, 72px);
  align-items: flex-start; flex-wrap: wrap; margin-top: 44px;
}
.csh__controls { flex: 1 1 320px; min-width: min(300px, 100%); max-width: 460px; }
.csh__card { background: var(--nu-cream); border-radius: var(--nu-r-card-lg); padding: 28px; }
.csh--cream .csh__card { background: var(--nu-white); }
.csh__result { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
