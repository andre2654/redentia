<template>
  <NuxtLayout :name="layoutName">
    <div class="relative z-10 flex flex-col px-4 pt-4">
      <div class="flex flex-col">
        <!-- Terminal status bar -->
        <div
          class="-mx-4 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-t px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span class="flex items-center gap-1.5" :style="{ color: brand.colors.primary }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
            </span>
            [CRYPTO.QUOTE]
          </span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.text }">{{ crypto?.symbol }}</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span class="truncate max-w-[320px]" :style="{ color: brand.colors.textMuted }">{{ crypto?.name ?? symbol }}</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span v-if="refreshedLabel" :style="{ color: brand.colors.border }">·</span>
          <span v-if="refreshedLabel" :style="{ color: brand.colors.textMuted }">UPDATE {{ refreshedLabel }}</span>
        </div>

        <!-- Hero -->
        <section class="border-b pb-8" :style="{ borderColor: brand.colors.border }">
          <div class="grid gap-6 md:grid-cols-12 md:items-end">
            <div class="flex items-center gap-4 md:col-span-5">
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
              >
                <img
                  v-if="crypto?.image"
                  :src="crypto.image"
                  :alt="crypto.symbol"
                  class="h-full w-full object-contain"
                >
                <span v-else class="font-mono-tab text-sm font-bold" :style="{ color: brand.colors.primary }">
                  {{ crypto?.symbol.slice(0, 3).toUpperCase() }}
                </span>
              </div>
              <div class="flex min-w-0 flex-col gap-1">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                  [SYMBOL] #{{ crypto?.rank ?? '—' }}
                </span>
                <h1 class="font-mono-tab text-3xl font-bold tracking-tight md:text-4xl" :style="{ color: brand.colors.text }">
                  {{ crypto?.symbol }}
                </h1>
                <span class="text-sm" :style="{ color: brand.colors.textMuted }">{{ crypto?.name }}</span>
              </div>
            </div>

            <div class="flex flex-col gap-1 md:col-span-4">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [PRICE.BRL]
              </span>
              <span class="font-mono-tab text-4xl font-bold tabular-nums md:text-5xl" :style="{ color: brand.colors.primary }">
                {{ formatBrl((crypto as any)?.price_brl ?? null) }}
              </span>
              <span class="font-mono-tab text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                ≈ {{ formatUsd(crypto?.price_usd ?? null) }} USD
              </span>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tab text-[11px] tabular-nums">
                <span>
                  <span :style="{ color: brand.colors.textMuted }">24H: </span>
                  <span :style="{ color: pctColor(crypto?.change_24h_pct) }">{{ formatPct(crypto?.change_24h_pct) }}</span>
                </span>
                <span>
                  <span :style="{ color: brand.colors.textMuted }">7D: </span>
                  <span :style="{ color: pctColor(crypto?.change_7d_pct) }">{{ formatPct(crypto?.change_7d_pct) }}</span>
                </span>
                <span>
                  <span :style="{ color: brand.colors.textMuted }">30D: </span>
                  <span :style="{ color: pctColor(crypto?.change_30d_pct) }">{{ formatPct(crypto?.change_30d_pct) }}</span>
                </span>
              </div>
            </div>

            <!-- Session stats -->
            <div
              class="grid grid-cols-2 gap-px border font-mono-tab md:col-span-3"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
            >
              <div class="flex flex-col gap-1 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                <span class="text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">HIGH 24H</span>
                <span class="text-sm font-semibold tabular-nums" :style="{ color: brand.colors.positive }">{{ formatBrl((crypto?.ohlc as any)?.high_brl ?? null) }}</span>
              </div>
              <div class="flex flex-col gap-1 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                <span class="text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">LOW 24H</span>
                <span class="text-sm font-semibold tabular-nums" :style="{ color: brand.colors.negative }">{{ formatBrl((crypto?.ohlc as any)?.low_brl ?? null) }}</span>
              </div>
              <div class="flex flex-col gap-1 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                <span class="text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">MKT CAP</span>
                <span class="text-sm font-semibold tabular-nums" :style="{ color: brand.colors.text }">{{ formatBrl((crypto as any)?.market_cap_brl ?? null, { compact: true }) }}</span>
              </div>
              <div class="flex flex-col gap-1 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                <span class="text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">VOL 24H</span>
                <span class="text-sm font-semibold tabular-nums" :style="{ color: brand.colors.text }">{{ formatBrl((crypto as any)?.volume_24h_brl ?? null, { compact: true }) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Chart section (price ou rainbow, toggle no mesmo padrão do tesouro) -->
        <section class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div class="flex flex-col gap-1">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [CHART.{{ chartMode === 'rainbow' ? 'RAINBOW' : 'PRICE' }}]
              </span>
              <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                {{ chartMode === 'rainbow' ? 'Rainbow chart · escala log projetada' : 'Histórico de cotação' }}
              </h2>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                <template v-if="chartMode === 'rainbow'">
                  &gt; BANDAS DE REGRESSÃO LOGARÍTMICA · {{ rainbowStartYear }} → 2032 · HALVINGS MARCADOS · PASSE O MOUSE PARA VER O PREÇO DE CADA BANDA
                </template>
                <template v-else>
                  &gt; SÉRIE DIÁRIA · BRL · {{ selectedChartRange.toUpperCase() }}
                </template>
              </span>
            </div>
            <div class="flex flex-col gap-2 md:flex-row md:items-center">
              <div
                v-if="crypto?.has_rainbow"
                class="flex items-center gap-px border font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
              >
                <button
                  v-for="opt in chartModeOptions"
                  :key="opt.value"
                  type="button"
                  class="px-3 py-2 transition-colors"
                  :style="{
                    backgroundColor: chartMode === opt.value ? brand.colors.primary : brand.colors.surface,
                    color: chartMode === opt.value ? brand.colors.background : brand.colors.textMuted,
                  }"
                  @click="chartMode = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
              <MoleculesPeriodSelector
                v-if="chartMode === 'price'"
                v-model="selectedChartRange"
                :options="chartRangeOptions"
                :loading="isLoadingChart"
                class="max-md:w-full"
              />
            </div>
          </div>
          <AtomsCryptoRainbow
            v-if="chartMode === 'rainbow' && crypto?.has_rainbow"
            :points="rainbowPoints"
            :coin-id="crypto.id"
            :height="480"
            currency="BRL"
          />
          <template v-else>
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLegend"
              :height="320"
              :loading="isLoadingChart"
              currency="R$"
            />
            <p v-if="!isLoadingChart && chartData.length === 0" class="mt-4 text-sm" :style="{ color: brand.colors.textMuted }">
              Histórico não disponível para essa cripto. Hoje só BTC, ETH e SOL têm série histórica completa.
            </p>
          </template>
        </section>

        <!-- Tokenomics -->
        <section class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <div class="mb-4 flex flex-col gap-1">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              [TOKENOMICS]
            </span>
            <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
              Tokenomics
            </h2>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
              &gt; SUPPLY · EMISSÃO · VALOR TOTAL DILUÍDO
            </span>
          </div>
          <div
            class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-5"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
          >
            <div v-for="m in tokenomicsMetrics" :key="m.label" class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: brand.colors.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">{{ m.label }}</span>
              <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: brand.colors.text }">{{ m.value }}</span>
              <span v-if="m.sub" class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">{{ m.sub }}</span>
            </div>
          </div>
        </section>

        <!-- Indicadores de Mercado -->
        <section class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <div class="mb-4 flex flex-col gap-1">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              [MARKET.INDICATORS]
            </span>
            <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
              Indicadores de mercado
            </h2>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
              &gt; VALOR DE MERCADO · VOLUME · LIQUIDEZ · DOMINÂNCIA
            </span>
          </div>
          <div
            class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-4"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
          >
            <div v-for="m in marketMetrics" :key="m.label" class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: brand.colors.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">{{ m.label }}</span>
              <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: m.color ?? brand.colors.text }">{{ m.value }}</span>
              <span v-if="m.sub" class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">{{ m.sub }}</span>
            </div>
          </div>
        </section>

        <!-- Resumo diário -->
        <section v-if="hasOhlc" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <div class="mb-4 flex flex-col gap-1">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              [DAILY.SUMMARY]
            </span>
            <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
              Resumo diário
            </h2>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
              &gt; OHLC · AMPLITUDE · VOLATILIDADE INTRADIÁRIA
            </span>
          </div>
          <div
            class="grid grid-cols-2 gap-px border md:grid-cols-4"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
          >
            <div v-for="m in ohlcMetrics" :key="m.label" class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: brand.colors.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">{{ m.label }}</span>
              <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: m.color ?? brand.colors.text }">{{ m.value }}</span>
              <span v-if="m.sub" class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">{{ m.sub }}</span>
            </div>
          </div>
        </section>

        <!-- 52 semanas / Valorização -->
        <section class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <div class="mb-4 flex flex-col gap-1">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              [52W.WINDOW]
            </span>
            <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
              Faixa de 52 semanas
            </h2>
          </div>
          <div
            class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-6"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
          >
            <div v-for="m in windowMetrics" :key="m.label" class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: brand.colors.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">{{ m.label }}</span>
              <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: m.color ?? brand.colors.text }">{{ m.value }}</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useCryptoService, formatUsd as fmtUsd, type CryptoPriceRange } from '~/services/crypto'
