<script setup lang="ts">
// Home única `/`. Desde 31/10/2026 é a página da Redentia como produto (o
// pedido do dono: os apps, a frase dos 2.000 cenários e uma chamada só para o
// /assinar), com o mercado do dia mais abaixo. Anônimo e logado veem a mesma
// URL com seções diferentes; a consciência de sessão vive DENTRO do
// HomeContent (useAuthState), e esta página só cuida do SEO.
// A carteira completa segue página separada em /carteira (privada).
//
// SEO: '/' é a URL pública canônica (o /mercado 301a pra cá), head único,
// indexável; pro logado a variação de seção NÃO muda o head. O routeRules já
// serve '/' com private/no-store (rota com variante logada: CDN não varia
// por cookie, regra dura documentada).
// Title e description trocados em 31/10/2026: 84% dos cliques do Google na
// home vêm da busca "redentia" (GSC, 90 dias até 28/10), gente que já ouviu
// falar e quer saber o que é. "Mercado hoje" não trazia clique nenhum; o
// título agora diz o produto, com o número que o H1 diz.
//
// WebSite só na home (06/10/2026): é dele que o Google tira o NOME do site
// nos resultados, e a home não declarava nenhum. O SearchAction aponta pro
// /busca?q=, que já abre com a consulta preenchida. O Google aposentou a
// caixa de busca nos sitelinks em 11/2024, então o SearchAction não muda o
// resultado do Google; fica por ser schema válido e verdadeiro.
const siteOrigin = useSiteOrigin()
usePageSeo({
  title: 'Sua carteira testada em 2.000 cenários, com IA',
  description: 'A IA da Redentia junta a sua carteira de qualquer banco, testa em 2.000 cenários de cinco anos e vigia todo dia. Mercado de hoje, calculadoras e guias grátis.',
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
  <HomeContent />
</template>
