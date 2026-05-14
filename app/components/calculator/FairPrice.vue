<template>
  <CalcUiShell
    :back-to="backTo"
    :back-label="backLabel"
    :last-updated="lastUpdated"
  >
    <template #hero>
      <slot name="hero">
        <p class="calc-eyebrow">Calculadora · Preço Teto</p>
        <h1 class="calc-title">Calculadora de Preço Teto</h1>
        <p class="calc-lead">Graham, Bazin, P/L setorial e VPA com dados oficiais da B3.</p>
      </slot>
    </template>

    <template #form>
      <p class="cui-section-label">{{ results && selectedAsset ? 'Ajustar análise' : 'Selecione uma ação' }}</p>
      <CalcUiAssetSearch
        v-if="!selectedAsset"
        v-model="searchTerm"
        :results="filteredAssets"
        :loading="assetsLoading"
        label="Selecione a ação"
        placeholder="Ex: PETR4, Petrobras, Itaú..."
        @select="selectAsset"
      />

      <div v-else class="cui-selected-asset">
        <div class="cui-selected-asset-logo">
          <img
            v-if="selectedAsset.logo"
            :src="selectedAsset.logo"
            :alt="selectedAsset.ticker || selectedAsset.stock"
          />
          <span v-else>{{ (selectedAsset.ticker || selectedAsset.stock || '').slice(0, 2) }}</span>
        </div>
        <div class="cui-selected-asset-info">
          <p class="cui-selected-asset-ticker">{{ (selectedAsset.ticker || selectedAsset.stock || '').toUpperCase() }}</p>
          <p class="cui-selected-asset-name">{{ selectedAsset.name }}</p>
        </div>
        <button class="cui-selected-asset-action" type="button" @click="clearSelection">
          <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
          Trocar
        </button>
      </div>

      <div v-if="isFetching" class="cui-loading">
        <UIcon name="i-lucide-loader-circle" class="size-5 motion-safe:animate-spin" />
        Buscando fundamentos e calculando todas as metodologias...
      </div>

      <div v-if="fetchError && !isFetching" class="cui-callout cui-callout--warning">
        <strong>Não foi possível carregar os fundamentos:</strong> {{ fetchError }}. Tente outra ação ou preencha os campos manualmente no modo avançado.
      </div>

      <details v-if="selectedAsset" class="cui-collapse">
        <summary class="cui-collapse-summary">
          <span class="flex items-center gap-2">
            <UIcon name="i-lucide-sliders-horizontal" class="size-4" style="color: var(--brand-primary)" />
            Ajuste manual (opcional)
          </span>
          <UIcon name="i-lucide-chevron-down" class="cui-collapse-chevron size-4" />
        </summary>
        <div class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 mt-4">
          <CalcUiField label="Preço Atual (R$)" type="currency" v-model="form.currentPrice" placeholder="25,00" />
          <CalcUiField label="Lucro por Ação - LPA (R$)" type="currency" v-model="form.lpa" placeholder="3,50" />
          <CalcUiField label="Valor Patrimonial - VPA (R$)" type="currency" v-model="form.vpa" placeholder="15,00" />
          <CalcUiField label="Dividendo Anual (R$)" type="currency" v-model="form.dividend" placeholder="1,50" />
          <CalcUiField label="P/L Médio do Setor" type="number" v-model="form.sectorPL" placeholder="12" />
        </div>
      </details>
    </template>

    <template #result>
      <CalcUiResultMega
        v-if="results && selectedAsset"
        eyebrow="Recomendação consensual"
        :value="results.consensus.recommendation"
        :mega-color="results.consensus.recommendation === 'Comprar' ? 'positive' : results.consensus.recommendation === 'Caro' ? 'negative' : 'primary'"
        :kpis="[
          { label: 'Preço teto médio', value: formatCurrency(results.consensus.averageFairPrice), color: 'primary' },
          { label: 'Margem de segurança', value: `${(results.consensus.averageMargin * 100).toFixed(1)}%`, color: 'heading' },
          { label: 'Preço atual', value: formatCurrency(form.currentPrice), color: 'heading' },
        ]"
      >
        <template #caption>{{ results.consensus.explanation }}</template>
      </CalcUiResultMega>
      <div v-else class="cui-result-empty">
        <p class="cui-result-eyebrow">Preço teto</p>
        <p class="cui-empty-text">Selecione uma ação ao lado para ver Graham, Bazin, P/L e VPA.</p>
      </div>
    </template>

    <template #chart>
      <div v-if="results && selectedAsset" class="flex flex-col gap-4">
      <div class="cui-subcard">
        <h4 class="cui-subcard-title">Fundamentos utilizados</h4>
        <div class="cui-subcard-grid cui-subcard-grid--3">
          <CalcUiKpiBox label="Preço atual" :value="formatCurrency(form.currentPrice)" color="heading" />
          <CalcUiKpiBox label="LPA (12m)" :value="formatCurrency(form.lpa)" color="heading" />
          <CalcUiKpiBox label="VPA" :value="formatCurrency(form.vpa)" color="heading" />
          <CalcUiKpiBox label="Dividendo 12m" :value="formatCurrency(form.dividend)" color="heading" />
          <CalcUiKpiBox label="P/L Setor" :value="form.sectorPL.toFixed(1)" color="heading" />
        </div>
      </div>

      <div class="cui-subcard">
        <h4 class="cui-subcard-title">4 metodologias de preço teto</h4>
        <div class="cui-method-grid">
          <div class="cui-method" :class="getMethodStatus(results.graham.ratio)">
            <div class="cui-method-head">
              <h5 class="cui-method-title">Fórmula de Graham</h5>
              <span class="cui-method-badge">{{ getStatusText(results.graham.ratio) }}</span>
            </div>
            <p class="cui-method-value">{{ formatCurrency(results.graham.fairPrice) }}</p>
            <p class="cui-method-margin">Margem: {{ (results.graham.margin * 100).toFixed(1) }}%</p>
            <p class="cui-method-formula">√(22.5 × LPA × VPA)</p>
          </div>
          <div class="cui-method" :class="getMethodStatus(results.bazin.ratio)">
            <div class="cui-method-head">
              <h5 class="cui-method-title">Método Bazin</h5>
              <span class="cui-method-badge">{{ getStatusText(results.bazin.ratio) }}</span>
            </div>
            <p class="cui-method-value">{{ formatCurrency(results.bazin.fairPrice) }}</p>
            <p class="cui-method-margin">Margem: {{ (results.bazin.margin * 100).toFixed(1) }}%</p>
            <p class="cui-method-formula">Dividendo ÷ 0.06 (DY mín 6%)</p>
          </div>
          <div class="cui-method" :class="getMethodStatus(results.plSector.ratio)">
            <div class="cui-method-head">
              <h5 class="cui-method-title">P/L Setorial</h5>
              <span class="cui-method-badge">{{ getStatusText(results.plSector.ratio) }}</span>
            </div>
            <p class="cui-method-value">{{ formatCurrency(results.plSector.fairPrice) }}</p>
            <p class="cui-method-margin">Margem: {{ (results.plSector.margin * 100).toFixed(1) }}%</p>
            <p class="cui-method-formula">LPA × P/L Médio do Setor</p>
          </div>
          <div class="cui-method" :class="getMethodStatus(results.bookValue.ratio)">
            <div class="cui-method-head">
              <h5 class="cui-method-title">Valor Patrimonial</h5>
              <span class="cui-method-badge">{{ getStatusText(results.bookValue.ratio) }}</span>
            </div>
            <p class="cui-method-value">{{ formatCurrency(results.bookValue.fairPrice) }}</p>
            <p class="cui-method-margin">Margem: {{ (results.bookValue.margin * 100).toFixed(1) }}%</p>
            <p class="cui-method-formula">VPA × 1.5 (margem Graham)</p>
          </div>
        </div>
      </div>

      <div class="cui-subcard">
        <h4 class="cui-subcard-title">Comparação visual</h4>
        <div class="cui-bar-group">
          <div class="cui-bar-row">
            <span class="cui-bar-label">Preço atual</span>
            <span class="cui-bar-value">{{ formatCurrency(form.currentPrice) }}</span>
          </div>
          <div class="cui-bar-track">
            <div class="cui-bar-fill" :style="{ width: '100%', background: 'var(--text-heading)' }" />
          </div>
          <div v-for="method in visualMethods" :key="method.key">
            <div class="cui-bar-row">
              <span class="cui-bar-label">{{ method.label }}</span>
              <span class="cui-bar-value">{{ formatCurrency(method.fairPrice) }}</span>
            </div>
            <div class="cui-bar-track">
              <div
                class="cui-bar-fill"
                :class="method.color"
                :style="{ width: `${Math.min(100, (method.fairPrice / Math.max(form.currentPrice, 0.01)) * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <CalcUiButton
          variant="ghost"
          :label="`Ver análise completa de ${form.ticker}`"
          icon="i-lucide-chart-line"
          :block="false"
          @click="navigateTo(`/asset/${(form.ticker || '').toLowerCase()}`)"
        />
        <CalcUiButton
          v-if="sectorSlug"
          variant="ghost"
          label="Comparar com o setor"
          icon="i-lucide-layers"
          :block="false"
          @click="navigateTo(`/setor/${sectorSlug}/comparativo`)"
        />
      </div>

      <div class="cui-callout">
        <strong>Fonte dos dados:</strong> preço e fundamentos calculados com dados públicos da B3, fechamento do último pregão. O preço teto é uma referência, não uma garantia. Analise sempre os fundamentos da empresa, perspectivas futuras e seu perfil de risco antes de investir.
      </div>
      </div>
      <CalcUiEmptyState
        v-else-if="!selectedAsset"
        icon="i-lucide-search"
        title="Escolha uma ação para começar"
        description="Os preços teto de Graham, Bazin, P/L setorial e VPA aparecem automaticamente."
        :quick-picks="popularTickers.map((t: string) => ({ value: t, label: t }))"
        @pick="selectByTicker"
      />
    </template>
  </CalcUiShell>
