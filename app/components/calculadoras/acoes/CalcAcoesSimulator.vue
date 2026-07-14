<script setup lang="ts">
// PR10 — seção interativa do simulador de ações (/calculadora/acoes).
// Comportamento portado do Calculator/Stock.vue antigo: busca multi-ativo
// (STOCK/FUND/REIT via GET /tickers-full), aporte inicial/mensal/período,
// reinvestimento de proventos, botão "Calcular Histórico" (não é reativo — o
// cálculo busca histórico real por ticker), deep-links ?initial=&monthly=
// &years=&reinvest=&tickers= com auto-fire, e resultados stale ao editar.
// Matemática EXATA em ./stock-math (porte do server antigo). Visual = kit
// da fase 1 (CalcShell/CalcSliderField/CalcResultPanel/CalcAreaChart).
import { brl } from '~/components/calc/compound-math'
import {
  cleanChart,
  cleanDividends,
  mergeChartData,
  simulateStock,
  type StockSimulation,
} from './stock-math'

interface AssetItem {
  id: string
  label: string
  suffix?: string
}

const route = useRoute()
const cur = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/* ——— form (defaults exatos da página antiga) ——— */
const initialInvestment = ref(10000)
const monthlyInvestment = ref(500)
const periodYears = ref(2)
const reinvestDividends = ref(true)

const portfolioAssets = ref<AssetItem[]>([])
const searchTerm = ref('')
const searchOpen = ref(false)
const calculating = ref(false)
const stockError = ref('')
const resultsStale = ref(false)
const results = ref<(StockSimulation & { name?: string })[]>([])

/* ——— lista de ativos (client-only; mesma fonte /tickers-full do app antigo) ——— */
const { data: assetsData, pending: assetsLoading } = useAsyncData(
  'calc-acoes-tickers-full',
  () => $fetch<unknown>('/api/backend/tickers-full', { headers: { Accept: 'application/json' } }),
  { server: false },
)

function unwrapArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload
  const p = payload as { data?: unknown } | null
  if (p && Array.isArray(p.data)) return p.data as Record<string, unknown>[]
  return []
}

const normalizedAssets = computed<AssetItem[]>(() => {
  return unwrapArray(assetsData.value)
    .filter((a) => {
      // página antiga filtrava STOCK|FUND; no runtime atual do /tickers-full
      // FIIs vêm como REIT (sem ele, HGLG11/KNCR11 não resolvem) e ETFs como
      // ETF (cenários BOVA11/SMAL11 já existiam na página antiga)
      const type = String(a.type ?? '').toUpperCase()
      return type === 'STOCK' || type === 'FUND' || type === 'REIT' || type === 'ETF'
    })
    .map((a) => {
      const ticker = (a.ticker || a.stock) as string | undefined
      if (!ticker) return null
      return { id: ticker, label: ticker, suffix: a.name as string | undefined }
    })
    .filter((a): a is AssetItem => Boolean(a))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const filteredAssets = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  const selected = new Set(portfolioAssets.value.map((a) => a.id))
  const pool = normalizedAssets.value.filter((a) => !selected.has(a.id))
  if (!term) return pool.slice(0, 30)
  return pool
    .filter((a) => a.label.toLowerCase().includes(term) || (a.suffix ?? '').toLowerCase().includes(term))
    .slice(0, 30)
})

function markResultsStale() {
  if (results.value.length) resultsStale.value = true
}

function addAsset(item: AssetItem) {
  if (portfolioAssets.value.some((a) => a.id === item.id)) return
  portfolioAssets.value.push(item)
  stockError.value = ''
  markResultsStale()
  searchTerm.value = ''
  searchOpen.value = false
}

function removeAsset(ticker: string) {
  const index = portfolioAssets.value.findIndex((a) => a.id === ticker)
  if (index !== -1) {
    portfolioAssets.value.splice(index, 1)
    results.value = results.value.filter((r) => r.ticker !== ticker)
    markResultsStale()
  }
}

watch([initialInvestment, monthlyInvestment, periodYears, reinvestDividends], markResultsStale)
watch(() => portfolioAssets.value.map((a) => a.id).join(','), markResultsStale)

/* ——— deep-links (?initial=&monthly=&years=&reinvest=&tickers=&auto=) ——— */
function parseNumberParam(value: unknown): number | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : null
}

