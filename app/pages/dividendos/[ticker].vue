<script setup lang="ts">
// /dividendos/[ticker] — landing SEO de proventos (long-tail "dividendos
// petr4", top orgânico da Redentia antiga). A estrutura vem da página antiga
// (Frontend/app/pages/dividendos/[ticker].vue): hero com DY + resposta
// direta, histórico, seções educacionais e FAQ. O visual é 100% linguagem Nu
// (NuPageHero, bandas Calc, NuDividendBars, NuFaqAccordion, NuCtaBanner) e o
// conteúdo é 100% dinâmico dos dados reais (a antiga era um map estático de
// 12 tickers; esta cobre qualquer ticker com proventos na base).
//
// Dados: useDividendos (SSR-first, /tickers + /fundamentals/overview +
// /dividends). Existência: regex → 404 antes de fetch; lowercase → 301
// MAIÚSCULO (mesmo padrão do /asset); ticker sem NENHUM provento e sem DY →
// 404 (thin content é pior que nada).
//
// SEO: canonical /dividendos/{TICKER}, title com o ano corrente, FAQPage
// JSON-LD emitido pelo NuFaqAccordion (fonte única) + BreadcrumbList
// Início → /asset/{T} → Dividendos via usePageSeo. Cache: routeRules
// '/dividendos/**' já configurado no nuxt.config (s-maxage=3600).

const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.ticker ?? '')
      const upper = raw.toUpperCase()
      if (!TICKER_RE.test(upper)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Ativo não encontrado' }))
      }
      // Canonical maiúsculo: /dividendos/petr4 → 301 /dividendos/PETR4
      if (raw !== upper) {
        return navigateTo(`/dividendos/${upper}`, { redirectCode: 301, replace: true })
      }
    },
  ],
})

const ticker = String(useRoute().params.ticker ?? '').toUpperCase()

const { data, error } = await useDividendos(ticker)

if (error.value || !data.value) {
  const status = (error.value as { statusCode?: number } | null)?.statusCode
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? `Sem histórico de proventos para ${ticker}` : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const div = computed(() => data.value!)

// Alternância de bandas: o histórico vem depois do resumo (branco) quando ele
// existe; sem resumo, o histórico encosta no hero (creme) e inverte o ciclo.
const histTone = computed<'cream' | 'white'>(() => (div.value.resumo ? 'cream' : 'white'))
const flip = (t: 'cream' | 'white'): 'cream' | 'white' => (t === 'cream' ? 'white' : 'cream')
const eduTones = computed(() => {
  const tones: ('cream' | 'white')[] = []
  let t = histTone.value
  for (let i = 0; i < div.value.edu.length; i++) {
    t = flip(t)
    tones.push(t)
  }
  return tones
})
const faqTone = computed(() => flip(eduTones.value[eduTones.value.length - 1] ?? histTone.value))
const crossTone = computed(() => flip(faqTone.value))

usePageSeo({
  title: div.value.seo.title,
  description: div.value.seo.description,
  path: `/dividendos/${ticker}`,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: ticker, path: `/asset/${ticker}` },
    { name: 'Dividendos', path: `/dividendos/${ticker}` },
  ],
})
</script>

