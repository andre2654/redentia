<!--
  News por ticker — bento layout alinhado ao NewsSection da home:
  1 hero card (imagem 16:10 + overlay com ticker + headline + tempo)
  2 headlines secundárias compactas (só título + tempo, sem imagem)
  grid 3-col de "outras" (thumb 64x64 + título 2 linhas + fonte/tempo mini)

  Substitui o antigo grid simples de 2 colunas com só texto por uma
  hierarquia editorial mais visual — mesmo padrão do NewsSection.
-->
<template>
  <section v-if="articles.length > 0" class="py-8">
    <header class="mb-5 flex flex-col gap-1">
      <div class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
        <span class="inline-flex h-1.5 w-1.5 rounded-full motion-safe:animate-pulse" :style="{ backgroundColor: brand.colors.primary }" aria-hidden="true" />
        <span :style="{ color: brand.colors.primary }" translate="no">{{ ticker }}</span>
        <span aria-hidden="true" :style="{ color: brand.colors.border }">·</span>
        <span :style="{ color: brand.colors.textMuted }">{{ articles.length }} MATÉRIAS · {{ sources.length }} FONTES</span>
      </div>
      <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
        Últimas notícias
      </h2>
    </header>

    <!-- Hero row: 3 featured articles side-by-side -->
    <div
      v-if="heroArticles.length > 0"
      class="mb-6 grid gap-4"
      :class="heroGridClass"
    >
      <article
        v-for="item in heroArticles"
        :key="`hero-${item.id}`"
        class="news-hero-card flex flex-col overflow-hidden rounded-xl border transition-transform duration-300"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      >
        <a
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="hero-link group relative flex aspect-[16/10] items-end overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
        >
          <NuxtImg
            v-if="item.image_url && !failedImages[item.id]"
            :src="item.image_url"
            alt=""
            role="presentation"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            sizes="sm:100vw md:50vw lg:33vw"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-110"
            @error="failedImages[item.id] = true"
          />
          <div
            v-else
            class="absolute inset-0"
            :style="{ background: `linear-gradient(135deg, ${brand.colors.primary}22, ${brand.colors.surface})` }"
            aria-hidden="true"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5 transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/50" aria-hidden="true" />
          <div
            class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            :style="{ boxShadow: `inset 0 0 0 2px ${brand.colors.primary}` }"
            aria-hidden="true"
          />

          <div class="absolute left-3 top-3 flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 font-mono-tab text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur-md"
              :style="{
                color: brand.colors.text,
                backgroundColor: `${brand.colors.background}CC`,
                padding: '4px 8px',
                borderRadius: '6px',
              }"
              translate="no"
            >
              <span
                class="inline-flex size-3 items-center justify-center rounded-[3px] font-mono-tab text-[7px] font-black"
                :style="{
                  backgroundColor: sourceColor(item.source),
                  color: brand.colors.background,
                }"
              >{{ sourceInitials(item.source) }}</span>
              {{ formatSource(item.source) }}
            </span>
          </div>

          <div
            class="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100"
            :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
            aria-hidden="true"
          >
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
          </div>

          <div class="relative z-10 w-full p-4 transition-transform duration-300 group-hover:translate-y-[-2px]">
            <h3 class="line-clamp-3 text-sm font-semibold leading-snug text-white">
              {{ item.title }}
            </h3>
            <span class="mt-1.5 block font-mono-tab text-[10px] uppercase tracking-[0.12em] text-white/70" translate="no">
              {{ formatRelativeTime(item.published_at) }}
            </span>
          </div>
        </a>
      </article>
    </div>

    <!-- Grid compacto de outras manchetes (thumb + título + meta) -->
    <div v-if="otherArticles.length > 0">
      <ul class="grid gap-px" :style="{ backgroundColor: brand.colors.border }" :class="othersGridClass">
        <li v-for="item in visibleOthers" :key="`other-${item.id}`" :style="{ backgroundColor: brand.colors.surface }">
          <a
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="other-link group relative flex items-stretch gap-3 p-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
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
                <span class="inline-flex items-center gap-1.5">
                  <span
                    class="inline-flex size-3 shrink-0 items-center justify-center rounded-[2px] font-mono-tab text-[7px] font-black"
                    :style="{
                      backgroundColor: sourceColor(item.source),
                      color: brand.colors.background,
                    }"
                  >{{ sourceInitials(item.source) }}</span>
                  <span translate="no">{{ formatSource(item.source) }}</span>
                </span>
                <span translate="no">{{ formatRelativeTime(item.published_at) }}</span>
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
import { computed, reactive, ref } from 'vue'

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

const othersLimit = ref(6)
const failedImages = reactive<Record<number, boolean>>({})

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

const sources = computed(() => [...new Set(articles.value.map((a) => a.source))])

// First 3 = hero cards (medium cards side by side).
// Rest = compact grid of "outras" (thumb 64px + title + meta).
const heroArticles = computed(() => articles.value.slice(0, 3))
const otherArticles = computed(() => articles.value.slice(3))
const visibleOthers = computed(() => otherArticles.value.slice(0, othersLimit.value))

const heroGridClass = computed(() => {
  const n = heroArticles.value.length
  if (n === 1) return 'grid-cols-1'
  if (n === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
})

const othersGridClass = computed(() => 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')

function sourceColor(source: string): string {
  const map: Record<string, string> = {
    infomoney: '#E63946',
    money_times: '#2A9D8F',
    seu_dinheiro: '#F4A261',
    brazil_journal: '#264653',
    suno: '#1D4ED8',
    valor_investe: '#8B0000',
    cnn_brasil: '#CC0000',
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
  if (diffMin < 60) return `${diffMin}min`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.news-hero-card:hover {
  transform: translateY(-2px);
}

.secondary-link:hover,
.secondary-link:focus-visible {
  background-color: var(--hover-bg, transparent);
}

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