</template>

<script setup lang="ts">
import type { IAsset, FundamentusApiResponse } from '~/types/asset'
import { useAssetsService } from '~/services/assets'

interface Props {
  assets?: IAsset[]
  assetsLoading?: boolean
  sectors?: Array<{ slug: string; name: string; count?: number }>
  initialTicker?: string
  backTo?: string
  backLabel?: string
  lastUpdated?: string
}

const props = withDefaults(defineProps<Props>(), {
  assets: () => [],
  assetsLoading: false,
  sectors: () => [],
  initialTicker: '',
})

const router = useRouter()
const route = useRoute()
const { getTickerFundamentus, getTickerDividends, getTickerDetails, getSectorTickers } =
  useAssetsService()

const popularTickers = [
  'PETR4', 'ITUB4', 'VALE3', 'BBAS3', 'BBDC4', 'WEGE3', 'ITSA4', 'B3SA3',
]

const searchTerm = ref('')
const selectedAsset = ref<IAsset | null>(null)
const isSearchFocused = ref(false)
const isFetching = ref(false)

const calcRoot = ref<HTMLElement | null>(null)

function scrollToCalc() {
  if (typeof window === 'undefined') return
  // nextTick garante que o DOM atualizou (form re-renderizou) antes de scrollar
  nextTick(() => {
    calcRoot.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

function handleSearchBlur() {
  setTimeout(() => {
    isSearchFocused.value = false
  }, 150)
}
const fetchError = ref<string | null>(null)
const sectorSlug = ref<string | null>(null)

const form = ref({
  ticker: '',
  currentPrice: 0,
  lpa: 0,
  vpa: 0,
  dividend: 0,
  sectorPL: 12,
})

interface MethodResult {
  fairPrice: number
  margin: number
  ratio: number
}

interface Results {
  graham: MethodResult
  bazin: MethodResult
  plSector: MethodResult
  bookValue: MethodResult
  consensus: {
    averageFairPrice: number
    averageMargin: number
    recommendation: string
    explanation: string
  }
}

const results = ref<Results | null>(null)

const filteredAssets = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return []
  return (props.assets || [])
    .filter((asset) => {
      const type = (asset.type || '').toString().toUpperCase()
      if (type !== 'STOCK') return false
      const ticker = (asset.ticker || asset.stock || '').toLowerCase()
      const name = (asset.name || '').toLowerCase()
      return ticker.includes(term) || name.includes(term)
    })
    .slice(0, 10)
})

const visualMethods = computed(() => {
  if (!results.value) return []
  return [
    { key: 'graham', label: 'Graham', fairPrice: results.value.graham.fairPrice, color: 'cui-bar-fill--positive' },
    { key: 'bazin', label: 'Bazin', fairPrice: results.value.bazin.fairPrice, color: 'cui-bar-fill--primary' },
    { key: 'plSector', label: 'P/L Setorial', fairPrice: results.value.plSector.fairPrice, color: 'cui-bar-fill--primary' },
    { key: 'bookValue', label: 'Valor Patrimonial', fairPrice: results.value.bookValue.fairPrice, color: 'cui-bar-fill--negative' },
  ]
})

function resolveSectorSlug(sectorName: string | null | undefined): string | null {
  if (!sectorName) return null
  const target = sectorName.toLowerCase().trim()
  const found = (props.sectors || []).find(
    (s) => s.name.toLowerCase() === target || s.slug === target,
  )
  return found?.slug ?? null
}

async function fetchSectorPE(slug: string): Promise<number | null> {
  try {
    const resp = await getSectorTickers(slug, 200)
    const avg = Number((resp as any)?.aggregates?.avg_trailing_pe)
    if (Number.isFinite(avg) && avg > 0) return avg
    const list = Array.isArray((resp as any)?.data) ? (resp as any).data : []
    const pes = list
      .map((t: any) => Number(t?.trailing_pe))
      .filter((n: number) => Number.isFinite(n) && n > 0 && n < 100)
    if (pes.length === 0) return null
    return pes.reduce((a: number, b: number) => a + b, 0) / pes.length
  } catch {
    return null
  }
}

async function fetchAndCompute(ticker: string) {
  const safeTicker = (ticker || '').trim().toUpperCase()
  if (!safeTicker) return

  isFetching.value = true
  fetchError.value = null
  results.value = null

  try {
    const [fundamentus, dividends, details] = await Promise.all([
      getTickerFundamentus(safeTicker).catch(() => null),
      getTickerDividends(safeTicker).catch(() => [] as any[]),
      getTickerDetails(safeTicker).catch(() => null as any),
    ])

    if (!fundamentus) {
      fetchError.value = 'fundamentos não disponíveis para este ticker'
      isFetching.value = false
      return
    }

    const stats = (fundamentus as FundamentusApiResponse).key_statistics || ({} as any)
    const financial = (fundamentus as FundamentusApiResponse).financial_data || ({} as any)

    const currentPrice =
      parseFloat(financial.current_price as any) ||
      Number((details as any)?.market_price) ||
      0
    const lpa = parseFloat(stats.trailing_eps as any) || 0
    const vpa = parseFloat(stats.book_value as any) || 0
    const dyPct = parseFloat(stats.dividend_yield as any) || 0
    const stockPE = parseFloat(stats.forward_pe as any) || 0

    let annualDividend = 0
    if (Array.isArray(dividends) && dividends.length > 0) {
      const now = Date.now()
      const oneYearMs = 365 * 24 * 60 * 60 * 1000
      annualDividend = dividends.reduce((sum: number, d: any) => {
        const pd = d?.payment_date ? new Date(d.payment_date).getTime() : NaN
        if (!Number.isFinite(pd)) return sum
        if (now - pd > oneYearMs) return sum
        const rate = parseFloat(d?.rate) || 0
        return sum + rate
      }, 0)
    }
    if (!annualDividend && dyPct && currentPrice) {
      annualDividend = (dyPct / 100) * currentPrice
    }

    const sectorName =
      (details as any)?.sector || selectedAsset.value?.sector || null
    const slug = resolveSectorSlug(sectorName)
    sectorSlug.value = slug

    let sectorPE = slug ? await fetchSectorPE(slug) : null
    if (!sectorPE && stockPE > 0 && stockPE < 60) sectorPE = stockPE
    if (!sectorPE) sectorPE = 12

    form.value = {
      ticker: safeTicker,
      currentPrice,
      lpa,
      vpa,
      dividend: annualDividend,
      sectorPL: sectorPE,
    }

    calculateFairPrice()
  } catch (err: any) {
    fetchError.value = err?.message || 'erro desconhecido'
  } finally {
    isFetching.value = false
  }
}

function selectAsset(asset: IAsset) {
  selectedAsset.value = asset
  const t = (asset.ticker || asset.stock || '').toString().toUpperCase()
  form.value.ticker = t
  searchTerm.value = ''
  if (t) {
    router.replace({ query: { ...route.query, ticker: t } })
    fetchAndCompute(t)
  }
}

function selectByTicker(ticker: string) {
  const upper = ticker.toUpperCase()
  const match = (props.assets || []).find(
    (a) => (a.ticker || a.stock || '').toString().toUpperCase() === upper,
  )
  if (match) {
    selectAsset(match)
  } else {
    selectedAsset.value = {
      ticker: upper,
      stock: upper,
      name: upper,
      close: 0,
      change: 0,
      volume: 0,
      market_cap: 0,
      type: 'STOCK',
    } as IAsset
    form.value.ticker = upper
    router.replace({ query: { ...route.query, ticker: upper } })
    fetchAndCompute(upper)
  }
}

function clearSelection() {
  selectedAsset.value = null
  form.value.ticker = ''
  searchTerm.value = ''
  results.value = null
  fetchError.value = null
  sectorSlug.value = null
  const { ticker: _omit, ...rest } = route.query
  router.replace({ query: rest })
}

function calculateFairPrice() {
  const { currentPrice, lpa, vpa, dividend, sectorPL } = form.value
  if (!currentPrice || currentPrice <= 0) {
    results.value = null
    return
  }

  const grahamPrice = lpa > 0 && vpa > 0 ? Math.sqrt(22.5 * lpa * vpa) : 0
  const bazinPrice = dividend > 0 ? dividend / 0.06 : 0
  const plSectorPrice = lpa > 0 && sectorPL > 0 ? lpa * sectorPL : 0
  const bookValuePrice = vpa > 0 ? vpa * 1.5 : 0

  const calculateMetrics = (fairPrice: number): MethodResult => {
    const margin = fairPrice > 0 ? (fairPrice - currentPrice) / currentPrice : 0
    const ratio = fairPrice > 0 ? currentPrice / fairPrice : 0
    return { fairPrice, margin, ratio }
  }

  const validPrices = [grahamPrice, bazinPrice, plSectorPrice, bookValuePrice].filter((p) => p > 0)
  const averageFairPrice =
    validPrices.length > 0 ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length : 0
  const averageMargin =
    averageFairPrice > 0 ? (averageFairPrice - currentPrice) / currentPrice : 0

  let recommendation = 'Neutro'
  let explanation = ''
  if (averageMargin > 0.2) {
    recommendation = 'Comprar'
    explanation =
      'A ação está negociando com boa margem de segurança abaixo do preço teto médio. Pode ser uma oportunidade interessante, mas valide também endividamento, ROE e perspectivas do setor.'
  } else if (averageMargin >= 0) {
    recommendation = 'Neutro'
    explanation =
      'A ação está próxima do preço teto médio. Avalie outros fundamentos antes de decidir e considere esperar uma janela com mais margem de segurança.'
  } else {
    recommendation = 'Caro'
    explanation =
      'A ação está negociando acima do preço teto médio. Pode estar cara no momento, a menos que haja um catalisador claro de crescimento que justifique o prêmio.'
  }

  results.value = {
    graham: calculateMetrics(grahamPrice),
    bazin: calculateMetrics(bazinPrice),
    plSector: calculateMetrics(plSectorPrice),
    bookValue: calculateMetrics(bookValuePrice),
    consensus: { averageFairPrice, averageMargin, recommendation, explanation },
  }
}

watch(
  () => [form.value.currentPrice, form.value.lpa, form.value.vpa, form.value.dividend, form.value.sectorPL],
  () => {
    if (selectedAsset.value) calculateFairPrice()
  },
)

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) value = 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getStatusClass(ratio: number): string {
  if (!ratio) return 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'
  if (ratio <= 0.8) return 'border-[color-mix(in_srgb,var(--brand-positive)_50%,transparent)] bg-[color-mix(in_srgb,var(--brand-positive)_10%,transparent)]'
  if (ratio <= 1.0) return 'border-[color-mix(in_srgb,var(--brand-primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)]'
  return 'border-[color-mix(in_srgb,var(--brand-negative)_50%,transparent)] bg-[color-mix(in_srgb,var(--brand-negative)_10%,transparent)]'
}

