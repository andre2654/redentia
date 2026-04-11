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
  return `${parseInt(c.substring(0, 2), 16)}, ${parseInt(c.substring(2, 4), 16)}, ${parseInt(c.substring(4, 6), 16)}`
}

function darkenHex(hex: string, factor: number): string {
  const c = hex.replace('#', '')
  const r = Math.round(parseInt(c.substring(0, 2), 16) * factor)
  const g = Math.round(parseInt(c.substring(2, 4), 16) * factor)
  const b = Math.round(parseInt(c.substring(4, 6), 16) * factor)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Auth
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
const tickerA = computed(() => (firstString(route.query.tickerA) || 'PETR4').toUpperCase())
const tickerB = computed(() => (firstString(route.query.tickerB) || 'VALE3').toUpperCase())
const subtitle = computed(() => firstString(route.query.subtitle) || 'Comparativo')

const previewControls = computed(() => [
  { id: 'tickerA', label: 'Ativo A', type: 'text' as const, param: 'tickerA', placeholder: 'PETR4', value: tickerA.value },
  { id: 'tickerB', label: 'Ativo B', type: 'text' as const, param: 'tickerB', placeholder: 'VALE3', value: tickerB.value },
  { id: 'subtitle', label: 'Subtítulo', type: 'text' as const, param: 'subtitle', placeholder: 'Comparativo', value: subtitle.value },
])

function resetControls() {
  router.replace({ query: {} })
}

// Hardcoded Redentia palette — creatives are tenant-agnostic by design.
const primaryColor = computed(() => '#F5A623')
const positiveColor = computed(() => '#00D395')
const negativeColor = computed(() => '#FF4747')
const bgColor = computed(() => '#0A0B0E')
const textColor = computed(() => '#E8EAED')
const primaryRgb = computed(() => hexToRgb(primaryColor.value))
const textRgb = computed(() => hexToRgb(textColor.value))

const cardBackground = computed(() =>
  `radial-gradient(circle at 50% 0%, rgba(${primaryRgb.value}, 0.12) 0%, transparent 50%), ${bgColor.value}`
)

const fontFamily = computed(() => `'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`)

useHead(() => ({
  title: `Redentia — ${tickerA.value} vs ${tickerB.value}`,
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: [
    { rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF },
  ],
}))

// Types
type TickerData = {
  ticker: string
  name: string
  logo: string | null
  type: string
  market_price: number | null
  change_percent: number | null
  market_cap: number | null
}

type FundamentalsData = {
  key_statistics?: {
    pe_ratio?: number | null
    dividend_yield?: number | null
    price_to_book?: number | null
    return_on_equity?: number | null
  }
  financial_data?: {
    sector?: string | null
  }
}

type AssetSide = {
  ticker: TickerData | null
  fundamentals: FundamentalsData | null
}

const apiBase = runtimeConfig.public.apiBaseUrl as string

async function fetchAsset(symbol: string): Promise<AssetSide> {
  const [tickerResp, fundResp] = await Promise.allSettled([
    $fetch(`${apiBase}/tickers/${symbol}`, { method: 'GET' }),
    $fetch(`${apiBase}/fundamentals/${symbol}/overview`, { method: 'GET' }),
  ])

  const ticker = tickerResp.status === 'fulfilled'
    ? ((tickerResp.value as any)?.data || tickerResp.value) as TickerData
    : null

  const fundamentals = fundResp.status === 'fulfilled'
    ? ((fundResp.value as any)?.data || fundResp.value) as FundamentalsData
    : null

  return { ticker, fundamentals }
}

const { data: assetA } = await useAsyncData<AssetSide>(
  'render-compare-a',
  () => fetchAsset(tickerA.value),
  { server: true, default: () => ({ ticker: null, fundamentals: null }), watch: [tickerA] }
)

const { data: assetB } = await useAsyncData<AssetSide>(
  'render-compare-b',
  () => fetchAsset(tickerB.value),
  { server: true, default: () => ({ ticker: null, fundamentals: null }), watch: [tickerB] }
)

// Helpers
// Backend returns numeric fields as strings — coerce to Number first
function num(v: unknown): number | null {
  if (v == null) return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function formatPrice(raw: unknown): string {
  const v = num(raw)
  if (v == null) return '-'
  return `R$ ${v.toFixed(2).replace('.', ',')}`
}

function formatChange(raw: unknown): string {
  const v = num(raw)
  if (v == null) return '-'
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(2).replace('.', ',')}%`
}

function changeColor(raw: unknown): string {
  const v = num(raw)
  if (v == null) return textColor.value
  return v >= 0 ? positiveColor.value : negativeColor.value
}

function formatPe(f: FundamentalsData | null): string {
  const v = num(f?.key_statistics?.pe_ratio)
  return v != null ? v.toFixed(1) : '-'
}

function formatDy(f: FundamentalsData | null): string {
  const v = num(f?.key_statistics?.dividend_yield)
  return v != null ? `${v.toFixed(2)}%` : '-'
}

function formatPb(f: FundamentalsData | null): string {
  const v = num(f?.key_statistics?.price_to_book)
  return v != null ? v.toFixed(2) : '-'
}

function formatRoe(f: FundamentalsData | null): string {
  const v = num(f?.key_statistics?.return_on_equity)
  return v != null ? `${(v * 100).toFixed(1)}%` : '-'
}

function formatCap(raw: unknown): string {
  const v = num(raw)
  if (v == null || v === 0) return '-'
  if (v >= 1e12) return `R$ ${(v / 1e12).toFixed(1)}T`
  if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(0)}M`
  return `R$ ${v.toLocaleString('pt-BR')}`
}

// Compare highlights: who wins each metric (both values coerced to Number)
function betterPe(a: FundamentalsData | null, b: FundamentalsData | null): 'a' | 'b' | null {
  const va = num(a?.key_statistics?.pe_ratio)
  const vb = num(b?.key_statistics?.pe_ratio)
  if (va == null || vb == null) return null
  if (va <= 0 && vb <= 0) return null
  if (va <= 0) return 'b'
  if (vb <= 0) return 'a'
  return va < vb ? 'a' : va > vb ? 'b' : null // lower P/E is better
}

function betterDy(a: FundamentalsData | null, b: FundamentalsData | null): 'a' | 'b' | null {
  const va = num(a?.key_statistics?.dividend_yield)
  const vb = num(b?.key_statistics?.dividend_yield)
  if (va == null || vb == null) return null
  return va > vb ? 'a' : va < vb ? 'b' : null // higher DY is better
}

function betterRoe(a: FundamentalsData | null, b: FundamentalsData | null): 'a' | 'b' | null {
  const va = num(a?.key_statistics?.return_on_equity)
  const vb = num(b?.key_statistics?.return_on_equity)
  if (va == null || vb == null) return null
  return va > vb ? 'a' : va < vb ? 'b' : null // higher ROE is better
}

const indicators = computed(() => [
  {
    label: 'P/L',
    a: formatPe(assetA.value.fundamentals),
    b: formatPe(assetB.value.fundamentals),
    winner: betterPe(assetA.value.fundamentals, assetB.value.fundamentals),
  },
  {
    label: 'Div. Yield',
    a: formatDy(assetA.value.fundamentals),
    b: formatDy(assetB.value.fundamentals),
    winner: betterDy(assetA.value.fundamentals, assetB.value.fundamentals),
  },
  {
    label: 'P/VPA',
    a: formatPb(assetA.value.fundamentals),
    b: formatPb(assetB.value.fundamentals),
    winner: null, // context-dependent
  },
  {
    label: 'ROE',
    a: formatRoe(assetA.value.fundamentals),
    b: formatRoe(assetB.value.fundamentals),
    winner: betterRoe(assetA.value.fundamentals, assetB.value.fundamentals),
  },
])
</script>

<template>
  <MoleculesCreativePreviewControls
    creative-name="ASSET COMPARE"
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
        <span class="header-label" :style="{ opacity: 0.8 }">REDENTIA.COM.BR</span>
      </div>

      <!-- Subtitle -->
      <div class="subtitle" :style="{ color: primaryColor }">{{ subtitle }}</div>

      <!-- VS Header: Logos + Tickers + Prices -->
      <div class="vs-header">
        <!-- Asset A -->
        <div class="vs-asset">
          <img
            :src="assetA.ticker?.logo || '/favicon.png'"
            :alt="tickerA"
            class="vs-logo"
            :style="{ background: `rgba(${textRgb}, 0.06)` }"
          />
          <div class="vs-ticker">{{ tickerA }}</div>
          <div class="vs-name" :style="{ opacity: 0.6 }">{{ assetA.ticker?.name || tickerA }}</div>
          <div class="vs-price">{{ formatPrice(assetA.ticker?.market_price) }}</div>
          <div class="vs-change" :style="{ color: changeColor(assetA.ticker?.change_percent) }">
            {{ formatChange(assetA.ticker?.change_percent) }}
          </div>
        </div>

        <!-- VS Badge -->
        <div class="vs-badge" :style="{ background: `rgba(${primaryRgb}, 0.15)`, color: primaryColor }">
          VS
        </div>

        <!-- Asset B -->
        <div class="vs-asset">
          <img
            :src="assetB.ticker?.logo || '/favicon.png'"
            :alt="tickerB"
            class="vs-logo"
            :style="{ background: `rgba(${textRgb}, 0.06)` }"
          />
          <div class="vs-ticker">{{ tickerB }}</div>
          <div class="vs-name" :style="{ opacity: 0.6 }">{{ assetB.ticker?.name || tickerB }}</div>
          <div class="vs-price">{{ formatPrice(assetB.ticker?.market_price) }}</div>
          <div class="vs-change" :style="{ color: changeColor(assetB.ticker?.change_percent) }">
            {{ formatChange(assetB.ticker?.change_percent) }}
          </div>
        </div>
      </div>

      <!-- Indicators Table -->
      <div class="indicators">
        <div
          v-for="ind in indicators"
          :key="ind.label"
          class="ind-row"
          :style="{ borderBottomColor: `rgba(${textRgb}, 0.08)` }"
        >
          <div
            class="ind-value left"
            :style="{
              color: ind.winner === 'a' ? positiveColor : textColor,
              opacity: ind.winner === 'b' ? 0.5 : 1,
            }"
          >
            {{ ind.a }}
            <span v-if="ind.winner === 'a'" class="winner-dot" :style="{ background: positiveColor }" />
          </div>
          <div class="ind-label" :style="{ opacity: 0.45 }">{{ ind.label }}</div>
          <div
            class="ind-value right"
            :style="{
              color: ind.winner === 'b' ? positiveColor : textColor,
              opacity: ind.winner === 'a' ? 0.5 : 1,
            }"
          >
            <span v-if="ind.winner === 'b'" class="winner-dot" :style="{ background: positiveColor }" />
            {{ ind.b }}
          </div>
        </div>
      </div>

      <!-- Market Cap Row -->
      <div class="cap-row" :style="{ borderTopColor: `rgba(${textRgb}, 0.08)` }">
        <div class="cap-side">
          <div class="cap-label" :style="{ opacity: 0.4 }">VALOR DE MERCADO</div>
          <div class="cap-value">{{ formatCap(assetA.ticker?.market_cap) }}</div>
        </div>
        <div class="cap-side right-align">
          <div class="cap-label" :style="{ opacity: 0.4 }">VALOR DE MERCADO</div>
          <div class="cap-value">{{ formatCap(assetB.ticker?.market_cap) }}</div>
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
/* See comment in asset-spotlight.vue — :global() rules leak across
   the dev server and break navigation. .frame below is already sized. */

