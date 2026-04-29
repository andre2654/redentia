<!--
  /wallet — main authenticated wallet surface.

  Two states:
    1. EmptyState  — first visit / wallet wiped: hero + "Importar via chat"
                     CTA + 3 explainer cards. The legacy XLSX upload is GONE.
    2. Dashboard   — populated: hero + KPIs + allocation + positions +
                     goals/watchlist + dividend calendar + raio-x preview.

  Sub-components live under `~/components/molecules/wallet/*`. This file
  is the orchestrator: it fetches data once on mount + on `?refresh=1`,
  derives totals/sectors locally, and routes everything through props.

  Layout: `default` (the platform sidebar). Auth-guarded by the global
  middleware in `middleware/auth.global.ts`.
-->
<template>
  <NuxtLayout :title="brand.nav.wallet">
    <div :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }">
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <UIcon name="i-lucide-loader-2" class="size-8 motion-safe:animate-spin" :style="{ color: brand.colors.primary }" />
      </div>

      <!-- Empty state -->
      <template v-else-if="!positions.length">
        <div class="flex flex-col items-center gap-12 px-6 py-16">
          <header class="flex max-w-xl flex-col items-center gap-4 text-center">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >Carteira</span>
            <h1
              class="font-light"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(32px, 5vw, 44px)',
                lineHeight: 1.05,
                letterSpacing: '-1.2px',
              }"
            >Cadê seus ativos?</h1>
            <p
              class="max-w-md"
              :style="{
                fontSize: '17px',
                lineHeight: 1.55,
                color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
              }"
            >Importe sua carteira pelo chat e a gente faz o resto. Você fala, manda a planilha do CEI ou colado, a IA processa e popula tudo aqui.</p>

            <div class="mt-2 flex flex-wrap items-center justify-center gap-3">
              <NuxtLink
                to="/help?intent=import-portfolio"
                class="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[14px] font-medium"
                :style="{
                  backgroundColor: brand.colors.primary,
                  color: brand.colors.background,
                  boxShadow: `0 12px 24px -10px color-mix(in srgb, ${brand.colors.primary} 70%, transparent), 0 4px 10px -6px rgba(0,0,0,0.10)`,
                }"
              >
                <UIcon name="i-lucide-sparkles" class="size-4" />
                Importar via chat
                <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-80" />
              </NuxtLink>
              <NuxtLink
                to="/guias/como-baixar-cei"
                class="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-[14px] font-medium transition-[background-color]"
                :style="{
                  borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
                  color: brand.colors.text,
                }"
              >
                <UIcon name="i-lucide-help-circle" class="size-4" />
                Como baixar do CEI
              </NuxtLink>
            </div>
          </header>

          <section class="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
            <article
              v-for="card in afterImportCards"
              :key="card.title"
              class="flex flex-col gap-3 rounded-xl border p-5"
              :style="emptyCardStyle"
            >
              <span
                class="flex size-9 items-center justify-center rounded-lg"
                :style="{ backgroundColor: `color-mix(in srgb, ${card.tint} 14%, transparent)` }"
              >
                <UIcon :name="card.icon" class="size-5" :style="{ color: card.tint }" />
              </span>
              <span
                class="font-mono-tab text-[10.5px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.18em',
                  color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                }"
              >Depois do import</span>
              <h3
                class="text-[16px] font-medium"
                :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
              >{{ card.title }}</h3>
              <p
                class="text-[13px]"
                :style="{
                  lineHeight: 1.55,
                  color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
                }"
              >{{ card.body }}</p>
            </article>
          </section>

          <ul
            class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
          >
            <li class="flex items-center gap-2">
              <span class="size-1 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
              Dados criptografados
            </li>
            <li class="flex items-center gap-2">
              <span class="size-1 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
              Não compartilhamos com terceiros
            </li>
            <li class="flex items-center gap-2">
              <span class="size-1 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
              Análise sem viés comercial
            </li>
          </ul>
        </div>
      </template>

      <!-- Dashboard -->
      <div v-else class="flex flex-col gap-10 px-6 py-8">
        <MoleculesWalletHeroPatrimony
          :total-value="totalValue"
          :pnl-amount="pnlAmount"
          :pnl-pct="pnlPct"
          :positions-count="positions.length"
          :ytd-pct="null"
          :vs-cdi-pct="null"
          :refreshing="refreshing"
          @refresh="reload"
        />

        <MoleculesWalletMetricsGrid
          :total-value="totalValue"
          :pnl-pct="pnlPct"
          :vs-cdi-pct="null"
          :score="score"
          :dividend-forecast-12m="dividendForecast12m"
          :dividend-meta="dividendMeta"
          :benchmarks="benchmarksMini"
        />

        <MoleculesWalletAllocationSection
          :by-class="allocationByClass"
          :sectors="allocationBySector"
          :geography="geography"
        />

        <MoleculesWalletPositionsTable :positions="positions" :total-value="totalValue" />

        <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MoleculesWalletGoalsCard :goals="goals" />
          <MoleculesWalletWatchlistCard :items="watchlist" />
        </section>

        <MoleculesWalletDividendCalendarCard :events="dividendEvents" />

        <MoleculesWalletRaioXPreview
          :strengths="(report?.strengths || []).map((s) => ({ title: s.title, body: s.description || '' }))"
          :risks="(report?.risks || []).map((r) => ({ title: r.title, body: r.description || '' }))"
          :recommendations="(report?.alternatives || []).slice(0, 2).map((a) => ({ title: `Considerar ${a.toTicker}`, body: a.reason || '' }))"
          :analysis="analysis"
        />

        <MoleculesWalletEventsList :events="upcomingEvents" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { UnifiedPosition } from '~/services/portfolio'
