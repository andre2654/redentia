<template>
  <CalcUiShell
    :back-to="backTo"
    :back-label="backLabel"
    :last-updated="lastUpdated"
  >
    <template #hero>
      <slot name="hero">
        <p class="calc-eyebrow">Calculadora · Dividend Yield</p>
        <h1 class="calc-title">Calculadora de Dividend Yield</h1>
        <p class="calc-lead">DY atual, projetado e on cost de ações e FIIs da B3.</p>
      </slot>
    </template>

    <template #form>
      <p class="cui-section-label">{{ results ? 'Ajustar simulação' : 'Configure sua simulação' }}</p>
      <CalcUiField label="Escolha o modo">
        <CalcUiSegmented
          v-model="mode"
          :options="[
            { value: 'simple', label: 'Cálculo Simples' },
            { value: 'onCost', label: 'DY On Cost' },
            { value: 'projection', label: 'Projeção' },
          ]"
          aria-label="Modo de cálculo"
        />
      </CalcUiField>

      <!-- Modo Simples -->
      <template v-if="mode === 'simple'">
        <CalcUiAssetSearch
          v-model="searchTerm"
          :results="filteredAssets"
          :loading="assetsLoading"
          label="Selecione o ativo"
          placeholder="Buscar ação ou FII..."
          @select="selectAsset"
        />

        <div v-if="selectedAsset" class="cui-selected-asset">
          <UAvatar size="md" :src="selectedAsset.logo" :alt="selectedAsset.ticker">
            {{ selectedAsset.ticker?.slice(0, 2) }}
          </UAvatar>
          <div class="cui-selected-asset-info">
            <p class="cui-selected-asset-ticker">{{ selectedAsset.ticker }}</p>
            <p class="cui-selected-asset-name">{{ selectedAsset.name }}</p>
          </div>
          <button class="cui-selected-asset-clear" type="button" @click="clearSelection">
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
          <CalcUiField label="Preço da Ação (R$)" type="currency" v-model="form.price" placeholder="25,00" />
          <CalcUiField label="Dividendos Anuais (R$)" type="currency" v-model="form.annualDividend" placeholder="1,50" />
        </div>
      </template>

      <!-- Modo On Cost -->
      <div v-else-if="mode === 'onCost'" class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
        <CalcUiField label="Preço de Compra (R$)" type="currency" v-model="form.purchasePrice" placeholder="20,00" />
        <CalcUiField label="Preço Atual (R$)" type="currency" v-model="form.currentPrice" placeholder="25,00" />
        <CalcUiField label="Dividendos Anuais Atuais (R$)" type="currency" v-model="form.currentDividend" placeholder="1,50" />
      </div>

      <!-- Modo Projeção -->
      <div v-else class="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
        <CalcUiField label="Preço da Ação (R$)" type="currency" v-model="form.priceProjection" placeholder="25,00" />
        <CalcUiField label="Lucro por Ação - LPA (R$)" type="currency" v-model="form.lpa" placeholder="3,00" />
        <CalcUiField label="Payout Ratio (%)" type="percentage" v-model="form.payout" :min="0" :max="100" placeholder="50" />
        <CalcUiField label="Crescimento do Lucro (% a.a.)" type="percentage" v-model="form.growth" :min="-50" :max="100" placeholder="10" />
      </div>

      <CalcUiButton label="Calcular Dividend Yield" icon="i-lucide-sparkles" @click="calculate" />
    </template>

    <template #result>
      <CalcUiResultMega
        v-if="results"
        :eyebrow="results.label"
        :value="`${results.dy.toFixed(2)}%`"
        mega-color="primary"
      >
        <template #caption>{{ results.description }}</template>
      </CalcUiResultMega>
      <div v-else class="cui-result-empty">
        <p class="cui-result-eyebrow">Dividend Yield</p>
        <p class="cui-empty-text">Preencha os dados ao lado e clique em "Calcular Dividend Yield".</p>
      </div>
    </template>

    <template #chart>
      <div v-if="results" class="flex flex-col gap-4">

      <!-- Detalhes por Modo: Simples -->
      <div v-if="mode === 'simple'" class="cui-subcard">
        <h4 class="cui-subcard-title">Composição do cálculo</h4>
        <div class="cui-subcard-grid cui-subcard-grid--3">
          <CalcUiKpiBox label="Preço da ação" :value="formatCurrency(form.price)" color="heading" />
          <CalcUiKpiBox label="Dividendos anuais" :value="formatCurrency(form.annualDividend)" color="heading" />
          <CalcUiKpiBox label="Dividendos mensais" :value="formatCurrency(form.annualDividend / 12)" color="positive" />
        </div>
      </div>

      <!-- Detalhes por Modo: On Cost -->
      <div v-else-if="mode === 'onCost'" class="cui-subcard">
        <h4 class="cui-subcard-title">DY on cost vs preço atual</h4>
        <div class="cui-subcard-grid cui-subcard-grid--2">
          <CalcUiKpiBox label="DY no preço de compra" :value="`${results.dyOnCost.toFixed(2)}%`" color="primary" caption="Seu retorno real sobre o investimento" />
          <CalcUiKpiBox label="DY no preço atual" :value="`${results.dyCurrent.toFixed(2)}%`" color="heading" caption="Retorno para quem comprar hoje" />
          <CalcUiKpiBox label="Valorização" :value="`${results.appreciation >= 0 ? '+' : ''}${results.appreciation.toFixed(1)}%`" :color="results.appreciation >= 0 ? 'positive' : 'negative'" />
          <CalcUiKpiBox label="Ganho total anual" :value="`${results.totalReturn.toFixed(2)}%`" color="primary" caption="DY + Valorização" />
        </div>
      </div>

      <!-- Detalhes por Modo: Projeção -->
      <div v-else class="cui-subcard">
        <h4 class="cui-subcard-title">Projeção do dividend yield</h4>
        <div class="cui-subcard-grid cui-subcard-grid--3">
          <CalcUiKpiBox label="DY atual" :value="`${results.currentDY.toFixed(2)}%`" color="heading" />
          <CalcUiKpiBox label="DY projetado (1 ano)" :value="`${results.projectedDY1y.toFixed(2)}%`" color="primary" />
          <CalcUiKpiBox label="DY projetado (3 anos)" :value="`${results.projectedDY3y.toFixed(2)}%`" color="positive" />
        </div>
      </div>

      <!-- Análise -->
      <div class="cui-subcard">
        <h4 class="cui-subcard-title">Análise do dividend yield</h4>
        <div class="cui-info-list">
          <div v-if="results.dy < 3" class="cui-info-item">
            <UIcon name="i-lucide-info" class="cui-info-icon" />
            <p class="cui-info-text">DY abaixo de 3% é considerado baixo. Pode indicar empresa de crescimento ou ação cara.</p>
          </div>
          <div v-else-if="results.dy >= 3 && results.dy < 6" class="cui-info-item">
            <UIcon name="i-lucide-check" class="cui-info-icon" style="color: var(--brand-positive)" />
            <p class="cui-info-text">DY entre 3-6% é considerado bom para ações. Equilibra dividendos e crescimento.</p>
          </div>
          <div v-else-if="results.dy >= 6 && results.dy < 10" class="cui-info-item">
            <UIcon name="i-lucide-trending-up" class="cui-info-icon" />
            <p class="cui-info-text">DY entre 6-10% é excelente! Típico de boas pagadoras de dividendos ou FIIs.</p>
          </div>
          <div v-else class="cui-info-item">
            <UIcon name="i-lucide-alert-triangle" class="cui-info-icon" />
            <p class="cui-info-text">DY muito alto (>10%) pode indicar: ação em queda, dividendo extraordinário ou risco elevado. Investigue!</p>
          </div>
        </div>
      </div>

      <div class="cui-callout">
        <strong>Dica:</strong> Dividend Yield alto não é sempre bom. Verifique se os dividendos são sustentáveis analisando o Payout Ratio (ideal 40-60% para ações, 95%+ para FIIs).
      </div>
      </div>
      <div v-else class="cui-result-empty">
        <p class="cui-chart-label">Análise e dicas</p>
        <p class="cui-empty-text">Detalhamento aparece após o cálculo.</p>
      </div>
    </template>
  </CalcUiShell>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'

