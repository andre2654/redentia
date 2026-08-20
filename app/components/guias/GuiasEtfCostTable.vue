<script setup lang="ts">
/**
 * Tabela viva de custo real de ETFs pro guia (bloco 'etf-costs').
 *
 * Busca o x-ray de cada ticker no SSR (a rota /guias/** cacheia 3600s no
 * routeRules, então o Laravel é tocado no máximo 1x/hora) e mostra o que
 * página nenhuma de gestora mostra junto: taxa de administração E custo
 * efetivo com taxa sobre taxa, calculados da carteira CVM do mês.
 *
 * Degradação honesta: ticker que falhar sai da tabela; todos falharam, o
 * bloco inteiro some — melhor guia sem tabela do que tabela vazia.
 */
import { acaoFetchEtfXray } from '~/services/acao'
import type { EtfXrayApi } from '~/types/acao'

const props = defineProps<{ tickers: string[] }>()

const config = useRuntimeConfig()
const serverBase = (config.backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
const base = import.meta.server ? serverBase : '/api/backend'

const nf = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (v: number | null) => (v === null ? '—' : `${nf.format(v)}% a.a.`)

const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const mesAno = (asOf: string) => {
  const [y, m] = asOf.split('-')
  const mi = Number(m) - 1
  return MES[mi] ? `${MES[mi]}/${y}` : asOf
}

interface Row {
  ticker: string
  fee: string
  total: string
  piso: boolean
  asOf: string
}

const { data: rows } = await useAsyncData<Row[]>(
  `guia-etf-costs-${props.tickers.join('-')}`,
  async () => {
    const xs = await Promise.all(
      props.tickers.map((t) => acaoFetchEtfXray(base, t).catch(() => null)),
    )
    return xs
      .filter((x): x is EtfXrayApi => !!x)
      .map((x) => ({
        ticker: x.ticker,
        fee: pct(x.fees.management_fee),
        total: pct(x.fees.total_expense_ratio),
        piso: x.fees.total_expense_ratio !== null && (x.fees.incomplete || x.fees.unmapped_fund_weight > 0.001),
        asOf: x.as_of,
      }))
  },
  { default: () => [] },
)

const asOfLine = computed(() => {
  const first = rows.value[0]?.asOf
  return first ? `Carteira de ${mesAno(first)} reportada à CVM` : ''
})
</script>

<template>
  <div v-if="rows.length" class="getc">
    <div class="getc__head">
      <span class="getc__kicker">Custo real, calculado pela Redentia</span>
      <span class="getc__asof">{{ asOfLine }} · atualiza sozinho todo mês</span>
    </div>
    <div class="getc__scroll">
      <table class="getc__table">
        <thead>
          <tr>
            <th>ETF</th>
            <th>Taxa de administração</th>
            <th>Custo efetivo total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.ticker">
            <td><NuxtLink :to="`/asset/${r.ticker}`" class="getc__tk">{{ r.ticker }}</NuxtLink></td>
            <td class="getc__num">{{ r.fee }}</td>
            <td class="getc__num">{{ r.total }}<span v-if="r.piso" class="getc__piso">piso</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="getc__note">
      O custo efetivo soma a taxa do ETF com as taxas dos fundos que ele carrega dentro
      ("taxa sobre taxa"). Quando parte da carteira está em fundo sem taxa mapeada, o
      número é um piso. Clique no ticker pra ver a carteira aberta.
    </p>
  </div>
</template>

<style scoped>
.getc { margin-top: 28px; background: var(--nu-cream); border-radius: var(--nu-r-card); padding: clamp(20px, 2.6vw, 28px); }
.getc__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.getc__kicker { color: var(--nu-ink); font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.getc__asof { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }
.getc__scroll { overflow-x: auto; margin-top: 14px; }
.getc__table { width: 100%; border-collapse: collapse; min-width: 420px; }
.getc__table th {
  text-align: left; color: var(--nu-gray-tag); font-size: 11.5px; font-weight: 800;
  letter-spacing: 0.07em; text-transform: uppercase; padding: 0 12px 8px 0;
}
.getc__table td { padding: 10px 12px 10px 0; border-top: 1px solid var(--nu-ink-14); font-size: 15px; font-weight: 600; color: var(--nu-gray-2); }
.getc__tk { color: var(--nu-blue); font-weight: 800; text-decoration: none; }
.getc__tk:hover { text-decoration: underline; text-underline-offset: 2px; }
.getc__num { font-variant-numeric: tabular-nums; color: var(--nu-ink); font-weight: 700; }
.getc__piso {
  margin-left: 8px; background: var(--nu-sand-2); color: var(--nu-gray-tag);
  font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: var(--nu-r-pill);
  vertical-align: 1px;
}
.getc__note { margin: 14px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 600; line-height: 1.55; }
</style>
