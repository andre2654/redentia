<template>
  <NuxtLayout :name="layoutName">
    <!-- Variant router: mentor (Primo Rico) / showtime (Me Poupe) / default -->
    <TesouroMentor
      v-if="brand.assetPage?.variant === 'mentor'"
      :data="data"
      :paper-name="prettyName(data?.name ?? slug)"
      :indexer-label="indexerLabel"
      :maturity-date="formatMaturityLong(data?.maturity_date)"
      :format-money="formatMoney"
    />

    <TesouroShowtime
      v-else-if="brand.assetPage?.variant === 'showtime'"
      :data="data"
      :paper-name="prettyName(data?.name ?? slug)"
      :indexer-label="indexerLabel"
      :maturity-date="formatMaturityLong(data?.maturity_date)"
      :format-money="formatMoney"
    />

    <div v-else class="relative z-10 flex flex-col px-4 pt-4">
      <div class="flex flex-col">
        <!-- Ticker header bar (minimalista: indexer badge + nome + taxa + stats) -->
        <section class="border-b pb-8" :style="{ borderColor: 'var(--brand-border)' }">
          <MoleculesTickerHeaderBar
            :ticker="indexerLabel"
            :name="prettyName(data?.name ?? slug)"
            :badge="`PRAZO ${yearsToMaturity}`"
            :badge-color="indexerColor"
            price-label="Taxa bruta a.a."
            :price-value="data?.rate ? `${data.rate}%` : '—'"
            :stats="tesouroStats"
            :sparkline="tesouroSparkline.line ? { line: tesouroSparkline.line, area: tesouroSparkline.area, color: indexerColor } : undefined"
            sparkline-label="Histórico"
          />
        </section>

        <!-- Price register bigger version -->
        <section class="border-b py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <header class="mb-4 flex flex-col gap-1">
            <h2 class="font-light" :style="{ color: 'var(--brand-text)', fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
              Preços do Tesouro Nacional
            </h2>
            <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
              &gt; COMPRA · VENDA · ATUALIZADO DIARIAMENTE
            </p>
          </header>
          <div
            class="grid grid-cols-1 gap-px border md:grid-cols-2"
            :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
          >
            <div class="flex flex-col gap-2 px-6 py-5" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">COMPRA</span>
              <span class="font-mono-tab text-3xl font-light tabular-nums md:text-4xl" :style="{ color: 'var(--brand-positive)' }">
                {{ formatMoney(data?.price_buy) }}
              </span>
            </div>
            <div class="flex flex-col gap-2 px-6 py-5" :style="{ backgroundColor: 'var(--brand-surface)' }">
              <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">VENDA</span>
              <span class="font-mono-tab text-3xl font-light tabular-nums md:text-4xl" :style="{ color: 'var(--brand-text)' }">
                {{ formatMoney(data?.price_sell) }}
              </span>
            </div>
          </div>
        </section>

        <!-- Price history chart -->
        <section class="border-b py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <div ref="tesouroChartRef" class="mt-0">
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLegend"
              :height="320"
              :loading="isLoadingChart"
              :currency="chartMode === 'rate' ? '%' : 'R$'"
            >
              <template #toolbar>
                <AtomsGraphToolbar
                  :show-fullscreen="true"
                  @screenshot="tesouroScreenshotRef?.open()"
                  @fullscreen="tesouroFullscreenRef?.open()"
                >
                  <template #extras>
                    <span
                      class="font-mono-tab text-[11px] uppercase tracking-[0.12em]"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >
                      {{ chartMode === 'rate' ? 'Histórico de rentabilidade' : 'Histórico de cotação' }}
                    </span>
                    <div
                      class="inline-flex items-center border font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                      :style="{ borderColor: 'var(--brand-border)' }"
                      role="group"
                      aria-label="Eixo do gráfico"
                    >
                      <button
                        v-for="opt in chartModeOptions"
                        :key="opt.value"
                        :aria-label="`Mudar eixo para ${opt.label}`"
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
          </div>
        </section>

        <!-- Screenshot modal -->
        <AtomsGraphScreenshotModal
          ref="tesouroScreenshotRef"
          :title="indexerLabel"
          :subtitle="prettyName(data?.name ?? slug)"
          :price-label="`${data?.rate ?? '—'}%`"
          :is-positive="true"
          :avatar-text="indexerLabel.slice(0, 3)"
          :capture-target="() => (tesouroChartRef as any)?.querySelector?.('[data-chart-capture-root]') ?? null"
        />

        <!-- Fullscreen chart dialog -->
        <AtomsGraphFullscreenDialog
          ref="tesouroFullscreenRef"
          :title="`${indexerLabel}, ${prettyName(data?.name ?? slug)}`"
          :subtitle="'Renda fixa · ' + formatMaturityLong(data?.maturity_date)"
          :is-positive="true"
        >
          <template #chart="{ expandedHeight }">
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLegend"
              :height="expandedHeight"
              :mobile-height="expandedHeight"
              :loading="isLoadingChart"
              :currency="chartMode === 'rate' ? '%' : 'R$'"
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

        <!-- AI Interpretation -->
        <section v-if="interpretations.length" class="border-b py-8" :style="{ borderColor: 'var(--brand-border)' }">
          <header class="mb-4 flex items-center gap-2">
            <IconAi class="h-3 w-3" :style="{ fill: 'var(--brand-primary)' }" />
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: 'var(--brand-primary)' }">
              Interpretações IA
            </span>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
              &gt; LEITURA DO TÍTULO
            </span>
          </header>
          <div class="flex flex-col gap-px border" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }">
            <div
              v-for="(line, idx) in interpretations"
              :key="idx"
              class="flex items-start gap-3 px-5 py-3"
              :style="{ backgroundColor: 'var(--brand-surface)' }"
            >
              <p class="text-sm leading-relaxed" :style="{ color: 'var(--brand-text)' }" v-html="line" />
            </div>
          </div>
        </section>

        <!-- AI ASSISTANT (same as asset page) -->
        <section v-if="!authStore.isAuthenticated" class="border-b py-12" :style="{ borderColor: 'var(--brand-border)' }">
          <header class="mb-6 flex flex-col gap-1">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: 'var(--brand-primary)' }">
              Assistente IA
            </span>
            <h2 class="font-light" :style="{ color: 'var(--brand-text)', fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
              Dúvidas sobre <span class="italic" :style="{ color: 'var(--brand-primary)' }">este título</span>?
            </h2>
            <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
              &gt; PERGUNTE QUALQUER COISA · RESPOSTA EM ~3 SEGUNDOS
            </p>
          </header>

          <div class="mb-6 grid gap-px border sm:grid-cols-3" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }">
            <NuxtLink
              v-for="(item, idx) in suggestionCards"
              :key="idx"
              to="/auth/login"
              class="group flex flex-col gap-2 p-5 transition-colors hover:brightness-125"
              :style="{ backgroundColor: 'var(--brand-surface)' }"
            >
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-primary)' }">
                Pergunta {{ idx + 1 }}
              </span>
              <p class="text-base font-medium leading-snug" :style="{ color: 'var(--brand-text)' }">
                <span :style="{ color: 'var(--brand-primary)' }">&gt;</span> {{ item.text }}
              </p>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
                {{ item.desc }}
              </span>
              <span class="mt-auto flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">
                PERGUNTAR →
              </span>
            </NuxtLink>
          </div>

          <div class="flex flex-col items-center gap-4 border p-6 md:p-8" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
            <UButton
              to="/auth/login"
              size="xl"
              class="group w-full font-mono-tab font-semibold uppercase tracking-wider transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90 sm:w-auto"
              :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-background)' }"
            >
              <template #leading>
                <span class="font-mono-tab text-[10px] opacity-70">[F3]</span>
              </template>
              {{ brand.ai?.ctaButton ?? 'Entrar gratuitamente' }}
            </UButton>
            <p class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: 'var(--brand-text-muted)' }">
              <UIcon name="i-lucide-shield-check" class="h-3 w-3" />
              GRATUITO · SEM CARTAO · RESPOSTA EM SEGUNDOS
            </p>
          </div>
        </section>

        <!-- Embedded AI chat removed — use the dedicated /help page
             (CTA above redirects via QuickSearch). -->
        <div v-else />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { indexerBadge, useTesouroService, type TesouroPriceRange } from '~/services/tesouro'
