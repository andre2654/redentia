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

// Só apresentação: o parágrafo que o conteúdo já marca como "Exemplo
// ilustrativo:" vira o cartão creme com o corte, e a "Ressalva honesta:" ganha
// o fio âmbar de atenção. O texto é o mesmo, palavra por palavra.
const ehExemplo = (html: string) => html.startsWith('<strong>Exemplo ilustrativo:</strong>')
const ehRessalva = (html: string) => html.startsWith('Ressalva honesta:')
// ROBUSTEZ (11/11/2026): a leitura como documento (720px, 18px/1,65), o resto
// abaixo da dobra entra ao chegar (v-revelar); anterior/próximo com a seta que
// anda para o lado dela; "Ver todos os termos" é o NuLinkSeta; tudo em token.

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
      name: `Glossário do investidor ${MARCA.nome}`,
      url: `${useSiteOrigin()}/glossario`,
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
      <nav class="gt__crumbs nu-eyebrow" aria-label="Trilha">
        <MarcaCorte />
        <NuxtLink to="/glossario" class="gt__crumb">Glossário</NuxtLink>
        <span class="gt__crumb-sep">/</span>
        <span class="gt__crumb gt__crumb--here">{{ term.letter }}</span>
      </nav>
      <h1 class="gt__title">{{ term.term }}</h1>
      <p class="gt__short">{{ term.short }}</p>
    </header>

    <div class="gt__body">
      <article v-contexto-chat="{ id: `glossario:${slug}`, tipo: 'secao', rotulo: rotuloCurto(term.term), texto: [`${term.term}: ${term.short}`, ...term.body.map((p) => p.replace(/<[^>]+>/g, ''))].join('\n') }" class="gt__article">
        <template v-for="(para, i) in term.body" :key="i">
          <div v-if="ehExemplo(para)" class="gt__exemplo">
            <MarcaCorte :largura="20" />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p class="gt__p" v-html="para" />
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p v-else class="gt__p" :class="{ 'gt__p--ressalva': ehRessalva(para) }" v-html="para" />
        </template>
      </article>

      <!-- no computador os relacionados e o atalho da plataforma sobem para a
           coluna da direita (a ordem no HTML é a mesma de sempre) -->
      <aside class="gt__lado">
      <!-- termos relacionados -->
      <section v-if="related.length" class="gt__block gt__block--rel">
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
        <MarcaCorte class="gt__cta-corte nu-corte-fundo" :largura="300" cor="var(--nu-white)" />
        <div class="gt__cta-text">
          <span class="gt__cta-kicker">Na plataforma</span>
          <span class="gt__cta-label">{{ term.backlink.label }}</span>
        </div>
        <span class="gt__cta-arrow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </NuxtLink>
      </aside>

      <!-- FAQ -->
      <section v-if="term.faq.length" v-revelar class="gt__block gt__block--faq">
        <h2 class="gt__h2">Perguntas frequentes</h2>
        <NuFaqAccordion :items="term.faq" :default-open="-1" variant="compact" class="gt__faq" />
      </section>

      <!-- nav alfabética anterior/próximo -->
      <nav v-revelar class="gt__nav" aria-label="Navegação alfabética">
        <NuxtLink v-if="prev" :to="`/glossario/${prev.slug}`" class="gt__nav-item gt__nav-item--prev">
          <span class="gt__nav-dir"><svg class="gt__nav-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H5M10.5 6.5 5 12l5.5 5.5" /></svg>Anterior</span>
          <span class="gt__nav-term">{{ prev.term }}</span>
        </NuxtLink>
        <span v-else class="gt__nav-spacer" />
        <NuxtLink v-if="next" :to="`/glossario/${next.slug}`" class="gt__nav-item gt__nav-item--next">
          <span class="gt__nav-dir">Próximo<svg class="gt__nav-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg></span>
          <span class="gt__nav-term">{{ next.term }}</span>
        </NuxtLink>
      </nav>

      <p class="gt__back"><NuLinkSeta to="/glossario" tom="tinta">Ver todos os termos do glossário</NuLinkSeta></p>
    </div>
  </div>
</template>

