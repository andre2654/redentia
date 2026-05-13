<!--
  /dev/share-cards — visual regression surface for the 4 share-card
  templates. Renders the SAME components used in production
  (share-cards/templates/) so the dev page can't drift from reality.

  Toggle the preset to stress-test small / medium / large / huge data.
-->
<template>
  <div class="dev">
    <header class="dev__head">
      <h1>Share cards · 4 templates × 4 tipos</h1>
      <p>Componentes reais da produção. Toggle os presets pra stress-testar o auto-fit dos números.</p>
      <div class="dev__presets">
        <button
          v-for="p in (Object.keys(presets) as PresetKey[])"
          :key="p"
          type="button"
          class="dev__preset"
          :class="{ 'is-on': activePreset === p }"
          @click="activePreset = p"
        >
          {{ presets[p].label }}
        </button>
      </div>
    </header>

    <div class="dev__legend">
      <span>1 · Editorial</span>
      <span>2 · Aurora</span>
      <span>3 · Fintech</span>
      <span>4 · Wrapped</span>
    </div>

    <section
      v-for="row in rows"
      :key="row.type"
      class="dev__row"
    >
      <h2 class="dev__row-title">{{ row.label }}</h2>
      <div class="dev__cards">
        <div
          v-for="tpl in templates"
          :key="`${row.type}-${tpl.key}`"
          class="dev__frame"
        >
          <component :is="tpl.comp" v-bind="{ type: row.type, ...row.props }" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EditorialTpl from '~/components/molecules/wallet/raio-x-highlights/share-cards/templates/Editorial.vue'
import AuroraTpl from '~/components/molecules/wallet/raio-x-highlights/share-cards/templates/Aurora.vue'
import FintechTpl from '~/components/molecules/wallet/raio-x-highlights/share-cards/templates/Fintech.vue'
import WrappedTpl from '~/components/molecules/wallet/raio-x-highlights/share-cards/templates/Wrapped.vue'

definePageMeta({ layout: 'default' })

type PresetKey = 'small' | 'medium' | 'large' | 'huge'

const presets = {
  small: {
    label: 'Pequeno',
    score: 8,
    band: 'critico' as const,
    pnlAmount: 247,
    pnlPct: 3.2,
    pnlDays: 28,
    riskValue: 5,
    riskSuffix: '%',
    riskBody: 'PETR4, VALE3',
    riskSeverity: 'low' as const,
    monthly: 52,
  },
  medium: {
    label: 'Médio',
    score: 71,
    band: 'bom' as const,
    pnlAmount: 5893,
    pnlPct: 67.5,
    pnlDays: 141,
    riskValue: 26,
    riskSuffix: '%',
    riskBody: 'AUPO11, BBSE3, BRSTNCNTB7T1',
    riskSeverity: 'medium' as const,
    monthly: 1247,
  },
  large: {
    label: 'Grande',
    score: 100,
    band: 'excelente' as const,
    pnlAmount: 98456,
    pnlPct: 125.8,
    pnlDays: 730,
    riskValue: 89,
    riskSuffix: '%',
    riskBody: 'ITSA4, BBDC4, ITUB4, B3SA3, MGLU3, AMER3',
    riskSeverity: 'high' as const,
    monthly: 25480,
  },
  huge: {
    label: 'Enorme',
    score: 100,
    band: 'excelente' as const,
    pnlAmount: 9999999,
    pnlPct: 9999,
    pnlDays: 3650,
    riskValue: 100,
    riskSuffix: '%',
    riskBody: 'AUPO11, BBSE3, BRSTNCNTB7T1, MXRF11, KNRI11, HGLG11, XPLG11, RBVA11',
    riskSeverity: 'high' as const,
    monthly: 987654,
  },
} as const

const activePreset = ref<PresetKey>('medium')
const d = computed(() => presets[activePreset.value])

const templates = [
  { key: 'editorial', label: 'Editorial', comp: EditorialTpl },
  { key: 'aurora',    label: 'Aurora',    comp: AuroraTpl },
  { key: 'fintech',   label: 'Fintech',   comp: FintechTpl },
  { key: 'wrapped',   label: 'Wrapped',   comp: WrappedTpl },
]

const rows = computed(() => [
  {
    type: 'score' as const,
    label: 'Score',
    props: { score: d.value.score, band: d.value.band },
  },
  {
    type: 'pnl' as const,
    label: 'P&L · positivo',
    props: { pnlAmount: d.value.pnlAmount, pnlPct: d.value.pnlPct, pnlDays: d.value.pnlDays },
  },
  {
    type: 'risk' as const,
    label: 'Risco',
    props: {
      riskValue: d.value.riskValue,
      riskSuffix: d.value.riskSuffix,
      riskBody: d.value.riskBody,
      riskSeverity: d.value.riskSeverity,
    },
  },
  {
    type: 'divs' as const,
    label: 'Dividendos',
    props: { monthly: d.value.monthly },
  },
])
</script>

<style scoped>
.dev {
  min-height: 100vh;
  background: #0a0610;
  color: rgba(255, 255, 255, 0.86);
  padding: 48px 32px 80px;
  font-family: 'Inter', system-ui, sans-serif;
}

.dev__head {
  max-width: 1500px;
  margin: 0 auto 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dev__head h1 {
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  letter-spacing: -0.01em;
}
.dev__head p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.dev__presets {
  display: inline-flex;
  gap: 6px;
  margin-top: 6px;
}
.dev__preset {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 160ms ease-out;
}
.dev__preset:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
.dev__preset.is-on {
  background: rgba(243, 200, 112, 0.15);
  border-color: rgba(243, 200, 112, 0.55);
  color: #f3c870;
}

.dev__legend {
  max-width: 1500px;
  margin: 16px auto 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
}

.dev__row {
  max-width: 1500px;
  margin: 0 auto 56px;
}
.dev__row-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 14px;
  padding-left: 4px;
}
.dev__cards {
  display: grid;
  grid-template-columns: repeat(4, 320px);
  gap: 24px;
  align-items: start;
}

.dev__frame {
  position: relative;
  width: 320px;
  aspect-ratio: 9 / 16;
  border-radius: 18px;
  overflow: hidden;
  isolation: isolate;
  box-shadow: 0 22px 60px -22px rgba(0, 0, 0, 0.65);
}

@media (max-width: 1450px) {
  .dev__cards { grid-template-columns: repeat(2, 320px); }
  .dev__legend { display: none; }
}
@media (max-width: 720px) {
  .dev__cards { grid-template-columns: 320px; justify-content: center; }
}
</style>
