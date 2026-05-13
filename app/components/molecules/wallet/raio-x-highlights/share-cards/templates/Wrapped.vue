<!--
  Wrapped — Spotify Wrapped vibe. Smooth gradient (per-type tinted),
  big hero numeral, italic serif accents. Same component handles all
  4 card types via the `type` prop.
-->
<template>
  <article class="wr" :style="wrStyle">
    <div class="wr__bg" />
    <header class="wr__top"><ShareCardLogo size="24" class="wr__logo" /></header>

    <!-- ============ SCORE ============ -->
    <template v-if="type === 'score'">
      <div class="wr__label">o meu raio-x deu</div>
      <div class="wr__num" :style="{ fontSize: fit(String(score), 200, 240) + 'px' }">{{ score }}</div>
      <div class="wr__of">de 100</div>
      <div class="wr__band">
        <span class="wr__band-text">{{ scoreBandLabel }}</span>
        <span class="wr__band-sub">carteira</span>
      </div>
      <p class="wr__copy">{{ scoreCaption }}</p>
    </template>

    <!-- ============ P&L ============ -->
    <template v-else-if="type === 'pnl'">
      <div class="wr__label">a minha carteira</div>
      <div class="wr__pnl-row">
        <span class="wr__pnl-sign" :style="{ fontSize: pnlSignSize + 'px' }">{{ pnlSign }}</span>
        <span class="wr__pnl-amt" :style="{ fontSize: pnlAmtSize + 'px' }">{{ pnlFormatted }}</span>
      </div>
      <div class="wr__of">reais em {{ pnlDays }} dias</div>
      <div class="wr__band">
        <span class="wr__band-text">{{ pnlPctLabel }}</span>
        <span class="wr__band-sub">no período</span>
      </div>
      <p class="wr__copy">{{ pnlCaption }}</p>
    </template>

    <!-- ============ RISK ============ -->
    <template v-else-if="type === 'risk'">
      <div class="wr__label">a Redentia identificou</div>
      <div class="wr__num" :style="{ fontSize: fit(String(riskValue) + (riskSuffix || ''), 200, 240) + 'px' }">{{ riskValue }}{{ riskSuffix }}</div>
      <div class="wr__of">da carteira concentrada</div>
      <div class="wr__band">
        <span class="wr__band-text">{{ riskPillLabel }}</span>
      </div>
      <p class="wr__copy">{{ riskBody }}</p>
    </template>

    <!-- ============ DIVS ============ -->
    <template v-else-if="type === 'divs'">
      <div class="wr__label">a minha carteira já me paga</div>
      <div class="wr__pnl-row">
        <span class="wr__pnl-cur" :style="{ fontSize: divsCurSize + 'px' }">R$</span>
        <span class="wr__pnl-amt" :style="{ fontSize: divsAmtSize + 'px' }">{{ divsFormatted }}</span>
      </div>
      <div class="wr__of">por mês</div>
      <div class="wr__band">
        <span class="wr__band-text">Renda</span>
        <span class="wr__band-sub">passiva</span>
      </div>
      <p class="wr__copy">Estimado a partir da carteira atual.</p>
    </template>

    <footer class="wr__foot">
      <span class="wr__foot-brand">REDENTIA</span><span class="wr__foot-dot">·</span><span class="wr__foot-url">redentia.com.br</span>
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

const scoreBandLabel = computed(() => scoreBandLabelMap[props.band])
const scoreCaption = computed(() => scoreCaptionFor(props.score))

const pnlSign = computed(() => (props.pnlAmount >= 0 ? '+' : '−'))
const pnlFormatted = computed(() => Math.abs(props.pnlAmount).toLocaleString('pt-BR', { maximumFractionDigits: 0 }))
const pnlPctLabel = computed(() => {
  const v = props.pnlPct
  return `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1).replace('.', ',')}%`
})
const pnlCaption = computed(() => pnlCaptionFor(props.pnlAmount))
const pnlAmtSize = computed(() => fit(pnlFormatted.value, 110, 220))
const pnlSignSize = computed(() => Math.min(60, Math.floor(pnlAmtSize.value * 0.55)))

const riskPillLabel = computed(() => riskPillFor(props.riskSeverity))

