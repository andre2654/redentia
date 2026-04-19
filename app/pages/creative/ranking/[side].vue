<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true
})

type ApiSide = 'top' | 'bottom'
type Theme = 'positive' | 'negative'

import { REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'

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

const router = useRouter()
const previewControls = computed(() => [
  {
    id: 'limit',
    label: 'Quantidade',
    type: 'select' as const,
    param: 'limit',
    value: String(limit.value),
    options: [
      { label: '5 ativos', value: '5' },
      { label: '6 ativos', value: '6' },
      { label: '8 ativos', value: '8' },
      { label: '10 ativos', value: '10' },
    ],
  },
  { id: 'title', label: 'Título', type: 'text' as const, param: 'title', value: title.value },
  { id: 'label', label: 'Rótulo / data', type: 'text' as const, param: 'label', value: label.value },
])

function resetControls() {
  // keep the side param so the route still resolves
  router.replace({ query: {} })
}

// Hardcoded Redentia palette.
const positiveColor = computed(() => '#00D395')
const negativeColor = computed(() => '#FF4747')
const bgColor = computed(() => '#0A0B0E')
const accentColor = computed(() => theme.value === 'positive' ? positiveColor.value : negativeColor.value)
const textColor = computed(() => '#E8EAED')

const positiveGlow = computed(() => darkenHex(positiveColor.value, 0.3))
const negativeGlow = computed(() => darkenHex(negativeColor.value, 0.3))

const cardBackground = computed(() => {
  if (theme.value === 'positive') {
    return `radial-gradient(circle at 10% 85%, ${positiveGlow.value} 0%, ${bgColor.value} 60%)`
  }
  return `radial-gradient(circle at 90% 85%, ${negativeGlow.value} 0%, ${bgColor.value} 60%)`
})

const fontFamily = computed(() => `'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif`)

useHead(() => ({
  title: `${title.value} - ${theme.value === 'positive' ? 'Altas' : 'Baixas'}`,
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: [
    { rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF },
  ],
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
  return t ? t.toUpperCase() : '-'
}

function toChangePercent(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const { data: stocks, pending, error } = await useAsyncData<RankingStock[]>(
  'render-ranking',
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
  { server: true, default: () => [], watch: [apiSide, volume, limit] }
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
  <MoleculesCreativePreviewControls
    :creative-name="`RANKING · ${sideParam.toUpperCase()}`"
    :controls="previewControls"
    @reset="resetControls"
  >
  <!--
    `data-render-ready` só vira "true" depois que o useAsyncData terminou
    E o resultado tem pelo menos um stock. BrowserlessService espera por
    esse seletor quando `waitForSelector: '[data-render-ready="true"]'`,
    o que elimina screenshots tirados no meio do loading da tabela.
  -->
  <div
    class="frame"
    :class="theme"
    :data-render-ready="!pending && !error && stocks && stocks.length > 0 ? 'true' : 'false'"
  >
    <!-- Status bar -->
    <div class="statusbar">
      <span class="sbdot"></span>
      <span class="sbbrand">REDENT.IA</span>
      <span class="sbsep">·</span>
      <span>B3 · {{ theme === 'positive' ? 'TOP MOVERS' : 'BOTTOM MOVERS' }}</span>
      <div class="sbright">
        <span>ATUALIZADO</span>
        <span class="sbsep">·</span>
        <span class="sbstrong">{{ label }}</span>
      </div>
    </div>

    <!-- Headline -->
    <div class="headline">
      <div class="tag" :style="{ color: accentColor }">
        <span class="tagdot" :style="{ background: accentColor }"></span>
        [{{ theme === 'positive' ? 'ALTAS' : 'BAIXAS' }} · FECHAMENTO]
      </div>
      <h1 class="serif-display">Maiores <em>{{ theme === 'positive' ? 'altas' : 'baixas' }}</em><br>do dia.</h1>
      <div class="date-line">{{ label }}</div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <div class="table-header">
        <span>Ativo</span>
        <span>Rentabilidade %</span>
      </div>

      <div class="table-body">
        <div v-if="pending" class="empty">Carregando...</div>
        <div v-else-if="error" class="empty">Erro ao carregar dados.</div>

        <template v-else>
          <div
            v-for="(stock, idx) in stocks"
            :key="stock.ticker"
            class="row"
            :class="colorFor(stock.change_percent) === positiveColor ? 'up' : 'down'"
          >
            <span class="rank">{{ String(idx + 1).padStart(2, '0') }}</span>
            <img
              class="icon"
              :src="stock.logo || '/favicon.png'"
              :alt="stock.ticker"
              loading="eager"
            />
            <span class="sym">{{ stock.ticker }}</span>
            <span class="pct">{{ formatPercent(stock.change_percent) }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Footer -->
    <div class="rkfooter">
      <span class="fbrand">REDENT<span class="fdot">.IA</span></span>
      <span class="fsep">·</span>
      <span>DADOS B3</span>
      <span class="fsep">·</span>
      <span>{{ label.toUpperCase() }}</span>
      <span class="fright">redentia.com.br</span>
    </div>
  </div>
  </MoleculesCreativePreviewControls>
</template>

<style scoped>
/* See asset-spotlight.vue comment, :global() rules leak. */

* { box-sizing: border-box; }

.frame {
  width: 1080px; height: 1080px;
  position: relative; overflow: hidden;
  background: #0A0B0E; color: #E8EAED;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* Same ambient chrome as other creatives (grid + side glow + top amber glow) */
.frame::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(#E8EAED 1px, transparent 1px),
    linear-gradient(90deg, #E8EAED 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.035; pointer-events: none;
}
.frame.positive::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(245,166,35,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 15% 90%, rgba(0, 211, 149, 0.22) 0%, transparent 55%);
  pointer-events: none;
}
.frame.negative::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 50% -10%, rgba(245,166,35,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 90%, rgba(255, 71, 71, 0.22) 0%, transparent 55%);
  pointer-events: none;
}

/* Status bar */
.statusbar {
  position: absolute; top: 0; left: 0; right: 0; height: 46px;
  border-bottom: 1px solid #2A2E39;
  display: flex; align-items: center; gap: 12px;
  padding: 0 36px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  color: #8B92A7;
  background: rgba(10, 11, 14, 0.8);
  z-index: 3;
}
.sbdot { width: 6px; height: 6px; border-radius: 50%; background: #F5A623; box-shadow: 0 0 8px rgba(245,166,35,0.6); }
.sbbrand { color: #F5A623; font-weight: 600; letter-spacing: 0.2em; }
.sbsep { opacity: 0.4; }
.sbright { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.sbstrong { color: #E8EAED; font-weight: 500; }

/* Headline */
.headline {
  position: absolute; top: 108px; left: 72px; right: 72px;
  text-align: center;
}
.tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  margin-bottom: 14px;
}
.tagdot { width: 6px; height: 6px; border-radius: 50%; }
.serif-display {
  font-family: 'Instrument Serif', serif;
  font-size: 92px; line-height: 0.95; letter-spacing: -0.02em;
  font-weight: 400; color: #E8EAED;
}
.serif-display em { color: #F5A623; font-style: italic; }
.date-line {
  margin-top: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; letter-spacing: 0.22em; text-transform: uppercase;
  color: #8B92A7;
}

/* Table */
.table-wrap {
  position: absolute; top: 360px; left: 96px; right: 96px; bottom: 110px;
}
.table-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px 10px;
  border-bottom: 1px solid #2A2E39;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
  color: #8B92A7;
}
.table-body { display: flex; flex-direction: column; }
.row {
  display: flex; align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(42, 46, 57, 0.6);
  gap: 20px;
}
.row:last-child { border-bottom: none; }
.row .rank {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; font-weight: 500;
  color: #F5A623; letter-spacing: 0.15em;
  min-width: 28px;
}
.row .icon {
  width: 56px; height: 56px; border-radius: 50%;
  object-fit: cover;
  background: rgba(232, 234, 237, 0.05);
  border: 1px solid #2A2E39;
}
.row .sym {
  font-family: 'Inter', sans-serif;
  font-size: 32px; font-weight: 700; letter-spacing: 0.02em;
  color: #E8EAED;
  flex: 1 1 auto;
}
.row .pct {
  font-family: 'JetBrains Mono', monospace;
  font-size: 30px; font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
  min-width: 180px;
}
.row.up .pct { color: #00D395; }
.row.down .pct { color: #FF4747; }
.empty {
  text-align: center; padding: 40px 0;
  font-size: 20px; color: #8B92A7;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.15em; text-transform: uppercase;
}

/* Footer */
.rkfooter {
  position: absolute; bottom: 0; left: 0; right: 0; height: 44px;
  border-top: 1px solid #2A2E39;
  display: flex; align-items: center;
  padding: 0 36px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  color: #8B92A7;
  background: rgba(10, 11, 14, 0.8);
  z-index: 3;
}
.fbrand { color: #E8EAED; font-weight: 600; letter-spacing: 0.2em; }
.fbrand .fdot { color: #F5A623; }
.fsep { opacity: 0.4; margin: 0 12px; }
.fright { margin-left: auto; color: #F5A623; }
</style>
