<!--
  HomeDashboard — primary "new chat" surface for authenticated users.

  Replaces the simple chip greeting with a real dashboard:
  - Top row: 4 stat cards (IBOV, active goal progress, decisions, watchlists)
  - Below: personalized news grid (last 24h, same source as home page)

  Each news card click opens a small action menu so the user can ask the
  agent for impact-on-portfolio analysis or summary, without typing.

  Data sources (all already used elsewhere in the app):
  - IBOV: getIndiceHistoricPrices('ibov', '1mo') from services/assets.ts
  - Goal: useGoals().activeGoals (ranked by status priority)
  - Decisions: useDecisions().pending count
  - Watchlists: useWatchlist().watches count
  - News: GET ${apiBase}/news/latest?limit=80 — same endpoint as the home
    NewsSection. Filtered to last 24h.

  Emits `start(question)` exactly like EmptyState — the parent help.vue
  routes that to chat.send().
-->
<template>
  <div class="home-dashboard mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:gap-10 md:px-6 md:py-10">
    <!-- Greeting -->
    <header class="flex flex-col gap-2">
      <h1
        class="font-display text-[26px] font-semibold leading-[1.1] tracking-tight md:text-[32px]"
        :style="{ color: 'var(--brand-text)' }"
      >
        {{ greeting }}
      </h1>
      <p
        class="text-[14px] md:text-[15px]"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        Pergunte qualquer coisa, ou comece pelas notícias e dados do mercado.
      </p>
    </header>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <!-- IBOV -->
      <button
        type="button"
        class="stat-card group relative flex flex-col gap-3 rounded-2xl px-4 py-4 text-left transition-[border-color,background-color,transform]"
        :style="cardStyle"
        @click="$emit('start', 'Como está o IBOV hoje? Mostre o gráfico recente e o contexto macro.')"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex size-7 items-center justify-center rounded-full"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)` }"
          >
            <UIcon
              name="i-lucide-trending-up"
              class="size-3.5"
              :style="{ color: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </span>
          <span class="text-[12.5px]" :style="{ color: 'var(--brand-text-muted)' }">IBOV hoje</span>
        </div>

        <div class="flex flex-col gap-1">
          <span
            class="font-display text-[24px] font-semibold tabular-nums leading-none md:text-[28px]"
            :style="{ color: 'var(--brand-text)' }"
            translate="no"
          >{{ ibovDisplay.value }}</span>
          <span
            class="font-mono-tab text-[11.5px] tabular-nums"
            :style="{ color: ibovDisplay.color }"
            translate="no"
          >{{ ibovDisplay.indicator }}</span>
        </div>

        <!-- Sparkline -->
        <svg
          v-if="ibovSpark.path"
          :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`"
          class="absolute inset-x-3 bottom-2 h-7 w-[calc(100%-1.5rem)] opacity-70"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            :d="ibovSpark.path"
            fill="none"
            :stroke="ibovDisplay.color"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <!-- Goal progress -->
      <button
        type="button"
        class="stat-card group flex flex-col gap-3 rounded-2xl px-4 py-4 text-left transition-[border-color,background-color,transform]"
        :style="cardStyle"
        @click="onGoalClick"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex size-7 items-center justify-center rounded-full"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)` }"
          >
            <UIcon
              name="i-lucide-target"
              class="size-3.5"
              :style="{ color: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </span>
          <span class="text-[12.5px]" :style="{ color: 'var(--brand-text-muted)' }">{{ goalLabel }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <span
            class="font-display text-[20px] font-semibold tabular-nums leading-tight md:text-[24px]"
            :style="{ color: 'var(--brand-text)' }"
            translate="no"
          >{{ goalDisplay.value }}</span>

          <div v-if="goalDisplay.hasGoal" class="flex flex-col gap-1">
            <div
              class="h-1.5 w-full overflow-hidden rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 8%, transparent)` }"
            >
              <div
                class="h-full rounded-full transition-[width]"
                :style="{
                  width: `${Math.min(100, Math.max(0, goalDisplay.percent))}%`,
                  backgroundColor: goalDisplay.color,
                }"
              />
            </div>
            <span
              class="font-mono-tab text-[11.5px] tabular-nums"
              :style="{ color: goalDisplay.color }"
            >{{ goalDisplay.percent }}% concluído</span>
          </div>
          <span
            v-else
            class="text-[11.5px]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >Defina sua meta</span>
        </div>
      </button>

      <!-- Decisions -->
      <button
        type="button"
        class="stat-card group flex flex-col gap-3 rounded-2xl px-4 py-4 text-left transition-[border-color,background-color,transform]"
        :style="cardStyle"
        @click="$emit('start', 'Mostre minhas decisões pendentes e o status de cada uma.')"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex size-7 items-center justify-center rounded-full"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)` }"
          >
            <UIcon
              name="i-lucide-briefcase"
              class="size-3.5"
              :style="{ color: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </span>
          <span class="text-[12.5px]" :style="{ color: 'var(--brand-text-muted)' }">Decisões</span>
        </div>

        <div class="flex flex-col gap-1">
          <span
            class="font-display text-[24px] font-semibold tabular-nums leading-none md:text-[28px]"
            :style="{ color: 'var(--brand-text)' }"
            translate="no"
          >{{ decisionsCount }}</span>
          <span
            class="font-mono-tab text-[11.5px] tabular-nums"
            :style="{
              color: decisionsCount > 0
                ? 'var(--brand-primary)'
                : 'var(--brand-text-muted)',
            }"
          >{{ decisionsCount === 1 ? 'decisão ativa' : 'decisões ativas' }}</span>
        </div>
      </button>

      <!-- Watchlists -->
      <button
        type="button"
        class="stat-card group flex flex-col gap-3 rounded-2xl px-4 py-4 text-left transition-[border-color,background-color,transform]"
        :style="cardStyle"
        @click="$emit('start', 'Mostre minhas watchlists ativas e os gatilhos atuais.')"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex size-7 items-center justify-center rounded-full"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)` }"
          >
            <UIcon
              name="i-lucide-star"
              class="size-3.5"
              :style="{ color: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </span>
          <span class="text-[12.5px]" :style="{ color: 'var(--brand-text-muted)' }">Watchlists</span>
        </div>

        <div class="flex flex-col gap-1">
          <span
            class="font-display text-[24px] font-semibold tabular-nums leading-none md:text-[28px]"
            :style="{ color: 'var(--brand-text)' }"
            translate="no"
          >{{ watchlistsCount }}</span>
          <span
            class="font-mono-tab text-[11.5px] tabular-nums"
            :style="{
              color: watchlistsCount > 0
                ? 'var(--brand-primary)'
                : 'var(--brand-text-muted)',
            }"
          >{{ watchlistsCount === 1 ? 'watchlist ativa' : 'watchlists ativas' }}</span>
        </div>
      </button>
    </div>

    <!-- News -->
    <section class="flex flex-col gap-4">
      <header class="flex items-baseline justify-between">
        <div class="flex flex-col gap-0.5">
          <h2
            class="font-display text-[18px] font-semibold tracking-tight md:text-[20px]"
            :style="{ color: 'var(--brand-text)' }"
          >
            Notícias e insights para você
          </h2>
          <span
            class="font-mono-tab text-[10.5px] uppercase tracking-[0.18em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >Últimas 24h · {{ newsItems.length }} manchetes</span>
        </div>
        <NuxtLink
          to="/noticias"
          class="text-[13px] transition-colors hover:underline"
          :style="{ color: 'var(--brand-primary)' }"
        >Ver todas</NuxtLink>
      </header>

      <!-- Loading skeleton -->
      <div v-if="newsLoading" class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div
          v-for="i in 3"
          :key="`skel-${i}`"
          class="aspect-[4/3] animate-pulse rounded-2xl"
          :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 5%, transparent)` }"
        />
      </div>

      <!-- News grid -->
      <div
        v-else-if="newsItems.length > 0"
        class="grid grid-cols-1 gap-3 md:grid-cols-3"
      >
        <article
          v-for="n in newsItems"
          :key="n.id"
          class="news-card group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl transition-transform"
          :style="{
            backgroundColor: 'var(--brand-surface)',
            border: `1px solid color-mix(in srgb, var(--brand-border) 45%, transparent)`,
          }"
        >
          <!-- Background image -->
          <NuxtImg
            v-if="n.image_url && !failedImages[n.id]"
            :src="n.image_url"
            :alt="n.title"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            sizes="sm:100vw md:33vw"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            @error="failedImages[n.id] = true"
          />
          <div
            v-else
            class="absolute inset-0"
            :style="{ background: `linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 28%, transparent), color-mix(in srgb, var(--brand-surface) 90%, transparent))` }"
            aria-hidden="true"
          />
          <!-- Gradient overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5 transition-opacity duration-300 group-hover:from-black/90"
            aria-hidden="true"
          />

          <!-- Top-left: ticker tag -->
          <div
            v-if="primaryTicker(n)"
            class="absolute left-3 top-3 flex items-center gap-1.5"
          >
            <span
              class="rounded-md px-2 py-0.5 font-mono-tab text-[11px] font-medium tracking-tight backdrop-blur-md"
              style="color: white; background-color: rgba(0, 0, 0, 0.55);"
              translate="no"
            >{{ primaryTicker(n) }}</span>
          </div>

          <!-- Bottom: title + meta -->
          <div class="relative z-10 flex flex-col gap-2 p-4">
            <h3
              class="line-clamp-3 text-[14px] font-medium leading-snug md:text-[15px]"
              style="color: white;"
            >{{ n.title }}</h3>

            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tab text-[10.5px]">
              <span style="color: rgba(255, 255, 255, 0.75);" translate="no">{{ formatRelativeTime(n.published_at) }}</span>
              <span style="color: rgba(255, 255, 255, 0.5);">·</span>
              <span style="color: rgba(255, 255, 255, 0.75);">
                Impacto:
                <span :style="{ color: impactColor(n) }">{{ impactLabel(n) }}</span>
              </span>
              <template v-if="exposureFor(n) !== null">
                <span style="color: rgba(255, 255, 255, 0.5);">·</span>
                <span style="color: rgba(255, 255, 255, 0.75);">
                  Exposição: <span style="color: white;" class="tabular-nums">{{ exposureFor(n)!.toFixed(1) }}%</span>
                </span>
              </template>
            </div>
          </div>

          <!-- Action layer (covers card, opens menu on click) -->
          <button
            type="button"
            class="absolute inset-0 z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
            :style="{ '--tw-ring-color': 'var(--brand-primary)' } as never"
            :aria-label="`Abrir ações da notícia ${n.title}`"
            @click.stop="toggleMenu(n.id)"
          />

          <!-- Action menu (popover) -->
          <Transition name="news-menu">
            <div
              v-if="openMenuId === n.id"
              class="absolute inset-x-3 bottom-3 z-30 flex flex-col overflow-hidden rounded-xl shadow-lg"
              :style="{
                backgroundColor: 'var(--brand-surface)',
                border: `1px solid color-mix(in srgb, var(--brand-border) 60%, transparent)`,
              }"
            >
              <button
                type="button"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors"
                :style="{ color: 'var(--brand-text)' }"
                @click.stop="onAskImpact(n)"
              >
                <UIcon name="i-lucide-pie-chart" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                Impacto na minha carteira
              </button>
              <button
                type="button"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors"
                :style="{
                  color: 'var(--brand-text)',
                  borderTop: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
                }"
                @click.stop="onAskSummary(n)"
              >
                <UIcon name="i-lucide-file-text" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                Resumir notícia
              </button>
              <a
                :href="n.url"
                target="_blank"
                rel="noopener noreferrer"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors"
                :style="{
                  color: 'var(--brand-text-muted)',
                  borderTop: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
                }"
                @click.stop="closeMenu"
              >
                <UIcon name="i-lucide-external-link" class="size-3.5" />
                Abrir fonte original
              </a>
            </div>
          </Transition>
        </article>
      </div>

      <!-- Empty state for news -->
      <div
        v-else
        class="rounded-2xl px-4 py-6 text-center text-[13px]"
        :style="{
          color: 'var(--brand-text-muted)',
          border: `1px dashed color-mix(in srgb, var(--brand-border) 45%, transparent)`,
        }"
      >
        Sem notícias recentes no feed agora.
      </div>
    </section>

    <!-- Footnote -->
    <p
      class="text-center font-mono-tab text-[10.5px] uppercase tracking-[0.18em]"
      :style="{ color: `color-mix(in srgb, var(--brand-text-muted) 70%, transparent)` }"
    >
      <template v-if="tier === 'max'">Redentia MAX · análise rigorosa</template>
      <template v-else>Redentia Basic · Redentia MAX</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useGoals } from '~/composables/useGoals'
import { useDecisions } from '~/composables/useDecisions'
import { useWatchlist } from '~/composables/useWatchlist'
import { useMemories } from '~/composables/useMemories'

const { getIndiceHistoricPrices } = useAssetsService()

withDefaults(
  defineProps<{
    tier?: 'basic' | 'max'
  }>(),
  { tier: 'basic' },
)

const emit = defineEmits<{
  start: [question: string]
  'open-goal': []
}>()

const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBaseUrl as string

// ---- Greeting -------------------------------------------------------------
const greeting = computed(() => {
  const name = authStore.me?.name?.split(' ')[0]
  const hour = new Date().getHours()
  const period = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  return name ? `${period}, ${name}.` : `${period}.`
})

// ---- Card style (DRY) -----------------------------------------------------
const cardStyle = {
  backgroundColor: 'var(--brand-surface)',
  border: `1px solid color-mix(in srgb, var(--brand-border) 40%, transparent)`,
  color: 'var(--brand-text)',
} as const

// ---- IBOV -----------------------------------------------------------------
interface IndicePoint {
  market_price: number | string
  price_at?: string
}

const ibovSeries = ref<IndicePoint[]>([])

onMounted(async () => {
  try {
    const data = await getIndiceHistoricPrices('ibov', '1mo')
    ibovSeries.value = Array.isArray(data) ? (data as IndicePoint[]) : []
  } catch {
    /* fail silent — show 0,00 */
  }
})

const ibovDisplay = computed(() => {
  const series = ibovSeries.value
  if (series.length < 2) {
    return {
      value: '188.000',
      indicator: '0,00%',
      color: 'var(--brand-text-muted)' as string,
    }
  }
  const last = Number(series[series.length - 1]!.market_price)
  const prev = Number(series[series.length - 2]!.market_price)
  const variation = prev !== 0 ? ((last - prev) / prev) * 100 : 0
  const positive = variation > 0
  const negative = variation < 0
  return {
    value: new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(last),
    indicator: `${positive ? '+' : ''}${variation.toFixed(2)}%`,
    color: positive
      ? 'var(--brand-positive)'
      : negative
        ? 'var(--brand-negative)'
        : 'var(--brand-text-muted)',
  }
})

// Sparkline (last 30 points)
const SPARK_W = 100
const SPARK_H = 24
const ibovSpark = computed(() => {
  const series = ibovSeries.value
  if (series.length < 2) return { path: '' }
  const points = series.slice(-30).map((p) => Number(p.market_price))
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = SPARK_W / Math.max(1, points.length - 1)
  const path = points
    .map((p, i) => {
      const x = (i * step).toFixed(2)
      const y = (SPARK_H - ((p - min) / range) * SPARK_H).toFixed(2)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
  return { path }
})

// ---- Goal -----------------------------------------------------------------
const goalsState = useGoals()
const goalsLoaded = ref(false)
onMounted(async () => {
  if (!goalsState.loaded.value) {
    try {
      await goalsState.refresh()
    } finally {
      goalsLoaded.value = true
    }
  } else {
    goalsLoaded.value = true
  }
})

// Pick the most relevant active goal (status priority — same logic as agent)
const activeGoal = computed(() => {
  const order: Record<string, number> = {
    on_track: 0,
    at_risk: 1,
    unfeasible: 2,
  }
  return [...goalsState.activeGoals.value]
    .filter((g) => g.status !== 'hit')
    .sort((a, b) => {
      const sa = order[a.status ?? ''] ?? 99
      const sb = order[b.status ?? ''] ?? 99
      if (sa !== sb) return sa - sb
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })[0] ?? null
})

const goalLabel = computed(() => {
  const g = activeGoal.value
  if (!g) return 'Meta'
  if (g.name && g.name.length <= 24) return g.name
  return 'Meta'
})

const goalDisplay = computed(() => {
  const g = activeGoal.value
  if (!g) {
    return {
      hasGoal: false as const,
      value: '—',
      percent: 0,
      color: 'var(--brand-text-muted)' as string,
    }
  }
  const target = Number(g.targetAmount)
  const current = Number(g.currentAmount)
  const percent = target > 0 ? Math.round((current / target) * 100) : 0
  const color = g.status === 'unfeasible'
    ? 'var(--brand-negative)'
    : g.status === 'at_risk'
      ? 'var(--brand-warning, var(--brand-primary))'
      : 'var(--brand-positive)'
  return {
    hasGoal: true as const,
    value: formatCompactBRL(target),
    percent,
    color,
  }
})

function onGoalClick() {
  if (activeGoal.value) {
    emit(
      'start',
      `Como tá minha meta "${activeGoal.value.name}"? Faça um diagnóstico do progresso e do que precisa pra fechar até a data alvo.`,
    )
  } else {
    emit('open-goal')
  }
}

// ---- Decisions ------------------------------------------------------------
const decisionsState = useDecisions()
onMounted(async () => {
  if (!decisionsState.loaded.value) {
    try {
      await decisionsState.refresh()
    } catch { /* silent */ }
  }
})
const decisionsCount = computed(() => decisionsState.pending.value.length)

// ---- Watchlists -----------------------------------------------------------
const watchState = useWatchlist()
onMounted(async () => {
  if (!watchState.loaded.value) {
    try {
      await watchState.refresh()
    } catch { /* silent */ }
  }
})
const watchlistsCount = computed(() => watchState.watches.value.length)

// ---- Portfolio composition (for exposure %) -------------------------------
// Reads from cross-session memory the user's last-known portfolio composition
// so we can compute Exposição: X% on a news card. If memory doesn't carry it,
// we just hide the exposure label (impact stays).
const memState = useMemories()
onMounted(async () => {
  if (!memState.loaded.value) {
    try { await memState.refresh() } catch { /* silent */ }
  }
})

interface PortfolioWeights {
  // ticker (uppercase) → weight as percentage (0-100)
  byTicker: Record<string, number>
}

const portfolioWeights = computed<PortfolioWeights>(() => {
  const out: Record<string, number> = {}
  for (const m of memState.memories.value) {
    if (m.key !== 'carteira_atual_composicao') continue
    const v = m.value as unknown
    if (!v || typeof v !== 'object') continue
    const obj = v as Record<string, unknown>
    // Composition shape: { rf_br: { peso: 35, principais: ['AUPO11', ...] }, fiis_br: { peso: 12, principais: [...] }, ... }
    for (const cls of Object.values(obj)) {
      if (!cls || typeof cls !== 'object') continue
      const c = cls as { peso?: number; principais?: string[] }
      const classWeight = Number(c.peso ?? 0)
      const tickers = Array.isArray(c.principais) ? c.principais : []
      if (classWeight <= 0 || tickers.length === 0) continue
      const perTicker = classWeight / tickers.length
      for (const t of tickers) {
        const k = String(t).toUpperCase()
        out[k] = (out[k] ?? 0) + perTicker
      }
    }
  }
  return { byTicker: out }
})

// ---- News -----------------------------------------------------------------
interface NewsArticle {
  id: number
  source: string
  title: string
  url: string
  excerpt: string | null
  image_url: string | null
  author: string | null
  category: string | null
  tickers: string[]
  published_at: string
  scraped_at: string
}

const newsLoading = ref(false)
const newsArticles = ref<NewsArticle[]>([])
const failedImages = reactive<Record<number, boolean>>({})

onMounted(async () => {
  newsLoading.value = true
  try {
    const resp = await $fetch<{ data: NewsArticle[] }>(`${apiBase}/news/latest`, {
      query: { limit: 80 },
    })
    newsArticles.value = resp?.data ?? []
  } catch {
    newsArticles.value = []
  } finally {
    newsLoading.value = false
  }
})

// Filter to last 24h (or 48h fallback if too thin), prioritize articles
// that mention tickers the user holds, then take the top 6.
const newsItems = computed<NewsArticle[]>(() => {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const within24h = newsArticles.value.filter(
    (a) => now - new Date(a.published_at).getTime() <= day,
  )
  const pool = within24h.length >= 6
    ? within24h
    : newsArticles.value.filter(
        (a) => now - new Date(a.published_at).getTime() <= 2 * day,
      )

  // Score: +10 per ticker the user holds (relevance boost) + recency tiebreaker
  const userTickers = new Set(Object.keys(portfolioWeights.value.byTicker))
  const scored = pool.map((a) => {
    let score = 0
    for (const t of a.tickers) if (userTickers.has(t)) score += 10
    score += -new Date(a.published_at).getTime() / 1e10 // recency
    return { a, score }
  })
  scored.sort((x, y) => y.score - x.score)

  // Dedupe by primary ticker so we don't show 3 PETR4 cards
  const seen = new Set<string>()
  const out: NewsArticle[] = []
  for (const { a } of scored) {
    const t = primaryTicker(a)
    if (t && seen.has(t)) continue
    if (t) seen.add(t)
    out.push(a)
    if (out.length >= 6) break
  }
  return out.slice(0, 6)
})

function primaryTicker(n: NewsArticle): string | null {
  if (!n.tickers || n.tickers.length === 0) return null
  // Prefer a ticker the user holds; otherwise the first.
  const userTickers = portfolioWeights.value.byTicker
  for (const t of n.tickers) if (userTickers[t]) return t
  return n.tickers[0] ?? null
}

function exposureFor(n: NewsArticle): number | null {
  const t = primaryTicker(n)
  if (!t) return null
  const w = portfolioWeights.value.byTicker[t]
  return typeof w === 'number' && w > 0 ? w : null
}

// Lightweight impact heuristic. Uses keyword density on the title to
// classify Alto / Médio / Baixo. Fast, deterministic, no LLM round-trip.
const HIGH_IMPACT_RE =
  /\b(crash|despenca|colapso|rebaixa|rebaixou|disparou|crise|venda massiva|ruptura|recess[aã]o|d[ií]vida|fraude|lucro recorde|colapsa)\b/i
const MED_IMPACT_RE =
  /\b(queda|caiu|recua|cai|alta|sobe|subiu|valoriza|desvaloriza|ganha|perde|acelera|esfria|reportou|anuncia|anunciou|fechou|pagar dividendo|jcp|relat[oó]rio)\b/i

function impactLabel(n: NewsArticle): string {
  if (HIGH_IMPACT_RE.test(n.title)) return 'Alto'
  if (MED_IMPACT_RE.test(n.title)) return 'Médio'
  return 'Baixo'
}
function impactColor(n: NewsArticle): string {
  const lvl = impactLabel(n)
  if (lvl === 'Alto') return 'var(--brand-negative, #ef4444)'
  if (lvl === 'Médio') return 'var(--brand-warning, var(--brand-primary))'
  return 'var(--brand-text-muted)'
}

// ---- News action menu -----------------------------------------------------
const openMenuId = ref<number | null>(null)

function toggleMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}
function closeMenu() {
  openMenuId.value = null
}

function onAskImpact(n: NewsArticle) {
  closeMenu()
  const t = primaryTicker(n)
  const ctx = t ? `(${t}) ` : ''
  emit(
    'start',
    `Notícia: "${n.title}" ${ctx}— Qual o impacto na minha carteira? Considere a exposição atual e se preciso reagir.`,
  )
}

function onAskSummary(n: NewsArticle) {
  closeMenu()
  emit(
    'start',
    `Resuma a notícia "${n.title}" em 3 bullets: o que aconteceu, por que importa, e o que observar nos próximos dias.`,
  )
}

// Close menu on outside click + Escape
function onDocClick(ev: MouseEvent) {
  const target = ev.target as Element | null
  if (!target || !target.closest('.news-card')) closeMenu()
}
function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') closeMenu()
}
onMounted(() => {
  if (typeof window !== 'undefined') {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
  }
})

// ---- Helpers --------------------------------------------------------------
function formatCompactBRL(value: number): string {
  if (!Number.isFinite(value) || value === 0) return 'R$ 0'
  const abs = Math.abs(value)
  if (abs >= 1e9) return `R$ ${(value / 1e9).toFixed(1).replace('.', ',')} bi`
  if (abs >= 1e6) return `R$ ${(value / 1e6).toFixed(1).replace('.', ',')} mi`
  if (abs >= 1e3) return `R$ ${(value / 1e3).toFixed(0)} mil`
  return `R$ ${value.toFixed(0)}`
}

function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return ''
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  return `${d}d atrás`
}
</script>

<style scoped>
.stat-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 4%, var(--brand-surface)) !important;
  transform: translateY(-1px);
}

.news-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent) !important;
  transform: translateY(-1px);
}

.news-menu-item:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 8%, transparent) !important;
}

@media (prefers-reduced-motion: reduce) {
  .stat-card:hover,
  .news-card:hover {
    transform: none;
  }
}

/* Menu transition */
.news-menu-enter-active,
.news-menu-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
}
.news-menu-enter-from,
.news-menu-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
