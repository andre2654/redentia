<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true
})

type ApiSide = 'top' | 'bottom'
type Theme = 'positive' | 'negative'

const brand = useBrand()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function asFiniteNumber(value: unknown): number | undefined {
  const raw = firstString(value)
  if (!raw) return undefined
  const n = Number(raw)
  if (!Number.isFinite(n)) return undefined
  return n
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

// Opcional: se NUXT_N8N_RENDER_KEY estiver configurada, exige ?key=...
if (import.meta.server) {
  const requiredKey = (runtimeConfig as any).n8nRenderKey as string | undefined
  if (requiredKey) {
    const providedKey = firstString(route.query.key)
    if (providedKey !== requiredKey) {
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
  }
}

const sideParam = computed(() =>
  String(route.params.side || '').trim().toLowerCase()
)

const theme = computed<Theme>(() => {
  const v = sideParam.value
  if (v.startsWith('neg') || v === 'bottom' || v === 'down') return 'negative'
  if (v.startsWith('pos') || v === 'top' || v === 'up') return 'positive'
  return 'positive'
})

const apiSide = computed<ApiSide>(() =>
  theme.value === 'positive' ? 'top' : 'bottom'
)

const limit = computed(() => {
  const v = asFiniteNumber(route.query.limit) ?? 6
  return Math.max(1, Math.min(20, Math.floor(v)))
})

const volume = computed(() => {
  const v = asFiniteNumber(route.query.volume) ?? 1_000_000
  return Math.max(0, Math.floor(v))
})

function defaultLabel() {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date())
}

const title = computed(
  () => firstString(route.query.title) || 'Maiores Altas e Baixas'
)
const label = computed(() => firstString(route.query.label) || defaultLabel())

// Dynamic colors from brand
const positiveColor = computed(() => brand.colors.positive || '#69d167')
const negativeColor = computed(() => brand.colors.negative || '#ff4444')
const bgColor = computed(() => brand.colors.background || '#000000')
const textColor = computed(() => brand.colors.text || '#ffffff')

const positiveGlow = computed(() => darkenHex(positiveColor.value, 0.3))
const negativeGlow = computed(() => darkenHex(negativeColor.value, 0.3))

const cardBackground = computed(() => {
  if (theme.value === 'positive') {
    return `radial-gradient(circle at 10% 85%, ${positiveGlow.value} 0%, ${bgColor.value} 60%)`
  }
  return `radial-gradient(circle at 90% 85%, ${negativeGlow.value} 0%, ${bgColor.value} 60%)`
})

const fontFamily = computed(() => {
  const f = brand.font?.family || 'Sora'
  return `'${f}', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
})

useHead(() => ({
  title: `${title.value} - ${theme.value === 'positive' ? 'Altas' : 'Baixas'}`,
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: brand.font?.google ? [
    { rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?family=${brand.font.google}&display=swap` },
  ] : [],
}))

type RawTopStock = {
  ticker?: string
  stock?: string
  name?: string
  logo?: string
  change_percent?: number
}

type RankingStock = {
  ticker: string
  name?: string
  logo?: string
  change_percent: number | null
}

function safeLogoUrl(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined
  const value = url.trim()
  if (!value) return undefined
  if (value.startsWith('https://') || value.startsWith('http://')) return value
  return undefined
}

function coerceArray<T>(value: any): T[] {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && Array.isArray(value.data)) {
    return value.data
  }
  return []
}

function decodeBase64UrlToString(input: string): string | null {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    const padded = pad === 0 ? base64 : base64 + '='.repeat(4 - pad)
    return Buffer.from(padded, 'base64').toString('utf8')
  } catch {
    return null
  }
}

function toTicker(stock: RawTopStock): string {
  const t = (stock.ticker || stock.stock || '').toString().trim()
  return t ? t.toUpperCase() : '—'
}

