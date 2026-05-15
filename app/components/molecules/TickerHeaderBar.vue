<!--
  MoleculesTickerHeaderBar: barra horizontal minimalista usada nas paginas
  de asset, crypto e tesouro. Substitui o "hero card" decorativo (com
  gradient + grid texture + 3-col grid) por uma row enxuta no padrao
  da imagem aprovada (logo + ticker/name/badge | stats inline | sparkline).

  Desktop: single row, todas as colunas inline.
  Mobile: stack vertical em 3 zones (identidade+preco / stats grid / sparkline).
-->
<template>
  <header class="tk-bar">
    <!-- Zone 1: identidade (logo + ticker + name + badge) -->
    <div class="tk-identity">
      <div v-if="logo" class="tk-logo">
        <NuxtImg
          :src="logo"
          :alt="`Logo ${ticker}`"
          width="48"
          height="48"
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
        <div class="tk-subline">
          <span v-if="name" class="tk-name">{{ name }}</span>
          <span
            v-if="badge"
            class="tk-badge"
            :style="badgeColor ? { backgroundColor: `${badgeColor}1F`, color: badgeColor } : undefined"
          >{{ badge }}</span>
        </div>
      </div>
    </div>

    <!-- Zone 2: stats inline (price + extras) -->
    <div class="tk-stats">
      <!-- Price cell (sempre primeira) -->
      <div v-if="priceValue !== undefined && priceValue !== null" class="tk-stat tk-stat--price">
        <p class="tk-stat-label">{{ priceLabel || 'Preço' }}</p>
        <p class="tk-stat-value tk-stat-value--bold">
          <span v-if="priceUnit" class="tk-stat-unit">{{ priceUnit }}</span>{{ priceValue }}
        </p>
        <p
          v-if="changePercent !== undefined && changePercent !== null"
          class="tk-stat-change"
          :style="{ color: Number(changePercent) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
        >
          <span aria-hidden="true">{{ Number(changePercent) >= 0 ? '↑' : '↓' }}</span>
          {{ Number(changePercent) >= 0 ? '+' : '' }}{{ Number(changePercent).toFixed(2) }}% {{ changeLabel || 'hoje' }}
        </p>
      </div>

      <!-- Stats extras -->
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="tk-stat"
      >
        <p class="tk-stat-label">{{ stat.label }}</p>
        <p
          class="tk-stat-value"
          :style="stat.accent ? { color: stat.accent } : undefined"
        >{{ stat.value || '—' }}</p>
      </div>
    </div>

    <!-- Zone 3: sparkline (desktop only) -->
    <div v-if="sparkline && sparkline.line" class="tk-spark">
      <span class="tk-spark-label">{{ sparklineLabel || '7D' }}</span>
      <svg
        viewBox="0 0 120 32"
        preserveAspectRatio="none"
        class="tk-spark-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient :id="`tk-grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="sparkColor" stop-opacity="0.3" />
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
  priceLabel?: string
  priceValue?: string | number | null
  priceUnit?: string
  changePercent?: number | null
  changeLabel?: string
  stats?: TickerStat[]
  sparkline?: TickerSparkline
  sparklineLabel?: string
}>()

const uid = Math.random().toString(36).slice(2, 9)

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
</script>

<style scoped>
.tk-bar {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  padding: 14px 18px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
}
@media (max-width: 768px) {
  .tk-bar {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 14px;
  }
}

/* Zone 1: identity */
.tk-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.tk-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  flex-shrink: 0;
}
.tk-logo-img { width: 100%; height: 100%; object-fit: cover; }
.tk-logo--fallback {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--brand-primary);
}
.tk-identity-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tk-ticker {
  font-family: ui-monospace, monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-heading);
  margin: 0;
  line-height: 1.1;
}
.tk-subline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}
.tk-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}
.tk-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}

/* Zone 2: stats inline (escondido no mobile — apenas identidade visivel) */
.tk-stats {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}
@media (max-width: 768px) {
  .tk-stats { display: none; }
}
.tk-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tk-stat-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin: 0;
}
.tk-stat-value {
  font-size: 13px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--text-heading);
  margin: 0;
  white-space: nowrap;
  letter-spacing: -0.01em;
}
.tk-stat-value--bold { font-size: 16px; font-weight: 600; }
.tk-stat-unit {
  font-size: 0.7em;
  font-weight: 400;
  color: var(--text-muted);
  margin-right: 2px;
}
.tk-stat-change {
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  margin: 2px 0 0;
  padding: 1px 6px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-negative) 10%, transparent);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  align-self: flex-start;
}

/* Zone 3: sparkline */
.tk-spark {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
@media (max-width: 768px) { .tk-spark { display: none; } }
.tk-spark-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}
.tk-spark-svg {
  width: 120px;
  height: 28px;
}
</style>
