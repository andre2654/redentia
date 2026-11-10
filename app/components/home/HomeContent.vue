<script setup lang="ts">
// A home `/` (31/10/2026, refeita a pedido do dono: "pense sobre tudo isso
// como um especialista de produto da Apple"; "a home precisa fazer mais
// sentido e ser mais ÚTIL; hoje ela tem muita informação que quase ninguém
// usa"). O conceito é o dos apps: a pessoa não precisa saber de tudo nem se
// preocupar. Menos seções, cada uma com um trabalho só, e uma ação só na
// página (a chamada para o /assinar).
//
// Quem chega e o que vê primeiro:
//  - visitante: quase sempre gente que buscou "redentia" (84% dos cliques do
//    Google na home, GSC de 90 dias até 28/10/2026). Vê o que a Redentia é
//    (a frase dos 2.000 cenários), a chamada e os três aparelhos; depois o
//    porquê (três cartões), o mercado de hoje, o que é grátis, o FAQ e a
//    chamada de novo.
//  - logado: a resposta do dia, numa frase, como no app (HomeAgora); os
//    ativos que segue (SeguirFaixa, o uso mais comum entre os logados:
//    21% seguem um ativo, 4% têm carteira); o mercado; o que é grátis; o FAQ.
//    Sem carteira, vê também os três cartões: é o passo que falta.
//
// A ordem, de cima para baixo:
//   visitante  HomeHeroVisitante → HomeComoFunciona → HomeBolsa → HomeRankings → HomeMais → FAQ → HomeFecho
//   logado     HomeAgora (tela cheia: o dia, os anéis e três números) → SeguirFaixa → [HomeComoFunciona, sem carteira ou sem assinatura] → HomeMais → FAQ
// SEO fica na página (index.vue): o head não varia por sessão.
const { isAuthenticated, clearSession } = useAuthState()

// resumo da carteira (só logado; anônimo não dispara fetch). Token morto
// (401/403) → limpa a sessão AQUI e a página inteira volta para o conteúdo
// do visitante na mesma resposta SSR.
const resumoData = isAuthenticated.value ? await useCarteiraResumo() : null
if (resumoData?.data.value?.unauthenticated) {
  clearSession() // Set-Cookie de limpeza sai na própria resposta SSR
}
const resumo = computed(() =>
  resumoData?.data.value && !resumoData.data.value.unauthenticated ? resumoData.data.value : null)
const semCarteira = computed(() => !isAuthenticated.value || resumo.value?.state === 'connect')
// quem tem conta e não assina também lê o "como funciona" (o snapshot da
// assinatura chega pelo cliente, carregado pelo HomeAgora)
const assinatura = useAssinatura()
/* Só no dev: o topo novo, na linha "A frase" da /carteira (10/11/2026, o dono:
   "nessa home também, o que a Nubank faria? vamos redesenhar"). ?home=2 troca
   o topo de hoje (HomeAgora) pelo HomeAgoraFrase; no ar nada muda até ele escolher. */
const route = useRoute()
const router = useRouter()
const DEV = import.meta.dev
const topoNovo = computed(() => DEV && route.query.home === '2')
function trocarTopo(novo: boolean) {
  const { home: _, ...resto } = route.query
  void router.replace({ query: novo ? { ...resto, home: '2' } : resto, hash: route.hash })
}
const mostrarComoFunciona = computed(() =>
  semCarteira.value || (assinatura.carregado.value && !assinatura.assinante.value))
</script>

<template>
  <div>
    <HomeAgoraFrase v-if="isAuthenticated && topoNovo" :resumo="resumo" />
    <HomeAgora v-else-if="isAuthenticated" :resumo="resumo" />
    <HomeHeroVisitante v-else />

    <!-- logado: os ativos que a pessoa segue (carga no cliente; sem ativo
         seguido e sem o gancho do primeiro uso, a faixa nem aparece) -->
    <SeguirFaixa v-if="isAuthenticated" />

    <HomeComoFunciona v-if="mostrarComoFunciona" />

    <!-- a bolsa do dia fica para o visitante; o logado tem o Ibovespa no alto da
         tela preta (pedido do dono, 31/10/2026) -->
    <HomeBolsa v-if="!isAuthenticated" />
    <!-- os rankings: as altas e baixas do dia e os da bolsa, com o "Ver todos" -->
    <HomeRankings v-if="!isAuthenticated" />

    <HomeMais />

    <!-- FAQ (id="faq": a CTA da coluna esquerda ancora no próprio accordion).
         O NuFaqAccordion emite o JSON-LD FAQPage com estas perguntas. -->
    <section id="faq" class="mfq">
      <div class="mfq__cols">
        <div class="mfq__left">
          <NuSectionHeading>Ficou com alguma <br>dúvida?</NuSectionHeading>
          <div class="mfq__copy">O que a assinatura inclui, quanto custa, de onde vêm os cenários e como fica o seu dinheiro.</div>
        </div>
        <div class="mfq__right">
          <NuFaqAccordion :items="MERCADO_FAQS" surface="white" />
        </div>
      </div>
    </section>

    <HomeFecho v-if="!isAuthenticated" />

    <!-- só no dev: qual topo a home de quem está logado mostra -->
    <div v-if="DEV && isAuthenticated" class="hct__dev" role="group" aria-label="Topo da home">
      <span class="hct__dev-t">Topo</span>
      <button type="button" class="hct__dev-b" :class="{ 'hct__dev-b--on': !topoNovo }" :aria-pressed="!topoNovo" @click="trocarTopo(false)">Atual</button>
      <button type="button" class="hct__dev-b" :class="{ 'hct__dev-b--on': topoNovo }" :aria-pressed="topoNovo" @click="trocarTopo(true)">A frase</button>
    </div>
  </div>
</template>

<style scoped>
.hct__dev {
  position: fixed; right: 16px; bottom: 84px; z-index: 50; display: flex; align-items: center; gap: 4px; padding: 4px;
  border-radius: var(--nu-r-pill); background: var(--nu-navy); box-shadow: 0 10px 30px -10px rgba(0, 0, 0, .5);
}
.hct__dev-t { padding: 0 8px 0 10px; color: var(--nu-amber-soft); font-size: var(--nu-fs-xs); font-weight: 800; }
.hct__dev-b { height: 28px; padding: 0 12px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--nu-agora-sub); font: inherit; font-size: var(--nu-fs-xs); font-weight: 700; cursor: pointer; }
.hct__dev-b:hover { color: var(--nu-white); }
.hct__dev-b--on { background: var(--nu-white); color: var(--nu-navy); }
/* ——— FAQ (o mesmo da home anterior; o /benchmark-ia e a /teses copiam).
   Creme com os cartões brancos desde 31/10/2026, para alternar com o branco
   do "O que é grátis" logo acima ——— */
.mfq { background: var(--nu-cream); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mfq__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.mfq__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.mfq__copy { color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; margin-top: 22px; max-width: 420px; }
.mfq__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
