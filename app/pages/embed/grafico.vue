<script setup lang="ts">
const route = useRoute()
const brand = useBrand()

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const ticker = ref(String(route.query.ticker || 'BBAS3').toUpperCase())
const periodo = ref<'1M' | '3M' | '6M' | '1A' | '5A'>((route.query.periodo as any) || '1A')
const theme = ref<'dark' | 'light'>((route.query.theme as any) === 'light' ? 'light' : 'dark')

const { isWidgetMode, embedUrl, iframeCode, copied, copyIframe } = useEmbedPlayground({
  path: '/grafico',
  width: 640,
  height: 400,
  params: computed(() => ({
    ticker: ticker.value,
    periodo: periodo.value,
    theme: theme.value,
  })),
  title: computed(() => `Gráfico de valorização ${ticker.value} · ${periodo.value}`),
})

// Histórico via /api/tickers/{ticker}/prices (endpoint já existe no Laravel).
// Mapeia períodos do front pro `mode` aceito pelo backend (ModeHistoryPriceEnum).
const periodoToMode: Record<string, string> = {
  '1M': '1mo',
  '3M': '3mo',
  '6M': '6mo',
  '1A': '1y',
  '5A': '5y',
}

const { data: history } = await useAsyncData(
  `hist-${ticker.value}-${periodo.value}`,
  async () => {
    try {
      const apiBase = String(useRuntimeConfig().public?.apiBaseUrl || '')
      const mode = periodoToMode[periodo.value] || '1y'
      const res = await $fetch<any>(
        `${apiBase}/tickers/${ticker.value}/prices?mode=${mode}`
      )
      const raw = Array.isArray(res) ? res : res?.data || []
      // Normaliza pontos: espera `{ date, close }` ou `{ date, price }`.
      return raw.map((p: any) => ({
        date: p.date || p.datetime,
        close: p.close ?? p.price ?? p.adjusted_close ?? 0,
      }))
    } catch {
      return []
    }
  },
  { watch: [ticker, periodo] }
)

const seriesPoints = computed(() =>
  Array.isArray(history.value) ? history.value.slice(-60) : []
)

const { getTickerDetails } = useAssetsService()
const asset = ref<any>(null)
watch(ticker, async (v) => {
  asset.value = (await getTickerDetails(v).catch(() => null)) || null
}, { immediate: true })

const startPrice = computed(() => seriesPoints.value[0]?.close || 0)
const endPrice = computed(() => seriesPoints.value[seriesPoints.value.length - 1]?.close || 0)
const pctChange = computed(() =>
  startPrice.value ? ((endPrice.value - startPrice.value) / startPrice.value) * 100 : 0
)

if (!isWidgetMode.value) {
  usePageSeo({
    title: `Widget de Gráfico de Ação para Site: Valorização Histórica B3 | ${brand.name}`,
    description:
      'Widget de gráfico de valorização histórica de qualquer ação da B3 (1M, 3M, 6M, 1A, 5A). Embed gratuito para sites e newsletters de análise de investimentos. Sem cadastro.',
    path: '/embed/grafico',
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Widgets', path: '/embed' },
      { name: 'Gráfico', path: '/embed/grafico' },
    ],
  })
} else {
  useSeoMeta({ robots: 'noindex,nofollow', title: `${ticker.value} ${periodo.value} · ${brand.name}` })
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
      <div class="mb-2 flex items-center justify-between">
        <div>
          <div class="text-lg font-bold" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">
            {{ ticker }}
          </div>
          <div class="text-xs" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
            {{ asset?.name || '' }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs uppercase tracking-wider opacity-60" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">{{ periodo }}</div>
          <div class="text-lg font-bold tabular-nums" :class="pctChange >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ pctChange >= 0 ? '+' : '' }}{{ pctChange.toFixed(2) }}%
          </div>
        </div>
      </div>

      <div class="flex-1">
        <svg v-if="seriesPoints.length" viewBox="0 0 600 300" preserveAspectRatio="none" class="h-full w-full">
          <polyline
            :points="seriesPoints.map((p, i) => {
              const x = (i / (seriesPoints.length - 1)) * 600
              const max = Math.max(...seriesPoints.map(pp => pp.close))
              const min = Math.min(...seriesPoints.map(pp => pp.close))
              const y = 300 - ((p.close - min) / (max - min)) * 280 - 10
              return `${x},${y}`
            }).join(' ')"
            fill="none"
            :stroke="pctChange >= 0 ? '#22c55e' : '#ef4444'"
            stroke-width="2"
          />
        </svg>
        <div v-else class="flex h-full items-center justify-center text-sm opacity-50" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
          Carregando histórico...
        </div>
      </div>

      <div class="mt-2 text-[9px] uppercase tracking-[0.15em] opacity-60" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
        redentia.com.br
      </div>
    </div>
  </div>

  <MoleculesEmbedPlaygroundShell
    v-else
    breadcrumb="Gráfico"
    hero-title="Gráfico de Valorização para Seu Site"
    hero-description="Widget com gráfico histórico de qualquer ação, FII ou ETF da B3. Escolha o período (1 mês a 5 anos). Ideal pra posts comparando performance de ativos, análises de cenário ou relatórios recorrentes."
    eyebrow-suffix="HISTÓRICO 1M · 5A"
  >
      <div class="grid gap-8 md:grid-cols-5">
        <div class="flex flex-col gap-5 md:col-span-2">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Customizar</h2>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Ticker</label>
            <UInput v-model="ticker" placeholder="BBAS3" @update:model-value="(v) => (ticker = String(v).toUpperCase())" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Período</label>
            <div class="grid grid-cols-5 gap-1">
              <button v-for="p in (['1M', '3M', '6M', '1A', '5A'] as const)" :key="p" type="button" class="rounded-lg border px-2 py-2 text-xs transition" :class="periodo === p ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400'" @click="periodo = p">{{ p }}</button>
            </div>
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
          <div class="flex min-h-[440px] items-center justify-center rounded-2xl border p-4" :style="{ borderColor: brand.colors.border, backgroundColor: theme === 'light' ? '#f9fafb' : brand.colors.background }">
            <iframe :src="embedUrl" width="640" height="400" frameborder="0" loading="lazy" :title="`Gráfico ${ticker}`" style="border:0;border-radius:12px;max-width:100%;" />
          </div>
        </div>
      </div>
  </MoleculesEmbedPlaygroundShell>
</template>

<style scoped>
.embed-widget { font-family: system-ui, -apple-system, sans-serif; }
</style>
