<template>
  <!-- Variant: default (Primo Rico, clean, balanced) -->
  <NuxtLink
    v-if="cfg.variant === 'default'"
    :to="tickerLink"
    class="flex items-center gap-3 py-2.5 transition-colors"
    @mouseenter="$event.currentTarget.style.backgroundColor = brand.colors.textMuted + '0D'"
    @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
  >
    <img
      v-if="cfg.showLogo && hasLogo"
      width="32"
      height="32"
      class="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
      :src="stock?.logo"
      :alt="logoAlt"
    />
    <div
      v-else-if="cfg.showLogo"
      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
      :style="{ backgroundColor: brand.colors.textMuted + '1A' }"
    >
      <span class="text-[10px] font-bold" :style="{ color: brand.colors.textMuted }">
        {{ tickerAbbrev }}
      </span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <span class="truncate text-sm font-medium" :style="{ color: brand.colors.text }">
        {{ cfg.showName ? normalizeText(stock?.name) : stock?.ticker }}
      </span>
      <span v-if="cfg.showName" class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">{{ stock?.ticker }}</span>
    </div>

    <div class="flex flex-shrink-0 flex-col items-end">
      <span class="font-mono-tab text-sm font-medium tabular-nums" :style="{ color: brand.colors.text }">
        R$ {{ formatPrice(stock?.market_price) }}
      </span>
      <span
        class="flex items-center gap-0.5 font-mono-tab text-xs font-medium tabular-nums"
        :style="{ color: changeColor }"
      >
        <UIcon
          :name="stock?.change_percent >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
          class="h-3 w-3"
        />
        {{ formatChange(stock?.change_percent) }}%
      </span>
    </div>
  </NuxtLink>

  <!-- Variant: compact (Me Poupe, friendly, bigger logo, text change) -->
  <NuxtLink
    v-else-if="cfg.variant === 'compact'"
    :to="tickerLink"
    class="flex items-center gap-3 py-3 transition-colors"
    @mouseenter="$event.currentTarget.style.backgroundColor = brand.colors.textMuted + '0D'"
    @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
  >
    <img
      v-if="cfg.showLogo && hasLogo"
      :width="logoSizePx"
      :height="logoSizePx"
      class="flex-shrink-0 rounded-xl border object-cover"
      :style="{ width: `${logoSizePx}px`, height: `${logoSizePx}px`, borderColor: brand.colors.border }"
      :src="stock?.logo"
      :alt="logoAlt"
    />
    <div
      v-else-if="cfg.showLogo"
      class="flex flex-shrink-0 items-center justify-center rounded-xl"
      :style="{ width: `${logoSizePx}px`, height: `${logoSizePx}px`, backgroundColor: brand.colors.textMuted + '1A' }"
    >
      <span class="text-xs font-bold" :style="{ color: brand.colors.textMuted }">
        {{ tickerAbbrev }}
      </span>
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <span class="truncate text-sm font-medium" :style="{ color: brand.colors.text }">
        {{ normalizeText(stock?.name) }}
      </span>
      <span class="text-xs" :style="{ color: brand.colors.textMuted }">{{ stock?.ticker }}</span>
    </div>

    <div class="flex flex-shrink-0 flex-col items-end">
      <span class="text-sm font-medium tabular-nums" :style="{ color: brand.colors.text }">
        R$ {{ formatPrice(stock?.market_price) }}
      </span>
      <span
        class="text-xs font-medium"
        :style="{ color: changeColor }"
      >
        {{ stock?.change_percent >= 0 ? 'Subiu' : 'Caiu' }} {{ formatChange(stock?.change_percent) }}%
      </span>
    </div>
  </NuxtLink>

  <!-- Variant: detailed (Sardinha, ticker-first, no logo, absolute + percent) -->
  <NuxtLink
    v-else
    :to="tickerLink"
    class="flex items-center gap-3 py-2 transition-colors"
    @mouseenter="$event.currentTarget.style.backgroundColor = brand.colors.textMuted + '0D'"
    @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
  >
    <div class="flex min-w-0 flex-1 flex-col">
      <span class="text-sm font-semibold tabular-nums" :style="{ color: brand.colors.text }">
        {{ stock?.ticker }}
      </span>
      <span v-if="cfg.showName" class="truncate text-xs" :style="{ color: brand.colors.textMuted }">
        {{ normalizeText(stock?.name) }}
      </span>
    </div>

    <div class="flex flex-shrink-0 items-center gap-3">
      <span class="text-sm font-medium tabular-nums" :style="{ color: brand.colors.text }">
        R$ {{ formatPrice(stock?.market_price) }}
      </span>
      <div class="flex flex-col items-end">
        <span
          class="text-xs font-semibold tabular-nums"
          :style="{ color: changeColor }"
        >
          {{ stock?.change_percent >= 0 ? '+' : '' }}{{ formatChange(stock?.change_percent) }}%
        </span>
        <span class="text-[10px] tabular-nums" :style="{ color: brand.colors.textMuted }">
          {{ stock?.change_percent >= 0 ? '+' : '' }}R$ {{ formatAbsChange(stock?.market_price, stock?.change_percent) }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
import { useChartColors } from '~/design/chartColors'

const brand = useBrand()
const cc = useChartColors()

const props = defineProps<{
  stock?: any
  to?: string
}>()

const cfg = computed(() => brand.homePage.stockItem)

// `to` override é usado pelos rankings de cripto na home (precisam apontar
// pra /crypto/<id> em vez de /asset/<ticker>). Resto dos callers passa
// apenas `stock` e pega o default.
const tickerLink = computed(() =>
  props.to ?? `/asset/${props.stock?.ticker?.toLowerCase?.() || props.stock?.ticker || ''}`
)

const tickerAbbrev = computed(() => (props.stock?.ticker || '').substring(0, 2))

const logoAlt = computed(() =>
  props.stock?.name
    ? `Logo de ${normalizeText(props.stock.name)}`
    : `Logo do ativo ${props.stock?.ticker || ''}`
)

const logoSizePx = computed(() => {
  const size = cfg.value.logoSize
  if (size === 'sm') return 24
  if (size === 'lg') return 40
  return 32
})

const changeColor = computed(() => {
  return (props.stock?.change_percent ?? 0) >= 0 ? cc.positive : cc.negative
})

const hasLogo = computed(() => !isPlaceholderLogo(props.stock?.logo))

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

function formatAbsChange(price: number | undefined, changePct: number | undefined) {
  if (!price || !changePct) return '0,00'
  const absChange = Math.abs(price * (changePct / 100))
  return absChange.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
