<!--
  MoleculesResultadoCarteiraTradesTable — historico de operacoes do
  Modo Carteira.

  Tabela densa mas legivel, com filtros (kind: day/swing/hold/income e
  side: BUY/SELL/DIVIDEND/JCP) + paginacao client-side (20/pagina).

  Cada linha: badge de kind (cor + icone) + ticker + data/holding +
  qty + preco entrada/saida + RESULT R$ (bold tabular) + volume mute.

  Volume aparece em MUTED no canto direito da linha — implementa a
  decisao UX da feature: notional/exposicao vive como contexto, nao
  como hero. P&L liquido em R$ e a metrica primaria.
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
          v-model="kindFilter"
          :options="kindOptions"
          size="sm"
          aria-label="Filtrar por tipo de operação"
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
      <span class="mt-2 block text-[13px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }">
        Nenhuma operação corresponde ao filtro selecionado.
      </span>
    </div>

    <div
      v-else
      class="trades-table rounded-xl border overflow-hidden"
      :style="tableStyle"
    >
      <!-- Header desktop -->
      <div
        class="trades-row trades-row--header"
        :style="{ backgroundColor: `color-mix(in srgb, var(--brand-background) 55%, transparent)` }"
      >
        <span class="th th--kind">Tipo</span>
        <span class="th th--asset">Ativo</span>
        <span class="th th--date">Data · Holding</span>
        <span class="th th--qty">Qtd</span>
        <span class="th th--price">Entrada → Saída</span>
        <span class="th th--result">Resultado</span>
        <span class="th th--volume">Volume</span>
      </div>

      <div
        v-for="t in paginated"
        :key="t.id"
        class="trades-row"
        :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 35%, transparent)` }"
      >
        <span class="td td--kind">
          <span
            class="kind-badge"
            :style="kindBadgeStyle(t.kind, t.side)"
          >
            <UIcon :name="kindIcon(t.kind, t.side)" class="size-3" aria-hidden="true" />
            {{ kindLabel(t.kind, t.side) }}
          </span>
        </span>

        <span class="td td--asset">
          <span class="asset-ticker tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ t.ticker }}
          </span>
          <span class="asset-name" :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }">
            {{ t.name }}
          </span>
        </span>

        <span class="td td--date">
          <span class="tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ formatDate(t.openedAt) }}
          </span>
          <span class="td--date-hint" :style="{ color: `color-mix(in srgb, var(--brand-text) 50%, transparent)` }">
            {{ holdingLabel(t) }}
          </span>
        </span>

        <span class="td td--qty tabular-nums" :style="{ color: 'var(--brand-text)' }">
          {{ formatQty(t.quantity, t.instrumentType) }}
        </span>

        <span class="td td--price">
          <span class="tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ formatPrice(t.openPrice, t.instrumentType) }}
          </span>
          <span :style="{ color: `color-mix(in srgb, var(--brand-text) 35%, transparent)` }">→</span>
          <span class="tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ t.closePrice != null ? formatPrice(t.closePrice, t.instrumentType) : '—' }}
          </span>
        </span>

        <span class="td td--result tabular-nums" :style="{ color: resultColor(t.resultAmount) }">
          {{ formatResult(t) }}
        </span>

        <span class="td td--volume tabular-nums" :style="{ color: `color-mix(in srgb, var(--brand-text) 45%, transparent)` }">
          {{ t.volume > 0 ? brl(t.volume) : '—' }}
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
import type { MockTrade, TradeKind } from '~/composables/useMockTrades'

const props = defineProps<{
  trades: MockTrade[]
}>()

const brand = useBrand()
const { brl } = useFormat()

const PAGE_SIZE = 20
type KindFilter = 'all' | TradeKind | 'income'
const kindFilter = ref<KindFilter>('all')
const page = ref(1)

const kindOptions = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'day' as const, label: 'Day' },
  { value: 'swing' as const, label: 'Swing' },
  { value: 'hold' as const, label: 'Hold' },
  { value: 'income' as const, label: 'Renda' },
]

const filtered = computed<MockTrade[]>(() => {
  const f = kindFilter.value
  if (f === 'all') return props.trades
  if (f === 'income') {
    return props.trades.filter((t) => t.side === 'DIVIDEND' || t.side === 'JCP')
  }
  return props.trades.filter(
    (t) => t.kind === f && t.side !== 'DIVIDEND' && t.side !== 'JCP',
  )
})

watch(filtered, () => { page.value = 1 })

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pageStart = computed(() => (page.value - 1) * PAGE_SIZE)
const paginated = computed(() => filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE))

// ============ Kind badges ============
function kindIcon(kind: TradeKind, side: MockTrade['side']): string {
  if (side === 'DIVIDEND' || side === 'JCP') return 'i-lucide-coins'
  switch (kind) {
    case 'day': return 'i-lucide-zap'
    case 'swing': return 'i-lucide-waves'
    case 'hold': return 'i-lucide-landmark'
  }
}

function kindLabel(kind: TradeKind, side: MockTrade['side']): string {
  if (side === 'DIVIDEND') return 'Dividendo'
  if (side === 'JCP') return 'JCP'
  switch (kind) {
    case 'day': return 'Day'
    case 'swing': return 'Swing'
    case 'hold': return 'Hold'
  }
}

function kindBadgeStyle(kind: TradeKind, side: MockTrade['side']) {
  // Cores semanticas: day = amber (rapido/atencao), swing = blue (medio
  // prazo, calmo), hold = teal (longevo, defensivo), income = roxo
  // (passivo, "cair do ceu").
  let base = 'var(--brand-text)'
  if (side === 'DIVIDEND' || side === 'JCP') base = '#a78bfa'
  else if (kind === 'day') base = '#fbbf24'
  else if (kind === 'swing') base = '#60a5fa'
  else if (kind === 'hold') base = '#34d399'
  return {
    backgroundColor: `color-mix(in srgb, ${base} 14%, transparent)`,
    color: base,
    borderColor: `color-mix(in srgb, ${base} 28%, transparent)`,
  }
}

// ============ Formatadores ============
function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

function holdingLabel(t: MockTrade): string {
  if (t.side === 'DIVIDEND' || t.side === 'JCP') return 'Provento'
  if (!t.closedAt) return 'Em aberto'
  const sec = t.holdingSeconds
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.round(sec / 60)}min`
  if (sec < 86400) {
    const h = Math.floor(sec / 3600)
    const m = Math.round((sec % 3600) / 60)
    return m ? `${h}h ${m}min` : `${h}h`
  }
  const d = Math.round(sec / 86400)
  return `${d}d`
}

