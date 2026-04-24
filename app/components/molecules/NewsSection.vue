<!--
  News digest bloco pro home do Redentia. Em vez de um grid uniforme de
  cards de notícias, agrupa as manchetes em duas camadas editoriais:
  (1) "Em alta" — tickers com mais cobertura no período, com 2-3 headlines
  por ticker em cards lado a lado; (2) "Outras manchetes" — lista compacta
  com as demais notícias (tickers com pouca cobertura + sem ticker
  associado). Quebra o padrão do grid homogêneo de blog e cria hierarquia.
-->
<template>
  <section v-if="articles.length > 0" class="py-6">
    <header class="mb-5 flex flex-col gap-1 px-4 md:px-0">
      <div class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
        <span class="inline-flex h-1.5 w-1.5 rounded-full motion-safe:animate-pulse" :style="{ backgroundColor: brand.colors.primary }" aria-hidden="true" />
        <span :style="{ color: brand.colors.primary }">Notícias</span>
        <span aria-hidden="true">·</span>
        <span>{{ sources.length }} FONTES</span>
        <span v-if="lastUpdated" aria-hidden="true">·</span>
        <span v-if="lastUpdated">ATUALIZADO {{ lastUpdated }}</span>
      </div>
      <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
        Notícias do mercado
      </h2>
      <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
        &gt; ÚLTIMAS 24H · {{ articles.length }} MANCHETES AGRUPADAS POR TICKER
      </p>
    </header>

    <!-- HOT CLUSTERS: tickers with most coverage -->
    <div v-if="hotClusters.length > 0" class="mb-8 px-4 md:px-0">
      <div class="grid gap-px" :style="{ backgroundColor: brand.colors.border }" :class="hotClustersGridClass">
        <article
          v-for="cluster in hotClusters"
          :key="`hot-${cluster.ticker}`"
          class="cluster-card flex flex-col overflow-hidden transition-transform duration-300"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <!-- Hero headline: full-bleed image on top with overlay -->
          <a
            v-if="cluster.articles[0]"
            :href="cluster.articles[0].url"
            target="_blank"
            rel="noopener noreferrer"
            class="hero-link group relative flex aspect-[16/10] items-end overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            <NuxtImg
              v-if="cluster.articles[0].image_url && !failedImages[cluster.articles[0].id]"
              :src="cluster.articles[0].image_url"
              alt=""
              role="presentation"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              sizes="sm:100vw md:50vw lg:33vw"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
              @error="failedImages[cluster.articles[0].id] = true"
            />
            <div
              v-else
              class="absolute inset-0"
              :style="{ background: `linear-gradient(135deg, ${brand.colors.primary}22, ${brand.colors.surface})` }"
              aria-hidden="true"
            />
            <!-- Gradient overlay for contrast; darker on hover -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5 transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/50" aria-hidden="true" />
            <!-- Accent glow border on hover -->
            <div
              class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              :style="{ boxShadow: `inset 0 0 0 2px ${brand.colors.primary}` }"
              aria-hidden="true"
            />

            <!-- Top-left: ticker + count pill -->
            <div class="absolute left-3 top-3 flex items-center gap-2">
              <span
                class="font-mono-tab text-xs font-bold tracking-wider backdrop-blur-md transition-colors"
                :style="{
                  color: brand.colors.text,
                  backgroundColor: `${brand.colors.background}CC`,
                  padding: '4px 8px',
                  borderRadius: '6px',
                }"
                translate="no"
              >
                {{ cluster.ticker }}
              </span>
              <span
                class="font-mono-tab text-[10px] font-bold uppercase tabular-nums tracking-[0.12em] backdrop-blur-md"
                :style="{
                  color: brand.colors.primary,
                  backgroundColor: `${brand.colors.background}CC`,
                  padding: '4px 8px',
                  borderRadius: '6px',
                }"
                translate="no"
              >
                {{ cluster.count }}
              </span>
            </div>

            <!-- Top-right: arrow indicator on hover -->
            <div
              class="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full opacity-0 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 group-hover:opacity-100"
              :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
            </div>

            <!-- Bottom: headline + time -->
            <div class="relative z-10 w-full p-4 transition-transform duration-300 group-hover:translate-y-[-2px]">
              <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-white">
                {{ cluster.articles[0].title }}
              </h3>
              <span class="mt-1 block font-mono-tab text-[10px] uppercase tracking-[0.12em] text-white/70" translate="no">
                {{ formatRelativeTime(cluster.articles[0].published_at) }}
              </span>
            </div>
          </a>

          <!-- Secondary headlines: 2 mini links without image -->
          <ul v-if="cluster.articles.length > 1" class="flex flex-col">
            <li
              v-for="item in cluster.articles.slice(1)"
              :key="`cl-${cluster.ticker}-${item.id}`"
              class="border-t"
              :style="{ borderColor: brand.colors.border }"
            >
              <a
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="secondary-link group flex items-center justify-between gap-3 px-4 py-2.5 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                :style="{ '--hover-bg': `${brand.colors.primary}10` } as Record<string, string>"
              >
                <h4
                  class="line-clamp-1 flex-1 text-xs leading-snug transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 group-hover:translate-x-1 group-hover:text-secondary"
                  :style="{ color: brand.colors.text }"
                >
                  {{ item.title }}
                </h4>
                <span
                  class="inline-flex shrink-0 items-center gap-1 font-mono-tab text-[10px] uppercase tabular-nums tracking-[0.12em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200"
                  :style="{ color: brand.colors.textMuted }"
                  translate="no"
                >
                  {{ formatRelativeTime(item.published_at) }}
                  <UIcon name="i-lucide-arrow-right" class="size-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true" />
                </span>
              </a>
            </li>
          </ul>
        </article>
      </div>
    </div>

    <!-- OTHERS: compact list with thumbnail for low-coverage + untagged -->
    <div v-if="otherArticles.length > 0" class="px-4 md:px-0">
      <div class="mb-3 flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
        <span :style="{ color: brand.colors.textMuted }">Outras</span>
        <span aria-hidden="true" :style="{ color: brand.colors.border }">·</span>
        <span :style="{ color: brand.colors.textMuted }">DEMAIS MANCHETES</span>
      </div>

      <ul class="grid gap-px" :style="{ backgroundColor: brand.colors.border }" :class="othersGridClass">
        <li v-for="item in visibleOthers" :key="`other-${item.id}`" :style="{ backgroundColor: brand.colors.surface }">
          <a
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="other-link group relative flex items-stretch gap-3 p-3 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            <div class="relative size-16 shrink-0 overflow-hidden rounded-md" :style="{ backgroundColor: brand.colors.border }">
              <NuxtImg
                v-if="item.image_url && !failedImages[item.id]"
                :src="item.image_url"
                alt=""
                role="presentation"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                width="64"
                height="64"
                class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                @error="failedImages[item.id] = true"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center"
                :style="{ background: `linear-gradient(135deg, ${brand.colors.primary}22, ${brand.colors.surface})` }"
                aria-hidden="true"
              >
                <UIcon name="i-lucide-newspaper" class="size-5 opacity-40" :style="{ color: brand.colors.primary }" />
              </div>
            </div>
            <div class="flex min-w-0 flex-1 flex-col justify-between">
              <h3
                class="line-clamp-2 text-xs leading-snug transition-colors group-hover:text-secondary"
                :style="{ color: brand.colors.text }"
              >
                {{ item.title }}
              </h3>
              <div class="mt-1 flex items-center justify-between gap-2 font-mono-tab text-[9px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                <span class="inline-flex items-center gap-2">
                  <span
                    v-if="item.tickers.length > 0"
                    class="font-bold"
                    :style="{ color: brand.colors.primary }"
                    translate="no"
                  >
                    {{ item.tickers[0] }}
                  </span>
                  <span v-if="item.tickers.length > 0" aria-hidden="true">·</span>
                  <span translate="no">{{ formatRelativeTime(item.published_at) }}</span>
                </span>
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="size-3 opacity-0 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                  :style="{ color: brand.colors.primary }"
                  aria-hidden="true"
                />
              </div>
            </div>
          </a>
        </li>
      </ul>

      <div v-if="otherArticles.length > othersLimit" class="mt-4 flex justify-center">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono-tab text-[10px] font-semibold uppercase tracking-[0.15em] transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          :style="{
            borderColor: brand.colors.border,
            color: brand.colors.text,
            backgroundColor: brand.colors.surface,
          }"
          @click="othersLimit += 6"
        >
          <UIcon name="i-lucide-plus" class="size-3" aria-hidden="true" />
          Ver mais {{ Math.min(6, otherArticles.length - othersLimit) }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface NewsArticle {
  id: number
  source: string
  url: string
  title: string
  excerpt: string | null
  image_url: string | null
  author: string | null
  category: string | null
  tickers: string[]
  published_at: string
  scraped_at: string
}

interface HotCluster {
  ticker: string
  count: number
  articles: NewsArticle[]
}

const brand = useBrand()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBaseUrl as string

const othersLimit = ref(6)
const failedImages = reactive<Record<number, boolean>>({})

const articles = ref<NewsArticle[]>([])

onMounted(async () => {
  try {
    const resp = await $fetch<{ data: NewsArticle[] }>(`${apiBase}/news/latest`, {
      query: { limit: 100 },
    })
    articles.value = resp?.data ?? []
  } catch {
    articles.value = []
  }
})

const sources = computed(() => [...new Set(articles.value.map((a: NewsArticle) => a.source))])

const lastUpdated = computed(() => {
  if (articles.value.length === 0) return null
  return `${formatRelativeTime(articles.value[0].scraped_at).toUpperCase()} ATRÁS`
})

// Keep only the last 24h (or 48h if volume is low)
const recentArticles = computed<NewsArticle[]>(() => {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const within24h = articles.value.filter((a) => now - new Date(a.published_at).getTime() <= day)
  if (within24h.length >= 20) return within24h
  // Fallback to 48h when the feed is thin
  return articles.value.filter((a) => now - new Date(a.published_at).getTime() <= 2 * day)
})

// Build hot clusters with each article assigned to a single ticker.
// Avoids showing the same headline under USIM5 AND USIM3 when both are
// mentioned — the article goes to the ticker with the highest total count,
// so secondary tickers naturally fall to the "others" section.
const newsDigest = computed<{ hot: HotCluster[]; others: NewsArticle[] }>(() => {
  // 1. Count mentions per ticker across all recent articles
  const counts = new Map<string, number>()
  for (const art of recentArticles.value) {
    for (const t of art.tickers) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }

  // 2. Decide the hot pool (≥3, fallback to ≥2)
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const primary = sorted.filter(([, c]) => c >= 3)
  const pool = primary.length >= 3 ? primary : sorted.filter(([, c]) => c >= 2)
  const maxClusters = 6
  const hotTickers = new Set(pool.slice(0, maxClusters).map(([t]) => t))

  // 3. Assign each article to its "primary" hot ticker (the one with the
  //    highest global count among this article's tickers).
  const assigned = new Map<string, NewsArticle[]>()
  const leftovers: NewsArticle[] = []

  for (const art of recentArticles.value) {
    let bestTicker: string | null = null
    let bestCount = -1
    for (const t of art.tickers) {
      if (!hotTickers.has(t)) continue
      const c = counts.get(t) ?? 0
      if (c > bestCount) {
        bestCount = c
        bestTicker = t
      }
    }
    if (bestTicker) {
      if (!assigned.has(bestTicker)) assigned.set(bestTicker, [])
      assigned.get(bestTicker)!.push(art)
    } else {
      leftovers.push(art)
    }
  }

  // 4. Build clusters (sorted by original count; max 3 headlines each)
  const hot: HotCluster[] = []
  for (const [ticker, c] of pool.slice(0, maxClusters)) {
    const related = (assigned.get(ticker) ?? []).sort(byPublishedDesc).slice(0, 3)
    if (related.length > 0) {
      hot.push({ ticker, count: c, articles: related })
    }
  }

  return { hot, others: leftovers.sort(byPublishedDesc) }
})

const hotClusters = computed<HotCluster[]>(() => newsDigest.value.hot)
const otherArticles = computed<NewsArticle[]>(() => newsDigest.value.others)

const visibleOthers = computed(() => otherArticles.value.slice(0, othersLimit.value))

const hotClustersGridClass = computed(() => {
  const n = hotClusters.value.length
  if (n === 1) return 'grid-cols-1'
  if (n === 2) return 'grid-cols-1 md:grid-cols-2'
  if (n === 3) return 'grid-cols-1 md:grid-cols-3'
  if (n === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
})

const othersGridClass = computed(() => 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')

function byPublishedDesc(a: NewsArticle, b: NewsArticle): number {
  return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
}

function formatSource(source: string): string {
  const map: Record<string, string> = {
    infomoney: 'InfoMoney',
    money_times: 'Money Times',
    seu_dinheiro: 'Seu Dinheiro',
    brazil_journal: 'Brazil Journal',
    suno: 'Suno',
    valor_investe: 'Valor Investe',
    cnn_brasil: 'CNN Brasil',
  }
  return map[source] ?? source
}

function formatRelativeTime(iso: string): string {
  const published = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - published
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h`

  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d`

  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.divide-y > li + li {
  border-top: 1px solid var(--divide-color, currentColor);
}

/* Cluster card: subtle lift on hover (child hero or secondary) */
.cluster-card:hover {
  transform: translateY(-2px);
}

/* Secondary link: soft background tint on hover */
.secondary-link:hover,
.secondary-link:focus-visible {
  background-color: var(--hover-bg, transparent);
}

/* Other card: lift + border glow on hover */
.other-link::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px transparent;
  transition: box-shadow 0.2s ease;
}
.other-link:hover::after,
.other-link:focus-visible::after {
  box-shadow: inset 0 0 0 1px var(--brand-primary, #f59e0b);
}
</style>
