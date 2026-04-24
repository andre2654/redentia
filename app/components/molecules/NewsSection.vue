<template>
  <section v-if="articles.length > 0" class="py-6">
    <header class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <div class="mb-1.5 flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
          <span class="inline-flex h-1.5 w-1.5 animate-pulse rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
          <span :style="{ color: brand.colors.primary }">[NEWS.FEED]</span>
          <span>·</span>
          <span>{{ sources.length }} FONTES</span>
          <span v-if="lastUpdated">·</span>
          <span v-if="lastUpdated">ATUALIZADO {{ lastUpdated }}</span>
        </div>
        <h2 class="text-2xl md:text-3xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
          Notícias do mercado
        </h2>
        <p class="mt-1 text-sm" :style="{ color: brand.colors.textMuted }">
          Principais manchetes de {{ sources.length }} portais financeiros, categorizadas por ticker automaticamente.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="group inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all"
          :style="{
            borderColor: onlyWithTickers ? brand.colors.primary : brand.colors.border,
            color: onlyWithTickers ? brand.colors.primary : brand.colors.text,
            backgroundColor: onlyWithTickers ? brand.colors.primary + '18' : 'transparent',
          }"
          @click="onlyWithTickers = !onlyWithTickers"
        >
          <span
            class="inline-flex h-3.5 w-6 items-center rounded-full border p-0.5 transition-colors"
            :style="{
              borderColor: onlyWithTickers ? brand.colors.primary : brand.colors.border,
              backgroundColor: onlyWithTickers ? brand.colors.primary : 'transparent',
            }"
          >
            <span
              class="block h-2.5 w-2.5 rounded-full transition-transform"
              :style="{
                backgroundColor: onlyWithTickers ? brand.colors.background : brand.colors.textMuted,
                transform: onlyWithTickers ? 'translateX(10px)' : 'translateX(0)',
              }"
            />
          </span>
          Só com ticker
        </button>

        <div
          v-if="activeTicker"
          class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tabular-nums"
          :style="{ borderColor: brand.colors.primary, color: brand.colors.primary, backgroundColor: brand.colors.primary + '15' }"
        >
          FILTRANDO {{ activeTicker }}
          <button
            type="button"
            class="cursor-pointer rounded-full p-0.5 hover:opacity-75"
            @click="activeTicker = null"
          >
            <UIcon name="i-lucide-x" class="size-3" />
          </button>
        </div>

        <span class="text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
          {{ filteredArticles.length }} / {{ articles.length }}
        </span>
      </div>
    </header>

    <div v-if="filteredArticles.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      <a
        v-for="item in filteredArticles.slice(0, displayLimit)"
        :key="item.id"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex flex-col overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:border-secondary/40"
        :style="{
          borderColor: brand.colors.border,
          backgroundColor: brand.colors.surface,
        }"
      >
        <div
          class="relative aspect-[16/10] overflow-hidden"
          :style="{ backgroundColor: brand.colors.inputBg }"
        >
          <img
            v-if="item.image_url && !failedImages[item.id]"
            :src="item.image_url"
            alt=""
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="failedImages[item.id] = true"
            @load="(e: Event) => { const t = e.target as HTMLImageElement; if (!t.naturalWidth || !t.naturalHeight) failedImages[item.id] = true }"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center"
            :style="{
              background: `linear-gradient(135deg, ${brand.colors.primary}18, ${brand.colors.surface})`,
            }"
          >
            <UIcon name="i-lucide-newspaper" class="size-12 opacity-25" :style="{ color: brand.colors.primary }" />
          </div>

          <span
            class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono-tab text-[9px] font-bold uppercase tracking-[0.15em] backdrop-blur-md"
            :style="{
              color: brand.colors.background,
              backgroundColor: brand.colors.primary,
            }"
          >
            {{ formatSource(item.source) }}
          </span>

          <span
            class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono-tab text-[9px] font-semibold uppercase tracking-[0.15em] backdrop-blur-md"
            :style="{
              color: brand.colors.text,
              backgroundColor: 'rgba(0,0,0,0.55)',
            }"
          >
            <UIcon name="i-lucide-clock" class="size-2.5" />
            {{ formatRelativeTime(item.published_at) }}
          </span>
        </div>

        <div class="flex flex-1 flex-col gap-3 p-4 md:p-5">
          <h3
            class="line-clamp-3 text-[15px] font-semibold leading-snug transition-colors group-hover:text-secondary md:text-base"
            :style="{ color: brand.colors.text }"
          >
            {{ item.title }}
          </h3>

          <p
            v-if="item.excerpt"
            class="line-clamp-2 text-[12.5px] leading-relaxed"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ item.excerpt }}
          </p>

          <div v-if="item.tickers.length > 0" class="mt-auto flex flex-wrap gap-1.5 pt-2">
            <button
              v-for="ticker in item.tickers.slice(0, 4)"
              :key="ticker"
              type="button"
              class="inline-flex cursor-pointer items-center rounded-md border px-1.5 py-0.5 font-mono-tab text-[10px] font-bold tracking-wider transition-colors hover:opacity-80"
              :style="{
                borderColor: activeTicker === ticker ? brand.colors.primary : brand.colors.border,
                color: activeTicker === ticker ? brand.colors.primary : brand.colors.text,
                backgroundColor: activeTicker === ticker ? brand.colors.primary + '18' : brand.colors.inputBg,
              }"
              @click.prevent.stop="toggleTicker(ticker)"
            >
              {{ ticker }}
            </button>
            <span
              v-if="item.tickers.length > 4"
              class="inline-flex items-center text-[10px] tabular-nums"
              :style="{ color: brand.colors.textMuted }"
            >
              +{{ item.tickers.length - 4 }}
            </span>
          </div>

          <div
            v-else
            class="mt-auto flex items-center justify-between border-t pt-3 text-[11px]"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          >
            <span class="inline-flex items-center gap-1.5">
              <UIcon name="i-lucide-tag" class="size-3 opacity-60" />
              Sem ticker associado
            </span>
            <span class="inline-flex items-center gap-1 opacity-70 transition-all group-hover:gap-1.5 group-hover:opacity-100">
              Ler
              <UIcon name="i-lucide-arrow-up-right" class="size-3" />
            </span>
          </div>
        </div>
      </a>
    </div>

    <div
      v-else
      class="rounded-2xl border p-10 text-center"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
    >
      <UIcon
        name="i-lucide-newspaper"
        class="mx-auto mb-3 size-8 opacity-30"
        :style="{ color: brand.colors.primary }"
      />
      <p class="text-sm" :style="{ color: brand.colors.textMuted }">
        <template v-if="activeTicker">
          Nenhuma notícia recente mencionando <span class="font-bold" :style="{ color: brand.colors.text }">{{ activeTicker }}</span>.
        </template>
        <template v-else-if="onlyWithTickers">
          Nenhuma das notícias mais recentes menciona tickers.
        </template>
        <template v-else>
          Nenhuma notícia disponível.
        </template>
      </p>
      <button
        v-if="activeTicker || onlyWithTickers"
        type="button"
        class="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-80"
        :style="{ color: brand.colors.primary }"
        @click="clearFilters"
      >
        <UIcon name="i-lucide-x" class="size-3" />
        Limpar filtros
      </button>
    </div>

    <div
      v-if="filteredArticles.length > displayLimit"
      class="mt-5 flex justify-center"
    >
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-[12px] font-semibold uppercase tracking-wider transition-colors hover:border-secondary/60"
        :style="{ borderColor: brand.colors.border, color: brand.colors.text, backgroundColor: brand.colors.surface }"
        @click="displayLimit += 9"
      >
        <UIcon name="i-lucide-plus" class="size-3.5" />
        Ver mais {{ Math.min(9, filteredArticles.length - displayLimit) }}
      </button>
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

