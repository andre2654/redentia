<script setup lang="ts">
const route = useRoute()
const brand = useBrand()

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const ticker = ref(String(route.query.ticker || 'VALE3').toUpperCase())
const theme = ref<'dark' | 'light'>((route.query.theme as any) === 'light' ? 'light' : 'dark')

const { isWidgetMode, embedUrl, iframeCode, copied, copyIframe } = useEmbedPlayground({
  path: '/ticker/big',
  width: 420,
  height: 220,
  params: computed(() => ({ ticker: ticker.value, theme: theme.value })),
  title: computed(() => `Cotação ${ticker.value} em tempo real`),
})

const { getTickerDetails } = useAssetsService()
const asset = ref<any>(null)
const loading = ref(true)

async function fetchAsset(t: string) {
  loading.value = true
  try {
    asset.value = (await getTickerDetails(t.toUpperCase())) || null
  } catch {
    asset.value = null
  } finally {
    loading.value = false
  }
}
watch(ticker, (v) => fetchAsset(v), { immediate: true })

const price = computed(() => asset.value?.market_price ?? asset.value?.last_price ?? null)
const change = computed(() => asset.value?.change_percent ?? asset.value?.change ?? 0)
const changePositive = computed(() => (change.value ?? 0) >= 0)
const assetName = computed(() => asset.value?.name || '')
const logoUrl = computed(() => asset.value?.logo || null)
const sector = computed(() => asset.value?.sector || null)
const dy = computed(() => asset.value?.dividend_yield || null)
const pl = computed(() => asset.value?.price_earnings_ratio || asset.value?.pe || null)

const formatPrice = (v: number | null) =>
  v == null ? 'R$ —' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const formatChange = (v: number) => (v >= 0 ? `+${Math.abs(v).toFixed(2)}%` : `-${Math.abs(v).toFixed(2)}%`)
const formatPct = (v: number | null) => (v == null ? '—' : `${v.toFixed(2)}%`)
const formatNumber = (v: number | null) => (v == null ? '—' : v.toFixed(2))

if (!isWidgetMode.value) {
  usePageSeo({
    title: `Widget Completo de Ação B3: Cotação, DY e P/L para Site | ${brand.name}`,
    description:
      'Widget completo com cotação, variação, dividend yield e P/L de qualquer ação ou FII da B3. Customizável, gratuito e em tempo real. Ideal para posts de análise fundamentalista.',
    path: '/embed/ticker/big',
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Widgets', path: '/embed' },
      { name: 'Ticker Big', path: '/embed/ticker/big' },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Widget Completo de Ação Redentia',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      },
    ],
  })
} else {
  useSeoMeta({ robots: 'noindex,nofollow', title: `${ticker.value} · ${brand.name}` })
}
</script>

<template>
  <!-- ==================== WIDGET MODE ==================== -->
  <div v-if="isWidgetMode" class="embed-widget">
    <NuxtLink
      :to="`https://www.redentia.com.br/asset/${ticker.toLowerCase()}`"
      target="_blank"
      rel="noopener"
      class="block h-full w-full rounded-xl p-5"
      :style="{
        backgroundColor: theme === 'light' ? '#ffffff' : brand.colors.surface,
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : brand.colors.border}`,
      }"
    >
      <div class="flex items-start gap-3">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="ticker"
          class="size-12 shrink-0 rounded-lg object-contain"
          loading="lazy"
        />
        <div
          v-else
          class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-sm font-bold text-gray-500"
        >
          {{ ticker.substring(0, 2) }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-bold" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">
              {{ ticker }}
            </span>
            <span v-if="!loading" class="text-xs font-medium tabular-nums" :class="changePositive ? 'text-green-500' : 'text-red-500'">
              {{ formatChange(change) }}
            </span>
          </div>
          <p class="truncate text-xs" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
            {{ loading ? '...' : assetName }}
          </p>
        </div>
      </div>

      <div class="mt-3 text-2xl font-bold tabular-nums" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">
        {{ loading ? '—' : formatPrice(price) }}
      </div>

      <div class="mt-3 grid grid-cols-3 gap-3 border-t pt-3" :style="{ borderColor: theme === 'light' ? '#e5e7eb' : brand.colors.border }">
        <div>
          <div class="text-[9px] uppercase tracking-wider" :style="{ color: theme === 'light' ? '#9ca3af' : brand.colors.textMuted }">DY</div>
          <div class="text-sm font-semibold" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">{{ formatPct(dy) }}</div>
        </div>
        <div>
          <div class="text-[9px] uppercase tracking-wider" :style="{ color: theme === 'light' ? '#9ca3af' : brand.colors.textMuted }">P/L</div>
          <div class="text-sm font-semibold" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">{{ formatNumber(pl) }}</div>
        </div>
        <div>
          <div class="text-[9px] uppercase tracking-wider" :style="{ color: theme === 'light' ? '#9ca3af' : brand.colors.textMuted }">SETOR</div>
          <div class="truncate text-sm font-semibold" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">{{ sector || '—' }}</div>
        </div>
      </div>

      <div class="mt-3 text-[9px] uppercase tracking-[0.15em] opacity-60" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
        powered by redentia.com.br
      </div>
    </NuxtLink>
  </div>

  <!-- ==================== PLAYGROUND ==================== -->
  <MoleculesEmbedPlaygroundShell
    v-else
    breadcrumb="Ticker Big"
    hero-title="Widget Completo de Ação"
    hero-description="Card grande com cotação, variação, dividend yield, P/L e setor. Ideal pra posts de análise fundamentalista, relatórios e newsletters sobre ações da B3."
    eyebrow-suffix="DY + P/L + SETOR"
  >
      <div class="grid gap-8 md:grid-cols-5">
        <div class="flex flex-col gap-5 md:col-span-2">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Customizar</h2>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Ticker</label>
            <UInput v-model="ticker" placeholder="VALE3" @update:model-value="(v) => (ticker = String(v).toUpperCase())" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Tema</label>
            <div class="flex gap-2">
              <button type="button" class="flex-1 rounded-lg border px-4 py-2 text-sm transition" :class="theme === 'dark' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400 hover:border-white/20'" @click="theme = 'dark'">Escuro</button>
              <button type="button" class="flex-1 rounded-lg border px-4 py-2 text-sm transition" :class="theme === 'light' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400 hover:border-white/20'" @click="theme = 'light'">Claro</button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Código iframe</label>
            <div class="overflow-x-auto rounded-lg border p-4 font-mono text-xs" :style="{ backgroundColor: brand.colors.background, borderColor: brand.colors.border, color: brand.colors.text }">
              <code>{{ iframeCode }}</code>
            </div>
            <UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" color="primary" block @click="copyIframe">
              {{ copied ? 'Copiado!' : 'Copiar código' }}
            </UButton>
          </div>
        </div>

        <div class="flex flex-col gap-4 md:col-span-3">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Pré-visualização</h2>
          <div class="flex min-h-[360px] items-center justify-center rounded-2xl border p-8" :style="{ borderColor: brand.colors.border, backgroundColor: theme === 'light' ? '#f9fafb' : brand.colors.background }">
            <iframe :src="embedUrl" width="420" height="220" frameborder="0" loading="lazy" :title="`Cotação ${ticker}`" style="border:0;border-radius:12px;" />
          </div>
        </div>
      </div>
  </MoleculesEmbedPlaygroundShell>
</template>

<style scoped>
.embed-widget { font-family: system-ui, -apple-system, sans-serif; }
</style>