function getMethodStatus(ratio: number): string {
  if (!ratio) return ''
  if (ratio <= 0.8) return 'cui-method--positive'
  if (ratio <= 1.0) return 'cui-method--neutral'
  return 'cui-method--negative'
}

function getStatusColor(ratio: number): string {
  if (!ratio) return 'neutral'
  if (ratio <= 0.8) return 'green'
  if (ratio <= 1.0) return 'yellow'
  return 'red'
}

function getStatusText(ratio: number): string {
  if (!ratio) return 'Sem dado'
  if (ratio <= 0.8) return 'Barato'
  if (ratio <= 1.0) return 'Justo'
  return 'Caro'
}

function applyQueryParams() {
  const queryTicker = (route.query.ticker as string) || props.initialTicker || ''
  if (!queryTicker) return
  // Guard: if the requested ticker is already the active one, no-op.
  // Prevents re-fetch loop with selectByTicker -> router.replace -> watcher.
  if (form.value.ticker.toUpperCase() === queryTicker.toUpperCase()) return
  selectByTicker(queryTicker)
}

onMounted(() => {
  applyQueryParams()
})

// Re-apply when query changes (user clicked a scenario chip on the same page)
// In this path, ALSO scroll to the calculator so the user sees the result.
// {immediate: false} (default) garante que o scroll do mount inicial não dispare.
watch(
  () => route.query,
  () => {
    applyQueryParams()
    scrollToCalc()
  },
  { deep: true },
)

watch(
  () => props.assets,
  (list) => {
    if (!selectedAsset.value && form.value.ticker) {
      const match = (list || []).find(
        (a) => (a.ticker || a.stock || '').toString().toUpperCase() === form.value.ticker.toUpperCase(),
      )
      if (match) selectedAsset.value = match
    }
  },
)
</script>
