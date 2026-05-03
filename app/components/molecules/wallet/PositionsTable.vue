<!--
  PositionsTable — full positions list with class-filter pills.

  Reads `UnifiedPosition[]` directly. Sector + dy_12m_pct are optional;
  cells fall back to em-dash when unknown. The mini-bar in the "Peso"
  column is computed from a derived weight_pct (= current_value / total).
-->
<template>
  <section class="flex flex-col gap-5">
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <SectionHeading
        :brand="brand"
        eyebrow="Posições"
        title="Seus ativos, ordenados por peso"
      />
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="cls in classFilters"
          :key="cls.value"
          type="button"
          class="rounded-md px-2.5 py-1 font-mono-tab text-[10.5px] font-medium uppercase tabular-nums"
          :style="{
            letterSpacing: '0.16em',
            backgroundColor:
              activeClass === cls.value
                ? `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`
                : 'transparent',
            color:
              activeClass === cls.value
                ? brand.colors.primary
                : `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`,
            border: `1px solid ${
              activeClass === cls.value
                ? `color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`
                : `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`
            }`,
          }"
          @click="activeClass = cls.value"
        >{{ cls.label }} · {{ cls.count }}</button>
      </div>
    </div>

    <article class="overflow-hidden rounded-xl border" :style="cardStyle">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr :style="{ borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 40%, transparent)` }">
              <th class="th">Ativo</th>
              <th class="th">Setor</th>
              <th class="th th-num">Qtde</th>
              <th class="th th-num">Médio</th>
              <th class="th th-num">Atual</th>
              <th class="th th-num">Variação</th>
              <th class="th th-num">Peso</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in visibleRows"
              :key="p.ticker"
              class="position-row"
              :style="{ borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
            >
              <td class="td">
                <div class="flex items-center gap-2.5">
                  <AtomsTickerLogo
                    :ticker="p.ticker"
                    :logo="snapshots.get(p.ticker)?.logo ?? null"
                    :size="28"
                  />
                  <div class="flex min-w-0 flex-col leading-tight">
                    <span class="font-mono-tab text-[12.5px] font-medium" :style="{ color: brand.colors.text }">{{ p.ticker }}</span>
                    <span class="truncate text-[10.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">
                      {{ p.name || snapshots.get(p.ticker)?.name || displayClass(p.asset_class) }}
                      <span
                        v-if="p.is_loaned"
                        class="ml-1 rounded px-1 py-0.5 font-mono-tab text-[9px] font-medium"
                        :style="{
                          backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                          color: brand.colors.primary,
                        }"
                      >BTC</span>
                    </span>
                  </div>
                </div>
              </td>
              <td class="td">
                <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }">{{ p.sector || '—' }}</span>
              </td>
              <td class="td td-num">{{ interfaceStore.revealAmount ? p.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '••••' }}</td>
              <td class="td td-num">{{ maskedBRL2(p.average_price) }}</td>
              <!-- Current price e dado publico de mercado, nao expoe a
                   carteira do usuario. Fica visivel mesmo com mask on. -->
              <td class="td td-num">{{ p.current_price ? formatBRL2(p.current_price) : '—' }}</td>
              <td class="td td-num">
                <span
                  v-if="p.current_price"
                  :style="{ color: pnlPct(p) >= 0 ? brand.colors.positive : brand.colors.negative }"
                >{{ formatPct(pnlPct(p)) }}</span>
                <span v-else>—</span>
              </td>
              <td class="td td-num">
                <span class="inline-flex items-center gap-1">
                  {{ weightPct(p).toFixed(2) }}%
                  <div
                    class="h-1 w-12 overflow-hidden rounded-full"
                    :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
                  >
                    <div
                      class="h-full rounded-full"
                      :style="{ width: Math.min(weightPct(p) * 6, 100) + '%', backgroundColor: brand.colors.primary }"
                    />
                  </div>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        v-if="filteredPositions.length > pageSize"
        type="button"
        class="flex w-full items-center justify-center gap-1.5 px-4 py-3 text-[12.5px] font-medium transition-[background-color]"
        :style="{
          color: brand.colors.primary,
          backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 4%, transparent)`,
          borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
        }"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Mostrar menos' : `Ver todas as ${filteredPositions.length} posições` }}
        <UIcon :name="expanded ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-3" />
      </button>
    </article>
  </section>
</template>

<script setup lang="ts">
import type { UnifiedPosition, UnifiedAssetClass } from '~/services/portfolio'

interface Props {
  positions: UnifiedPosition[]
  /** Total wallet value used to compute `weight_pct` for each row. */
  totalValue: number
}
const props = defineProps<Props>()

const brand = useBrand()
const activeClass = ref<'ALL' | UnifiedAssetClass>('ALL')
const expanded = ref(false)
const pageSize = 12

// ---- Ticker logos via the shared snapshot composable -----------
// Subscribes to all unique tickers in the table; the composable
// batches them into a single `/api/chat/tickers/snapshot` call and
// re-renders rows when logos arrive. `TickerLogo` falls back to
// initials when a logo is missing or fails to load (handled by
// the shared `useFailedLogos` registry).
const tickerSnaps = useTickerSnapshots()
const snapshots = tickerSnaps.snapshots
const subscribed = new Set<string>()
const positionTickers = computed(() => Array.from(new Set(props.positions.map((p) => p.ticker.toUpperCase()))))

watch(
  positionTickers,
  (tickers) => {
    // Subscribe new tickers
    for (const t of tickers) {
      if (!subscribed.has(t)) {
        tickerSnaps.subscribe(t)
        subscribed.add(t)
      }
    }
    // Unsubscribe ones that disappeared (e.g. user wiped + re-imported)
    for (const t of Array.from(subscribed)) {
      if (!tickers.includes(t)) {
        tickerSnaps.unsubscribe(t)
        subscribed.delete(t)
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  for (const t of subscribed) tickerSnaps.unsubscribe(t)
  subscribed.clear()
})

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const classFilters = computed(() => {
  const counts: Record<string, number> = {}
  for (const p of props.positions) {
    const k = (p.asset_class || 'OTHER') as string
    counts[k] = (counts[k] || 0) + 1
  }
  return [
    { value: 'ALL' as const, label: 'Todos', count: props.positions.length },
    { value: 'STOCK' as const, label: 'Ações', count: counts.STOCK || 0 },
    { value: 'REIT' as const, label: 'FIIs', count: counts.REIT || 0 },
    { value: 'ETF' as const, label: 'ETF', count: counts.ETF || 0 },
    { value: 'TREASURY' as const, label: 'Tesouro', count: counts.TREASURY || 0 },
    { value: 'BDR' as const, label: 'BDR', count: counts.BDR || 0 },
    { value: 'CRYPTO' as const, label: 'Cripto', count: counts.CRYPTO || 0 },
  ].filter((c) => c.value === 'ALL' || c.count > 0)
})

const filteredPositions = computed(() => {
  const base = props.positions.slice().sort((a, b) => weightPct(b) - weightPct(a))
  if (activeClass.value === 'ALL') return base
  return base.filter((p) => p.asset_class === activeClass.value)
})

const visibleRows = computed(() => {
  return expanded.value ? filteredPositions.value : filteredPositions.value.slice(0, pageSize)
})

function weightPct(p: UnifiedPosition): number {
  if (!props.totalValue) return 0
  const v = p.current_value ?? (p.quantity * (p.current_price ?? p.average_price))
  return (v / props.totalValue) * 100
}

function pnlPct(p: UnifiedPosition): number {
  if (!p.current_price || !p.average_price) return 0
  return ((p.current_price - p.average_price) / p.average_price) * 100
}

function displayClass(k?: string): string {
  switch (k) {
    case 'STOCK': return 'Ação'
    case 'REIT': return 'FII'
    case 'ETF': return 'ETF'
    case 'BDR': return 'BDR'
    case 'TREASURY': return 'Tesouro'
    case 'CRYPTO': return 'Cripto'
    default: return ''
  }
}

// Mascarar quantidade + preco medio quando revealAmount = false.
// Quantidade × preco_medio = total investido naquela posicao, entao
// esconder os dois evita expor o tamanho de cada holding. Current
// price (dado publico de mercado) continua visivel pra o usuario nao
// perder contexto sobre o que cada ticker vale hoje.
const interfaceStore = useInterfaceStore()

function formatBRL2(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
function maskedBRL2(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••'
  return formatBRL2(n)
}
function formatPct(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}
</script>

<style scoped>
.position-row:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}
.th {
  padding: 10px 16px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.th-num {
  text-align: right;
}
.td {
  padding: 12px 16px;
  font-size: 12.5px;
  color: var(--brand-text);
}
.td-num {
  text-align: right;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}
</style>
