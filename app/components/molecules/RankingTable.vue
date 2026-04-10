<template>
  <div
    class="overflow-hidden rounded-2xl border"
    :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
  >
    <!-- Header row (hidden on mobile) -->
    <div
      class="hidden items-center gap-4 border-b px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] md:flex"
      :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
    >
      <div class="w-8 text-right">#</div>
      <div class="flex-1">Ativo</div>
      <div class="w-24 text-right">Cotação</div>
      <div v-if="showColumn('dy')" class="w-24 text-right">DY (12m)</div>
      <div v-if="showColumn('pe')" class="w-20 text-right">P/L</div>
      <div v-if="showColumn('change')" class="w-24 text-right">
        {{ changeLabel }}
      </div>
      <div v-if="showColumn('marketCap')" class="w-28 text-right">Market Cap</div>
    </div>

    <!-- Rows -->
    <ol class="flex flex-col">
      <li
        v-for="(row, idx) in rows"
        :key="row.ticker"
        class="border-b last:border-b-0"
        :style="{ borderColor: brand.colors.border }"
      >
        <NuxtLink
          :to="`/asset/${row.ticker.toLowerCase()}`"
          class="flex items-center gap-3 px-5 py-4 transition-colors md:gap-4"
          :style="{ '--row-hover': rowHoverBg }"
          @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = rowHoverBg"
          @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = ''"
        >
          <!-- Rank -->
          <div
            class="w-6 text-right text-xs font-semibold tabular-nums md:w-8"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ idx + 1 }}
          </div>

          <!-- Logo + name + ticker -->
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
            >
              <img
                v-if="row.logo"
                :src="row.logo"
                :alt="row.name || row.ticker"
                class="size-full object-cover"
                loading="lazy"
                @error="($event.target as HTMLImageElement).style.display='none'"
              >
              <span
                v-else
                class="text-[10px] font-bold"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ row.ticker.slice(0, 2) }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <div
                class="truncate text-sm font-semibold"
                :style="{ color: brand.colors.text }"
              >
                {{ row.ticker }}
              </div>
              <div
                class="truncate text-[11px]"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ row.name || '—' }}
              </div>
            </div>
          </div>

          <!-- Price -->
          <div
            class="w-20 text-right text-sm font-semibold tabular-nums md:w-24"
            :style="{ color: brand.colors.text }"
          >
            {{ formatBrl(row.market_price) }}
          </div>

          <!-- DY -->
          <div
            v-if="showColumn('dy')"
            class="hidden w-24 text-right text-sm font-semibold tabular-nums md:block"
            :style="{ color: brand.colors.primary }"
          >
            {{ formatPercent(row.dividend_yield, true) }}
          </div>

          <!-- P/L -->
          <div
            v-if="showColumn('pe')"
            class="hidden w-20 text-right text-xs tabular-nums md:block"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ row.trailing_pe != null ? Number(row.trailing_pe).toFixed(1) : '—' }}
          </div>

          <!-- Change -->
          <div
            v-if="showColumn('change')"
            class="hidden w-24 text-right text-sm font-semibold tabular-nums md:block"
            :style="{
              color: Number(row.change_percent) >= 0 ? brand.colors.positive : brand.colors.negative,
            }"
          >
            {{ formatPercent(row.change_percent) }}
          </div>

          <!-- Market cap -->
          <div
            v-if="showColumn('marketCap')"
            class="hidden w-28 text-right text-xs tabular-nums md:block"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ formatMarketCap(row.market_cap) }}
          </div>

          <!-- Mobile-only secondary metric -->
          <div class="md:hidden flex flex-col items-end">
            <div
              v-if="showColumn('dy')"
              class="text-sm font-semibold tabular-nums"
              :style="{ color: dyColor }"
            >
              {{ formatPercent(row.dividend_yield, true) }}
            </div>
            <div
              v-else-if="showColumn('change')"
              class="text-sm font-semibold tabular-nums"
              :style="{
                color: Number(row.change_percent) >= 0 ? brand.colors.positive : brand.colors.negative,
              }"
            >
              {{ formatPercent(row.change_percent) }}
            </div>
          </div>
        </NuxtLink>
      </li>
    </ol>

    <!-- Empty state -->
    <div
      v-if="rows.length === 0"
      class="flex items-center justify-center px-5 py-12 text-sm"
      :style="{ color: brand.colors.textMuted }"
    >
      Sem dados disponíveis no momento.
    </div>
  </div>
</template>

<script setup lang="ts">
import { dividendAccent, hoverBg } from '~/utils/color'

type Column = 'dy' | 'pe' | 'change' | 'marketCap'

interface RankingRow {
  ticker: string
  name: string | null
  logo: string | null
  market_price: number
  change_percent: number | string
  market_cap: number | string
  dividend_yield?: number | string | null
  trailing_pe?: number | string | null
  sector?: string | null
}

const props = withDefaults(
  defineProps<{
    rows: RankingRow[]
    columns?: Column[]
    changeLabel?: string
  }>(),
  {
    columns: () => ['dy', 'pe', 'change', 'marketCap'] as Column[],
    changeLabel: 'Variação',
  }
)

const brand = useBrand()

// Accent for the DY column — falls back to positive if primary == negative
// (e.g. Sardinha, where primary and negative are both #DC2626).
const dyColor = computed(() =>
  dividendAccent(
    brand.colors.primary,
    brand.colors.negative,
    brand.colors.positive
  )
)

// Hover background: in light themes, darken surface; in dark themes, white alpha.
const rowHoverBg = computed(() =>
  hoverBg(brand.theme?.mode || 'dark', brand.colors.surface)
)

function showColumn(col: Column): boolean {
  return props.columns.includes(col)
}

function formatBrl(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '—'
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPercent(value: number | string | null | undefined, fromDecimal = false): string {
  if (value == null) return '—'
  let num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '—'
  if (fromDecimal) num *= 100
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2).replace('.', ',')}%`
}

function formatMarketCap(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '—'
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  return num.toLocaleString('pt-BR')
}
</script>
