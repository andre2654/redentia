<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-8">
      <header class="flex flex-col gap-2">
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
          [DATA.HEALTH]
        </span>
        <h1 class="text-[32px] leading-tight md:text-[40px]" :style="{ color: C.text, fontFamily: F.display }">
          Saúde dos pipelines
        </h1>
        <p class="max-w-2xl text-[14px] leading-[1.6]" :style="{ color: C.textMuted }">
          Visão operacional do scraping de fundamentos, Tesouro Direto e news feed.
          Atualizado em {{ generatedAtLabel }}.
        </p>
        <button
          type="button"
          class="mt-1 w-fit border px-3 py-1 font-mono-tab text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-75"
          :style="{ borderColor: C.primary, color: C.primary }"
          :disabled="loading"
          @click="refresh()"
        >
          <UIcon :name="loading ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'" class="mr-1 h-3 w-3" :class="{ 'animate-spin': loading }" />
          ATUALIZAR
        </button>
      </header>

      <!-- Loading state -->
      <div v-if="loading && !data" class="flex items-center gap-2 text-[12px]" :style="{ color: C.textMuted }">
        <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
        Carregando dados...
      </div>

      <template v-else-if="data">
        <!-- Coverage by asset type -->
        <section>
          <h2 class="mb-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
            [SCRAPE.COVERAGE]
          </h2>
          <div
            class="grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-4"
            :style="{ borderColor: C.border, backgroundColor: C.border }"
          >
            <div
              v-for="(row, idx) in data.scrape.coverage"
              :key="row.type"
              class="flex flex-col gap-2 px-5 py-4"
              :style="{ backgroundColor: C.surface }"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  [{{ String(idx + 1).padStart(2, '0') }}]
                </span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: coverageColor(row.coverage_pct) }">
                  {{ row.coverage_pct !== null ? `${row.coverage_pct}%` : '-' }}
                </span>
              </div>
              <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: C.textMuted }">
                {{ row.type }}
              </span>
              <span class="text-[22px] font-semibold tabular-nums" :style="{ color: C.text }">
                {{ row.with_fundamentals }} / {{ row.total }}
              </span>
              <div class="flex items-center justify-between font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                <span>PREÇOS · {{ row.with_prices }}</span>
                <span>DIV · {{ row.with_dividends }}</span>
              </div>
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                ÚLT · {{ formatRelative(row.last_refresh) }}
              </span>
            </div>
          </div>
        </section>

        <!-- Tesouro Direto -->
        <section>
          <h2 class="mb-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
            [TESOURO.DIRETO]
          </h2>
          <div class="grid gap-6 lg:grid-cols-3">
            <div
              class="border p-5 lg:col-span-1"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                  TOTAL DE TÍTULOS
                </span>
              </div>
              <span class="mt-1 block text-[32px] font-semibold" :style="{ color: C.text }">
                {{ data.tesouro.summary.total }}
              </span>
              <div class="mt-3 flex items-center justify-between border-t pt-3 font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ borderColor: C.border, color: C.textMuted }">
                <span>INDEXADORES</span>
                <span :style="{ color: C.text }">{{ data.tesouro.summary.indexers }}</span>
              </div>
              <div class="mt-2 flex items-center justify-between font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                <span>ÚLT. REFRESH</span>
                <span :style="{ color: C.text }">{{ formatRelative(data.tesouro.summary.newest_refresh) }}</span>
              </div>
            </div>
            <div
              class="grid grid-cols-1 gap-px border sm:grid-cols-2 lg:col-span-2"
              :style="{ borderColor: C.border, backgroundColor: C.border }"
            >
              <div
                v-for="row in data.tesouro.by_indexer"
                :key="row.indexer ?? 'none'"
                class="flex flex-col gap-1 px-4 py-3"
                :style="{ backgroundColor: C.surface }"
              >
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  {{ row.indexer ?? '—' }}
                </span>
                <span class="font-mono-tab text-[11px] tabular-nums" :style="{ color: C.text }">
                  {{ row.total }} títulos
                </span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                  VENC {{ formatDate(row.earliest_maturity) }} → {{ formatDate(row.latest_maturity) }}
                </span>
              </div>
            </div>
          </div>
          <div
            class="mt-3 grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-5"
            :style="{ borderColor: C.border, backgroundColor: C.border }"
          >
            <div
              v-for="t in data.tesouro.samples"
              :key="t.slug"
              class="flex flex-col gap-1 px-4 py-3"
              :style="{ backgroundColor: C.surface }"
            >
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                {{ shortIndexer(t.indexer) }}
              </span>
              <span class="truncate text-[12px] font-semibold" :style="{ color: C.text }">
                {{ t.name }}
              </span>
              <span class="font-mono-tab text-[11px] tabular-nums" :style="{ color: C.textMuted }">
                {{ t.rate }}
              </span>
              <span class="font-mono-tab text-[11px] font-bold tabular-nums" :style="{ color: C.text }">
                {{ formatMoney(t.price_buy) }}
              </span>
            </div>
          </div>
        </section>

        <!-- Last scrape runs -->
        <section>
          <h2 class="mb-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
            [SCRAPE.LAST_RUNS]
          </h2>
          <div class="border overflow-hidden" :style="{ borderColor: C.border }">
            <table class="w-full font-mono-tab text-[11px]">
              <thead :style="{ backgroundColor: C.surface, color: C.textMuted }">
                <tr>
                  <th class="px-4 py-2 text-left font-normal uppercase tracking-[0.18em]">TICKER</th>
                  <th class="px-4 py-2 text-left font-normal uppercase tracking-[0.18em]">QUANDO</th>
                  <th class="px-4 py-2 text-right font-normal uppercase tracking-[0.18em]">DURAÇÃO</th>
                  <th class="px-4 py-2 text-right font-normal uppercase tracking-[0.18em]">SURFACES</th>
                  <th class="px-4 py-2 text-left font-normal uppercase tracking-[0.18em]">STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="run in data.scrape.last_runs"
                  :key="`${run.ticker}-${run.started_at}`"
                  class="border-t"
                  :style="{ borderColor: C.border, backgroundColor: C.surface }"
                >
                  <td class="px-4 py-2 font-bold" :style="{ color: C.text }">{{ run.ticker }}</td>
                  <td class="px-4 py-2" :style="{ color: C.textMuted }">{{ formatRelative(run.started_at) }}</td>
                  <td class="px-4 py-2 text-right tabular-nums" :style="{ color: C.textMuted }">{{ run.duration_ms }}ms</td>
                  <td class="px-4 py-2 text-right tabular-nums" :style="{ color: C.text }">{{ run.fields_hydrated }}</td>
                  <td class="px-4 py-2" :style="{ color: run.success ? C.positive : C.negative }">
                    {{ run.success ? '✓ OK' : '✗ FAIL' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- News feed -->
        <section>
          <h2 class="mb-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
            [NEWS.FEED]
          </h2>
          <div
            class="mb-3 grid grid-cols-2 gap-px border md:grid-cols-4"
            :style="{ borderColor: C.border, backgroundColor: C.border }"
          >
            <div class="flex flex-col gap-1 px-4 py-3" :style="{ backgroundColor: C.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">TOTAL</span>
              <span class="text-[22px] font-semibold tabular-nums" :style="{ color: C.text }">{{ data.news.totals.total }}</span>
            </div>
            <div class="flex flex-col gap-1 px-4 py-3" :style="{ backgroundColor: C.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">ÚLT. 24H</span>
              <span class="text-[22px] font-semibold tabular-nums" :style="{ color: C.text }">{{ data.news.totals.last_24h }}</span>
            </div>
            <div class="flex flex-col gap-1 px-4 py-3" :style="{ backgroundColor: C.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">ÚLT. 7D</span>
              <span class="text-[22px] font-semibold tabular-nums" :style="{ color: C.text }">{{ data.news.totals.last_7d }}</span>
            </div>
            <div class="flex flex-col gap-1 px-4 py-3" :style="{ backgroundColor: C.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">ÚLT. INGEST</span>
              <span class="font-mono-tab text-[13px] font-semibold" :style="{ color: C.text }">{{ formatRelative(data.news.totals.last_ingest) }}</span>
            </div>
          </div>

          <div class="grid gap-6 lg:grid-cols-3">
            <div
              class="flex flex-col gap-px border lg:col-span-1"
              :style="{ borderColor: C.border, backgroundColor: C.border }"
            >
              <div
                v-for="src in data.news.by_source"
                :key="src.source"
                class="flex items-center justify-between px-4 py-2"
                :style="{ backgroundColor: C.surface }"
              >
                <span class="font-mono-tab text-[11px]" :style="{ color: C.text }">{{ src.source }}</span>
                <div class="flex items-baseline gap-3">
                  <span class="font-mono-tab text-[11px] tabular-nums" :style="{ color: C.text }">{{ src.total }}</span>
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                    {{ formatRelative(src.latest_published) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-px border lg:col-span-2" :style="{ borderColor: C.border, backgroundColor: C.border }">
              <a
                v-for="headline in data.news.latest"
                :key="headline.id"
                :href="headline.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex flex-col gap-1 px-4 py-3 transition-opacity hover:opacity-80"
                :style="{ backgroundColor: C.surface }"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">{{ headline.source }}</span>
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                    {{ formatRelative(headline.published_at) }}
                  </span>
                </div>
                <span class="truncate text-[13px] font-semibold" :style="{ color: C.text }">{{ headline.title }}</span>
                <span v-if="headline.tickers && headline.tickers.length" class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                  {{ (headline.tickers as string[]).slice(0, 5).join(' · ') }}
                </span>
              </a>
            </div>
          </div>
        </section>

        <!-- Recent scrape samples -->
        <section>
          <h2 class="mb-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
            [SCRAPE.LAST_SAMPLES]
          </h2>
          <div
            class="grid grid-cols-1 gap-px border md:grid-cols-2 lg:grid-cols-5"
            :style="{ borderColor: C.border, backgroundColor: C.border }"
          >
            <NuxtLink
              v-for="sample in data.scrape.recent_samples"
              :key="sample.ticker"
              :to="`/asset/${sample.ticker.toLowerCase()}`"
              class="flex flex-col gap-1 px-4 py-3 transition-opacity hover:opacity-80"
              :style="{ backgroundColor: C.surface }"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  {{ (sample.asset_type ?? '?').toUpperCase() }}
                </span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                  {{ formatRelative(sample.refreshed_at) }}
                </span>
              </div>
              <span class="font-bold" :style="{ color: C.text }">{{ sample.ticker }}</span>
              <span class="truncate text-[11px]" :style="{ color: C.textMuted }">{{ sample.name }}</span>
              <span v-if="sample.price !== null" class="font-mono-tab text-[11px] font-bold tabular-nums" :style="{ color: C.text }">
                R$ {{ sample.price.toFixed(2) }}
              </span>
            </NuxtLink>
          </div>
        </section>
      </template>

      <div v-else class="text-[12px]" :style="{ color: C.textMuted }">
        Não foi possível carregar os dados.
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'

definePageMeta({ middleware: ['admin-panel'] })

interface CoverageRow {
  type: string
  total: number
  with_fundamentals: number
  with_prices: number
  with_dividends: number
  coverage_pct: number | null
  last_refresh: string | null
}

interface LastRun {
  ticker: string
  started_at: string
  duration_ms: number
  success: boolean
  fields_hydrated: number
  error_message: string | null
}

interface RecentSample {
  ticker: string
  asset_type: string | null
  name: string | null
  price: number | null
  refreshed_at: string | null
}

interface TesouroSummary {
  total: number
  indexers: number
  oldest_refresh: string | null
  newest_refresh: string | null
}

interface TesouroIndexer {
  indexer: string | null
  total: number
  earliest_maturity: string | null
  latest_maturity: string | null
}

interface TesouroSample {
  slug: string
  name: string
  indexer: string | null
  rate: string | null
  rate_numeric: number | null
  maturity_date: string | null
  price_buy: number | null
  refreshed_at: string | null
}

interface NewsBySource {
  source: string
  total: number
  latest_published: string | null
}

interface NewsHeadline {
  id: number
  title: string
  source: string
  url: string
  published_at: string | null
  tickers: string[] | null
}

interface DataHealthResponse {
  scrape: {
    coverage: CoverageRow[]
    last_runs: LastRun[]
    recent_samples: RecentSample[]
  }
  tesouro: {
    summary: TesouroSummary
    by_indexer: TesouroIndexer[]
    samples: TesouroSample[]
  }
  news: {
    totals: { total: number; last_24h: number; last_7d: number; last_ingest: string | null }
    by_source: NewsBySource[]
    latest: NewsHeadline[]
  }
  generated_at: string
}

const config = useRuntimeConfig()
const apiBase = config.public.apiBaseUrl as string

const data = ref<DataHealthResponse | null>(null)
const loading = ref(false)

async function refresh() {
  loading.value = true
  try {
    data.value = await $fetch<DataHealthResponse>(`${apiBase}/admin/data-health`, {
      credentials: 'include',
    })
  } catch (err) {
    console.error('data-health fetch failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

const generatedAtLabel = computed(() => {
  if (!data.value?.generated_at) return 'agora'
  return formatRelative(data.value.generated_at)
})

function coverageColor(pct: number | null): string {
  if (pct === null) return C.textMuted
  if (pct >= 95) return C.positive
  if (pct >= 80) return C.primary
  return C.negative
}

function shortIndexer(indexer: string | null): string {
  if (!indexer) return '—'
  const norm = indexer.toLowerCase()
  if (norm.includes('ipca')) return 'IPCA+'
  if (norm.includes('selic')) return 'SELIC'
  if (norm.includes('igpm') || norm.includes('igp-m')) return 'IGPM+'
  if (norm.includes('prefixado') || norm.includes('pré') || norm.includes('pre')) return 'PRÉ'
  return indexer.toUpperCase().slice(0, 8)
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const min = Math.round(diff / 60000)
    if (min < 1) return 'agora'
    if (min < 60) return `${min}m atrás`
    const hr = Math.round(min / 60)
    if (hr < 24) return `${hr}h atrás`
    const day = Math.round(hr / 24)
    if (day < 30) return `${day}d atrás`
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return String(iso)
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

function formatMoney(v: number | null): string {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v)
}
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
</style>
