<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-target" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Calcular Preço Teto</h2>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Selecione a Ação" name="ticker" class="md:col-span-2">
          <div class="flex flex-col gap-3">
            <UInput
              v-model="searchTerm"
              icon="i-lucide-search"
              placeholder="Buscar ação (ex: PETR4, ITUB4, VALE3)..."
              size="lg"
              variant="soft"
              :loading="assetsLoading"
            />
            
            <div
              v-if="searchTerm && filteredAssets.length > 0"
              class="max-h-[200px] overflow-y-auto rounded-xl border border-white/10 bg-white/5"
            >
              <button
                v-for="asset in filteredAssets.slice(0, 10)"
                :key="asset.ticker"
                type="button"
                class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10"
                @click="selectAsset(asset)"
              >
                <UAvatar
                  size="sm"
                  :src="asset.logo"
                  :alt="asset.ticker"
                  class="shrink-0"
                >
                  {{ asset.ticker?.slice(0, 2) }}
                </UAvatar>
                <div class="flex-1">
                  <p class="font-semibold text-white">{{ asset.ticker }}</p>
                  <p class="text-xs text-gray-400 line-clamp-1">{{ asset.name }}</p>
                </div>
              </button>
            </div>

            <div v-if="selectedAsset" class="flex items-center gap-3 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3">
              <UAvatar
                size="md"
                :src="selectedAsset.logo"
                :alt="selectedAsset.ticker"
              >
                {{ selectedAsset.ticker?.slice(0, 2) }}
              </UAvatar>
              <div class="flex-1">
                <p class="font-semibold text-white">{{ selectedAsset.ticker }}</p>
                <p class="text-sm text-gray-300">{{ selectedAsset.name }}</p>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="clearSelection"
              />
            </div>
          </div>
        </UFormField>

        <UFormField label="Preço Atual (R$)" name="currentPrice">
          <AtomsFormCurrencyInput
            v-model="form.currentPrice"
            placeholder="25,00"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Lucro por Ação - LPA (R$)" name="lpa">
          <AtomsFormCurrencyInput
            v-model="form.lpa"
            placeholder="3,50"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Valor Patrimonial - VPA (R$)" name="vpa">
          <AtomsFormCurrencyInput
            v-model="form.vpa"
            placeholder="15,00"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Dividendo Anual (R$)" name="dividend">
          <AtomsFormCurrencyInput
            v-model="form.dividend"
            placeholder="1,50"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="P/L Médio do Setor" name="sectorPL">
          <UInput
            v-model.number="form.sectorPL"
            type="number"
            step="0.1"
            placeholder="12"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>
      </div>

      <UButton
        color="secondary"
        size="xl"
        block
        icon="i-lucide-calculator"
        @click="calculateFairPrice"
      >
        Calcular Preço Teto
      </UButton>
    </div>

    <div v-if="results" class="flex flex-col gap-6 rounded-[30px] p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-chart-no-axes-combined" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">Resultados - {{ form.ticker }}</h3>
      </div>

      <!-- Preço Atual -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-4">
        <p class="mb-2 text-sm text-gray-400">Preço Atual no Mercado</p>
        <p class="text-3xl font-bold text-white">
          {{ formatCurrency(form.currentPrice) }}
        </p>
      </div>

      <!-- Metodologias -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <!-- Graham -->
        <div
          class="rounded-xl border p-4"
          :class="getStatusClass(results.graham.ratio)"
        >
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-semibold text-white">Fórmula de Graham</h4>
            <UBadge :color="getStatusColor(results.graham.ratio)" variant="soft">
              {{ getStatusText(results.graham.ratio) }}
            </UBadge>
          </div>
          <p class="mb-1 text-2xl font-bold text-white">
            {{ formatCurrency(results.graham.fairPrice) }}
          </p>
          <p class="text-sm text-gray-400">
            Margem: {{ (results.graham.margin * 100).toFixed(1) }}%
          </p>
          <p class="mt-2 text-xs text-gray-500">
            √(22.5 × LPA × VPA)
          </p>
        </div>

        <!-- Bazin -->
        <div
          class="rounded-xl border p-4"
          :class="getStatusClass(results.bazin.ratio)"
        >
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-semibold text-white">Método Bazin</h4>
            <UBadge :color="getStatusColor(results.bazin.ratio)" variant="soft">
              {{ getStatusText(results.bazin.ratio) }}
            </UBadge>
          </div>
          <p class="mb-1 text-2xl font-bold text-white">
            {{ formatCurrency(results.bazin.fairPrice) }}
          </p>
          <p class="text-sm text-gray-400">
            Margem: {{ (results.bazin.margin * 100).toFixed(1) }}%
          </p>
          <p class="mt-2 text-xs text-gray-500">
            Dividendo ÷ 0.06 (DY mín 6%)
          </p>
        </div>

        <!-- P/L Setorial -->
        <div
          class="rounded-xl border p-4"
          :class="getStatusClass(results.plSector.ratio)"
        >
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-semibold text-white">P/L Setorial</h4>
            <UBadge :color="getStatusColor(results.plSector.ratio)" variant="soft">
              {{ getStatusText(results.plSector.ratio) }}
            </UBadge>
          </div>
          <p class="mb-1 text-2xl font-bold text-white">
            {{ formatCurrency(results.plSector.fairPrice) }}
          </p>
          <p class="text-sm text-gray-400">
            Margem: {{ (results.plSector.margin * 100).toFixed(1) }}%
          </p>
          <p class="mt-2 text-xs text-gray-500">
            LPA × P/L Médio do Setor
          </p>
        </div>

        <!-- Valor Patrimonial -->
        <div
          class="rounded-xl border p-4"
          :class="getStatusClass(results.bookValue.ratio)"
        >
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-semibold text-white">Valor Patrimonial</h4>
            <UBadge :color="getStatusColor(results.bookValue.ratio)" variant="soft">
              {{ getStatusText(results.bookValue.ratio) }}
            </UBadge>
          </div>
          <p class="mb-1 text-2xl font-bold text-white">
            {{ formatCurrency(results.bookValue.fairPrice) }}
          </p>
          <p class="text-sm text-gray-400">
            Margem: {{ (results.bookValue.margin * 100).toFixed(1) }}%
          </p>
          <p class="mt-2 text-xs text-gray-500">
            VPA × 1.5 (margem Graham)
          </p>
        </div>
      </div>

      <!-- Consenso -->
      <div class="rounded-xl border border-secondary/30 bg-secondary/10 p-6">
        <div class="mb-4 flex items-center gap-3">
          <UIcon name="i-lucide-trending-up" class="text-secondary size-6" />
          <h4 class="text-xl font-bold text-white">Consenso das Metodologias</h4>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p class="mb-1 text-sm text-gray-400">Preço Teto Médio</p>
            <p class="text-2xl font-bold text-secondary">
              {{ formatCurrency(results.consensus.averageFairPrice) }}
            </p>
          </div>
          <div>
            <p class="mb-1 text-sm text-gray-400">Margem de Segurança Média</p>
            <p class="text-2xl font-bold text-white">
              {{ (results.consensus.averageMargin * 100).toFixed(1) }}%
            </p>
          </div>
          <div>
            <p class="mb-1 text-sm text-gray-400">Recomendação</p>
            <p
              class="text-2xl font-bold"
              :class="{
                'text-green-400': results.consensus.recommendation === 'Comprar',
                'text-yellow-400': results.consensus.recommendation === 'Neutro',
                'text-red-400': results.consensus.recommendation === 'Caro',
              }"
            >
              {{ results.consensus.recommendation }}
            </p>
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-300">
          {{ results.consensus.explanation }}
        </p>
      </div>

      <!-- Gráfico Comparativo -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 class="mb-4 font-semibold text-white">Comparação Visual</h4>
        <div class="space-y-3">
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-gray-400">Preço Atual</span>
              <span class="font-semibold text-white">{{ formatCurrency(form.currentPrice) }}</span>
            </div>
            <div class="h-2 w-full rounded-full bg-white/10">
              <div
                class="h-2 rounded-full bg-white"
                :style="{ width: '100%' }"
              />
            </div>
          </div>
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-gray-400">Graham</span>
              <span class="font-semibold text-white">{{ formatCurrency(results.graham.fairPrice) }}</span>
            </div>
            <div class="h-2 w-full rounded-full bg-white/10">
              <div
                class="h-2 rounded-full bg-green-400"
                :style="{ width: `${Math.min(100, (results.graham.fairPrice / form.currentPrice) * 100)}%` }"
              />
            </div>
          </div>
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-gray-400">Bazin</span>
              <span class="font-semibold text-white">{{ formatCurrency(results.bazin.fairPrice) }}</span>
            </div>
            <div class="h-2 w-full rounded-full bg-white/10">
              <div
                class="h-2 rounded-full bg-blue-400"
                :style="{ width: `${Math.min(100, (results.bazin.fairPrice / form.currentPrice) * 100)}%` }"
              />
            </div>
          </div>
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-gray-400">P/L Setorial</span>
              <span class="font-semibold text-white">{{ formatCurrency(results.plSector.fairPrice) }}</span>
            </div>
            <div class="h-2 w-full rounded-full bg-white/10">
              <div
                class="h-2 rounded-full bg-purple-400"
                :style="{ width: `${Math.min(100, (results.plSector.fairPrice / form.currentPrice) * 100)}%` }"
              />
            </div>
          </div>
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-gray-400">Valor Patrimonial</span>
              <span class="font-semibold text-white">{{ formatCurrency(results.bookValue.fairPrice) }}</span>
            </div>
            <div class="h-2 w-full rounded-full bg-white/10">
              <div
                class="h-2 rounded-full bg-orange-400"
                :style="{ width: `${Math.min(100, (results.bookValue.fairPrice / form.currentPrice) * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <div class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
        <strong>Atenção:</strong> O preço teto é uma referência, não uma garantia. Analise sempre os fundamentos da empresa, perspectivas futuras e seu perfil de risco antes de investir.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'

