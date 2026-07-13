<script setup lang="ts">
// /tesouro/[slug] — detalhe do título público. Referência FUNCIONAL (não
// visual): Frontend/app/pages/tesouro/[slug].vue (taxa como "preço", cards
// compra/venda, gráfico com toggle cotação↔taxa, interpretações por regra).
// O layout default já renderiza NuHeader + NuMarketTicker + NuFooter; aqui
// vive o miolo na linguagem Nu: hero (creme, taxa-herói) → cards Compra/Venda
// → gráfico (navy, toggle preço↔taxa + ranges) → leituras por regra →
// ferramentas relacionadas → FAQ → CTA.
//
// SEO: SSR-first (detalhe buscado no servidor via useAsyncData — taxa real no
// HTML da 1ª resposta), canonical minúsculo com 301 do uppercase, JSON-LD
// FinancialProduct + BreadcrumbList + FAQPage (via NuFaqAccordion, fonte
// única). Slug inexistente → 404 real; backend fora → 503 (não envenena o
// índice). routeRules '/tesouro/**' já cacheia 600s+swr no nuxt.config.

// Slugs reais são kebab-case minúsculo (tesouro-ipca-2029…). Fora do formato
// → 404 antes de qualquer fetch; uppercase → 301 pro canonical.
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,80}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.slug ?? '')
      const lower = raw.toLowerCase()
      if (!SLUG_RE.test(lower)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Título não encontrado' }))
      }
      if (raw !== lower) {
        return navigateTo(`/tesouro/${lower}`, { redirectCode: 301, replace: true })
      }
    },
  ],
})

const slug = String(useRoute().params.slug ?? '').toLowerCase()

const {
  data, error,
  activeRange, activeMode, setRange, setMode, rangeLoading,
  chartPoints, chartCurrentLabel, chartUnavailable, latestRates,
} = await useTesouroTitle(slug)

const { isAuthenticated } = useAuthState() // CTA final só pra visitante deslogado

if (error.value || !data.value) {
  const status = (error.value as { statusCode?: number } | null)?.statusCode
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? 'Título não encontrado' : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const titulo = computed(() => data.value!)
/** 'Tesouro IPCA+ 2029' → 'IPCA+ 2029' (H2 do gráfico, sem repetir a marca) */
const shortName = computed(() => titulo.value.hero.name.replace(/^Tesouro\s+/i, ''))

const nfBrl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const sideCards = computed(() => {
  const t = titulo.value.raw
  return [
    {
      label: 'Compra',
      priceFmt: t.price_buy != null ? nfBrl.format(t.price_buy) : '—',
      rateFmt: latestRates.value.buy,
      note: 'Quanto custa investir neste título hoje, pelo preço unitário do Tesouro Nacional.',
    },
    {
      label: 'Venda',
      priceFmt: t.price_sell != null ? nfBrl.format(t.price_sell) : '—',
      rateFmt: latestRates.value.sell,
      note: 'Quanto o Tesouro paga se você vender o título hoje, antes do vencimento.',
    },
  ]
})

/* ————— SEO ————— */
const pageUrl = useRequestURL()
const origin = `${pageUrl.protocol}//${pageUrl.host}`
const structuredData: Record<string, unknown>[] = [
  {
    '@type': 'FinancialProduct',
    name: titulo.value.hero.name,
    description: titulo.value.seo.description,
    category: 'Government Bond',
    identifier: slug,
    url: `${origin}/tesouro/${slug}`,
    provider: { '@type': 'Organization', name: 'Redentia', url: origin },
    ...(titulo.value.raw.price_buy != null
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: String(titulo.value.raw.price_buy),
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  },
]

usePageSeo({
  title: titulo.value.seo.title,
  description: titulo.value.seo.description,
  path: `/tesouro/${slug}`,
  structuredData,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Tesouro Direto', path: '/tesouro' },
    { name: titulo.value.hero.name, path: `/tesouro/${slug}` },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero (badge + nome + taxa-herói + prazo) ============ -->
    <TesouroHero :hero="titulo.hero" />

    <!-- ============ Cards Compra / Venda ============ -->
    <TesouroSideCards :cards="sideCards" />

    <!-- ============ Histórico (navy, toggle preço↔taxa + ranges) ============ -->
    <TesouroChartSection
      :name="shortName"
      :points="chartPoints"
      :stats="titulo.stats"
      :range="activeRange"
      :mode="activeMode"
      :range-loading="rangeLoading"
      :current-label="chartCurrentLabel"
      :unavailable="chartUnavailable"
      @update:range="setRange"
      @update:mode="setMode"
    />

    <!-- ============ Leituras determinísticas (regras, zero LLM) ============ -->
    <CalcBand tone="cream" kicker="Leitura do título" title="Como ler este título">
      <div class="tsd__readings">
        <article v-for="r in titulo.readings" :key="r.title" class="tsd__reading">
          <h3 class="tsd__reading-title">{{ r.title }}</h3>
          <p class="tsd__reading-body">{{ r.body }}</p>
        </article>
      </div>
    </CalcBand>

    <!-- ============ Ferramentas relacionadas ============ -->
    <CalcBand tone="white" title="Continue a análise">
      <div class="tsd__grid-cards">
        <NuxtLink to="/ranking/tesouro-direto" class="tsd__card-link">
          <h3 class="tsd__card-link-title">Ranking do Tesouro Direto</h3>
          <p class="tsd__card-link-desc">Compare este título com os demais, ordenados pela maior taxa de hoje.</p>
        </NuxtLink>
        <NuxtLink :to="titulo.calcHref" class="tsd__card-link">
          <h3 class="tsd__card-link-title">Simular na calculadora de juros compostos</h3>
          <p class="tsd__card-link-desc">Abre a simulação já preenchida com uma taxa nominal estimada pra este título.</p>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ FAQ (FAQPage JSON-LD via NuFaqAccordion) ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas frequentes sobre o {{ shortName }}</template>
      <template #left>
        <NuxtLink to="/busca" class="tsd__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :items="titulo.faq" surface="white" />
    </CalcSplit>

    <!-- ============ CTA final full-bleed (só deslogado — mesmo padrão dos
         outros CTAs da Redentia: NuCtaPhoto) ============ -->
    <NuCtaPhoto
      v-if="!isAuthenticated"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver todos os títulos', to: '/tesouro' }"
    >
      <template #title>Acompanhe seus títulos<br>na Redentia</template>
      <template #subtitle>Cadastre-se e veja renda fixa, ações e FIIs em uma carteira só, com análises automáticas e dados atualizados diariamente.</template>
    </NuCtaPhoto>
  </div>
</template>

<style scoped>
/* ——— leituras (cards brancos na banda creme, família das calculadoras) ——— */
.tsd__readings {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.tsd__reading { background: var(--nu-white); border-radius: var(--nu-r-panel); padding: 26px; }
.tsd__reading-title { margin: 0 0 8px; color: var(--nu-blue); font-size: 16.5px; font-weight: 800; letter-spacing: -.2px; }
.tsd__reading-body { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.65; }

/* ——— ferramentas relacionadas ——— */
.tsd__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.tsd__card-link {
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.tsd__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.tsd__card-link-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }
.tsd__card-link-desc { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }

/* ——— pills / CTA (mesma família dos rankings/calculadoras) ——— */
.tsd__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.tsd__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }
/* (CTA final = NuCtaPhoto full-bleed, estilos no componente) */
</style>
