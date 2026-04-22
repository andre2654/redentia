<script setup lang="ts">
/**
 * Embed ranking — side = 'altas' | 'baixas'
 * Usa mesmo arquivo pra ambos via param dinâmico [side].
 */

const route = useRoute()
const brand = useBrand()

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const side = computed(() => String(route.params.side || 'altas').toLowerCase())
const sideIsAltas = computed(() => side.value === 'altas')

const tipo = ref<'stock' | 'fii' | 'etf'>((route.query.tipo as any) || 'stock')
const theme = ref<'dark' | 'light'>((route.query.theme as any) === 'light' ? 'light' : 'dark')
const limit = ref(Number(route.query.limit || 10))

const { isWidgetMode, embedUrl, iframeCode, copied, copyIframe } = useEmbedPlayground({
  path: `/ranking/${side.value}`,
  width: 480,
  height: 580,
  params: computed(() => ({
    tipo: tipo.value,
    theme: theme.value,
    limit: String(limit.value),
  })),
  title: computed(
    () => `Top ${limit.value} maiores ${sideIsAltas.value ? 'altas' : 'baixas'} B3 hoje`
  ),
})

// Fetch ranking data do backend — usa /api/rankings/monthly-change com
// side=top|bottom e type=STOCK|FII|ETF (já existe no Laravel).
const { data: ranking } = await useAsyncData(
  `ranking-${side.value}-${tipo.value}`,
  async () => {
    try {
      const apiBase = String(useRuntimeConfig().public?.apiBaseUrl || '')
      const backendSide = sideIsAltas.value ? 'top' : 'bottom'
      const backendType = tipo.value.toUpperCase() // STOCK, FII, ETF
      const endpoint = `${apiBase}/rankings/monthly-change?side=${backendSide}&type=${backendType}&limit=${limit.value}`
      const res = await $fetch<any>(endpoint)
      const items = Array.isArray(res) ? res : res?.data || []
      return items.map((it: any) => ({
        ticker: it.ticker,
        price: it.price ?? it.market_price ?? it.last_price,
        change_percent: it.change_percent ?? it.monthly_change ?? it.change,
        logo: it.logo,
      }))
    } catch {
      return []
    }
  },
  { watch: [side, tipo, limit] }
)

const items = computed(() => (Array.isArray(ranking.value) ? ranking.value : []).slice(0, limit.value))

const formatPrice = (v: number | null) =>
  v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const formatChange = (v: number) => (v >= 0 ? `+${Math.abs(v).toFixed(2)}%` : `-${Math.abs(v).toFixed(2)}%`)

const seoTitle = computed(() =>
  sideIsAltas.value
    ? `Widget Top Maiores Altas da B3: Ranking Diário | ${brand.name}`
    : `Widget Top Maiores Baixas da B3: Ranking Diário | ${brand.name}`
)

const seoDesc = computed(() =>
  sideIsAltas.value
    ? 'Widget gratuito com ranking das ações que mais subiram hoje na B3. Filtros por ações, FIIs e ETFs. Dados em tempo real. Ideal para posts diários sobre o mercado brasileiro.'
    : 'Widget gratuito com ranking das ações que mais caíram hoje na B3. Filtros por ações, FIIs e ETFs. Dados em tempo real. Complemente análises de mercado com visual poderoso.'
)

if (!isWidgetMode.value) {
  usePageSeo({
    title: seoTitle.value,
    description: seoDesc.value,
    path: `/embed/ranking/${side.value}`,
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Widgets', path: '/embed' },
      {
        name: sideIsAltas.value ? 'Top Altas' : 'Top Baixas',
        path: `/embed/ranking/${side.value}`,
      },
    ],
  })
} else {
  useSeoMeta({ robots: 'noindex,nofollow', title: seoTitle.value })
}
</script>

