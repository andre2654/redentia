<!--
  /ranking — Hub Stripe-style + TOP 10 inline de cada um dos 20 rankings.

  Hierarchy: eyebrow → display heading (weight 300) → lead → 20 cards.
  Cada card mostra header (icon + titulo + "Ver ranking completo →"),
  mini-tabela top 10 (rank + ticker + 1 metrica chave) e CTA "Ver todos
  os 50". Cards ativos buscam dados via useAssetsService(). Cards "em
  breve" ficam disabled com badge.

  Loading strategy: TODOS os 16 rankings ativos sao buscados em
  paralelo via Promise.all dentro de um unico useAsyncData. Cache de
  15min no backend torna isso barato. Cada card renderiza skeleton
  enquanto pending, aparece quando promise resolve.

  Sem em-dashes em copy publica. Tokens semanticos (`var(--brand-X)`)
  pra evitar SSR flash quando o tenant muda.
-->
<template>
  <NuxtLayout :name="layoutName" title="Rankings da B3 2026">
    <section class="flex flex-col gap-12 px-6 py-10 md:py-14">
      <!-- ============ Hero ============ -->
      <header class="flex max-w-3xl flex-col gap-3">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: 'var(--brand-primary)' }"
        >Rankings completos · B3</span>
        <h1
          class="font-light"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(28px, 4vw, 36px)',
            lineHeight: 1.05,
            letterSpacing: '-0.7px',
          }"
        >Rankings da B3 2026: Tudo num só lugar</h1>
        <p
          class="max-w-2xl"
          :style="{
            fontSize: '17.5px',
            lineHeight: 1.55,
            color: 'color-mix(in srgb, var(--brand-text) 72%, transparent)',
          }"
        >20 rankings atualizados diariamente: maiores dividend yields, maior valor de mercado, mais baratas (Graham/Bazin), buy and hold, ROE, margem líquida, e muito mais.</p>
      </header>

      <!-- ============ 20 Ranking sections ============ -->
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <article
          v-for="r in rankings"
          :key="r.slug"
          class="ranking-card flex flex-col gap-3 rounded-2xl border p-5 transition-[border-color,background-color,box-shadow]"
          :class="{ 'ranking-card--soon': r.soon }"
          :style="{
            backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
            borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
          }"
        >
          <!-- Card header -->
          <header class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-lg"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${r.tint} 14%, transparent)`,
                }"
              >
                <UIcon :name="r.icon" class="size-5" :style="{ color: r.tint }" />
              </span>
              <div class="flex flex-col gap-0.5">
                <span
                  class="font-mono-tab text-[10px] font-medium uppercase"
                  :style="{
                    letterSpacing: '0.18em',
                    color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)',
                  }"
                >{{ r.eyebrow }}</span>
                <h2
                  class="text-[17px] font-medium"
                  :style="{ color: 'var(--brand-text)', letterSpacing: '-0.2px' }"
                >{{ r.title }}</h2>
              </div>
            </div>
            <span
              v-if="r.soon"
              class="rounded-full px-2 py-0.5 font-mono-tab text-[9.5px] font-semibold uppercase"
              :style="{
                letterSpacing: '0.14em',
                backgroundColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)',
                color: 'color-mix(in srgb, var(--brand-text) 55%, transparent)',
              }"
            >Em breve</span>
            <NuxtLink
              v-else
              :to="`/ranking/${r.slug}`"
              class="ranking-card__link inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-medium transition-colors"
              :style="{ color: 'var(--brand-primary)' }"
            >
              Ver ranking
              <UIcon
                name="i-lucide-arrow-up-right"
                class="size-3 transition-transform"
              />
            </NuxtLink>
          </header>

          <!-- Soon stub body -->
          <div
            v-if="r.soon"
            class="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-6 text-center"
            :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 60%, transparent)' }"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="size-5"
              :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }"
            />
            <p
              class="max-w-[220px] text-[12.5px]"
              :style="{ color: 'color-mix(in srgb, var(--brand-text) 55%, transparent)' }"
            >Estamos liberando este ranking em breve.</p>
          </div>

          <!-- Active card body: skeleton or table -->
          <template v-else>
            <ol
              v-if="pending && !rankingData[r.slug]?.length"
              class="flex flex-col"
              aria-busy="true"
            >
              <li
                v-for="n in 10"
                :key="n"
                class="flex items-center gap-3 border-b py-2 last:border-b-0"
                :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
              >
                <span
                  class="w-5 text-right font-mono-tab text-[11px] tabular-nums"
                  :style="{ color: 'color-mix(in srgb, var(--brand-text) 35%, transparent)' }"
                >{{ n }}</span>
                <span
                  class="ranking-skel h-3.5 flex-1 rounded"
                  :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-text) 7%, transparent)' }"
                />
                <span
                  class="ranking-skel h-3.5 w-12 rounded"
                  :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-text) 7%, transparent)' }"
                />
              </li>
            </ol>
            <ol v-else-if="rankingData[r.slug]?.length" class="flex flex-col">
              <li
                v-for="(row, idx) in rankingData[r.slug]!.slice(0, 10)"
                :key="row.ticker || row.stock || idx"
                class="border-b last:border-b-0"
                :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
              >
                <NuxtLink
                  :to="`/asset/${(row.ticker || row.stock || '').toLowerCase()}`"
                  class="ranking-row flex h-[30px] items-center gap-3 text-[12.5px] transition-colors"
                >
                  <span
                    class="w-5 shrink-0 text-right font-mono-tab tabular-nums"
                    :style="{ color: 'color-mix(in srgb, var(--brand-text) 45%, transparent)' }"
                  >{{ idx + 1 }}</span>
                  <span
                    class="flex min-w-0 flex-1 items-baseline gap-2"
                  >
                    <span
                      class="font-mono-tab font-semibold"
                      :style="{ color: 'var(--brand-text)' }"
                    >{{ row.ticker || row.stock }}</span>
                    <span
                      class="truncate text-[11px]"
                      :style="{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }"
                    >{{ truncateName(row.name) }}</span>
                  </span>
                  <span
                    class="shrink-0 font-mono-tab text-[12px] font-medium tabular-nums"
                    :style="{ color: metricColor(r.metric, row) }"
                  >{{ formatMetric(r.metric, row) }}</span>
                </NuxtLink>
              </li>
            </ol>
            <p
              v-else
              class="py-6 text-center text-[12px]"
              :style="{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }"
            >Sem dados no momento.</p>

            <!-- Bottom CTA -->
            <NuxtLink
              :to="`/ranking/${r.slug}`"
              class="ranking-card__cta mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors"
              :style="{
                borderColor: 'color-mix(in srgb, var(--brand-border) 60%, transparent)',
                color: 'var(--brand-text)',
              }"
            >
              Ver todos os 50
              <UIcon name="i-lucide-arrow-right" class="size-3" />
            </NuxtLink>
          </template>
        </article>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static'
)

