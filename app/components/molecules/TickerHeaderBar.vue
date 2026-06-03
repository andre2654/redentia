<!--
  MoleculesTickerHeaderBar: cabecalho editorial das paginas de asset,
  crypto e tesouro. Redesign 2026-05 — card maior, logo grande,
  stats com captions, sparkline carded no canto direito.

  Desktop: row de 3 zones com separadores verticais entre stats.
  Mobile: stack vertical (identidade / stats em grid 2x2 / sparkline).
-->
<template>
  <header class="tk-bar">
    <!-- Zone 1: identidade (logo grande + ticker + name + badges) -->
    <div class="tk-identity">
      <div v-if="logo" class="tk-logo">
        <NuxtImg
          :src="logo"
          :alt="`Logo ${ticker}`"
          width="88"
          height="88"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          class="tk-logo-img"
        />
      </div>
      <div v-else class="tk-logo tk-logo--fallback">
        <span>{{ ticker.slice(0, 2).toUpperCase() }}</span>
      </div>

      <div class="tk-identity-text">
        <h1 class="tk-ticker" translate="no">{{ ticker }}</h1>
        <p v-if="name" class="tk-name">{{ formatName(name) }}</p>
        <div v-if="badge || secondaryBadge" class="tk-badges">
          <span
            v-if="badge"
            class="tk-badge"
            :style="badgeColor ? { backgroundColor: `${badgeColor}1F`, color: badgeColor } : undefined"
          >{{ badge }}</span>
          <span
            v-if="secondaryBadge"
            class="tk-badge tk-badge--neutral"
          >{{ secondaryBadge }}</span>
        </div>
      </div>
    </div>

    <!-- Zone 2: stats grid (preço + extras) com separadores verticais -->
    <div class="tk-stats">
      <!-- Price cell (sempre primeira) -->
      <div v-if="priceValue !== undefined && priceValue !== null" class="tk-stat tk-stat--price">
        <p class="tk-stat-label">{{ priceLabel || 'Preço atual' }}</p>
        <p class="tk-stat-value tk-stat-value--bold">
          <span v-if="priceUnit" class="tk-stat-unit">{{ priceUnit }}</span>{{ priceValue }}
        </p>
        <p
          v-if="changePercent !== undefined && changePercent !== null"
          class="tk-stat-change"
          :style="{ color: Number(changePercent) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
        >
          <span aria-hidden="true">{{ Number(changePercent) >= 0 ? '↑' : '↓' }}</span>
          {{ Number(changePercent) >= 0 ? '+' : '' }}{{ Number(changePercent).toFixed(2).replace('.', ',') }}% {{ changeLabel || 'hoje' }}
        </p>
      </div>

      <!-- Stats extras (cada uma com label, value, caption opcional) -->
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="tk-stat"
      >
        <p class="tk-stat-label">{{ stat.label }}</p>
        <p
          class="tk-stat-value tk-stat-value--bold"
          :style="stat.accent ? { color: stat.accent } : undefined"
        >{{ stat.value || '—' }}</p>
        <p v-if="stat.caption" class="tk-stat-caption">{{ stat.caption }}</p>
      </div>
    </div>

    <!-- Zone 3: sparkline (card com header) -->
    <div v-if="sparkline && sparkline.line" class="tk-spark">
      <div class="tk-spark-head">
        <span class="tk-spark-label">{{ sparklineLabel || 'Desempenho 30 dias' }}</span>
        <span
          v-if="sparkChange !== undefined && sparkChange !== null"
          class="tk-spark-change"
          :style="{ color: Number(sparkChange) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
          translate="no"
        >{{ Number(sparkChange) >= 0 ? '+' : '' }}{{ Number(sparkChange).toFixed(2).replace('.', ',') }}%</span>
      </div>
      <svg
        viewBox="0 0 160 56"
        preserveAspectRatio="none"
        class="tk-spark-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient :id="`tk-grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="sparkColor" stop-opacity="0.28" />
            <stop offset="100%" :stop-color="sparkColor" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path v-if="sparkline.area" :d="sparkline.area" :fill="`url(#tk-grad-${uid})`" />
        <path
          :d="sparkline.line"
          fill="none"
          :stroke="sparkColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>
  </header>
</template>

<script setup lang="ts">
export type TickerStat = {
  label: string
  value?: string | number | null
  caption?: string
  accent?: string
}

export type TickerSparkline = {
  line: string
  area?: string
  color?: string
}

const props = defineProps<{
  logo?: string
  ticker: string
  name?: string
  badge?: string
  badgeColor?: string
  /** Segunda pill (opcional) — ex: "B3", "NYSE", "NASDAQ" */
  secondaryBadge?: string
  priceLabel?: string
  priceValue?: string | number | null
  priceUnit?: string
  changePercent?: number | null
  changeLabel?: string
  stats?: TickerStat[]
  sparkline?: TickerSparkline
  sparklineLabel?: string
  /** Change % for the sparkline's OWN window (e.g. 30d). Falls back to
   *  changePercent (today) when omitted, so existing callers are unchanged. */
  sparklineChange?: number | null
}>()

const uid = Math.random().toString(36).slice(2, 9)

// The sparkline delta should track ITS window (sparklineChange), not today's
// price move. Only fall back to changePercent when the caller doesn't provide
// a window delta AT ALL (undefined — e.g. crypto/tesouro pages). An EXPLICIT
// null means "window data missing" → render no delta, so a "30 dias" label
// never silently shows today's % (P2.3).
const sparkChange = computed(() =>
  props.sparklineChange === undefined ? props.changePercent : props.sparklineChange,
)

const sparkColor = computed(() => {
  if (props.sparkline?.color) return props.sparkline.color
  // Derive from changePercent if not provided
  if (props.changePercent !== undefined && props.changePercent !== null) {
    return Number(props.changePercent) >= 0
      ? 'var(--brand-positive)'
      : 'var(--brand-negative)'
  }
  return 'var(--brand-primary)'
})

// Limpa o nome do ativo — StatusInvest devolve "MINERVA     ON      NM"
// com espaços largos. Compactamos pra um espaço só pra renderizar limpo.
function formatName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}
</script>

