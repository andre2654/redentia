<!--
  Fintech — charcoal data card. No decoration, single accent tinted
  per metric. Inspired by Robinhood / Cash App. Same component handles
  all 4 card types via the `type` prop.
-->
<template>
  <article class="ft" :style="{ '--accent': accent }">
    <header class="ft__top">
      <div class="ft__brand-row">
        <ShareCardLogo size="18" class="ft__logo" />
        <span class="ft__brand">Redentia</span>
      </div>
      <span class="ft__band">{{ topBand }}</span>
    </header>
    <div class="ft__divider" />

    <div class="ft__body">
      <!-- ============ SCORE ============ -->
      <template v-if="type === 'score'">
        <div class="ft__label">Score da carteira</div>
        <div class="ft__num">
          <span class="ft__num-val" :style="{ fontSize: fit(String(score), 122, 180) + 'px' }">{{ score }}</span>
          <span class="ft__num-of">/ 100</span>
        </div>
        <div class="ft__bar"><div class="ft__bar-fill" :style="{ width: scorePct + '%' }" /></div>
        <p class="ft__caption">{{ scoreCaption }}</p>
      </template>

      <!-- ============ P&L ============ -->
      <template v-else-if="type === 'pnl'">
        <div class="ft__label">Resultado em {{ pnlDays }} dias</div>
        <div class="ft__num">
          <span class="ft__num-cur">{{ pnlSign }}R$</span>
          <span class="ft__num-val ft__num-val--pnl" :style="{ fontSize: fit(pnlFormatted, 90, 200) + 'px' }">{{ pnlFormatted }}</span>
        </div>
        <svg class="ft__spark" viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
          <path :d="sparkPath" fill="none" :stroke="accent" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="ft__caption">{{ pnlCaption }}</p>
      </template>

      <!-- ============ RISK ============ -->
      <template v-else-if="type === 'risk'">
        <div class="ft__label">Concentração de ativos</div>
        <div class="ft__num">
          <span class="ft__num-val" :style="{ fontSize: fit(String(riskValue), 122, 180) + 'px' }">{{ riskValue }}</span>
          <span class="ft__num-of">{{ riskSuffix }}</span>
        </div>
        <div class="ft__bar"><div class="ft__bar-fill" :style="{ width: Math.min(100, Number(riskValue) || 0) + '%' }" /></div>
        <p class="ft__caption">{{ riskBody }}</p>
      </template>

      <!-- ============ DIVS ============ -->
      <template v-else-if="type === 'divs'">
        <div class="ft__label">Renda passiva mensal</div>
        <div class="ft__num">
          <span class="ft__num-cur">R$</span>
          <span class="ft__num-val ft__num-val--pnl" :style="{ fontSize: fit(divsFormatted, 90, 200) + 'px' }">{{ divsFormatted }}</span>
        </div>
        <div class="ft__chip-row">
          <span class="ft__chip">Dividendos</span>
          <span class="ft__chip">Estimativa</span>
        </div>
        <p class="ft__caption">Calculado a partir da composição atual da carteira.</p>
      </template>
    </div>

    <footer class="ft__foot">
      Calculado pela Redentia<br>
      <span>redentia.com.br/raio-x</span>
    </footer>
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

const scorePct = computed(() => Math.min(100, Math.max(0, props.score || 0)))
const scoreCaption = computed(() => scoreCaptionFor(props.score))

const pnlSign = computed(() => (props.pnlAmount >= 0 ? '+' : '−'))
const pnlFormatted = computed(() => Math.abs(props.pnlAmount).toLocaleString('pt-BR', { maximumFractionDigits: 0 }))
const pnlPctLabel = computed(() => {
  const v = props.pnlPct
  return `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}%`
})
const pnlCaption = computed(() => pnlCaptionFor(props.pnlAmount))

const divsFormatted = computed(() => Math.round(props.monthly).toLocaleString('pt-BR'))

// Top-right "tag" pill — message varies by metric.
const topBand = computed(() => {
  switch (props.type) {
    case 'score': return scoreBandLabelMap[props.band]
    case 'pnl': return pnlPctLabel.value
    case 'risk': return riskPillFor(props.riskSeverity)
    case 'divs': return '/ mês'
    default: return ''
  }
})

const accent = computed(() => {
  switch (props.type) {
    case 'pnl': return props.pnlAmount >= 0 ? '#5cd99a' : '#ff7a7a'
    case 'risk': return '#ff7a7a'
    case 'divs': return '#f3c870'
    default: return '#d9a635'
  }
})

// Up/down sparkline shape — direction follows pnl sign.
const sparkPath = computed(() =>
  props.pnlAmount >= 0
    ? 'M0,30 L20,28 L40,32 L60,25 L80,22 L100,18 L120,20 L140,12 L160,15 L180,8 L200,4'
    : 'M0,4 L20,8 L40,15 L60,12 L80,20 L100,18 L120,22 L140,25 L160,32 L180,28 L200,30'
)
</script>

<style scoped>
.ft {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #18171c 0%, #0d0c11 100%);
  padding: 24px 22px 22px;
  display: flex;
  flex-direction: column;
  border-radius: inherit;
  overflow: hidden;
  color: #fff;
}

.ft__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ft__brand-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ft__logo { color: var(--accent); }
.ft__brand {
  font-family: 'Instrument Serif', serif;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}
.ft__band {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.ft__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 0 22px;
}

.ft__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ft__label {
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  margin-bottom: 4px;
}

.ft__num {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  margin: 6px 0 22px;
  max-width: 100%;
  overflow: hidden;
}
.ft__num-cur {
  font-size: 26px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
}
.ft__num-val {
  font-weight: 200;
  letter-spacing: -0.04em;
  line-height: 0.85;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.ft__num-of {
  font-size: 22px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.4);
}

.ft__bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 14px;
}
.ft__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, color-mix(in srgb, var(--accent) 70%, white), var(--accent));
  border-radius: 999px;
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 50%, transparent);
}

.ft__spark {
  width: 100%;
  height: 32px;
  margin-bottom: 14px;
}

.ft__chip-row {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 14px;
}
.ft__chip {
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.06);
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 500;
}

.ft__caption {
  font-size: 13px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
          line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ft__foot {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
}
.ft__foot span { color: var(--accent); }
</style>
