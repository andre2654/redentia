<template>
  <div
    class="overflow-hidden rounded-2xl border"
    :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
  >
    <!-- Header row (hidden on mobile) -->
    <div
      class="hidden items-center gap-4 border-b px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] md:flex"
      :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)' }"
    >
      <div class="w-8 text-right">#</div>
      <div class="flex-1">Ativo</div>
      <div class="w-24 text-right">Cotação</div>
      <div v-if="showColumn('dy')" class="w-24 text-right">DY (12m)</div>
      <div v-if="showColumn('pe')" class="w-20 text-right">P/L</div>
      <div v-if="showColumn('roe')" class="w-20 text-right">ROE</div>
      <div v-if="showColumn('netMargin')" class="w-24 text-right">Margem Líq.</div>
      <div v-if="showColumn('revenue')" class="w-24 text-right">Receita</div>
      <div v-if="showColumn('netIncome')" class="w-24 text-right">Lucro</div>
      <div v-if="showColumn('cash')" class="w-24 text-right">Caixa</div>
      <div v-if="showColumn('grahamPrice')" class="w-28 text-right">Preço Graham</div>
      <div v-if="showColumn('bazinPrice')" class="w-28 text-right">Preço Bazin</div>
      <div v-if="showColumn('upsidePct')" class="w-24 text-right">Upside</div>
      <div v-if="showColumn('buyHoldScore')" class="w-32 text-right">Buy & Hold</div>
      <div v-if="showColumn('revenueGrowth5y')" class="w-32 text-right">Cresc. Receita 5a</div>
      <div v-if="showColumn('netIncomeGrowth5y')" class="w-32 text-right">Cresc. Lucro 5a</div>
      <div v-if="showColumn('mentionCount')" class="w-24 text-right">Menções</div>
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
        :style="{ borderColor: 'var(--brand-border)' }"
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
            :style="{ color: 'var(--brand-text-muted)' }"
          >
            {{ idx + 1 }}
          </div>

          <!-- Logo + name + ticker -->
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-background)' }"
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
                :style="{ color: 'var(--brand-text-muted)' }"
              >
                {{ row.ticker.slice(0, 2) }}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <div
                class="truncate text-sm font-semibold"
                :style="{ color: 'var(--brand-text)' }"
              >
                {{ row.ticker }}
              </div>
              <div
                class="truncate text-[11px]"
                :style="{ color: 'var(--brand-text-muted)' }"
              >
                {{ row.name || '-' }}
              </div>
            </div>
          </div>

          <!-- Price -->
          <div
            class="w-20 text-right text-sm font-semibold tabular-nums md:w-24"
            :style="{ color: 'var(--brand-text)' }"
          >
            {{ formatBrl(row.market_price) }}
          </div>

          <!-- DY -->
          <div
            v-if="showColumn('dy')"
            class="hidden w-24 text-right text-sm font-semibold tabular-nums md:block"
            :style="{ color: 'var(--brand-primary)' }"
          >
            {{ formatPercent(row.dividend_yield, true) }}
          </div>

          <!-- P/L -->
          <div
            v-if="showColumn('pe')"
            class="hidden w-20 text-right text-xs tabular-nums md:block"
            :style="{ color: 'var(--brand-text-muted)' }"
          >
            {{ row.trailing_pe != null ? Number(row.trailing_pe).toFixed(1) : '-' }}
          </div>

          <!-- ROE -->
          <div
            v-if="showColumn('roe')"
            class="hidden w-20 text-right text-sm font-semibold tabular-nums md:block"
            :style="{ color: 'var(--brand-primary)' }"
          >
            {{ formatPercent(row.roe, true) }}
          </div>

          <!-- Net Margin -->
          <div
            v-if="showColumn('netMargin')"
            class="hidden w-24 text-right text-sm font-semibold tabular-nums md:block"
            :style="{ color: 'var(--brand-primary)' }"
          >
            {{ formatPercent(row.net_margin, true) }}
          </div>

          <!-- Revenue -->
          <div
            v-if="showColumn('revenue')"
            class="hidden w-24 text-right text-xs tabular-nums md:block"
            :style="{ color: 'var(--brand-text)' }"
          >
            {{ formatBigBrl(row.total_revenue) }}
          </div>

          <!-- Net Income -->
          <div
            v-if="showColumn('netIncome')"
            class="hidden w-24 text-right text-xs tabular-nums md:block"
            :style="{ color: 'var(--brand-text)' }"
          >
            {{ formatBigBrl(row.net_income) }}
          </div>

          <!-- Cash -->
          <div
            v-if="showColumn('cash')"
            class="hidden w-24 text-right text-xs tabular-nums md:block"
            :style="{ color: 'var(--brand-text)' }"
          >
            {{ formatBigBrl(row.total_cash) }}
          </div>

          <!-- Graham Price -->
          <div
            v-if="showColumn('grahamPrice')"
            class="hidden w-28 text-right md:flex md:flex-col md:items-end"
          >
            <span
              class="text-sm font-semibold tabular-nums"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ formatBrl(row.graham_price) }}
            </span>
            <span
              v-if="row.upside_pct != null"
              class="text-[10px] tabular-nums"
              :style="{
                color: Number(row.upside_pct) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
              }"
            >
              {{ formatPercent(row.upside_pct) }}
            </span>
          </div>

          <!-- Bazin Price -->
          <div
            v-if="showColumn('bazinPrice')"
            class="hidden w-28 text-right md:flex md:flex-col md:items-end"
          >
            <span
              class="text-sm font-semibold tabular-nums"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ formatBrl(row.bazin_price) }}
            </span>
            <span
              v-if="row.upside_pct != null"
              class="text-[10px] tabular-nums"
              :style="{
                color: Number(row.upside_pct) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
              }"
            >
              {{ formatPercent(row.upside_pct) }}
            </span>
          </div>

          <!-- Upside Pct -->
          <div
            v-if="showColumn('upsidePct')"
            class="hidden w-24 text-right text-sm font-semibold tabular-nums md:block"
            :style="{
              color: Number(row.upside_pct) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
            }"
          >
            {{ formatPercent(row.upside_pct) }}
          </div>

          <!-- Buy & Hold Score -->
          <div
            v-if="showColumn('buyHoldScore')"
            class="hidden w-32 text-right md:flex md:flex-col md:items-end md:gap-1"
          >
            <span
              class="text-sm font-semibold tabular-nums"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ row.buy_hold_score != null ? `${row.buy_hold_score}/10` : '-' }}
            </span>
            <div
              v-if="row.buy_hold_score != null"
              class="h-1.5 w-full overflow-hidden rounded-full"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-border) 60%, transparent)' }"
            >
              <div
                class="h-full transition-all"
                :style="{
                  width: `${Math.max(0, Math.min(100, Number(row.buy_hold_score) * 10))}%`,
                  backgroundColor: 'var(--brand-primary)',
                }"
              />
            </div>
          </div>

          <!-- Revenue Growth 5y -->
          <div
            v-if="showColumn('revenueGrowth5y')"
            class="hidden w-32 text-right text-sm font-semibold tabular-nums md:block"
            :style="{
              color: Number(row.revenue_growth_5y) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
            }"
          >
            {{ formatPercent(row.revenue_growth_5y, true) }}
          </div>

          <!-- Net Income Growth 5y -->
          <div
            v-if="showColumn('netIncomeGrowth5y')"
            class="hidden w-32 text-right text-sm font-semibold tabular-nums md:block"
            :style="{
              color: Number(row.net_income_growth_5y) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
            }"
          >
            {{ formatPercent(row.net_income_growth_5y, true) }}
          </div>

          <!-- Mention Count -->
          <div
            v-if="showColumn('mentionCount')"
            class="hidden w-24 text-right text-sm font-semibold tabular-nums md:block"
            :style="{ color: 'var(--brand-primary)' }"
          >
            {{ row.mention_count != null ? Number(row.mention_count).toLocaleString('pt-BR') : '-' }}
          </div>

          <!-- Change -->
          <div
            v-if="showColumn('change')"
            class="hidden w-24 text-right text-sm font-semibold tabular-nums md:block"
            :style="{
              color: Number(row.change_percent) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
            }"
          >
            {{ formatPercent(row.change_percent) }}
          </div>

          <!-- Market cap -->
          <div
            v-if="showColumn('marketCap')"
            class="hidden w-28 text-right text-xs tabular-nums md:block"
            :style="{ color: 'var(--brand-text-muted)' }"
          >
            {{ formatMarketCap(row.market_cap) }}
          </div>

          <!-- Mobile-only secondary metric -->
          <!-- Order priority: dy > grahamPrice > bazinPrice > upsidePct >
               buyHoldScore > roe > netMargin > revenue > netIncome > cash >
               change. The first column in props.columns whose key matches a
               supported metric is the one that wins. -->
          <div class="md:hidden flex flex-col items-end">
            <div
              v-if="showColumn('dy')"
              class="text-sm font-semibold tabular-nums"
              :style="{ color: dyColor }"
            >
              {{ formatPercent(row.dividend_yield, true) }}
            </div>
            <div
              v-else-if="showColumn('grahamPrice')"
              class="flex flex-col items-end"
            >
              <span class="text-sm font-semibold tabular-nums" :style="{ color: 'var(--brand-text)' }">
                {{ formatBrl(row.graham_price) }}
              </span>
              <span
                v-if="row.upside_pct != null"
                class="text-[10px] tabular-nums"
                :style="{
                  color: Number(row.upside_pct) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
                }"
              >
                {{ formatPercent(row.upside_pct) }}
              </span>
            </div>
            <div
              v-else-if="showColumn('bazinPrice')"
              class="flex flex-col items-end"
            >
              <span class="text-sm font-semibold tabular-nums" :style="{ color: 'var(--brand-text)' }">
                {{ formatBrl(row.bazin_price) }}
              </span>
              <span
                v-if="row.upside_pct != null"
                class="text-[10px] tabular-nums"
                :style="{
                  color: Number(row.upside_pct) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
                }"
              >
                {{ formatPercent(row.upside_pct) }}
              </span>
            </div>
            <div
              v-else-if="showColumn('upsidePct')"
              class="text-sm font-semibold tabular-nums"
              :style="{
                color: Number(row.upside_pct) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
              }"
            >
              {{ formatPercent(row.upside_pct) }}
            </div>
            <div
              v-else-if="showColumn('buyHoldScore')"
              class="text-sm font-semibold tabular-nums"
              :style="{ color: 'var(--brand-primary)' }"
            >
              {{ row.buy_hold_score != null ? `${row.buy_hold_score}/10` : '-' }}
            </div>
            <div
              v-else-if="showColumn('roe')"
              class="text-sm font-semibold tabular-nums"
              :style="{ color: 'var(--brand-primary)' }"
            >
              {{ formatPercent(row.roe, true) }}
            </div>
            <div
              v-else-if="showColumn('netMargin')"
              class="text-sm font-semibold tabular-nums"
              :style="{ color: 'var(--brand-primary)' }"
            >
              {{ formatPercent(row.net_margin, true) }}
            </div>
            <div
              v-else-if="showColumn('revenue')"
              class="text-xs tabular-nums"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ formatBigBrl(row.total_revenue) }}
            </div>
            <div
              v-else-if="showColumn('netIncome')"
              class="text-xs tabular-nums"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ formatBigBrl(row.net_income) }}
            </div>
            <div
              v-else-if="showColumn('cash')"
              class="text-xs tabular-nums"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ formatBigBrl(row.total_cash) }}
            </div>
            <div
              v-else-if="showColumn('change')"
              class="text-sm font-semibold tabular-nums"
              :style="{
                color: Number(row.change_percent) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
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
      :style="{ color: 'var(--brand-text-muted)' }"
    >
      Sem dados disponíveis no momento.
    </div>
  </div>
