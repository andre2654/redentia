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
// 404 (thin content é pior que nada); papel deslistado da B3 → 410, igual
// ao /asset.
//
// SEO: canonical /dividendos/{TICKER}, title com o ano corrente, FAQPage
// JSON-LD emitido pelo NuFaqAccordion (fonte única) + BreadcrumbList
// Início → /asset/{T} → Dividendos via usePageSeo. Cache: routeRules
// '/dividendos/**' já configurado no nuxt.config (s-maxage=3600).
//
// Código TROCADO (EMBR3 → EMBJ3) responde 301 pro /dividendos do código novo
// com `?de=`, mesma regra do /asset. A estrela "Seguir" do hero é client-only
// (o HTML cacheado é o mesmo pra logado e anônimo).

const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/

definePageMeta({
  middleware: [
    (to) => {
      const raw = String(to.params.ticker ?? '')
      const upper = raw.toUpperCase()
      if (!TICKER_RE.test(upper)) {
        return abortNavigation(createError({ statusCode: 404, statusMessage: 'Ativo não encontrado' }))
      }
      // Canonical maiúsculo: /dividendos/petr4 → 301 /dividendos/PETR4, com a
      // query junto (mesma regra do /asset).
      if (raw !== upper) {
        return navigateTo({ path: `/dividendos/${upper}`, query: to.query, hash: to.hash }, { redirectCode: 301, replace: true })
      }
    },
  ],
})

const route = useRoute()
const ticker = String(route.params.ticker ?? '').toUpperCase()

const { data, error } = await useDividendos(ticker)

// Código trocado → 301 (query preservada + `?de=`); o render segue vazio.
// Destino: o /dividendos do código novo, ou o /asset dele quando o código
// novo não tem provento (useDividendos → rotaDoCodigoNovo).
const renamedTo = renamedTargetOfError(error.value)
if (renamedTo) {
  const pagina = renamedRotaOfError(error.value) === 'asset' ? 'asset' : 'dividendos'
  await navigateTo(
    { path: `/${pagina}/${renamedTo}`, query: { ...route.query, de: ticker } },
    { redirectCode: 301, replace: true },
  )
} else if (error.value || !data.value) {
  const err = error.value as { statusCode?: number, statusMessage?: string, data?: unknown } | null
  const status = err?.statusCode
  // 404 e 410 atravessam inteiros, como no /asset: 410 é "existiu e saiu da
  // B3" (app/utils/delisted.ts). Até 23/09/2026 esta linha traduzia o 410 em
  // 503 e mandava o Google voltar depois. Qualquer outro erro é transitório
  // e segue 503: um 404/410 por backend fora envenenaria o índice.
  if (status === 410) {
    throw createError({
      statusCode: 410,
      statusMessage: err?.statusMessage || delistedMessage(ticker, null),
      data: err?.data ?? { ticker, delistedAt: null },
      fatal: true,
    })
  }
  throw createError({
    statusCode: status === 404 ? 404 : 503,
    statusMessage: status === 404 ? `Sem histórico de proventos para ${ticker}` : 'Dados temporariamente indisponíveis',
    fatal: true,
  })
}

const div = computed(() => data.value!)
// "EMBR3 agora negocia como EMBJ3." — só com `?de=` confirmado pelo backend
const renamedFrom = data.value ? await useRenamedFrom(ticker) : computed(() => null)

// Alternância de bandas: o histórico vem depois do resumo (branco) quando ele
// existe; sem resumo, o histórico encosta no hero (creme) e inverte o ciclo.
const histTone = computed<'cream' | 'white'>(() => (div.value?.resumo ? 'cream' : 'white'))
const flip = (t: 'cream' | 'white'): 'cream' | 'white' => (t === 'cream' ? 'white' : 'cream')
const eduTones = computed(() => {
  const tones: ('cream' | 'white')[] = []
  let t = histTone.value
  for (let i = 0; i < (div.value?.edu.length ?? 0); i++) {
    t = flip(t)
    tones.push(t)
  }
  return tones
})
const faqTone = computed(() => flip(eduTones.value[eduTones.value.length - 1] ?? histTone.value))
const crossTone = computed(() => flip(faqTone.value))

