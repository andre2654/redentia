<script setup lang="ts">
// Hero do detalhe do título (creme, anatomia do NuPageHero adaptada ao
// domínio): breadcrumb-eyebrow → badge do indexador + pill de prazo → H1 com
// o nome → TAXA como número-herói (a taxa é o "preço" de um título público)
// → linha de vencimento. Tudo SSR (o H1 e a taxa saem no HTML da 1ª resposta).
import type { TesouroHeroVM } from '~/types/tesouro'

defineProps<{ hero: TesouroHeroVM }>()
</script>

<template>
  <section class="thr">
    <NuxtLink to="/tesouro" class="thr__eyebrow">Tesouro Direto</NuxtLink>
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
.thr {
  background: var(--nu-cream);
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px) clamp(36px, 4.5vw, 56px);
  animation: nu-fade .5s ease both;
}
.thr__eyebrow {
  display: inline-flex; color: var(--nu-blue);
  font-size: clamp(16px, 1.5vw, 19px); font-weight: 800;
}
.thr__eyebrow:hover { color: var(--nu-blue-hover); }
.thr__badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px; }
.thr__title {
  margin: 14px 0 0; color: var(--nu-ink); font-size: clamp(34px, 4.6vw, 64px);
  font-weight: 800; letter-spacing: -0.045em; line-height: 1.02;
}
.thr__rate { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-top: 18px; }
.thr__rate-num {
  color: var(--nu-blue); font-size: clamp(44px, 6.5vw, 92px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1; font-variant-numeric: tabular-nums;
}
.thr__rate-suffix { color: var(--nu-gray); font-size: clamp(16px, 1.8vw, 21px); font-weight: 700; }
.thr__meta {
  margin: 16px 0 0; color: var(--nu-gray); font-size: clamp(15px, 1.6vw, 18px);
  font-weight: 600; font-variant-numeric: tabular-nums;
}
</style>