const service = useAssetsService()

usePageSeo({
  title: 'Rankings da B3 2026: Top Ações, FIIs, ETFs | Redentia',
  description:
    '20 rankings atualizados diariamente: dividend yield, valor de mercado, ROE, mais baratas (Graham, Bazin), buy and hold, maiores altas e mais. B3 oficial.',
  path: '/ranking',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/ranking' },
  ],
})

// ====================================================================
// 16 rankings ATIVOS + 4 stubs "Em breve". Cada entry traz slug, copy,
// icon, tint, metrica usada no resumo top10 e a fn de fetch (`fetcher`)
// que sera chamada em paralelo no useAsyncData unico abaixo.
// ====================================================================
type Metric =
  | 'marketCap'
  | 'dividendYield'
  | 'grahamDiscount'
  | 'netMargin'
  | 'buyAndHoldScore'
  | 'bazinDiscount'
  | 'revenue'
  | 'netIncome'
  | 'roe'
  | 'pe'
  | 'monthlyChangeTop'
  | 'monthlyChangeBottom'
  | 'yearlyChangeTop'
  | 'yearlyChangeBottom'
  | 'cash'
  | 'upside'

type Ranking = {
  slug: string
  title: string
  eyebrow: string
  icon: string
  tint: string
  metric: Metric
  fetcher?: () => Promise<any[]>
  soon?: boolean
}