<style scoped>
.tk-bar {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr) auto;
  align-items: center;
  gap: 32px;
  padding: 24px 28px;
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  border-radius: 14px;
}
@media (max-width: 768px) {
  .tk-bar {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 18px;
  }
}

/* Zone 1: identity — logo grande + ticker + name + badges */
.tk-identity {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}
.tk-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  flex-shrink: 0;
}
.tk-logo-img { width: 100%; height: 100%; object-fit: cover; }
.tk-logo--fallback {
  font-family: ui-monospace, monospace;
  font-size: 22px;
  font-weight: 700;
  color: var(--brand-primary);
}
.tk-identity-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.tk-ticker {
  font-family: ui-monospace, monospace;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-heading);
  margin: 0;
  line-height: 1;
}
.tk-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
  margin: 0;
}
.tk-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.tk-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}
.tk-badge--neutral {
  background: color-mix(in srgb, var(--text-heading) 6%, transparent);
  color: var(--text-body);
}

/* Zone 2: stats grid com separadores verticais entre celulas */
.tk-stats {
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  flex-wrap: wrap;
}
@media (max-width: 768px) {
  .tk-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    justify-content: stretch;
  }
}
.tk-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 0 22px;
  border-left: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
.tk-stat:first-child { border-left: none; padding-left: 0; }
@media (max-width: 768px) {
  .tk-stat {
    padding: 0;
    border-left: none;
  }
  .tk-stat:first-child { padding: 0; }
}
.tk-stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin: 0;
  letter-spacing: 0;
}
.tk-stat-value {
  font-size: 22px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--text-heading);
  margin: 0;
  white-space: nowrap;
  letter-spacing: -0.02em;
  line-height: 1;
}
.tk-stat-value--bold { font-weight: 500; }
.tk-stat-unit {
  font-size: 0.7em;
  font-weight: 400;
  color: var(--text-muted);
  margin-right: 4px;
}
.tk-stat-caption {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
  margin: 0;
  letter-spacing: 0;
}
.tk-stat-change {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  align-self: flex-start;
}

/* Zone 3: sparkline carded com header */
.tk-spark {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  background: var(--bg-base);
  flex-shrink: 0;
  min-width: 200px;
}
@media (max-width: 768px) { .tk-spark { width: 100%; } }
.tk-spark-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.tk-spark-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}
.tk-spark-change {
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.tk-spark-svg {
  width: 100%;
  height: 56px;
}
</style>
