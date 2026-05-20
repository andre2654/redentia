<!--
  MoleculesResultadoDayTradeTrades — historico de operacoes intraday.

  Mesma receita visual da CarteiraTradesTable: section com header
  (eyebrow + h3 + opcional filtro), card rounded-xl com border 1px,
  rows em grid 7-col, paginacao 20/page, empty state.

  Adaptacoes pra contexto day-trade:
    - Coluna "Tempo" com timestamp HH:MM:SS no lugar de "Tipo"
      (kind sempre 'day', nao precisa de badge)
    - Coluna "Side" com pill LONG (futuro: SHORT)
    - Coluna "Hold" em min/h (escala intraday)
    - Volume sai (informacao secundaria pra day-trade);
      Hold passa a ocupar slot final ao lado do Resultado
-->
<template>
  <section class="flex flex-col gap-3">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex flex-col gap-1">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: 'var(--brand-primary)' }"
        >Histórico</span>
        <h3
          class="font-light"
          :style="{ fontSize: '18px', color: 'var(--brand-text)', letterSpacing: '-0.01em' }"
        >Operações no período</h3>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <AtomsSegmented
          v-model="sideFilter"
          :options="sideOptions"
          size="sm"
          aria-label="Filtrar resultado"
        />
      </div>
    </header>

    <div
      v-if="!filtered.length"
      class="empty rounded-xl border p-8 text-center"
      :style="emptyStyle"
    >
      <UIcon
        name="i-lucide-search"
        class="size-6 opacity-40 mx-auto"
        :style="{ color: 'var(--brand-text)' }"
      />
      <span
        class="mt-2 block text-[13px]"
        :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }"
      >
        Nenhuma operação corresponde ao filtro selecionado.
      </span>
    </div>

    <div
      v-else
      class="trades-table rounded-xl border overflow-hidden"
      :style="tableStyle"
    >
      <!-- Header -->
      <div
        class="trades-row trades-row--header"
        :style="{ backgroundColor: `color-mix(in srgb, var(--brand-background) 55%, transparent)` }"
      >
        <span class="th th--time">Tempo</span>
        <span class="th th--asset">Ativo</span>
        <span class="th th--side">Side</span>
        <span class="th th--qty">Qtd</span>
        <span class="th th--prices">Entrada → Saída</span>
        <span class="th th--hold">Hold</span>
        <span class="th th--result">Resultado</span>
      </div>

      <!-- Linhas -->
      <div
        v-for="t in paginated"
        :key="t.id"
        class="trades-row"
        :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 35%, transparent)` }"
      >
        <span class="td td--time">
          <span
            class="td--time-hms tabular-nums"
            :style="{ color: 'var(--brand-text)' }"
          >{{ formatTime(t.closedAt!) }}</span>
          <span
            class="td--time-date tabular-nums"
            :style="{ color: `color-mix(in srgb, var(--brand-text) 50%, transparent)` }"
          >{{ formatDate(t.closedAt!) }}</span>
        </span>

        <span class="td td--asset">
          <span class="asset-ticker tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ t.ticker }}
          </span>
          <span class="asset-name" :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }">
            {{ t.name }}
          </span>
        </span>

        <span class="td td--side">
          <span
            class="side-pill"
            :style="{
              color: 'var(--brand-positive)',
              borderColor: `color-mix(in srgb, var(--brand-positive) 30%, transparent)`,
              backgroundColor: `color-mix(in srgb, var(--brand-positive) 10%, transparent)`,
            }"
          >
            <UIcon name="i-lucide-arrow-up-right" class="size-3" />
            LONG
          </span>
        </span>

        <span class="td td--qty tabular-nums" :style="{ color: 'var(--brand-text)' }">
          {{ formatQty(t.quantity) }}
        </span>

        <span class="td td--prices">
          <span class="tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ formatPrice(t.openPrice, t.instrumentType) }}
          </span>
          <span :style="{ color: `color-mix(in srgb, var(--brand-text) 35%, transparent)` }">→</span>
          <span class="tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ t.closePrice != null ? formatPrice(t.closePrice, t.instrumentType) : '—' }}
          </span>
        </span>

        <span class="td td--hold tabular-nums" :style="{ color: `color-mix(in srgb, var(--brand-text) 65%, transparent)` }">
          {{ formatHold(t.holdingSeconds) }}
        </span>

        <span class="td td--result tabular-nums" :style="{ color: resultColor(t.resultAmount) }">
          {{ formatResult(t) }}
        </span>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between gap-3 px-1 text-[12px]"
      :style="{ color: `color-mix(in srgb, var(--brand-text) 60%, transparent)` }"
    >
      <span>
        {{ pageStart + 1 }}–{{ Math.min(pageStart + PAGE_SIZE, filtered.length) }}
        de {{ filtered.length }}
      </span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="page-btn"
          :disabled="page === 1"
          :style="pageButtonStyle"
          @click="page = Math.max(1, page - 1)"
        >
          <UIcon name="i-lucide-chevron-left" class="size-3.5" />
          Anterior
        </button>
        <span class="font-mono-tab tabular-nums">{{ page }} / {{ totalPages }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="page === totalPages"
          :style="pageButtonStyle"
          @click="page = Math.min(totalPages, page + 1)"
        >
          Próxima
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MockTrade } from '~/composables/useMockTrades'
import type { DayTradePeriod } from '~/composables/useDayTradeStats'

const props = defineProps<{
  /** Trades day-trade fechados, ordenados por closedAt asc. */
  trades: MockTrade[]
  period: DayTradePeriod
}>()

const brand = useBrand()
const { brl } = useFormat()

const PAGE_SIZE = 20
type SideFilter = 'all' | 'wins' | 'losses'
const sideFilter = ref<SideFilter>('all')
const page = ref(1)

const sideOptions = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'wins' as const, label: 'Ganhos' },
  { value: 'losses' as const, label: 'Perdas' },
]

// Mais recente primeiro pra leitura natural (top of mind).
const orderedDesc = computed(() =>
  [...props.trades].sort(
    (a, b) => new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime(),
  ),
)

const filtered = computed<MockTrade[]>(() => {
  const f = sideFilter.value
  if (f === 'all') return orderedDesc.value
  if (f === 'wins') return orderedDesc.value.filter((t) => (t.resultAmount ?? 0) > 0)
  return orderedDesc.value.filter((t) => (t.resultAmount ?? 0) < 0)
})

watch(filtered, () => { page.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pageStart = computed(() => (page.value - 1) * PAGE_SIZE)
const paginated = computed(() => filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE))

// ============ Formatters ============
function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

function formatQty(qty: number): string {
  if (qty === Math.floor(qty)) return qty.toString()
  return qty.toFixed(2).replace('.', ',')
}

function formatPrice(price: number, instrument: string): string {
  if (instrument === 'FUTURES' && price > 1000) {
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(price)
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: instrument === 'FUTURES' ? 4 : 2,
  }).format(price)
}

function formatHold(sec: number): string {
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.round(sec / 60)}min`
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return m ? `${h}h${m}` : `${h}h`
}

