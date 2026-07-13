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

// Banner contextual (PR-R6): SÓ quando conectado ('patrimonio') declaramos as
// seções → o layout troca o ticker pelo NuSectionRail. No estado 'connect'
// (sem Open Finance) a lista sai vazia → o composable zera o estado → fica o
// ticker "Mercado agora". Cada seção só entra na lista se seu dado existir
// (MESMA condição do template abaixo), então o rail nunca aponta pra um #id
// que não está no DOM. Labels/ordem = print do dono; ids batem com o template.
const railSections = computed<RailSection[]>(() => {
  const p = payload.value
  if (!p || p.hero.state !== 'patrimonio') return []
  const s: RailSection[] = []
  if (p.chart) s.push({ id: 'desempenho', label: 'Desempenho' })
  if (p.groups.length && p.positionsSub) s.push({ id: 'posicoes', label: 'Posições' })
  if (p.raiox) s.push({ id: 'raio-x', label: 'Raio-X da carteira' })
  if (p.income) s.push({ id: 'renda-passiva', label: 'Renda passiva' })
  if (p.movements) s.push({ id: 'movimentacoes', label: 'Movimentações' })
  if (p.heatmap) s.push({ id: 'pnl', label: 'P&L mês a mês' })
  return s
})
useSectionRail(railSections, { pageLabel: 'Carteira' })

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
    <NuPortfolioChart v-if="payload.chart" id="desempenho" class="car-sec" :chart="payload.chart" />
    <CarteiraPositions v-if="payload.groups.length && payload.positionsSub" id="posicoes" class="car-sec" :sub="payload.positionsSub" :groups="payload.groups" />
    <CarteiraRaioX v-if="payload.raiox" id="raio-x" class="car-sec" :raiox="payload.raiox" />
    <CarteiraIncome v-if="payload.income" id="renda-passiva" class="car-sec" :income="payload.income" />
    <CarteiraMovements v-if="payload.movements" id="movimentacoes" class="car-sec" :movements="payload.movements" />
    <CarteiraHeatmap v-if="payload.heatmap" id="pnl" class="car-sec" :heatmap="payload.heatmap" />
  </div>
</template>

<style scoped>
/* Alvos do rail (PR-R6): scroll-margin compensa o header sticky (--nuh-h) + a
   própria faixa do rail (~51px) pra a seção parar logo abaixo dela. O scoped
   alcança a raiz de cada componente-filho (todos têm 1 root <section>). */
.car-sec { scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
</style>
