<!--
  WalletResultadoCTA — premium hero card that invites the user into the
  detailed P&L page at /wallet/resultado.

  Visual recipe (Stripe-grade fintech editorial):
    - Two-column grid: copy + giant P&L on the left, micro chart + meta on the right
    - Gradient amber wash + subtle grid mesh + animated shine sweep
    - P&L sign tints the whole card (green/red), but stays muted enough to read
    - The entire card is a single clickable target (NuxtLink) with a hover lift,
      shadow elevation and an arrow that nudges right on hover

  Inputs:
    - totalValue: current portfolio value in BRL
    - pnlAmount:  current value - cost basis, in BRL (nullable when no cost basis)
    - pnlPct:     same as pct, nullable
    - positionsCount: how many tickers (for the meta footer)
    - hasConnection: whether the user has Pluggy connected (changes copy)
-->
<template>
  <NuxtLink
    to="/wallet/resultado"
    class="wrc"
    :class="{ 'wrc--gain': isGain, 'wrc--loss': isLoss }"
    :style="cardStyle"
    aria-label="Abrir análise detalhada de resultado"
  >
    <!-- Decorative layers (don't block clicks) -->
    <div class="wrc__bg" aria-hidden="true">
      <div class="wrc__bg-glow" :style="glowStyle" />
      <div class="wrc__bg-grid" />
      <div class="wrc__bg-shine" />
    </div>

    <div class="wrc__inner">
      <!-- LEFT: copy + giant number -->
      <div class="wrc__left">
        <p class="wrc__eyebrow" :style="{ color: 'var(--brand-primary)' }">
          <span class="wrc__eyebrow-dot" :style="{ background: 'var(--brand-primary)', boxShadow: `0 0 10px var(--brand-primary)` }" />
          Resultado · Rentabilidade
        </p>

        <h2 class="wrc__title" :style="{ color: 'var(--brand-text)' }">
          <template v-if="hasPnl">
            Sua carteira
            <span class="wrc__title-em" :style="{ color: titleEmColor }">{{ isGain ? 'rendeu' : isLoss ? 'recuou' : 'está' }}</span>
          </template>
          <template v-else>
            Conecte e veja
            <span class="wrc__title-em" :style="{ color: 'var(--brand-primary)' }">quanto rendeu</span>
          </template>
        </h2>

        <div v-if="hasPnl" class="wrc__pnl">
          <span class="wrc__pnl-sign" :style="{ color: signColor }">{{ isGain ? '+' : '−' }}</span>
          <span class="wrc__pnl-amount" :style="{ color: 'var(--brand-text)' }">
            {{ formatBrlAbs(pnlAmount || 0) }}
          </span>
          <span class="wrc__pnl-pct" :style="{ color: signColor, background: badgeBg, borderColor: badgeBorder }">
            {{ isGain ? '+' : '−' }}{{ Math.abs(pnlPct || 0).toFixed(1).replace('.', ',') }}%
          </span>
        </div>
        <p v-else class="wrc__placeholder" :style="{ color: `color-mix(in srgb, var(--brand-text) 60%, transparent)` }">
          Open Finance entrega o histórico real de cada ordem pra a Redentia calcular sua rentabilidade.
        </p>

        <p v-if="hasPnl" class="wrc__lead" :style="{ color: `color-mix(in srgb, var(--brand-text) 65%, transparent)` }">
          Veja o detalhamento por ativo, comparação com CDI/Ibov, melhores e piores meses, e o gráfico de patrimônio ao longo do tempo.
        </p>
      </div>

      <!-- RIGHT: micro viz + meta -->
      <div class="wrc__right">
        <!-- Mini sparkline — 12 bars proportional to a soft sine wave with the
             final bar landing on the P&L direction. Decorative only. -->
        <div class="wrc__chart" aria-hidden="true">
          <div
            v-for="(h, i) in bars"
            :key="i"
            class="wrc__bar"
            :style="{
              height: `${h}%`,
              background: i === bars.length - 1 ? signColor : `color-mix(in srgb, ${signColor} ${20 + i * 5}%, transparent)`,
              animationDelay: `${i * 70}ms`,
            }"
          />
        </div>

        <div class="wrc__meta">
          <span class="wrc__meta-row">
            <span class="wrc__meta-label">Patrimônio</span>
            <span class="wrc__meta-value" :style="{ color: 'var(--brand-text)' }">{{ formatBrl(totalValue) }}</span>
          </span>
          <span v-if="positionsCount > 0" class="wrc__meta-row">
            <span class="wrc__meta-label">Ativos</span>
            <span class="wrc__meta-value" :style="{ color: 'var(--brand-text)' }">{{ positionsCount }}</span>
          </span>
        </div>

        <span class="wrc__cta" :style="{ color: 'var(--brand-primary)' }">
          Ver análise completa
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="wrc__cta-icon" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  totalValue: number
  pnlAmount?: number | null
  pnlPct?: number | null
  positionsCount?: number
  hasConnection?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pnlAmount: null,
  pnlPct: null,
  positionsCount: 0,
  hasConnection: true,
})