<style scoped>
/* O termo na personalidade da Aportou (11/11/2026): tudo sobre o creme da
   página, trilha no eyebrow com o corte, título em 800, chips de 44px, o
   painel cobalto do backlink e fios de 1,5px. Conteúdo e ordem iguais.
   Robustez (11/11/2026): a coluna do site, a entrada em token, os estados de
   ponteiro, apertado e foco em tudo o que é clicável. */
.gt { background: var(--nu-page); }

.gt__hero {
  padding: clamp(44px, 6vw, 80px) var(--nu-coluna) clamp(36px, 4.5vw, 52px);
  border-bottom: 1px solid var(--nu-line-2);
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both;
}
.gt__crumb {
  color: var(--nu-ink); text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; text-decoration-color: transparent;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
a.gt__crumb:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.gt__crumb--here { color: var(--nu-gray); }
.gt__crumb-sep { color: var(--nu-sand); }
.gt__title {
  margin: 18px 0 0; color: var(--nu-ink);
  font-size: var(--nu-fs-hero); font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display); line-height: .98; text-wrap: balance;
}
/* a definição em destaque: o lead grande, em carvão */
.gt__short {
  margin: 20px 0 0; color: var(--nu-ink); font-size: clamp(20px, 2vw, 27px);
  font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-titulo); line-height: 1.35; max-width: 30em; text-wrap: pretty;
}

.gt__body {
  padding: clamp(36px, 4.6vw, 64px) var(--nu-coluna) clamp(72px, 8vw, 128px);
  animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) var(--nu-passo-cascata) both;
}
.gt__body > * { max-width: 720px; }
.gt__article { max-width: 720px; }
.gt__p { margin: 0; color: var(--nu-gray-3); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.65; text-wrap: pretty; }
.gt__article > * + * { margin-top: 18px; }
.gt__p :deep(strong) { color: var(--nu-ink); font-weight: var(--nu-w-forte); }
/* o exemplo que o texto já marca: cartão creme com o corte */
.gt__exemplo {
  display: flex; align-items: flex-start; gap: 14px; padding: 22px 24px; border-radius: var(--nu-r-panel);
  background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
}
.gt__article > .gt__exemplo, .gt__article > .gt__exemplo + * { margin-top: 24px; }
.gt__exemplo :deep(.mkc) { margin-top: 6px; }
.gt__exemplo .gt__p { font-size: var(--nu-fs-md); line-height: 1.6; }
/* a ressalva: fio âmbar de atenção à esquerda */
.gt__p--ressalva { padding-left: 20px; border-left: 3px solid var(--nu-amber); }
.gt__article :deep(a) {
  color: var(--nu-blue-text); font-weight: var(--nu-w-medio);
  text-decoration: underline; text-underline-offset: 3px;
  text-decoration-thickness: 1.5px; text-decoration-color: var(--nu-blue-soft);
  transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor);
}
.gt__article :deep(a:hover) { color: var(--nu-blue-hover); text-decoration-color: currentColor; }

