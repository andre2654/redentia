<script setup lang="ts">
/**
 * Ticker Small Embed — dual mode:
 *  - Default (playground): página indexável com painel de customização,
 *    preview ao vivo e botão "copiar código". Alvo SEO: "widget cotação
 *    de ações grátis", "embed ticker B3".
 *  - `?widget=1`: modo iframe puro — só o cartão, sem header/footer/chrome.
 */

const route = useRoute()
const brand = useBrand()
const runtimeConfig = useRuntimeConfig()

const isWidgetMode = computed(() => route.query.widget === '1')

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// ==== Widget state ====
const ticker = ref(String(route.query.ticker || 'PETR4').toUpperCase())
const theme = ref<'dark' | 'light'>((route.query.theme as any) === 'light' ? 'light' : 'dark')

// Reativo aos changes no playground
watch(theme, (v) => {
  if (!isWidgetMode.value) return
  document.documentElement.setAttribute('data-theme', v)
})

// ==== Widget data fetching ====
const { getTickerDetails } = useAssetsService()
const asset = ref<any>(null)
const loading = ref(true)

async function fetchAsset(t: string) {
  loading.value = true
  try {
    const data = await getTickerDetails(t.toUpperCase())
    asset.value = data || null
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

const formatPrice = (v: number | null) => {
  if (v == null) return 'R$ —'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
const formatChange = (v: number) => {
  const s = Math.abs(v).toFixed(2)
  return v >= 0 ? `+${s}%` : `-${s}%`
}

// ==== Iframe code gen ====
const siteUrl = computed(() => {
  const raw = String(runtimeConfig.public?.siteUrl || brand.url || '').replace(/\/$/, '')
  return raw.replace('https://www.', 'https://embed.').replace('http://www.', 'http://embed.')
})
const embedUrl = computed(
  () =>
    `${siteUrl.value}/ticker/small?ticker=${ticker.value}&theme=${theme.value}&widget=1`
)
const iframeCode = computed(
  () => `<iframe src="${embedUrl.value}"
        width="320" height="120"
        frameborder="0" loading="lazy"
        title="Cotação ${ticker.value} em tempo real"
        style="border:0;border-radius:12px;"></iframe>`
)

const copied = ref(false)
async function copyIframe() {
  try {
    await navigator.clipboard.writeText(iframeCode.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {}
}

// ==== SEO (playground mode only) ====
if (!isWidgetMode.value) {
  usePageSeo({
    title: `Widget de Cotação de Ações para Site: Embed Grátis | ${brand.name}`,
    description:
      'Widget gratuito de cotação de ações da B3 para embedar no seu site, blog ou newsletter. Customize ticker, cores e tema. Dados em tempo real, sem cadastro. Funciona em WordPress, Webflow, Medium.',
    path: '/embed/ticker/small',
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Widgets', path: '/embed' },
      { name: 'Ticker Small', path: '/embed/ticker/small' },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Widget de Cotação Redentia',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        description:
          'Widget embeddable de cotação de ações, FIIs e ETFs da B3 em tempo real.',
      },
    ],
  })
}

// ==== Widget mode SEO (noindex) ====
if (isWidgetMode.value) {
  useSeoMeta({
    robots: 'noindex,nofollow',
    title: `${ticker.value} · ${brand.name}`,
  })
}
</script>

<template>
  <!-- ==================== WIDGET MODE (iframe target) ==================== -->
  <div
    v-if="isWidgetMode"
    class="embed-widget flex h-full w-full items-center justify-center p-3"
    :data-theme="theme"
  >
    <a
      :href="`https://www.redentia.com.br/asset/${ticker.toLowerCase()}`"
      target="_blank"
      rel="noopener"
      class="flex w-full max-w-full flex-col gap-1 rounded-lg border px-3 py-2 no-underline"
      :style="{
        backgroundColor: theme === 'light' ? '#ffffff' : brand.colors.surface,
        borderColor: theme === 'light' ? '#e5e7eb' : brand.colors.border,
      }"
    >
      <div class="flex items-center gap-2">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="ticker"
          class="size-6 rounded object-contain"
        />
        <div
          v-else
          class="flex size-6 items-center justify-center rounded text-[9px] font-bold"
          :style="{
            backgroundColor: theme === 'light' ? '#f3f4f6' : 'rgba(255,255,255,0.1)',
            color: theme === 'light' ? '#6b7280' : brand.colors.textMuted,
          }"
        >
          {{ ticker.slice(0, 2) }}
        </div>
        <span
          class="text-sm font-bold tracking-wide"
          :style="{ color: theme === 'light' ? '#111' : brand.colors.text }"
        >
          {{ ticker }}
        </span>
        <span
          v-if="!loading"
          class="ml-auto text-xs font-medium tabular-nums"
          :class="changePositive ? 'text-green-500' : 'text-red-500'"
        >
          {{ formatChange(Number(change)) }}
        </span>
      </div>
      <div
        class="text-base font-bold tabular-nums"
        :style="{ color: theme === 'light' ? '#111' : brand.colors.text }"
      >
        {{ loading ? 'R$ —' : formatPrice(price) }}
      </div>
      <div
        class="text-[9px] uppercase tracking-[0.15em] opacity-60"
        :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }"
      >
        powered by redentia.com.br
      </div>
    </a>
  </div>

  <!-- ==================== PLAYGROUND MODE (SEO page) ==================== -->
  <MoleculesEmbedPlaygroundShell
    v-else
    breadcrumb="Ticker Small"
    hero-title="Widget de Cotação Compacto"
    hero-description="Card pequeno com logo, ticker, preço e variação do dia. Ideal pra sidebars de blogs, newsletters e sites de conteúdo financeiro. Dados em tempo real da B3, customizável, 100% gratuito."
    eyebrow-suffix="DADOS B3 · EM TEMPO REAL"
  >
      <!-- Playground: preview + config -->
      <div class="grid gap-8 md:grid-cols-5">
        <!-- Config -->
        <div class="flex flex-col gap-5 md:col-span-2">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Customizar</h2>

          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Ticker</label>
            <UInput v-model="ticker" placeholder="PETR4" @update:model-value="(v) => (ticker = String(v).toUpperCase())" />
            <p class="text-xs text-gray-500">Qualquer ativo da B3: PETR4, VALE3, MGLU3, HGLG11, BOVA11, etc.</p>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Tema</label>
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-lg border px-4 py-2 text-sm transition"
                :class="theme === 'dark' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400 hover:border-white/20'"
                @click="theme = 'dark'"
              >
                Escuro
              </button>
              <button
                type="button"
                class="flex-1 rounded-lg border px-4 py-2 text-sm transition"
                :class="theme === 'light' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400 hover:border-white/20'"
                @click="theme = 'light'"
              >
                Claro
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Código para copiar</label>
            <div
              class="overflow-x-auto rounded-lg border p-4 font-mono text-xs"
              :style="{ backgroundColor: brand.colors.background, borderColor: brand.colors.border, color: brand.colors.text }"
            >
              <code>{{ iframeCode }}</code>
            </div>
            <UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" color="primary" block @click="copyIframe">
              {{ copied ? 'Copiado!' : 'Copiar código iframe' }}
            </UButton>
          </div>
        </div>

        <!-- Preview -->
        <div class="flex flex-col gap-4 md:col-span-3">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Pré-visualização</h2>
          <div
            class="flex min-h-[400px] items-center justify-center rounded-2xl border p-8"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: theme === 'light' ? '#f9fafb' : brand.colors.background,
            }"
          >
            <iframe
              :src="embedUrl"
              width="320"
              height="120"
              frameborder="0"
              loading="lazy"
              :title="`Cotação ${ticker}`"
              style="border:0;border-radius:12px;"
            />
          </div>
          <p class="text-xs text-gray-500">
            Pré-visualização usando o mesmo iframe que você vai colar no seu site.
          </p>
        </div>
      </div>

      <!-- Feature list for SEO -->
      <div>
        <h2 class="mb-4 text-2xl font-semibold" :style="{ color: brand.colors.text }">
          Por que usar o widget de cotação da Redentia
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="flex flex-col gap-2 rounded-xl border p-5" :style="{ borderColor: brand.colors.border }">
            <h3 class="font-semibold" :style="{ color: brand.colors.text }">Dados em tempo real da B3</h3>
            <p class="text-sm text-gray-400">Cotações atualizam durante o pregão (10h às 17h30). Fora do horário, mostra o último fechamento.</p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl border p-5" :style="{ borderColor: brand.colors.border }">
            <h3 class="font-semibold" :style="{ color: brand.colors.text }">100% gratuito e sem cadastro</h3>
            <p class="text-sm text-gray-400">Sem limite de uso, sem API key, sem autenticação. Copie o iframe e pronto.</p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl border p-5" :style="{ borderColor: brand.colors.border }">
            <h3 class="font-semibold" :style="{ color: brand.colors.text }">Funciona em qualquer CMS</h3>
            <p class="text-sm text-gray-400">WordPress, Webflow, Medium, Ghost, Substack, Notion pages públicas. Onde tiver iframe, funciona.</p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl border p-5" :style="{ borderColor: brand.colors.border }">
            <h3 class="font-semibold" :style="{ color: brand.colors.text }">Tema claro ou escuro</h3>
            <p class="text-sm text-gray-400">Escolha o tema que combina com seu site. Atualiza automaticamente quando você troca no painel acima.</p>
          </div>
        </div>
      </div>

      <!-- Outros embeds -->
      <div>
        <h2 class="mb-4 text-xl font-semibold" :style="{ color: brand.colors.text }">
          Outros widgets
        </h2>
        <div class="flex flex-wrap gap-2">
          <UButton to="/embed/ticker/big" variant="outline" color="neutral" icon="i-lucide-chart-candlestick">Ticker Big</UButton>
          <UButton to="/embed/carousel" variant="outline" color="neutral" icon="i-lucide-list-video">Carrossel</UButton>
          <UButton to="/embed/ranking/altas" variant="outline" color="neutral" icon="i-lucide-arrow-up-right">Top Altas</UButton>
          <UButton to="/embed/mapa-calor" variant="outline" color="neutral" icon="i-lucide-layout-grid">Mapa de Calor</UButton>
          <UButton to="/embed/calculadora/juros-compostos" variant="outline" color="neutral" icon="i-lucide-calculator">Calculadora</UButton>
        </div>
      </div>
  </MoleculesEmbedPlaygroundShell>
</template>

<style scoped>
.embed-widget { font-family: system-ui, -apple-system, sans-serif; }
</style>
