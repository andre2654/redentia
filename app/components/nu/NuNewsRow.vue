<script setup lang="ts">
// Linha de notícia: manchete com hover azul + fonte/hora, pct do ticker
// colorido e círculo outline com chevron. Valores exatos do design.
import type { NuNewsRowItem } from '~/types/market'

defineProps<{ item: NuNewsRowItem }>()
</script>

<template>
  <NuxtLink :to="item.href" class="nnr">
    <span class="nnr__main">
      <span class="nnr__title">{{ item.title }}</span>
      <span class="nnr__source">{{ item.source }}</span>
    </span>
    <span v-if="item.ticker" class="nnr__pct" :class="`nnr__pct--${item.ticker.dir}`">{{ item.ticker.text }}</span>
    <span class="nnr__circle">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
    </span>
  </NuxtLink>
</template>

<style scoped>
.nnr { display: flex; align-items: center; gap: 18px; padding: 21px 0; border-top: 1.5px solid var(--nu-cream-2); }
.nnr__main { flex: 1; min-width: 0; }
.nnr__title {
  display: block; color: var(--nu-ink); font-size: 18.5px; font-weight: 800;
  letter-spacing: -.2px; line-height: 1.3; transition: color .2s;
}
.nnr:hover .nnr__title { color: var(--nu-blue); }
.nnr__source { display: block; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; margin-top: 5px; }
.nnr__pct { font-size: 15px; font-weight: 800; white-space: nowrap; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.nnr__pct--up { color: var(--nu-green-2); }
.nnr__pct--down { color: var(--nu-red-2); }
.nnr__circle {
  width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%;
  border: 2px solid var(--nu-ink-14); display: flex; align-items: center; justify-content: center;
}
</style>
