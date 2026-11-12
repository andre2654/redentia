<script setup lang="ts">
// /tesouro/[slug] — detalhe do título público. Referência FUNCIONAL (não
// visual): Frontend/app/pages/tesouro/[slug].vue (taxa como "preço", cards
// compra/venda, gráfico com toggle cotação↔taxa, interpretações por regra).
// O layout default já renderiza NuHeader + NuMarketTicker + NuFooter; aqui
// vive o miolo na linguagem Nu: topo em duas colunas (creme: taxa-herói |
// Compra/Venda no cartão carvão) → gráfico (navy, toggle preço↔taxa + ranges) → leituras por regra →
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
// o sujeito dos cartões que vão ao chat ("P/L PETR4"): useSobreDoContexto
proverSobreDoContexto(() => data.value?.hero.name)

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
const quantoRendeHref = computed(() => {
  const t = titulo.value.raw
  const maturity = t.maturity_date ? t.maturity_date.slice(0, 10) : null
  const ok = paginaTesouroValida({
    slug,
    name: t.name,
    indexer: t.indexer,
    rateNumeric: t.rate_numeric,
    referenceRate: t.reference_rate,
    maturity,
    hoje: spISODate(),
  })
  return ok ? `/quanto-rende/tesouro/${slug}` : null
})

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
const origin = useSiteOrigin()
const structuredData: Record<string, unknown>[] = [
  {
    '@type': 'FinancialProduct',
    name: titulo.value.hero.name,
    description: titulo.value.seo.description,
    category: 'Government Bond',
    identifier: slug,
    url: `${origin}/tesouro/${slug}`,
    // O emissor é o Tesouro Nacional. A Redentia informa sobre o título, não o
    // distribui: declarar `provider: Redentia` era afirmação falsa em dado
    // estruturado, do mesmo tipo que a trava de copy de compliance evita.
    provider: { '@type': 'GovernmentOrganization', name: 'Tesouro Nacional', url: 'https://www.tesourodireto.com.br' },
    // `offers` REMOVIDO (2026-08-03). Declarava availability InStock e um preço
    // de compra num produto que este site não vende. Além de falso, era o que
    // fazia o Google renderizar a página como snippet de produto: o relatório de
    // Aspecto da pesquisa do trimestre tem UMA linha, "Snippets do produto",
    // com 1.858 impressões e 5 cliques (CTR 0,27%, posição 14,93). Os outros 14
    // blocos de Offer do site declaravam price '0' e saíram no mesmo commit.
  },
]

usePageSeo({
  title: titulo.value.seo.title,
  description: titulo.value.seo.description,
  path: `/tesouro/${slug}`,
  structuredData,
  // último preço publicado na série do título (não o refreshed_at, que é a
  // hora em que o scraper regravou a linha)
  dateModified: titulo.value.raw.price_date,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Tesouro Direto', path: '/tesouro' },
    { name: titulo.value.hero.name, path: `/tesouro/${slug}` },
  ],
})

// "Perguntar à IA" abre o painel do chat aqui mesmo (11/11/2026): a pergunta
// mora no painel desde 02/11, e a /busca não é mais onde se conversa.
const painel = useChatPainel()
</script>