const rankings: Ranking[] = [
  {
    slug: 'maiores-valor-mercado',
    title: 'Maiores Valor de Mercado',
    eyebrow: 'Tamanho · B3',
    icon: 'i-lucide-landmark',
    tint: '#fbbf24',
    metric: 'marketCap',
    fetcher: () => service.getTopMarketCap(null, 10),
  },
  {
    slug: 'maiores-dividend-yield',
    title: 'Maiores Dividend Yields',
    eyebrow: 'Renda passiva',
    icon: 'i-lucide-coins',
    tint: '#34d399',
    metric: 'dividendYield',
    fetcher: () => service.getTopDividendYield(null, 10),
  },
  {
    slug: 'mais-baratas-graham',
    title: 'Mais Baratas (Graham)',
    eyebrow: 'Value · Graham',
    icon: 'i-lucide-percent',
    tint: '#60a5fa',
    metric: 'grahamDiscount',
    fetcher: () => service.getGrahamDiscount(null, 10),
  },
  {
    slug: 'maiores-margem-liquida',
    title: 'Maiores Margem Líquida',
    eyebrow: 'Lucro por receita',
    icon: 'i-lucide-trending-up',
    tint: '#a78bfa',
    metric: 'netMargin',
    fetcher: () => service.getTopNetMargin(null, 10),
  },
  {
    slug: 'buy-and-hold',
    title: 'Buy and Hold (Score)',
    eyebrow: 'Score Redent',
    icon: 'i-lucide-shield-check',
    tint: '#34d399',
    metric: 'buyAndHoldScore',
    fetcher: () => service.getBuyAndHold(null, 10),
  },
  {
    slug: 'mais-baratas-bazin',
    title: 'Mais Baratas (Bazin)',
    eyebrow: 'Value · Bazin',
    icon: 'i-lucide-tag',
    tint: '#fb923c',
    metric: 'bazinDiscount',
    fetcher: () => service.getBazinDiscount(null, 10),
  },
  {
    slug: 'maiores-receitas',
    title: 'Maiores Receitas',
    eyebrow: 'Top line · TTM',
    icon: 'i-lucide-banknote',
    tint: '#fbbf24',
    metric: 'revenue',
    fetcher: () => service.getTopRevenue(null, 10),
  },
  {
    slug: 'maiores-lucros',
    title: 'Maiores Lucros',
    eyebrow: 'Bottom line · TTM',
    icon: 'i-lucide-piggy-bank',
    tint: '#34d399',
    metric: 'netIncome',
    fetcher: () => service.getTopNetIncome(null, 10),
  },
  {
    slug: 'maiores-roe',
    title: 'Maiores ROEs',
    eyebrow: 'Retorno · equity',
    icon: 'i-lucide-trending-up',
    tint: '#a78bfa',
    metric: 'roe',
    fetcher: () => service.getTopROE(null, 10),
  },
  {
    slug: 'menores-pl',
    title: 'Menores P/Ls',
    eyebrow: 'Múltiplo · valor',
    icon: 'i-lucide-divide',
    tint: '#60a5fa',
    metric: 'pe',
    fetcher: () => service.getLowPE(null, 10),
  },
  {
    slug: 'maiores-altas-mes',
    title: 'Maiores Altas (30 dias)',
    eyebrow: 'Movimentação · 30d',
    icon: 'i-lucide-trending-up',
    tint: '#34d399',
    metric: 'monthlyChangeTop',
    fetcher: () => service.getMonthlyChange('top', null, 10),
  },
  {
    slug: 'maiores-baixas-mes',
    title: 'Maiores Baixas (30 dias)',
    eyebrow: 'Movimentação · 30d',
    icon: 'i-lucide-trending-down',
    tint: '#f87171',
    metric: 'monthlyChangeBottom',
    fetcher: () => service.getMonthlyChange('bottom', null, 10),
  },
  {
    slug: 'maiores-altas-12-meses',
    title: 'Maiores Altas (12 meses)',
    eyebrow: 'Movimentação · 12m',
    icon: 'i-lucide-arrow-up-right',
    tint: '#34d399',
    metric: 'yearlyChangeTop',
    fetcher: () => service.getYearlyChange('top', null, 10),
  },
  {
    slug: 'maiores-baixas-12-meses',
    title: 'Maiores Baixas (12 meses)',
    eyebrow: 'Movimentação · 12m',
    icon: 'i-lucide-arrow-down-right',
    tint: '#f87171',
    metric: 'yearlyChangeBottom',
    fetcher: () => service.getYearlyChange('bottom', null, 10),
  },
  {
    slug: 'maiores-caixa',
    title: 'Maiores Caixa',
    eyebrow: 'Liquidez · balanço',
    icon: 'i-lucide-wallet',
    tint: '#60a5fa',
    metric: 'cash',
    fetcher: () => service.getTopCash(null, 10),
  },
  {
    slug: 'maior-potencial-upside',
    title: 'Maior Potencial de Upside',
    eyebrow: 'Consenso · analistas',
    icon: 'i-lucide-rocket',
    tint: '#a78bfa',
    metric: 'upside',
    fetcher: () => service.getUpsidePotential(null, 10),
  },
  // ============ STUBS "Em breve" ============
  {
    slug: 'crescimento-lucro-5-anos',
    title: 'Crescimento Lucro (5 anos)',
    eyebrow: 'CAGR · lucro',
    icon: 'i-lucide-trending-up',
    tint: '#a78bfa',
    metric: 'roe',
    soon: true,
  },
  {
    slug: 'crescimento-receita-5-anos',
    title: 'Crescimento Receita (5 anos)',
    eyebrow: 'CAGR · receita',
    icon: 'i-lucide-line-chart',
    tint: '#34d399',
    metric: 'revenue',
    soon: true,
  },
  {
    slug: 'nunca-tiveram-prejuizo',
    title: 'Nunca Tiveram Prejuízo',
    eyebrow: 'Consistência · histórico',
    icon: 'i-lucide-shield-check',
    tint: '#fbbf24',
    metric: 'netIncome',
    soon: true,
  },
  {
    slug: 'mais-aparece-noticias',
    title: 'Mais Aparece em Notícias',
    eyebrow: 'Buzz · imprensa',
    icon: 'i-lucide-newspaper',
    tint: '#fb923c',
    metric: 'marketCap',
    soon: true,
  },
]