import type { IChartDataPoint, IChartLegendItem } from '~/types/chart'

const route = useRoute()
const brand = useBrand()
const authStore = useAuthStore()
const symbol = String(route.params.symbol).toLowerCase()

const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

const { getCrypto, getCryptoPrices } = useCryptoService()

const { data, error } = await useAsyncData(`crypto-${symbol}`, () => getCrypto(symbol))
if (error.value || !data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Cripto não encontrada',
    fatal: true,
  })
}
const crypto = computed(() => data.value)

// Brand ref snapshot — useBrand() lê useState, que só pode ser chamado na
// fase de setup. Dentro do callback do useHead (executa depois), usamos
// essas refs já resolvidas.
const brandName = brand.name
const brandUrl = brand.url

useHead(() => {
  const c = crypto.value as any
  if (!c) return { title: `${symbol.toUpperCase()} | ${brandName}` }

  const priceBrlLabel = c.price_brl != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.price_brl)
    : ''
  const mcapLabel = c.market_cap_brl != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 2 }).format(c.market_cap_brl)
    : ''
  const rankSuffix = c.rank ? ` Rank #${c.rank}.` : ''
  const description =
    `Cotação em tempo real, histórico, rainbow chart e tokenomics de ${c.name} (${c.symbol}). ` +
    (priceBrlLabel ? `Preço atual ${priceBrlLabel}. ` : '') +
    (mcapLabel ? `Market cap ${mcapLabel}.` : '') +
    rankSuffix

  const title = `${c.name} (${c.symbol}) · Preço, rainbow chart e fundamentos | ${brandName}`
  const canonical = `${brandUrl}/crypto/${c.id}`
  const image = c.image ?? `${brandUrl}/og/default.png`

  // JSON-LD: use FinancialProduct since crypto isn't officially a Schema.org
  // supported Thing. Google accepts FinancialProduct for crypto pages.
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: `${c.name} (${c.symbol})`,
    description,
    category: 'Cryptocurrency',
    identifier: c.symbol,
    image,
    url: canonical,
    offers: c.price_brl
      ? {
          '@type': 'Offer',
          priceCurrency: 'BRL',
          price: String(c.price_brl),
          availability: 'https://schema.org/InStock',
        }
      : undefined,
    provider: {
      '@type': 'Organization',
      name: brandName,
      url: brandUrl,
    },
  }

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      // Help Google understand this is a finance/crypto page
      { name: 'keywords', content: `${c.name}, ${c.symbol}, cripto, criptomoeda, cotação, preço, rainbow chart, market cap, ${c.symbol} BRL, ${c.symbol} USD` },
    ],
    link: [{ rel: 'canonical', href: canonical }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(structured),
      },
    ],
  }
})

