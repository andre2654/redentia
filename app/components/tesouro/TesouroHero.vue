<script setup lang="ts">
// Hero do detalhe do título (creme, anatomia do NuPageHero adaptada ao
// domínio): breadcrumb-eyebrow → badge do indexador + pill de prazo → H1 com
// o nome → TAXA como número-herói (a taxa é o "preço" de um título público)
// → linha de vencimento. Tudo SSR (o H1 e a taxa saem no HTML da 1ª resposta).
// 2ª rodada da Aportou (11/11/2026): é a coluna da esquerda do topo em duas
// colunas da página (a seção, o fundo e a grade são de /tesouro/[slug]); os
// indexador vai no eyebrow e os selos têm raio 8 (prazo em azul, vencimento em contorno).
// Robustez (11/11/2026): os selos são o NuSelo da base; o movimento e a cor por token.
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
      <NuSelo v-if="hero.horizonLine" tom="azul">{{ hero.horizonLine }}</NuSelo>
      <NuSelo tom="contorno">{{ hero.maturityLine }}</NuSelo>
    </div>
  </div>
</template>

<style scoped>
/* Aportou (11/11/2026): o eyebrow da marca (o link para a lista), o nome em
   800 e a taxa como número-herói em carvão. */
.thr { min-width: 0; color: var(--nu-ink); animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) both; }
.thr__eyebrow { margin: 0; }
.thr__volta {
  display: inline-block; padding: 14px 0; margin: -14px 0; color: inherit;
  text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-line);
  transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-rapida) var(--nu-ease-cor);
}
.thr__volta:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.thr__title {
  margin: 16px 0 0; color: var(--nu-ink); font-size: clamp(30px, 3.2vw, 44px);
  font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.04; text-wrap: balance;
}
.thr__rate { display: flex; align-items: baseline; gap: 4px 12px; flex-wrap: wrap; margin-top: 16px; }
.thr__rate-num {
  color: var(--nu-ink); font-size: clamp(48px, 6.4vw, 88px); font-weight: var(--nu-w-display);
  letter-spacing: -0.045em; line-height: .95; font-variant-numeric: tabular-nums;
}
.thr__rate-suffix { color: var(--nu-gray); font-size: clamp(18px, 1.8vw, 22px); font-weight: var(--nu-w-medio); }
.thr__badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 24px; }
</style>
