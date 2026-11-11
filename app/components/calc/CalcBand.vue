<script setup lang="ts">
// PR10 — banda full-bleed com TÍTULO CENTRAL, anatomia (a) do design
// (Redentia Calculadoras Nu.dc.html, seção "Como funcionam os juros
// compostos"): fundo alterna creme/branco, h2 centrado clamp(32px,4vw,54px),
// conteúdo abaixo (card branco/creme, grid de tiles, tabela…) via slot.
// titleTag configurável pra preservar a hierarquia semântica do texto SEO
// antigo (um h3 do conteúdo pode ser título visual de banda sem virar h2).
// Aportou (11/11/2026): não existe mais faixa branca de ponta a ponta. O tom
// 'white' é o creme da página (--nu-page) e o 'cream' é o creme de faixa
// (--nu-band). Dentro da faixa no creme da página, o cartão "creme" de quem
// ocupa o slot (var(--nu-cream), quase igual ao fundo novo) passa a ser o
// creme de faixa: é o cartão do quadro Home, sem tocar em cada página.
defineProps<{
  tone?: 'cream' | 'white'
  title?: string
  titleTag?: 'h2' | 'h3'
  /** eyebrow curto acima do título (ex.: 'Transparência total' na
   *  metodologia do redentia-score — texto visível da página antiga). */
  kicker?: string
  /** banda-statement (só título, sem conteúdo): padding reduzido pra não
   *  virar um vão gigante — usada quando o h2 do SEO antigo era órfão */
  tight?: boolean
}>()
</script>

<template>
  <section class="cbd" :class="{ 'cbd--cream': tone === 'cream', 'cbd--tight': tight }">
    <p v-if="kicker" class="cbd__kicker nu-eyebrow"><MarcaCorte /><span>{{ kicker }}</span></p>
    <component :is="titleTag ?? 'h2'" v-if="title || $slots.title" class="cbd__title">
      <slot name="title">{{ title }}</slot>
    </component>
    <div v-if="$slots.dek" class="cbd__dek"><slot name="dek" /></div>
    <slot />
  </section>
</template>

<style scoped>
.cbd {
  background: var(--nu-page);
  padding: clamp(60px, 8vw, 104px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2));
  animation: nu-fade .5s ease both;
}
.cbd--cream { background: var(--nu-band); }
/* o cartão "creme" do slot vira o creme de faixa sobre o creme da página */
.cbd:not(.cbd--cream) { --nu-cream: var(--nu-band); }
.cbd--tight { padding-top: clamp(36px, 5vw, 60px); padding-bottom: clamp(36px, 5vw, 60px); }
.cbd__kicker { margin: 0 auto 18px; max-width: 980px; justify-content: center; }
.cbd__title {
  margin: 0 auto; max-width: 980px;
  color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.04; text-align: center;
}
.cbd__dek {
  margin: 18px auto 0; max-width: 680px; text-align: center;
  color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.55;
}
.cbd__dek :deep(p) { margin: 0; }
</style>