interface Props {
  assets?: IAsset[]
  assetsLoading?: boolean
  backTo?: string
  backLabel?: string
  lastUpdated?: string
}

const props = withDefaults(defineProps<Props>(), {
  assets: () => [],
  assetsLoading: false,
})

const mode = ref<'simple' | 'onCost' | 'projection'>('simple')
const searchTerm = ref('')
const selectedAsset = ref<IAsset | null>(null)
const route = useRoute()

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

const filteredAssets = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return []

  return (props.assets || [])
    .filter((asset) => {
      const type = (asset.type || '').toString().toUpperCase()
      if (type !== 'STOCK' && type !== 'FUND') return false
      
      const ticker = (asset.ticker || '').toLowerCase()
      const name = (asset.name || '').toLowerCase()
      return ticker.includes(term) || name.includes(term)
    })
    .slice(0, 10)
})

function selectAsset(asset: IAsset) {
  selectedAsset.value = asset
  form.value.ticker = asset.ticker || ''
  searchTerm.value = ''
}

function clearSelection() {
  selectedAsset.value = null
  form.value.ticker = ''
  searchTerm.value = ''
}

const form = ref({
  ticker: '',
  // Simple
  price: 0,
  annualDividend: 0,
  // On Cost
  purchasePrice: 0,
  currentPrice: 0,
  currentDividend: 0,
  // Projection
  priceProjection: 0,
  lpa: 0,
  payout: 50,
  growth: 10,
})