const chartRangeOptions = [
  { label: '30D', value: '30d' },
  { label: '6M', value: '6m' },
  { label: '1A', value: '1y' },
  { label: '5A', value: '5y' },
  { label: 'Tudo', value: 'full' },
]

// Toggle entre o gráfico de linha (série temporal padrão) e o rainbow
// chart (regressão log com bandas + projeção até 2032). Mesmo padrão
// visual do `/tesouro/[slug]` que alterna preço/taxa.
const chartModeOptions = [
  { label: 'Preço', value: 'price' as const },
  { label: 'Rainbow', value: 'rainbow' as const },
]
const chartMode = ref<'price' | 'rainbow'>('price')

const selectedChartRange = ref<CryptoPriceRange>('1y')
const rawPrices = ref<Awaited<ReturnType<typeof getCryptoPrices>>>([])
const fullPrices = ref<Awaited<ReturnType<typeof getCryptoPrices>>>([])
const isLoadingChart = ref(false)

const chartData = computed<IChartDataPoint[]>(() =>
  rawPrices.value
    .filter((p) => p.price_brl !== null)
    .map((p) => ({
      date: p.price_at,
      value: p.price_brl as number,
      timestamp: new Date(p.price_at).getTime(),
    })),
)

const chartLegend = computed<IChartLegendItem[]>(() => [
  { label: 'Preço (BRL)', color: brand.colors.positive },
])