function toChangePercent(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const { data: stocks, pending, error } = await useAsyncData<RankingStock[]>(
  `render-ranking-${apiSide.value}-${volume.value}-${limit.value}`,
  async () => {
    const inlineData = firstString(route.query.data)
    if (inlineData && import.meta.server) {
      const decoded = decodeBase64UrlToString(inlineData)
      if (decoded) {
        try {
          const parsed = JSON.parse(decoded)
          const arr = coerceArray<RawTopStock>(parsed)
          return arr.slice(0, limit.value).map((s) => ({
            ticker: toTicker(s),
            name: s.name,
            logo: safeLogoUrl(s.logo),
            change_percent: toChangePercent(s.change_percent),
          }))
        } catch {
          // falls through to fetch
        }
      }
    }

    const qs = new URLSearchParams({
      side: apiSide.value,
      volume: String(volume.value),
    })

    const apiBase = runtimeConfig.public.apiBaseUrl as string
    const resp = await $fetch(
      `${apiBase}/top-stocks?${qs.toString()}`,
      { method: 'GET' }
    )

    const arr = coerceArray<RawTopStock>(resp)
    return arr.slice(0, limit.value).map((s) => ({
      ticker: toTicker(s),
      name: s.name,
      logo: safeLogoUrl(s.logo),
      change_percent: toChangePercent(s.change_percent),
    }))
  },
  { server: true, default: () => [] }
)

function colorFor(changePercent: number | null): string {
  if (typeof changePercent === 'number' && changePercent >= 0) return positiveColor.value
  return negativeColor.value
}

function formatPercent(changePercent: number | null): string {
  if (typeof changePercent !== 'number') return '-'
  const sign = changePercent >= 0 ? '+' : ''
  const sep = sign ? ' ' : ''
  return `${sign}${sep}${changePercent.toFixed(2)} %`
}
</script>

<template>
  <div class="frame" :class="theme">
    <div
      class="card"
      :style="{
        background: cardBackground,
        fontFamily: fontFamily,
        color: textColor,
      }"
    >
      <h1 class="title">
        {{ title }}
        <span>{{ label }}</span>
      </h1>

      <div class="table-header" :style="{ borderColor: `rgba(${hexToRgb(textColor)}, 0.12)` }">
        <div class="table-header-inner">
          <div class="table-header-title">Ativo</div>
          <div class="table-header-return">Rentabilidade (%)</div>
        </div>
      </div>

      <div class="table-body">
        <div v-if="pending" class="loading">Carregando...</div>
        <div v-else-if="error" class="loading">Erro ao carregar dados.</div>

        <template v-else>
          <div
            v-for="stock in stocks"
            :key="stock.ticker"
            class="table-row"
            :style="{ borderBottomColor: `rgba(${hexToRgb(textColor)}, 0.2)` }"
          >
            <div class="table-row-left">
              <img
                class="asset-icon"
                :src="stock.logo || '/favicon.png'"
                :alt="stock.ticker"
                loading="eager"
                :style="{ background: `rgba(${hexToRgb(textColor)}, 0.06)` }"
              />
              <div class="asset-symbol">{{ stock.ticker }}</div>
            </div>

            <div
              class="asset-return"
              :style="{ color: colorFor(stock.change_percent) }"
            >
              {{ formatPercent(stock.change_percent) }}
            </div>
          </div>
        </template>
      </div>

      <div class="footer">
        <BrandLogo variant="full" class="logo-full" />

        <div class="brand-mark">
          <BrandLogo variant="icon" class="logo" />
          <div class="brand-text">{{ brand.domain }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(html),
:global(body),
:global(#__nuxt) {
  width: 1080px;
  height: 1080px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: var(--brand-background, #000);
}

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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 25px;
  overflow: hidden;
  position: relative;
}

.title {
  text-align: center;
  font-size: 50px;
  font-weight: 600;
  text-transform: uppercase;
  line-height: 75px;
  background: linear-gradient(90deg, currentColor 0%, currentColor 100%);
  -webkit-background-clip: text;
  background-clip: text;
  opacity: 0.95;
}

.title span {
  display: block;
  text-transform: none;
  opacity: 0.8;
}

.table-header {
  width: 883px;
  height: 80px;
  padding: 20px 50px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 2px solid rgba(255, 255, 255, 0.12);
  border-right: 2px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 10px 0px 7px rgba(255, 255, 255, 0.05),
    inset -10px 0px 7px 0px rgba(255, 255, 255, 0.05);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}

.table-header-inner {
  width: 100%;
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header-title {
  font-size: 30px;
  font-weight: 600;
}

.table-header-return {
  font-size: 25px;
  font-weight: 600;
}

.table-body {
  width: 729px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid;
  border-radius: 8px;
}

.table-row-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.asset-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}

.asset-symbol {
  font-size: 35px;
  font-weight: 600;
  text-align: center;
}

.asset-return {
  font-size: 35px;
  font-weight: 600;
  text-align: center;
}

.loading {
  padding: 30px 0;
  text-align: center;
  opacity: 0.8;
  font-size: 22px;
}

.footer {
  width: 881px;
  height: 85px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-full {
  height: 48px;
  width: auto;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 14px;
  opacity: 0.9;
}

.logo {
  height: 36px;
  width: 36px;
}

.brand-text {
  font-size: 18px;
  letter-spacing: 0.02em;
  opacity: 0.95;
}
</style>
