<script setup lang="ts">
// PR10 — hero COMPACTO das calculadoras (direção do André 2026-07-12):
// botão "← Todas as calculadoras" (pill de verdade, não link solto) + h1 +
// UMA linha de descrição. O eyebrow, os chips de confiança, o "Atualizado
// em" e o lead grande de SEO saíram do hero: eyebrow/chips/updated vivem na
// CalcMetaStrip (abaixo da calculadora) e o lead vira o 1º parágrafo da
// primeira banda educacional — o usuário vê a calculadora imediatamente.
defineProps<{
  /** descrição curta de 1 linha (não é o lead de SEO — esse desce) */
  desc: string
}>()
</script>

<template>
  <section class="chr">
    <NuxtLink to="/calculadoras" class="chr__back">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
      Todas as calculadoras
    </NuxtLink>
    <h1 class="chr__h1"><slot /></h1>
    <p class="chr__desc">{{ desc }}</p>
  </section>
</template>

<style scoped>
.chr {
  background: var(--nu-cream);
  padding: clamp(40px, 5.5vw, 72px) clamp(22px, 5.5vw, 80px) clamp(34px, 4.5vw, 56px);
  animation: nu-fade .5s ease both;
}
.chr__back {
  display: inline-flex; align-items: center; gap: 9px;
  background: var(--nu-white); color: var(--nu-ink);
  border-radius: var(--nu-r-pill); padding: 11px 20px;
  font-size: 14.5px; font-weight: 700;
  transition: transform .18s, box-shadow .2s;
}
.chr__back:hover { transform: translateY(-1px); box-shadow: var(--nu-shadow-card); color: var(--nu-ink); }
.chr__h1 {
  margin: clamp(22px, 3vw, 34px) 0 0; color: var(--nu-ink);
  font-size: clamp(34px, 4.6vw, 64px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.04; max-width: 1080px;
}
.chr__h1 :deep(em) { font-style: italic; }
.chr__desc {
  margin: 16px 0 0; color: var(--nu-gray-2);
  font-size: clamp(16px, 1.7vw, 19px); font-weight: 600; line-height: 1.55;
  max-width: 640px;
}
</style>
