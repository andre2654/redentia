<script setup lang="ts">
// Notícia destaque (link inteiro clicável): pill de ticker + fonte/hora +
// manchete gigante com hover azul + dek. Valores exatos do design.
import type { NuNewsFeaturedItem } from '~/types/market'

defineProps<{ item: NuNewsFeaturedItem }>()
</script>

<template>
  <NuxtLink :to="item.href" class="nnf">
    <span class="nnf__meta">
      <span v-if="item.badge" class="nnf__badge" :class="`nnf__badge--${item.badge.dir}`">{{ item.badge.text }}</span>
      <span class="nnf__source">{{ item.source }}</span>
    </span>
    <span class="nnf__title">{{ item.title }}</span>
    <span v-if="item.dek" class="nnf__dek">{{ item.dek }}</span>
  </NuxtLink>
</template>

<style scoped>
.nnf { display: block; }
.nnf__meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.nnf__badge {
  display: inline-flex; align-items: center; font-size: 13.5px; font-weight: 800;
  padding: 7px 15px; border-radius: var(--nu-r-pill); white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.nnf__badge--up { background: var(--nu-green-tint); color: var(--nu-green-2); }
.nnf__badge--down { background: var(--nu-red-tint); color: var(--nu-red-2); }
.nnf__source { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }
.nnf__title {
  display: block; color: var(--nu-ink); font-size: clamp(26px, 3.4vw, 44px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.1; margin-top: 16px; max-width: 1000px; transition: color .2s;
}
.nnf:hover .nnf__title { color: var(--nu-blue); }
.nnf__dek {
  display: block; color: var(--nu-gray); font-size: 17px; font-weight: 600;
  line-height: 1.6; margin-top: 14px; max-width: 760px;
}
</style>
