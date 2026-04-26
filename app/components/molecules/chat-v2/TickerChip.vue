<!--
  TickerChip — live ticker pill for chat surfaces.

  Renders [logo] TICKER  R$ price  ±delta%
                                   ↑ optional, when material

  Subscribes to `useTickerSnapshots` on mount; live price + delta
  refresh every 60s in the background through a single batched
  request (one call per chat regardless of chip count).

  Density modes:
    - `default` — full chip with logo + ticker + price + delta. Used in
      DecisionCard, AlertCard, the chat answer (markdown auto-detect).
      Also the prose chip — we now always show the logo so the
      ticker has a recognizable brand mark next to it.
    - `compact` — sidebar-tight rows. Smaller logo, tighter padding,
      delta hidden. Used in the Painel drawer's Decisions list and
      Watchlist list.

  When a `priceWhenMentioned` is provided (decision target_price,
  watchlist snapshot_price, etc.), the delta switches to
  "mention vs live" — more meaningful in chat than today's intra-day
  move ("PETR4 caiu 8% desde que falamos disso").

  Click → opens the asset page (`/assets/[ticker]`) in a new tab.
  Falls back gracefully when chat-service is unreachable: chip stays
  as a static label with the ticker text + initials avatar.
-->
<template>
  <component
    :is="clickable ? 'a' : 'span'"
    :href="clickable ? href : undefined"
    :target="clickable ? '_blank' : undefined"
    rel="noopener"
    class="ticker-chip group inline-flex shrink-0 items-center align-middle leading-none transition-[background-color,box-shadow,border-color]"
    :class="[
      density === 'compact' ? 'ticker-chip--compact' : 'ticker-chip--default',
    ]"
    :style="chipStyle"
    :aria-label="ariaLabel"
  >
    <!-- Logo / initials avatar — always shown now (user feedback:
         "coloca o icone do papel tambem"). The avatar carries:
           1. The brand mark (real logo from fundamentals-scraper)
           2. A subtle white inner border so the logo pops on dark
              backgrounds without needing a heavy outline
           3. A two-letter initials fallback when no logo is available
              (or the image errors out) — never an empty circle. -->
    <span
      class="ticker-chip-logo inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      :style="logoStyle"
      aria-hidden="true"
    >
      <img
        v-if="snapshot?.logo && !logoFailed"
        :src="snapshot.logo"
        alt=""
        :width="logoSize"
        :height="logoSize"
        loading="lazy"
        class="size-full object-cover"
        @error="onLogoError"
      />
      <span
        v-else
        class="font-mono-tab font-bold tracking-tight"
        :style="{
          color: brand.colors.textMuted,
          fontSize: density === 'compact' ? '8px' : '9px',
        }"
      >{{ initials }}</span>
    </span>

    <!-- Ticker label -->
    <span
      class="ticker-chip-label font-mono-tab font-semibold tracking-tight"
      :style="{ color: brand.colors.text }"
    >{{ ticker.toUpperCase() }}</span>

    <!-- Live price + (optional) delta -->
    <template v-if="livePrice != null">
      <span
        class="ticker-chip-price font-mono-tab tabular-nums"
        :style="{ color: livePriceColor }"
      >{{ formatPrice(livePrice) }}</span>
      <span
        v-if="density === 'default' && deltaPct != null && Math.abs(deltaPct) >= 0.01"
        class="ticker-chip-delta font-mono-tab tabular-nums"
        :style="{ color: deltaColor }"
      >{{ formatDelta(deltaPct) }}</span>
    </template>
    <span
      v-else
      class="ticker-chip-loading font-mono-tab"
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
     * decision's target_price, a watchlist's snapshot_price). When
     * provided, the delta switches to "mention vs live".
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
watch(
  () => props.ticker,
  (next, prev) => {
    if (prev) tickers.unsubscribe(prev)
    if (next) tickers.subscribe(next)
  },
)

const snapshot = computed(() => tickers.get(props.ticker))
const livePrice = computed(() => snapshot.value?.price ?? null)

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
  // Subtle: tint the live price only when the mention-vs-live move is
  // material (> 2%). Inside that band the price stays neutral so the
  // eye doesn't get pulled by every micro-move.
  const delta = deltaPct.value
  if (delta == null || Math.abs(delta) < 2) return brand.colors.text
  return delta > 0 ? (brand.colors.positive ?? brand.colors.primary) : brand.colors.negative
})

const initials = computed(() => props.ticker.slice(0, 2).toUpperCase())

const href = computed(() => {
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

const logoSize = computed(() => (props.density === 'compact' ? 16 : 20))

const chipStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 80%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
  color: brand.colors.text,
  textDecoration: 'none',
}))

const logoStyle = computed(() => {
  // Inner ring effect: a 1px white-mix highlight at the very edge so
  // the logo reads as a "minted" badge instead of a flat circle.
  // Subtle on dark backgrounds; invisible on light. The ring sits
  // INSIDE the logo via inset box-shadow so the outer chip border
  // stays clean.
  const size = props.density === 'compact' ? '16px' : '20px'
  return {
    width: size,
    height: size,
    backgroundColor: `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.text} 8%, transparent)`,
  }
})
</script>

<style scoped>
.ticker-chip {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  border-radius: 9999px;
  white-space: nowrap;
}

/* ----- Default density (chat answer / cards) -----
   Tighter horizontally than before so the chip reads as a single
   pill, not a row of separated pieces. The leading logo replaces
   the previous "left padding" — it sits flush against the left
   edge with 2px insets only. */
.ticker-chip--default {
  padding: 2px 9px 2px 2px;
  gap: 6px;
  font-size: 12px;
}
.ticker-chip--default .ticker-chip-label {
  font-size: 12px;
}
.ticker-chip--default .ticker-chip-price {
  font-size: 11.5px;
}
.ticker-chip--default .ticker-chip-delta {
  font-size: 10.5px;
}

/* ----- Compact density (sidebar lists) -----
   Same shape, smaller logo and tighter vertical rhythm. Delta is
   hidden via the v-if upstream. */
.ticker-chip--compact {
  padding: 1px 7px 1px 1px;
  gap: 5px;
  font-size: 11px;
}
.ticker-chip--compact .ticker-chip-label {
  font-size: 11px;
}
.ticker-chip--compact .ticker-chip-price {
  font-size: 10.5px;
}

.ticker-chip:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent) !important;
  border-color: color-mix(in srgb, currentColor 18%, transparent) !important;
}
.ticker-chip:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}

/* Vertically centre-align the pill on the text baseline so it sits
   nicely inline in markdown prose without pushing the line height
   around. */
.ticker-chip {
  position: relative;
  top: -1px;
}
</style>
