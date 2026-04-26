<!--
  TickerChip — live ticker pill for chat surfaces.

  Renders [logo] TICKER · R$ price [(was R$ x · ↘ -8%)]
                                  ↑ optional snapshot at mention time

  Subscribes to `useTickerSnapshots` on mount; live price + delta
  refresh every 60s in the background through a single batched
  request (one call per chat regardless of chip count).

  Two density modes:
    - `default` — full chip with logo + name + price + delta. Used in
      DecisionCard, AlertCard, the chat answer.
    - `compact` — just ticker + price (no logo, no delta). Used in
      tight spaces like the Watchlist sidebar list.

  When a `priceWhenMentioned` is provided (decision snapshotPrice,
  watchlist snapshotPrice, etc.), the chip shows BOTH that historical
  price AND the live price + delta vs. mention. Otherwise it shows
  only the live price.

  Click → opens the asset page (`/assets/[ticker]`) for further drill-
  in. Falls back gracefully when the chat-service or fundamentals-
  scraper is unreachable: chip stays as a static label.
-->
<template>
  <component
    :is="clickable ? 'a' : 'span'"
    :href="clickable ? href : undefined"
    :target="clickable ? '_blank' : undefined"
    rel="noopener"
    class="ticker-chip group inline-flex items-center gap-1.5 rounded-full px-1.5 py-0.5 align-middle text-[12px] leading-none transition-[background-color,box-shadow]"
    :style="chipStyle"
    :aria-label="ariaLabel"
  >
    <!-- Logo or initials fallback -->
    <span
      v-if="density === 'default'"
      class="ticker-chip-logo inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full"
      :style="{
        backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)`,
      }"
      aria-hidden="true"
    >
      <img
        v-if="snapshot?.logo"
        :src="snapshot.logo"
        :alt="''"
        width="20"
        height="20"
        loading="lazy"
        class="size-full object-cover"
        @error="onLogoError"
      />
      <span
        v-else
        class="font-mono-tab text-[8.5px] font-bold tracking-tight"
        :style="{ color: brand.colors.textMuted }"
      >{{ initials }}</span>
    </span>

    <!-- Ticker -->
    <span
      class="font-mono-tab font-semibold tracking-tight tabular-nums"
      :style="{ color: brand.colors.text }"
    >{{ ticker.toUpperCase() }}</span>

    <!-- Live price -->
    <template v-if="livePrice != null">
      <span
        class="font-mono-tab tabular-nums"
        :style="{
          color: livePriceColor,
        }"
      >{{ formatPrice(livePrice) }}</span>
      <!-- Delta: prefer mention-vs-live when we know both, else
           today's 1d change. -->
      <span
        v-if="density === 'default' && deltaPct != null"
        class="font-mono-tab text-[10.5px] tabular-nums"
        :style="{ color: deltaColor }"
      >{{ formatDelta(deltaPct) }}</span>
    </template>
    <span
      v-else
      class="font-mono-tab text-[10.5px]"
      :style="{ color: brand.colors.textMuted }"
    >…</span>
  </component>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    ticker: string
    /**
     * Price recorded when the chat first mentioned the ticker (e.g. a
     * decision's snapshotPriceAtCreate, a watchlist's snapshotPrice).
     * When provided, the delta switches to "vs mention".
     */
    priceWhenMentioned?: number | null
    /** Visual density. */
    density?: 'default' | 'compact'
    /** Whether to show as a clickable <a>. Default true. */
    clickable?: boolean
  }>(),
  {
    priceWhenMentioned: null,
    density: 'default',
    clickable: true,
  },
)

const brand = useBrand()
const tickers = useTickerSnapshots()

// Subscribe on mount, drop on unmount.
onMounted(() => tickers.subscribe(props.ticker))
onBeforeUnmount(() => tickers.unsubscribe(props.ticker))
// If the prop changes, re-subscribe.
watch(
  () => props.ticker,
  (next, prev) => {
    if (prev) tickers.unsubscribe(prev)
    if (next) tickers.subscribe(next)
  },
)

const snapshot = computed(() => tickers.get(props.ticker))
const livePrice = computed(() => snapshot.value?.price ?? null)

/**
 * Delta percent the chip displays. When `priceWhenMentioned` is
 * known, we use mention-vs-live (more meaningful in chat context —
 * "PETR4 caiu 8% desde que falamos"). Otherwise we fall back to the
 * 1d change from the snapshot (intra-day move).
 */
const deltaPct = computed<number | null>(() => {
  const live = livePrice.value
  if (live == null) return null
  if (props.priceWhenMentioned != null && props.priceWhenMentioned > 0) {
    return ((live - props.priceWhenMentioned) / props.priceWhenMentioned) * 100
  }
  return snapshot.value?.changePct1d ?? null
})

const deltaColor = computed(() => {
  const delta = deltaPct.value
  if (delta == null || Math.abs(delta) < 0.01) return brand.colors.textMuted
  return delta > 0 ? (brand.colors.positive ?? brand.colors.primary) : brand.colors.negative
})

const livePriceColor = computed(() => {
  // Tint the live price subtly when the move from mention is
  // material (>2%). Inside that band the price stays neutral so the
  // eye doesn't get pulled by every micro-move.
  const delta = deltaPct.value
  if (delta == null || Math.abs(delta) < 2) return brand.colors.text
  return delta > 0 ? (brand.colors.positive ?? brand.colors.primary) : brand.colors.negative
})

const initials = computed(() => props.ticker.slice(0, 2).toUpperCase())

const href = computed(() => {
  // Map to the existing asset page route. Crypto tickers get
  // /crypto/<ticker>; tesouro gets /tesouro/<slug>; stocks/FIIs/ETFs
  // share /assets/<ticker>.
  const t = props.ticker.toUpperCase()
  if (/^(BTC|ETH|SOL|BNB|XRP|ADA|DOGE|USDC|USDT)/i.test(t)) return `/crypto/${t}`
  if (t.toLowerCase().startsWith('tesouro-')) return `/tesouro/${t.toLowerCase()}`
  return `/assets/${t}`
})

const ariaLabel = computed(() => {
  const parts = [props.ticker.toUpperCase()]
  if (snapshot.value?.name) parts.push(snapshot.value.name)
  if (livePrice.value != null) parts.push(`R$ ${livePrice.value.toFixed(2)}`)
  if (deltaPct.value != null && Math.abs(deltaPct.value) >= 0.01) {
    parts.push(`${deltaPct.value >= 0 ? 'sobe' : 'cai'} ${Math.abs(deltaPct.value).toFixed(1)}%`)
  }
  return parts.join(', ')
})

const logoFailed = ref(false)
function onLogoError(): void {
  logoFailed.value = true
}

function formatPrice(value: number): string {
  if (value < 1) {
    return `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}`
  }
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDelta(delta: number): string {
  const abs = Math.abs(delta)
  if (abs < 0.01) return '±0%'
  const sign = delta > 0 ? '+' : '−'
  return `${sign}${abs.toFixed(abs < 10 ? 1 : 0)}%`
}

const chipStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.text} 4%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
  color: brand.colors.text,
  textDecoration: 'none',
}))
</script>

<style scoped>
.ticker-chip {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.ticker-chip:hover {
  background-color: color-mix(in srgb, currentColor 8%, transparent);
}
.ticker-chip:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}
</style>
