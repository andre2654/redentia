<script setup lang="ts">
// Home única `/` (direção do dono, 2026-07-13): o MERCADO é a página inicial
// pros DOIS casos. Anônimo vê o conteúdo público exatamente como era; logado
// vê o MESMO MercadoContent com SEÇÕES variadas (hero sem form de signup +
// resumo compacto da carteira no lugar da banda de marketing "conecte seu
// open finance" + CTAs de conta escondidos). A consciência de auth vive
// DENTRO do MercadoContent (useAuthState) — esta página só cuida do SEO.
// A carteira completa segue página separada em /carteira (privada).
//
// SEO: '/' é a URL pública canônica (o /mercado 301a pra cá) — head único,
// indexável; pro logado a variação de seção NÃO muda o head. O routeRules já
// serve '/' com private/no-store (rota com variante logada — CDN não varia
// por cookie, regra dura documentada).
//
// WebSite só na home (06/10/2026): é dele que o Google tira o NOME do site
// nos resultados, e a home não declarava nenhum. O SearchAction aponta pro
// /busca?q=, que já abre com a consulta preenchida. O Google aposentou a
// caixa de busca nos sitelinks em 11/2024, então o SearchAction não muda o
// resultado do Google; fica por ser schema válido e verdadeiro.
const siteOrigin = useSiteOrigin()
usePageSeo({
  title: 'Mercado hoje: ações, FIIs e análise com IA',
  description: 'Acompanhe o mercado em tempo real: maiores altas e baixas de ações e FIIs, Tesouro Direto, notícias e o briefing de fechamento por IA. Grátis, sem conta.',
  path: '/',
  structuredData: [{
    '@type': 'WebSite',
    '@id': `${siteOrigin}/#website`,
    name: 'Redentia',
    url: `${siteOrigin}/`,
    inLanguage: 'pt-BR',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteOrigin}/busca?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }],
  breadcrumbs: [{ name: 'Início', path: '/' }],
  // SEM dateModified de propósito (23/09/2026): o painel do dia (altas,
  // baixas, briefing) é carregado no cliente e o HTML do servidor sai com o
  // seed, então não existe data de dado verificável aqui. Antes ia o "último
  // pregão" do calendário, que no congelamento de 28/08–17/09 dizia "hoje"
  // sobre números parados. O <lastmod> do sitemap usa o pregão real mais
  // recente (site-pages.ts).
})
</script>

<template>
  <MercadoContent />
</template>
