<script setup lang="ts">
// PR10 — card de detalhamento por ativo do simulador de ações (porte funcional
// do bloco "Resultado, {ticker}" do Calculator/Stock.vue antigo, no visual Nu):
// valor final + KPIs, composição da carteira (preço médio / qtd de ações),
// gráfico de evolução (CalcAreaChart do kit) e histórico de proventos com a
// MESMA tabela de colunas da página antiga.
// Robustez (11/11/2026): fio, não caixa. Os números ficam numa ficha com o fio
// de 1px em cima de cada um (em vez de caixinhas creme dentro do cartão), a
// tabela tem o cabeçalho em caixa alta, os números alinhados pela direita e o
// fio de 1px entre as linhas, e o tipo do provento é o NuSelo pequeno.
import { brl } from '~/components/calc/compound-math'
import type { StockSimulation } from './stock-math'

const props = defineProps<{
  result: StockSimulation & { name?: string }
  reinvest: boolean
  /** com um ativo só, o cartão da conta já mostra o valor e a curva: aqui ficam a composição e os proventos (21/10/2026) */
  resumido?: boolean
  /** em cima do creme da seção, o cartão fica branco */
  branco?: boolean
}>()

const cur = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const rateFmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
})

// os números no jeito brasileiro (vírgula nas casas): "804,67", "+48,20%" (antes saíam "804.67")
const duasCasas = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const returnFmt = computed(
  () => `${props.result.returnPercentage >= 0 ? '+' : ''}${duasCasas.format(props.result.returnPercentage)}%`,
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
  <div class="car" :class="{ 'car--branco': branco }">
    <h3 class="car__title">Resultado, {{ result.ticker }}</h3>
    <p v-if="result.name" class="car__name">{{ result.name }}</p>

    <template v-if="!resumido">
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
    </template>

    <div class="car__sub">
      <h4 class="car__sub-title">Composição da carteira</h4>
      <div class="car__kpis car__kpis--2">
        <div class="car__kpi">
          <span class="car__kpi-label">Preço médio de compra</span>
          <span class="car__kpi-value">{{ cur.format(result.averagePrice) }}</span>
        </div>
        <div class="car__kpi">
          <span class="car__kpi-label">Quantidade de ações</span>
          <span class="car__kpi-value">{{ duasCasas.format(result.totalShares) }}</span>
        </div>
      </div>
    </div>

    <div v-if="!resumido" class="car__chart">
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
              <th class="car__num">Valor por ação</th>
              <th class="car__num">Qtd. ações</th>
              <th class="car__num">Total recebido</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dividend, index) in result.dividendsHistory" :key="`${result.ticker}-${index}`">
              <td>{{ new Date(dividend.payment_date).toLocaleDateString('pt-BR') }}</td>
              <td class="car__num car__muted">{{ rateFmt.format(dividend.rate) }}</td>
              <td class="car__num car__muted">{{ duasCasas.format(dividend.sharesAtTime || 0) }}</td>
              <td class="car__num car__pos">{{ cur.format(dividend.totalReceived || 0) }}</td>
              <td>
                <NuSelo tamanho="p" :tom="dividend.label === 'JCP' ? 'azul' : 'verde'">{{ dividend.label }}</NuSelo>
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
  background: var(--nu-band);
  border-radius: var(--nu-r-card);
  padding: clamp(24px, 3vw, 32px);
}
/* o cartão branco sobre o creme da página (Aportou, 11/11/2026) */
.car--branco { background: var(--nu-white); box-shadow: var(--nu-shadow-branco); }
.car__title { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }
.car__name { margin: 4px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.car__eyebrow { margin: 24px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.car__value {
  margin-top: 4px; color: var(--nu-ink);
  font-size: var(--nu-fs-h3); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-titulo); line-height: 1.05; font-variant-numeric: tabular-nums;
}
/* a ficha: cada número com o fio de 1px em cima, sem caixa */
.car__kpis {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px 24px; margin-top: 16px;
}
.car__kpis--2 { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
.car__kpi { display: flex; flex-direction: column; gap: 4px; padding-top: 12px; border-top: 1px solid var(--nu-line-2); }
.car__kpi-label { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.car__kpi-value { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; letter-spacing: var(--nu-ls-titulo); }
.car__pos { color: var(--nu-green-text); }
.car__neg { color: var(--nu-red-text); }
.car__sub { margin-top: 32px; }
.car__sub-title { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-texto); }
.car__chart { margin-top: 32px; }
.car__chart-label { margin: 0 0 12px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
/* a tabela: sem caixa em volta, só o fio de cima e o de baixo da área que rola */
.car__table-wrap {
  margin-top: 16px; max-height: 500px; overflow-y: auto; overflow-x: auto;
  border-block: 1px solid var(--nu-line-2);
}
.car__table { width: 100%; border-collapse: collapse; min-width: 560px; }
.car__table th {
  position: sticky; top: 0; background: var(--nu-white); text-align: left;
  padding: 12px 14px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio);
  letter-spacing: var(--nu-ls-caixa); text-transform: uppercase;
  box-shadow: inset 0 -1px 0 var(--nu-line-2); white-space: nowrap;
}
.car--branco .car__table th { background: var(--nu-white); }
.car:not(.car--branco) .car__table th { background: var(--nu-band); }
.car__table td {
  padding: 11px 14px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto);
  border-bottom: 1px solid var(--nu-line-2); font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.car__table th:first-child, .car__table td:first-child { padding-left: 0; }
.car__table th:last-child, .car__table td:last-child { padding-right: 0; }
.car__table tbody tr:last-child td { border-bottom: none; }
/* números alinhados pela direita, em coluna */
.car__table .car__num { text-align: right; }
.car__muted { color: var(--nu-gray-2); }
</style>
