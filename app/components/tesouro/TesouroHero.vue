<script setup lang="ts">
// Hero do detalhe do título (creme, anatomia do NuPageHero adaptada ao
// domínio): breadcrumb-eyebrow → badge do indexador + pill de prazo → H1 com
// o nome → TAXA como número-herói (a taxa é o "preço" de um título público)
// → linha de vencimento. Tudo SSR (o H1 e a taxa saem no HTML da 1ª resposta).
// 2ª rodada da Aportou (11/11/2026): é a coluna da esquerda do topo em duas
// colunas da página (a seção, o fundo e a grade são de /tesouro/[slug]); os
// indexador vai no eyebrow e os selos têm raio 8 (prazo em azul, vencimento em contorno).
import type { TesouroHeroVM } from '~/types/tesouro'

defineProps<{ hero: TesouroHeroVM }>()
// o sujeito do chip do chat (proverSobreDoContexto na página)
const sobre = useSobreDoContexto()
</script>

<template>
  <div v-contexto-chat="{ id: `tesouro-hero:${hero.name}`, tipo: 'ativo', rotulo: rotuloCurto(hero.name) }" class="thr">
    <p class="nu-eyebrow thr__eyebrow">
      <MarcaCorte />
      <span><NuxtLink to="/tesouro" class="thr__volta">Tesouro Direto</NuxtLink><span aria-hidden="true"> · </span>{{ hero.indexerShort }}</span>
    </p>
    <h1 class="thr__title">{{ hero.name }}</h1>
    <div class="thr__rate">
      <span class="thr__rate-num">{{ hero.rateHero }}</span>
      <span v-if="hero.rateSuffix" class="thr__rate-suffix">{{ hero.rateSuffix }}</span>
    </div>
    <div class="thr__badges">
      <span v-if="hero.horizonLine" class="thr__selo thr__selo--azul">{{ hero.horizonLine }}</span>
      <span class="thr__selo thr__selo--contorno">{{ hero.maturityLine }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): o eyebrow da marca (o link para a lista), o nome em
   800 e a taxa como número-herói em carvão. */
.thr { min-width: 0; color: var(--nu-ink); animation: nu-fade .5s ease both; }
.thr__eyebrow { margin: 0; }
.thr__volta {
  display: inline-block; padding: 14px 0; margin: -14px 0; color: inherit;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-line);
  transition: text-decoration-color .2s ease, color .2s ease;
}
.thr__volta:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.thr__title {
  margin: 20px 0 0; color: var(--nu-ink); font-size: clamp(30px, 3.2vw, 44px);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.04; text-wrap: balance;
}
.thr__rate { display: flex; align-items: baseline; gap: 4px 12px; flex-wrap: wrap; margin-top: 18px; }
.thr__rate-num {
  color: var(--nu-ink); font-size: clamp(48px, 6.4vw, 88px); font-weight: 800;
  letter-spacing: -0.045em; line-height: .95; font-variant-numeric: tabular-nums;
}
.thr__rate-suffix { color: var(--nu-gray); font-size: clamp(18px, 1.8vw, 22px); font-weight: 700; }
.thr__badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 24px; }
.thr__selo {
  display: inline-flex; align-items: center; min-height: 30px; padding: 5px 11px; border-radius: var(--nu-r-tag);
  background: var(--nu-cream-2); color: var(--nu-ink); font-size: 14px; font-weight: 700; line-height: 1.2; font-variant-numeric: tabular-nums;
}
.thr__selo--azul { background: var(--nu-blue-bg); color: var(--nu-blue-text); }
.thr__selo--contorno { background: transparent; color: var(--nu-gray-3); box-shadow: inset 0 0 0 1.5px var(--nu-line); }
@media (prefers-reduced-motion: reduce) { .thr { animation: none; } }
</style>
