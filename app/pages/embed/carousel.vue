<script setup lang="ts">
const route = useRoute()
const brand = useBrand()

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const tickersInput = ref(String(route.query.tickers || 'PETR4,VALE3,ITUB4,BBAS3,MGLU3'))
const theme = ref<'dark' | 'light'>((route.query.theme as any) === 'light' ? 'light' : 'dark')

const tickers = computed(() =>
  tickersInput.value
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
)

const { isWidgetMode, embedUrl, iframeCode, copied, copyIframe } = useEmbedPlayground({
  path: '/carousel',
  width: 900,
  height: 100,
  params: computed(() => ({ tickers: tickers.value.join(','), theme: theme.value })),
  title: computed(() => `Carrossel de cotações: ${tickers.value.slice(0, 3).join(', ')}`),
})

// Monta `items` no formato exigido pelo AtomsTickerCarousel ({logo, ticker, change})
const { getTickerDetails } = useAssetsService()
const assets = ref<any[]>([])

async function fetchAll() {
  assets.value = await Promise.all(
    tickers.value.map((t) => getTickerDetails(t).catch(() => null))
  )
}
watch(tickers, () => fetchAll(), { immediate: true })

const formatChange = (v: number) => (v >= 0 ? `+${Math.abs(v).toFixed(2)}%` : `-${Math.abs(v).toFixed(2)}%`)

const carouselItems = computed(() =>
  assets.value
    .filter((a) => a != null)
    .map((a) => ({
      logo: a.logo || '',
      ticker: String(a.ticker).toUpperCase(),
      change: formatChange(a.change_percent ?? a.change ?? 0),
    }))
)

if (!isWidgetMode.value) {
  usePageSeo({
    title: `Carrossel de Cotações para Site: Widget Animado B3 | ${brand.name}`,
    description:
      'Carrossel horizontal com múltiplos tickers em tempo real. Escolha quais ações, FIIs ou ETFs exibir. Ideal para sites de conteúdo financeiro e dashboards.',
    path: '/embed/carousel',
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Widgets', path: '/embed' },
      { name: 'Carrossel', path: '/embed/carousel' },
    ],
  })
} else {
  useSeoMeta({ robots: 'noindex,nofollow', title: `Carrossel · ${brand.name}` })
}
</script>

<template>
  <!-- Usa o componente oficial AtomsTickerCarousel do site Redentia -->
  <div
    v-if="isWidgetMode"
    class="embed-widget flex h-full w-full flex-col gap-1 rounded-xl p-2"
    :style="{
      backgroundColor: theme === 'light' ? '#ffffff' : brand.colors.surface,
      border: `1px solid ${theme === 'light' ? '#e5e7eb' : brand.colors.border}`,
    }"
  >
    <AtomsTickerCarousel
      :items="carouselItems"
      :no-control="true"
      :fade-color="theme === 'light' ? '#ffffff' : brand.colors.surface"
    />
    <div class="self-end pr-3 text-[9px] uppercase tracking-[0.15em] opacity-50" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
      redentia.com.br
    </div>
  </div>

  <MoleculesEmbedPlaygroundShell
    v-else
    breadcrumb="Carrossel"
    hero-title="Carrossel de Cotações da B3"
    hero-description="Barra horizontal com múltiplos tickers atualizados em tempo real. Escolha até 20 ativos — ações, FIIs, ETFs ou combinações. Perfeito pra dashboards e headers de sites de conteúdo financeiro."
    eyebrow-suffix="MÚLTIPLOS TICKERS"
  >
      <div class="grid gap-8 md:grid-cols-5">
        <div class="flex flex-col gap-5 md:col-span-2">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Customizar</h2>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Tickers (separados por vírgula)</label>
            <UTextarea v-model="tickersInput" :rows="3" placeholder="PETR4,VALE3,ITUB4" />
            <p class="text-xs text-gray-500">Exemplo: PETR4,VALE3,BBAS3,HGLG11,BOVA11</p>
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
          <div class="flex min-h-[200px] items-center justify-center rounded-2xl border p-4" :style="{ borderColor: brand.colors.border, backgroundColor: theme === 'light' ? '#f9fafb' : brand.colors.background }">
            <iframe :src="embedUrl" width="100%" height="100" frameborder="0" loading="lazy" title="Carrossel de cotações" style="border:0;border-radius:12px;" />
          </div>
        </div>
      </div>
  </MoleculesEmbedPlaygroundShell>
</template>

<style scoped>
.embed-widget { font-family: system-ui, -apple-system, sans-serif; }
</style>
