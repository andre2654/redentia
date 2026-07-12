<script setup lang="ts">
// PR10 — seção interativa da calculadora de Planejamento Patrimonial.
// Visual = kit das calculadoras Nu (CalcShell + sliders + número-herói +
// gráfico de área); matemática = porte EXATO do backend antigo
// (planning-math.ts, dados reais da B3 via /api/backend). A estratégia
// (segmented) e o botão "Calcular Planejamento" são controles próprios no
// mesmo estilo visual do kit (chips/pills) — sem tocar no kit.
import { brl } from '~/components/calc/compound-math'
import {
  calculatePlanning,
  formatTimeLabel,
  type PlanningResult,
  type PlanningStrategy,
} from './planning-math'

const props = defineProps<{ sectionId?: string }>()

const route = useRoute()

// defaults da página antiga (goalValue: 500000, monthlyContribution: 1500)
const goal = ref(500000)
const monthly = ref(1500)
const strategy = ref<PlanningStrategy>('rentabilidade')

const loading = ref(false)
const error = ref('')
const result = ref<PlanningResult | null>(null)
const timeToGoalLabel = ref('')

const goalTxt = computed(() => brl(goal.value))
const monthlyTxt = computed(() => brl(monthly.value) + '/mês')

const goalPresets = [
  { label: 'R$ 150 mil', value: 150000 },
  { label: 'R$ 500 mil', value: 500000 },
  { label: 'R$ 1 milhão', value: 1000000 },
  { label: 'R$ 2 milhões', value: 2000000 },
]
const monthlyPresets = [
  { label: 'R$ 500', value: 500 },
  { label: 'R$ 1.500', value: 1500 },
  { label: 'R$ 3.000', value: 3000 },
]

const strategyOptions: { value: PlanningStrategy; label: string }[] = [
  { value: 'rentabilidade', label: 'Maior rentabilidade' },
  { value: 'seguranca', label: 'Maior segurança' },
]

async function calculate() {
  const goalValue = Number(goal.value) || 0
  const monthlyContribution = Number(monthly.value) || 0

  if (goalValue <= 0) {
    error.value = 'Informe uma meta financeira válida.'
    return
  }
  if (monthlyContribution <= 0) {
    error.value = 'Informe um aporte mensal válido.'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const r = await calculatePlanning('/api/backend', goalValue, monthlyContribution, strategy.value)
    if (!r) throw new Error('Não foi possível calcular o planejamento. Tente novamente.')
    result.value = r
    timeToGoalLabel.value = formatTimeLabel(r.monthsToGoal)
  } catch (e) {
    error.value =
      e instanceof Error && e.message ? e.message : 'Não foi possível calcular o planejamento. Tente novamente.'
  } finally {
    loading.value = false
  }
}

// ====================================================================
// Deep-link via query params — comportamento portado do Planning.vue
// antigo: ?goal= ?monthly= ?strategy= (e ?auto=1) pré-preenchem e
// disparam o cálculo; clique num cenário popular re-aplica + scrolla.
// ====================================================================
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

function parseStrategyParam(value: unknown): PlanningStrategy | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const normalized = raw.trim().toLowerCase()
  if (normalized === 'rentabilidade' || normalized === 'seguranca') return normalized
  return null
}

function applyQueryParams() {
  const q = route.query
  const g = parseNumberParam(q.goal)
  const m = parseNumberParam(q.monthly)
  const s = parseStrategyParam(q.strategy)

  if (g !== null && g > 0) goal.value = g
  if (m !== null && m > 0) monthly.value = m
  if (s !== null) strategy.value = s

  const hasAnyInput = g !== null || m !== null || s !== null
  if (hasAnyInput || q.auto === '1' || q.auto === 'true') {
    nextTick(() => calculate())
  }
}

