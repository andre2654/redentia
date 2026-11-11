<script setup lang="ts">
// Hero do detalhe do título (creme, anatomia do NuPageHero adaptada ao
// domínio): breadcrumb-eyebrow → badge do indexador + pill de prazo → H1 com
// o nome → TAXA como número-herói (a taxa é o "preço" de um título público)
// → linha de vencimento. Tudo SSR (o H1 e a taxa saem no HTML da 1ª resposta).
import type { TesouroHeroVM } from '~/types/tesouro'

defineProps<{ hero: TesouroHeroVM }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
</script>

<template>
  <section v-contexto-chat="{ id: `tesouro-hero:${hero.name}`, tipo: 'ativo', rotulo: rotuloCurto(hero.name) }" class="thr">
    <NuxtLink to="/tesouro" class="thr__eyebrow nu-eyebrow"><MarcaCorte /><span>Tesouro Direto</span></NuxtLink>
    <div class="thr__badges">
      <NuBadge variant="blue" size="hero">{{ hero.indexerShort }}</NuBadge>
      <NuBadge v-if="hero.horizonLine" variant="neutral" size="hero">{{ hero.horizonLine }}</NuBadge>
    </div>
    <h1 class="thr__title">{{ hero.name }}</h1>
    <div class="thr__rate">
      <span class="thr__rate-num">{{ hero.rateHero }}</span>
      <span v-if="hero.rateSuffix" class="thr__rate-suffix">{{ hero.rateSuffix }}</span>
    </div>
    <p class="thr__meta">{{ hero.maturityLine }}</p>
  </section>
</template>

<style scoped>
/* Aportou (11/11/2026): o herói é creme, com o eyebrow da marca (o link para a
   lista), o nome em 800 e a taxa como número-herói em carvão. */
.thr {
  background: var(--nu-page);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(36px, 4.5vw, 56px);
  animation: nu-fade .5s ease both;
}
.thr__eyebrow { display: inline-flex; min-height: 44px; transition: color .2s ease; }
.thr__eyebrow:hover { color: var(--nu-blue-text); }
.thr__badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.thr__title {
  margin: 16px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.02;
}
.thr__rate { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
.thr__rate-num {
  color: var(--nu-ink); font-size: clamp(56px, 9vw, 120px); font-weight: 800;
  letter-spacing: -0.045em; line-height: .95; font-variant-numeric: tabular-nums;
}
.thr__rate-suffix { color: var(--nu-gray); font-size: clamp(18px, 1.8vw, 22px); font-weight: 700; }
.thr__meta {
  margin: 18px 0 0; color: var(--nu-gray-3); font-size: clamp(16px, 1.5vw, 19px);
  font-weight: 500; font-variant-numeric: tabular-nums;
}
</style>
