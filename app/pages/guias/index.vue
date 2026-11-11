<script setup lang="ts">
// /guias — o hub dos guias. Desde 03/11/2026 é "A grade com busca"
// (GuiasGrade), escolhida pelo dono entre três direções ("pode manter o 3"):
// a mesma linguagem da /teses, com a busca e os temas numa barra que gruda
// embaixo da régua do mercado e cartões com o começo do sumário de cada guia.
// Saíram o herói creme com as tabs, o card em destaque e a faixa azul da
// newsletter: a assinatura voltou para o rodapé (utils/newsletter-lugares).
//
// Conteúdo: o registry tipado de app/content/guias, lido por
// montarBibliotecaGuias (utils/guiasHub) sem mudar o formato que a rotina
// semanal escreve. Guia novo entra sozinho, no tema da tag dele.
//
// SEO: SSR-first (conteúdo 100% local no HTML), um H1 só, os 21 guias com
// link na 1ª resposta (a busca e os temas só filtram no cliente), canonical
// /guias, JSON-LD BreadcrumbList + ItemList. O ItemList segue o registry
// como era (o card "Análise PETR4", que aponta para /asset/PETR4, continua
// nele e fica fora da grade até o dono decidir). routeRules '/guias'
// cacheia 3600s no nuxt.config.
import { FEATURED_GUIDE, GUIDES, GUIDE_DOCS, guideCardTo } from '~/content/guias'

const biblioteca = montarBibliotecaGuias(GUIDES, GUIDE_DOCS, FEATURED_GUIDE)

// ——— SEO ———
const origin = useSiteOrigin()
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
    `Guias em português claro sobre ações, FIIs, renda fixa, cripto e dividendos: do primeiro aporte à carteira que paga suas contas. Conteúdo aberto da ${MARCA.nome}, sem precisar de conta.`,
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
    { name: 'Início', path: '/' },
    { name: 'Guias', path: '/guias' },
  ],
})
</script>

<template>
  <GuiasGrade :biblioteca="biblioteca" />
</template>
