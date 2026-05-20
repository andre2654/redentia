<!--
  MoleculesResultadoCarteiraOpenPositions — posicoes em aberto da carteira.

  Mostra o que o user esta carregando AGORA, com mark-to-market real:
  preco medio comprado, preco atual de mercado, P&L unrealized em R$
  e em % vs custo. Ordena por |P&L| desc — maiores movimentos no topo.

  Substitui a tabela antiga de "operacoes fechadas" no modo Carteira.
  Operacoes fechadas vivem na equity curve (visao temporal) e no
  drill-down do heatmap (visao diaria). Pra carteira, o que importa
  ver na tabela e "o que estou carregando".

  P&L = (preco_atual − preco_medio) × quantidade. Sem fees. Mesmo
  calculo do hero e do equity curve — todos batem.
-->
<template>
  <section class="flex flex-col gap-3">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex flex-col gap-1">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: 'var(--brand-primary)' }"
        >Posições</span>
        <h3
          class="font-light"
          :style="{ fontSize: '18px', color: 'var(--brand-text)', letterSpacing: '-0.01em' }"
        >Em aberto na carteira</h3>
      </div>

      <span
        v-if="positions.length"
        class="font-mono-tab text-[12px] tabular-nums"
        :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }"
      >
        {{ positions.length }} {{ positions.length === 1 ? 'ativo' : 'ativos' }}
        ·
        <span :style="{ color: totalPnl >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }">
          {{ totalPnl >= 0 ? '+' : '−' }}{{ brl(Math.abs(totalPnl)) }}
        </span>
      </span>
    </header>

    <div
      v-if="!positions.length"
      class="empty rounded-xl border p-8 text-center"
      :style="emptyStyle"
    >
      <UIcon
        name="i-lucide-inbox"
        class="size-6 opacity-40 mx-auto"
        :style="{ color: 'var(--brand-text)' }"
      />
      <span class="mt-2 block text-[13px]" :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }">
        Nenhuma posição aberta no momento.
      </span>
    </div>

    <div
      v-else
      class="positions-table rounded-xl border overflow-hidden"
      :style="tableStyle"
    >
      <div
        class="positions-row positions-row--header"
        :style="{ backgroundColor: `color-mix(in srgb, var(--brand-background) 55%, transparent)` }"
      >
        <span class="th th--asset">Ativo</span>
        <span class="th th--qty">Qtd</span>
        <span class="th th--avg">Preço médio</span>
        <span class="th th--current">Atual</span>
        <span class="th th--pnl">P&amp;L</span>
        <span class="th th--pct">%</span>
        <span class="th th--invested">Investido</span>
      </div>

      <div
        v-for="p in positions"
        :key="p.id"
        class="positions-row"
        :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 35%, transparent)` }"
      >
        <span class="td td--asset">
          <span class="asset-ticker tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ p.ticker }}
          </span>
          <span class="asset-name" :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }">
            {{ p.name }}
          </span>
        </span>

        <span class="td td--qty tabular-nums" :style="{ color: 'var(--brand-text)' }">
          {{ formatQty(p.quantity) }}
        </span>

        <span class="td td--avg tabular-nums" :style="{ color: 'var(--brand-text)' }">
          {{ formatPrice(p.openPrice) }}
        </span>

        <span class="td td--current tabular-nums" :style="{ color: 'var(--brand-text)' }">
          {{ p.closePrice != null ? formatPrice(p.closePrice) : '—' }}
        </span>

        <span class="td td--pnl tabular-nums" :style="{ color: pnlColor(p.resultAmount) }">
          {{ formatPnl(p.resultAmount) }}
        </span>

        <span class="td td--pct tabular-nums" :style="{ color: pnlColor(p.resultAmount) }">
          {{ formatPct(p) }}
        </span>

        <span class="td td--invested tabular-nums" :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }">
          {{ brl(p.notional) }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MockTrade } from '~/composables/useMockTrades'

const props = defineProps<{
  trades: MockTrade[]
}>()

const brand = useBrand()
const { brl } = useFormat()

// Posicoes = trades em aberto (closedAt null), excluindo dividendos.
// Ordena por |P&L| desc — maiores impactos primeiro.
const positions = computed<MockTrade[]>(() =>
  props.trades
    .filter((t) => !t.closedAt && t.side !== 'DIVIDEND' && t.side !== 'JCP' && t.side !== 'INCOME')
    .slice()
    .sort((a, b) => Math.abs(b.resultAmount ?? 0) - Math.abs(a.resultAmount ?? 0)),
)

const totalPnl = computed(() =>
  positions.value.reduce((s, p) => s + (p.resultAmount ?? 0), 0),
)

function formatQty(qty: number): string {
  if (qty === Math.floor(qty)) return qty.toString()
  return qty.toFixed(2).replace('.', ',')
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

function pnlColor(amount: number | null): string {
  if (amount == null || amount === 0) {
    return `color-mix(in srgb, var(--brand-text) 65%, transparent)`
  }
  return amount > 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
}

function formatPnl(amount: number | null): string {
  if (amount == null) return '—'
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : ''
  return `${sign}${brl(Math.abs(amount))}`
}

function formatPct(p: MockTrade): string {
  if (!p.notional || p.resultAmount == null) return '—'
  const pct = (p.resultAmount / p.notional) * 100
  if (!Number.isFinite(pct)) return '—'
  const sign = pct >= 0 ? '+' : '−'
  return `${sign}${Math.abs(pct).toFixed(2).replace('.', ',')}%`
}

const tableStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
}))

const emptyStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 50%, transparent)`,
}))
</script>

<style scoped>
.positions-row {
  display: grid;
  grid-template-columns:
    minmax(160px, 1.5fr)
    minmax(70px, 80px)
    minmax(110px, 110px)
    minmax(110px, 110px)
    minmax(130px, 130px)
    minmax(80px, 90px)
    minmax(120px, 120px);
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-top: 1px solid;
  font-size: 13px;
}
.positions-row:first-of-type { border-top: none; }
.positions-row--header {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  border-top: none;
}

@media (max-width: 1100px) {
  /* Em telas medias, esconde "Investido" — info secundaria */
  .positions-row {
    grid-template-columns:
      minmax(160px, 1.5fr)
      minmax(70px, 80px)
      minmax(110px, 110px)
      minmax(110px, 110px)
      minmax(130px, 130px)
      minmax(80px, 90px);
  }
  .th--invested, .td--invested { display: none; }
}

@media (max-width: 720px) {
  .positions-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px 12px;
    padding: 14px 12px;
  }
  .positions-row--header { display: none; }
  .td--asset { grid-column: 1 / -1; }
  .td--qty { grid-column: 1; }
  .td--avg { grid-column: 2; justify-self: end; }
  .td--current { grid-column: 1; }
  .td--pnl { grid-column: 2; justify-self: end; font-size: 14px; font-weight: 600; }
  .td--pct { grid-column: 1; font-size: 11px; }
  .td--invested { display: none; }
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

.td--pnl {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
