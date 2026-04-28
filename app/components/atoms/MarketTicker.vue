<template>
  <div
    class="relative flex h-9 items-center overflow-hidden border-y"
    :style="{
      borderColor: 'var(--brand-border)',
      backgroundColor: 'var(--brand-surface)',
    }"
    role="region"
    aria-label="Cotações ao vivo"
    aria-live="off"
  >
    <!-- Fixed label on the left (stays put while the tape scrolls) -->
    <div
      class="relative z-10 flex h-full shrink-0 items-center gap-2 border-r px-4 font-mono-tab text-[10px] font-semibold uppercase tracking-[0.18em]"
      :style="{
        borderColor: 'var(--brand-border)',
        backgroundColor: 'var(--brand-background)',
        color: 'var(--brand-primary)',
      }"
    >
      <span class="relative flex size-1.5" aria-hidden="true">
        <span
          class="absolute inline-flex size-1.5 rounded-full opacity-75 motion-safe:animate-ping"
          :style="{ backgroundColor: 'var(--brand-primary)' }"
        />
        <span
          class="relative inline-flex size-1.5 rounded-full"
          :style="{ backgroundColor: 'var(--brand-primary)' }"
        />
      </span>
      <span translate="no">LIVE</span>
    </div>

    <!-- Scrolling tape, duplicated twice for seamless loop -->
    <div class="flex min-w-0 flex-1 overflow-hidden">
      <div class="ticker-track flex shrink-0 items-center gap-8 whitespace-nowrap px-6">
        <template v-for="(item, idx) in tapeItems" :key="`a-${idx}`">
          <div class="flex items-center gap-2 font-mono-tab text-[11px]">
            <span class="font-semibold" :style="{ color: 'var(--brand-text)' }">
              {{ item.symbol }}
            </span>
            <span :style="{ color: 'var(--brand-text-muted)' }">
              {{ item.value }}
            </span>
            <span
              :style="{
                color: item.change >= 0 ? brand.colors.positive : 'var(--brand-negative)',
              }"
            >
              {{ item.change >= 0 ? '▲' : '▼' }} {{ item.change >= 0 ? '+' : '' }}{{ item.change.toFixed(2) }}%
            </span>
          </div>
          <span
            class="h-3 w-px"
            :style="{ backgroundColor: 'var(--brand-border)' }"
          />
        </template>
      </div>
      <!-- Duplicate for seamless loop -->
      <div class="ticker-track flex shrink-0 items-center gap-8 whitespace-nowrap px-6" aria-hidden="true">
        <template v-for="(item, idx) in tapeItems" :key="`b-${idx}`">
          <div class="flex items-center gap-2 font-mono-tab text-[11px]">
            <span class="font-semibold" :style="{ color: brand.colors.text }">
              {{ item.symbol }}
            </span>
            <span :style="{ color: brand.colors.textMuted }">
              {{ item.value }}
            </span>
            <span
              :style="{
                color: item.change >= 0 ? brand.colors.positive : brand.colors.negative,
              }"
            >
              {{ item.change >= 0 ? '▲' : '▼' }} {{ item.change >= 0 ? '+' : '' }}{{ item.change.toFixed(2) }}%
            </span>
          </div>
          <span
            class="h-3 w-px"
            :style="{ backgroundColor: brand.colors.border }"
          />
        </template>
      </div>
    </div>

    <!-- Right-side fade mask -->
    <div
      class="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l to-transparent"
      :style="{ '--tw-gradient-from': brand.colors.surface, backgroundImage: `linear-gradient(to left, ${brand.colors.surface}, transparent)` }"
    />
  </div>
</template>

<script setup lang="ts">
interface TapeItem {
  symbol: string
  value: string
  change: number
}

const brand = useBrand()

// Mock tape data. In production this would come from /api/top-stocks or
// a dedicated /api/market/ticker endpoint and refresh every ~30s.
// For now we seed with realistic looking numbers so the home reads "alive".
const tapeItems = ref<TapeItem[]>([
  { symbol: 'IBOV', value: '127.834', change: 1.12 },
  { symbol: 'IFIX', value: '3.410', change: 0.49 },
  { symbol: 'USD', value: '5,08', change: -0.34 },
  { symbol: 'EUR', value: '5,56', change: -0.21 },
  { symbol: 'PETR4', value: 'R$\u00A038,45', change: 2.18 },
  { symbol: 'VALE3', value: 'R$\u00A062,12', change: -1.05 },
  { symbol: 'ITUB4', value: 'R$\u00A031,78', change: 0.67 },
  { symbol: 'BBAS3', value: 'R$\u00A028,90', change: -0.42 },
  { symbol: 'MGLU3', value: 'R$\u00A012,45', change: 4.85 },
  { symbol: 'WEGE3', value: 'R$\u00A052,30', change: 1.24 },
  { symbol: 'BBDC4', value: 'R$\u00A014,22', change: -0.85 },
  { symbol: 'B3SA3', value: 'R$\u00A011,08', change: 0.33 },
])

// Try to fetch real data if the backend is up, but don't block render
onMounted(async () => {
  try {
    const service = useAssetsService()
    const [top] = await Promise.all([service.getTopStocks('top', 500_000)])
    if (Array.isArray(top) && top.length >= 6) {
      tapeItems.value = top.slice(0, 12).map((t: any) => ({
        symbol: t.ticker || t.symbol || '',
        value: `R$\u00A0${Number(t.market_price || 0).toFixed(2).replace('.', ',')}`,
        change: Number(t.change_percent || 0),
      }))
    }
  } catch {
    // Silently fall back to seeded data
  }
})
</script>

<style scoped>
.ticker-track {
  animation: ticker-scroll 55s linear infinite;
}
@keyframes ticker-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}
/* Respect reduced-motion, pause the tape for users who request it */
@media (prefers-reduced-motion: reduce) {
  .ticker-track {
    animation: none;
  }
}
</style>
