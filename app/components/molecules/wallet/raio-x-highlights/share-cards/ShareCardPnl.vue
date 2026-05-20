<!--
  ShareCardPnl — emerald polaroid celebrating the user's gains
  (or red variant for losses). Big glowing currency value, day count,
  signed percentage.
-->
<template>
  <ShareCardChrome
    :paper="paper"
    :glow="glow"
  >
    <template #label>Jornada · {{ days }} dias</template>

    <h1 class="pn-title">
      <span class="pn-title__line">Minha</span>
      <span class="pn-title__line pn-title__line--gold">carteira</span>
      <span class="pn-title__line pn-title__line--italic">{{ verb }}</span>
    </h1>

    <div class="pn-title__rule" aria-hidden="true" />

    <div class="pn-value">
      <span class="pn-value__sign">{{ sign }}</span>
      <span class="pn-value__currency">R$</span>
      <span class="pn-value__amount" :style="{ fontSize: amountFontSize + 'px' }">{{ formatted }}</span>
    </div>

    <p class="pn-context">
      em <span class="pn-context__hi">{{ daysFormatted }} dias</span> investindo
    </p>

    <span class="pn-pill" :style="{ borderColor: tint, color: tint }">
      {{ signedPct }} no período
    </span>

    <template #corner>
      <div class="pn-seal">
        <ShareCardStar size="36" />
      </div>
    </template>
  </ShareCardChrome>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ShareCardChrome from './ShareCardChrome.vue'
import ShareCardStar from './ShareCardStar.vue'

interface Props {
  amount: number
  pct: number
  days: number
  positive?: boolean
}
const props = defineProps<Props>()

const positive = computed(() => props.positive ?? props.amount >= 0)

const verb = computed(() => positive.value ? 'já me trouxe' : 'já me custou')
const sign = computed(() => positive.value ? '+' : '−')
const tint = computed(() => positive.value ? '#5cd99a' : '#ff7a7a')

const paper = computed(() => positive.value
  ? 'linear-gradient(160deg, #082015 0%, #0d2c1c 50%, #0f3826 100%)'
  : 'linear-gradient(160deg, #2a0c0c 0%, #401414 50%, #501a1a 100%)')

const glow = computed(() => positive.value
  ? 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(92, 217, 154, 0.22), transparent 75%)'
  : 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255, 122, 122, 0.22), transparent 75%)')

const formatted = computed(() => Math.abs(props.amount).toLocaleString('pt-BR', {
  maximumFractionDigits: 0,
}))

// Big numerals need to shrink when the amount has lots of digits or
// the "R$ 9.999.999" composition would overflow the card's usable
// width. Instrument Serif digit is ≈0.55em wide; we budget ~190px
// for the amount itself (the rest goes to "+", "R$", gaps, etc).
const amountFontSize = computed(() => {
  const len = formatted.value.length || 1
  const ideal = 190 / (len * 0.55)
  return Math.max(46, Math.min(100, Math.floor(ideal)))
})

const daysFormatted = computed(() => props.days.toLocaleString('pt-BR'))

const signedPct = computed(() => {
  const v = props.pct
  const abs = Math.abs(v).toFixed(1).replace('.', ',')
  return `${v >= 0 ? '+' : '−'}${abs}%`
})
</script>

<style scoped>
.pn-title {
  font-family: 'Instrument Serif', 'Didot', serif;
  font-size: 38px;
  line-height: 0.96;
  font-weight: 400;
  color: #fff;
  margin: 0;
  text-align: left;
  align-self: stretch;
  letter-spacing: -0.01em;
}

.pn-title__line { display: block; }
.pn-title__line--gold { color: #d9a635; }
.pn-title__line--italic {
  font-style: italic;
  font-weight: 400;
}

.pn-title__rule {
  height: 2px;
  width: 50px;
  background: linear-gradient(90deg, transparent 0%, #d9a635 25%, #d9a635 75%, transparent 100%);
  border-radius: 999px;
  align-self: flex-start;
  margin: 6px 0 0;
}

.pn-value {
  margin: 28px 0 6px;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-family: 'Instrument Serif', serif;
  font-variant-numeric: tabular-nums;
  position: relative;
}

.pn-value::before {
  content: '';
  position: absolute;
  inset: -50% -10%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.35) 0%, transparent 60%);
  filter: blur(22px);
  z-index: -1;
}

.pn-value__sign {
  font-size: 64px;
  font-weight: 400;
  color: #fff;
  line-height: 0.9;
}

.pn-value__currency {
  font-size: 38px;
  font-weight: 400;
  color: #fff;
  line-height: 0.9;
}

.pn-value__amount {
  font-size: 100px;
  font-weight: 400;
  color: #fff;
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-shadow: 0 0 36px rgba(255, 255, 255, 0.45);
}

.pn-context {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);
  margin: 8px 0 0;
}

.pn-context__hi {
  color: #d9a635;
  font-weight: 500;
}

.pn-pill {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  padding: 6px 22px;
  border: 1px solid;
  border-radius: 999px;
  font-family: 'Instrument Serif', serif;
  font-size: 16px;
  font-weight: 400;
}

.pn-seal {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #f3c870, #a07310 70%, #6b4e0a);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 -3px 8px var(--shadow-amber-near),
    inset 0 3px 6px rgba(255, 240, 200, 0.4),
    0 4px 10px -3px var(--shadow-ambient);
  color: #2a1610;
}
</style>