const rainbowPoints = computed(() =>
  fullPrices.value
    .filter((p) => p.price_brl !== null)
    .map((p) => ({
      date: p.price_at,
      price: p.price_brl as number,
      timestamp: new Date(p.price_at).getTime(),
    })),
)

const rainbowStartYear = computed(() => {
  const first = fullPrices.value[0]
  if (!first) return '2013'
  return first.price_at.slice(0, 4)
})

async function fetchChartData() {
  isLoadingChart.value = true
  try {
    rawPrices.value = await getCryptoPrices(symbol, selectedChartRange.value)
  } catch (err) {
    console.error('crypto chart fetch failed', err)
    rawPrices.value = []
  } finally {
    isLoadingChart.value = false
  }
}

async function fetchRainbowData() {
  if (!crypto.value?.has_rainbow) return
  try {
    fullPrices.value = await getCryptoPrices(symbol, 'full')
  } catch (err) {
    console.error('crypto rainbow fetch failed', err)
    fullPrices.value = []
  }
}

watch(selectedChartRange, () => { fetchChartData() })
onMounted(() => {
  fetchChartData()
  fetchRainbowData()
})

const refreshedLabel = computed(() => {
  if (!crypto.value?.refreshed_at) return null
  const d = new Date(crypto.value.refreshed_at)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

function formatBrl(v: number | null | undefined, opts?: { compact?: boolean }): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: opts?.compact ? 'compact' : 'standard',
    maximumFractionDigits: v >= 1 ? 2 : 6,
  }).format(v)
}

const hasOhlc = computed(() => {
  const o = crypto.value?.ohlc
  return !!o && (o.open_brl !== null || o.close_brl !== null)
})

const tokenomicsMetrics = computed(() => {
  const c = crypto.value
  if (!c) return []
  const emissionPct = (c as any).emission_pct as number | null
  return [
    { label: 'CIRCULANTE', value: formatCompact(c.circulating_supply) + ' ' + c.symbol },
    { label: 'TOTAL', value: formatCompact(c.total_supply) + ' ' + c.symbol },
    {
      label: 'MÁXIMO',
      value: (c as any).infinite_supply ? '∞' : (c.max_supply ? formatCompact(c.max_supply) + ' ' + c.symbol : '—'),
    },
    { label: 'EMISSÃO', value: emissionPct !== null && emissionPct !== undefined ? `${emissionPct.toFixed(2)}%` : '—' },
    { label: 'VALOR TOTAL DILUÍDO (FDV)', value: formatBrl((c as any).fully_diluted_valuation_brl, { compact: true }) },
  ]
})

