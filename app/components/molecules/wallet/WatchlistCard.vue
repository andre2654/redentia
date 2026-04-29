<!--
  WatchlistCard — tickers the user is following.

  Light read-only list. The "+ Adicionar" link routes to the chat
  with an intent so the LLM can run search + save_memory there
  (rather than wiring a modal here).
-->
<template>
  <article class="flex flex-col gap-4 rounded-xl border p-6" :style="cardStyle">
    <div class="flex items-baseline justify-between">
      <SectionHeading
        :brand="brand"
        eyebrow="Watchlist · Vigiando"
        title="Ativos que você acompanha"
        size="md"
      />
      <NuxtLink
        to="/help?intent=add-watchlist"
        class="font-mono-tab text-[10.5px] font-medium uppercase"
        :style="{ letterSpacing: '0.16em', color: brand.colors.primary }"
      >+ Adicionar</NuxtLink>
    </div>
    <div v-if="!items.length" class="py-4">
      <p class="text-[13px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)`, lineHeight: 1.5 }">
        Adicione tickers pelo chat e a gente acompanha aqui (preço, variação, dividendos).
      </p>
    </div>
    <ul v-else class="flex flex-col">
      <li
        v-for="(w, i) in items"
        :key="w.ticker"
        class="flex items-center gap-3 py-2.5"
        :style="{ borderBottom: i < items.length - 1 ? `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)` : 'none' }"
      >
        <span class="font-mono-tab text-[13px] font-medium w-16" :style="{ color: brand.colors.text }">{{ w.ticker }}</span>
        <span class="flex-1 truncate text-[11.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ w.name || w.note || '—' }}<span v-if="w.sector"> · {{ w.sector }}</span></span>
        <span
          v-if="w.current_price !== undefined && w.current_price !== null"
          class="font-mono-tab text-[12px] tabular-nums"
          :style="{ color: brand.colors.text }"
        >{{ formatBRL2(w.current_price) }}</span>
        <span
          v-if="w.change_pct !== undefined && w.change_pct !== null"
          class="font-mono-tab text-[11.5px] tabular-nums w-14 text-right"
          :style="{ color: w.change_pct >= 0 ? brand.colors.positive : brand.colors.negative }"
        >{{ formatPct(w.change_pct) }}</span>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import type { WatchlistItem } from '~/services/walletData'

interface Props {
  items: WatchlistItem[]
}
defineProps<Props>()

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

function formatBRL2(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
function formatPct(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}
</script>
