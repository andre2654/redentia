<script setup lang="ts">
// /guias/[slug] — página de guia completo (PR4; exemplar = open-finance).
// Contrato de UX: docs/redentia-nu/designs/Redentia Guia Open Finance.dc.html.
// O layout default já renderiza NuHeader + NuMarketTicker + NuFooter; aqui
// vive o miolo na ordem do design: barra de progresso → hero do artigo →
// corpo 2 colunas (TOC sticky com scrollspy + conteúdo em seções ancoradas,
// CTA azul antes do FAQ) → "Continue lendo." → (footer do layout).
//
// Conteúdo 100% do doc tipado (app/content/guias) — títulos, parágrafos,
// stats, passos, checklist, CTA e FAQ; nada hardcodado em componente.
//
// SEO: SSR com o artigo inteiro no HTML, canonical /guias/{slug}, JSON-LD
// Article + BreadcrumbList (FAQPage vem do NuFaqAccordion). Slug inexistente
// → 404. routeRules '/guias/**' cacheia 3600s no nuxt.config.
import { getGuideDoc, relatedGuideCards } from '~/content/guias'

const slug = String(useRoute().params.slug ?? '')
const doc = getGuideDoc(slug)

if (!doc) {
  throw createError({ statusCode: 404, statusMessage: 'Guia não encontrado', fatal: true })
}

const faqId = `sec-${doc.sections.length + 1}`
const tocItems = [
  ...doc.sections.map((s) => ({ label: s.title, targetId: s.id })),
  { label: doc.faqTitle, targetId: faqId },
]
const related = relatedGuideCards(doc)

usePageSeo({
  title: doc.title,
  description: doc.description,
  path: `/guias/${doc.slug}`,
  structuredData: [
    {
      '@type': 'Article',
      headline: doc.title,
      description: doc.description,
      datePublished: doc.datePublished,
      dateModified: doc.dateModified,
      author: { '@type': 'Organization', name: MARCA.nome },
      articleSection: doc.tag,
      inLanguage: 'pt-BR',
    },
    ...(doc.howTo
      ? [{
          '@type': 'HowTo',
          name: doc.howTo.name,
          description: doc.howTo.description,
          inLanguage: 'pt-BR',
          step: doc.howTo.steps.map((step, i) => ({
            '@type': 'HowToStep',
            position: i + 1,
            name: step.name,
            text: step.text,
          })),
        }]
      : []),
  ],
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
    { name: doc.title, path: `/guias/${doc.slug}` },
  ],
})
</script>

<template>
  <div>
    <NuScrollProgress />

    <NuArticleHero
      :breadcrumbs="[{ label: 'Blog', to: '/guias' }, { label: doc.tag, to: '/guias' }]"
      :title="doc.title"
      :dek="doc.dek"
      :author="doc.author"
      :meta-line="doc.updatedLine"
    />

    <div class="gdp">
      <div class="gdp__cols">
        <NuTocSidebar :items="tocItems">
          <NuAiPromptCard
            kicker="IA da Aportou"
            text="Dúvida no meio do guia? Pergunte à IA."
            to="/busca"
          />
        </NuTocSidebar>

        <article class="gdp__article">
          <!-- o índice lateral some abaixo de 1080px: no celular e no tablet o
               mesmo sumário (mesmas âncoras) abre aqui, fechado -->
          <LegalIndice :items="tocItems" rotulo="Neste guia" />
          <section v-for="(sec, si) in doc.sections" :key="sec.id">
            <h2 :id="sec.id" class="gdp__h2" :class="{ 'gdp__h2--first': si === 0 }">{{ sec.title }}</h2>
            <template v-for="(b, bi) in sec.blocks" :key="`${sec.id}-${bi}`">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <p v-if="b.kind === 'p'" class="gdp__p" v-html="b.html" />
              <div v-else-if="b.kind === 'stats'" class="gdp__stats">
                <NuStatCard v-for="st in b.items" :key="st.label" :stat="st" />
              </div>
              <NuStepsTimeline v-else-if="b.kind === 'steps'" :steps="b.items" class="gdp__steps" />
              <NuCheckList v-else-if="b.kind === 'checks'" :items="b.items" class="gdp__checks" />
              <GuiasEtfCostTable v-else-if="b.kind === 'etf-costs'" :tickers="b.tickers" />
              <GuiasPrecoTetoExemplo v-else-if="b.kind === 'preco-teto-vivo'" :ticker="b.ticker" />
            </template>
          </section>

          <NuCtaBanner :title="doc.cta.title" :subtitle="doc.cta.subtitle" :to="doc.cta.to" class="gdp__cta" />

          <h2 :id="faqId" class="gdp__h2">{{ doc.faqTitle }}</h2>
          <NuFaqAccordion :items="doc.faq" :default-open="-1" variant="compact" class="gdp__faq" />
        </article>
      </div>
    </div>

    <GuiasRelated :items="related" />
  </div>
</template>

<style scoped>
/* o miolo sobre o creme da página (não existe faixa branca de ponta a ponta).
   Um fio de 1,5px na coluna separa o topo do artigo da leitura. */
.gdp {
  background: var(--nu-page);
  padding: 0 max(clamp(20px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(64px, 8.5vw, 110px);
}
.gdp__cols {
  display: flex; gap: clamp(40px, 5vw, 88px); align-items: flex-start;
  border-top: 1.5px solid var(--nu-line-2); padding-top: clamp(32px, 4.4vw, 56px);
}
/* a coluna de leitura: ~720px, 18px com entrelinha 1,65 */
.gdp__article { flex: 1; min-width: 0; max-width: 720px; animation: nu-fade .5s ease both; }

.gdp__h2 {
  margin: clamp(44px, 5vw, 64px) 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-h3); font-weight: 800;
  letter-spacing: -0.025em; line-height: 1.05; text-wrap: balance;
  /* o topo e a régua do mercado grudam (~100px): a âncora para abaixo deles */
  scroll-margin-top: calc(var(--nuh-h, 72px) + 64px);
}
.gdp__h2--first { margin-top: 0; }

.gdp__p {
  margin: 18px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-lg);
  font-weight: 500; line-height: 1.65; text-wrap: pretty;
}
.gdp__p + .gdp__p { margin-top: 16px; }
.gdp__p :deep(strong) { color: var(--nu-ink); font-weight: 800; }
/* cross-links inline (v-html, href interno) — cor de marca + sublinhado sutil */
.gdp__article :deep(a) {
  color: var(--nu-blue-text); font-weight: 700;
  text-decoration: underline; text-underline-offset: 3px;
  text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-blue-soft);
  transition: text-decoration-color .2s;
}
.gdp__article :deep(a:hover) { text-decoration-color: var(--nu-blue); }

.gdp__stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px; margin-top: 30px;
}
.gdp__steps { margin-top: 24px; }
.gdp__checks { margin-top: 22px; }
.gdp__cta { margin-top: clamp(40px, 5vw, 56px); }
.gdp__faq { margin-top: 24px; }

@media (prefers-reduced-motion: reduce) { .gdp__article { animation: none; } }
</style>