function formatQty(qty: number, _instrument: string): string {
  if (qty === Math.floor(qty)) return qty.toString()
  return qty.toFixed(2).replace('.', ',')
}

function formatPrice(price: number, instrument: string): string {
  if (instrument === 'FUTURES' && price > 1000) {
    // Mini-indice: formato 130.450
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(price)
  }
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: instrument === 'FUTURES' ? 4 : 2,
  }).format(price)
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
  // Pra futuros, mostra pontos como sufixo educacional
  if (t.instrumentType === 'FUTURES' && t.resultPoints != null) {
    return `${sign}${value}  ·  ${t.resultPoints > 0 ? '+' : ''}${t.resultPoints} pts`
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
    minmax(120px, 1fr)
    minmax(70px, 70px)
    minmax(160px, 1.2fr)
    minmax(150px, 1fr)
    minmax(110px, 110px);
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
  /* Em telas medias, esconde Volume e mantem o resto */
  .trades-row {
    grid-template-columns:
      minmax(110px, 110px)
      minmax(140px, 1.4fr)
      minmax(120px, 1fr)
      minmax(70px, 70px)
      minmax(160px, 1.2fr)
      minmax(150px, 1fr);
  }
  .th--volume, .td--volume { display: none; }
}

@media (max-width: 720px) {
  /* Em mobile, vira layout vertical empilhado por linha */
  .trades-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px 12px;
    padding: 14px 12px;
  }
  .trades-row--header { display: none; }
  .td--kind { grid-column: 1; }
  .td--result { grid-column: 2; justify-self: end; }
  .td--asset { grid-column: 1 / -1; }
  .td--date { grid-column: 1; }
  .td--qty { grid-column: 2; justify-self: end; }
  .td--price { grid-column: 1 / -1; }
  .td--volume { display: none; }
}

.kind-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
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

.td--date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.td--date-hint {
  font-size: 11px;
}

.td--price {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
}

.td--result {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.td--volume {
  font-size: 12px;
  text-align: right;
  font-variant-numeric: tabular-nums;
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
