<!--
  PortfolioScoreDial

  Visualizacao do Redent Score 0-100. Anel circular com gradient amber→positive,
  numero gigante no centro com weight 300 (lightness como luxo, IDENTITY.md),
  band label e descricao curta abaixo. Uso em /raio-x e em cards de share.

  Calculado pela funcao analyzePortfolio() do composable usePortfolioScore.
-->
<script setup lang="ts">
import type { PortfolioReport } from '~/composables/usePortfolioScore'

interface Props {
  report: PortfolioReport
  size?: 'sm' | 'md' | 'lg'
  showBand?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showBand: true,
})

const brand = useBrand()

const dimensions = computed(() => props.size === 'sm' ? 200 : props.size === 'md' ? 260 : 320)
const stroke = computed(() => props.size === 'sm' ? 12 : props.size === 'md' ? 16 : 20)
const radius = computed(() => (dimensions.value - stroke.value) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const center = computed(() => dimensions.value / 2)

// Anel preenche 360 graus completos (circulo fechado). Era 270 graus antes,
// o que deixava um gap inferior amargo quando o score era alto. Agora a
// trilha de fundo fecha o circulo e o preenchimento amber cobre proporcionalmente.
const arcLength = computed(() => circumference.value)
const arcOffset = computed(() => 0)

const fillLength = computed(() => circumference.value * (props.report.score / 100))

const bandColor = computed(() => {
  if (props.report.band === 'critico') return brand.colors.negative || '#FF4747'
  if (props.report.band === 'atencao') return brand.colors.primary || '#F5A623'
  if (props.report.band === 'bom') return brand.colors.primary || '#F5A623'
  return brand.colors.positive || '#00D395'
})

const bandToneClass = computed(() => {
  if (props.report.band === 'critico') return 'tone-bad'
  if (props.report.band === 'atencao') return 'tone-mid'
  if (props.report.band === 'bom') return 'tone-good'
  return 'tone-excellent'
})

const scoreFontSize = computed(() => props.size === 'sm' ? '54px' : props.size === 'md' ? '76px' : '96px')
const labelFontSize = computed(() => props.size === 'sm' ? '11px' : '12px')
</script>

<template>
  <div class="score-dial" :data-size="size" :class="bandToneClass">
    <!-- Anel SVG -->
    <div class="score-dial__ring">
      <svg
        :width="dimensions"
        :height="dimensions"
        :viewBox="`0 0 ${dimensions} ${dimensions}`"
        class="score-dial__svg"
      >
        <defs>
          <linearGradient :id="`score-gradient-${report.score}`" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :stop-color="brand.colors.primary" />
            <stop offset="100%" :stop-color="bandColor" />
          </linearGradient>
        </defs>

        <!-- Trilha de fundo -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`"
          :stroke-width="stroke"
          stroke-linecap="round"
          :stroke-dasharray="`${arcLength} ${circumference}`"
          :stroke-dashoffset="-arcOffset"
          :transform="`rotate(-90 ${center} ${center})`"
        />
        <!-- Preenchimento -->
        <circle
          :cx="center"
          :cy="center"
          :r="radius"
          fill="none"
          :stroke="`url(#score-gradient-${report.score})`"
          :stroke-width="stroke"
          stroke-linecap="round"
          :stroke-dasharray="`${fillLength} ${circumference}`"
          :stroke-dashoffset="-arcOffset"
          :transform="`rotate(-90 ${center} ${center})`"
          class="score-dial__progress"
        />
      </svg>

      <!-- Numero centralizado -->
      <div class="score-dial__inner">
        <span class="score-dial__eyebrow">REDENT SCORE</span>
        <span
          class="score-dial__value tabular-nums"
          :style="{ fontSize: scoreFontSize, color: 'var(--text-heading)' }"
        >{{ report.score }}</span>
        <span class="score-dial__total tabular-nums">/100</span>
      </div>
    </div>

    <!-- Band -->
    <div v-if="showBand" class="score-dial__band">
      <span
        class="score-dial__band-pill"
        :style="{
          backgroundColor: `color-mix(in srgb, ${bandColor} 16%, transparent)`,
          color: bandColor,
          borderColor: `color-mix(in srgb, ${bandColor} 35%, transparent)`,
        }"
      >
        <span class="score-dial__band-dot" :style="{ background: bandColor }" />
        {{ report.bandLabel }}
      </span>
      <p class="score-dial__band-desc">
        {{ report.bandDescription }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.score-dial {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.score-dial__ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.score-dial__svg {
  display: block;
}

.score-dial__progress {
  transition: stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.score-dial__inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  pointer-events: none;
}

.score-dial__eyebrow {
  font-size: v-bind(labelFontSize);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.score-dial__value {
  font-weight: 300;
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-feature-settings: 'tnum' 1;
}

.score-dial__total {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  margin-top: 2px;
}

.score-dial__band {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  max-width: 320px;
}

.score-dial__band-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.score-dial__band-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.score-dial__band-desc {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-body);
  max-width: 36ch;
}

[data-size='sm'] .score-dial__band-desc {
  font-size: 12px;
}
</style>