function parseBoolParam(value: unknown): boolean | null {
  if (value === undefined || value === null) return null
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const normalized = raw.trim().toLowerCase()
  if (normalized === '1' || normalized === 'true' || normalized === 'sim') return true
  if (normalized === '0' || normalized === 'false' || normalized === 'nao') return false
  return null
}

function parseTickersParam(value: unknown): string[] {
  if (value === undefined || value === null) return []
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return []
  return raw
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0)
}

const deepLinkApplied = ref(false)
const pendingTickers = ref<string[]>([])
const pendingAutoFire = ref(false)

function applyQueryParams() {
  if (!import.meta.client) return
  const q = route.query
  const initial = parseNumberParam(q.initial)
  const monthly = parseNumberParam(q.monthly)
  const years = parseNumberParam(q.years)
  const reinvest = parseBoolParam(q.reinvest)
  const tickers = parseTickersParam(q.tickers)

  if (initial !== null) initialInvestment.value = initial
  if (monthly !== null) monthlyInvestment.value = monthly
  if (years !== null && years > 0) periodYears.value = Math.max(1, Math.min(30, Math.round(years)))
  if (reinvest !== null) reinvestDividends.value = reinvest

  pendingTickers.value = tickers
  const hasAnyInput =
    initial !== null || monthly !== null || years !== null || reinvest !== null || tickers.length > 0
  pendingAutoFire.value = hasAnyInput || q.auto === '1' || q.auto === 'true'
  deepLinkApplied.value = false
  tryResolvePendingTickers()
}

function tryResolvePendingTickers() {
  if (deepLinkApplied.value) return
  if (!pendingTickers.value.length && !pendingAutoFire.value) return
  if (pendingTickers.value.length && !normalizedAssets.value.length) return

  const tickerSet = new Set(pendingTickers.value)
  if (tickerSet.size > 0) {
    const matches = normalizedAssets.value.filter((a) => tickerSet.has(a.id.toUpperCase()))
    if (matches.length > 0) portfolioAssets.value = matches
  }

  deepLinkApplied.value = true

  if (pendingAutoFire.value && portfolioAssets.value.length) {
    nextTick(() => {
      calculateStockHistory()
    })
  }
}

watch(normalizedAssets, tryResolvePendingTickers)

