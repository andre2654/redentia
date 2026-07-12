<script setup lang="ts">
// PR10 — card de detalhamento por ativo do simulador de ações (porte funcional
// do bloco "Resultado, {ticker}" do Calculator/Stock.vue antigo, no visual Nu):
// valor final + KPIs, composição da carteira (preço médio / qtd de ações),
// gráfico de evolução (CalcAreaChart do kit) e histórico de proventos com a
// MESMA tabela de colunas da página antiga.
import { brl } from '~/components/calc/compound-math'
import type { StockSimulation } from './stock-math'

const props = defineProps<{
  result: StockSimulation & { name?: string }
  reinvest: boolean
}>()

const cur = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const rateFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

const returnFmt = computed(
  () => `${props.result.returnPercentage >= 0 ? '+' : ''}${props.result.returnPercentage.toFixed(2)}%`,
)

const chartValues = computed(() => props.result.chartData.map((p) => p.value))
const xLabels = computed<[string, string, string]>(() => {
  const pts = props.result.chartData
  const first = pts[0]?.date ?? ''
  const mid = pts[Math.floor((pts.length - 1) / 2)]?.date ?? ''
  const last = pts[pts.length - 1]?.date ?? ''
  return [first, mid, last]
})

const avgPerPayment = computed(() =>
  props.result.dividendsHistory.length
    ? props.result.totalDividends / props.result.dividendsHistory.length
    : 0,
)
</script>

<template>
  <div class="car">
    <h3 class="car__title">Resultado, {{ result.ticker }}</h3>
    <p v-if="result.name" class="car__name">{{ result.name }}</p>

    <p class="car__eyebrow">Valor final</p>
    <div class="car__value">{{ cur.format(result.finalValue) }}</div>

    <div class="car__kpis">
      <div class="car__kpi">
        <span class="car__kpi-label">Total investido</span>
        <span class="car__kpi-value">{{ cur.format(result.totalInvested) }}</span>
      </div>
      <div class="car__kpi">
        <span class="car__kpi-label">Rentabilidade</span>
        <span class="car__kpi-value" :class="result.returnPercentage >= 0 ? 'car__pos' : 'car__neg'">{{ returnFmt }}</span>
      </div>
      <div class="car__kpi">
        <span class="car__kpi-label">Total de proventos</span>
        <span class="car__kpi-value car__pos">{{ cur.format(result.totalDividends) }}</span>
      </div>
    </div>

    <div class="car__sub">
      <h4 class="car__sub-title">Composição da carteira</h4>
      <div class="car__kpis car__kpis--2">
        <div class="car__kpi">
          <span class="car__kpi-label">Preço médio de compra</span>
          <span class="car__kpi-value">{{ cur.format(result.averagePrice) }}</span>
        </div>
        <div class="car__kpi">
          <span class="car__kpi-label">Quantidade de ações</span>
          <span class="car__kpi-value">{{ result.totalShares.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <div class="car__chart">
      <p class="car__chart-label">Evolução do investimento</p>
      <CalcAreaChart :values="chartValues" :x-labels="xLabels" :format-y="brl" />
    </div>

    <div v-if="reinvest && result.dividendsHistory.length > 0" class="car__sub">
      <h4 class="car__sub-title">Histórico de Proventos</h4>
      <div class="car__kpis">
        <div class="car__kpi">
          <span class="car__kpi-label">Total de pagamentos</span>
          <span class="car__kpi-value">{{ result.dividendsHistory.length }}</span>
        </div>
        <div class="car__kpi">
          <span class="car__kpi-label">Total recebido</span>
          <span class="car__kpi-value car__pos">{{ cur.format(result.totalDividends) }}</span>
        </div>
        <div class="car__kpi">
          <span class="car__kpi-label">Média por pagamento</span>
          <span class="car__kpi-value">{{ cur.format(avgPerPayment) }}</span>
        </div>
      </div>
      <div class="car__table-wrap">
        <table class="car__table">
          <thead>
            <tr>
              <th>Data de pagamento</th>
              <th>Valor por ação</th>
              <th>Qtd. ações</th>
              <th>Total recebido</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dividend, index) in result.dividendsHistory" :key="`${result.ticker}-${index}`">
              <td>{{ new Date(dividend.payment_date).toLocaleDateString('pt-BR') }}</td>
              <td class="car__muted">{{ rateFmt.format(dividend.rate) }}</td>
              <td class="car__muted">{{ (dividend.sharesAtTime || 0).toFixed(2) }}</td>
              <td class="car__pos">{{ cur.format(dividend.totalReceived || 0) }}</td>
              <td>
                <span class="car__badge" :class="dividend.label === 'JCP' ? 'car__badge--brand' : 'car__badge--success'">
                  {{ dividend.label }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.car {
  background: var(--nu-cream);
  border-radius: var(--nu-r-card-lg);
  padding: clamp(22px, 3vw, 32px);
}
.car__title { margin: 0; color: var(--nu-ink); font-size: 19px; font-weight: 800; letter-spacing: -.3px; }
.car__name { margin: 3px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 600; }
.car__eyebrow { margin: 18px 0 0; color: var(--nu-gray); font-size: 13.5px; font-weight: 700; }
.car__value {
  margin-top: 4px; color: var(--nu-ink);
  font-size: clamp(28px, 3vw, 38px); font-weight: 800;
  letter-spacing: -0.03em; font-variant-numeric: tabular-nums;
}
.car__kpis {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px; margin-top: 16px;
}
.car__kpis--2 { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
.car__kpi {
  background: var(--nu-white); border-radius: var(--nu-r-input);
  padding: 12px 14px; display: flex; flex-direction: column; gap: 3px;
}
.car__kpi-label { color: var(--nu-gray); font-size: 12px; font-weight: 700; }
.car__kpi-value { color: var(--nu-ink); font-size: 15.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.car__pos { color: var(--nu-green); }
.car__neg { color: var(--nu-red); }
.car__sub { margin-top: 22px; }
.car__sub-title { margin: 0; color: var(--nu-ink); font-size: 15px; font-weight: 800; letter-spacing: -.2px; }
.car__chart { margin-top: 22px; }
.car__chart-label { margin: 0 0 10px; color: var(--nu-gray); font-size: 13.5px; font-weight: 700; }
.car__table-wrap {
  background: var(--nu-white); border-radius: var(--nu-r-tile);
  margin-top: 12px; max-height: 500px; overflow-y: auto; overflow-x: auto;
}
.car__table { width: 100%; border-collapse: collapse; min-width: 560px; }
.car__table th {
  position: sticky; top: 0; background: var(--nu-white); text-align: left;
  padding: 12px 14px; color: var(--nu-gray); font-size: 11px; font-weight: 800;
  letter-spacing: .7px; text-transform: uppercase;
  border-bottom: 1.5px solid var(--nu-cream-line-2); white-space: nowrap;
}
.car__table td {
  padding: 11px 14px; color: var(--nu-gray-3); font-size: 13.5px; font-weight: 600;
  border-bottom: 1.5px solid var(--nu-cream-line-2); font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.car__table tbody tr:last-child td { border-bottom: none; }
.car__muted { color: var(--nu-gray-2); }
.car__badge {
  display: inline-flex; border-radius: var(--nu-r-pill);
  padding: 3px 10px; font-size: 11.5px; font-weight: 800;
}
.car__badge--success { background: var(--nu-green-bg); color: var(--nu-green-2); }
.car__badge--brand { background: var(--nu-blue-tint); color: var(--nu-blue); }
</style>
