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
  structuredData: [{
    '@type': 'Article',
    headline: doc.title,
    description: doc.description,
    datePublished: doc.datePublished,
    dateModified: doc.dateModified,
    author: { '@type': 'Organization', name: 'Redentia' },
    articleSection: doc.tag,
    inLanguage: 'pt-BR',
  }],
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
            kicker="Redentia AI"
            text="Dúvida no meio do guia? Pergunte à IA."
            to="/busca"
          />
        </NuTocSidebar>

        <article class="gdp__article">
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
.gdp {
  background: var(--nu-white);
  padding: clamp(48px, 6vw, 80px) clamp(22px, 5.5vw, 80px) clamp(64px, 8.5vw, 110px);
}
.gdp__cols { display: flex; gap: clamp(40px, 5vw, 88px); align-items: flex-start; }
.gdp__article { flex: 1; min-width: 0; max-width: 760px; }

.gdp__h2 {
  margin: clamp(44px, 5vw, 64px) 0 0; color: var(--nu-ink);
  font-size: clamp(26px, 3vw, 38px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.1;
  /* 40px do design + a faixa "Mercado agora" sticky (~48px) do layout */
  scroll-margin-top: 88px;
}
.gdp__h2--first { margin-top: 0; }

.gdp__p {
  margin: 18px 0 0; color: var(--nu-gray-3); font-size: 17.5px;
  font-weight: 500; line-height: 1.75;
}
.gdp__p + .gdp__p { margin-top: 16px; }
.gdp__p :deep(strong) { font-weight: 800; }

.gdp__stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 14px; margin-top: 30px;
}
.gdp__steps { margin-top: 24px; }
.gdp__checks { margin-top: 22px; }
.gdp__cta { margin-top: clamp(40px, 5vw, 56px); }
.gdp__faq { margin-top: 24px; }
</style>
