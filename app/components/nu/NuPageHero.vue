<script setup lang="ts">
// Hero de página (eyebrow + H1 gigante + subtítulo + slot de tabs/ações) —
// anatomia compartilhada das telas Nu (Notícias; Guias e Calculadoras reusam).
// size="lg": escala do hub /guias (H1 até 88px, paddings maiores, tabs a 38px).
//
// APORTOU (11/11/2026): o hero senta no creme da página, em continuidade com o
// topo e a régua (não é mais uma faixa de outro creme); o eyebrow é o da marca
// (o corte azul + caixa alta espaçada), o H1 vai em 800 com a entrelinha
// apertada e o subtítulo vira o lead da marca. Estrutura, textos e slots iguais.
defineProps<{ eyebrow: string; subtitle?: string; size?: 'lg' }>()
</script>

<template>
  <div class="nph" :class="{ 'nph--lg': size === 'lg' }">
    <NuEyebrow como="div" class="nph__eyebrow">{{ eyebrow }}</NuEyebrow>
    <h1 class="nph__title"><slot name="title" /></h1>
    <div v-if="subtitle" class="nph__sub">{{ subtitle }}</div>
    <div v-if="$slots.default" class="nph__actions"><slot /></div>
  </div>
</template>

<style scoped>
.nph {
  background: var(--nu-page);
  padding: clamp(48px, 6.5vw, 88px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(36px, 4.5vw, 56px);
  animation: nu-fade .5s ease both;
}
.nph__title {
  margin: 18px 0 0; color: var(--nu-ink); font-size: clamp(40px, 5.5vw, 76px);
  font-weight: var(--nu-w-display); letter-spacing: -0.035em; line-height: 0.98;
}
.nph__sub {
  color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500;
  line-height: 1.45; margin-top: 22px; max-width: 620px;
}
.nph__actions { margin-top: 32px; }

/* variante lg (o hub /guias): o H1 de página da marca */
.nph--lg { padding: clamp(56px, 8vw, 100px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(40px, 5vw, 60px); }
.nph--lg .nph__title { font-size: var(--nu-fs-hero); }
.nph--lg .nph__sub { margin-top: 24px; max-width: 560px; }
.nph--lg .nph__actions { margin-top: 38px; }
</style>