// ====================================================================
// Single useAsyncData com Promise.all parallel pra TODOS os rankings.
// Backend cache 15min torna o custo agregado baixo. Cada slug vira
// chave do dicionario rankingData.
// ====================================================================
const { data: rankingData, pending } = await useAsyncData(
  'rankings-hub',
  async () => {
    const active = rankings.filter((r) => r.fetcher)
    const settled = await Promise.allSettled(
      active.map((r) => r.fetcher!()),
    )
    const out: Record<string, any[]> = {}
    settled.forEach((res, idx) => {
      const slug = active[idx]!.slug
      out[slug] = res.status === 'fulfilled' ? (res.value || []) : []
    })
    return out
  },
  { default: () => ({}) as Record<string, any[]> },
)

// ====================================================================
// Helpers de renderizacao da mini-tabela top 10
// ====================================================================
function truncateName(name?: string | null): string {
  if (!name) return ''
  return name.length > 20 ? `${name.slice(0, 20)}…` : name
}

function pickFirst(...vals: Array<unknown>): number {
  for (const v of vals) {
    const n = typeof v === 'number' ? v : Number(v)
    if (Number.isFinite(n) && n !== 0) return n
  }
  return NaN
}

function formatPctVal(n: number, fromDecimal = false): string {
  if (!Number.isFinite(n)) return '-'
  const v = fromDecimal ? n * 100 : n
  return `${v.toFixed(1).replace('.', ',')}%`
}