interface Props {
  assets?: IAsset[]
  assetsLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  assets: () => [],
  assetsLoading: false,
})

const searchTerm = ref('')
const selectedAsset = ref<IAsset | null>(null)

const filteredAssets = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return []

  return (props.assets || [])
    .filter((asset) => {
      const type = (asset.type || '').toString().toUpperCase()
      if (type !== 'STOCK') return false
      
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
  currentPrice: 0,
  lpa: 0, // Lucro por Ação
  vpa: 0, // Valor Patrimonial por Ação
  dividend: 0, // Dividendo anual
  sectorPL: 12, // P/L médio do setor
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

function calculateFairPrice() {
  const { currentPrice, lpa, vpa, dividend, sectorPL } = form.value

  if (!currentPrice || currentPrice <= 0) {
    alert('Preencha o preço atual da ação')
    return
  }

  // Fórmula de Graham: √(22.5 × LPA × VPA)
  const grahamPrice = lpa && vpa ? Math.sqrt(22.5 * lpa * vpa) : 0

  // Método Bazin: Dividendo ÷ 0.06 (DY mínimo de 6%)
  const bazinPrice = dividend ? dividend / 0.06 : 0

  // P/L Setorial: LPA × P/L Médio
  const plSectorPrice = lpa && sectorPL ? lpa * sectorPL : 0

  // Valor Patrimonial: VPA × 1.5 (margem de segurança de Graham)
  const bookValuePrice = vpa ? vpa * 1.5 : 0

  // Calcular margens e ratios
  const calculateMetrics = (fairPrice: number): MethodResult => {
    const margin = fairPrice > 0 ? (fairPrice - currentPrice) / currentPrice : 0
    const ratio = fairPrice > 0 ? currentPrice / fairPrice : 0
    return { fairPrice, margin, ratio }
  }

  const grahamResult = calculateMetrics(grahamPrice)
  const bazinResult = calculateMetrics(bazinPrice)
  const plSectorResult = calculateMetrics(plSectorPrice)
  const bookValueResult = calculateMetrics(bookValuePrice)

  // Consenso (média das metodologias válidas)
  const validPrices = [grahamPrice, bazinPrice, plSectorPrice, bookValuePrice].filter(p => p > 0)
  const averageFairPrice = validPrices.length > 0
    ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
    : 0

  const averageMargin = averageFairPrice > 0
    ? (averageFairPrice - currentPrice) / currentPrice
    : 0

  let recommendation = 'Neutro'
  let explanation = ''

  if (averageMargin > 0.20) {
    recommendation = 'Comprar'
    explanation = 'A ação está negociando com boa margem de segurança abaixo do preço teto médio. Pode ser uma oportunidade interessante.'
  } else if (averageMargin > 0) {
    recommendation = 'Neutro'
    explanation = 'A ação está próxima do preço teto médio. Avalie outros fundamentos antes de decidir.'
  } else {
    recommendation = 'Caro'
    explanation = 'A ação está negociando acima do preço teto médio. Pode estar cara no momento.'
  }

  results.value = {
    graham: grahamResult,
    bazin: bazinResult,
    plSector: plSectorResult,
    bookValue: bookValueResult,
    consensus: {
      averageFairPrice,
      averageMargin,
      recommendation,
      explanation,
    },
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getStatusClass(ratio: number): string {
  if (ratio <= 0.8) return 'border-green-500/50 bg-green-500/10'
  if (ratio <= 1.0) return 'border-yellow-500/50 bg-yellow-500/10'
  return 'border-red-500/50 bg-red-500/10'
}

function getStatusColor(ratio: number): string {
  if (ratio <= 0.8) return 'green'
  if (ratio <= 1.0) return 'yellow'
  return 'red'
}

function getStatusText(ratio: number): string {
  if (ratio <= 0.8) return 'Barato'
  if (ratio <= 1.0) return 'Justo'
  return 'Caro'
}
</script>