<template>
  <div>
    <!-- ============ Topo em duas colunas: o título e a taxa-herói à esquerda,
         Compra e Venda no cartão carvão à direita ============ -->
    <section class="tsd__topo">
      <div class="tsd__topo-grade">
        <TesouroHero :hero="titulo.hero" />
        <TesouroSideCards :cards="sideCards" />
      </div>
    </section>

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
      <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="tsd__readings">
        <article v-for="r in titulo.readings" :key="r.title" class="tsd__reading">
          <h3 class="tsd__reading-title">{{ r.title }}</h3>
          <p class="tsd__reading-body">{{ r.body }}</p>
        </article>
      </div>
    </CalcBand>

    <!-- ============ Ferramentas relacionadas ============ -->
    <CalcBand tone="white" title="Continue a análise">
      <div v-revelar="{ alvo: 'filhos', passo: 60 }" class="tsd__grid-cards">
        <NuxtLink to="/ranking/tesouro-direto" class="tsd__card-link">
          <h3 class="tsd__card-link-title">Ranking do Tesouro Direto</h3>
          <p class="tsd__card-link-desc">Compare este título com os demais, ordenados pela maior taxa de hoje.</p>
          <span class="tsd__card-link-ir">Abrir<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
        </NuxtLink>
        <NuxtLink v-if="quantoRendeHref" :to="quantoRendeHref" class="tsd__card-link">
          <h3 class="tsd__card-link-title">Quanto rende um valor neste título</h3>
          <p class="tsd__card-link-desc">A taxa de hoje aplicada a um valor, com o bruto e o IR quando a conta fecha.</p>
          <span class="tsd__card-link-ir">Abrir<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
        </NuxtLink>
        <NuxtLink :to="titulo.calcHref" class="tsd__card-link">
          <h3 class="tsd__card-link-title">Simular na calculadora de juros compostos</h3>
          <p class="tsd__card-link-desc">Abre a simulação já preenchida com uma taxa nominal estimada pra este título.</p>
          <span class="tsd__card-link-ir">Abrir<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
        </NuxtLink>
      </div>
    </CalcBand>

    <!-- ============ FAQ (FAQPage JSON-LD via NuFaqAccordion) ============ -->
    <CalcSplit tone="cream" wide>
      <template #title>Perguntas frequentes sobre o {{ shortName }}</template>
      <template #left>
        <NuBotaoSeta variante="azul" tamanho="m" class="tsd__pill" @click="painel.abrir()">Perguntar à IA</NuBotaoSeta>
      </template>
      <NuFaqAccordion :items="titulo.faq" surface="white" />
    </CalcSplit>

    <!-- ============ Fecho (só deslogado): o painel azul da marca, com o corte de fundo ============ -->
    <MercadoFecho
      v-if="!isAuthenticated" eyebrow="Sua carteira" fundo="faixa"
      :primary="{ label: 'Criar conta grátis', to: '/login' }"
      :secondary="{ label: 'Ver todos os títulos', to: '/tesouro' }"
    >
      <template #title>Acompanhe seus títulos na Aportou</template>
      <template #subtitle>Cadastre-se e veja renda fixa, ações e FIIs em uma carteira só, com análises automáticas e dados atualizados diariamente.</template>
    </MercadoFecho>
  </div>
</template>

<style scoped>
/* ——— o topo em duas colunas (2ª rodada da Aportou): como o topo do /asset ——— */
/* Robustez (11/11/2026): a margem é a da coluna (--nu-coluna), os espaços no
   ritmo de 8 e o movimento e a cor por token. As leituras deixam a caixa: fio,
   não caixa (cada uma é uma coluna sob o fio carvão, reto); os cartões de
   "Continue a análise" sobem 2px e afundam ao apertar. */
.tsd__topo {
  background: var(--nu-page);
  padding: clamp(40px, 4.4vw, 64px) var(--nu-coluna) clamp(48px, 5vw, 72px);
}
.tsd__topo-grade { display: grid; grid-template-columns: minmax(0, 1fr); row-gap: clamp(32px, 3.4vw, 40px); }
@media (min-width: 1080px) {
  .tsd__topo-grade { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: clamp(40px, 4.4vw, 72px); align-items: center; }
}

/* ——— leituras: colunas sob o fio carvão (reto: o fio não acompanha o raio de um cartão) ——— */
.tsd__readings {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: 32px clamp(24px, 3vw, 40px); margin-top: clamp(32px, 4vw, 48px);
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.tsd__reading { padding-top: 20px; border-top: 2px solid var(--nu-ink); }
.tsd__reading-title { margin: 0 0 8px; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }
.tsd__reading-body { margin: 0; color: var(--nu-gray-3); font-size: 15.5px; font-weight: var(--nu-w-texto); line-height: 1.55; }

/* ——— ferramentas relacionadas: o cartão inteiro é o clique ——— */
.tsd__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(32px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.tsd__card-link {
  background: var(--nu-card); border-radius: var(--nu-r-panel); padding: 24px 24px 20px; box-shadow: var(--nu-shadow-quente);
  display: flex; flex-direction: column; gap: 8px; -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.tsd__card-link:active { transform: scale(.995); transition-duration: var(--nu-dur-rapida); }
.tsd__card-link:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.tsd__card-link-title { margin: 0; color: var(--nu-ink); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); transition: color var(--nu-dur-rapida) var(--nu-ease-cor); }
.tsd__card-link-desc { margin: 0; color: var(--nu-gray-3); font-size: 14.5px; font-weight: var(--nu-w-texto); line-height: 1.5; }
/* o "Abrir →" fala como o NuLinkSeta (o cartão já é o link) */
.tsd__card-link-ir {
  display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 8px;
  color: var(--nu-blue-text); font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
}
.tsd__card-link-ir svg { width: 16px; height: 16px; flex: none; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
@media (hover: hover) {
  .tsd__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
  .tsd__card-link:hover .tsd__card-link-title { color: var(--nu-blue-text); }
  .tsd__card-link:hover .tsd__card-link-ir svg { transform: translateX(3px); }
}
@media (prefers-reduced-motion: reduce) {
  .tsd__card-link:hover, .tsd__card-link:active, .tsd__card-link:hover .tsd__card-link-ir svg { transform: none; }
}

/* ——— a pílula da IA no FAQ ——— */
.tsd__pill { margin-top: 32px; }
</style>