// ====================================================================
// Deep-link via query params — abilita URLs canonicas para landings
// virtuais (ex: /calculadora/dividend-yield?ticker=PETR4 ou
// ?price=28&dividend=1.80). Cada combinacao vira indexavel pelo
// Google sem duplicar a pagina, capturando long-tails como
// "calcular dividend yield ITUB4", "DY on cost PETR4", etc.
//
// Params suportados:
//   ?ticker=PETR4         pre-seleciona ativo da lista (Modo Simples)
//   ?price=28             preco da acao (Modo Simples / Projecao)
//   ?dividend=1.80        dividendos anuais (Modo Simples)
//   ?purchase=20          preco de compra (Modo On Cost)
//   ?current=30           preco atual (Modo On Cost)
//   ?div=1.50             dividendo atual (Modo On Cost)
//   ?lpa=3                lucro por acao (Modo Projecao)
//   ?payout=50            payout em % (Modo Projecao)
//   ?growth=10            crescimento em % a.a. (Modo Projecao)
//   ?mode=simple|onCost|projection
//   ?auto=1               dispara o calculo apos hidratar
// ====================================================================

function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const normalized = raw.replace(',', '.')
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

function parseStringParam(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  return raw.trim()
}

// Tenta casar ticker com props.assets pra preencher selectedAsset.
// Roda no mount + sempre que assets terminar de carregar.
function tryPreselectFromTicker(ticker: string) {
  const upper = ticker.toUpperCase()
  form.value.ticker = upper
  const match = (props.assets || []).find(
    (a) => (a.ticker || '').toUpperCase() === upper
  )
  if (match) selectedAsset.value = match
}

const initialQuery = ref({
  ticker: parseStringParam(route.query.ticker),
  price: parseNumberParam(route.query.price),
  dividend: parseNumberParam(route.query.dividend),
  purchase: parseNumberParam(route.query.purchase),
  current: parseNumberParam(route.query.current),
  div: parseNumberParam(route.query.div),
  lpa: parseNumberParam(route.query.lpa),
  payout: parseNumberParam(route.query.payout),
  growth: parseNumberParam(route.query.growth),
  mode: parseStringParam(route.query.mode),
  auto: parseStringParam(route.query.auto),
})

