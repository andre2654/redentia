<script setup lang="ts">
// /acao/[ticker] — página de ativo (PR2). Contrato de UX:
// docs/redentia-nu/designs/Redentia Acoes Nu.dc.html. O layout default já
// renderiza NuHeader + NuMarketTicker + NuFooter; aqui vive o miolo na ordem
// do design: hero → gráfico 12M (dark) → teses → fundamentos → dividendos →
// análise IA (banda azul) → notícias.
//
// SEO: SSR-first (o fetch do perfil roda no servidor via useAsyncData —
// preço real no HTML da 1ª resposta), canonical MAIÚSCULO com 301 do
// lowercase, JSON-LD Corporation + BreadcrumbList + FAQPage (editorial).
// routeRules '/acao/**' já cacheia 120s no nuxt.config.

// Formato aceito: 4 chars iniciados por letra + 1-2 dígitos (PETR4, MXRF11,
// B3SA3, E1TN34…). Fora disso → 404 antes de qualquer fetch.
const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.ticker ?? '')
      const upper = raw.toUpperCase()
      if (!TICKER_RE.test(upper)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Ativo não encontrado' }))
      }
      // Canonical maiúsculo: /acao/petr4 → 301 /acao/PETR4
      if (raw !== upper) {
        return navigateTo(`/acao/${upper}`, { redirectCode: 301, replace: true })
      }
    },
  ],
})

const ticker = String(useRoute().params.ticker ?? '').toUpperCase()

const { data, error, activeRange, setRange, rangeLoading, currentSeries, position } = await useAcao(ticker)

if (error.value || !data.value) {
  const status = (error.value as { statusCode?: number } | null)?.statusCode
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? `Ativo ${ticker} não encontrado` : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const acao = computed(() => data.value!)

const pageUrl = useRequestURL()
const structuredData: Record<string, unknown>[] = [
  {
    '@type': 'Corporation',
    name: acao.value.name,
    tickerSymbol: ticker,
    url: `${pageUrl.protocol}//${pageUrl.host}/acao/${ticker}`,
  },
]
if (acao.value.seo.faq.length) {
  structuredData.push({
    '@type': 'FAQPage',
    mainEntity: acao.value.seo.faq.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  })
}

usePageSeo({
  title: acao.value.seo.title,
  description: acao.value.seo.description,
  path: `/acao/${ticker}`,
  structuredData,
  breadcrumbs: [
    { name: 'Início', path: '/mercado' },
    { name: ticker, path: `/acao/${ticker}` },
  ],
})
</script>

<template>
  <div>
    <AcaoHero :hero="acao.hero" :position="position" />

    <AcaoChartSection
      :ticker="acao.ticker"
      :series="currentSeries"
      :stats="acao.chartStats"
      :range="activeRange"
      :range-loading="rangeLoading"
      :current-label="acao.hero.priceFmt"
      @update:range="setRange"
    />

    <AcaoTeses :ticker="acao.ticker" :theses="acao.theses" />

    <AcaoFundamentals :heading="acao.fundHeading" :perfil="acao.perfil" :fcards="acao.fcards" />

    <AcaoDividends v-if="acao.dividends" :ticker="acao.ticker" :dividends="acao.dividends" :position="position" />

    <AcaoAiAnalysis v-if="acao.ai" :ticker="acao.ticker" :ai="acao.ai" />

    <AcaoNews v-if="acao.news" :ticker="acao.ticker" :news="acao.news" />
  </div>
</template>