function formatMoney(n: number): string {
  if (!Number.isFinite(n)) return '-'
  if (Math.abs(n) >= 1_000_000_000_000) return `R$ ${(n / 1_000_000_000_000).toFixed(1)}T`
  if (Math.abs(n) >= 1_000_000_000) return `R$ ${(n / 1_000_000_000).toFixed(1)}B`
  if (Math.abs(n) >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`
  return `R$ ${n.toFixed(0)}`
}

function formatBrl(n: number): string {
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
}

function formatMetric(metric: Metric, row: any): string {
  switch (metric) {
    case 'marketCap':
    case 'revenue':
    case 'netIncome':
    case 'cash': {
      const v = pickFirst(
        row.market_cap,
        row.total_revenue,
        row.net_income,
        row.cash_and_equivalents,
        row.total_cash,
      )
      return formatMoney(v)
    }
    case 'dividendYield': {
      const v = pickFirst(row.dividend_yield, row.dy)
      // Backend devolve em decimal (0.08) ou em percent (8.0); detecta automaticamente.
      const fromDecimal = v < 1 && v > 0
      return formatPctVal(v, fromDecimal)
    }
    case 'roe':
    case 'netMargin': {
      const v = pickFirst(row.roe, row.return_on_equity, row.net_margin, row.profit_margins)
      const fromDecimal = v < 1 && v > -1 && v !== 0
      return formatPctVal(v, fromDecimal)
    }
    case 'grahamDiscount':
    case 'bazinDiscount':
    case 'upside': {
      const v = pickFirst(
        row.graham_discount,
        row.bazin_discount,
        row.upside_potential,
        row.upside,
        row.discount,
      )
      const fromDecimal = Math.abs(v) < 5
      return formatPctVal(v, fromDecimal)
    }
    case 'pe': {
      const v = pickFirst(row.trailing_pe, row.pe, row.price_to_earnings)
      return Number.isFinite(v) ? v.toFixed(1) : '-'
    }
    case 'monthlyChangeTop':
    case 'monthlyChangeBottom':
    case 'yearlyChangeTop':
    case 'yearlyChangeBottom': {
      const v = pickFirst(row.change_percent, row.change, row.monthly_change, row.yearly_change)
      const sign = v >= 0 ? '+' : ''
      return Number.isFinite(v) ? `${sign}${v.toFixed(1).replace('.', ',')}%` : '-'
    }
    case 'buyAndHoldScore': {
      const v = pickFirst(row.buy_and_hold_score, row.score)
      return Number.isFinite(v) ? v.toFixed(1) : '-'
    }
    default:
      return formatBrl(Number(row.market_price) || 0)
  }
}

function metricColor(metric: Metric, row: any): string {
  if (
    metric === 'monthlyChangeTop' ||
    metric === 'yearlyChangeTop'
  ) return 'var(--brand-positive)'
  if (
    metric === 'monthlyChangeBottom' ||
    metric === 'yearlyChangeBottom'
  ) return 'var(--brand-negative)'
  if (metric === 'dividendYield' || metric === 'buyAndHoldScore') {
    return 'var(--brand-primary)'
  }
  // change_percent fallback colorizado se aparecer:
  const v = Number(row?.change_percent)
  if (Number.isFinite(v) && (metric === 'marketCap' || metric === 'revenue')) {
    return v >= 0 ? 'var(--brand-text)' : 'var(--brand-text)'
  }
  return 'var(--brand-text)'
}

// ====================================================================
// SEO structured data — WebApplication + ItemList das 20 paginas. Sem
// aggregateRating/HowTo/Article (regra do projeto).
// ====================================================================
const baseUrl = 'https://redentia.com.br'
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Rankings da B3 Redentia',
          url: `${baseUrl}/ranking`,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          description:
            '20 rankings da B3 atualizados diariamente: dividend yield, valor de mercado, ROE, Graham, Bazin, buy and hold, e mais.',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Rankings da B3 2026',
          numberOfItems: rankings.length,
          itemListElement: rankings.map((r, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: r.title,
            url: r.soon
              ? `${baseUrl}/ranking`
              : `${baseUrl}/ranking/${r.slug}`,
          })),
        },
      ]),
    },
  ],
})
</script>

<style scoped>
.ranking-card {
  position: relative;
  isolation: isolate;
}
.ranking-card:not(.ranking-card--soon):hover {
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 3%, var(--brand-background)) !important;
  box-shadow:
    0 12px 28px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 4px 12px -6px rgba(0, 0, 0, 0.10);
}
.ranking-card--soon {
  opacity: 0.72;
}

.ranking-card__link:hover {
  filter: brightness(1.08);
}
.ranking-card__link:hover .iconify {
  transform: translate(2px, -2px);
}

.ranking-card__cta:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent) !important;
  color: var(--brand-primary) !important;
}

.ranking-row:hover {
  background-color: color-mix(in srgb, var(--brand-text) 4%, transparent);
}

.ranking-skel {
  position: relative;
  overflow: hidden;
}
.ranking-skel::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--brand-text) 6%, transparent) 50%,
    transparent 100%
  );
  animation: ranking-skel-shimmer 1.4s linear infinite;
}
@keyframes ranking-skel-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .ranking-card,
  .ranking-card:hover,
  .ranking-card__link:hover .iconify {
    transition: none;
    transform: none;
  }
  .ranking-skel::after {
    animation: none;
  }
}
</style>
