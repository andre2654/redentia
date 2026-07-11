<script setup lang="ts">
// Seção "TICKER no noticiário" (design Acoes Nu): destaque (NuNewsFeatured,
// reuso do PR1) + linhas (NuNewsRow) com o impacto % do ticker derivado da
// série de preços no dia da notícia, e link circular 'Ver todas as notícias'.
// Some inteira quando não há notícias do ticker.
import type { AcaoNewsVM } from '~/types/acao'

defineProps<{ ticker: string; news: AcaoNewsVM }>()
</script>

<template>
  <section class="anw">
    <h2 class="anw__title">{{ ticker }} no<br>noticiário.</h2>
    <div class="anw__featured">
      <NuNewsFeatured :item="news.featured" />
    </div>
    <div v-if="news.rows.length" class="anw__rows">
      <NuNewsRow v-for="(n, i) in news.rows" :key="i" :item="n" />
    </div>
    <NuxtLink to="/noticias" class="anw__all">
      <span class="anw__all-circle">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
      <span class="anw__all-label">Ver todas as notícias</span>
    </NuxtLink>
  </section>
</template>

<style scoped>
.anw {
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.anw__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.anw__featured { margin-top: 44px; }
.anw__rows { margin-top: 38px; }
.anw__all { display: inline-flex; align-items: center; gap: 14px; margin-top: 36px; transition: gap .2s; }
.anw__all:hover { gap: 19px; }
.anw__all-circle {
  width: 52px; height: 52px; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.anw__all-label { color: var(--nu-ink); font-size: 18px; font-weight: 800; }
</style>