import type { IChartDataPoint, IChartLegendItem } from '~/types/chart'

const route = useRoute()
const brand = useBrand()
const authStore = useAuthStore()
const slug = String(route.params.slug)

const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

const { getTesouro, getTesouroPrices } = useTesouroService()

const { data, error } = await useAsyncData(`tesouro-${slug}`, () => getTesouro(slug))

const chartRangeOptions = [
  { label: '30D', value: '30d' },
  { label: '6M', value: '6m' },
  { label: '1A', value: '1y' },
  { label: '5A', value: '5y' },
  { label: 'Tudo', value: 'full' },
]

const chartModeOptions = [
  { label: 'Preço', value: 'price' as const },
  { label: 'Taxa', value: 'rate' as const },
]

const selectedChartRange = ref<TesouroPriceRange>('1y')
const chartMode = ref<'price' | 'rate'>('price')

// Chart container ref + screenshot modal ref (toolbar integration)
const tesouroChartRef = ref<HTMLElement | null>(null)
const tesouroScreenshotRef = ref<{ open: () => void; close: () => void } | null>(null)
const tesouroFullscreenRef = ref<{ open: () => void; close: () => void } | null>(null)

// Raw series kept as-is; chartData is a derived projection onto the selected
// axis (sell_price when mode=price, sell_rate when mode=rate). Swapping modes
// doesn't require a refetch.
const rawPrices = ref<Awaited<ReturnType<typeof getTesouroPrices>>>([])
const isLoadingChart = ref(false)