const marketMetrics = computed(() => {
  const c = crypto.value
  if (!c) return []
  const volChange = (c as any).volume_change_24h_pct as number | null
  const liq = (c as any).liquidity_index as number | null
  const dom = (c as any).market_cap_dominance_pct as number | null
  const pairs = (c as any).num_market_pairs as number | null
  return [
    { label: 'VALOR DE MERCADO', value: formatBrl((c as any).market_cap_brl, { compact: true }), sub: formatUsd(c.market_cap_usd, { compact: true }) + ' USD' },
    { label: 'VOLUME 24H', value: formatBrl((c as any).volume_24h_brl, { compact: true }), sub: formatUsd(c.volume_24h_usd, { compact: true }) + ' USD' },
    {
      label: 'VARIAÇÃO VOLUME',
      value: volChange !== null && volChange !== undefined ? `${volChange >= 0 ? '+' : ''}${volChange.toFixed(2)}%` : '—',
      color: volChange !== null && volChange !== undefined ? (volChange >= 0 ? brand.colors.positive : brand.colors.negative) : undefined,
    },
    { label: 'ÍNDICE DE LIQUIDEZ', value: liq !== null && liq !== undefined ? `${liq.toFixed(2)}%` : '—' },
    { label: 'DOMINÂNCIA', value: dom !== null && dom !== undefined ? `${dom.toFixed(2)}%` : '—' },
    { label: 'PARES DE MERCADO', value: pairs !== null && pairs !== undefined ? pairs.toLocaleString('pt-BR') : '—' },
    { label: 'RANK', value: c.rank ? `#${c.rank}` : '—' },
    {
      label: 'VARIAÇÃO 30D',
      value: formatPct(c.change_30d_pct),
      color: pctColor(c.change_30d_pct),
    },
  ]
})

const ohlcMetrics = computed(() => {
  const c = crypto.value
  if (!c?.ohlc) return []
  const o = c.ohlc as any
  return [
    { label: 'ABERTURA', value: formatBrl(o.open_brl) },
    { label: 'FECHAMENTO', value: formatBrl(o.close_brl) },
    {
      label: 'VARIAÇÃO',
      value: o.variation_pct !== null && o.variation_pct !== undefined ? `${o.variation_pct >= 0 ? '+' : ''}${o.variation_pct.toFixed(2)}%` : '—',
      color: o.variation_pct !== null && o.variation_pct !== undefined ? (o.variation_pct >= 0 ? brand.colors.positive : brand.colors.negative) : undefined,
    },
    { label: 'VOLUME', value: formatBrl(o.volume_brl, { compact: true }) },
    { label: 'MÁXIMO', value: formatBrl(o.high_brl) },
    { label: 'MÍNIMO', value: formatBrl(o.low_brl) },
    { label: 'AMPLITUDE', value: formatBrl(o.amplitude_brl) },
    { label: 'VOLATILIDADE', value: o.volatility_pct !== null && o.volatility_pct !== undefined ? `${o.volatility_pct.toFixed(2)}%` : '—' },
  ]
})

const windowMetrics = computed(() => {
  const c = crypto.value
  if (!c) return []
  const min52 = (c as any).min_52w_brl as number | null
  const max52 = (c as any).max_52w_brl as number | null
  const minMo = (c as any).min_month_brl as number | null
  const maxMo = (c as any).max_month_brl as number | null
  const app12 = (c as any).appreciation_12m_pct as number | null
  const appMo = (c as any).appreciation_month_pct as number | null
  return [
    { label: 'MIN 52 SEMANAS', value: formatBrl(min52) },
    { label: 'MAX 52 SEMANAS', value: formatBrl(max52) },
    { label: 'MIN MÊS', value: formatBrl(minMo) },
    { label: 'MAX MÊS', value: formatBrl(maxMo) },
    {
      label: 'VALORIZAÇÃO 12M',
      value: app12 !== null && app12 !== undefined ? `${app12 >= 0 ? '+' : ''}${app12.toFixed(2)}%` : '—',
      color: app12 !== null && app12 !== undefined ? (app12 >= 0 ? brand.colors.positive : brand.colors.negative) : undefined,
    },
    {
      label: 'VALORIZAÇÃO MÊS',
      value: appMo !== null && appMo !== undefined ? `${appMo >= 0 ? '+' : ''}${appMo.toFixed(2)}%` : '—',
      color: appMo !== null && appMo !== undefined ? (appMo >= 0 ? brand.colors.positive : brand.colors.negative) : undefined,
    },
  ]
})

function formatUsd(v: number | null | undefined, opts?: { compact?: boolean }): string {
  return fmtUsd(v ?? null, opts)
}

function formatPct(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(2)}%`
}

function pctColor(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return brand.colors.textMuted
  return v >= 0 ? brand.colors.positive : brand.colors.negative
}

function formatCompact(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(v)
}

definePageMeta({ isPublicRoute: true })
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
</style>