* { box-sizing: border-box; }

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
  padding: 64px 72px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon { width: 42px; height: 42px; }

.brand-name {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.header-label {
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

/* Subtitle */
.subtitle {
  font-size: 28px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: 40px;
}

/* VS Header */
.vs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
}

.vs-asset {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.vs-logo {
  width: 110px;
  height: 110px;
  border-radius: 28px;
  object-fit: cover;
  margin-bottom: 8px;
}

.vs-ticker {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.vs-name {
  font-size: 22px;
  font-weight: 400;
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.vs-price {
  font-size: 38px;
  font-weight: 700;
  margin-top: 8px;
  font-variant-numeric: tabular-nums;
}

.vs-change {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.vs-badge {
  font-size: 36px;
  font-weight: 800;
  padding: 16px 28px;
  border-radius: 20px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

/* Indicators */
.indicators {
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  gap: 0;
}

.ind-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid;
}

.ind-row:last-child {
  border-bottom: none;
}

.ind-value {
  font-size: 36px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: opacity 0.2s;
}

.ind-value.left { justify-content: flex-start; }
.ind-value.right { justify-content: flex-end; }

.ind-label {
  font-size: 22px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  min-width: 180px;
}

.winner-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Market Cap */
.cap-row {
  display: flex;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid;
  margin-bottom: 32px;
}

.cap-side {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cap-side.right-align { text-align: right; }

.cap-label {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.cap-value {
  font-size: 30px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-logo { height: 40px; width: auto; }

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.85;
}

.footer-icon { height: 28px; width: 28px; }

.footer-text {
  font-size: 20px;
  letter-spacing: 0.02em;
}
</style>