const chartData = computed<IChartDataPoint[]>(() => {
  return rawPrices.value
    .map((p) => {
      const value = chartMode.value === 'rate' ? p.sell_rate : p.sell_price
      if (value === null) return null
      return {
        date: p.price_at,
        value,
        timestamp: new Date(p.price_at).getTime(),
      }
    })
    .filter((p): p is IChartDataPoint => p !== null)
})

const chartLegend = computed<IChartLegendItem[]>(() => [
  {
    label: chartMode.value === 'rate' ? 'Taxa de venda (% a.a.)' : 'Valor de venda',
    color: 'var(--brand-positive)',
  },
])

// Hero dashboard sparkline (last 30 points)
const tesouroSparkline = computed(() => {
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

async function fetchChartData() {
  isLoadingChart.value = true
  try {
    rawPrices.value = await getTesouroPrices(slug, selectedChartRange.value)
  } catch (err) {
    console.error('tesouro chart fetch failed', err)
    rawPrices.value = []
  } finally {
    isLoadingChart.value = false
  }
}

watch(selectedChartRange, () => { fetchChartData() })
onMounted(() => { fetchChartData() })

if (error.value || !data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Título não encontrado',
    fatal: true,
  })
}

useHead(() => {
  const t = data.value
  const brandCtx = brand
  if (!t) return { title: `${slug} · Tesouro Direto | ${brandCtx.name}` }

  const title = `${t.name} · Tesouro Direto | ${brandCtx.name}`
  const priceLabel = t.price_buy != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.price_buy)
    : ''
  const rate = t.rate || (t.rate_numeric != null ? `${t.rate_numeric.toFixed(2)}%` : '')
  const maturity = t.maturity_date ? new Date(t.maturity_date).toLocaleDateString('pt-BR') : ''
  const description = `Cotação, taxa e vencimento do ${t.name}. ` +
    (rate ? `Taxa atual ${rate}. ` : '') +
    (priceLabel ? `Preço de compra ${priceLabel}. ` : '') +
    (maturity ? `Vencimento em ${maturity}.` : '')

  const canonical = `${brandCtx.url}/tesouro/${t.slug}`
  const structured = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: t.name,
    description,
    category: 'Government Bond',
    identifier: t.slug,
    url: canonical,
    offers: t.price_buy
      ? { '@type': 'Offer', priceCurrency: 'BRL', price: String(t.price_buy), availability: 'https://schema.org/InStock' }
      : undefined,
    provider: { '@type': 'Organization', name: brandCtx.name, url: brandCtx.url },
  }

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:type', content: 'article' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'keywords', content: `${t.name}, Tesouro Direto, ${t.indexer ?? ''}, renda fixa, investimento, ${t.slug}` },
    ],
    link: [{ rel: 'canonical', href: canonical }],
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(structured) }],
  }
})

const indexerLabel = computed(() => indexerBadge(data.value?.indexer ?? null))

const indexerColor = computed(() => {
  const b = indexerLabel.value
  if (b === 'IPCA+') return 'var(--brand-primary)'
  if (b === 'SELIC') return 'var(--brand-positive)'
  if (b === 'PRÉ') return 'var(--brand-text)'
  return 'var(--brand-text-muted)'
})

const yearsToMaturity = computed(() => {
  if (!data.value?.maturity_date) return '—'
  const mat = new Date(data.value.maturity_date)
  const now = new Date()
  const months = (mat.getFullYear() - now.getFullYear()) * 12 + (mat.getMonth() - now.getMonth())
  if (months < 0) return 'VENCIDO'
  if (months < 12) return `${months}M`
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  return remMonths === 0 ? `${years}A` : `${years}A${remMonths}M`
})