function scrollToCalc() {
  if (typeof window === 'undefined') return
  nextTick(() => {
    document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

onMounted(applyQueryParams)

watch(
  () => route.query,
  () => {
    applyQueryParams()
    scrollToCalc()
  },
  { deep: true },
)

/* ——— cálculo (fetch + matemática exata portada) ——— */
async function simulateAsset(
  asset: AssetItem,
  perInitial: number,
  perMonthly: number,
  years: number,
  reinvest: boolean,
): Promise<(StockSimulation & { name?: string }) | null> {
  try {
    const pricesRaw = await $fetch<unknown>(`/api/backend/tickers/${asset.id}/prices?mode=full`, {
      timeout: 15_000,
      headers: { Accept: 'application/json' },
    })
    const priceHistory = cleanChart(pricesRaw)

    let dividendsRaw: { date: unknown; value: unknown; type: unknown }[] = []
    if (reinvest) {
      try {
        dividendsRaw = cleanDividends(
          await $fetch<unknown>(`/api/backend/dividends/${asset.id}`, {
            timeout: 15_000,
            headers: { Accept: 'application/json' },
          }),
        )
      } catch {
        /* sem proventos → segue sem reinvestimento (comportamento antigo) */
      }
    }

    const sim = simulateStock(asset.id, priceHistory, dividendsRaw, perInitial, perMonthly, years, reinvest)
    if (!sim) return null
    return { ...sim, name: asset.suffix }
  } catch {
    return null
  }
}

async function calculateStockHistory() {
  if (!portfolioAssets.value.length) {
    stockError.value = 'Adicione pelo menos um ativo para calcular.'
    return
  }

  calculating.value = true
  stockError.value = ''
  results.value = []

  try {
    const tickerCount = portfolioAssets.value.length
    const totalInitial = Number(initialInvestment.value) || 0
    const totalMonthly = Number(monthlyInvestment.value) || 0
    const years = Number(periodYears.value) || 0

    if (!Number.isFinite(years) || years <= 0) {
      stockError.value = 'Informe um período em anos válido'
      return
    }

    const perInitial = tickerCount > 0 ? totalInitial / tickerCount : 0
    const perMonthly = tickerCount > 0 ? totalMonthly / tickerCount : 0
    const reinvest = Boolean(reinvestDividends.value)

    const failed: string[] = []
    const simulations = await Promise.all(
      portfolioAssets.value.map(async (asset) => {
        const result = await simulateAsset(asset, perInitial, perMonthly, years, reinvest)
        if (!result) failed.push(asset.label)
        return result
      }),
    )

    const valid = simulations.filter((r): r is StockSimulation & { name?: string } => Boolean(r))
    if (!valid.length) {
      stockError.value = 'Não foi possível calcular com os ativos selecionados.'
      return
    }

    results.value = valid
    resultsStale.value = false
    stockError.value = failed.length
      ? `Alguns ativos foram ignorados por falta de dados: ${failed.join(', ')}`
      : ''
  } catch (error) {
    stockError.value =
      error instanceof Error && error.message ? error.message : 'Erro ao calcular. Tente novamente.'
  } finally {
    calculating.value = false
  }
}

/* ——— agregado consolidado (porte do aggregatedSummary antigo) ——— */
const aggregatedSummary = computed(() => {
  if (!results.value.length) return null
  const totals = results.value.reduce(
    (acc, r) => {
      acc.totalInvested += r.totalInvested
      acc.finalValue += r.finalValue
      acc.totalDividends += r.totalDividends
      return acc
    },
    { totalInvested: 0, finalValue: 0, totalDividends: 0 },
  )
  const totalReturn =
    totals.totalInvested > 0 ? ((totals.finalValue - totals.totalInvested) / totals.totalInvested) * 100 : 0
  return { ...totals, return: totalReturn, assetCount: results.value.length }
})

const mergedChart = computed(() => (results.value.length ? mergeChartData(results.value) : []))
const chartValues = computed(() => mergedChart.value.map((p) => p.value))
const chartXLabels = computed<[string, string, string]>(() => {
  const pts = mergedChart.value
  return [
    pts[0]?.date ?? '',
    pts[Math.floor((pts.length - 1) / 2)]?.date ?? '',
    pts[pts.length - 1]?.date ?? '',
  ]
})

const jiTxt = computed(() => brl(initialInvestment.value))
const jmTxt = computed(() => brl(monthlyInvestment.value) + '/mês')
const jpTxt = computed(() => periodYears.value + (periodYears.value === 1 ? ' ano' : ' anos'))
</script>

<template>
  <CalcShell eyebrow="Simulador" section-id="simulador">
    <template #title>Investimento em ações.</template>
    <template #controls>
      <p class="cas__section-label">{{ aggregatedSummary && !resultsStale ? 'Ajustar análise' : 'Configure a simulação' }}</p>

      <!-- busca de ativos (controle no estilo do kit; input não-numérico) -->
      <div class="cas__search">
        <div class="cas__row">
          <span class="cas__label">Selecione os ativos</span>
        </div>
        <input
          v-model="searchTerm"
          type="text"
          class="cas__input"
          placeholder="Buscar ação ou FII..."
          aria-label="Selecione os ativos"
          @focus="searchOpen = true"
          @blur="searchOpen = false"
        >
        <div v-if="searchOpen && (filteredAssets.length || assetsLoading)" class="cas__dropdown">
          <p v-if="assetsLoading" class="cas__hint">Carregando ativos…</p>
          <button
            v-for="a in filteredAssets"
            :key="a.id"
            type="button"
            class="cas__option"
            @mousedown.prevent="addAsset(a)"
          >
            <span class="cas__option-ticker">{{ a.label }}</span>
            <span v-if="a.suffix" class="cas__option-name">{{ a.suffix }}</span>
          </button>
        </div>
      </div>

      <div v-if="portfolioAssets.length" class="cas__pills">
        <span v-for="asset in portfolioAssets" :key="asset.id" class="cas__pill">
          <span class="cas__pill-ticker">{{ asset.label }}</span>
          <button type="button" class="cas__pill-x" aria-label="Remover ativo" @click="removeAsset(asset.id)">×</button>
        </span>
      </div>
      <p v-else class="cas__hint">Adicione pelo menos um ativo para realizar o cálculo.</p>

      <div class="cas__gap">
        <CalcSliderField v-model="initialInvestment" label="Valor Inicial de Aporte (R$)" :min="0" :max="100000" :step="500" :value-text="jiTxt" />
      </div>
      <div class="cas__gap">
        <CalcSliderField v-model="monthlyInvestment" label="Aporte Mensal (R$)" :min="0" :max="10000" :step="50" :value-text="jmTxt" />
      </div>
      <div class="cas__gap">
        <CalcSliderField v-model="periodYears" label="Período (anos)" :min="1" :max="30" :step="1" :value-text="jpTxt" />
      </div>

      <button
        type="button"
        class="cas__toggle"
        role="switch"
        :aria-checked="reinvestDividends"
        @click="reinvestDividends = !reinvestDividends"
      >
        <span class="cas__toggle-track" :class="{ 'cas__toggle-track--on': reinvestDividends }">
          <span class="cas__toggle-thumb" />
        </span>
        <span class="cas__toggle-label">Reinvestir proventos automaticamente</span>
      </button>

      <button
        type="button"
        class="cas__cta"
        :disabled="!portfolioAssets.length || calculating"
        @click="calculateStockHistory"
      >
        {{ calculating ? 'Calculando…' : 'Calcular Histórico' }}
      </button>

      <div v-if="stockError" class="cas__alert cas__alert--error">{{ stockError }}</div>
      <div v-if="resultsStale" class="cas__alert cas__alert--warn">
        <strong>Resultados desatualizados.</strong>
        Clique em "Calcular Histórico" para atualizar as projeções após as alterações.
      </div>
    </template>

    <template #result>
      <template v-if="aggregatedSummary && !resultsStale">
        <CalcResultPanel
          caption="Valor final consolidado"
          :value="cur.format(aggregatedSummary.finalValue)"
          :items="[
            { dot: 'var(--nu-navy)', label: 'Total investido', value: cur.format(aggregatedSummary.totalInvested) },
            { dot: 'var(--nu-blue)', label: 'Total de proventos', value: cur.format(aggregatedSummary.totalDividends), accent: true },
          ]"
        >
          <div class="cas__return" :class="aggregatedSummary.return >= 0 ? 'cas__return--pos' : 'cas__return--neg'">
            Rentabilidade {{ aggregatedSummary.return >= 0 ? '+' : '' }}{{ aggregatedSummary.return.toFixed(2) }}%
          </div>
          <div v-if="chartValues.length >= 2" class="cas__chart">
            <CalcAreaChart :values="chartValues" :x-labels="chartXLabels" :format-y="brl" />
          </div>
          <div v-if="aggregatedSummary.assetCount > 1" class="cas__insight">
            Aportes distribuídos igualmente entre {{ aggregatedSummary.assetCount }} ativos.
          </div>
          <div class="cas__details">
            <CalcAcoesAssetResult
              v-for="result in results"
              :key="result.ticker"
              :result="result"
              :reinvest="reinvestDividends"
            />
          </div>
        </CalcResultPanel>
      </template>
      <div v-else class="cas__empty">
        <p class="cas__empty-eyebrow">Resultado consolidado</p>
        <p class="cas__empty-text">Adicione ativos e clique em "Calcular Histórico" pra simular.</p>
        <p class="cas__empty-text cas__empty-text--sub">Chart e tabela de proventos aparecem após o cálculo.</p>
      </div>
    </template>
  </CalcShell>
</template>

<style scoped>
.cas__section-label { margin: 0 0 18px; color: var(--nu-gray); font-size: 12.5px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
.cas__gap { margin-top: 36px; }

/* busca */
.cas__search { position: relative; }
.cas__row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.cas__label { color: var(--nu-gray); font-size: 14px; font-weight: 700; }
.cas__input {
  width: 100%; margin-top: 12px; padding: 13px 16px;
  background: var(--nu-white); border: 2px solid var(--nu-sand-border);
  border-radius: var(--nu-r-input); color: var(--nu-ink);
  font-size: 15px; font-weight: 700; font-family: var(--nu-font); outline: none;
  transition: border-color .2s;
}
.cas__input::placeholder { color: var(--nu-placeholder); font-weight: 600; }
.cas__input:focus { border-color: var(--nu-blue); }
.cas__dropdown {
  position: absolute; left: 0; right: 0; top: 100%; z-index: 30; margin-top: 6px;
  background: var(--nu-white); border-radius: var(--nu-r-tile);
  box-shadow: var(--nu-shadow-card); max-height: 280px; overflow-y: auto; padding: 6px;
}
.cas__option {
  display: flex; align-items: baseline; gap: 10px; width: 100%;
  background: transparent; border: none; text-align: left; cursor: pointer;
  padding: 10px 12px; border-radius: 10px; transition: background .15s;
}
.cas__option:hover { background: var(--nu-cream); }
.cas__option-ticker { color: var(--nu-ink); font-size: 14px; font-weight: 800; flex-shrink: 0; }
.cas__option-name { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cas__hint { margin: 12px 0 0; color: var(--nu-gray); font-size: 13px; font-weight: 600; }

/* pills de ativos selecionados */
.cas__pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.cas__pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--nu-ink); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 7px 8px 7px 14px;
  font-size: 12.5px; font-weight: 800;
}
.cas__pill-x {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--nu-white-18); color: var(--nu-white);
  border: none; cursor: pointer; font-size: 14px; line-height: 1;
  transition: background .2s;
}
.cas__pill-x:hover { background: var(--nu-white-35); }

/* toggle de reinvestimento */
.cas__toggle {
  display: flex; align-items: center; gap: 12px; margin-top: 26px;
  background: transparent; border: none; padding: 0; cursor: pointer; text-align: left;
}
.cas__toggle-track {
  width: 44px; height: 26px; border-radius: var(--nu-r-pill);
  background: var(--nu-sand-2); position: relative; flex-shrink: 0;
  transition: background .2s;
}
.cas__toggle-track--on { background: var(--nu-blue); }
.cas__toggle-thumb {
  position: absolute; top: 3px; left: 3px; width: 20px; height: 20px;
  border-radius: 50%; background: var(--nu-white);
  box-shadow: var(--nu-shadow-slider-thumb); transition: transform .2s;
}
.cas__toggle-track--on .cas__toggle-thumb { transform: translateX(18px); }
.cas__toggle-label { color: var(--nu-gray-2); font-size: 14px; font-weight: 700; }

/* CTA */
.cas__cta {
  width: 100%; margin-top: 26px; padding: 16px 24px;
  background: var(--nu-blue); color: var(--nu-white);
  border: none; border-radius: var(--nu-r-pill); cursor: pointer;
  font-size: 16px; font-weight: 800; font-family: var(--nu-font);
  transition: background .2s, opacity .2s;
}
.cas__cta:hover:not(:disabled) { background: var(--nu-blue-hover); }
.cas__cta:disabled { opacity: .45; cursor: not-allowed; }

/* alerts */
.cas__alert {
  margin-top: 16px; border-radius: var(--nu-r-input); padding: 13px 16px;
  font-size: 13.5px; font-weight: 600; line-height: 1.5;
}
.cas__alert strong { font-weight: 800; }
.cas__alert--error { background: var(--nu-red-tint); color: var(--nu-red-2); }
.cas__alert--warn { background: var(--nu-warning-bg); color: var(--nu-gray-3); }

/* resultado */
.cas__return {
  display: inline-flex; margin-top: 16px; border-radius: var(--nu-r-pill);
  padding: 7px 14px; font-size: 13.5px; font-weight: 800; font-variant-numeric: tabular-nums;
}
.cas__return--pos { background: var(--nu-green-bg); color: var(--nu-green-2); }
.cas__return--neg { background: var(--nu-red-bg); color: var(--nu-red-2); }
.cas__chart { margin-top: 30px; }
.cas__insight {
  background: var(--nu-cream); border-radius: 18px; padding: 18px 22px; margin-top: 26px;
  color: var(--nu-gray-2); font-size: 15.5px; font-weight: 500; line-height: 1.6;
}
.cas__details { display: flex; flex-direction: column; gap: 16px; margin-top: 30px; }

/* vazio */
.cas__empty {
  background: var(--nu-cream); border-radius: var(--nu-r-card-lg);
  padding: clamp(28px, 4vw, 44px);
}
.cas__empty-eyebrow { margin: 0; color: var(--nu-gray); font-size: 12.5px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; }
.cas__empty-text { margin: 12px 0 0; color: var(--nu-gray-2); font-size: 16px; font-weight: 600; }
.cas__empty-text--sub { margin-top: 6px; color: var(--nu-gray); font-size: 13.5px; font-weight: 500; }
</style>