</template>

<script setup lang="ts">
import { dividendAccent, hoverBg } from '~/utils/color'

type Column =
  | 'dy'
  | 'pe'
  | 'change'
  | 'marketCap'
  | 'roe'
  | 'netMargin'
  | 'revenue'
  | 'netIncome'
  | 'cash'
  | 'grahamPrice'
  | 'bazinPrice'
  | 'upsidePct'
  | 'buyHoldScore'
  | 'revenueGrowth5y'
  | 'netIncomeGrowth5y'
  | 'mentionCount'

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
  // Extended ranking fields — all optional, nullable; populated only by
  // endpoints that surface that specific metric (RankingResource shape).
  roe?: number | string | null
  net_margin?: number | string | null
  total_revenue?: number | string | null
  net_income?: number | string | null
  total_cash?: number | string | null
  graham_price?: number | string | null
  bazin_price?: number | string | null
  upside_pct?: number | string | null
  buy_hold_score?: number | string | null
  revenue_growth_5y?: number | string | null
  net_income_growth_5y?: number | string | null
  mention_count?: number | string | null
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

// Accent for the DY column, falls back to positive if primary == negative
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

function formatBrl(value: number | string | null | undefined): string {
  if (value == null) return '-'
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '-'
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Big-money format with B/M abbreviation. Used for revenue, net income,
// cash, etc. — fields where the absolute value is in the billions and the
// 2-decimal BRL format would overflow the column width.
function formatBigBrl(value: number | string | null | undefined): string {
  if (value == null) return '-'
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '-'
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (abs >= 1_000_000_000_000) return `${sign}R$ ${(abs / 1_000_000_000_000).toFixed(1)}T`
  if (abs >= 1_000_000_000) return `${sign}R$ ${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(1)}K`
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatPercent(value: number | string | null | undefined, fromDecimal = false): string {
  if (value == null) return '-'
  let num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '-'
  if (fromDecimal) num *= 100
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2).replace('.', ',')}%`
}

function formatMarketCap(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '-'
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  return num.toLocaleString('pt-BR')
}
</script>
