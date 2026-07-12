<script setup lang="ts">
// PR10 — seção interativa da calculadora de juros compostos (a calculadora
// desenhada em Redentia Calculadoras Nu.dc.html): 4 sliders (Aporte inicial /
// Aporte mensal / Rentabilidade anual com presets / Prazo) + resultado com
// número-herói, barra empilhada, gráfico de área e card-insight. Matemática
// EXATA do design/página antiga (compound-math.ts). Reativa — sem botão de
// calcular. `seed` pré-preenche (cenários e deep-links ?initial=&monthly=…).
import { brl, compoundProjection } from './compound-math'

const props = defineProps<{
  seed?: { initial?: number; monthly?: number; rate?: number; years?: number }
  eyebrow?: string
  bg?: 'white' | 'cream'
  sectionId?: string
}>()

// defaults exatos do design (state = { ji:1000, jm:500, jt:11, jp:20 })
const ji = ref(1000)
const jm = ref(500)
const jt = ref(11)
const jp = ref(20)

watch(
  () => props.seed,
  (s) => {
    if (!s) return
    if (Number.isFinite(s.initial)) ji.value = s.initial as number
    if (Number.isFinite(s.monthly)) jm.value = s.monthly as number
    if (Number.isFinite(s.rate)) jt.value = s.rate as number
    if (Number.isFinite(s.years)) jp.value = Math.max(1, Math.min(40, Math.round(s.years as number)))
  },
  { immediate: true, deep: true },
)

const proj = computed(() => compoundProjection({ ji: ji.value, jm: jm.value, jt: jt.value, jp: jp.value }))

const jiTxt = computed(() => brl(ji.value))
const jmTxt = computed(() => brl(jm.value) + '/mês')
const jtTxt = computed(() => String(jt.value).replace('.', ',') + '% a.a.')
const jpTxt = computed(() => jp.value + (jp.value === 1 ? ' ano' : ' anos'))

// presets exatos do design
const ratePresets = [
  { label: 'Poupança 6,17%', value: 6.17 },
  { label: 'CDI 10,75%', value: 10.75 },
  { label: 'IPCA+ 11,48%', value: 11.48 },
  { label: 'Ações 14%', value: 14 },
]

const caption = computed(() => `Daqui a ${jp.value} anos, aportando ${brl(jm.value)} por mês, você terá`)
const xLabels = computed<[string, string, string]>(() => ['hoje', `+${Math.round(jp.value / 2)} anos`, `+${jp.value} anos`])
const insight = computed(
  () =>
    `Os juros respondem por ${proj.value.pctJ.toFixed(0)}% do total, ${proj.value.razao.toFixed(1).replace('.', ',')}× o que você aportou. É o efeito dos juros compostos no prazo longo.`,
)
const barSegments = computed(() => [
  { pct: 100 - proj.value.pctJ, color: 'var(--nu-navy)' },
  { pct: proj.value.pctJ, color: 'var(--nu-blue)' },
])
</script>

<template>
  <CalcShell :eyebrow="eyebrow ?? 'Calculadora'" :bg="bg" :section-id="sectionId ?? 'juros'">
    <template #title><slot name="title">Juros compostos.</slot></template>
    <template #controls>
      <CalcSliderField v-model="ji" label="Aporte inicial" :min="0" :max="100000" :step="500" :value-text="jiTxt" />
      <div class="ccs__gap">
        <CalcSliderField v-model="jm" label="Aporte mensal" :min="0" :max="10000" :step="50" :value-text="jmTxt" />
      </div>
      <div class="ccs__gap">
        <CalcSliderField v-model="jt" label="Rentabilidade anual" :min="1" :max="20" :step="0.25" :value-text="jtTxt" :presets="ratePresets" />
      </div>
      <div class="ccs__gap">
        <CalcSliderField v-model="jp" label="Prazo" :min="1" :max="40" :step="1" :value-text="jpTxt" />
      </div>
    </template>
    <template #result>
      <CalcResultPanel
        :caption="caption"
        :value="brl(proj.total)"
        :items="[
          { dot: 'var(--nu-navy)', label: 'Você aportou', value: brl(proj.aportado) },
          { dot: 'var(--nu-blue)', label: 'Juros renderam', value: brl(proj.juros), accent: true },
        ]"
      >
        <div class="ccs__bar"><CalcStackedBar :segments="barSegments" /></div>
        <div class="ccs__chart">
          <CalcAreaChart :values="proj.series" :secondary="proj.aporteSeries" :x-labels="xLabels" :format-y="brl" />
        </div>
        <div class="ccs__insight">{{ insight }}</div>
      </CalcResultPanel>
    </template>
  </CalcShell>
</template>

<style scoped>
.ccs__gap { margin-top: 26px; }
.ccs__bar { margin-top: 16px; }
.ccs__chart { margin-top: 30px; }
.ccs__insight {
  background: var(--nu-cream);
  border-radius: 18px;
  padding: 18px 22px;
  margin-top: 26px;
  color: var(--nu-gray-2);
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.6;
}
</style>