if (data.value) {
  usePageSeo({
    title: div.value.seo.title,
    description: div.value.seo.description,
    // path, nunca a query: ?de= e ?seguir= têm canonical pra URL limpa
    path: `/dividendos/${ticker}`,
    // pregão da cotação usada no DY (price_date do perfil), nunca o calendário
    dateModified: div.value.dataDate,
    // sem provento no histórico: fora do índice, links continuam seguíveis
    robots: robotsDeDividendos(div.value.temHistorico),
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: ticker, path: `/asset/${ticker}` },
      { name: 'Dividendos', path: `/dividendos/${ticker}` },
    ],
  })
}
</script>

<template>
  <div v-if="data">
    <!-- ============ Hero: nome + DY 12M + preço + próximo pagamento ============ -->
    <NuPageHero :eyebrow="div.hero.companyLine" :subtitle="div.hero.sub">
      <template #title>Dividendos de {{ ticker }}.</template>
      <p v-if="renamedFrom" class="dvt__renamed">{{ renamedFrom }} agora negocia como {{ ticker }}.</p>
      <DividendosStats v-if="div.hero.stats.length" :items="div.hero.stats" />
      <!-- Seguir: estrela + retorno curto (client-only; SSR sempre "Seguir") -->
      <div class="dvt__follow">
        <SeguirAtivo :ticker="ticker" :path="`/dividendos/${ticker}`" />
      </div>
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
      :bars-note="div.resumo.barsNote"
      :fonte="div.resumo.fonte"
    />

    <!-- ============ Histórico real: tabela pagamento a pagamento ============ -->
    <CalcBand :tone="histTone" title="Pagamento por pagamento.">
      <template #dek>
        <p>Cada {{ div.isFii ? 'rendimento' : 'provento' }} de {{ ticker }} registrado na B3, com data com, data de pagamento, tipo e valor por {{ div.isFii ? 'cota' : 'ação' }}. A data ex é o pregão seguinte à data com.</p>
      </template>
      <div v-if="div.proximo" class="dvt__next">
        <h3 class="dvt__next-title">Próximo pagamento</h3>
        <div class="dvt__next-grid">
          <div class="dvt__next-card" :class="{ 'dvt__next-card--white': histTone === 'cream' }">
            <span class="dvt__next-label">Data com</span>
            <span class="dvt__next-value">{{ div.proximo.com }}</span>
          </div>
          <div class="dvt__next-card" :class="{ 'dvt__next-card--white': histTone === 'cream' }">
            <span class="dvt__next-label">Data ex</span>
            <span class="dvt__next-value">{{ div.proximo.ex }}</span>
          </div>
          <div class="dvt__next-card" :class="{ 'dvt__next-card--white': histTone === 'cream' }">
            <span class="dvt__next-label">Data de pagamento</span>
            <span class="dvt__next-value">{{ div.proximo.pagamento }}</span>
          </div>
          <div
            v-for="(linha, i) in div.proximo.linhas"
            :key="`${linha.tipo}-${i}`"
            class="dvt__next-card"
            :class="{ 'dvt__next-card--white': histTone === 'cream' }"
          >
            <span class="dvt__next-label">{{ linha.tipo }}</span>
            <span class="dvt__next-value">{{ linha.valor }}</span>
          </div>
        </div>
        <p class="dvt__fonte">{{ div.proximo.fonte }}</p>
      </div>
      <div class="dvt__band-body">
        <CalcTableCard
          v-if="div.history"
          :columns="div.history.columns"
          :rows="div.history.rows"
          :accent-col="3"
          :note="div.history.note"
          :tone="histTone === 'cream' ? 'white' : 'cream'"
          cards-mobile
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

    <!-- ============ Cross-links: simulador + calculadora (deep-links), ranking, /asset ============ -->
    <CalcBand :tone="crossTone" title="Continue a análise.">
      <div class="dvt__grid-cards">
        <!-- Âncora "Simulador de dividendos" pra DONA do cluster, a
             /calculadora/acoes (bloco DONO DO CLUSTER em
             pages/calculadora/acoes.vue). Vem primeiro de propósito. O card de
             DY ao lado segue com a âncora de DY, que é o termo da página dele. -->
        <NuxtLink v-if="div.quantoRendeHref" :to="div.quantoRendeHref" class="dvt__card-link" :class="{ 'dvt__card-link--white': crossTone === 'cream' }">
          <h3 class="dvt__card-link-title">Quanto rende um valor em {{ ticker }}</h3>
          <p class="dvt__card-p">Os proventos dos últimos 12 meses aplicados a um valor, no preço de hoje</p>
        </NuxtLink>
        <NuxtLink v-if="div.simuladorHref" :to="div.simuladorHref" class="dvt__card-link" :class="{ 'dvt__card-link--white': crossTone === 'cream' }">
          <h3 class="dvt__card-link-title">Simulador de dividendos</h3>
          <p class="dvt__card-p">Quanto {{ ticker }} teria rendido com os {{ div.isFii ? 'rendimentos' : 'proventos' }} reinvestidos, no histórico real da B3</p>
        </NuxtLink>
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

