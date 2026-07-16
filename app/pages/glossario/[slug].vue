<script setup lang="ts">
// /glossario/[slug] — página de termo do glossário (KIT 2026-07-14).
// SEO IMPRESSIONANTE: hero (termo grande + short + eyebrow com a letra) →
// corpo → termos relacionados (chips) → CARD de backlink forte (rota real) →
// FAQ (NuFaqAccordion, FAQPage) → nav anterior/próximo alfabética + volta pro
// hub. Internal linking (related + backlink) é a alma da página.
//
// Slug inexistente → 404. JSON-LD DefinedTerm + BreadcrumbList + FAQPage (o
// FAQPage sai do NuFaqAccordion). routeRules '/glossario/**' cacheia 86400s.
import { getTerm, relatedTerms, neighbors } from '~/content/glossario'

const slug = String(useRoute().params.slug ?? '')
const term = getTerm(slug)

if (!term) {
  throw createError({ statusCode: 404, statusMessage: 'Termo não encontrado', fatal: true })
}

const related = relatedTerms(term)
const { prev, next } = neighbors(slug)

usePageSeo({
  title: `O que é ${term.term}? Significado e como usar na B3`,
  description: term.short,
  path: `/glossario/${term.slug}`,
  structuredData: [{
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.short,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Glossário do investidor Redentia',
      url: `${useRequestURL().origin}/glossario`,
    },
    inLanguage: 'pt-BR',
  }],
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Glossário', path: '/glossario' },
    { name: term.term, path: `/glossario/${term.slug}` },
  ],
})
</script>

<template>
  <div class="gt">
    <!-- hero -->
    <header class="gt__hero">
      <nav class="gt__crumbs" aria-label="Trilha">
        <NuxtLink to="/glossario" class="gt__crumb">Glossário</NuxtLink>
        <span class="gt__crumb-sep">/</span>
        <span class="gt__crumb gt__crumb--here">{{ term.letter }}</span>
      </nav>
      <h1 class="gt__title">{{ term.term }}</h1>
      <p class="gt__short">{{ term.short }}</p>
    </header>

    <div class="gt__body">
      <article class="gt__article">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p v-for="(para, i) in term.body" :key="i" class="gt__p" v-html="para" />
      </article>

      <!-- termos relacionados -->
      <section v-if="related.length" class="gt__block">
        <h2 class="gt__h2">Termos relacionados</h2>
        <div class="gt__chips">
          <NuxtLink
            v-for="r in related"
            :key="r.slug"
            :to="`/glossario/${r.slug}`"
            class="gt__chip"
          >{{ r.term }}</NuxtLink>
        </div>
      </section>

      <!-- backlink forte pra plataforma -->
      <NuxtLink :to="term.backlink.to" class="gt__cta">
        <div class="gt__cta-text">
          <span class="gt__cta-kicker">Na plataforma</span>
          <span class="gt__cta-label">{{ term.backlink.label }}</span>
        </div>
        <span class="gt__cta-arrow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </NuxtLink>

      <!-- FAQ -->
      <section v-if="term.faq.length" class="gt__block">
        <h2 class="gt__h2">Perguntas frequentes</h2>
        <NuFaqAccordion :items="term.faq" :default-open="-1" variant="compact" class="gt__faq" />
      </section>

      <!-- nav alfabética anterior/próximo -->
      <nav class="gt__nav" aria-label="Navegação alfabética">
        <NuxtLink v-if="prev" :to="`/glossario/${prev.slug}`" class="gt__nav-item gt__nav-item--prev">
          <span class="gt__nav-dir">← Anterior</span>
          <span class="gt__nav-term">{{ prev.term }}</span>
        </NuxtLink>
        <span v-else class="gt__nav-spacer" />
        <NuxtLink v-if="next" :to="`/glossario/${next.slug}`" class="gt__nav-item gt__nav-item--next">
          <span class="gt__nav-dir">Próximo →</span>
          <span class="gt__nav-term">{{ next.term }}</span>
        </NuxtLink>
      </nav>

      <NuxtLink to="/glossario" class="gt__back">Ver todos os termos do glossário</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.gt { background: var(--nu-white); }