function resultColor(amount: number | null): string {
  if (amount == null || amount === 0) {
    return `color-mix(in srgb, var(--brand-text) 65%, transparent)`
  }
  return amount > 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
}

function formatResult(t: MockTrade): string {
  if (t.resultAmount == null) return '—'
  const sign = t.resultAmount > 0 ? '+' : t.resultAmount < 0 ? '−' : ''
  const value = brl(Math.abs(t.resultAmount))
  if (t.instrumentType === 'FUTURES' && t.resultPoints != null) {
    return `${sign}${value} · ${t.resultPoints > 0 ? '+' : ''}${t.resultPoints}pts`
  }
  return `${sign}${value}`
}

const tableStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
}))

const emptyStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
}))

const pageButtonStyle = computed(() => ({
  backgroundColor: 'transparent',
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
  color: 'var(--brand-text)',
}))
</script>

<style scoped>
.trades-row {
  display: grid;
  grid-template-columns:
    minmax(110px, 110px)
    minmax(140px, 1.4fr)
    minmax(80px, 80px)
    minmax(70px, 70px)
    minmax(160px, 1.2fr)
    minmax(80px, 80px)
    minmax(150px, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-top: 1px solid;
  font-size: 13px;
}

.trades-row:first-of-type { border-top: none; }

.trades-row--header {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  border-top: none;
}

@media (max-width: 1100px) {
  /* Em telas medias: esconde Side, mantem o resto. */
  .trades-row {
    grid-template-columns:
      minmax(110px, 110px)
      minmax(140px, 1.4fr)
      minmax(70px, 70px)
      minmax(160px, 1.2fr)
      minmax(80px, 80px)
      minmax(150px, 1fr);
  }
  .th--side, .td--side { display: none; }
}

@media (max-width: 720px) {
  /* Em mobile, vira layout vertical empilhado por linha */
  .trades-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px 12px;
    padding: 14px 12px;
  }
  .trades-row--header { display: none; }
  .td--time { grid-column: 1; }
  .td--result { grid-column: 2; justify-self: end; }
  .td--asset { grid-column: 1 / -1; }
  .td--qty { grid-column: 1; }
  .td--hold { grid-column: 2; justify-self: end; }
  .td--prices { grid-column: 1 / -1; }
  .td--side { display: none; }
}

/* Coluna Tempo: HH:MM:SS em monospace bold + dia/mês mute embaixo */
.td--time {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.td--time-hms {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  font-variant-numeric: tabular-nums;
}

.td--time-date {
  font-size: 10.5px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.td--asset {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.asset-ticker {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  display: block;
}

.asset-name {
  font-size: 11px;
  display: block;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
}

.td--qty {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.td--prices {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}

.td--hold {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.td--result {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease;
}

.page-btn:not(:disabled):hover {
  background-color: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent) !important;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
