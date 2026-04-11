<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true
})

import { REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function hexToRgb(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

function darkenHex(hex: string, factor: number): string {
  const c = hex.replace('#', '')
  const r = Math.round(parseInt(c.substring(0, 2), 16) * factor)
  const g = Math.round(parseInt(c.substring(2, 4), 16) * factor)
  const b = Math.round(parseInt(c.substring(4, 6), 16) * factor)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Auth key
if (import.meta.server) {
  const requiredKey = (runtimeConfig as any).n8nRenderKey as string | undefined
  if (requiredKey) {
    const providedKey = firstString(route.query.key)
    if (providedKey !== requiredKey) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
  }
}

const router = useRouter()
const ticker = computed(() => (firstString(route.query.ticker) || 'PETR4').toUpperCase())
const subtitle = computed(() => firstString(route.query.subtitle) || 'Destaque do dia')

const previewControls = computed(() => [
  {
    id: 'ticker',
    label: 'Ticker',
    type: 'text' as const,
    param: 'ticker',
    placeholder: 'PETR4',
    hint: 'Código da B3',
    value: ticker.value,
  },
  {
    id: 'subtitle',
    label: 'Subtítulo',
    type: 'text' as const,
    param: 'subtitle',
    placeholder: 'Destaque do dia',
    value: subtitle.value,
  },
])

function resetControls() {
  router.replace({ query: {} })
}

// Hardcoded Redentia palette — creatives are tenant-agnostic by
// design: they always render as the Redentia brand regardless of
// which tenant triggered the render. See utils/redentiaCreativeColors.ts.
const primaryColor = computed(() => '#F5A623')
const positiveColor = computed(() => '#00D395')
const negativeColor = computed(() => '#FF4747')
const bgColor = computed(() => '#0A0B0E')
const textColor = computed(() => '#E8EAED')
const primaryRgb = computed(() => hexToRgb(primaryColor.value))

const cardBackground = computed(() =>
  `radial-gradient(circle at 80% 20%, rgba(${primaryRgb.value}, 0.2) 0%, transparent 50%), ` +
  `radial-gradient(circle at 20% 80%, rgba(${primaryRgb.value}, 0.15) 0%, transparent 50%), ` +
  `${bgColor.value}`
)

const fontFamily = computed(() => {
  return `'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
})

useHead(() => ({
  title: `Redentia — ${ticker.value}`,
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: [
    { rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF },
  ],
}))

// Fetch real data
type TickerData = {
  ticker: string
  name: string
  logo: string | null
  type: string
  market_price: number | null
  change_percent: number | null
  price_at: string | null
  market_cap: number | null
}

type FundamentalsData = {
  key_statistics?: {
    pe_ratio?: number | null
    dividend_yield?: number | null
    price_to_book?: number | null
    return_on_equity?: number | null
    earnings_per_share?: number | null
  }
  financial_data?: {
    sector?: string | null
    industry_category?: string | null
  }
}

const apiBase = runtimeConfig.public.apiBaseUrl as string

const { data: tickerData } = await useAsyncData<TickerData | null>(
  `render-spotlight-ticker-${ticker.value}`,
  async () => {
    try {
      const resp = await $fetch(`${apiBase}/tickers/${ticker.value}`, { method: 'GET' })
      const d = (resp as any)?.data || resp
      return d as TickerData
    } catch {
      return null
    }
  },
  { server: true, default: () => null }
)

const { data: fundamentals } = await useAsyncData<FundamentalsData | null>(
  `render-spotlight-fundamentals-${ticker.value}`,
  async () => {
    try {
      const resp = await $fetch(`${apiBase}/fundamentals/${ticker.value}/overview`, { method: 'GET' })
      const d = (resp as any)?.data || resp
      return d as FundamentalsData
    } catch {
      return null
    }
  },
  { server: true, default: () => null }
)

// Computed display values
const displayName = computed(() => tickerData.value?.name || ticker.value)
const displayLogo = computed(() => tickerData.value?.logo || '/favicon.png')
const displayType = computed(() => {
  const t = tickerData.value?.type
  if (t === 'STOCK') return 'Ação'
  if (t === 'REIT') return 'FII'
  if (t === 'ETF') return 'ETF'
  if (t === 'BDR') return 'BDR'
  return 'Ativo'
})

// Backend returns numeric fields as strings ("6.184060"). Coerce
// with Number() before any arithmetic so .toFixed() doesn't blow up.
function num(v: unknown): number | null {
  if (v == null) return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

const price = computed(() => num(tickerData.value?.market_price))
const change = computed(() => num(tickerData.value?.change_percent))
const priceAt = computed(() => tickerData.value?.price_at || '')
const marketCap = computed(() => {
  const mc = num(tickerData.value?.market_cap)
  if (mc == null || mc === 0) return '-'
  if (mc >= 1e12) return `R$ ${(mc / 1e12).toFixed(1)}T`
  if (mc >= 1e9) return `R$ ${(mc / 1e9).toFixed(1)}B`
  if (mc >= 1e6) return `R$ ${(mc / 1e6).toFixed(0)}M`
  return `R$ ${mc.toLocaleString('pt-BR')}`
})

const pe = computed(() => {
  const v = num(fundamentals.value?.key_statistics?.pe_ratio)
  return v != null ? v.toFixed(1) : '-'
})
const dy = computed(() => {
  const v = num(fundamentals.value?.key_statistics?.dividend_yield)
  return v != null ? `${v.toFixed(2)}%` : '-'
})
const pb = computed(() => {
  const v = num(fundamentals.value?.key_statistics?.price_to_book)
  return v != null ? v.toFixed(2) : '-'
})
const roe = computed(() => {
  const v = num(fundamentals.value?.key_statistics?.return_on_equity)
  return v != null ? `${(v * 100).toFixed(1)}%` : '-'
})
const sector = computed(() => {
  return fundamentals.value?.financial_data?.sector ||
    fundamentals.value?.financial_data?.industry_category ||
    '-'
})

const changeColor = computed(() =>
  (change.value ?? 0) >= 0 ? positiveColor.value : negativeColor.value
)
const changeSign = computed(() =>
  (change.value ?? 0) > 0 ? '+' : ''
)
</script>

<template>
  <MoleculesCreativePreviewControls
    creative-name="ASSET SPOTLIGHT"
    :controls="previewControls"
    @reset="resetControls"
  >
  <div class="frame">
    <div
      class="card"
      :style="{
        background: cardBackground,
        fontFamily: fontFamily,
        color: textColor,
      }"
    >
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <img src="/brand/logo-icon.svg" alt="Redentia" class="brand-icon" />
          <span class="brand-name">REDENTIA</span>
        </div>
        <span class="header-right">REDENTIA.COM.BR</span>
      </div>

      <!-- Subtitle -->
      <div class="subtitle" :style="{ color: primaryColor }">{{ subtitle }}</div>

      <!-- Main Card -->
      <div
        class="spotlight-card"
        :style="{ borderColor: `rgba(${hexToRgb(textColor)}, 0.12)` }"
      >
        <!-- Ticker Identity -->
        <div class="ticker-row">
          <div class="ticker-left">
            <img
              :src="displayLogo"
              :alt="ticker"
              class="ticker-logo"
              :style="{ background: `rgba(${hexToRgb(textColor)}, 0.06)` }"
            />
            <div class="ticker-info">
              <div class="ticker-symbol">{{ ticker }}</div>
              <div class="ticker-name" :style="{ opacity: 0.7 }">{{ displayName }}</div>
            </div>
          </div>
          <div
            class="ticker-badge"
            :style="{ background: `rgba(${primaryRgb}, 0.15)`, color: primaryColor }"
          >
            {{ displayType }}
          </div>
        </div>

        <!-- Price Block -->
        <div class="price-block">
          <div class="price-value" v-if="price !== null">
            R$ {{ price.toFixed(2).replace('.', ',') }}
          </div>
          <div class="price-value" v-else>-</div>
          <div class="price-change" :style="{ color: changeColor }" v-if="change !== null">
            {{ changeSign }}{{ change.toFixed(2).replace('.', ',') }}%
          </div>
          <div class="price-date" :style="{ opacity: 0.5 }">{{ priceAt }}</div>
        </div>

        <!-- Divider -->
        <div class="divider" :style="{ background: `rgba(${hexToRgb(textColor)}, 0.1)` }" />

        <!-- Indicators Grid -->
        <div class="indicators">
          <div class="indicator">
            <div class="indicator-label" :style="{ opacity: 0.5 }">P/L</div>
            <div class="indicator-value">{{ pe }}</div>
          </div>
          <div class="indicator">
            <div class="indicator-label" :style="{ opacity: 0.5 }">Div. Yield</div>
            <div class="indicator-value" :style="{ color: positiveColor }">{{ dy }}</div>
          </div>
          <div class="indicator">
            <div class="indicator-label" :style="{ opacity: 0.5 }">P/VPA</div>
            <div class="indicator-value">{{ pb }}</div>
          </div>
          <div class="indicator">
            <div class="indicator-label" :style="{ opacity: 0.5 }">ROE</div>
            <div class="indicator-value">{{ roe }}</div>
          </div>
        </div>

        <!-- Divider -->
        <div class="divider" :style="{ background: `rgba(${hexToRgb(textColor)}, 0.1)` }" />

        <!-- Bottom row -->
        <div class="bottom-row">
          <div class="bottom-item">
            <div class="bottom-label" :style="{ opacity: 0.5 }">Setor</div>
            <div class="bottom-value">{{ sector }}</div>
          </div>
          <div class="bottom-item right">
            <div class="bottom-label" :style="{ opacity: 0.5 }">Valor de Mercado</div>
            <div class="bottom-value">{{ marketCap }}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <img src="/brand/logo-full.svg" alt="Redentia" class="footer-logo" />
        <div class="footer-brand">
          <img src="/brand/logo-icon.svg" alt="Redentia" class="footer-icon" />
          <span class="footer-text">redentia.com.br</span>
        </div>
      </div>
    </div>
  </div>
  </MoleculesCreativePreviewControls>
</template>

<style scoped>
/* NOTE: don't force html/body/#__nuxt to 1080x1080 globally — that
   rule leaks across the whole dev server (Vue SFC :global selectors
   are injected without cleanup) and breaks navigation between pages.
   The .frame below is already 1080x1080; for n8n Puppeteer captures
   the headless browser sets its viewport to 1080x1080 so the outer
   html/body sizing doesn't matter. For human preview we simply scroll. */

* {
  box-sizing: border-box;
}

.frame {
  width: 1080px;
  height: 1080px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  width: 1080px;
  height: 1080px;
  padding: 72px 80px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: relative;
  overflow: hidden;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon {
  width: 48px;
  height: 48px;
}

.brand-name {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.header-right {
  font-size: 28px;
  font-weight: 500;
  letter-spacing: 0.04em;
  opacity: 0.9;
}

/* Subtitle */
.subtitle {
  font-size: 32px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* Spotlight Card */
.spotlight-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 36px;
  border: 2px solid;
  border-radius: 32px;
  padding: 48px 56px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
}

/* Ticker Row */
.ticker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticker-left {
  display: flex;
  align-items: center;
  gap: 28px;
}

.ticker-logo {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  object-fit: cover;
}

.ticker-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticker-symbol {
  font-size: 52px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.ticker-name {
  font-size: 26px;
  font-weight: 400;
  max-width: 400px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticker-badge {
  padding: 10px 28px;
  border-radius: 50px;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Price Block */
.price-block {
  display: flex;
  align-items: baseline;
  gap: 24px;
  flex-wrap: wrap;
}

.price-value {
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.price-change {
  font-size: 42px;
  font-weight: 700;
}

.price-date {
  font-size: 24px;
  margin-left: auto;
}

/* Divider */
.divider {
  height: 2px;
  width: 100%;
}

/* Indicators */
.indicators {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.indicator {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.indicator-label {
  font-size: 22px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.indicator-value {
  font-size: 40px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Bottom Row */
.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.bottom-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bottom-item.right {
  text-align: right;
}

.bottom-label {
  font-size: 22px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.bottom-value {
  font-size: 32px;
  font-weight: 600;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-logo {
  height: 44px;
  width: auto;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.9;
}

.footer-icon {
  height: 32px;
  width: 32px;
}

.footer-text {
  font-size: 22px;
  letter-spacing: 0.02em;
  opacity: 0.95;
}
</style>
