<script setup lang="ts">
// Rota dupla (decisão André 2026-07-11, PLANO §1): deslogado vê o conteúdo do
// Mercado (URL canônica cacheável = /mercado; aqui o canonical aponta pra lá),
// logado vê a Home Nu (PR7). `/` é private/no-store no routeRules — a CDN não
// varia por cookie (lição documentada do Frontend).
//
// AUTH/SSR: o SSR decide a variante pelo cookie `nu:token`. Se QUALQUER coisa
// der 401/403 no /auth/me (token expirado/revogado), o useHome devolve
// `unauthenticated: true` → limpamos a sessão AQUI e caímos pro conteúdo
// anônimo na mesma resposta (sem redirect pro /login: o conteúdo público É a
// resposta certa pra `/` sem sessão; o padrão 401→/login do useApi segue
// valendo pro miolo logado navegável tipo /carteira). Decisão documentada.
const auth = useAuthState()

// bifurcação estável por render: cookie presente = tenta a Home
const hasToken = !!auth.token.value
const home = hasToken ? await useHome() : null

const sessionDead = computed(() => home?.data.value?.unauthenticated === true)
if (sessionDead.value) {
  auth.clearSession() // Set-Cookie de limpeza sai na própria resposta SSR
}

const showHome = computed(() => hasToken && !sessionDead.value && !!home?.data.value)
const payload = computed(() => home?.data.value ?? null)

if (hasToken && !sessionDead.value) {
  // Home logada: conteúdo pessoal — noindex + title do produto. O no-store
  // já vem do routeRules.
  usePageSeo({
    title: 'Início',
    description: 'Seu patrimônio, suas posições, suas teses e o que fazer agora — a Redentia com uma IA do seu lado.',
    robots: 'noindex, nofollow',
  })
} else {
  // Variante anônima: MESMO SEO do conteúdo Mercado (title + BreadcrumbList),
  // com canonical apontando pra URL pública canônica /mercado (PLANO §1) —
  // evita conteúdo duplicado entre `/` e /mercado.
  usePageSeo({
    title: 'Mercado hoje: ações, FIIs, notícias e análise com IA',
    description: 'Acompanhe o mercado em tempo real: maiores altas e baixas de ações, FIIs e BDRs, taxas do Tesouro Direto, notícias do dia e o briefing de fechamento escrito por IA — grátis, sem conta.',
    path: '/mercado',
    breadcrumbs: [{ name: 'Início', path: '/mercado' }],
  })
}
</script>

<template>
  <div v-if="showHome && payload">
    <HomeHero :hero="payload.hero" />
    <HomeChart v-if="payload.chart" :chart="payload.chart" />
    <HomePositions :positions="payload.positions" />
    <HomeTheses v-if="payload.theses" :theses="payload.theses" />
    <HomeActions
      v-if="payload.actions.length"
      :cards="payload.actions"
      :refreshing="home?.pending.value"
      @refresh="home?.refresh()"
    />
    <HomeBriefing v-if="payload.briefing" :briefing="payload.briefing" />
    <HomeNews :news="payload.news" />
  </div>
  <MercadoContent v-else />
</template>
