<!--
  PositionsTable — full positions list com tese inline expansivel.

  Uma tabela unica substitui o par anterior (PositionsTable +
  thesis_per_asset dentro do RaioXFull). Cada linha mostra:
    - Ativo (logo + ticker + nome + origem)
    - Setor
    - Qtde / Médio / Atual / Variação / Peso
    - Dot de status da tese (verde/amarelo/laranja/vermelho) quando
      o ativo foi analisado pela IA
    - Botao expand pra mostrar Tese + multiplos (P/L, P/VP, ROE, 12m)

  Quando `analysis` nao esta presente (ex.: usuario novo sem raio-X),
  a tabela degrada gracefully: sem dots de status, sem expand button,
  so mostra a foto crua das posicoes.

  Reads `UnifiedPosition[]` direto + `PortfolioAnalysis | null` opcional.
-->
<template>
  <section class="flex flex-col gap-3">
    <!-- Sub-header compacto: label leve "Posicoes" + filter pills.
         O heading principal ("Alocacao / Como sua carteira esta
         distribuida") foi elevado pra wallet/index.vue e e
         compartilhado com a AllocationSection no mesmo bloco. -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <span
        class="font-mono-tab text-[10.5px] font-medium uppercase"
        :style="{ letterSpacing: '0.18em', color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
      >Posições · {{ positions.length }} {{ positions.length === 1 ? 'ativo' : 'ativos' }}</span>
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
              <th v-if="hasTheses" class="th th-status" aria-label="Status da tese" />
              <th class="th">Ativo</th>
              <th class="th">Setor</th>
              <th class="th th-num">Qtde</th>
              <th class="th th-num">Médio</th>
              <th class="th th-num">Atual</th>
              <th class="th th-num">Variação</th>
              <th class="th th-num">Peso</th>
              <th v-if="hasTheses" class="th th-expand" aria-label="Expandir tese" />
            </tr>
          </thead>
          <tbody>
            <template v-for="p in visibleRows" :key="p.ticker">
              <tr
                class="position-row"
                :class="{ 'position-row--expandable': hasThesis(p), 'position-row--expanded': isExpanded(p) }"
                :style="{ borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
                @click="hasThesis(p) && toggleExpand(p)"
              >
                <td v-if="hasTheses" class="td td-status">
                  <span
                    v-if="hasThesis(p)"
                    class="position-dot"
                    :style="{ backgroundColor: thesisStatusColor(thesisFor(p)!.status), boxShadow: `0 0 0 3px color-mix(in srgb, ${thesisStatusColor(thesisFor(p)!.status)} 25%, transparent)` }"
                    :title="thesisStatusLabel(thesisFor(p)!.status)"
                    aria-hidden="true"
                  />
                  <span v-else class="position-dot position-dot--muted" aria-hidden="true" />
                </td>
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
                        <span
                          v-if="originLabel(p)"
                          class="ml-1 rounded px-1.5 py-0.5 font-mono-tab text-[9px] font-medium"
                          :style="originBadgeStyle(p)"
                          :title="originTitle(p)"
                        >{{ originLabel(p) }}</span>
                      </span>
                    </div>
                  </div>
                </td>
                <td class="td">
                  <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }">{{ p.sector || '—' }}</span>
                </td>
                <td class="td td-num">{{ interfaceStore.revealAmount ? p.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '••••' }}</td>
                <td class="td td-num">{{ maskedBRL2(p.average_price) }}</td>
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
                <td v-if="hasTheses" class="td td-expand">
                  <button
                    v-if="hasThesis(p)"
                    type="button"
                    class="position-expand-btn"
                    :class="{ 'position-expand-btn--rotated': isExpanded(p) }"
                    :aria-label="isExpanded(p) ? 'Ocultar tese' : 'Ver tese'"
                    @click.stop="toggleExpand(p)"
                  >
                    <UIcon name="i-lucide-chevron-down" class="size-4" />
                  </button>
                </td>
              </tr>

              <!-- Linha expandida — tese + múltiplos. Aparece logo
                   abaixo da linha principal, com background tonal
                   sutil pra distinguir. -->
              <tr
                v-if="hasThesis(p) && isExpanded(p)"
                class="thesis-row"
                :style="{ borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` }"
              >
                <td :colspan="hasTheses ? 9 : 7" class="thesis-row__cell">
                  <div class="thesis-row__inner">
                    <!-- Status badge + tese -->
                    <div class="thesis-row__main">
                      <div class="thesis-row__head">
                        <span
                          class="thesis-status-badge"
                          :style="{
                            backgroundColor: `color-mix(in srgb, ${thesisStatusColor(thesisFor(p)!.status)} 14%, transparent)`,
                            color: thesisStatusColor(thesisFor(p)!.status),
                            borderColor: `color-mix(in srgb, ${thesisStatusColor(thesisFor(p)!.status)} 35%, transparent)`,
                          }"
                        >
                          <UIcon :name="thesisStatusIcon(thesisFor(p)!.status)" class="size-3" aria-hidden="true" />
                          {{ thesisStatusLabel(thesisFor(p)!.status) }}
                        </span>
                        <span class="thesis-row__label">Tese</span>
                      </div>
                      <p class="thesis-row__text" :style="{ color: brand.colors.text }">
                        {{ thesisFor(p)!.thesis }}
                      </p>
                    </div>

                    <!-- Múltiplos -->
                    <div class="thesis-row__metrics">
                      <span class="thesis-row__label">Múltiplos</span>
                      <div class="thesis-metric-grid">
                        <div class="thesis-metric">
                          <span class="thesis-metric__label">P/L</span>
                          <span class="thesis-metric__value">{{ thesisFor(p)!.metrics?.pl ?? '—' }}</span>
                        </div>
                        <div class="thesis-metric">
                          <span class="thesis-metric__label">P/VP</span>
                          <span class="thesis-metric__value">{{ thesisFor(p)!.metrics?.pvp ?? '—' }}</span>
                        </div>
                        <div class="thesis-metric">
                          <span class="thesis-metric__label">ROE</span>
                          <span class="thesis-metric__value">
                            {{ thesisFor(p)!.metrics?.roe != null ? `${thesisFor(p)!.metrics!.roe}%` : '—' }}
                          </span>
                        </div>
                        <div class="thesis-metric">
                          <span class="thesis-metric__label">12m</span>
                          <span
                            class="thesis-metric__value"
                            :style="{ color: (thesisFor(p)!.metrics?.var12m ?? 0) >= 0 ? brand.colors.positive : brand.colors.negative }"
                          >
                            {{ thesisFor(p)!.metrics?.var12m != null ? formatPctSigned(thesisFor(p)!.metrics!.var12m!) : '—' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
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
import type { PortfolioAnalysis, PortfolioAnalysisThesis } from '~/services/walletData'

interface PositionRich {
  pluggy_connection_id?: number | null
}

interface ConnectionInfo {
  id: number
  institution_name: string
}

interface Props {
  positions: UnifiedPosition[]
  totalValue: number
  /**
   * Mapa de pluggy_connection_id -> { institution_name } pra renderizar
   * o badge "via XP" / "via BTG" nas posicoes vindas de Open Finance.
   */
  connectionMap?: Record<number, ConnectionInfo>
  /**
   * Analysis snapshot opcional. Quando presente, enriquece cada linha
   * com dot de status da tese + linha expansivel com tese + multiplos.
   */
  analysis?: PortfolioAnalysis | null
}
const props = withDefaults(defineProps<Props>(), {
  connectionMap: () => ({}),
  analysis: null,
})

const brand = useBrand()
const activeClass = ref<'ALL' | UnifiedAssetClass>('ALL')
const expanded = ref(false)
const pageSize = 12

// Set de tickers (uppercase) que estao expandidos pra mostrar tese.
const expandedTickers = ref<Set<string>>(new Set())

// Mapa ticker (uppercase) -> thesis entry pra lookup O(1) por linha.
const thesesByTicker = computed(() => {
  const map = new Map<string, PortfolioAnalysisThesis>()
  for (const t of props.analysis?.thesis_per_asset ?? []) {
    if (t.ticker) map.set(t.ticker.toUpperCase(), t)
  }
  return map
})

const hasTheses = computed(() => thesesByTicker.value.size > 0)

function thesisFor(p: UnifiedPosition): PortfolioAnalysisThesis | null {
  return thesesByTicker.value.get(p.ticker.toUpperCase()) ?? null
}

function hasThesis(p: UnifiedPosition): boolean {
  return thesesByTicker.value.has(p.ticker.toUpperCase())
}

function isExpanded(p: UnifiedPosition): boolean {
  return expandedTickers.value.has(p.ticker.toUpperCase())
}

function toggleExpand(p: UnifiedPosition) {
  const t = p.ticker.toUpperCase()
  const next = new Set(expandedTickers.value)
  if (next.has(t)) next.delete(t)
  else next.add(t)
  expandedTickers.value = next
}

// ---- Ticker logos via the shared snapshot composable -----------
const tickerSnaps = useTickerSnapshots()
const snapshots = tickerSnaps.snapshots
const subscribed = new Set<string>()
const positionTickers = computed(() => Array.from(new Set(props.positions.map((p) => p.ticker.toUpperCase()))))

watch(
  positionTickers,
  (tickers) => {
    for (const t of tickers) {
      if (!subscribed.has(t)) {
        tickerSnaps.subscribe(t)
        subscribed.add(t)
      }
    }
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
function formatPctSigned(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1).replace('.', ',')}%`
}

// ---- Thesis status mapping -------------------------------------
function thesisStatusColor(status: PortfolioAnalysisThesis['status']): string {
  switch (status) {
    case 'maintained': return brand.colors.positive
    case 'at-risk':    return (brand.colors as { warning?: string }).warning || '#f59e0b'
    case 'weakened':   return '#f97316'
    case 'broken':     return brand.colors.negative
    default:           return brand.colors.primary
  }
}

function thesisStatusLabel(status: PortfolioAnalysisThesis['status']): string {
  switch (status) {
    case 'maintained': return 'Tese mantida'
    case 'at-risk':    return 'Em risco'
    case 'weakened':   return 'Enfraquecida'
    case 'broken':     return 'Tese rompida'
    default:           return status
  }
}

function thesisStatusIcon(status: PortfolioAnalysisThesis['status']): string {
  switch (status) {
    case 'maintained': return 'i-lucide-circle-check'
    case 'at-risk':    return 'i-lucide-alert-triangle'
    case 'weakened':   return 'i-lucide-trending-down'
    case 'broken':     return 'i-lucide-x-circle'
    default:           return 'i-lucide-circle'
  }
}

// ---- Origin badge -----------------------------------------------
function getSource(p: UnifiedPosition): 'pluggy' | 'xlsx' | 'manual' | null {
  const s = (p.source || '').toLowerCase()
  if (s === 'pluggy') return 'pluggy'
  if (s === 'xlsx') return 'xlsx'
  if (s === 'manual') return 'manual'
  return null
}

function originLabel(p: UnifiedPosition): string | null {
  const src = getSource(p)
  if (src === 'pluggy') {
    const connId = (p as UnifiedPosition & PositionRich).pluggy_connection_id
    if (connId && props.connectionMap[connId]) {
      return `via ${props.connectionMap[connId]!.institution_name}`
    }
    return 'Open Finance'
  }
  if (src === 'xlsx' || src === 'manual') return 'Manual'
  return null
}

function originTitle(p: UnifiedPosition): string {
  const src = getSource(p)
  if (src === 'pluggy') return 'Importado via Open Finance (sincronização automática)'
  if (src === 'xlsx') return 'Importado por planilha'
  if (src === 'manual') return 'Adicionado manualmente'
  return ''
}

function originBadgeStyle(p: UnifiedPosition) {
  const src = getSource(p)
  if (src === 'pluggy') {
    return {
      backgroundColor: 'color-mix(in srgb, var(--brand-positive, #10b981) 14%, transparent)',
      color: 'var(--brand-positive, #10b981)',
    }
  }
  return {
    backgroundColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)',
    color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)',
  }
}
</script>

<style scoped>
.position-row:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}
.position-row--expandable {
  cursor: pointer;
}
.position-row--expanded {
  background-color: color-mix(in srgb, var(--brand-primary) 5%, transparent);
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
.th-status {
  width: 28px;
  padding-left: 16px;
  padding-right: 0;
}
.th-expand {
  width: 36px;
  padding-left: 0;
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
.td-status {
  width: 28px;
  padding-left: 16px;
  padding-right: 0;
}
.td-expand {
  width: 36px;
  padding-left: 0;
  padding-right: 12px;
  text-align: right;
}

/* ============ STATUS DOT ============ */
.position-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  vertical-align: middle;
}
.position-dot--muted {
  background: color-mix(in srgb, var(--brand-text) 18%, transparent);
}

/* ============ EXPAND BTN ============ */
.position-expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: transparent;
  border: 0;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms, transform 220ms;
}
.position-expand-btn:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}
.position-expand-btn--rotated {
  transform: rotate(180deg);
  color: var(--brand-primary);
}

/* ============ THESIS ROW (expanded) ============ */
.thesis-row {
  background: color-mix(in srgb, var(--brand-primary) 3%, transparent);
}

.thesis-row__cell {
  padding: 0 !important;
}

.thesis-row__inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  padding: 18px 22px 22px;
}

@media (min-width: 768px) {
  .thesis-row__inner {
    grid-template-columns: 1.5fr 1fr;
    gap: 28px;
  }
}

.thesis-row__main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.thesis-row__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.thesis-row__label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.thesis-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 1px solid;
}

.thesis-row__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--brand-text);
}

.thesis-row__metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.thesis-metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.thesis-metric {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-surface) 70%, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}

.thesis-metric__label {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.thesis-metric__value {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  font-weight: 500;
  color: var(--brand-text);
}
</style>
