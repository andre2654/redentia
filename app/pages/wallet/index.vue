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

        <!--
          Action header — two CTAs sit just below the hero so the user
          can either kick off a fresh raio-X (sends the chat the right
          intent message and force-MAX) OR wipe the entire portfolio
          (positions + analysis snapshot + chat memories) in one shot.
          The wipe is destructive so it requires a JS `confirm` step
          before firing the two parallel deletes.
        -->
        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-5 py-4"
          :style="actionBarStyle"
        >
          <div class="flex flex-col gap-0.5">
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >Ações da carteira</span>
            <span
              class="text-[12.5px]"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
            >
              {{ analysis
                ? `Última análise: ${generatedLabel}`
                : 'Você ainda não rodou um raio-X completo.' }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink
              :to="`/help?intent=${analysis ? 'reanalyze-portfolio' : 'analyze-portfolio'}`"
              class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 8px 18px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent)`,
              }"
            >
              <UIcon name="i-lucide-sparkles" class="size-4" />
              {{ analysis ? 'Atualizar raio-X' : 'Gerar raio-X' }}
            </NuxtLink>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[12.5px] font-medium transition-[background-color]"
              :style="{
                borderColor: `color-mix(in srgb, ${brand.colors.negative} 35%, transparent)`,
                color: brand.colors.negative,
                backgroundColor: 'transparent',
              }"
              :disabled="wiping"
              @click="onWipeClick"
            >
              <UIcon
                :name="wiping ? 'i-lucide-loader-2' : 'i-lucide-trash-2'"
                :class="['size-3.5', wiping && 'motion-safe:animate-spin']"
              />
              {{ wiping ? 'Limpando...' : 'Limpar carteira' }}
            </button>
          </div>
        </div>

        <MoleculesWalletMetricsGrid
          :total-value="totalValue"
          :pnl-pct="pnlPct"
          :vs-cdi-pct="null"
          :score="score"
          :dividend-forecast-12m="dividendForecast12m"
          :dividend-meta="dividendMeta"
          :benchmarks="benchmarksMini"
        />

        <!-- Snowflake — 5-axis radar collapsing the diagnosis into a
             single shape (SimplyWall.st-style). Only renders when an
             analysis snapshot exists; the action bar above already
             nudges the user to "Gerar raio-X" otherwise. -->
        <MoleculesWalletSnowflake
          v-if="snowflakeAxes.length"
          :axes="snowflakeAxes"
          :headline="snowflakeHeadline"
          :subline="snowflakeSubline"
        />

        <!-- Full raio-X surface (dimensions + diagnostic + thesis +
             stress + macro + alternatives). Hidden when no snapshot
             exists — the action bar above is enough CTA. -->
        <MoleculesWalletRaioXFull v-if="analysis" :analysis="analysis" />

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
const wiping = ref(false)
const positions = ref<UnifiedPosition[]>([])
const goals = ref<WalletGoal[]>([])
const watchlist = ref<WatchlistItem[]>([])
const analysis = ref<PortfolioAnalysis | null>(null)

const authStore = useAuthStore()

const emptyCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const actionBarStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

// Friendly timestamp shown next to the raio-X CTA so the user knows
// how fresh the analysis is. Falls back to empty string when the
// server didn't return a usable date.
const generatedLabel = computed(() => {
  const iso = analysis.value?.generated_at
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${date}, ${time}`
  } catch {
    return ''
  }
})

/**
 * Limpar carteira — destructive 2-step deletion:
 *   1. DELETE /api/portfolio   (Laravel: positions + analysis row)
 *   2. DELETE /api/chat/memories/portfolio  (chat-db: carteira_atual,
 *      carteira_atual_composicao, derived raio-x memories)
 *
 * Both run in parallel (Promise.allSettled) so a hiccup on one side
 * doesn't block the other from completing. After both resolve we
 * reload the page state — the empty state takes over once positions
 * is back to []. Confirmation is a plain `confirm()` for now;
 * upgrade to a styled modal once a Modal molecule lands.
 */
async function onWipeClick(): Promise<void> {
  const ok = window.confirm(
    'Tem certeza que quer apagar TODA a sua carteira?\n\n' +
      'Isso remove suas posições, o último raio-X salvo e o que a IA lembra ' +
      'sobre a carteira. Suas metas e watchlist NÃO são apagadas.\n\n' +
      'Pra ter de volta, importe a planilha do CEI no chat.',
  )
  if (!ok) return

  wiping.value = true
  try {
    const cfg = useRuntimeConfig()
    const apiBase = cfg.public.apiBaseUrl as string
    const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
    const chatBase = direct && import.meta.client ? direct : '/api/chat'
    const auth = authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}

    await Promise.allSettled([
      fetch(`${apiBase}/portfolio`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', ...auth },
      }),
      fetch(`${chatBase}/memories/portfolio`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', ...auth },
      }),
    ])

    // Reset the local state immediately so the empty branch renders
    // before the network reload finishes — the wipe feels instant.
    positions.value = []
    analysis.value = null
    await reload()
  } catch (err) {
    console.error('[wallet] wipe failed', err)
  } finally {
    wiping.value = false
  }
}

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