function scrollToCalc() {
  if (typeof window === 'undefined') return
  nextTick(() => {
    document.getElementById(props.sectionId ?? 'planejamento')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

onMounted(() => {
  applyQueryParams()
})

watch(
  () => route.query,
  () => {
    applyQueryParams()
    scrollToCalc()
  },
  { deep: true },
)

const chartValues = computed(() => result.value?.chartData.map((p) => p.value) ?? [])
const xLabels = computed<[string, string, string]>(() => {
  const months = result.value?.monthsToGoal ?? 0
  if (months < 24) return ['hoje', `+${Math.round(months / 2)} meses`, `+${months} meses`]
  const years = Math.round(months / 12)
  return ['hoje', `+${Math.round(years / 2)} anos`, `+${years} anos`]
})

const pct2 = (v: number) => (v * 100).toFixed(2).replace('.', ',') + '%'
const pct1 = (v: number) => (v * 100).toFixed(1).replace('.', ',') + '%'
</script>

<template>
  <CalcShell eyebrow="Calculadora" :section-id="sectionId ?? 'planejamento'">
    <template #title><slot name="title">Planejamento patrimonial.</slot></template>
    <template #controls>
      <p class="pcs__form-label">{{ result ? 'Ajustar simulação' : 'Configure sua simulação' }}</p>
      <div class="pcs__gap">
        <CalcSliderField
          v-model="goal"
          label="Meta financeira (R$)"
          :min="50000"
          :max="3000000"
          :step="10000"
          :value-text="goalTxt"
          :presets="goalPresets"
        />
      </div>
      <div class="pcs__gap">
        <CalcSliderField
          v-model="monthly"
          label="Aporte mensal (R$)"
          :min="100"
          :max="10000"
          :step="50"
          :value-text="monthlyTxt"
          :presets="monthlyPresets"
        />
      </div>
      <div class="pcs__gap">
        <span class="pcs__label">Estratégia</span>
        <div class="pcs__segmented" role="group" aria-label="Estratégia de planejamento">
          <button
            v-for="o in strategyOptions"
            :key="o.value"
            type="button"
            class="pcs__seg"
            :class="{ 'pcs__seg--active': strategy === o.value }"
            :aria-pressed="strategy === o.value"
            @click="strategy = o.value"
          >{{ o.label }}</button>
        </div>
        <p class="pcs__help">
          Escolha entre maximizar ganhos com ativos de alta performance ou priorizar estabilidade com setores defensivos, FIIs consolidados e 10% de renda fixa.
        </p>
      </div>
      <button type="button" class="pcs__cta" :disabled="loading" @click="calculate">
        {{ loading ? 'Calculando…' : 'Calcular Planejamento' }}
      </button>
      <div v-if="error" class="pcs__error" role="alert">{{ error }}</div>
    </template>

    <template #result>
      <CalcResultPanel
        v-if="result"
        caption="Tempo estimado para alcançar a meta"
        :value="timeToGoalLabel"
        :items="[
          { dot: 'var(--nu-navy)', label: 'Aportes até a meta', value: brl(result.totalInvestedUntilGoal) },
          { dot: 'var(--nu-blue)', label: 'Resultado projetado', value: brl(result.estimatedFinalValue), accent: true },
          { dot: 'var(--nu-green)', label: 'Retorno mensal médio', value: pct2(result.monthlyReturnRate) },
        ]"
      >
        <p class="pcs__until">
          até <strong>{{ result.targetDateLabel }}</strong>
          · <span class="pcs__gain">+{{ brl(result.estimatedProfit) }}</span> de ganho
        </p>

        <div class="pcs__chart">
          <p class="pcs__chart-label">Projeção de patrimônio</p>
          <CalcAreaChart :values="chartValues" :x-labels="xLabels" :format-y="brl" />
        </div>

        <div class="pcs__subcard">
          <h4 class="pcs__subcard-title">Se tivesse investido nos últimos {{ result.historicalYears.toFixed(1) }} anos</h4>
          <p class="pcs__subcard-desc">Considerando o mesmo aporte mensal e a carteira recomendada.</p>
          <div class="pcs__kpis">
            <div class="pcs__kpi">
              <span class="pcs__kpi-label">Total investido</span>
              <span class="pcs__kpi-value">{{ brl(result.historicalInvested) }}</span>
            </div>
            <div class="pcs__kpi">
              <span class="pcs__kpi-label">Valor final</span>
              <span class="pcs__kpi-value pcs__kpi-value--accent">{{ brl(result.historicalFinalValue) }}</span>
            </div>
            <div class="pcs__kpi">
              <span class="pcs__kpi-label">Lucro histórico</span>
              <span class="pcs__kpi-value pcs__kpi-value--positive">{{ brl(result.historicalProfit) }}</span>
            </div>
          </div>
        </div>

        <div class="pcs__subcard">
          <h4 class="pcs__subcard-title">Carteira sugerida</h4>
          <p class="pcs__subcard-desc">Distribuição baseada no desempenho histórico e nos critérios da estratégia escolhida.</p>
          <div class="pcs__assets">
            <div
              v-for="asset in result.recommendedAssets"
              :key="`${asset.ticker}-${asset.category}`"
              class="pcs__asset"
            >
              <div class="pcs__asset-head">
                <div>
                  <p class="pcs__asset-cat">{{ asset.category }}</p>
                  <p class="pcs__asset-ticker">{{ asset.ticker }}</p>
                </div>
                <div class="pcs__asset-weight">
                  <span class="pcs__asset-weight-label">Peso</span>
                  <span class="pcs__asset-weight-value">{{ (asset.weight * 100).toFixed(0) }}%</span>
                </div>
              </div>
              <div class="pcs__asset-metrics">
                <div>
                  <p class="pcs__metric-label">Retorno {{ result.historicalYears.toFixed(0) }} anos</p>
                  <p class="pcs__metric-value" :class="asset.totalReturn >= 0 ? 'pcs__metric-value--positive' : 'pcs__metric-value--negative'">{{ pct1(asset.totalReturn) }}</p>
                </div>
                <div>
                  <p class="pcs__metric-label">CAGR anual</p>
                  <p class="pcs__metric-value">{{ pct1(asset.cagr) }}</p>
                </div>
                <div>
                  <p class="pcs__metric-label">Retorno mensal</p>
                  <p class="pcs__metric-value">{{ pct2(asset.monthlyRate) }}</p>
                </div>
                <div>
                  <p class="pcs__metric-label">Dividendos reinvestidos</p>
                  <p class="pcs__metric-value pcs__metric-value--positive">{{ brl(asset.totalDividends) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pcs__callout">
          Recomendação baseada em dados históricos. Rentabilidades passadas não garantem resultados futuros. Ajuste sempre sua carteira conforme o seu perfil de risco.
        </div>
      </CalcResultPanel>

      <div v-else class="pcs__empty">
        <p class="pcs__empty-eyebrow">Tempo estimado</p>
        <p class="pcs__empty-text">
          {{ loading ? 'Analisando o histórico real dos ativos da B3…' : 'Preencha os dados ao lado e clique em "Calcular Planejamento".' }}
        </p>
      </div>
    </template>
  </CalcShell>
</template>

<style scoped>
.pcs__form-label { margin: 0 0 22px; color: var(--nu-gray); font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
.pcs__gap { margin-top: 26px; }
.pcs__gap:first-of-type { margin-top: 0; }
.pcs__label { display: block; color: var(--nu-gray); font-size: 14px; font-weight: 700; }

/* segmented no estilo dos chips do kit (ativo = pill preta) */
.pcs__segmented { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
.pcs__seg {
  flex: 1 1 auto;
  padding: 11px 14px;
  border-radius: var(--nu-r-pill);
  font-size: 13.5px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  border: 2px solid var(--nu-sand-border);
  background: var(--nu-white);
  color: var(--nu-gray-2);
  transition: all .2s;
}
.pcs__seg--active {
  border-color: var(--nu-ink);
  background: var(--nu-ink);
  color: var(--nu-white);
}
.pcs__help { margin: 12px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 500; line-height: 1.55; }

.pcs__cta {
  display: block; width: 100%; margin-top: 26px;
  background: var(--nu-blue); color: var(--nu-white);
  border: none; border-radius: var(--nu-r-pill);
  padding: 16px 26px; font-size: 16px; font-weight: 800; font-family: inherit;
  cursor: pointer; transition: background .2s;
}
.pcs__cta:hover { background: var(--nu-blue-hover); }
.pcs__cta:disabled { opacity: .6; cursor: wait; }

.pcs__error {
  margin-top: 16px; padding: 14px 16px;
  background: var(--nu-red-tint); border-radius: var(--nu-r-input);
  color: var(--nu-red-2); font-size: 14px; font-weight: 700; line-height: 1.5;
}

.pcs__until { margin: 16px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 600; }
.pcs__until strong { color: var(--nu-ink); font-weight: 800; }
.pcs__gain { color: var(--nu-green); font-weight: 800; font-variant-numeric: tabular-nums; }

.pcs__chart { margin-top: 30px; }
.pcs__chart-label { margin: 0 0 14px; color: var(--nu-gray); font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }

.pcs__subcard {
  background: var(--nu-cream);
  border-radius: var(--nu-r-panel);
  padding: 24px;
  margin-top: 26px;
}
.pcs__subcard-title { margin: 0; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.pcs__subcard-desc { margin: 6px 0 0; color: var(--nu-gray-2); font-size: 13.5px; font-weight: 500; line-height: 1.55; }

.pcs__kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-top: 18px; }
.pcs__kpi { background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
.pcs__kpi-label { color: var(--nu-gray); font-size: 12px; font-weight: 700; }
.pcs__kpi-value { color: var(--nu-ink); font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }
.pcs__kpi-value--accent { color: var(--nu-blue); }
.pcs__kpi-value--positive { color: var(--nu-green); }

.pcs__assets { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr)); gap: 12px; margin-top: 18px; }
.pcs__asset { background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 18px; }
.pcs__asset-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
.pcs__asset-cat { margin: 0; color: var(--nu-gray); font-size: 11px; font-weight: 800; letter-spacing: .7px; text-transform: uppercase; }
.pcs__asset-ticker { margin: 4px 0 0; color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.3px; }
.pcs__asset-weight { text-align: right; }
.pcs__asset-weight-label { display: block; color: var(--nu-gray); font-size: 11px; font-weight: 700; }
.pcs__asset-weight-value { display: block; color: var(--nu-blue); font-size: 21px; font-weight: 800; font-variant-numeric: tabular-nums; }
.pcs__asset-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin-top: 16px; }
.pcs__metric-label { margin: 0; color: var(--nu-gray); font-size: 11.5px; font-weight: 600; }
.pcs__metric-value { margin: 2px 0 0; color: var(--nu-ink); font-size: 14.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.pcs__metric-value--positive { color: var(--nu-green); }
.pcs__metric-value--negative { color: var(--nu-red); }

.pcs__callout {
  margin-top: 26px; padding: 18px 22px;
  background: var(--nu-cream); border-radius: 18px;
  color: var(--nu-gray-2); font-size: 14px; font-weight: 500; line-height: 1.6;
}

.pcs__empty {
  background: var(--nu-cream); border-radius: var(--nu-r-card-lg);
  padding: clamp(32px, 5vw, 56px);
}
.pcs__empty-eyebrow { margin: 0; color: var(--nu-gray); font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
.pcs__empty-text { margin: 12px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 500; line-height: 1.6; max-width: 460px; }
</style>
