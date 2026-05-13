<!--
  ShareCardDivs — black/amber polaroid showing monthly passive income.
-->
<template>
  <ShareCardChrome
    paper="linear-gradient(160deg, #1a1408 0%, #2a200c 50%, #3a2c10 100%)"
    glow="radial-gradient(ellipse 65% 55% at 50% 50%, rgba(243, 200, 112, 0.20), transparent 75%)"
  >
    <template #label>Renda Passiva</template>

    <h1 class="dv-title">
      <span class="dv-title__line">Minha</span>
      <span class="dv-title__line dv-title__line--gold">carteira</span>
      <span class="dv-title__line dv-title__line--italic">já me paga</span>
    </h1>

    <div class="dv-title__rule" aria-hidden="true" />

    <div class="dv-value">
      <span class="dv-value__currency">R$</span>
      <span class="dv-value__amount" :style="{ fontSize: amountFontSize + 'px' }">{{ formatted }}</span>
      <span class="dv-value__period">/mês</span>
    </div>

    <p class="dv-context">em dividendos estimados</p>

    <span class="dv-pill">Renda passiva</span>

    <template #corner>
      <div class="dv-seal">
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
  monthly: number
}
const props = defineProps<Props>()

const formatted = computed(() => Math.round(props.monthly).toLocaleString('pt-BR'))

// Big numeral shrinks for long amounts. "R$" + amount + "/mês" share
// the row; we budget ~150px for the amount itself before forcing
// font-size down so nothing overflows the card.
const amountFontSize = computed(() => {
  const len = formatted.value.length || 1
  const ideal = 150 / (len * 0.55)
  return Math.max(44, Math.min(120, Math.floor(ideal)))
})
</script>

<style scoped>
.dv-title {
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

.dv-title__line { display: block; }
.dv-title__line--gold { color: #d9a635; }
.dv-title__line--italic {
  font-style: italic;
  font-weight: 400;
  color: #d9a635;
}

.dv-title__rule {
  height: 2px;
  width: 50px;
  background: linear-gradient(90deg, transparent 0%, #d9a635 25%, #d9a635 75%, transparent 100%);
  border-radius: 999px;
  align-self: flex-start;
  margin: 6px 0 0;
}

.dv-value {
  margin: 30px 0 6px;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-family: 'Instrument Serif', serif;
  font-variant-numeric: tabular-nums;
  position: relative;
}

.dv-value::before {
  content: '';
  position: absolute;
  inset: -45% -10%;
  background: radial-gradient(ellipse, rgba(243, 200, 112, 0.35) 0%, transparent 60%);
  filter: blur(22px);
  z-index: -1;
}

.dv-value__currency {
  font-size: 44px;
  font-weight: 400;
  color: #fff;
  line-height: 0.9;
}

.dv-value__amount {
  font-size: 120px;
  font-weight: 400;
  color: #fff;
  line-height: 0.9;
  letter-spacing: -0.03em;
  text-shadow: 0 0 36px rgba(243, 200, 112, 0.6);
}

.dv-value__period {
  font-size: 24px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  line-height: 0.9;
}

.dv-context {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);
  margin: 6px 0 0;
}

.dv-pill {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  padding: 6px 22px;
  border: 1px solid rgba(217, 166, 53, 0.55);
  color: #d9a635;
  border-radius: 999px;
  font-family: 'Instrument Serif', serif;
  font-size: 16px;
  font-weight: 400;
}

.dv-seal {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #f3c870, #a07310 70%, #6b4e0a);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 -3px 8px rgba(0, 0, 0, 0.4),
    inset 0 3px 6px rgba(255, 240, 200, 0.4),
    0 4px 10px -3px rgba(0, 0, 0, 0.5);
  color: #2a1610;
}
</style>
