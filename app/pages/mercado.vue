<script setup lang="ts">
// /mercado — home pública da nova Redentia (PR1). O miolo vive em
// MercadoContent (extraído no PR7: a rota `/` anônima renderiza o mesmo
// conteúdo — dual route). Esta página é a URL pública CANÔNICA e cacheável
// (s-maxage=300 no routeRules); a raiz anônima aponta o canonical pra cá.
usePageSeo({
  title: 'Mercado hoje: ações, FIIs, notícias e análise com IA',
  description: 'Acompanhe o mercado em tempo real: maiores altas e baixas de ações, FIIs e BDRs, taxas do Tesouro Direto, notícias do dia e o briefing de fechamento escrito por IA — grátis, sem conta.',
  breadcrumbs: [{ name: 'Início', path: '/mercado' }],
})
</script>

<template>
  <MercadoContent />
</template>
