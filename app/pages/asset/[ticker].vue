<script setup lang="ts">
// /asset/[ticker] — página de ativo (PR2, nasceu como /acao/[ticker]).
// A URL canônica voltou a ser /asset/{ticker} (equity de SEO da Redentia
// antiga); /acao/** só existiu dias no vercel.app e hoje 301a pra cá
// (routeRules). SÓ a URL mudou: composables/componentes internos mantêm o
// nome do domínio (useAcao, types/acao, Acao*.vue) — renomear seria churn
// sem ganho. Contrato de UX:
// docs/redentia-nu/designs/Redentia Acoes Nu.dc.html. O layout default já
// renderiza NuHeader + NuMarketTicker + NuFooter; aqui vive o miolo na ordem
// do design: hero → gráfico 12M (dark) → teses → fundamentos → dividendos →
// análise IA (banda azul) → notícias.
//
// TIPOS DE ATIVO (2026-07-13): a mesma página serve ação, FII, BDR, ETF e
// CRIPTO — cada seção degrada por payload (vazio → some), então o template é
// um só e o useAcao decide o que existe por tipo. Cripto é fluxo próprio
// (GET /crypto/{symbol}): sem fundamentos B3/score/consenso/teses/dividendos.
//
// SEO: SSR-first (o fetch do perfil roda no servidor via useAsyncData —
// preço real no HTML da 1ª resposta), canonical MAIÚSCULO com 301 do
// lowercase, JSON-LD por tipo (Corporation pra ação/BDR, InvestmentFund pra
// FII/ETF, WebPage simples pra cripto — não inventar tipo financeiro) +
// BreadcrumbList + FAQPage (editorial). routeRules '/asset/**' cacheia 120s.

// Formatos aceitos (as MESMAS regexes vivem no useAcao, que decide o fluxo
// B3 × cripto — mantê-las em sincronia ao mexer):
//  - B3: 4 chars iniciados por letra + 1-2 dígitos (PETR4, MXRF11, E1TN34…)
//  - cripto: símbolo curto só letras, 2-6 chars (BTC, ETH, SOL, DOGE…)
// Fora disso → 404 antes de qualquer fetch.
const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/
const CRYPTO_RE = /^[A-Z]{2,6}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.ticker ?? '')
      const upper = raw.toUpperCase()
      if (!TICKER_RE.test(upper) && !CRYPTO_RE.test(upper)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Ativo não encontrado' }))
      }
      // Canonical maiúsculo: /asset/petr4 → 301 /asset/PETR4 (e /asset/btc → /asset/BTC)
      if (raw !== upper) {
        return navigateTo(`/asset/${upper}`, { redirectCode: 301, replace: true })
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
const assetUrl = `${pageUrl.protocol}//${pageUrl.host}/asset/${ticker}`
// JSON-LD por tipo: Corporation (ação/BDR), InvestmentFund (FII/ETF) e
// WebPage pra cripto (schema.org não tem tipo honesto pra criptoativo).
const kind = acao.value.kind
const structuredData: Record<string, unknown>[] = [
  kind === 'crypto'
    ? { '@type': 'WebPage', name: `${acao.value.name} (${ticker})`, url: assetUrl }
    : kind === 'fii' || kind === 'etf'
      ? { '@type': 'InvestmentFund', name: acao.value.name, tickerSymbol: ticker, url: assetUrl }
      : { '@type': 'Corporation', name: acao.value.name, tickerSymbol: ticker, url: assetUrl },
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
  path: `/asset/${ticker}`,
  structuredData,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: ticker, path: `/asset/${ticker}` },
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

    <AcaoFundamentals :heading="acao.fundHeading" :sub="acao.fundSub" :perfil="acao.perfil" :fcards="acao.fcards" />

    <AcaoFundInfo v-if="acao.fundInfo" :info="acao.fundInfo" />

    <AcaoDividends v-if="acao.dividends" :ticker="acao.ticker" :dividends="acao.dividends" :position="position" />

    <AcaoAiAnalysis v-if="acao.ai" :ticker="acao.ticker" :ai="acao.ai" />

    <AcaoNews v-if="acao.news" :ticker="acao.ticker" :news="acao.news" />
  </div>
</template>
