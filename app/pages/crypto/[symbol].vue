<template>
  <NuxtLayout :name="layoutName">
    <!-- Variant router: tenants podem trocar layout inteiro da page de crypto
         via `assetPage.variant`. Default = Bloomberg-terminal Redentia. -->
    <CryptoMentor
      v-if="brand.assetPage?.variant === 'mentor'"
      :crypto="crypto"
      :symbol-upper="symbol.toUpperCase()"
      :format-price-number="formatPriceNumberCrypto"
    >
      <template #chart-controls>
        <MoleculesPeriodSelector v-model="selectedTimeRange" :loading="isLoadingChart" />
      </template>
      <template #chart>
        <AtomsGraphLine
          :data="chartData"
          :legend="`${(crypto?.symbol ?? symbol).toString().toUpperCase()} · R$`"
          :height="360"
          :loading="isLoadingChart"
        />
      </template>
    </CryptoMentor>

    <CryptoShowtime
      v-else-if="brand.assetPage?.variant === 'showtime'"
      :crypto="crypto"
      :symbol-upper="symbol.toUpperCase()"
      :format-price-number="formatPriceNumberCrypto"
    >
      <template #chart-controls>
        <MoleculesPeriodSelector v-model="selectedTimeRange" :loading="isLoadingChart" />
      </template>
      <template #chart>
        <AtomsGraphLine
          :data="chartData"
          :legend="`${(crypto?.symbol ?? symbol).toString().toUpperCase()} · R$`"
          :height="320"
          :loading="isLoadingChart"
        />
      </template>
    </CryptoShowtime>

    <div v-else class="relative z-10 flex flex-col px-4 pt-4">
      <div class="flex flex-col">
        <!-- Ticker header bar (minimalista: logo + ticker + stats inline + sparkline) -->
        <section class="border-b pb-8" :style="{ borderColor: 'var(--brand-border)' }">
          <MoleculesTickerHeaderBar
            :logo="(crypto as any)?.image || undefined"
            :ticker="(crypto?.symbol ?? symbol).toString().toUpperCase()"
            :name="crypto?.name ?? symbol"
            :badge="crypto?.rank ? `#${crypto.rank}` : 'CRYPTO'"
            price-label="Preço"
            price-unit="R$"
            :price-value="formatPriceNumberCrypto((crypto as any)?.price_brl ?? null)"
            :change-percent="crypto?.change_24h_pct"
            change-label="24h"
            :stats="cryptoStats"
            :sparkline="cryptoSparkline.line ? { line: cryptoSparkline.line, area: cryptoSparkline.area, color: cryptoAccent } : undefined"
            sparkline-label="30D"
          />
        </section>

        <!-- Chart section (price ou rainbow, toggle no mesmo padrão do tesouro) -->
        <section class="border-b py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <div ref="cryptoChartRef" class="mt-0">
            <!-- Rainbow mode: toolbar sibling above (AtomsCryptoRainbow não tem slot #toolbar) -->
            <template v-if="chartMode === 'rainbow' && crypto?.has_rainbow">
              <div class="mb-4">
                <AtomsGraphToolbar @screenshot="cryptoScreenshotRef?.open()">
                  <template #extras>
                    <span
                      class="font-mono-tab text-[11px] uppercase tracking-[0.12em]"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >
                      Rainbow chart
                    </span>
                    <div
                      class="inline-flex items-center border font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                      :style="{ borderColor: 'var(--brand-border)' }"
                      role="group"
                      aria-label="Modo do gráfico"
                    >
                      <button
                        v-for="opt in chartModeOptions"
                        :key="opt.value"
                        :aria-label="`Mudar gráfico para ${opt.label}`"
                        :aria-pressed="chartMode === opt.value"
                        type="button"
                        class="inline-flex h-8 items-center justify-center px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                        :style="{
                          backgroundColor: chartMode === opt.value ? 'var(--brand-primary)' : 'transparent',
                          color: chartMode === opt.value ? 'var(--brand-background)' : 'var(--brand-text-muted)',
                        }"
                        @click="chartMode = opt.value"
                      >
                        {{ opt.label }}
                      </button>
                    </div>
                  </template>
                </AtomsGraphToolbar>
              </div>
              <AtomsCryptoRainbow
                :points="rainbowPoints"
                :coin-id="crypto.id"
                :height="480"
                currency="BRL"
              />
            </template>

            <!-- Price mode: toolbar vai dentro do slot #toolbar do AtomsGraphLine -->
            <template v-else>
              <AtomsGraphLine
                :data="chartData"
                :legend="chartLegend"
                :height="320"
                :loading="isLoadingChart"
                currency="R$"
              >
                <template #toolbar>
                  <AtomsGraphToolbar
                    :show-fullscreen="true"
                    @screenshot="cryptoScreenshotRef?.open()"
                    @fullscreen="cryptoFullscreenRef?.open()"
                  >
                    <template #extras>
                      <span
                        class="font-mono-tab text-[11px] uppercase tracking-[0.12em]"
                        :style="{ color: 'var(--brand-text-muted)' }"
                      >
                        Histórico de cotação
                      </span>
                      <div
                        v-if="crypto?.has_rainbow"
                        class="inline-flex items-center border font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                        :style="{ borderColor: 'var(--brand-border)' }"
                        role="group"
                        aria-label="Modo do gráfico"
                      >
                        <button
                          v-for="opt in chartModeOptions"
                          :key="opt.value"
                          :aria-label="`Mudar gráfico para ${opt.label}`"
                          :aria-pressed="chartMode === opt.value"
                          type="button"
                          class="inline-flex h-8 items-center justify-center px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
                          :style="{
                            backgroundColor: chartMode === opt.value ? 'var(--brand-primary)' : 'transparent',
                            color: chartMode === opt.value ? 'var(--brand-background)' : 'var(--brand-text-muted)',
                          }"
                          @click="chartMode = opt.value"
                        >
                          {{ opt.label }}
                        </button>
                      </div>
                    </template>
                    <template #period>
                      <MoleculesPeriodSelector
                        v-model="selectedChartRange"
                        :options="chartRangeOptions"
                        :loading="isLoadingChart"
                      />
                    </template>
                  </AtomsGraphToolbar>
                </template>
              </AtomsGraphLine>
              <p v-if="!isLoadingChart && chartData.length === 0" class="mt-4 text-sm" :style="{ color: 'var(--brand-text-muted)' }">
                Histórico não disponível para essa cripto. Hoje só BTC, ETH e SOL têm série histórica completa.
              </p>
            </template>
          </div>
        </section>

        <!-- Screenshot modal -->
        <AtomsGraphScreenshotModal
          ref="cryptoScreenshotRef"
          :title="(crypto?.symbol ?? symbol).toString().toUpperCase()"
          :subtitle="crypto?.name ?? symbol"
          :price-label="`R$ ${formatPriceNumberCrypto((crypto as any)?.price_brl ?? null)}`"
          :change-label="`${cryptoIsPositive ? '+' : ''}${Number(crypto?.change_24h_pct ?? 0).toFixed(2)}%`"
          :is-positive="cryptoIsPositive"
          :avatar-text="(crypto?.symbol ?? symbol).toString().slice(0, 3).toUpperCase()"
          :capture-target="() => (cryptoChartRef as any)?.querySelector?.('[data-chart-capture-root]') ?? null"
        />

        <!-- Fullscreen chart dialog -->
        <AtomsGraphFullscreenDialog
          ref="cryptoFullscreenRef"
          :title="crypto?.name ?? symbol"
          :subtitle="(crypto?.symbol?.toUpperCase() ?? symbol) + (crypto?.rank ? ' · #' + crypto.rank : '')"
          :change-label="`${cryptoIsPositive ? '+' : ''}${Number(crypto?.change_24h_pct || 0).toFixed(2)}%`"
          :is-positive="cryptoIsPositive"
        >
          <template #chart="{ expandedHeight }">
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLegend"
              :height="expandedHeight"
              :mobile-height="expandedHeight"
              :loading="isLoadingChart"
              currency="R$"
            >
              <template #toolbar>
                <AtomsGraphToolbar
                  :show-fullscreen="false"
                  :show-screenshot="false"
                >
                  <template #period>
                    <MoleculesPeriodSelector
                      v-model="selectedChartRange"
                      :options="chartRangeOptions"
                      :loading="isLoadingChart"
                    />
                  </template>
                </AtomsGraphToolbar>
              </template>
            </AtomsGraphLine>
          </template>
        </AtomsGraphFullscreenDialog>

        <!-- Tokenomics -->
        <section class="border-b py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <div class="mb-4 flex flex-col gap-1">
            <h2 class="text-xl font-medium md:text-2xl" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.4px' }">
              Tokenomics
            </h2>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
              &gt; SUPPLY · EMISSÃO · VALOR TOTAL DILUÍDO
            </span>
          </div>
          <div
            class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-5"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
          >
            <div v-for="m in tokenomicsMetrics" :key="m.label" class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-primary)' }">{{ m.label }}</span>
              <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: 'var(--brand-text)' }">{{ m.value }}</span>
              <span v-if="m.sub" class="font-mono-tab text-[10px]" :style="{ color: 'var(--brand-text-muted)' }">{{ m.sub }}</span>
            </div>
          </div>
        </section>

        <!-- Indicadores de Mercado -->
        <section class="border-b py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <div class="mb-4 flex flex-col gap-1">
            <h2 class="text-xl font-medium md:text-2xl" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.4px' }">
              Indicadores de mercado
            </h2>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
              &gt; VALOR DE MERCADO · VOLUME · LIQUIDEZ · DOMINÂNCIA
            </span>
          </div>
          <div
            class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-4"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
          >
            <div v-for="m in marketMetrics" :key="m.label" class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-primary)' }">{{ m.label }}</span>
              <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: m.color ?? 'var(--brand-text)' }">{{ m.value }}</span>
              <span v-if="m.sub" class="font-mono-tab text-[10px]" :style="{ color: 'var(--brand-text-muted)' }">{{ m.sub }}</span>
            </div>
          </div>
        </section>

        <!-- Resumo diário -->
        <section v-if="hasOhlc" class="border-b py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <div class="mb-4 flex flex-col gap-1">
            <h2 class="text-xl font-medium md:text-2xl" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.4px' }">
              Resumo diário
            </h2>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
              &gt; OHLC · AMPLITUDE · VOLATILIDADE INTRADIÁRIA
            </span>
          </div>
          <div
            class="grid grid-cols-2 gap-px border md:grid-cols-4"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
          >
            <div v-for="m in ohlcMetrics" :key="m.label" class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-primary)' }">{{ m.label }}</span>
              <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: m.color ?? 'var(--brand-text)' }">{{ m.value }}</span>
              <span v-if="m.sub" class="font-mono-tab text-[10px]" :style="{ color: 'var(--brand-text-muted)' }">{{ m.sub }}</span>
            </div>
          </div>
        </section>

        <!-- 52 semanas / Valorização -->
        <section class="border-b py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <div class="mb-4 flex flex-col gap-1">
            <h2 class="text-xl font-medium md:text-2xl" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.4px' }">
              Faixa de 52 semanas
            </h2>
          </div>
          <div
            class="grid grid-cols-2 gap-px border md:grid-cols-3 lg:grid-cols-6"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
          >
            <div v-for="m in windowMetrics" :key="m.label" class="flex flex-col gap-1 px-5 py-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-primary)' }">{{ m.label }}</span>
              <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: m.color ?? 'var(--brand-text)' }">{{ m.value }}</span>
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

