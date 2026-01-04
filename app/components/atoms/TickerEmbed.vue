<template>
  <NuxtLink
    :to="`/asset/${ticker.toLowerCase()}`"
    class="group inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 transition-all hover:border-secondary/30 hover:bg-secondary/10"
    :class="sizeClasses"
  >
    <!-- Logo -->
    <img
      v-if="logoUrl"
      :src="logoUrl"
      :alt="ticker"
      class="rounded-sm object-contain"
      :class="logoSizeClasses"
      @error="handleImageError"
    />
    <div
      v-else
      class="flex items-center justify-center rounded-sm bg-white/10"
      :class="logoSizeClasses"
    >
      <span class="text-[8px] font-bold text-white/50">
        {{ ticker.substring(0, 2) }}
      </span>
    </div>

    <!-- Ticker -->
    <span
      class="font-semibold tracking-wide text-white group-hover:text-secondary"
      :class="tickerSizeClasses"
    >
      {{ ticker }}
    </span>

    <!-- Variação -->
    <span
      v-if="showChange && !loading && changeValue !== null"
      class="font-medium tabular-nums"
      :class="[changeColorClasses, changeSizeClasses]"
    >
      {{ formatChange(changeValue) }}
    </span>

    <!-- Loading state -->
    <span
      v-if="loading && showChange"
      class="text-white/30"
      :class="changeSizeClasses"
    >
      ...
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'

interface Props {
  ticker: string
  showChange?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showChange: true,
  size: 'md',
})

const { getTickerDetails } = useAssetsService()

const assetData = ref<IAsset | null>(null)
const loading = ref(true)
const imageError = ref(false)

// URL do logo com fallback
const logoUrl = computed(() => {
  if (imageError.value) return null
  return assetData.value?.logo || null
})

// Valor da variação
const changeValue = computed(() => {
  if (!assetData.value) return null
  // Tenta pegar change_percent primeiro, depois change, depois market_price - close
  return assetData.value.change_percent ?? assetData.value.change ?? null
})

function handleImageError() {
  imageError.value = true
}

// Classes baseadas no tamanho
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-6 text-xs'
    case 'lg':
      return 'h-9 text-base'
    default:
      return 'h-7 text-sm'
  }
})

const logoSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-4 w-4'
    case 'lg':
      return 'h-6 w-6'
    default:
      return 'h-5 w-5'
  }
})

const tickerSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-[10px]'
    case 'lg':
      return 'text-sm'
    default:
      return 'text-xs'
  }
})

const changeSizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-[9px]'
    case 'lg':
      return 'text-xs'
    default:
      return 'text-[10px]'
  }
})

const changeColorClasses = computed(() => {
  const change = changeValue.value
  if (change === null) return 'text-white/50'
  
  if (change > 0) return 'text-green-400'
  if (change < 0) return 'text-red-400'
  return 'text-white/50'
})

function formatChange(value: number): string {
  const formatted = Math.abs(value).toFixed(2)
  if (value > 0) return `+${formatted}%`
  if (value < 0) return `-${formatted}%`
  return `${formatted}%`
}

// Buscar dados do ticker
onMounted(async () => {
  try {
    loading.value = true
    const tickerUpper = props.ticker.toUpperCase()
    const data = await getTickerDetails(tickerUpper)
    
    if (data && typeof data === 'object') {
      assetData.value = data as IAsset
      
      // Debug log (remover em produção)
      if (import.meta.dev) {
        console.log(`[TickerEmbed] Dados carregados para ${tickerUpper}:`, {
          logo: assetData.value.logo,
          change: assetData.value.change,
          change_percent: assetData.value.change_percent,
        })
      }
    } else {
      console.warn(`[TickerEmbed] Nenhum dado retornado para ${tickerUpper}`)
    }
  } catch (error) {
    console.error(`[TickerEmbed] Erro ao buscar dados do ticker ${props.ticker}:`, error)
    assetData.value = null
  } finally {
    loading.value = false
  }
})
</script>
