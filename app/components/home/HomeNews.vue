<script setup lang="ts">
// Notícias da Home (design Home Nu): MODO 'personal' = feed do
// /portfolio/news-today com impacto pessoal no dek ('X% da carteira') e
// h2 'Notícias que te afetam.' · MODO 'general' (sem conexão/sem itens) =
// notícias gerais do useNuNews com h2 'No noticiário.' — a seção nunca
// morre (contrato de estados da Diretriz nº1). Reusa NuNewsFeatured/NuNewsRow.
import type { HomeNewsVM } from '~/types/home'
import type { NuNewsFeaturedItem, NuNewsRowItem } from '~/types/market'

const props = defineProps<{ news: HomeNewsVM }>()

// fallback geral: mesmo composable do /mercado (seed → hidrata /research/news)
const general = props.news.mode === 'general' ? useNuNews() : null

const featured = computed<NuNewsFeaturedItem | null>(() => {
  if (props.news.mode === 'personal') {
    return props.news.featured ? { href: '/noticias', ...props.news.featured } : null
  }
  return general?.featured.value ?? null
})
const rows = computed<NuNewsRowItem[]>(() => {
  if (props.news.mode === 'personal') {
    return props.news.rows.map((r) => ({ href: '/noticias', ...r }))
  }
  return general?.rows.value ?? []
})
</script>

<template>
  <section class="hnw">
    <h2 v-if="news.mode === 'personal'" class="hnw__title">Notícias que<br>te afetam.</h2>
    <h2 v-else class="hnw__title">No noticiário.</h2>

    <div v-if="featured" class="hnw__featured">
      <NuNewsFeatured :item="featured" />
    </div>
    <div v-if="rows.length" class="hnw__rows">
      <NuNewsRow v-for="(n, i) in rows" :key="i" :item="n" />
    </div>

    <NuxtLink to="/noticias" class="hnw__all">
      <span class="hnw__all-circle">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
      <span class="hnw__all-label">Ver todas as notícias</span>
    </NuxtLink>
  </section>
</template>

<style scoped>
.hnw { background: var(--nu-cream); padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hnw__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.hnw__featured { margin-top: 44px; }
.hnw__rows { margin-top: 38px; }
/* seção creme: hairline das linhas é #E7E0D2 (o NuNewsRow nasce no /mercado
   sobre branco com --nu-cream-2) — override pontual do design da Home */
.hnw__rows :deep(.nnr) { border-top-color: var(--nu-cream-line); }
.hnw__all { display: inline-flex; align-items: center; gap: 14px; margin-top: 36px; transition: gap .2s; }
.hnw__all:hover { gap: 19px; }
.hnw__all-circle {
  width: 52px; height: 52px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.hnw__all-label { color: var(--nu-ink); font-size: 18px; font-weight: 800; }
</style>
