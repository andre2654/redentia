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

// Fetch ranking data do backend — /api/rankings/monthly-change.
// Mapeia pro formato RankingRow esperado pelo MoleculesRankingTable.
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
        ticker: String(it.ticker || '').toUpperCase(),
        name: it.name || null,
        logo: it.logo || null,
        market_price: Number(it.price ?? it.market_price ?? it.last_price ?? 0),
        change_percent: it.change_percent ?? it.monthly_change ?? it.change ?? 0,
        market_cap: it.market_cap ?? 0,
        dividend_yield: it.dividend_yield ?? null,
        trailing_pe: it.trailing_pe ?? it.pe ?? null,
        sector: it.sector ?? null,
      }))
    } catch {
      return []
    }
  },
  { watch: [side, tipo, limit] }
)

const items = computed(() => (Array.isArray(ranking.value) ? ranking.value : []).slice(0, limit.value))

// Formatação agora é responsabilidade do MoleculesRankingTable

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
  <!-- Usa o componente oficial MoleculesRankingTable -->
  <div v-if="isWidgetMode" class="embed-widget flex h-full w-full flex-col gap-2 p-2">
    <div class="flex items-center justify-between px-2">
      <h3 class="text-sm font-bold uppercase tracking-wider" :style="{ color: brand.colors.text }">
        {{ sideIsAltas ? '▲ Maiores Altas' : '▼ Maiores Baixas' }}
      </h3>
      <span class="text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
        {{ tipo === 'stock' ? 'ações' : tipo === 'fii' ? 'fiis' : 'etfs' }}
      </span>
    </div>

    <MoleculesRankingTable
      :rows="items"
      :columns="['change']"
      :change-label="sideIsAltas ? 'Alta mês' : 'Baixa mês'"
    />

    <div class="flex items-center justify-between px-2 text-[9px] uppercase tracking-[0.15em] opacity-60" :style="{ color: brand.colors.textMuted }">
      <span>B3 · Hoje</span>
      <span>redentia.com.br</span>
    </div>
  </div>

  <MoleculesEmbedPlaygroundShell
    v-else
    :breadcrumb="sideIsAltas ? 'Top Altas' : 'Top Baixas'"
    :hero-title="sideIsAltas ? 'Top Maiores Altas da B3' : 'Top Maiores Baixas da B3'"
    :hero-description="sideIsAltas
      ? 'Widget com o ranking diário das ações que mais subiram na bolsa brasileira. Escolha entre ações, fundos imobiliários e ETFs. Atualização automática durante o pregão.'
      : 'Widget com o ranking diário das ações que mais caíram na bolsa brasileira. Filtros por tipo de ativo. Ideal pra cobrir ambos os lados do mercado em matérias de finanças.'"
    eyebrow-suffix="RANKING DIÁRIO B3"
  >

      <div class="grid gap-8 md:grid-cols-5">
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
      <div>
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
  </MoleculesEmbedPlaygroundShell>
</template>

<style scoped>
.embed-widget { font-family: system-ui, -apple-system, sans-serif; }
</style>