<template>
  <div>
    <!-- ============ Hero: nome + DY 12M + preço + próximo pagamento ============ -->
    <NuPageHero :eyebrow="div.hero.companyLine" :subtitle="div.hero.sub">
      <template #title>Dividendos de {{ ticker }}.</template>
      <DividendosStats v-if="div.hero.stats.length" :items="div.hero.stats" />
    </NuPageHero>

    <!-- ============ Resumo 12M: stats + barras anuais (NuDividendBars) ============ -->
    <DividendosResumo
      v-if="div.resumo"
      :ticker="ticker"
      :is-fii="div.isFii"
      :heading="div.resumo.heading"
      :subtitle="div.resumo.subtitle"
      :rows="div.resumo.rows"
      :bars="div.resumo.bars"
    />

    <!-- ============ Histórico real: tabela pagamento a pagamento ============ -->
    <CalcBand :tone="histTone" title="Pagamento por pagamento.">
      <template #dek>
        <p>Cada {{ div.isFii ? 'rendimento' : 'provento' }} de {{ ticker }} registrado na B3, com data, tipo e valor por {{ div.isFii ? 'cota' : 'ação' }}.</p>
      </template>
      <div class="dvt__band-body">
        <CalcTableCard
          v-if="div.history"
          :columns="div.history.columns"
          :rows="div.history.rows"
          :accent-col="2"
          :note="div.history.note"
          :tone="histTone === 'cream' ? 'white' : 'cream'"
        />
        <div v-else class="dvt__notice" :class="{ 'dvt__notice--cream': histTone === 'white' }">
          {{ div.historyNotice }}
        </div>
      </div>
    </CalcBand>

    <!-- ============ Seções educacionais (adaptadas por tipo, dados reais) ============ -->
    <CalcSplit v-for="(s, i) in div.edu" :key="s.title" :tone="eduTones[i]">
      <template #title>{{ s.title }}</template>
      <div class="dvt__prose">
        <p v-for="p in s.paragraphs" :key="p">{{ p }}</p>
      </div>
    </CalcSplit>

    <!-- ============ FAQ (FAQPage JSON-LD emitido pelo accordion) ============ -->
    <CalcSplit :tone="faqTone" wide>
      <template #title>Dúvidas sobre os {{ div.isFii ? 'rendimentos' : 'dividendos' }} de {{ ticker }}.</template>
      <template #left>
        <NuxtLink to="/busca" class="dvt__pill">Perguntar à Redentia AI</NuxtLink>
      </template>
      <NuFaqAccordion :items="div.faq" :surface="faqTone === 'cream' ? 'white' : undefined" />
    </CalcSplit>

    <!-- ============ Cross-links: calculadora (deep-link), ranking, /asset ============ -->
    <CalcBand :tone="crossTone" title="Continue a análise.">
      <div class="dvt__grid-cards">
        <NuxtLink :to="`/calculadora/dividend-yield?ticker=${ticker}`" class="dvt__card-link" :class="{ 'dvt__card-link--white': crossTone === 'cream' }">
          <h3 class="dvt__card-link-title">Calculadora de dividend yield</h3>
          <p class="dvt__card-p">Simule o DY de {{ ticker }} com preço e proventos reais, já preenchidos</p>
        </NuxtLink>
        <NuxtLink to="/ranking/maiores-dividend-yield" class="dvt__card-link" :class="{ 'dvt__card-link--white': crossTone === 'cream' }">
          <h3 class="dvt__card-link-title">Maiores dividend yields da B3</h3>
          <p class="dvt__card-p">Ranking diário das ações e FIIs que mais pagam proventos</p>
        </NuxtLink>
      </div>
      <div class="dvt__cta">
        <NuCtaBanner
          :title="`A análise completa de ${ticker}`"
          subtitle="Cotação, gráfico de 12 meses, fundamentos, score e a leitura da Redentia AI"
          :to="`/asset/${ticker}`"
        />
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.dvt__band-body { margin-top: clamp(30px, 4vw, 48px); }

/* aviso honesto no lugar da tabela (histórico vazio ou indisponível) */
.dvt__notice {
  background: var(--nu-white);
  border-radius: var(--nu-r-card-lg);
  padding: clamp(26px, 4vw, 44px);
  max-width: 1080px;
  margin: 0 auto;
  color: var(--nu-gray-2);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.65;
  text-align: center;
}
.dvt__notice--cream { background: var(--nu-cream); }

/* prosa das bandas educacionais (mesma escala da calculadora de DY) */
.dvt__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: 17px; font-weight: 500;
  line-height: 1.7;
}
.dvt__prose p:last-child { margin-bottom: 0; }

.dvt__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: 16px; font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.dvt__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }

/* cards-link de cross-link (anatomia da calculadora de DY) */
.dvt__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  max-width: 980px; margin-left: auto; margin-right: auto;
}
.dvt__card-link {
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.dvt__card-link--white { background: var(--nu-white); }
.dvt__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.dvt__card-link-title { margin: 0; color: var(--nu-ink); font-size: 18px; font-weight: 800; letter-spacing: -.2px; }
.dvt__card-p { margin: 0; color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; }

.dvt__cta { max-width: 980px; margin: clamp(24px, 3vw, 36px) auto 0; }

@media (max-width: 760px) {
  .dvt__card-link { padding: 20px; }
}
</style>