// Single source of truth for "the" score: prefer the AI snapshot
// when present (authoritative — same number rendered in the big
// gauge inside RaioXFull below). Falls back to the live heuristic
// from usePortfolioScore when the user hasn't run a raio-X yet, so
// the metric tile still shows something meaningful on a fresh
// import. Without this fallback the user would see "two scores"
// (live in the metrics grid, snapshot in the gauge) that disagreed.
const score = computed(() => analysis.value?.score ?? report.value?.score ?? 0)

// ============ Snowflake (5-axis radar) ============
// Collapses the 9 deterministic dimensions of the raio-x into the 5
// classic investor-radar axes: Valor / Futuro / Passado / Saúde /
// Dividendos. Mapping is intentional, not 1-to-1:
//   - Valor      ← `quality` (proxy for company-fundamental value)
//   - Futuro     ← `growth` (growth-sector exposure)
//   - Passado    ← `volatility` (defensiveness = solid past survival)
//   - Saúde      ← average(`diversification`, `concentration`, `macro`)
//                  (capacidade de aguentar tranco multi-frente)
//   - Dividendos ← `income` (DY ponderado)
// All inputs are 0-100 already (deterministic raio-x output), so no
// rescaling needed.
function dimByKey(key: string): { value: number; note: string } | null {
  const d = analysis.value?.dimensions?.find((x) => x.key === key)
  if (!d) return null
  return { value: d.value, note: d.note ?? '' }
}

const snowflakeAxes = computed(() => {
  // Hide the snowflake while there's no snapshot — caller already
  // gates on `analysis` so this just guards against transient nulls.
  if (!analysis.value?.dimensions?.length) return []
  const quality = dimByKey('quality')
  const growth = dimByKey('growth')
  const volatility = dimByKey('volatility')
  const income = dimByKey('income')
  const diversification = dimByKey('diversification')
  const concentration = dimByKey('concentration')
  const macro = dimByKey('macro')
  const healthInputs = [diversification, concentration, macro].filter(
    (x): x is { value: number; note: string } => x != null,
  )
  const healthAvg = healthInputs.length
    ? Math.round(healthInputs.reduce((s, x) => s + x.value, 0) / healthInputs.length)
    : 0
  return [
    { key: 'valor', label: 'Valor', value: quality?.value ?? 0, note: quality?.note },
    { key: 'futuro', label: 'Futuro', value: growth?.value ?? 0, note: growth?.note },
    { key: 'passado', label: 'Passado', value: volatility?.value ?? 0, note: volatility?.note },
    { key: 'saude', label: 'Saúde', value: healthAvg, note: 'Diversificação, concentração e macro combinados.' },
    { key: 'dividendos', label: 'Dividendos', value: income?.value ?? 0, note: income?.note },
  ]
})

const snowflakeHeadline = computed(() => {
  const axes = snowflakeAxes.value
  if (!axes.length) return 'Sua carteira em 5 eixos'
  const sorted = [...axes].sort((a, b) => b.value - a.value)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  if (!best || !worst) return 'Sua carteira em 5 eixos'
  // Hand-tuned headline — same pattern as SimplyWall's snowflake card.
  const labelMap: Record<string, string> = {
    valor: 'Valor sólido',
    futuro: 'Crescimento à frente',
    passado: 'Histórico defensivo',
    saude: 'Saúde robusta',
    dividendos: 'Renda passiva forte',
  }
  return labelMap[best.key] ?? 'Sua carteira em 5 eixos'
})

const snowflakeSubline = computed(() => {
  const axes = snowflakeAxes.value
  if (!axes.length) return ''
  const sorted = [...axes].sort((a, b) => b.value - a.value)
  const top = sorted[0]
  const bottom = sorted[sorted.length - 1]
  if (!top || !bottom) return ''
  return `Mais forte em ${top.label.toLowerCase()} (${Math.round(top.value)}). Mais fraco em ${bottom.label.toLowerCase()} (${Math.round(bottom.value)}). A área preenchida mostra o equilíbrio do conjunto.`
})

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

// Real upcoming events derived from data we actually have:
//   1. Dividend payment dates (top 5 from liveDividendCalendar)
//   2. Tesouro maturity dates from positions
//   3. (Earnings calendar would need a separate API — out of scope.)
//
// Each entry is filtered to ensure `date` is a valid ISO string,
// avoiding the "Invalid Date" issue that came from the score
// composable's relative-date strings ("hoje", "em 5 dias").
const upcomingEvents = computed(() => {
  const out: Array<{ date: string; label: string; kind: 'pay' | 'maturity' | 'rotate' }> = []

  // Dividend payments (top 5 closest)
  for (const d of liveDividendCalendar.value.slice(0, 5)) {
    if (!d.payment_date) continue
    out.push({
      date: d.payment_date,
      label: `Pagamento ${d.ticker}`,
      kind: 'pay',
    })
  }

  // Tesouro maturities — only those still in the future
  const todayIso = new Date().toISOString().slice(0, 10)
  for (const p of positions.value) {
    const m = (p as { maturity?: string }).maturity
    if (!m || typeof m !== 'string') continue
    const isoDate = m.slice(0, 10) // strip time component if present
    if (isoDate <= todayIso) continue
    out.push({
      date: isoDate,
      label: `Vencimento ${p.ticker}`,
      kind: 'maturity',
    })
  }

  // Sort by date asc, cap at 8 items.
  return out
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)
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