// Chart container ref + screenshot modal ref (toolbar integration)
const cryptoChartRef = ref<HTMLElement | null>(null)
const cryptoScreenshotRef = ref<{ open: () => void; close: () => void } | null>(null)
const cryptoFullscreenRef = ref<{ open: () => void; close: () => void } | null>(null)

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
  { label: 'Preço (BRL)', color: 'var(--brand-positive)' },
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
      color: volChange !== null && volChange !== undefined ? (volChange >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)') : undefined,
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
      color: o.variation_pct !== null && o.variation_pct !== undefined ? (o.variation_pct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)') : undefined,
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
      color: app12 !== null && app12 !== undefined ? (app12 >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)') : undefined,
    },
    {
      label: 'VALORIZAÇÃO MÊS',
      value: appMo !== null && appMo !== undefined ? `${appMo >= 0 ? '+' : ''}${appMo.toFixed(2)}%` : '—',
      color: appMo !== null && appMo !== undefined ? (appMo >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)') : undefined,
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
  if (v === null || v === undefined || !Number.isFinite(v)) return 'var(--brand-text-muted)'
  return v >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
}

function formatCompact(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(v)
}

// Hero dashboard card: gradient tint + accent + sparkline (last 30 points)
const cryptoIsPositive = computed(() => Number(crypto.value?.change_24h_pct ?? 0) >= 0)
const cryptoAccent = computed(() =>
  cryptoIsPositive.value ? 'var(--brand-positive)' : 'var(--brand-negative)',
)

