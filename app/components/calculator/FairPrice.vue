<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-target" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Calcular Preço Teto</h2>
      </div>

      <div v-if="!selectedAsset" class="flex flex-col gap-3">
        <label class="flex items-center justify-between">
          <span class="text-sm font-semibold text-white">Selecione a ação</span>
          <span class="hidden items-center gap-1 text-[11px] uppercase tracking-wider text-gray-500 md:flex">
            <UIcon name="i-lucide-keyboard" class="size-3" />
            Digite o ticker ou nome da empresa
          </span>
        </label>

        <div class="relative">
          <div
            class="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/20 via-transparent to-secondary/20 opacity-0 blur-xl transition-opacity"
            :class="{ 'opacity-100': isSearchFocused }"
          />
          <div
            class="relative flex items-center gap-3 rounded-2xl border bg-white/5 px-4 py-3 backdrop-blur transition-all"
            :class="isSearchFocused ? 'border-secondary/50 bg-white/10 shadow-lg shadow-secondary/10' : 'border-white/10'"
          >
            <UIcon
              :name="assetsLoading ? 'i-lucide-loader-circle' : 'i-lucide-search'"
              class="size-5 shrink-0 text-gray-400"
              :class="{ 'animate-spin': assetsLoading }"
            />
            <input
              v-model="searchTerm"
              type="text"
              class="flex-1 bg-transparent text-base font-medium text-white placeholder:text-gray-500 focus:outline-none md:text-lg"
              placeholder="Ex: PETR4, Petrobras, Itaú..."
              spellcheck="false"
              autocomplete="off"
              @focus="isSearchFocused = true"
              @blur="handleSearchBlur"
            />
            <button
              v-if="searchTerm"
              type="button"
              class="flex size-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Limpar busca"
              @click="searchTerm = ''"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
            <span
              v-else
              class="hidden items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 md:flex"
            >
              /
            </span>
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div
            v-if="searchTerm && filteredAssets.length > 0"
            class="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d10]/95 shadow-2xl backdrop-blur"
          >
            <div class="flex items-center justify-between border-b border-white/5 px-4 py-2 text-[11px] uppercase tracking-wider text-gray-500">
              <span>{{ filteredAssets.length }} resultado{{ filteredAssets.length === 1 ? '' : 's' }}</span>
              <span>Ação · B3</span>
            </div>
            <div class="max-h-[300px] divide-y divide-white/5 overflow-y-auto">
              <button
                v-for="asset in filteredAssets.slice(0, 10)"
                :key="asset.ticker || asset.stock"
                type="button"
                class="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                @mousedown.prevent="selectAsset(asset)"
              >
                <div class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img
                    v-if="asset.logo"
                    :src="asset.logo"
                    :alt="asset.ticker || asset.stock"
                    class="size-full object-contain"
                    loading="lazy"
                  />
                  <span v-else class="text-xs font-bold text-secondary">
                    {{ (asset.ticker || asset.stock || '').slice(0, 2) }}
                  </span>
                </div>
                <div class="flex min-w-0 flex-1 flex-col">
                  <span class="font-mono text-sm font-bold tracking-wide text-white">
                    {{ (asset.ticker || asset.stock || '').toUpperCase() }}
                  </span>
                  <span class="truncate text-xs text-gray-400">
                    {{ asset.name }}
                  </span>
                </div>
                <span
                  v-if="asset.sector"
                  class="hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-300 md:block"
                >
                  {{ asset.sector }}
                </span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 shrink-0 text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-secondary"
                />
              </button>
            </div>
          </div>
        </Transition>

        <div
          v-if="searchTerm && filteredAssets.length === 0 && !assetsLoading"
          class="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400"
        >
          <UIcon name="i-lucide-search-x" class="size-5 text-gray-500" />
          <span>
            Nenhuma ação encontrada para
            <strong class="text-white">"{{ searchTerm }}"</strong>. Tente um ticker como PETR4 ou ITUB4.
          </span>
        </div>
      </div>

      <div
        v-else
        class="group relative overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 via-secondary/5 to-transparent p-5"
      >
        <div class="absolute -right-10 -top-10 size-40 rounded-full bg-secondary/20 blur-3xl" />

        <div class="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-4">
            <div class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-xl shadow-secondary/10">
              <img
                v-if="selectedAsset.logo"
                :src="selectedAsset.logo"
                :alt="selectedAsset.ticker || selectedAsset.stock"
                class="size-full object-contain"
              />
              <span v-else class="font-mono text-lg font-bold text-secondary">
                {{ (selectedAsset.ticker || selectedAsset.stock || '').slice(0, 2) }}
              </span>
            </div>
            <div class="flex min-w-0 flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xl font-bold tracking-wide text-white md:text-2xl">
                  {{ (selectedAsset.ticker || selectedAsset.stock || '').toUpperCase() }}
                </span>
                <span class="rounded-md border border-secondary/30 bg-secondary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Selecionada
                </span>
              </div>
              <p class="truncate text-sm text-gray-300">{{ selectedAsset.name }}</p>
              <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span
                  v-if="selectedAsset.sector"
                  class="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-300"
                >
                  <UIcon name="i-lucide-layers" class="size-3 text-secondary" />
                  {{ selectedAsset.sector }}
                </span>
                <span
                  v-if="(selectedAsset.type || '').toString().toUpperCase()"
                  class="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-300"
                >
                  {{ (selectedAsset.type || '').toString().toUpperCase() }}
                </span>
                <span
                  class="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-300"
                >
                  <UIcon name="i-lucide-building-2" class="size-3 text-blue-400" />
                  B3
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="flex shrink-0 items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white md:self-center"
            @click="clearSelection"
          >
            <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
            Trocar ação
          </button>
        </div>
      </div>

      <div
        v-if="isFetching"
        class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-300"
      >
        <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-secondary" />
        Buscando fundamentos e calculando todas as metodologias...
      </div>

      <div
        v-if="fetchError && !isFetching"
        class="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
      >
        <strong>Não foi possível carregar os fundamentos:</strong> {{ fetchError }}. Tente outra ação ou preencha os campos manualmente no modo avançado.
      </div>

      <details v-if="selectedAsset" class="group rounded-xl border border-white/10 bg-white/5 p-4">
        <summary class="flex cursor-pointer items-center justify-between text-sm font-semibold text-white list-none">
          <span class="flex items-center gap-2">
            <UIcon name="i-lucide-sliders-horizontal" class="size-4 text-secondary" />
            Ajuste manual (opcional)
          </span>
          <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform group-open:rotate-180" />
        </summary>

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </details>
    </div>

    <div v-if="results && selectedAsset" class="flex flex-col gap-6 rounded-[30px] p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-chart-no-axes-combined" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">
          Resultados — {{ form.ticker }}
        </h3>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div class="rounded-xl border border-white/10 bg-white/5 p-3">
          <p class="text-xs text-gray-400">Preço Atual</p>
          <p class="mt-1 text-lg font-bold text-white tabular-nums">{{ formatCurrency(form.currentPrice) }}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3">
          <p class="text-xs text-gray-400">LPA (12m)</p>
          <p class="mt-1 text-lg font-bold text-white tabular-nums">{{ formatCurrency(form.lpa) }}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3">
          <p class="text-xs text-gray-400">VPA</p>
          <p class="mt-1 text-lg font-bold text-white tabular-nums">{{ formatCurrency(form.vpa) }}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3">
          <p class="text-xs text-gray-400">Dividendo 12m</p>
          <p class="mt-1 text-lg font-bold text-white tabular-nums">{{ formatCurrency(form.dividend) }}</p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-3">
          <p class="text-xs text-gray-400">P/L Setor</p>
          <p class="mt-1 text-lg font-bold text-white tabular-nums">{{ form.sectorPL.toFixed(1) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-xl border p-4" :class="getStatusClass(results.graham.ratio)">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-semibold text-white">Fórmula de Graham</h4>
            <UBadge :color="getStatusColor(results.graham.ratio)" variant="soft">
              {{ getStatusText(results.graham.ratio) }}
            </UBadge>
          </div>
          <p class="mb-1 text-2xl font-bold text-white">
            {{ formatCurrency(results.graham.fairPrice) }}
          </p>
          <p class="text-sm text-gray-400">Margem: {{ (results.graham.margin * 100).toFixed(1) }}%</p>
          <p class="mt-2 text-xs text-gray-500">√(22.5 × LPA × VPA)</p>
        </div>

        <div class="rounded-xl border p-4" :class="getStatusClass(results.bazin.ratio)">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-semibold text-white">Método Bazin</h4>
            <UBadge :color="getStatusColor(results.bazin.ratio)" variant="soft">
              {{ getStatusText(results.bazin.ratio) }}
            </UBadge>
          </div>
          <p class="mb-1 text-2xl font-bold text-white">
            {{ formatCurrency(results.bazin.fairPrice) }}
          </p>
          <p class="text-sm text-gray-400">Margem: {{ (results.bazin.margin * 100).toFixed(1) }}%</p>
          <p class="mt-2 text-xs text-gray-500">Dividendo ÷ 0.06 (DY mín 6%)</p>
        </div>

        <div class="rounded-xl border p-4" :class="getStatusClass(results.plSector.ratio)">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-semibold text-white">P/L Setorial</h4>
            <UBadge :color="getStatusColor(results.plSector.ratio)" variant="soft">
              {{ getStatusText(results.plSector.ratio) }}
            </UBadge>
          </div>
          <p class="mb-1 text-2xl font-bold text-white">
            {{ formatCurrency(results.plSector.fairPrice) }}
          </p>
          <p class="text-sm text-gray-400">Margem: {{ (results.plSector.margin * 100).toFixed(1) }}%</p>
          <p class="mt-2 text-xs text-gray-500">LPA × P/L Médio do Setor</p>
        </div>

        <div class="rounded-xl border p-4" :class="getStatusClass(results.bookValue.ratio)">
          <div class="mb-3 flex items-center justify-between">
            <h4 class="font-semibold text-white">Valor Patrimonial</h4>
            <UBadge :color="getStatusColor(results.bookValue.ratio)" variant="soft">
              {{ getStatusText(results.bookValue.ratio) }}
            </UBadge>
          </div>
          <p class="mb-1 text-2xl font-bold text-white">
            {{ formatCurrency(results.bookValue.fairPrice) }}
          </p>
          <p class="text-sm text-gray-400">Margem: {{ (results.bookValue.margin * 100).toFixed(1) }}%</p>
          <p class="mt-2 text-xs text-gray-500">VPA × 1.5 (margem Graham)</p>
        </div>
      </div>

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

      <div class="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 class="mb-4 font-semibold text-white">Comparação Visual</h4>
        <div class="space-y-3">
          <div>
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-gray-400">Preço Atual</span>
              <span class="font-semibold text-white">{{ formatCurrency(form.currentPrice) }}</span>
            </div>
            <div class="h-2 w-full rounded-full bg-white/10">
              <div class="h-2 rounded-full bg-white" :style="{ width: '100%' }" />
            </div>
          </div>
          <div v-for="method in visualMethods" :key="method.key">
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-gray-400">{{ method.label }}</span>
              <span class="font-semibold text-white">{{ formatCurrency(method.fairPrice) }}</span>
            </div>
            <div class="h-2 w-full rounded-full bg-white/10">
              <div
                class="h-2 rounded-full"
                :class="method.color"
                :style="{ width: `${Math.min(100, (method.fairPrice / Math.max(form.currentPrice, 0.01)) * 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton
          :to="`/asset/${(form.ticker || '').toLowerCase()}`"
          color="secondary"
          variant="soft"
          icon="i-lucide-chart-line"
        >
          Ver análise completa de {{ form.ticker }}
        </UButton>
        <UButton
          v-if="sectorSlug"
          :to="`/setor/${sectorSlug}/comparativo`"
          color="neutral"
          variant="soft"
          icon="i-lucide-layers"
        >
          Comparar com o setor
        </UButton>
      </div>

      <div class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
        <strong>Fonte dos dados:</strong> preço e fundamentos calculados com dados públicos da B3, fechamento do último pregão. O preço teto é uma referência, não uma garantia. Analise sempre os fundamentos da empresa, perspectivas futuras e seu perfil de risco antes de investir.
      </div>
    </div>

    <div
      v-else-if="!selectedAsset"
      class="rounded-[30px] border border-dashed border-white/10 bg-white/5 p-8 text-center"
    >
      <UIcon name="i-lucide-search" class="mx-auto size-10 text-gray-500" />
      <p class="mt-3 text-lg font-semibold text-white">
        Escolha uma ação para começar
      </p>
      <p class="mt-1 text-sm text-gray-400">
        Os preços teto de Graham, Bazin, P/L setorial e VPA aparecem automaticamente.
      </p>
      <div class="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span class="text-xs uppercase tracking-wider text-gray-500">Populares:</span>
        <button
          v-for="t in popularTickers"
          :key="t"
          type="button"
          class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white transition hover:border-secondary/40 hover:bg-secondary/10"
          @click="selectByTicker(t)"
        >
          {{ t }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IAsset, FundamentusApiResponse } from '~/types/asset'
import { useAssetsService } from '~/services/assets'

interface Props {
  assets?: IAsset[]
  assetsLoading?: boolean
  sectors?: Array<{ slug: string; name: string; count?: number }>
  initialTicker?: string
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
    { key: 'graham', label: 'Graham', fairPrice: results.value.graham.fairPrice, color: 'bg-green-400' },
    { key: 'bazin', label: 'Bazin', fairPrice: results.value.bazin.fairPrice, color: 'bg-blue-400' },
    { key: 'plSector', label: 'P/L Setorial', fairPrice: results.value.plSector.fairPrice, color: 'bg-purple-400' },
    { key: 'bookValue', label: 'Valor Patrimonial', fairPrice: results.value.bookValue.fairPrice, color: 'bg-orange-400' },
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
  if (!ratio) return 'border-white/10 bg-white/5'
  if (ratio <= 0.8) return 'border-green-500/50 bg-green-500/10'
  if (ratio <= 1.0) return 'border-yellow-500/50 bg-yellow-500/10'
  return 'border-red-500/50 bg-red-500/10'
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

onMounted(() => {
  const queryTicker = (route.query.ticker as string) || props.initialTicker || ''
  if (queryTicker) selectByTicker(queryTicker)
})

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