.gt__block { margin-top: clamp(40px, 5vw, 56px); }
.gt__h2 {
  margin: 0 0 18px; color: var(--nu-ink); font-size: clamp(24px, 2.4vw, 30px);
  font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.08;
}
.gt__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.gt__chip {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px;
  background: var(--nu-cream-2); border-radius: var(--nu-r-pill); -webkit-tap-highlight-color: transparent;
  color: var(--nu-ink); font-size: 14.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.gt__chip:hover { background: var(--nu-ink); color: var(--nu-white); }
.gt__chip:active { transform: scale(.97); }

/* o backlink forte: painel cobalto com o corte gigante a 8% */
.gt__cta {
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  margin-top: clamp(40px, 5vw, 56px);
  background: var(--nu-grad-cobalto); color: var(--nu-white); -webkit-tap-highlight-color: transparent;
  border-radius: var(--nu-r-card); padding: clamp(24px, 3vw, 34px) clamp(24px, 3.5vw, 38px);
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
@media (hover: hover) { .gt__cta:hover { color: var(--nu-white); transform: translateY(-2px); box-shadow: var(--nu-shadow-card); } }
.gt__cta:active { transform: scale(.99); transition-duration: var(--nu-dur-rapida); }
.gt__cta:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.gt__cta-corte { position: absolute; right: 40px; bottom: -110px; opacity: .08; pointer-events: none; }
.gt__cta-text { position: relative; display: flex; flex-direction: column; gap: 9px; min-width: 0; }
.gt__cta-kicker { color: var(--nu-blue-on-blue); font-size: var(--nu-fs-marca); font-weight: var(--nu-w-medio); letter-spacing: 0.2em; text-transform: uppercase; }
.gt__cta-label { font-size: clamp(20px, 2.2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.15; text-wrap: balance; }
.gt__cta-arrow {
  position: relative; flex-shrink: 0; width: 46px; height: 46px; border-radius: 50%;
  background: var(--nu-white); color: var(--nu-blue);
  display: flex; align-items: center; justify-content: center;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida);
}
.gt__cta-arrow svg { width: 20px; height: 20px; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.gt__cta:hover .gt__cta-arrow { transform: scale(1.04); }
.gt__cta:hover .gt__cta-arrow svg { transform: translateX(3px); }

.gt__faq { margin-top: 0; }

/* nav anterior/próximo */
.gt__nav {
  display: flex; gap: 16px; margin-top: clamp(48px, 6vw, 72px);
  padding-top: clamp(28px, 3.5vw, 40px); border-top: 1px solid var(--nu-line);
}
.gt__nav-item {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px;
  background: var(--nu-card); border-radius: var(--nu-r-tile); padding: 18px 22px;
  box-shadow: var(--nu-shadow-quente); -webkit-tap-highlight-color: transparent;
  transition: transform var(--nu-dur-media) var(--nu-ease-saida), box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
@media (hover: hover) { .gt__nav-item:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); } }
.gt__nav-item:active { transform: scale(.99); transition-duration: var(--nu-dur-rapida); }
.gt__nav-item:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.gt__nav-item--next { text-align: right; align-items: flex-end; }
.gt__nav-spacer { flex: 1; }
.gt__nav-dir {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase;
}
/* a seta anda para o lado dela */
.gt__nav-seta { width: 14px; height: 14px; flex: none; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.gt__nav-item--prev:hover .gt__nav-seta { transform: translateX(-3px); }
.gt__nav-item--next:hover .gt__nav-seta { transform: translateX(3px); }
.gt__nav-term { color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); }

.gt__back { margin: clamp(32px, 4vw, 44px) 0 0; font-size: var(--nu-fs-md); }

/* ——— computador: a leitura na coluna da esquerda (alinhada ao título) e, à
   direita, os relacionados e o atalho da plataforma, que acompanham a rolagem ——— */
@media (min-width: 1080px) {
  .gt__body {
    display: grid; grid-template-columns: minmax(0, 720px) minmax(300px, 380px);
    justify-content: space-between; column-gap: clamp(48px, 6vw, 96px); align-items: start;
  }
  .gt__body > * { grid-column: 1; }
  .gt__lado {
    grid-column: 2; grid-row: 1 / span 5; position: sticky; top: calc(var(--nuh-h, 72px) + 64px);
    padding: 26px; border-radius: var(--nu-r-card); background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
  }
  .gt__lado .gt__block--rel { margin-top: 0; }
  .gt__lado .gt__h2 {
    margin-bottom: 14px; font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-caixa); text-transform: uppercase; line-height: 1.3;
  }
  .gt__lado .gt__chips { gap: 8px; }
  .gt__lado .gt__chip { background: var(--nu-page); }
  .gt__lado .gt__chip:hover { background: var(--nu-ink); }
  .gt__lado .gt__cta { margin-top: 24px; flex-direction: column; align-items: flex-start; gap: 22px; padding: 26px; border-radius: var(--nu-r-panel); }
  .gt__lado .gt__cta-label { font-size: 22px; }
  .gt__lado .gt__block--rel + .gt__cta { margin-top: 24px; }
  .gt__lado > .gt__cta:first-child { margin-top: 0; }
}
@media (max-width: 640px) {
  .gt__nav { flex-direction: column; }
  .gt__nav-item--next { text-align: left; align-items: flex-start; }
  .gt__nav-spacer { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .gt__hero, .gt__body { animation: none; }
  .gt__cta, .gt__nav-item, .gt__chip, .gt__cta-arrow, .gt__cta-arrow svg, .gt__nav-seta, .gt__crumb { transition: none; }
}
</style>