// Stats inline pro TickerHeaderBar (4 cells)
const cryptoStats = computed(() => {
  const c = crypto.value as any
  if (!c) return []
  return [
    { label: 'HIGH 24H', value: formatBrl(c.ohlc?.high_brl ?? null), accent: 'var(--brand-positive)' },
    { label: 'LOW 24H', value: formatBrl(c.ohlc?.low_brl ?? null), accent: 'var(--brand-negative)' },
    { label: 'MKT CAP', value: formatBrl(c.market_cap_brl ?? null, { compact: true }) },
    { label: 'VOL 24H', value: formatBrl(c.volume_24h_brl ?? null, { compact: true }) },
    { label: '7D', value: formatPct(c.change_7d_pct), accent: pctColor(c.change_7d_pct) },
    { label: '30D', value: formatPct(c.change_30d_pct), accent: pctColor(c.change_30d_pct) },
  ]
})

const cryptoSparkline = computed(() => {
  const full = chartData.value || []
  const slice = full.slice(-30)
  const points = slice.map((p) => p.value).filter((v): v is number => Number.isFinite(v))
  const width = 120
  const height = 32
  if (points.length < 2) return { points, width, height, line: '', area: '' }
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const stepX = width / (points.length - 1)
  const coords = points.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = `M ${coords.join(' L ')}`
  const area = `${line} L ${width},${height} L 0,${height} Z`
  return { points, width, height, line, area }
})

// Display-optimized formatter for the giant hero price (splits BRL sign
// from the number so we can tabular-nums the number and use smaller
// weight on the "R$" prefix).
function formatPriceNumberCrypto(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  // For very small prices (altcoins), show more decimals
  const fractionDigits = v < 1 ? 6 : v < 100 ? 2 : 2
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  }).format(v)
}

definePageMeta({ isPublicRoute: true })
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
</style>
