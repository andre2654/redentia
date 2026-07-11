<script setup lang="ts">
// Hero de seção em creme (eyebrow azul + H1 gigante + subtítulo muted + slot
// de tabs/ações) — anatomia compartilhada das telas Nu (Notícias; Guias e
// Calculadoras reusam). Valores exatos do design (Redentia Noticias Nu.dc.html).
// size="lg" (PR4): escala do hub /guias (Redentia Guias Nu.dc.html) — H1 até
// 88px, paddings e eyebrow maiores, subtítulo 560px, tabs a 38px.
defineProps<{ eyebrow: string; subtitle?: string; size?: 'lg' }>()
</script>

<template>
  <div class="nph" :class="{ 'nph--lg': size === 'lg' }">
    <div class="nph__eyebrow">{{ eyebrow }}</div>
    <h1 class="nph__title"><slot name="title" /></h1>
    <div v-if="subtitle" class="nph__sub">{{ subtitle }}</div>
    <div v-if="$slots.default" class="nph__actions"><slot /></div>
  </div>
</template>

<style scoped>
.nph {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(36px, 4.5vw, 56px);
  animation: nu-fade .5s ease both;
}
.nph__eyebrow { color: var(--nu-blue); font-size: clamp(16px, 1.5vw, 19px); font-weight: 800; }
.nph__title {
  margin: 12px 0 0; color: var(--nu-ink); font-size: clamp(40px, 5.5vw, 76px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 1.0;
}
.nph__sub {
  color: var(--nu-gray); font-size: clamp(16px, 1.7vw, 20px); font-weight: 600;
  line-height: 1.55; margin-top: 20px; max-width: 620px;
}
.nph__actions { margin-top: 32px; }

/* variante lg (valores exatos de Redentia Guias Nu.dc.html) */
.nph--lg { padding: clamp(56px, 8vw, 100px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 60px); }
.nph--lg .nph__eyebrow { font-size: clamp(17px, 1.6vw, 21px); letter-spacing: -.2px; }
.nph--lg .nph__title { margin-top: 14px; font-size: clamp(46px, 6.5vw, 88px); }
.nph--lg .nph__sub { font-size: clamp(17px, 1.8vw, 21px); margin-top: 22px; max-width: 560px; }
.nph--lg .nph__actions { margin-top: 38px; }
</style>
