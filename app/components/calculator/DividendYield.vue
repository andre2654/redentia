<template>
  <div class="space-y-6">
    <div
      class="flex flex-col gap-6 rounded-[30px] bg-gradient-to-t from-white/10 to-transparent p-6"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-coins" class="text-secondary size-6" />
        <h2 class="text-xl font-bold text-white">Calcular Dividend Yield</h2>
      </div>

      <!-- Modo de Cálculo -->
      <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold text-white">Escolha o modo:</p>
        <UButtonGroup orientation="horizontal" variant="soft">
          <UButton
            color="neutral"
            :variant="mode === 'simple' ? 'soft' : 'link'"
            label="Cálculo Simples"
            @click="mode = 'simple'"
          />
          <UButton
            color="neutral"
            :variant="mode === 'onCost' ? 'soft' : 'link'"
            label="DY On Cost"
            @click="mode = 'onCost'"
          />
          <UButton
            color="neutral"
            :variant="mode === 'projection' ? 'soft' : 'link'"
            label="Projeção"
            @click="mode = 'projection'"
          />
        </UButtonGroup>
      </div>

      <!-- Modo Simples -->
      <div v-if="mode === 'simple'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Selecione o Ativo" name="ticker" class="md:col-span-2">
          <div class="flex flex-col gap-3">
            <UInput
              v-model="searchTerm"
              icon="i-lucide-search"
              placeholder="Buscar ação ou FII..."
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

        <UFormField label="Preço da Ação (R$)" name="price">
          <AtomsFormCurrencyInput
            v-model="form.price"
            placeholder="25,00"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Dividendos Anuais (R$)" name="annualDividend">
          <AtomsFormCurrencyInput
            v-model="form.annualDividend"
            placeholder="1,50"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Modo On Cost -->
      <div v-else-if="mode === 'onCost'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Preço de Compra (R$)" name="purchasePrice">
          <AtomsFormCurrencyInput
            v-model="form.purchasePrice"
            placeholder="20,00"
            size="lg"
            variant="soft"
            class="w-full"
          />
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

        <UFormField label="Dividendos Anuais Atuais (R$)" name="currentDividend">
          <AtomsFormCurrencyInput
            v-model="form.currentDividend"
            placeholder="1,50"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Modo Projeção -->
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UFormField label="Preço da Ação (R$)" name="priceProjection">
          <AtomsFormCurrencyInput
            v-model="form.priceProjection"
            placeholder="25,00"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Lucro por Ação - LPA (R$)" name="lpa">
          <AtomsFormCurrencyInput
            v-model="form.lpa"
            placeholder="3,00"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Payout Ratio (%)" name="payout">
          <AtomsFormPercentageInput
            v-model="form.payout"
            :min="0"
            :max="100"
            placeholder="50"
            size="lg"
            variant="soft"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Crescimento do Lucro (%a.a.)" name="growth">
          <AtomsFormPercentageInput
            v-model="form.growth"
            :min="-50"
            :max="100"
            placeholder="10"
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
        @click="calculate"
      >
        Calcular Dividend Yield
      </UButton>
    </div>

    <div v-if="results" class="flex flex-col gap-6 rounded-[30px] p-6">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-trending-up" class="text-secondary size-6" />
        <h3 class="text-xl font-bold text-white">
          Resultados - {{ form.ticker || 'Ativo' }}
        </h3>
      </div>

      <!-- Resultado Principal -->
      <div class="rounded-xl border border-secondary/30 bg-secondary/10 p-6">
        <p class="mb-2 text-sm text-gray-400">{{ results.label }}</p>
        <p class="text-5xl font-bold text-secondary">
          {{ results.dy.toFixed(2) }}%
        </p>
        <p class="mt-2 text-sm text-gray-300">{{ results.description }}</p>
      </div>

      <!-- Detalhes por Modo -->
      <div v-if="mode === 'simple'" class="grid gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Preço da Ação</p>
          <p class="text-xl font-bold text-white">
            {{ formatCurrency(form.price) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Dividendos Anuais</p>
          <p class="text-xl font-bold text-white">
            {{ formatCurrency(form.annualDividend) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Dividendos Mensais</p>
          <p class="text-xl font-bold text-green-400">
            {{ formatCurrency(form.annualDividend / 12) }}
          </p>
        </div>
      </div>

      <div v-else-if="mode === 'onCost'" class="grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">DY no Preço de Compra</p>
          <p class="text-2xl font-bold text-secondary">
            {{ results.dyOnCost.toFixed(2) }}%
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Seu retorno real sobre o investimento
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">DY no Preço Atual</p>
          <p class="text-2xl font-bold text-white">
            {{ results.dyCurrent.toFixed(2) }}%
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Retorno para quem comprar hoje
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Valorização</p>
          <p
            class="text-2xl font-bold"
            :class="results.appreciation >= 0 ? 'text-green-400' : 'text-red-400'"
          >
            {{ results.appreciation >= 0 ? '+' : '' }}{{ results.appreciation.toFixed(1) }}%
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">Ganho Total Anual</p>
          <p class="text-2xl font-bold text-secondary">
            {{ results.totalReturn.toFixed(2) }}%
          </p>
          <p class="text-xs text-gray-400 mt-1">
            DY + Valorização
          </p>
        </div>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">DY Atual</p>
          <p class="text-2xl font-bold text-white">
            {{ results.currentDY.toFixed(2) }}%
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">DY Projetado (1 ano)</p>
          <p class="text-2xl font-bold text-secondary">
            {{ results.projectedDY1y.toFixed(2) }}%
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-white/5 p-4">
          <p class="mb-1 text-sm text-gray-400">DY Projetado (3 anos)</p>
          <p class="text-2xl font-bold text-green-400">
            {{ results.projectedDY3y.toFixed(2) }}%
          </p>
        </div>
      </div>

      <!-- Análise -->
      <div class="rounded-xl border border-white/10 bg-white/5 p-5">
        <h4 class="mb-3 font-semibold text-white">Análise do Dividend Yield</h4>
        <div class="space-y-2 text-sm text-gray-300">
          <p v-if="results.dy < 3" class="flex items-start gap-2">
            <UIcon name="i-lucide-info" class="text-blue-400 size-4 mt-0.5" />
            <span>DY abaixo de 3% é considerado baixo. Pode indicar empresa de crescimento ou ação cara.</span>
          </p>
          <p v-else-if="results.dy >= 3 && results.dy < 6" class="flex items-start gap-2">
            <UIcon name="i-lucide-check" class="text-green-400 size-4 mt-0.5" />
            <span>DY entre 3-6% é considerado bom para ações. Equilibra dividendos e crescimento.</span>
          </p>
          <p v-else-if="results.dy >= 6 && results.dy < 10" class="flex items-start gap-2">
            <UIcon name="i-lucide-trending-up" class="text-secondary size-4 mt-0.5" />
            <span>DY entre 6-10% é excelente! Típico de boas pagadoras de dividendos ou FIIs.</span>
          </p>
          <p v-else class="flex items-start gap-2">
            <UIcon name="i-lucide-alert-triangle" class="text-yellow-400 size-4 mt-0.5" />
            <span>DY muito alto (>10%) pode indicar: ação em queda, dividendo extraordinário ou risco elevado. Investigue!</span>
          </p>
        </div>
      </div>

      <!-- Dica -->
      <div class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
        <strong>Dica:</strong> Dividend Yield alto não é sempre bom. Verifique se os dividendos são sustentáveis analisando o Payout Ratio (ideal 40-60% para ações, 95%+ para FIIs).
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

const mode = ref<'simple' | 'onCost' | 'projection'>('simple')
const searchTerm = ref('')
const selectedAsset = ref<IAsset | null>(null)

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