const maturityShort = computed(() => {
  if (!data.value?.maturity_date) return '—'
  try {
    const d = new Date(data.value.maturity_date)
    return d.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' })
  } catch {
    return '—'
  }
})

// Stats inline pro TickerHeaderBar (4 cells de COMPRA/VENDA/VENCIMENTO/REF)
const tesouroStats = computed(() => {
  const d = data.value as any
  return [
    { label: 'COMPRA', value: formatMoney(d?.price_buy), accent: 'var(--brand-positive)' },
    { label: 'VENDA', value: formatMoney(d?.price_sell) },
    { label: 'VENCIMENTO', value: maturityShort.value },
    {
      label: d?.reference_rate_label || 'INDEXADOR',
      value: d?.reference_rate != null ? `${Number(d.reference_rate).toFixed(2)}%` : indexerLabel.value,
      accent: indexerColor.value,
    },
  ]
})

const refreshedLabel = computed(() => {
  if (!data.value?.refreshed_at) return ''
  try {
    const d = new Date(data.value.refreshed_at)
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).toUpperCase()
  } catch {
    return ''
  }
})

const suggestionCards = computed(() => [
  { text: `Vale a pena investir em ${data.value?.name ?? 'Tesouro'}?`, desc: 'Análise de viabilidade' },
  { text: 'Qual retorno real considerando IR?', desc: 'Cálculo líquido' },
  { text: 'Posso vender antes do vencimento?', desc: 'Marcação a mercado' },
])

const chatSuggestions = computed(() => [
  `Me dê um relatório completo sobre ${data.value?.name ?? 'este título'}`,
  `Por que ${indexerLabel.value} faz sentido no momento atual?`,
  'Qual a rentabilidade líquida após IR e inflação?',
])

const interpretations = computed<string[]>(() => {
  const d = data.value
  if (!d) return []
  const lines: string[] = []
  const accent = (t: string) => `<strong style="color: var(--brand-primary)">${t}</strong>`
  const pos = (t: string) => `<strong style="color: var(--brand-positive)">${t}</strong>`

  const rateNum = d.rate_numeric
  const idx = indexerLabel.value

  if (idx === 'IPCA+' && rateNum !== null) {
    lines.push(
      `Paga ${accent('IPCA + ' + rateNum.toFixed(2) + '%')} ao ano, garante retorno real acima da inflação oficial do Brasil até o vencimento.`,
    )
    if (rateNum >= 7) {
      lines.push(`Taxa real de ${pos(rateNum.toFixed(2) + '%')} está ${pos('acima da média histórica')} (~6%), momento favorável pra travar retorno real alto.`)
    }
  } else if (idx === 'PRÉ' && rateNum !== null) {
    lines.push(
      `Taxa prefixada de ${accent(rateNum.toFixed(2) + '%')} ao ano, você sabe hoje exatamente quanto receberá no vencimento, mas perde se a inflação subir forte.`,
    )
  } else if (idx === 'SELIC' && rateNum !== null) {
    lines.push(
      `Rentabilidade acompanha a Selic (${d.reference_rate?.toFixed(2) ?? '—'}%) ${rateNum !== 0 ? accent(' + ' + rateNum.toFixed(2) + '%') : 'sem spread adicional'}, ideal pra reserva de emergência e investimentos de curto prazo.`,
    )
  }

  if (d.maturity_date) {
    const mat = new Date(d.maturity_date)
    const years = (mat.getFullYear() - new Date().getFullYear())
    if (years >= 20) {
      lines.push(`Vencimento ${accent('longo (' + years + ' anos)')} amplifica ganhos com marcação a mercado caso os juros caiam, mas também magnifica perdas no sentido oposto.`)
    } else if (years >= 10) {
      lines.push(`Vencimento ${accent('médio a longo (' + years + ' anos)')} balanceia travamento de taxa com sensibilidade moderada à marcação a mercado.`)
    } else if (years >= 3) {
      lines.push(`Vencimento ${accent('curto a médio (' + years + ' anos)')}, menor volatilidade de preço e boa opção pra metas de médio prazo.`)
    }
  }

  lines.push(
    `Títulos do Tesouro têm ${pos('garantia do Tesouro Nacional')}, considerada a mais segura do mercado brasileiro. Rentabilidade sujeita a IR regressivo (22.5% a 15%).`,
  )

  return lines
})

function prettyName(raw: string): string {
  return raw.replace(/^Tesouro\s+/i, '').replace(/\s+\|.*$/, '')
}

function formatMoney(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v)
}

function formatMaturityLong(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  } catch {
    return String(iso)
  }
}
</script>