.dvt__next { max-width: 1080px; margin: clamp(28px, 4vw, 40px) auto 0; }
.dvt__next-title {
  margin: 0 0 14px; color: var(--nu-ink); font-size: clamp(22px, 2.4vw, 28px);
  font-weight: 800; letter-spacing: -.02em; line-height: 1.2;
}
.dvt__next-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(168px, 100%), 1fr));
  gap: 12px;
}
.dvt__next-card {
  background: var(--nu-cream);
  border-radius: var(--nu-r-tile);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.dvt__next-card--white { background: var(--nu-white); }
.dvt__next-label { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.35; }
.dvt__next-value {
  color: var(--nu-ink); font-size: clamp(16px, 2vw, 22px); font-weight: 800;
  letter-spacing: -.2px; line-height: 1.25; overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}
.dvt__fonte {
  margin: 14px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm);
  font-weight: 500; line-height: 1.5; max-width: 72ch;
}

/* hero: faixa do código trocado + fileira do "Seguir" (a linha de retorno do
   SeguirAtivo quebra pra baixo do botão via flex-basis 100%) */
.dvt__renamed {
  display: flex; width: fit-content; max-width: 100%; margin: 0 0 18px; padding: 7px 14px;
  border-radius: var(--nu-r-pill); background: var(--nu-sand-2); color: var(--nu-gray-tag);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}
.dvt__follow { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 22px; }

/* aviso honesto no lugar da tabela (histórico vazio ou indisponível) */
.dvt__notice {
  background: var(--nu-white);
  border-radius: var(--nu-r-card-lg);
  padding: clamp(26px, 4vw, 44px);
  max-width: 1080px;
  margin: 0 auto;
  color: var(--nu-gray-2);
  font-size: var(--nu-fs-md);
  font-weight: 500;
  line-height: 1.65;
  text-align: center;
}
.dvt__notice--cream { background: var(--nu-cream); }

/* prosa das bandas educacionais (mesma escala da calculadora de DY) */
.dvt__prose p {
  margin: 0 0 16px; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: 500;
  line-height: 1.7;
}
.dvt__prose p:last-child { margin-bottom: 0; }

.dvt__pill {
  display: inline-flex; align-items: center; background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 15px 26px; font-size: var(--nu-fs-md); font-weight: 700;
  margin-top: 30px; transition: background .2s;
}
.dvt__pill:hover { background: var(--nu-blue-hover); color: var(--nu-white); }

/* cards-link de cross-link (anatomia da calculadora de DY) */
.dvt__grid-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px; margin-top: clamp(30px, 4vw, 48px);
  /* 1080 cabe os 3 cards (3 × 320 + gaps) numa linha só */
  max-width: 1080px; margin-left: auto; margin-right: auto;
}
.dvt__card-link {
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 26px;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .18s, box-shadow .2s;
}
.dvt__card-link--white { background: var(--nu-white); }
.dvt__card-link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.dvt__card-link-title { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -.2px; }
.dvt__card-p { margin: 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }

.dvt__cta { max-width: 1080px; margin: clamp(24px, 3vw, 36px) auto 0; }

@media (max-width: 760px) {
  .dvt__card-link { padding: 20px; }
}
</style>