.gt__hero {
  background: var(--nu-cream);
  padding: clamp(44px, 6vw, 80px) clamp(22px, 5.5vw, 80px) clamp(36px, 4.5vw, 52px);
  animation: nu-fade .5s ease both;
}
.gt__crumbs { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 800; }
.gt__crumb { color: var(--nu-blue); }
.gt__crumb--here { color: var(--nu-gray-2); }
.gt__crumb-sep { color: var(--nu-gray); }
.gt__title {
  margin: 16px 0 0; color: var(--nu-ink);
  font-size: clamp(40px, 6vw, 76px); font-weight: 800;
  letter-spacing: -0.045em; line-height: 1.02;
}
.gt__short {
  margin: 18px 0 0; color: var(--nu-gray); font-size: clamp(17px, 1.9vw, 22px);
  font-weight: 600; line-height: 1.5; max-width: 680px;
}

.gt__body {
  max-width: 760px; margin: 0 auto;
  padding: clamp(40px, 5.5vw, 72px) clamp(22px, 5.5vw, 40px) clamp(64px, 8vw, 110px);
}
.gt__article { max-width: 760px; }
.gt__p { margin: 0; color: var(--nu-gray-3); font-size: 18px; font-weight: 500; line-height: 1.78; }
.gt__p + .gt__p { margin-top: 18px; }
.gt__p :deep(strong) { color: var(--nu-ink); font-weight: 800; }
.gt__article :deep(a) {
  color: var(--nu-blue); font-weight: 700;
  text-decoration: underline; text-underline-offset: 2px;
  text-decoration-thickness: 1px; text-decoration-color: var(--nu-blue-soft);
}
.gt__article :deep(a:hover) { text-decoration-color: var(--nu-blue); }

.gt__block { margin-top: clamp(40px, 5vw, 56px); }
.gt__h2 {
  margin: 0 0 18px; color: var(--nu-ink); font-size: clamp(22px, 2.4vw, 28px);
  font-weight: 800; letter-spacing: -0.03em;
}
.gt__chips { display: flex; flex-wrap: wrap; gap: 10px; }
.gt__chip {
  display: inline-flex; align-items: center; padding: 10px 18px;
  background: var(--nu-cream); border-radius: var(--nu-r-pill);
  color: var(--nu-ink); font-size: 15px; font-weight: 700;
  transition: background .16s, color .16s;
}
.gt__chip:hover { background: var(--nu-blue-tint); color: var(--nu-blue); }

/* card de backlink forte */
.gt__cta {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  margin-top: clamp(40px, 5vw, 56px);
  background: var(--nu-blue); color: var(--nu-white);
  border-radius: var(--nu-r-tile); padding: clamp(24px, 3vw, 34px) clamp(24px, 3.5vw, 38px);
  transition: background .2s, transform .2s;
}
.gt__cta:hover { background: var(--nu-blue-hover); color: var(--nu-white); transform: translateY(-2px); }
.gt__cta-text { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
.gt__cta-kicker { font-size: 13.5px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.72; }
.gt__cta-label { font-size: clamp(19px, 2.2vw, 25px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
.gt__cta-arrow {
  flex-shrink: 0; width: 52px; height: 52px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: flex; align-items: center; justify-content: center;
  transition: background .2s, transform .2s;
}
.gt__cta:hover .gt__cta-arrow { background: rgba(255, 255, 255, 0.26); transform: translateX(3px); }

.gt__faq { margin-top: 0; }

/* nav anterior/próximo */
.gt__nav {
  display: flex; gap: 14px; margin-top: clamp(48px, 6vw, 68px);
  padding-top: clamp(28px, 3.5vw, 40px); border-top: 1.5px solid var(--nu-cream-2);
}
.gt__nav-item {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px;
  background: var(--nu-cream); border-radius: var(--nu-r-tile); padding: 18px 22px;
  transition: background .16s;
}
.gt__nav-item:hover { background: var(--nu-cream-hover); }
.gt__nav-item--next { text-align: right; align-items: flex-end; }
.gt__nav-spacer { flex: 1; }
.gt__nav-dir { color: var(--nu-blue); font-size: 13.5px; font-weight: 800; }
.gt__nav-term { color: var(--nu-ink); font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }

.gt__back {
  display: inline-block; margin-top: clamp(32px, 4vw, 44px);
  color: var(--nu-blue); font-size: 16px; font-weight: 800;
  text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-blue-soft);
}
.gt__back:hover { text-decoration-color: var(--nu-blue); }

@media (max-width: 640px) {
  .gt__nav { flex-direction: column; }
  .gt__nav-item--next { text-align: left; align-items: flex-start; }
  .gt__nav-spacer { display: none; }
}
</style>