const brand = useBrand()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBaseUrl as string

const activeTicker = ref<string | null>(null)
const onlyWithTickers = ref(false)
const displayLimit = ref(9)
const failedImages = reactive<Record<number, boolean>>({})

const { data, refresh } = await useAsyncData('news-latest-home', async () => {
  try {
    const resp = await $fetch<{ data: NewsArticle[] }>(`${apiBase}/news/latest`, {
      query: {
        limit: 60,
        ...(onlyWithTickers.value ? { with_tickers: 1 } : {}),
      },
    })
    return resp?.data ?? []
  } catch {
    return []
  }
}, { server: true, default: () => [], watch: [onlyWithTickers] })

const articles = computed<NewsArticle[]>(() => data.value ?? [])

const sources = computed(() => {
  const s = new Set(articles.value.map(a => a.source))
  return [...s]
})

const filteredArticles = computed(() => {
  let list = articles.value
  if (activeTicker.value) list = list.filter(a => a.tickers.includes(activeTicker.value!))
  return list
})

watch(onlyWithTickers, () => {
  displayLimit.value = 9
  activeTicker.value = null
  refresh()
})

const lastUpdated = computed(() => {
  if (articles.value.length === 0) return null
  return formatRelativeTime(articles.value[0].scraped_at).toUpperCase() + ' ATRÁS'
})

function toggleTicker(ticker: string) {
  activeTicker.value = activeTicker.value === ticker ? null : ticker
}

function clearFilters() {
  activeTicker.value = null
  onlyWithTickers.value = false
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
