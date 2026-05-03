<!--
  MetricsGrid — 4 KPI cards mirroring the Dashboard.vue mockup.

  Pure presentational. Receives totals + score + dividend forecast +
  benchmark comparison snapshots as props. The sparkline is a static
  SVG gestures only (no live time-series); we keep it minimal so the
  card feels "Stripe-quiet" instead of dashboard-noisy.
-->
<template>
  <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    <article class="metric-card flex flex-col gap-2 rounded-xl border p-5" :style="cardStyle">
      <span class="mock-eyebrow">Patrimônio</span>
      <div
        class="font-mono-tab text-[24px] font-light tabular-nums"
        :style="{ color: brand.colors.text, letterSpacing: '-0.4px' }"
      >{{ maskedBRL(totalValue) }}</div>
      <svg viewBox="0 0 200 36" class="h-8 w-full">
        <defs>
          <linearGradient id="metric-spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" :stop-color="brand.colors.positive" stop-opacity="0.32" />
            <stop offset="100%" :stop-color="brand.colors.positive" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,28 L18,26 L36,30 L54,22 L72,24 L90,18 L108,20 L126,12 L144,15 L162,10 L180,7 L200,9"
          :stroke="brand.colors.positive"
          stroke-width="1.5"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M0,28 L18,26 L36,30 L54,22 L72,24 L90,18 L108,20 L126,12 L144,15 L162,10 L180,7 L200,9 L200,36 L0,36 Z"
          fill="url(#metric-spark)"
        />
      </svg>
      <span class="mock-meta">12 meses<span v-if="vsCdiPct !== null"> · contra CDI: {{ formatPct(vsCdiPct) }}</span></span>
    </article>

    <article class="metric-card flex flex-col gap-2 rounded-xl border p-5" :style="cardStyle">
      <span class="mock-eyebrow">Score Redentia</span>
      <div class="flex items-baseline gap-2">
        <div
          class="font-mono-tab text-[40px] font-light tabular-nums leading-none"
          :style="{ color: brand.colors.text, letterSpacing: '-0.04em' }"
        >{{ score }}</div>
        <span
          class="font-mono-tab text-[12px] tabular-nums"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
        >/100</span>
      </div>
      <span
        class="font-mono-tab text-[10.5px] font-medium uppercase"
        :style="{ letterSpacing: '0.16em', color: scoreLabelColor }"
      >{{ scoreLabel }}</span>
      <div
        class="mt-1 h-1.5 w-full rounded-full"
        :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
      >
        <div
          class="h-full rounded-full"
          :style="{
            width: score + '%',
            background: `linear-gradient(90deg, ${brand.colors.primary} 0%, ${brand.colors.positive} 100%)`,
          }"
        />
      </div>
      <span class="mock-meta">9 dimensões avaliadas</span>
    </article>

    <article class="metric-card flex flex-col gap-2 rounded-xl border p-5" :style="cardStyle">
      <span class="mock-eyebrow">Dividendos · 12m</span>
      <div
        class="font-mono-tab text-[24px] font-light tabular-nums"
        :style="{ color: brand.colors.text, letterSpacing: '-0.4px' }"
      >{{ maskedBRL(dividendForecast12m) }}</div>
      <div class="flex items-center gap-2">
        <span
          class="font-mono-tab text-[11px] tabular-nums"
          :style="{ color: brand.colors.positive }"
        >{{ maskedBRL(dividendForecast12m / 12) }}/mês médio</span>
      </div>
      <span class="mock-meta">{{ dividendMeta }}</span>
    </article>

    <article class="metric-card flex flex-col gap-2 rounded-xl border p-5" :style="cardStyle">
      <span class="mock-eyebrow">Performance · 12m</span>
      <div
        class="font-mono-tab text-[24px] font-light tabular-nums"
        :style="{
          color: pnlPct !== null && pnlPct >= 0 ? brand.colors.positive : brand.colors.negative,
          letterSpacing: '-0.4px',
        }"
      >{{ pnlPct !== null ? formatPct(pnlPct) : '—' }}</div>
      <div class="flex flex-col gap-0.5">
        <div
          v-for="b in benchmarks"
          :key="b.label"
          class="flex items-center justify-between text-[11px]"
        >
          <span :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ b.label }}</span>
          <span
            class="font-mono-tab tabular-nums"
            :style="{ color: b.return_12m_pct >= 0 ? brand.colors.positive : brand.colors.negative }"
          >{{ formatPct(b.return_12m_pct) }}</span>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
interface Benchmark {
  label: string
  return_12m_pct: number
}
interface Props {
  totalValue: number
  pnlPct?: number | null
  vsCdiPct?: number | null
  score: number
  dividendForecast12m: number
  dividendMeta?: string
  benchmarks?: Benchmark[]
}
const props = withDefaults(defineProps<Props>(), {
  pnlPct: null,
  vsCdiPct: null,
  dividendMeta: 'DY estimado',
  benchmarks: () => [],
})

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const scoreLabel = computed(() => {
  if (props.score >= 85) return 'Excelente'
  if (props.score >= 70) return 'Boa'
  if (props.score >= 50) return 'Atenção'
  return 'Crítica'
})

const scoreLabelColor = computed(() => {
  if (props.score >= 70) return brand.colors.positive
  if (props.score >= 50) return (brand.colors as { warning?: string }).warning || '#f59e0b'
  return brand.colors.negative
})

// Reveal toggle compartilhado — mascara patrimonio + dividendos
// quando interfaceStore.revealAmount = false. Performance % nao
// expoe R$ entao fica visivel sempre (privacidade nao quebra).
const interfaceStore = useInterfaceStore()

function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}
function maskedBRL(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••••'
  return formatBRL(n)
}
function formatPct(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}
</script>

<style scoped>
.mock-eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.mock-meta {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.metric-card {
  transition: border-color 160ms ease-out, background-color 160ms ease-out;
}
.metric-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
}
</style>
