<template>
  <NuxtLink
    :to="item.to"
    class="group flex items-center gap-4 border-b px-5 py-3 transition-colors"
    :style="{
      borderColor: brand.colors.border,
      backgroundColor: focused ? brand.colors.surface : 'transparent',
    }"
    @click="$emit('click')"
    @mouseenter="$emit('mouseenter')"
  >
    <!-- Logo slot — real image with fallback to mono placeholder when the
         image fails to load (common for FII tickers where Brapi returns
         an HTML 404 page instead of an SVG) -->
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center border"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
    >
      <img
        v-if="item.logo && !imgFailed"
        :src="item.logo"
        :alt="item.ticker"
        class="h-full w-full object-contain p-1"
        width="40"
        height="40"
        loading="lazy"
        @error="imgFailed = true"
      >
      <span
        v-else
        class="font-mono-tab text-[11px] font-bold tracking-wider"
        :style="{ color: brand.colors.textMuted }"
      >
        {{ item.ticker.slice(0, 4) }}
      </span>
    </div>

    <!-- Ticker + name -->
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-center gap-2">
        <span
          class="font-mono-tab text-[15px] font-bold tracking-wide"
          :style="{ color: brand.colors.text }"
        >
          {{ item.ticker }}
        </span>
        <span
          class="font-mono-tab text-[9px] uppercase tracking-[0.18em]"
          :style="{ color: typeColor }"
        >
          {{ typeBadge }}
        </span>
      </div>
      <span
        class="truncate text-[12px] leading-tight"
        :style="{ color: brand.colors.textMuted }"
      >
        {{ item.name }}
      </span>
    </div>

    <!-- Price + change -->
    <div class="flex shrink-0 flex-col items-end gap-0.5 text-right">
      <span
        v-if="item.price > 0"
        class="font-mono-tab text-[13px] font-bold tabular-nums"
        :style="{ color: brand.colors.text }"
      >
        {{ formatCurrencyBRL(item.price) }}
      </span>
      <span
        v-if="item.changePercent !== null"
        class="font-mono-tab text-[11px] tabular-nums"
        :style="{ color: changeColor }"
      >
        {{ changeLabel }}
      </span>
    </div>

    <UIcon
      name="i-lucide-chevron-right"
      class="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
      :style="{ color: focused ? brand.colors.primary : brand.colors.textMuted }"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
interface SearchItem {
  id: string
  ticker: string
  label: string
  name: string
  to: string
  logo: string | null
  price: number
  changePercent: number | null
  type: 'STOCK' | 'REIT' | 'BDR' | 'ETF' | 'TESOURO'
}

const props = defineProps<{
  item: SearchItem
  focused?: boolean
}>()

defineEmits<{
  click: []
  mouseenter: []
}>()

const brand = useBrand()
const imgFailed = ref(false)

// Reset error state when the item changes (e.g. search filter swaps rows).
watch(() => props.item.id, () => { imgFailed.value = false })

const typeBadge = computed(() => {
  const map: Record<string, string> = {
    STOCK: 'AÇÃO',
    REIT: 'FII',
    ETF: 'ETF',
    BDR: 'BDR',
    TESOURO: 'TESOURO',
  }
  return map[props.item.type] ?? props.item.type
})

const typeColor = computed(() => {
  const map: Record<string, string> = {
    STOCK: brand.colors.primary,
    REIT: brand.colors.positive,
    ETF: brand.colors.text,
    BDR: brand.colors.textMuted,
    TESOURO: brand.colors.primary,
  }
  return map[props.item.type] ?? brand.colors.textMuted
})

const changeColor = computed(() => {
  if (props.item.changePercent === null) return brand.colors.textMuted
  // Tesouro shows the gross rate, not daily movement — render in amber
  // instead of the green/red variation palette.
  if (props.item.type === 'TESOURO') return brand.colors.primary
  return props.item.changePercent >= 0 ? brand.colors.positive : brand.colors.negative
})

const changeLabel = computed(() => {
  if (props.item.changePercent === null) return ''
  if (props.item.type === 'TESOURO') {
    return `${props.item.changePercent.toFixed(2)}% a.a.`
  }
  const sign = props.item.changePercent >= 0 ? '+' : ''
  return `${sign}${props.item.changePercent.toFixed(2)}%`
})

function formatCurrencyBRL(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
</script>
