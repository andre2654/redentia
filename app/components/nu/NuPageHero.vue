<script setup lang="ts">
// Hero de seção em creme (eyebrow azul + H1 gigante + subtítulo muted + slot
// de tabs/ações) — anatomia compartilhada das telas Nu (Notícias; Guias e
// Calculadoras reusam). Valores exatos do design (Redentia Noticias Nu.dc.html).
defineProps<{ eyebrow: string; subtitle?: string }>()
</script>

<template>
  <div class="nph">
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
</style>
