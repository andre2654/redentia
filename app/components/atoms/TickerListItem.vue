<template>
  <NuxtLink
    :to="`/asset/${stock?.ticker?.toLowerCase?.() || stock?.ticker || ''}`"
    class="flex items-center gap-3 py-2.5 transition-colors hover:bg-white/5"
  >
    <!-- Logo -->
    <img
      v-if="hasLogo"
      width="32"
      height="32"
      class="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
      :src="stock?.logo"
      :alt="stock?.name ? `Logo de ${normalizeText(stock.name)}` : `Logo do ativo ${stock?.ticker || ''}`"
    />
    <div
      v-else
      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10"
    >
      <span class="text-[10px] font-bold text-white/50">
        {{ (stock?.ticker || '').substring(0, 2) }}
      </span>
    </div>

    <!-- Nome e Ticker -->
    <div class="flex min-w-0 flex-1 flex-col">
      <span class="truncate text-sm font-medium text-white">
        {{ normalizeText(stock?.name) }}
      </span>
      <span class="text-xs text-white/50">{{ stock?.ticker }}</span>
    </div>

    <!-- Preço e Variação -->
    <div class="flex flex-shrink-0 flex-col items-end">
      <span class="text-sm font-medium tabular-nums text-white">
        R$ {{ formatPrice(stock?.market_price) }}
      </span>
      <span
        class="flex items-center gap-0.5 text-xs font-medium tabular-nums"
        :class="[stock?.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400']"
      >
        <UIcon
          :name="stock?.change_percent >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
          class="h-3 w-3"
        />
        {{ formatChange(stock?.change_percent) }}%
      </span>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
const props = defineProps<{
  stock?: any
}>()

function normalizeText(text: string) {
  return text?.replace(/\s+/g, ' ')
}

function formatPrice(price: number | undefined) {
  if (price === undefined || price === null) return '0,00'
  return price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatChange(change: number | undefined) {
  if (change === undefined || change === null) return '0.00'
  return Math.abs(change).toFixed(2)
}

const hasLogo = computed(() => {
  return (
    props.stock?.logo &&
    props.stock?.logo !== 'https://icons.brapi.dev/icons/BRAPI.svg'
  )
})
</script>
