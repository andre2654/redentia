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
      throw createError({ statusCode: 410, statusMessage: 'Gone' })
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

// Raw company names from the DB arrive padded with spaces and share-class
// suffixes (e.g. "ONCOCLINICASON      NM", "PETROBRAS PN      N2"). Collapse
// whitespace, drop the trailing listing-segment token, and Title Case the
// result so the card subtitle reads like a normal brand name.
function cleanCompanyName(raw: string | null | undefined): string {
  if (!raw) return ''
  const collapsed = raw.replace(/\s+/g, ' ').trim()
  // Drop the short segment suffix (NM, N1, N2, MA, MB, NM2, etc) — it's a
  // B3 listing tier, not part of the company name.
  const noSegment = collapsed.replace(/\s+(NM2?|N1|N2|MA|MB|DR3|M[AB])$/i, '')
  // Drop trailing share class (ON, PN, PNA, PNB, UNT) — we already show
  // the ticker next to it, so repeating it feels redundant.
  const noShareClass = noSegment.replace(/\s+(ON|PN[AB]?|UNT)$/i, '')
  const lower = noShareClass.toLowerCase()
  return lower
    .split(' ')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

// Stats shown above the leaderboard — computed from the same series
// so the caption never drifts from what the rows actually display.
const topPct = computed(() => {
  const list = stocks.value || []
  if (!list.length) return '—'
  const v = list[0]?.change_percent
  if (typeof v !== 'number') return '—'
  const sign = v >= 0 ? '+' : '−'
  return `${sign}${Math.abs(v).toFixed(2)}%`
})
const avgPct = computed(() => {
  const nums = (stocks.value || [])
    .map((s) => s.change_percent)
    .filter((n): n is number => typeof n === 'number')
  if (!nums.length) return '—'
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length
  const sign = avg >= 0 ? '+' : '−'
  return `${sign}${Math.abs(avg).toFixed(2)}%`
})
</script>

<template>
  <MoleculesCreativePreviewControls
    :creative-name="`RANKING · ${sideParam.toUpperCase()}`"
    :hero-title="sideParam === 'top' ? 'Ranking Top Altas do Dia' : 'Ranking Top Baixas do Dia'"
    :hero-description="sideParam === 'top' ? 'Card 1080×1080 com as maiores altas do pregão da B3, com logos, tickers, preços e variação. Atualizado em tempo real — tire print ao fim do pregão e poste.' : 'Card 1080×1080 com as maiores baixas do pregão da B3. Complementa o ranking de altas pra cobrir os dois lados do mercado em posts diários.'"
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
    <!-- Status bar (compact, high-contrast text). -->
    <div class="statusbar">
      <span class="sb-live">
        <span class="sb-dot"></span>
        <span>B3 · FECHAMENTO</span>
      </span>
      <div class="sb-right">
        <span class="sb-brand">REDENT<span class="sb-brand-accent">.IA</span></span>
      </div>
    </div>

    <!-- Hero: headline centralizado, a linha de baixo é a data do pregão. -->
    <div class="hero">
      <h1 class="hero-title">
        Maiores <em>{{ theme === 'positive' ? 'altas' : 'baixas' }}</em>
        <span class="hero-title-sub">{{ label }}</span>
      </h1>
    </div>

    <!-- Leaderboard — cards com fundo tingido pela cor do tema. -->
    <div class="board">
      <div v-if="pending" class="empty">Carregando...</div>
      <div v-else-if="error" class="empty">Erro ao carregar dados.</div>

      <template v-else>
        <div
          v-for="(stock, idx) in stocks"
          :key="stock.ticker"
          class="card"
          :class="[colorFor(stock.change_percent) === positiveColor ? 'up' : 'down', idx === 0 ? 'card-hero' : '']"
        >
          <span class="card-rank">{{ String(idx + 1).padStart(2, '0') }}</span>
          <div class="card-logo-wrap">
            <img
              class="card-logo"
              :src="stock.logo || '/favicon.png'"
              :alt="stock.ticker"
              loading="eager"
            />
          </div>
          <div class="card-ident">
            <span class="card-sym">{{ stock.ticker }}</span>
            <span v-if="stock.name" class="card-name">{{ cleanCompanyName(stock.name) }}</span>
          </div>
          <div class="card-pct">
            <span class="card-pct-sign">{{ stock.change_percent >= 0 ? '+' : '−' }}</span>
            <span class="card-pct-num">{{ Math.abs(stock.change_percent || 0).toFixed(2) }}</span>
            <span class="card-pct-unit">%</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Footer. -->
    <div class="rkfooter">
      <span class="ff-brand">REDENT<span class="ff-dot">.IA</span></span>
      <span class="ff-sep"></span>
      <span>Dados B3 em tempo real</span>
      <span class="ff-right">redentia.com.br</span>
    </div>
  </div>
  </MoleculesCreativePreviewControls>
</template>

<style scoped>
/* --- Redentia ranking creative (modern, high-contrast redesign) ---
   Large type, bold numbers, tinted row cards. Meant to grab attention
   on a social feed at thumbnail size.
*/

* { box-sizing: border-box; }

.frame {
  width: 1080px; height: 1080px;
  position: relative; overflow: hidden;
  background: #0A0B0E; color: #FFFFFF;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Ambient — strong side tint (green/red) + top amber glow. */
.frame::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  opacity: 1; pointer-events: none;
  z-index: 0;
}
.frame.positive::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 90% 10%, rgba(245,166,35,0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 5% 90%, rgba(0,211,149,0.35) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}
.frame.negative::after {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 10% 10%, rgba(245,166,35,0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 95% 90%, rgba(255,71,71,0.35) 0%, transparent 55%);
  pointer-events: none;
  z-index: 0;
}

/* Status bar — compact, high-contrast (white brand, muted right side). */
.statusbar {
  position: absolute; top: 0; left: 0; right: 0; height: 64px;
  display: flex; align-items: center;
  padding: 0 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 17px; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255,255,255,0.82);
  background: transparent;
  z-index: 3;
}
.sb-live { display: inline-flex; align-items: center; gap: 12px; font-weight: 600; }
.sb-dot { width: 10px; height: 10px; border-radius: 50%; background: #F5A623; box-shadow: 0 0 14px rgba(245,166,35,0.8); }
.sb-right { margin-left: auto; }
.sb-brand { color: #FFFFFF; font-weight: 700; letter-spacing: 0.2em; font-size: 19px; }
.sb-brand-accent { color: #F5A623; }

/* Hero area — headline centered, date as the subtitle line. */
.hero {
  position: absolute; top: 84px; left: 56px; right: 56px;
  text-align: center;
  z-index: 2;
}
.hero-title {
  font-family: 'Instrument Serif', serif;
  font-size: 128px; line-height: 0.92; letter-spacing: -0.03em;
  font-weight: 400; color: #FFFFFF;
  margin: 0;
}
.hero-title em { font-style: italic; }
/* Tail word is tinted by the ranking side — green for top movers,
   red for bottom movers. Keeps the accent coherent with the card tints
   below. */
.frame.positive .hero-title em { color: #00D395; }
.frame.negative .hero-title em { color: #FF4747; }
.hero-title-sub {
  display: block;
  margin-top: 28px;
  /* Inter Light tabular: modern fintech caption, loud letter-spacing
     so the date breathes and the digits align cleanly. */
  font-family: 'Inter', system-ui, sans-serif;
  font-style: normal;
  font-size: 38px; font-weight: 300;
  letter-spacing: 0.22em;
  text-transform: none;
  color: rgba(255,255,255,0.72);
  font-variant-numeric: tabular-nums;
}

/* Leaderboard — 6 rows, each a card with tinted bg and giant % on the right.
   Board starts right after the hero; bottom leaves room for the taller
   footer so the last row's shadow doesn't crowd the brand line. */
.board {
  position: absolute; top: 320px; left: 48px; right: 48px; bottom: 80px;
  display: flex; flex-direction: column;
  gap: 12px;
  z-index: 2;
}
.empty {
  flex: 1 1 auto;
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
.card {
  flex: 1 1 0; min-height: 0;
  display: flex; align-items: center;
  padding: 22px 32px 22px 28px;
  gap: 28px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(0,211,149,0.10), rgba(0,211,149,0.02));
  position: relative;
  overflow: hidden;
}
.card.down {
  background: linear-gradient(90deg, rgba(255,71,71,0.10), rgba(255,71,71,0.02));
}
.card-hero {
  border-color: rgba(0,211,149,0.45);
  background: linear-gradient(90deg, rgba(0,211,149,0.22), rgba(0,211,149,0.04));
  box-shadow: 0 20px 50px -30px rgba(0,211,149,0.6);
}
.card.down.card-hero {
  border-color: rgba(255,71,71,0.45);
  background: linear-gradient(90deg, rgba(255,71,71,0.22), rgba(255,71,71,0.04));
  box-shadow: 0 20px 50px -30px rgba(255,71,71,0.6);
}

.card-rank {
  font-family: 'JetBrains Mono', monospace;
  font-size: 46px; font-weight: 700;
  color: rgba(255,255,255,0.35);
  min-width: 76px;
  text-align: right;
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
}
.card-hero .card-rank { color: #F5A623; }
.card-logo-wrap {
  flex: 0 0 auto;
  width: 96px; height: 96px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.14);
  padding: 6px;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
}
.card-logo {
  width: 100%; height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
.card-ident {
  flex: 1 1 auto; min-width: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.card-sym {
  font-family: 'Inter', sans-serif;
  font-size: 50px; font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 0.01em;
  line-height: 1;
}
.card-hero .card-sym { font-size: 58px; }
.card-name {
  font-family: 'Inter', sans-serif;
  font-size: 22px; font-weight: 500;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
  text-transform: capitalize;
}

.card-pct {
  flex: 0 0 auto;
  display: flex; align-items: baseline;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.card-pct-sign {
  font-family: 'Inter', sans-serif;
  font-size: 50px; font-weight: 700;
  margin-right: 4px;
}
.card-pct-num {
  font-family: 'Inter', sans-serif;
  font-size: 72px; font-weight: 800;
  letter-spacing: -0.02em;
}
.card-hero .card-pct-num { font-size: 82px; }
.card-pct-unit {
  font-family: 'Inter', sans-serif;
  font-size: 32px; font-weight: 700;
  margin-left: 4px;
  opacity: 0.7;
}
.card.up .card-pct { color: #00D395; }
.card.down .card-pct { color: #FF4747; }

/* Footer — mono, high-contrast white brand. */
.rkfooter {
  position: absolute; bottom: 0; left: 0; right: 0; height: 64px;
  display: flex; align-items: center;
  padding: 0 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(255,255,255,0.62);
  z-index: 3;
}
.ff-brand { color: #FFFFFF; font-weight: 700; letter-spacing: 0.2em; font-size: 18px; }
.ff-brand .ff-dot { color: #F5A623; }
.ff-sep { display: inline-block; width: 14px; height: 1px; background: rgba(255,255,255,0.28); margin: 0 18px; }
.ff-right { margin-left: auto; color: #FFFFFF; font-weight: 600; font-size: 17px; }
</style>
