<template>
  <section v-if="articles.length > 0" class="py-8">
    <header class="mb-5 flex items-center justify-between gap-4">
      <h2
        class="text-base font-semibold md:text-lg"
        :style="{ color: brand.colors.text }"
      >
        Últimas notícias
      </h2>
      <div class="flex items-center gap-3">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.18em] tabular-nums"
          :style="{ color: brand.colors.textMuted }"
        >
          {{ articles.length }} artigos · {{ sources.length }} fontes
        </span>
      </div>
    </header>

    <div
      class="rounded-2xl border p-4 md:p-6"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
    >
      <ul class="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        <li v-for="item in articles.slice(0, displayLimit)" :key="item.id">
          <a
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group block"
          >
            <div class="flex items-center gap-1.5">
              <span
                class="inline-flex size-4 shrink-0 items-center justify-center rounded-sm font-mono-tab text-[8px] font-black uppercase tracking-tight"
                :style="{
                  backgroundColor: sourceColor(item.source),
                  color: brand.colors.background,
                }"
              >
                {{ sourceInitials(item.source) }}
              </span>
              <span
                class="text-[12px] font-medium"
                :style="{ color: brand.colors.text }"
              >
                {{ formatSource(item.source) }}
              </span>
              <span class="opacity-50" :style="{ color: brand.colors.textMuted }">·</span>
              <span
                class="text-[12px] tabular-nums"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ formatRelativeTime(item.published_at) }}
              </span>
            </div>

            <h3
              class="news-title mt-1.5 text-[14px] font-medium leading-snug transition-colors group-hover:text-secondary md:text-[15px]"
              :style="{ color: brand.colors.text, fontFamily: 'Inter, system-ui, sans-serif' }"
            >
              {{ item.title }}
            </h3>
          </a>
        </li>
      </ul>

      <div
        v-if="articles.length > displayLimit"
        class="mt-5 flex items-center justify-between border-t pt-4"
        :style="{ borderColor: brand.colors.border }"
      >
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.18em] tabular-nums"
          :style="{ color: brand.colors.textMuted }"
        >
          Exibindo {{ Math.min(displayLimit, articles.length) }} de {{ articles.length }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-[12px] font-semibold transition-opacity hover:opacity-75"
          :style="{ color: brand.colors.primary }"
          @click="displayLimit += 10"
        >
          Ver mais
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
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

const props = defineProps<{ ticker: string }>()

const brand = useBrand()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBaseUrl as string

const displayLimit = ref(10)

const { data } = await useAsyncData(
  () => `news-ticker-${props.ticker}`,
  async () => {
    if (!props.ticker || !/^[A-Z]{4}\d{1,2}$/.test(props.ticker)) return []
    try {
      const resp = await $fetch<{ data: NewsArticle[] }>(`${apiBase}/news/ticker/${props.ticker}`, {
        query: { limit: 40 },
      })
      return resp?.data ?? []
    } catch {
      return []
    }
  },
  { server: true, default: () => [], watch: [() => props.ticker] },
)

const articles = computed<NewsArticle[]>(() => data.value ?? [])

const sources = computed(() => {
  const s = new Set(articles.value.map(a => a.source))
  return [...s]
})

/**
 * Brand-ish color per source — used as a tiny colored square next to
 * the source name (à la Yahoo Finance / Bloomberg Terminal where each
 * publisher has a recognizable mini-mark).
 */
function sourceColor(source: string): string {
  const map: Record<string, string> = {
    infomoney: '#E63946',        // InfoMoney red
    money_times: '#2A9D8F',      // teal
    seu_dinheiro: '#F4A261',     // orange
    brazil_journal: '#264653',   // dark blue-green
    suno: '#1D4ED8',             // blue
    valor_investe: '#8B0000',    // dark red (Valor wordmark)
    cnn_brasil: '#CC0000',       // CNN red
  }
  return map[source] ?? brand.colors.primary
}

function sourceInitials(source: string): string {
  const map: Record<string, string> = {
    infomoney: 'IM',
    money_times: 'MT',
    seu_dinheiro: 'SD',
    brazil_journal: 'BJ',
    suno: 'SN',
    valor_investe: 'VI',
    cnn_brasil: 'CN',
  }
  return map[source] ?? source.slice(0, 2).toUpperCase()
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
  const diffMin = Math.floor((Date.now() - published) / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}min atrás`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h atrás`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'ontem'
  if (diffDay < 7) return `${diffDay}d atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.news-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
