<script setup lang="ts">
// /carteira (PR8) — a página mais densa e pessoal do app. Contrato de UX:
// docs/redentia-nu/designs/Redentia Carteira Nu.dc.html.
//
// AUTH OBRIGATÓRIA (diretriz do dono): anônimo → redirect /login?redirect=
// via middleware inline (mesmo padrão do /login); token morto detectado no
// fetch (401 no /portfolio) → limpa sessão + mesmo redirect (padrão useApi).
//
// TELA DINÂMICA POR CARD (diretriz nº1): sem Open Finance conectado a página
// VIRA a experiência de conexão (CarteiraHero state 'connect' + Pluggy
// Connect); cada seção decide cheio | parcial | vazio no useCarteira — seções
// sem dado real simplesmente não renderizam. Nunca número inventado.
definePageMeta({
  middleware: [
    (to) => {
      const token = useCookie<string | null>('nu:token')
      if (token.value) return
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    },
  ],
})

const { clearSession } = useAuthState()
const carteira = await useCarteira()
const payload = computed(() => carteira.data.value)

// token expirado/revogado no meio do caminho: limpa e volta pro login
// (o Set-Cookie de limpeza sai na própria resposta SSR).
if (payload.value?.unauthenticated) {
  clearSession()
  await navigateTo('/login?redirect=%2Fcarteira', { replace: true })
}

// Página pessoal: fora do índice (noindex) — o `private, no-store` já vem do
// routeRules do nuxt.config.
usePageSeo({
  title: 'Carteira',
  description: 'Seu patrimônio consolidado pelo Open Finance: posições, renda passiva, movimentações e o Raio-X da Redentia AI.',
  robots: 'noindex, nofollow',
})

function onConnected() {
  // conexão criada no widget → re-busca o payload (as posições chegam quando
  // o sync inicial do backend termina; o refresh mostra o que já existir)
  carteira.refresh()
}
</script>

<template>
  <div v-if="payload">
    <CarteiraHero :hero="payload.hero" :allocation="payload.allocation" @connected="onConnected" />
    <NuPortfolioChart v-if="payload.chart" :chart="payload.chart" />
    <CarteiraPositions v-if="payload.groups.length && payload.positionsSub" :sub="payload.positionsSub" :groups="payload.groups" />
    <CarteiraRaioX v-if="payload.raiox" :raiox="payload.raiox" />
    <CarteiraIncome v-if="payload.income" :income="payload.income" />
    <CarteiraMovements v-if="payload.movements" :movements="payload.movements" />
    <CarteiraHeatmap v-if="payload.heatmap" :heatmap="payload.heatmap" />
  </div>
</template>
