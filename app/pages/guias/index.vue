<script setup lang="ts">
// /guias — hub do blog/guias (PR4). Contrato de UX:
// docs/redentia-nu/designs/Redentia Guias Nu.dc.html. O layout default já
// renderiza NuHeader + NuMarketTicker + NuFooter; aqui vive o miolo na ordem
// do design: hero creme (eyebrow + H1 + tabs) → faixa branca com featured +
// grid de cards → newsletter azul.
//
// Conteúdo vem do registry tipado (app/content/guias) — mesma fonte do
// /guias/[slug]. Filtro por tab é client-side sobre a lista (como no mock);
// o featured só aparece em Tudo/Guia Redentia. Guia sem página escrita =
// card "Em breve" (o design pede o grid completo de 9 cards; some só os
// escritos deixaria as tabs FIIs/Renda fixa/Cripto vazias).
//
// SEO: SSR-first (conteúdo 100% local no HTML), canonical /guias, JSON-LD
// BreadcrumbList + ItemList (só itens com destino real). routeRules '/guias'
// cacheia 3600s no nuxt.config.
import { FEATURED_GUIDE, GUIDES, GUIDE_TABS, guideCardTo } from '~/content/guias'

const tab = ref<string>('Tudo')
const showFeatured = computed(() => tab.value === 'Tudo' || tab.value === 'Guia Redentia')
const filtered = computed(() => GUIDES.filter((g) => tab.value === 'Tudo' || g.tag === tab.value))

// ——— SEO ———
const url = useRequestURL()
const origin = `${url.protocol}//${url.host}`
const listable = [
  { name: FEATURED_GUIDE.title, url: `${origin}/guias/${FEATURED_GUIDE.slug}` },
  ...GUIDES
    .map((g) => ({ name: g.title, url: guideCardTo(g) }))
    .filter((g): g is { name: string; url: string } => !!g.url)
    .map((g) => ({ name: g.name, url: `${origin}${g.url}` })),
]

usePageSeo({
  title: 'Guias de investimento: aprenda a investir melhor',
  description:
    'Guias em português claro sobre ações, FIIs, renda fixa, cripto e dividendos: do primeiro aporte à carteira que paga suas contas. Conteúdo aberto do blog da Redentia, sem precisar de conta.',
  path: '/guias',
  structuredData: [{
    '@type': 'ItemList',
    itemListElement: listable.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.name,
      url: g.url,
    })),
  }],
  breadcrumbs: [
    { name: 'Início', path: '/mercado' },
    { name: 'Guias', path: '/guias' },
  ],
})
</script>

<template>
  <div>
    <NuPageHero
      eyebrow="Blog da Redentia"
      subtitle="Do primeiro aporte à carteira que paga suas contas — em português claro."
      size="lg"
    >
      <template #title>Guias para<br>investir melhor.</template>
      <NuFilterPills :items="GUIDE_TABS" :model-value="tab" @update:model-value="tab = $event" />
    </NuPageHero>

    <section class="ghb">
      <GuiasFeaturedCard
        v-if="showFeatured"
        :to="`/guias/${FEATURED_GUIDE.slug}`"
        :tag="FEATURED_GUIDE.tag"
        :meta-line="`${FEATURED_GUIDE.minutes} min de leitura · ${FEATURED_GUIDE.updatedShort}`"
        :title="FEATURED_GUIDE.title"
        :summary="FEATURED_GUIDE.summary"
        cta="Ler o guia"
        class="ghb__featured"
      />
      <div class="ghb__grid">
        <GuiasCard
          v-for="(g, i) in filtered" :key="g.title"
          :title="g.title" :description="g.description" :tag="g.tag"
          :minutes="g.minutes" :to="guideCardTo(g)"
          :gradient="((i % 3) + 1) as 1 | 2 | 3"
        />
      </div>
    </section>

    <NuNewsletterBand
      subtitle="Um e-mail por semana. Sem spam, cancele quando quiser."
      placeholder="Seu melhor e-mail"
      cta="Assinar"
    >
      <template #title>Os melhores guias,<br>toda semana.</template>
    </NuNewsletterBand>
  </div>
</template>

<style scoped>
.ghb {
  background: var(--nu-white);
  padding: clamp(48px, 6vw, 80px) clamp(22px, 5.5vw, 80px) clamp(64px, 8.5vw, 110px);
  animation: nu-fade .5s ease both;
}
.ghb__featured { margin-bottom: 16px; }
.ghb__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 16px;
}
</style>
