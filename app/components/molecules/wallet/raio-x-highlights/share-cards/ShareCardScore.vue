<!--
  ShareCardScore — purple polaroid with the user's portfolio score.
  Headline ("Meu Raio-X financeiro"), giant glowing number, band pill.
-->
<template>
  <ShareCardChrome
    paper="linear-gradient(160deg, #1a0f3a 0%, #2a1652 45%, #3a1f6a 100%)"
    glow="radial-gradient(ellipse 65% 55% at 50% 38%, rgba(170, 130, 240, 0.22), transparent 75%)"
  >
    <template #label>Meu Raio-X</template>

    <h1 class="sc-title">
      <span class="sc-title__line">Meu</span>
      <span class="sc-title__line sc-title__line--gold">Raio-X</span>
      <span class="sc-title__line sc-title__line--italic">financeiro</span>
    </h1>

    <div class="sc-title__rule" aria-hidden="true" />

    <div class="sc-score">
      <span class="sc-score__num" :style="{ fontSize: numFontSize + 'px' }">{{ score }}</span>
      <span class="sc-score__outof">/100</span>
    </div>

    <p class="sc-tagline">
      {{ tagline }}
    </p>

    <span class="sc-pill" :style="{ borderColor: pillColor, color: pillColor }">
      {{ bandLabel }}
    </span>

    <template #corner>
      <div class="sc-seal">
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
  score: number
  band: 'critico' | 'atencao' | 'bom' | 'excelente'
}
const props = defineProps<Props>()

const bandLabel = computed(() => ({
  critico: 'Crítica',
  atencao: 'Atenção',
  bom: 'Boa',
  excelente: 'Excelente',
}[props.band] || ''))

const pillColor = computed(() => ({
  critico: '#ff7a7a',
  atencao: '#ffb84d',
  bom: '#d9a635',
  excelente: '#a8e6a3',
}[props.band] || '#d9a635'))

const tagline = computed(() => {
  if (props.score >= 82) return 'Carteira sólida e equilibrada'
  if (props.score >= 65) return 'Bom nível, com espaço para evoluir'
  if (props.score >= 45) return 'Atenção: dá pra melhorar'
  return 'Carteira pede ajustes urgentes'
})

// Shrink the big numeral so "100" + "/100" fits the card width.
const numFontSize = computed(() => {
  const len = String(props.score || 0).length || 1
  if (len <= 1) return 140
  if (len === 2) return 130
  return 110
})
</script>

<style scoped>
.sc-title {
  font-family: 'Instrument Serif', 'Didot', 'Tiempos Headline', 'Times New Roman', serif;
  font-size: 38px;
  line-height: 0.96;
  font-weight: 400;
  color: #fff;
  margin: 0;
  text-align: left;
  align-self: stretch;
  letter-spacing: -0.01em;
}

.sc-title__line {
  display: block;
}

.sc-title__line--gold {
  color: #d9a635;
}

.sc-title__line--italic {
  font-style: italic;
  font-weight: 400;
}

.sc-title__rule {
  height: 2px;
  width: 50px;
  background: linear-gradient(90deg, transparent 0%, #d9a635 25%, #d9a635 75%, transparent 100%);
  border-radius: 999px;
  align-self: flex-start;
  margin: 6px 0 0;
}

.sc-score {
  margin: 26px 0 8px;
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  font-family: 'Instrument Serif', 'Didot', serif;
  font-variant-numeric: tabular-nums;
  position: relative;
}

.sc-score::before {
  content: '';
  position: absolute;
  inset: -40% -25%;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.35) 0%, transparent 60%);
  filter: blur(20px);
  z-index: -1;
}

.sc-score__num {
  font-size: 130px;
  font-weight: 400;
  color: #fff;
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-shadow: 0 0 32px rgba(255, 255, 255, 0.5);
}

.sc-score__outof {
  font-size: 38px;
  font-weight: 400;
  color: #d9a635;
  font-family: 'Instrument Serif', serif;
}

.sc-tagline {
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.78);
  margin: 8px 0 0;
  max-width: 80%;
  text-align: center;
}

.sc-pill {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  padding: 6px 24px;
  border: 1px solid;
  border-radius: 999px;
  font-family: 'Instrument Serif', serif;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.sc-seal {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 30%, #f3c870, #a07310 70%, #6b4e0a);
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
