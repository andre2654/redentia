<!--
  SlideDividends — celebrates passive income.

  Adds a fine "money rain" layer behind the content: 30 tiny amber dots
  drift slowly downward at random speeds, each with a vertical shimmer.
  The big monthly total counts up dramatically, then the top payer rows
  slide in.
-->
<template>
  <div class="sl-divs">
    <!-- Money rain backdrop -->
    <div class="sl-divs__rain" aria-hidden="true">
      <span
        v-for="(d, i) in raindrops"
        :key="i"
        class="sl-divs__drop"
        :style="{
          left: `${d.x}%`,
          '--d-size': `${d.size}px`,
          '--d-duration': `${d.duration}s`,
          '--d-delay': `${d.delay}s`,
          '--d-opacity': d.opacity,
        }"
      />
    </div>

    <div class="sl-divs__inner">
      <p class="sl-divs__kicker rxh-stagger" style="--rxh-delay: 0ms">
        Sua máquina de renda passiva
      </p>

      <div class="sl-divs__big rxh-stagger" style="--rxh-delay: 220ms">
        <span class="sl-divs__currency">R$</span>
        <AtomsKineticNumber
          :value="monthlyTotal"
          :duration="1700"
          :delay-ms="320"
          :decimals="0"
          class="sl-divs__amount"
        />
        <span class="sl-divs__period">/ mês</span>
      </div>

      <p class="sl-divs__sub rxh-stagger" style="--rxh-delay: 1200ms">
        Estimativa baseada nos dividendos dos últimos 12 meses,
        proporcionais aos pesos da sua carteira.
      </p>

      <ul v-if="topPayers.length" class="sl-divs__list">
        <li
          v-for="(p, i) in topPayers"
          :key="p.ticker"
          class="sl-divs__row rxh-stagger"
          :style="{ '--rxh-delay': `${1400 + i * 140}ms` }"
        >
          <span class="sl-divs__rank">#{{ i + 1 }}</span>
          <span class="sl-divs__ticker">{{ p.ticker }}</span>
          <span class="sl-divs__yield">{{ formatYield(p.yieldOnCost) }}</span>
          <span class="sl-divs__amount-row">{{ formatBrl(p.monthlyAvg) }}/mês</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AtomsKineticNumber from '~/components/atoms/KineticNumber.vue'

interface DividendForecast {
  ticker: string
  monthlyAvg: number
  nextDate?: string
  yieldOnCost?: number
}

interface Props {
  monthlyTotal: number
  topPayers?: DividendForecast[]
}
withDefaults(defineProps<Props>(), { topPayers: () => [] })

function formatBrl(v: number): string {
  if (!Number.isFinite(v)) return 'R$ 0'
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function formatYield(y?: number): string {
  if (typeof y !== 'number' || !Number.isFinite(y)) return ''
  return `${y.toFixed(1).replace('.', ',')}% a.a.`
}

// Deterministic PRNG so SSR/client agree
function rng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const raindrops = computed(() => {
  const r = rng(2027)
  return Array.from({ length: 28 }).map(() => ({
    x: r() * 100,
    size: 2 + Math.round(r() * 3),         // 2..5 px
    duration: 5 + r() * 6,                  // 5..11s
    delay: -(r() * 10),
    opacity: 0.25 + r() * 0.55,
  }))
})
</script>

<style scoped>
.sl-divs {
  position: relative;
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* ============ Money rain ============ */
.sl-divs__rain {
  position: absolute;
  inset: -40px -200px -40px -200px;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  mask-image: linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%);
}

.sl-divs__drop {
  position: absolute;
  top: -20px;
  width: var(--d-size, 3px);
  height: var(--d-size, 3px);
  border-radius: 999px;
  background: var(--brand-primary, #f5a623);
  box-shadow: 0 0 8px var(--brand-primary, #f5a623);
  opacity: 0;
  animation: sl-divs-drop-fall var(--d-duration, 8s) linear var(--d-delay, 0s) infinite;
}

@keyframes sl-divs-drop-fall {
  0%   { transform: translateY(-20px); opacity: 0; }
  10%  { opacity: var(--d-opacity, 0.4); }
  90%  { opacity: var(--d-opacity, 0.4); }
  100% { transform: translateY(110vh); opacity: 0; }
}

/* ============ Content ============ */
.sl-divs__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.sl-divs__kicker {
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--brand-primary, #f5a623);
  font-weight: 500;
}

.sl-divs__big {
  display: inline-flex;
  align-items: baseline;
  gap: 14px;
  margin: 4px 0;
}

.sl-divs__currency {
  font-size: clamp(22px, 3.5vw, 32px);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.55);
}

.sl-divs__amount {
  font-size: clamp(64px, 14vw, 132px);
  line-height: 1;
  font-weight: 200;
  letter-spacing: -0.04em;
  color: #fff;
  text-shadow: 0 0 40px color-mix(in srgb, var(--brand-primary, #f5a623) 38%, transparent);
}

.sl-divs__period {
  font-size: clamp(16px, 2.4vw, 20px);
  color: rgba(255, 255, 255, 0.55);
  font-weight: 300;
}

.sl-divs__sub {
  font-size: clamp(13px, 2vw, 15px);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.6);
  max-width: 500px;
}

.sl-divs__list {
  width: 100%;
  max-width: 520px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sl-divs__row {
  display: grid;
  grid-template-columns: 32px 1fr auto auto;
  gap: 14px;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  text-align: left;
  backdrop-filter: blur(8px);
}

.sl-divs__rank {
  font-size: 11px;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.45);
  font-variant-numeric: tabular-nums;
}

.sl-divs__ticker {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.02em;
}

.sl-divs__yield {
  font-size: 12px;
  color: var(--brand-primary, #f5a623);
  font-variant-numeric: tabular-nums;
}

.sl-divs__amount-row {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  font-variant-numeric: tabular-nums;
}

.rxh-stagger {
  opacity: 0;
  transform: translate3d(0, 14px, 0);
  animation: rxh-stagger-in 700ms cubic-bezier(0.16, 1, 0.3, 1) var(--rxh-delay, 0ms) forwards;
}

@keyframes rxh-stagger-in {
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .sl-divs__drop,
  .rxh-stagger {
    animation: none;
  }
  .rxh-stagger { opacity: 1; transform: none; }
}
</style>
