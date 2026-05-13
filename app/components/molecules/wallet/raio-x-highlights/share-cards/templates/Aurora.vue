<!--
  Aurora — vivid blob gradient (per-type tinted) with a frosted-glass
  content panel on top. Premium fintech feel. Same component handles
  all 4 card types via the `type` prop.
-->
<template>
  <article class="au" :style="auStyle">
    <div class="au__bg" />
    <div class="au__noise" />
    <div class="au__content">
      <header class="au__top">
        <span class="au__logo-wrap"><ShareCardLogo size="22" /></span>
        <span class="au__brand">REDENTIA</span>
      </header>

      <!-- ============ SCORE ============ -->
      <template v-if="type === 'score'">
        <div class="au__label">Meu Raio-X</div>
        <div class="au__hero">
          <span class="au__num" :style="{ fontSize: fit(String(score), 156, 240) + 'px' }">{{ score }}</span>
          <span class="au__of">de 100</span>
        </div>
        <div class="au__pill"><span class="au__pill-dot" />{{ scoreBandLabel }} carteira</div>
        <p class="au__copy">{{ scoreCaption }}</p>
      </template>

      <!-- ============ P&L ============ -->
      <template v-else-if="type === 'pnl'">
        <div class="au__label">{{ pnlDays }} dias · meu p&amp;l</div>
        <div class="au__hero">
          <span class="au__pnl-num" :style="{ fontSize: fit(pnlPrefix + pnlFormatted, 60, 260) + 'px' }">{{ pnlPrefix }}{{ pnlFormatted }}</span>
          <span class="au__of">{{ pnlPctLabel }} no período</span>
        </div>
        <div class="au__pill"><span class="au__pill-dot" />{{ pnlAmount >= 0 ? 'em alta' : 'em baixa' }}</div>
        <p class="au__copy">{{ pnlCaption }}</p>
      </template>

      <!-- ============ RISK ============ -->
      <template v-else-if="type === 'risk'">
        <div class="au__label">Risco identificado</div>
        <div class="au__hero">
          <span class="au__num" :style="{ fontSize: fit(String(riskValue) + (riskSuffix || ''), 156, 240) + 'px' }">{{ riskValue }}<span class="au__num-pct">{{ riskSuffix }}</span></span>
          <span class="au__of">da carteira</span>
        </div>
        <div class="au__pill"><span class="au__pill-dot" />{{ riskPillLabel }}</div>
        <p class="au__copy au__copy--tight">{{ riskBody }}</p>
      </template>

      <!-- ============ DIVS ============ -->
      <template v-else-if="type === 'divs'">
        <div class="au__label">Minha carteira já me paga</div>
        <div class="au__hero">
          <span class="au__pnl-num" :style="{ fontSize: fit('R$' + divsFormatted, 60, 260) + 'px' }">R$ {{ divsFormatted }}</span>
          <span class="au__of">por mês em dividendos</span>
        </div>
        <div class="au__pill"><span class="au__pill-dot" />renda passiva</div>
        <p class="au__copy">Estimado pela carteira atual</p>
      </template>
    </div>
    <footer class="au__foot">faça seu Raio-X · redentia.com.br</footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ShareCardLogo from '../ShareCardLogo.vue'
import { fit, scoreBandLabelMap, scoreCaptionFor, pnlCaptionFor, riskPillFor } from './shared'

interface Props {
  type: 'score' | 'pnl' | 'risk' | 'divs'
  score?: number
  band?: 'critico' | 'atencao' | 'bom' | 'excelente'
  pnlAmount?: number
  pnlPct?: number
  pnlDays?: number
  riskValue?: number | string
  riskSuffix?: string
  riskBody?: string
  riskSeverity?: 'low' | 'medium' | 'high'
  monthly?: number
}
const props = withDefaults(defineProps<Props>(), {
  score: 0,
  band: 'bom',
  pnlAmount: 0,
  pnlPct: 0,
  pnlDays: 0,
  riskValue: '',
  riskSuffix: '',
  riskBody: '',
  riskSeverity: 'medium',
  monthly: 0,
})

const scoreBandLabel = computed(() => scoreBandLabelMap[props.band])
const scoreCaption = computed(() => scoreCaptionFor(props.score))

const pnlPrefix = computed(() => (props.pnlAmount >= 0 ? '+R$ ' : '−R$ '))
const pnlFormatted = computed(() => Math.abs(props.pnlAmount).toLocaleString('pt-BR', { maximumFractionDigits: 0 }))
const pnlPctLabel = computed(() => {
  const v = props.pnlPct
  return `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}%`
})
const pnlCaption = computed(() => pnlCaptionFor(props.pnlAmount))