const brand = useBrand()

const hasPnl = computed(() => props.pnlAmount != null && props.pnlPct != null)
const isGain = computed(() => (props.pnlAmount ?? 0) > 0)
const isLoss = computed(() => (props.pnlAmount ?? 0) < 0)

const signColor = computed(() => {
  if (isGain.value) return 'var(--brand-positive, #10b981)'
  if (isLoss.value) return 'var(--brand-negative, #ef4444)'
  return 'var(--brand-primary)'
})

const titleEmColor = computed(() => {
  if (isGain.value) return 'var(--brand-positive, #10b981)'
  if (isLoss.value) return 'var(--brand-negative, #ef4444)'
  return 'var(--brand-primary)'
})

const badgeBg = computed(() => `color-mix(in srgb, ${signColor.value} 14%, transparent)`)
const badgeBorder = computed(() => `color-mix(in srgb, ${signColor.value} 38%, transparent)`)

const cardStyle = computed(() => ({
  '--wrc-tint': signColor.value,
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-text) 12%, transparent)`,
}))

const glowStyle = computed(() => ({
  background: `radial-gradient(ellipse 70% 80% at 20% 50%, color-mix(in srgb, var(--brand-primary) 22%, transparent), transparent 65%)`,
}))

// Soft sine wave + sign bias so the last bar reflects gain/loss direction.
const bars = computed(() => {
  const out: number[] = []
  for (let i = 0; i < 12; i++) {
    const base = 35 + Math.sin((i / 11) * Math.PI * 1.2) * 25
    const trend = (i / 11) * (isGain.value ? 18 : isLoss.value ? -18 : 0)
    out.push(Math.max(20, Math.min(96, Math.round(base + trend))))
  }
  return out
})

function formatBrl(v: number): string {
  return (v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function formatBrlAbs(v: number): string {
  return Math.abs(v || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}
</script>

<style scoped>
.wrc {
  position: relative;
  display: block;
  border: 1px solid;
  border-radius: 14px;
  padding: 28px 32px;
  overflow: hidden;
  text-decoration: none;
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease-out, border-color 200ms ease-out;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.03) inset,
    0 12px 32px -16px color-mix(in srgb, var(--wrc-tint, var(--brand-primary)) 18%, transparent);
}

.wrc:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--wrc-tint, var(--brand-primary)) 28%, transparent);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.06) inset,
    0 24px 60px -22px color-mix(in srgb, var(--wrc-tint, var(--brand-primary)) 32%, transparent);
}

.wrc:active {
  transform: translateY(0);
}

.wrc:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--brand-primary, var(--brand-primary)) 30%, transparent),
    0 24px 60px -22px color-mix(in srgb, var(--wrc-tint, var(--brand-primary)) 32%, transparent);
}

/* ============ Decorative layers ============ */
.wrc__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.wrc__bg-glow {
  position: absolute;
  inset: 0;
  filter: blur(40px);
  opacity: 0.85;
}

.wrc__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 90%);
  opacity: 0.5;
}

/* Slow diagonal shimmer that crosses the card every ~9s. Sells the
   premium feel without being distracting. */
.wrc__bg-shine {
  position: absolute;
  top: -50%;
  left: -120%;
  width: 60%;
  height: 200%;
  background: linear-gradient(115deg, transparent 30%, color-mix(in srgb, var(--wrc-tint, var(--brand-primary)) 8%, transparent) 48%, color-mix(in srgb, var(--wrc-tint, var(--brand-primary)) 14%, transparent) 50%, color-mix(in srgb, var(--wrc-tint, var(--brand-primary)) 8%, transparent) 52%, transparent 70%);
  transform: skewX(-18deg);
  animation: wrc-shine 9s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes wrc-shine {
  0%, 12% { transform: skewX(-18deg) translateX(0); }
  100% { transform: skewX(-18deg) translateX(380%); }
}

/* ============ Layout ============ */
.wrc__inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 28px;
  align-items: center;
}

@media (max-width: 720px) {
  .wrc {
    padding: 24px;
  }
  .wrc__inner {
    grid-template-columns: 1fr;
    gap: 22px;
  }
}

.wrc__left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wrc__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
}

@media (max-width: 720px) {
  .wrc__right {
    align-items: flex-start;
  }
}

/* ============ Eyebrow ============ */
.wrc__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono-tab, inherit);
}

.wrc__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  animation: wrc-pulse 1.8s ease-in-out infinite;
}

@keyframes wrc-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(0.6); }
}

/* ============ Title ============ */
.wrc__title {
  font-size: clamp(22px, 2.8vw, 30px);
  line-height: 1.15;
  font-weight: 300;
  letter-spacing: -0.018em;
  margin: 0;
}

.wrc__title-em {
  font-style: italic;
  font-weight: 300;
}

/* ============ P&L ============ */
.wrc__pnl {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.wrc__pnl-sign {
  font-size: clamp(28px, 3.6vw, 40px);
  font-weight: 200;
  line-height: 1;
  letter-spacing: -0.02em;
}

.wrc__pnl-amount {
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 200;
  letter-spacing: -0.035em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 30px color-mix(in srgb, var(--wrc-tint, var(--brand-primary)) 22%, transparent);
}

.wrc__pnl-pct {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border: 1px solid;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  align-self: flex-end;
  margin-bottom: 4px;
  backdrop-filter: blur(6px);
}

.wrc__placeholder {
  font-size: 14px;
  line-height: 1.55;
  max-width: 480px;
  margin: 4px 0 0;
}

.wrc__lead {
  font-size: 13.5px;
  line-height: 1.55;
  max-width: 520px;
  margin: 8px 0 0;
}

/* ============ Right column ============ */
.wrc__chart {
  display: inline-flex;
  align-items: flex-end;
  gap: 4px;
  height: 56px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.wrc__bar {
  width: 6px;
  border-radius: 2px;
  opacity: 0;
  animation: wrc-bar-rise 600ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
  transform-origin: bottom;
}

@keyframes wrc-bar-rise {
  from { opacity: 0; transform: scaleY(0.3); }
  to   { opacity: 1; transform: scaleY(1); }
}

.wrc__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

@media (max-width: 720px) {
  .wrc__meta {
    align-items: flex-start;
  }
}

.wrc__meta-row {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  font-size: 12.5px;
}

.wrc__meta-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
}

.wrc__meta-value {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.wrc__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  margin-top: 2px;
}

.wrc__cta-icon {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.wrc:hover .wrc__cta-icon {
  transform: translateX(4px);
}

@media (prefers-reduced-motion: reduce) {
  .wrc__bg-shine,
  .wrc__eyebrow-dot,
  .wrc__bar {
    animation: none;
  }
  .wrc:hover { transform: none; }
  .wrc:hover .wrc__cta-icon { transform: none; }
  .wrc__bar { opacity: 1; transform: none; }
}
</style>