<template>
  <div v-if="isWidgetMode" class="embed-widget">
    <div
      class="flex h-full w-full flex-col rounded-xl p-4"
      :style="{
        backgroundColor: theme === 'light' ? '#ffffff' : brand.colors.surface,
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : brand.colors.border}`,
      }"
    >
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold uppercase tracking-wider" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">
          {{ sideIsAltas ? '▲ Maiores Altas' : '▼ Maiores Baixas' }}
        </h3>
        <span class="text-[10px] uppercase tracking-wider" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
          {{ tipo === 'stock' ? 'ações' : tipo === 'fii' ? 'fiis' : 'etfs' }}
        </span>
      </div>

      <div class="flex-1 space-y-2">
        <NuxtLink
          v-for="(it, i) in items"
          :key="i"
          :to="`https://www.redentia.com.br/asset/${String(it.ticker || '').toLowerCase()}`"
          target="_blank"
          rel="noopener"
          class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5"
          :style="{
            backgroundColor: i % 2 === 0 ? (theme === 'light' ? '#f9fafb' : brand.colors.background) : 'transparent',
          }"
        >
          <div class="flex min-w-0 items-center gap-2">
            <span class="w-6 shrink-0 text-xs tabular-nums opacity-50" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
              {{ (i + 1).toString().padStart(2, '0') }}
            </span>
            <img v-if="it.logo" :src="it.logo" :alt="it.ticker" class="size-5 shrink-0 rounded object-contain" loading="lazy" />
            <span class="truncate text-sm font-semibold" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">
              {{ it.ticker }}
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="tabular-nums" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">
              {{ formatPrice(it.price) }}
            </span>
            <span class="w-16 text-right font-semibold tabular-nums" :class="sideIsAltas ? 'text-green-500' : 'text-red-500'">
              {{ formatChange(it.change_percent ?? 0) }}
            </span>
          </div>
        </NuxtLink>
      </div>

      <div class="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.15em] opacity-60" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
        <span>B3 · Hoje</span>
        <span>redentia.com.br</span>
      </div>
    </div>
  </div>

  <NuxtLayout v-else name="static" :title="sideIsAltas ? 'Widget Top Maiores Altas' : 'Widget Top Maiores Baixas'">
    <section class="flex flex-col gap-12 px-6 py-12 md:py-16">
      <nav class="mx-auto flex w-full max-w-5xl items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white">Início</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <NuxtLink to="/embed" class="hover:text-white">Widgets</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <span class="text-white">{{ sideIsAltas ? 'Top Altas' : 'Top Baixas' }}</span>
      </nav>

      <header class="mx-auto flex w-full max-w-5xl flex-col gap-4 text-center md:text-left">
        <h1 class="text-3xl md:text-5xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          {{ sideIsAltas ? 'Top Maiores Altas da B3' : 'Top Maiores Baixas da B3' }}
        </h1>
        <p class="max-w-2xl text-base text-gray-400 md:text-lg">
          {{ sideIsAltas
            ? 'Widget com o ranking diário das ações que mais subiram na bolsa brasileira. Escolha entre ações, fundos imobiliários e ETFs. Atualização automática durante o pregão.'
            : 'Widget com o ranking diário das ações que mais caíram na bolsa brasileira. Filtros por tipo de ativo. Ideal pra cobrir ambos os lados do mercado em matérias de finanças.' }}
        </p>
      </header>

      <div class="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-5">
        <div class="flex flex-col gap-5 md:col-span-2">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Customizar</h2>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Tipo de ativo</label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="t in (['stock', 'fii', 'etf'] as const)" :key="t" type="button" class="rounded-lg border px-3 py-2 text-sm transition" :class="tipo === t ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400'" @click="tipo = t">
                {{ t === 'stock' ? 'Ações' : t === 'fii' ? 'FIIs' : 'ETFs' }}
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Quantidade</label>
            <UInput v-model.number="limit" type="number" :min="5" :max="20" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Tema</label>
            <div class="flex gap-2">
              <button type="button" class="flex-1 rounded-lg border px-4 py-2 text-sm transition" :class="theme === 'dark' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400'" @click="theme = 'dark'">Escuro</button>
              <button type="button" class="flex-1 rounded-lg border px-4 py-2 text-sm transition" :class="theme === 'light' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400'" @click="theme = 'light'">Claro</button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Código iframe</label>
            <div class="overflow-x-auto rounded-lg border p-4 font-mono text-xs" :style="{ backgroundColor: brand.colors.background, borderColor: brand.colors.border, color: brand.colors.text }"><code>{{ iframeCode }}</code></div>
            <UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" color="primary" block @click="copyIframe">{{ copied ? 'Copiado!' : 'Copiar código' }}</UButton>
          </div>
        </div>
        <div class="flex flex-col gap-4 md:col-span-3">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Pré-visualização</h2>
          <div class="flex min-h-[600px] items-center justify-center rounded-2xl border p-4" :style="{ borderColor: brand.colors.border, backgroundColor: theme === 'light' ? '#f9fafb' : brand.colors.background }">
            <iframe :src="embedUrl" width="480" height="580" frameborder="0" loading="lazy" :title="sideIsAltas ? 'Top Altas' : 'Top Baixas'" style="border:0;border-radius:12px;" />
          </div>
        </div>
      </div>

      <!-- Cross-link entre altas e baixas -->
      <div class="mx-auto w-full max-w-5xl">
        <div class="flex flex-wrap gap-3">
          <UButton
            v-if="sideIsAltas"
            to="/embed/ranking/baixas"
            variant="outline"
            color="neutral"
            icon="i-lucide-arrow-down-right"
          >
            Ver widget de Maiores Baixas
          </UButton>
          <UButton
            v-else
            to="/embed/ranking/altas"
            variant="outline"
            color="neutral"
            icon="i-lucide-arrow-up-right"
          >
            Ver widget de Maiores Altas
          </UButton>
          <UButton to="/embed" variant="outline" color="neutral" icon="i-lucide-layout-grid">Todos os widgets</UButton>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.embed-widget { font-family: system-ui, -apple-system, sans-serif; }
</style>