function applyQueryParams() {
  const rq = route.query
  // Refresh initialQuery from current route.query (used by the assets watcher)
  initialQuery.value = {
    ticker: parseStringParam(rq.ticker),
    price: parseNumberParam(rq.price),
    dividend: parseNumberParam(rq.dividend),
    purchase: parseNumberParam(rq.purchase),
    current: parseNumberParam(rq.current),
    div: parseNumberParam(rq.div),
    lpa: parseNumberParam(rq.lpa),
    payout: parseNumberParam(rq.payout),
    growth: parseNumberParam(rq.growth),
    mode: parseStringParam(rq.mode),
    auto: parseStringParam(rq.auto),
  }
  const q = initialQuery.value

  // Modo: prioriza ?mode= explicito; senao infere pelos params presentes.
  if (q.mode === 'simple' || q.mode === 'onCost' || q.mode === 'projection') {
    mode.value = q.mode
  } else if (q.purchase !== null || q.current !== null || q.div !== null) {
    mode.value = 'onCost'
  } else if (q.lpa !== null || q.payout !== null || q.growth !== null) {
    mode.value = 'projection'
  }

  // Simples
  if (q.price !== null) {
    form.value.price = q.price
    form.value.priceProjection = q.price
  }
  if (q.dividend !== null) form.value.annualDividend = q.dividend

  // On Cost
  if (q.purchase !== null) form.value.purchasePrice = q.purchase
  if (q.current !== null) form.value.currentPrice = q.current
  if (q.div !== null) form.value.currentDividend = q.div

  // Projection
  if (q.lpa !== null) form.value.lpa = q.lpa
  if (q.payout !== null) form.value.payout = q.payout
  if (q.growth !== null) form.value.growth = q.growth

  // Ticker pode chegar antes ou depois de assets carregar — primeira tentativa.
  if (q.ticker) tryPreselectFromTicker(q.ticker)

  // Verifica se temos inputs numericos suficientes pro modo atual antes de
  // disparar o calculo automatico, pra evitar o alert() de "preencha tudo"
  // quando o usuario chega via deep-link parcial (ex: so ticker).
  const canCalcSimple = q.price !== null && q.dividend !== null
  const canCalcOnCost =
    q.purchase !== null && q.current !== null && q.div !== null
  const canCalcProjection =
    q.lpa !== null && q.payout !== null && q.price !== null

  const shouldAutoCalc =
    (mode.value === 'simple' && canCalcSimple) ||
    (mode.value === 'onCost' && canCalcOnCost) ||
    (mode.value === 'projection' && canCalcProjection) ||
    q.auto === '1' ||
    q.auto === 'true'

  if (shouldAutoCalc) {
    nextTick(() => calculate())
  }
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

// Quando assets terminar de carregar (vem da page via prop), tenta de
// novo preencher ticker selecionado, caso o usuario tenha chegado
// via URL antes da lista hidratar.
watch(
  () => props.assets,
  (assets) => {
    if (!assets || assets.length === 0) return
    const ticker = initialQuery.value.ticker || form.value.ticker
    if (ticker && !selectedAsset.value) tryPreselectFromTicker(ticker)
  },
  { immediate: false }
)

interface Results {
  label: string
  description: string
  dy: number
  dyOnCost?: number
  dyCurrent?: number
  appreciation?: number
  totalReturn?: number
  currentDY?: number
  projectedDY1y?: number
  projectedDY3y?: number
}

const results = ref<Results | null>(null)

function calculate() {
  if (mode.value === 'simple') {
    const { price, annualDividend } = form.value
    if (!price || !annualDividend) {
      alert('Preencha todos os campos')
      return
    }

    const dy = (annualDividend / price) * 100

    results.value = {
      label: 'Dividend Yield Atual',
      description: `Com base no preço de R$ ${price.toFixed(2)}, o DY anual é de ${dy.toFixed(2)}%`,
      dy,
    }
  } else if (mode.value === 'onCost') {
    const { purchasePrice, currentPrice, currentDividend } = form.value
    if (!purchasePrice || !currentPrice || !currentDividend) {
      alert('Preencha todos os campos')
      return
    }

    const dyOnCost = (currentDividend / purchasePrice) * 100
    const dyCurrent = (currentDividend / currentPrice) * 100
    const appreciation = ((currentPrice - purchasePrice) / purchasePrice) * 100
    const totalReturn = dyOnCost + appreciation

    results.value = {
      label: 'Dividend Yield On Cost',
      description: `Seu retorno anual real considerando seu preço de compra`,
      dy: dyOnCost,
      dyOnCost,
      dyCurrent,
      appreciation,
      totalReturn,
    }
  } else {
    const { priceProjection, lpa, payout, growth } = form.value
    if (!priceProjection || !lpa || !payout) {
      alert('Preencha todos os campos')
      return
    }

    const currentDividend = lpa * (payout / 100)
    const currentDY = (currentDividend / priceProjection) * 100

    const lpa1y = lpa * (1 + growth / 100)
    const dividend1y = lpa1y * (payout / 100)
    const projectedDY1y = (dividend1y / priceProjection) * 100

    const lpa3y = lpa * Math.pow(1 + growth / 100, 3)
    const dividend3y = lpa3y * (payout / 100)
    const projectedDY3y = (dividend3y / priceProjection) * 100

    results.value = {
      label: 'Projeção de Dividend Yield',
      description: `Baseado em crescimento de ${growth}% a.a. do lucro`,
      dy: currentDY,
      currentDY,
      projectedDY1y,
      projectedDY3y,
    }
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
</script>