import type { WalletGoal, WatchlistItem, PortfolioAnalysis } from '~/services/walletData'
import {
  analyzePortfolio,
  type PortfolioReport,
} from '~/composables/usePortfolioScore'

definePageMeta({ layout: 'default' })

usePageSeo({
  title: 'Minha Carteira',
  description: 'Carteira de investimentos',
  path: '/wallet',
  robots: 'noindex,nofollow',
})

const brand = useBrand()
const wallet = useWalletDataService()

const loading = ref(true)
const refreshing = ref(false)
const positions = ref<UnifiedPosition[]>([])
const goals = ref<WalletGoal[]>([])
const watchlist = ref<WatchlistItem[]>([])
const analysis = ref<PortfolioAnalysis | null>(null)

const emptyCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const afterImportCards = [
  {
    title: 'Raio-X completo da carteira',
    body: 'Score 0-100 em 9 dimensões: diversificação, qualidade, renda, hedge cambial, volatilidade, macro. Identifica riscos e oportunidades.',
    icon: 'i-lucide-radar',
    tint: '#fbbf24',
  },
  {
    title: 'Calendário de proventos vivo',
    body: 'Próximos pagamentos de dividendos, JCP e rendimentos com valor estimado. Total esperado nos próximos 12 meses.',
    icon: 'i-lucide-calendar-days',
    tint: '#34d399',
  },
  {
    title: 'Watchlist + metas integradas',
    body: 'Defina objetivos no chat (aposentadoria, reserva, casa) e veja o progresso aqui. Watchlist atualizada em tempo real.',
    icon: 'i-lucide-target',
    tint: '#a78bfa',
  },
] as const

// ============ Derived totals ============
const totalValue = computed(() =>
  positions.value.reduce((s, p) => s + (p.current_value ?? p.quantity * (p.current_price ?? p.average_price)), 0),
)
const totalCost = computed(() =>
  positions.value.reduce((s, p) => s + p.quantity * p.average_price, 0),
)
const pnlAmount = computed(() => (totalCost.value ? totalValue.value - totalCost.value : null))
const pnlPct = computed(() =>
  totalCost.value ? ((totalValue.value - totalCost.value) / totalCost.value) * 100 : null,
)

