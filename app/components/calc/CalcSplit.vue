<script setup lang="ts">
// PR10 — banda full-bleed 2 COLUNAS, anatomia (b) do design (Redentia
// Calculadoras Nu.dc.html, seções "A fórmula por trás do cálculo." e
// "Ficou com alguma dúvida?"): esquerda = título gigante clamp(38px,4.8vw,62px)
// + dek + extras (pill, prosa); direita = conteúdo (card creme de fórmula,
// accordion de FAQ, parágrafos…). titleTag preserva a hierarquia do SEO
// antigo; size="sm" pra títulos h3 de sub-seção (escala menor).
// Aportou (11/11/2026): não existe mais faixa branca de ponta a ponta. O tom
// 'white' é o creme da página (--nu-page) e o 'cream' é o creme de faixa
// (--nu-band). Dentro da faixa no creme da página, o cartão "creme" de quem
// ocupa o slot (var(--nu-cream), quase igual ao fundo novo) passa a ser o
// creme de faixa: é o cartão do quadro Home, sem tocar em cada página.
defineProps<{
  tone?: 'cream' | 'white'
  titleTag?: 'h2' | 'h3'
  size?: 'sm'
  /** proporção da coluna direita (design: 1.5 fórmula, 1.6 FAQ) */
  wide?: boolean
}>()
</script>

<template>
  <section class="csp" :class="{ 'csp--cream': tone === 'cream' }">
    <div class="csp__cols">
      <div class="csp__left">
        <component :is="titleTag ?? 'h2'" class="csp__title" :class="{ 'csp__title--sm': size === 'sm' }">
          <slot name="title" />
        </component>
        <div v-if="$slots.dek" class="csp__dek"><slot name="dek" /></div>
        <slot name="left" />
      </div>
      <div class="csp__right" :class="{ 'csp__right--wide': wide }"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.csp {
  background: var(--nu-page);
  padding: clamp(64px, 8.5vw, 110px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.csp--cream { background: var(--nu-band); }
/* o cartão "creme" do slot vira o creme de faixa sobre o creme da página */
.csp:not(.csp--cream) { --nu-cream: var(--nu-band); }
.csp__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.csp__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.csp__title {
  margin: 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display);
  letter-spacing: -0.03em; line-height: 1.02;
}
.csp__title--sm { font-size: var(--nu-fs-h2-sm); }
.csp__dek {
  color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500;
  line-height: 1.55; margin-top: 22px; max-width: 420px;
}
.csp__dek :deep(p) { margin: 0 0 14px; }
.csp__dek :deep(p:last-child) { margin-bottom: 0; }
.csp__right { flex: 1.5 1 460px; min-width: min(340px, 100%); }
.csp__right--wide { flex: 1.6 1 480px; }
</style>
