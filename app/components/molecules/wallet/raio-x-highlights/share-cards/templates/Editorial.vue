<!--
  Editorial — cream paper, dark type, single accent. Inspired by
  Monocle / The Browser Company. Same component handles all 4 card
  types (score / pnl / risk / divs) via the `type` prop. Big numerals
  always run through fit() so they never overflow the card.
-->
<template>
  <article class="ed">
    <header class="ed__top">
      <ShareCardLogo size="20" class="ed__logo" />
      <span class="ed__brand">REDENTIA</span>
    </header>

    <!-- ============ SCORE ============ -->
    <template v-if="type === 'score'">
      <div class="ed__label">Raio-X financeiro</div>
      <div class="ed__num">
        <span class="ed__num-val" :style="{ fontSize: fit(String(score), 156, 200) + 'px' }">{{ score }}</span>
        <span class="ed__num-of">/100</span>
      </div>
      <div class="ed__band">{{ scoreBandLabel }}</div>
      <p class="ed__caption">{{ scoreCaption }}</p>
    </template>

    <!-- ============ P&L ============ -->
    <template v-else-if="type === 'pnl'">
      <div class="ed__label">{{ pnlDays }} dias investindo</div>
      <div class="ed__pnl-num">
        <span class="ed__pnl-sign">{{ pnlSign }}</span>
        <span class="ed__pnl-cur">R$</span>
        <span class="ed__pnl-amt" :style="{ fontSize: fit(pnlFormatted, 78, 160) + 'px' }">{{ pnlFormatted }}</span>
      </div>
      <div class="ed__band">{{ pnlPctLabel }}</div>
      <p class="ed__caption">{{ pnlCaption }}</p>
    </template>

    <!-- ============ RISK ============ -->
    <template v-else-if="type === 'risk'">
      <div class="ed__label">Risco identificado</div>
      <div class="ed__num">
        <span
          class="ed__num-val"
          :style="{ fontSize: fit(String(riskValue) + (riskSuffix || ''), 156, 220) + 'px' }"
        >
          {{ riskValue }}<span class="ed__num-pct">{{ riskSuffix }}</span>
        </span>
      </div>
      <div class="ed__band">{{ riskPillLabel }}</div>
      <p class="ed__caption">{{ riskBody }}</p>
    </template>

    <!-- ============ DIVS ============ -->
    <template v-else-if="type === 'divs'">
      <div class="ed__label">Renda passiva</div>
      <div class="ed__pnl-num">
        <span class="ed__pnl-cur">R$</span>
        <span class="ed__pnl-amt" :style="{ fontSize: fit(divsFormatted, 78, 180) + 'px' }">{{ divsFormatted }}</span>
        <span class="ed__pnl-period">/mês</span>
      </div>
      <div class="ed__band">Dividendos</div>
      <p class="ed__caption">Em proventos estimados pela carteira atual</p>
    </template>

    <footer class="ed__foot">redentia.com.br</footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ShareCardLogo from '../ShareCardLogo.vue'
import { fit, scoreBandLabelMap, scoreCaptionFor, pnlCaptionFor, riskPillFor } from './shared'

interface Props {
  type: 'score' | 'pnl' | 'risk' | 'divs'
  // score
  score?: number
  band?: 'critico' | 'atencao' | 'bom' | 'excelente'
  // pnl
  pnlAmount?: number
  pnlPct?: number
  pnlDays?: number
  // risk
  riskValue?: number | string
  riskSuffix?: string
  riskBody?: string
  riskSeverity?: 'low' | 'medium' | 'high'
  // divs
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

const pnlSign = computed(() => (props.pnlAmount >= 0 ? '+' : '−'))
const pnlFormatted = computed(() => Math.abs(props.pnlAmount).toLocaleString('pt-BR', { maximumFractionDigits: 0 }))
const pnlPctLabel = computed(() => {
  const v = props.pnlPct
  return `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}%`
})
const pnlCaption = computed(() => pnlCaptionFor(props.pnlAmount))

const riskPillLabel = computed(() => riskPillFor(props.riskSeverity))

const divsFormatted = computed(() => Math.round(props.monthly).toLocaleString('pt-BR'))

const accent = computed(() => {
  switch (props.type) {
    case 'pnl': return props.pnlAmount >= 0 ? '#1a8a4d' : '#c0392b'
    case 'risk': return '#c0392b'
    case 'divs': return '#b8861e'
    default: return '#b8861e'
  }
})
</script>

<style scoped>
.ed {
  position: absolute;
  inset: 0;
  background: #f5f0e6;
  color: #1a1408;
  display: flex;
  flex-direction: column;
  padding: 28px 26px 22px;
  border-radius: inherit;
  overflow: hidden;
}

.ed__top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: v-bind(accent);
}
.ed__logo { color: v-bind(accent); }
.ed__brand {
  font-size: 11px;
  letter-spacing: 0.24em;
  font-weight: 600;
}

.ed__label {
  margin-top: auto;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(26, 20, 8, 0.55);
  font-weight: 500;
}

.ed__num {
  display: inline-flex;
  align-items: baseline;
  margin: 4px 0 0;
  font-family: 'Instrument Serif', 'Didot', serif;
  letter-spacing: -0.04em;
  max-width: 100%;
  overflow: hidden;
}
.ed__num-val {
  line-height: 0.85;
  color: #1a1408;
}
.ed__num-pct {
  font-size: 0.42em;
  color: rgba(26, 20, 8, 0.55);
  margin-left: 2px;
}
.ed__num-of {
  font-size: 28px;
  color: rgba(26, 20, 8, 0.45);
  margin-left: 4px;
  line-height: 0.85;
  white-space: nowrap;
}

.ed__pnl-num {
  display: inline-flex;
  align-items: baseline;
  margin: 4px 0 0;
  font-family: 'Instrument Serif', serif;
  gap: 4px;
  flex-wrap: nowrap;
  max-width: 100%;
}
.ed__pnl-sign {
  font-size: 48px;
  color: v-bind(accent);
  line-height: 0.85;
}
.ed__pnl-cur {
  font-size: 32px;
  color: rgba(26, 20, 8, 0.7);
  line-height: 0.85;
}
.ed__pnl-amt {
  color: #1a1408;
  letter-spacing: -0.03em;
  line-height: 0.85;
  font-variant-numeric: tabular-nums;
}
.ed__pnl-period {
  font-size: 18px;
  color: rgba(26, 20, 8, 0.45);
  margin-left: 2px;
}

.ed__band {
  display: inline-block;
  margin-top: 10px;
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 22px;
  color: v-bind(accent);
  align-self: flex-start;
}

.ed__caption {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: rgba(26, 20, 8, 0.7);
  max-width: 240px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
          line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ed__foot {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(26, 20, 8, 0.12);
  font-size: 11px;
  letter-spacing: 0.16em;
  color: rgba(26, 20, 8, 0.5);
  text-transform: uppercase;
  font-weight: 500;
}
</style>