// ============ Allocation by class ============
const CLASS_LABELS: Record<string, { label: string; color: string }> = {
  STOCK: { label: 'Ações', color: '#fbbf24' },
  REIT: { label: 'FIIs', color: '#a78bfa' },
  ETF: { label: 'ETFs', color: '#34d399' },
  TREASURY: { label: 'Tesouro', color: '#10b981' },
  BDR: { label: 'BDR', color: '#60a5fa' },
  CRYPTO: { label: 'Cripto', color: '#f59e0b' },
}

const allocationByClass = computed(() => {
  if (!totalValue.value) return []
  const map = new Map<string, number>()
  for (const p of positions.value) {
    const k = (p.asset_class || 'OTHER') as string
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    map.set(k, (map.get(k) || 0) + v)
  }
  return [...map.entries()]
    .map(([k, value]) => ({
      label: CLASS_LABELS[k]?.label || k,
      color: CLASS_LABELS[k]?.color || brand.colors.primary,
      value,
      weight_pct: (value / totalValue.value) * 100,
    }))
    .sort((a, b) => b.value - a.value)
})

// Sector resolution falls back to asset class when CompanyProfile
// has no sector entry (typical for ETFs, FIIs without company data,
// and Treasury bonds). This way the donut + bars actually break the
// portfolio down instead of lumping everything into "Outros".
function resolveSector(p: { sector?: string | null; asset_class?: string; ticker: string }): string {
  if (p.sector && p.sector.trim().length > 0) return p.sector
  switch (p.asset_class) {
    case 'TREASURY': return 'Renda Fixa · Tesouro'
    case 'REIT': return 'FII · Sem classificação'
    case 'ETF': return 'ETF'
    case 'BDR': return 'BDR · Sem classificação'
    case 'CRYPTO': return 'Cripto'
  }
  return 'Outros'
}

const allocationBySector = computed(() => {
  if (!totalValue.value) return []
  const map = new Map<string, number>()
  for (const p of positions.value) {
    const sector = resolveSector(p)
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    map.set(sector, (map.get(sector) || 0) + v)
  }
  return [...map.entries()]
    .map(([sector, value]) => ({
      sector,
      value,
      weight_pct: (value / totalValue.value) * 100,
    }))
    .sort((a, b) => b.value - a.value)
})

// ============ Geography ============
const geography = computed(() => {
  if (!totalValue.value) return { brPct: 0, intlPct: 0, intlNote: '', note: '' }
  let intl = 0
  for (const p of positions.value) {
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    if (
      p.asset_class === 'BDR' ||
      p.ticker === 'IVVB11' ||
      p.ticker === 'GOLD11' ||
      p.ticker === 'BIIB39'
    ) {
      intl += v
    }
  }
  const intlPct = (intl / totalValue.value) * 100
  return {
    brPct: 100 - intlPct,
    intlPct,
    intlNote: intl ? 'BDR / GOLD11' : '',
    note: intlPct < 5
      ? 'Risco cambial alto: queda forte do real reduziria patrimônio. Considere IVVB11 ou BDRs pra hedge.'
      : '',
  }
})

// ============ usePortfolioScore (real) ============
const report = computed<PortfolioReport | null>(() => {
  if (!positions.value.length) return null
  // Map UnifiedPosition → PortfolioInput. Treasury tickers in our wallet
  // schema are already in plain-text form ("TESOURO IPCA+ 2032") which
  // the score engine handles via inferUnknownTicker fallback.
  const inputs = positions.value.map((p) => {
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    return { ticker: p.ticker, weight: v }
  })
  return analyzePortfolio(inputs, brand.colors.primary)
})

const score = computed(() => report.value?.score ?? 0)

const dividendForecast12m = computed(() => {
  if (!report.value) return 0
  // monthlyDividendsTotal is normalized per R$ 100k; scale to actual value.
  const ratio = totalValue.value / 100000
  return (report.value.monthlyDividendsTotal || 0) * 12 * ratio
})

