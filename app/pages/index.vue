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
usePageSeo({
  title: 'Mercado hoje: ações, FIIs e análise com IA',
  description: 'Acompanhe o mercado em tempo real: maiores altas e baixas de ações e FIIs, Tesouro Direto, notícias e o briefing de fechamento por IA. Grátis, sem conta.',
  path: '/',
  breadcrumbs: [{ name: 'Início', path: '/' }],
})
</script>

<template>
  <MercadoContent />
</template>