const divsFormatted = computed(() => Math.round(props.monthly).toLocaleString('pt-BR'))
const divsAmtSize = computed(() => fit(divsFormatted.value, 110, 220))
const divsCurSize = computed(() => Math.min(40, Math.floor(divsAmtSize.value * 0.4)))

// Per-type gradient palette.
const wrStyle = computed(() => {
  switch (props.type) {
    case 'pnl':
      return props.pnlAmount >= 0
        ? { '--c-bg-a': '#0a2a1a', '--c-bg-b': '#0e3c25', '--c-bg-c': '#125a36', '--c-glow': 'rgba(92,217,154,0.55)', '--c-band': '#5cd99a', '--c-text-shadow': 'rgba(140,255,200,0.45)' }
        : { '--c-bg-a': '#2a0808', '--c-bg-b': '#4a1010', '--c-bg-c': '#5a1414', '--c-glow': 'rgba(255,100,100,0.45)', '--c-band': '#ff9a9a', '--c-text-shadow': 'rgba(255,160,160,0.5)' }
    case 'risk':
      return { '--c-bg-a': '#2a0808', '--c-bg-b': '#4a1010', '--c-bg-c': '#5a1414', '--c-glow': 'rgba(255,100,100,0.45)', '--c-band': '#ff9a9a', '--c-text-shadow': 'rgba(255,160,160,0.5)' }
    case 'divs':
      return { '--c-bg-a': '#1a1408', '--c-bg-b': '#3a2c10', '--c-bg-c': '#5a3d10', '--c-glow': 'rgba(243,200,112,0.65)', '--c-band': '#f3c870', '--c-text-shadow': 'rgba(255,220,140,0.55)' }
    default:
      return { '--c-bg-a': '#2a1265', '--c-bg-b': '#4d1c8a', '--c-bg-c': '#6e1f7a', '--c-glow': 'rgba(243,200,112,0.65)', '--c-band': '#f3c870', '--c-text-shadow': 'rgba(255,220,140,0.5)' }
  }
})
</script>

<style scoped>
.wr {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 100% 70% at 50% 100%, var(--c-glow), transparent 60%),
    linear-gradient(180deg, var(--c-bg-a) 0%, var(--c-bg-b) 50%, var(--c-bg-c) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 24px 22px;
  text-align: center;
  border-radius: inherit;
  overflow: hidden;
  color: #fff;
}

.wr__bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 40% at 80% 10%, rgba(255, 200, 100, 0.25), transparent 60%);
  z-index: 0;
}

.wr__top {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  margin-bottom: 18px;
}
.wr__logo { color: #fff; }

.wr__label {
  position: relative;
  z-index: 1;
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 17px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: -2px;
  padding: 0 6px;
}

.wr__num {
  position: relative;
  z-index: 1;
  font-family: 'Instrument Serif', serif;
  font-weight: 400;
  line-height: 0.85;
  color: #fff;
  letter-spacing: -0.05em;
  text-shadow:
    0 0 60px var(--c-text-shadow),
    0 6px 30px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
}

.wr__pnl-row {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: baseline;
  font-family: 'Instrument Serif', serif;
  color: #fff;
  text-shadow:
    0 0 60px var(--c-text-shadow),
    0 6px 30px rgba(0, 0, 0, 0.3);
  max-width: 100%;
  white-space: nowrap;
  gap: 4px;
}
.wr__pnl-sign { line-height: 0.85; }
.wr__pnl-cur {
  margin-right: 4px;
  color: rgba(255, 255, 255, 0.85);
}
.wr__pnl-amt {
  letter-spacing: -0.03em;
  line-height: 0.85;
  font-variant-numeric: tabular-nums;
}

.wr__of {
  position: relative;
  z-index: 1;
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
  font-weight: 500;
}

.wr__band {
  position: relative;
  z-index: 1;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.wr__band-text {
  font-family: 'Instrument Serif', serif;
  font-size: 28px;
  color: var(--c-band);
  font-style: italic;
  line-height: 1;
}
.wr__band-sub {
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}

.wr__copy {
  position: relative;
  z-index: 1;
  margin: 10px 0 0;
  font-size: 12.5px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.72);
  max-width: 240px;
  padding: 0 4px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
          line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wr__foot {
  position: relative;
  z-index: 1;
  margin: auto 0 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
}
.wr__foot-brand { color: var(--c-band); font-weight: 600; }
.wr__foot-dot { opacity: 0.5; }
</style>