const dividendMeta = computed(() => {
  if (!report.value) return ''
  return report.value.expectedReturnLabel || 'DY estimado'
})

const benchmarksMini = computed(() => {
  if (!report.value) return []
  return (report.value.benchmarks || [])
    .filter((b) => b.label.toLowerCase() !== 'sua carteira')
    .slice(0, 3)
    .map((b) => ({ label: b.label, return_12m_pct: b.expected || 0 }))
})

// Upcoming dividend events (next 60 days) — pulled live from the
// public `/api/dividends/upcoming` endpoint and filtered by the
// tickers the user actually holds. Falls back to an empty list on
// network failure (DividendCalendarCard handles that gracefully).
const liveDividendCalendar = ref<
  Array<{
    ticker: string
    name: string
    amount: number
    payment_date: string // ISO YYYY-MM-DD
    kind: 'Dividendo' | 'JCP' | 'Rendimento'
  }>
>([])

async function loadLiveDividendCalendar() {
  if (!positions.value || positions.value.length === 0) {
    liveDividendCalendar.value = []
    return
  }
  try {
    const assets = useAssetsService()
    const groups = await assets.getUpcomingDividends(60, 300)
    if (!Array.isArray(groups)) {
      liveDividendCalendar.value = []
      return
    }
    const userTickers = new Set(positions.value.map((p) => p.ticker.toUpperCase()))
    const events: typeof liveDividendCalendar.value = []
    for (const group of groups as Array<{ date: string; items: any[] }>) {
      const items = Array.isArray(group?.items) ? group.items : []
      for (const it of items) {
        const ticker = (it.ticker || '').toUpperCase()
        if (!userTickers.has(ticker)) continue
        const pos = positions.value.find((p) => p.ticker.toUpperCase() === ticker)
        const qty = pos?.quantity || 0
        const rate = Number(it.rate) || 0
        events.push({
          ticker,
          name: it.name || '',
          amount: rate * qty, // estimated total payout per holding
          payment_date: group.date,
          kind: classifyKind(it.label),
        })
      }
    }
    // Sort by date ascending; cap to 10 to keep the card concise.
    events.sort((a, b) => a.payment_date.localeCompare(b.payment_date))
    liveDividendCalendar.value = events.slice(0, 10)
  } catch {
    liveDividendCalendar.value = []
  }
}

function classifyKind(label: string | null | undefined): 'Dividendo' | 'JCP' | 'Rendimento' {
  const s = (label || '').toUpperCase()
  if (s.includes('JCP') || s.includes('JUROS')) return 'JCP'
  if (s.includes('REND') || s.includes('AMORT')) return 'Rendimento'
  return 'Dividendo'
}

const dividendEvents = computed(() => liveDividendCalendar.value)

const upcomingEvents = computed(() => {
  if (!report.value?.events) return []
  return report.value.events.slice(0, 8).map((e) => ({
    date: e.date,
    label: `${e.headline} (${e.ticker})`,
    kind: 'earnings' as const,
  }))
})

// ============ Loading ============
async function loadAll() {
  const [pos, gs, wl, snap] = await Promise.all([
    wallet.getPositions(),
    wallet.getGoals(),
    wallet.getWatchlist(),
    wallet.getPortfolioAnalysis(),
  ])
  positions.value = pos
  goals.value = gs
  watchlist.value = wl
  analysis.value = snap

  // Live dividend calendar depends on positions; fire after the
  // positions list is populated. Non-blocking — the rest of the
  // dashboard renders without waiting on it.
  void loadLiveDividendCalendar()
}

async function reload() {
  refreshing.value = true
  try {
    await loadAll()
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadAll()
  } finally {
    loading.value = false
  }
})

// MVP: refetch when navigating from /help?intent=import-portfolio
// (chat-service has already saved by the time we land here).
const route = useRoute()
watch(() => route.fullPath, async (path, prev) => {
  if (prev && prev.includes('/help') && path === '/wallet') {
    await reload()
  }
})
</script>