const riskPillLabel = computed(() => riskPillFor(props.riskSeverity))

const divsFormatted = computed(() => Math.round(props.monthly).toLocaleString('pt-BR'))

// Per-type color palette — used as inline CSS vars so the gradient
// halo and accent tint match the metric's mood (gold/green/red/amber).
const auStyle = computed(() => {
  switch (props.type) {
    case 'pnl':
      return props.pnlAmount >= 0
        ? { '--c1': 'rgba(92,217,154,0.55)', '--c2': 'rgba(40,160,90,0.45)', '--c3': 'rgba(20,80,50,0.7)', '--bg': '#082015', '--tint': '#5cd99a' }
        : { '--c1': 'rgba(255,100,100,0.55)', '--c2': 'rgba(180,50,50,0.5)', '--c3': 'rgba(80,20,20,0.75)', '--bg': '#2a0808', '--tint': '#ff9a9a' }
    case 'risk':
      return { '--c1': 'rgba(255,100,100,0.55)', '--c2': 'rgba(180,50,50,0.5)', '--c3': 'rgba(80,20,20,0.75)', '--bg': '#2a0808', '--tint': '#ff9a9a' }
    case 'divs':
      return { '--c1': 'rgba(243,200,112,0.55)', '--c2': 'rgba(217,166,53,0.5)', '--c3': 'rgba(120,80,20,0.7)', '--bg': '#1a1408', '--tint': '#f3c870' }
    default:
      return { '--c1': 'rgba(217,166,53,0.55)', '--c2': 'rgba(170,80,220,0.5)', '--c3': 'rgba(80,40,160,0.7)', '--bg': '#1a0c2e', '--tint': '#f3c870' }
  }
})
</script>

<style scoped>
.au {
  position: absolute;
  inset: 0;
  background: var(--bg, #1a0c2e);
  display: flex;
  flex-direction: column;
  border-radius: inherit;
  overflow: hidden;
  color: #fff;
}

.au__bg {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(ellipse 70% 60% at 22% 18%, var(--c1), transparent 60%),
    radial-gradient(ellipse 80% 70% at 80% 30%, var(--c2), transparent 60%),
    radial-gradient(ellipse 90% 80% at 60% 95%, var(--c3), transparent 60%),
    linear-gradient(180deg, var(--bg) 0%, #050106 100%);
  filter: blur(8px);
  z-index: 0;
}
.au__noise {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 6px 6px;
  z-index: 1;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.au__content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 22px 0;
  text-align: center;
}

.au__top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.au__logo-wrap { display: inline-flex; color: var(--tint); }
.au__brand {
  font-size: 11px;
  letter-spacing: 0.22em;
  font-weight: 600;
  color: #fff;
}

.au__label {
  margin: 28px 0 0;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}

.au__hero {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow: hidden;
}
.au__num {
  font-family: 'Instrument Serif', serif;
  line-height: 0.85;
  letter-spacing: -0.05em;
  background: linear-gradient(180deg, #fff 0%, var(--tint) 100%);
  -webkit-background-clip: text;
          background-clip: text;
  color: transparent;
  text-shadow: 0 0 60px color-mix(in srgb, var(--tint) 35%, transparent);
  max-width: 100%;
  white-space: nowrap;
}
.au__num-pct { font-size: 0.55em; margin-left: 2px; }
.au__pnl-num {
  font-family: 'Instrument Serif', serif;
  line-height: 0.95;
  letter-spacing: -0.03em;
  background: linear-gradient(180deg, #fff 0%, var(--tint) 100%);
  -webkit-background-clip: text;
          background-clip: text;
  color: transparent;
  text-shadow: 0 0 40px color-mix(in srgb, var(--tint) 30%, transparent);
  white-space: nowrap;
  max-width: 100%;
}
.au__of {
  font-size: 12.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
  margin-top: 4px;
}

.au__pill {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: color-mix(in srgb, var(--tint) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tint) 50%, transparent);
  border-radius: 999px;
  color: var(--tint);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}
.au__pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--tint);
  box-shadow: 0 0 8px var(--tint);
}

.au__copy {
  margin: 14px 0 0;
  font-size: 13.5px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.7);
  max-width: 240px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
          line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.au__copy--tight {
  font-size: 11.5px;
  letter-spacing: 0.04em;
  word-break: break-word;
}

.au__foot {
  position: relative;
  z-index: 2;
  margin: auto 0 0;
  padding: 16px 24px;
  text-align: center;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
