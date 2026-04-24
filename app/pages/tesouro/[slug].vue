<template>
  <NuxtLayout :name="layoutName">
    <div class="relative z-10 flex flex-col px-4 pt-4">
      <div class="flex flex-col">
        <!-- Terminal status bar — mesma linguagem da asset page -->
        <div
          class="-mx-4 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-t px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span class="flex items-center gap-1.5" :style="{ color: brand.colors.primary }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
            </span>
            [TESOURO.QUOTE]
          </span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.text }">{{ indexerLabel }}</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span class="truncate max-w-[320px]" :style="{ color: brand.colors.textMuted }">{{ data?.name ?? slug }}</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.textMuted }">TESOURO NACIONAL · BR</span>
          <span v-if="refreshedLabel" :style="{ color: brand.colors.border }">·</span>
          <span v-if="refreshedLabel" :style="{ color: brand.colors.textMuted }">UPDATE {{ refreshedLabel }}</span>
        </div>

        <!-- Hero Section 3-col: identidade · taxa bruta · session stats -->
        <section class="border-b pb-8" :style="{ borderColor: brand.colors.border }">
          <div class="grid gap-6 md:grid-cols-12 md:items-end">
            <!-- Col 1: indexer badge + nome -->
            <div class="flex items-center gap-4 md:col-span-4">
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center border font-mono-tab text-sm font-bold"
                :style="{
                  borderColor: indexerColor,
                  color: indexerColor,
                  backgroundColor: brand.colors.surface,
                }"
              >
                {{ indexerLabel }}
              </div>
              <div class="flex min-w-0 flex-col gap-1">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                  [SYMBOL]
                </span>
                <h1
                  class="font-mono-tab text-3xl font-bold tracking-tight md:text-4xl"
                  :style="{ color: brand.colors.text }"
                >
                  {{ indexerLabel }} <span class="text-lg font-semibold md:text-xl" :style="{ color: brand.colors.text }">— {{ prettyName(data?.name ?? slug) }}</span>
                </h1>
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                  &gt; RENDA FIXA · {{ formatMaturityLong(data?.maturity_date) }}
                </span>
              </div>
            </div>

            <!-- Col 2: Taxa bruta (gigante, mono) -->
            <div class="flex flex-col gap-1 md:col-span-4">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [GROSS.RATE]
              </span>
              <div class="flex items-baseline gap-2">
                <span
                  class="font-mono-tab text-5xl font-bold tabular-nums md:text-6xl"
                  :style="{ color: brand.colors.primary }"
                >
                  {{ data?.rate ?? '—' }}
                </span>
                <span
                  class="font-mono-tab text-[10px] font-normal opacity-60"
                  :style="{ color: brand.colors.textMuted }"
                >
                  % A.A.
                </span>
              </div>
              <div class="flex items-center gap-3 font-mono-tab text-sm">
                <span class="flex items-center gap-1 tabular-nums" :style="{ color: brand.colors.text }">
                  <UIcon name="i-lucide-calendar" class="h-3 w-3" />
                  PRAZO {{ yearsToMaturity }}
                </span>
                <span v-if="data?.reference_rate !== null" :style="{ color: brand.colors.border }">·</span>
                <span
                  v-if="data?.reference_rate !== null"
                  class="text-[11px] uppercase tracking-[0.12em]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  {{ data?.reference_rate_label ?? 'REF' }} {{ data?.reference_rate?.toFixed(2) }}%
                </span>
              </div>
            </div>

            <!-- Col 3: Session stats -->
            <div class="flex flex-col gap-1 md:col-span-4">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [PRICE.SESSION]
              </span>
              <div
                class="grid grid-cols-2 gap-px border font-mono-tab text-[11px]"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
              >
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">COMPRA</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.positive }">
                    {{ formatMoney(data?.price_buy) }}
                  </span>
                </div>
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">VENDA</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.text }">
                    {{ formatMoney(data?.price_sell) }}
                  </span>
                </div>
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">VENC</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.text }">
                    {{ maturityShort }}
                  </span>
                </div>
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">INDEX</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.primary }">
                    {{ indexerLabel }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Price register bigger version -->
        <section class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <header class="mb-4 flex flex-col gap-1">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              [PRICES.TODAY]
            </span>
            <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
              Preços do Tesouro Nacional
            </h2>
            <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
              &gt; COMPRA · VENDA · ATUALIZADO DIARIAMENTE
            </p>
          </header>
          <div
            class="grid grid-cols-1 gap-px border md:grid-cols-2"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
          >
            <div class="flex flex-col gap-2 px-6 py-5" :style="{ backgroundColor: brand.colors.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">[01]</span>
              <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">COMPRA</span>
              <span class="font-mono-tab text-3xl font-bold tabular-nums md:text-4xl" :style="{ color: brand.colors.positive }">
                {{ formatMoney(data?.price_buy) }}
              </span>
            </div>
            <div class="flex flex-col gap-2 px-6 py-5" :style="{ backgroundColor: brand.colors.surface }">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">[02]</span>
              <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">VENDA</span>
              <span class="font-mono-tab text-3xl font-bold tabular-nums md:text-4xl" :style="{ color: brand.colors.text }">
                {{ formatMoney(data?.price_sell) }}
              </span>
            </div>
          </div>
        </section>

        <!-- Price history chart -->
        <section class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div class="flex flex-col gap-1">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [CHART.{{ chartMode === 'rate' ? 'RATE' : 'PRICE' }}]
              </span>
              <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                {{ chartMode === 'rate' ? 'Histórico de rentabilidade' : 'Histórico de cotação' }}
              </h2>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                &gt; SÉRIE DIÁRIA · {{ chartMode === 'rate' ? 'TAXA DE VENDA (% A.A.)' : 'VALOR DE VENDA' }} · {{ selectedChartRange.toUpperCase() }}
              </span>
            </div>
            <div class="flex flex-col gap-2 md:flex-row md:items-center">
              <div
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
                v-model="selectedChartRange"
                :options="chartRangeOptions"
                :loading="isLoadingChart"
                class="max-md:w-full"
              />
            </div>
          </div>
          <AtomsGraphLine
            :data="chartData"
            :legend="chartLegend"
            :height="320"
            :loading="isLoadingChart"
            :currency="chartMode === 'rate' ? '%' : 'R$'"
          />
        </section>

        <!-- AI Interpretation -->
        <section v-if="interpretations.length" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <header class="mb-4 flex items-center gap-2">
            <IconAi class="h-3 w-3" :style="{ fill: brand.colors.primary }" />
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              [AI.INTERPRETATIONS]
            </span>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
              &gt; LEITURA DO TÍTULO
            </span>
          </header>
          <div class="flex flex-col gap-px border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
            <div
              v-for="(line, idx) in interpretations"
              :key="idx"
              class="flex items-start gap-3 px-5 py-3"
              :style="{ backgroundColor: brand.colors.surface }"
            >
              <span
                class="font-mono-tab text-[9px] uppercase tracking-[0.18em] shrink-0 mt-[3px]"
                :style="{ color: brand.colors.primary }"
              >
                [{{ String(idx + 1).padStart(2, '0') }}]
              </span>
              <p class="text-sm leading-relaxed" :style="{ color: brand.colors.text }" v-html="line" />
            </div>
          </div>
        </section>

        <!-- AI ASSISTANT (same as asset page) -->
        <section v-if="!authStore.isAuthenticated" class="border-b py-12" :style="{ borderColor: brand.colors.border }">
          <header class="mb-6 flex flex-col gap-1">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
              [AI.ASSISTANT]
            </span>
            <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
              Dúvidas sobre <span class="italic" :style="{ color: brand.colors.primary }">este título</span>?
            </h2>
            <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
              &gt; PERGUNTE QUALQUER COISA · RESPOSTA EM ~3 SEGUNDOS
            </p>
          </header>

          <div class="mb-6 grid gap-px border sm:grid-cols-3" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
            <NuxtLink
              v-for="(item, idx) in suggestionCards"
              :key="idx"
              to="/auth/login"
              class="group flex flex-col gap-2 p-5 transition-colors hover:brightness-125"
              :style="{ backgroundColor: brand.colors.surface }"
            >
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                [Q.{{ String(idx + 1).padStart(2, '0') }}]
              </span>
              <p class="text-base font-semibold leading-snug" :style="{ color: brand.colors.text }">
                <span :style="{ color: brand.colors.primary }">&gt;</span> {{ item.text }}
              </p>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                {{ item.desc }}
              </span>
              <span class="mt-auto flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
                PERGUNTAR →
              </span>
            </NuxtLink>
          </div>

          <div class="flex flex-col items-center gap-4 border p-6 md:p-8" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
            <UButton
              to="/auth/login"
              size="xl"
              class="group w-full font-mono-tab font-semibold uppercase tracking-wider transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90 sm:w-auto"
              :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
            >
              <template #leading>
                <span class="font-mono-tab text-[10px] opacity-70">[F3]</span>
              </template>
              {{ brand.ai?.ctaButton ?? 'Entrar gratuitamente' }}
            </UButton>
            <p class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
              <UIcon name="i-lucide-shield-check" class="h-3 w-3" />
              GRATUITO · SEM CARTAO · RESPOSTA EM SEGUNDOS
            </p>
          </div>
        </section>

        <MoleculesChat
          v-else
          class="w-full"
          :suggestions="chatSuggestions"
          route-path="/tesouro"
          :ticker="slug"
        />
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
    color: brand.colors.positive,
  },
])

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
  const brandCtx = useBrand()
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
  if (b === 'IPCA+') return brand.colors.primary
  if (b === 'SELIC') return brand.colors.positive
  if (b === 'PRÉ') return brand.colors.text
  return brand.colors.textMuted
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
  const accent = (t: string) => `<strong style="color: ${brand.colors.primary}">${t}</strong>`
  const pos = (t: string) => `<strong style="color: ${brand.colors.positive}">${t}</strong>`

  const rateNum = d.rate_numeric
  const idx = indexerLabel.value

  if (idx === 'IPCA+' && rateNum !== null) {
    lines.push(
      `Paga ${accent('IPCA + ' + rateNum.toFixed(2) + '%')} ao ano — garante retorno real acima da inflação oficial do Brasil até o vencimento.`,
    )
    if (rateNum >= 7) {
      lines.push(`Taxa real de ${pos(rateNum.toFixed(2) + '%')} está ${pos('acima da média histórica')} (~6%) — momento favorável pra travar retorno real alto.`)
    }
  } else if (idx === 'PRÉ' && rateNum !== null) {
    lines.push(
      `Taxa prefixada de ${accent(rateNum.toFixed(2) + '%')} ao ano — você sabe hoje exatamente quanto receberá no vencimento, mas perde se a inflação subir forte.`,
    )
  } else if (idx === 'SELIC' && rateNum !== null) {
    lines.push(
      `Rentabilidade acompanha a Selic (${d.reference_rate?.toFixed(2) ?? '—'}%) ${rateNum !== 0 ? accent(' + ' + rateNum.toFixed(2) + '%') : 'sem spread adicional'} — ideal pra reserva de emergência e investimentos de curto prazo.`,
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
      lines.push(`Vencimento ${accent('curto a médio (' + years + ' anos)')} — menor volatilidade de preço e boa opção pra metas de médio prazo.`)
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
