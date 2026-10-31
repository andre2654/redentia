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
//   visitante  HomeHeroVisitante → HomeComoFunciona → HomeBolsa → HomeMais → FAQ → HomeFecho
//   logado     HomeAgora (tela cheia, Ibovespa no alto) → SeguirFaixa → [HomeComoFunciona, sem carteira ou sem assinatura] → HomeMais → FAQ
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
const mostrarComoFunciona = computed(() =>
  semCarteira.value || (assinatura.carregado.value && !assinatura.assinante.value))
</script>

<template>
  <div>
    <HomeAgora v-if="isAuthenticated" :resumo="resumo" />
    <HomeHeroVisitante v-else />

    <!-- logado: os ativos que a pessoa segue (carga no cliente; sem ativo
         seguido e sem o gancho do primeiro uso, a faixa nem aparece) -->
    <SeguirFaixa v-if="isAuthenticated" />

    <HomeComoFunciona v-if="mostrarComoFunciona" />

    <!-- a bolsa do dia fica para o visitante; o logado tem o Ibovespa no alto da
         tela preta (pedido do dono, 31/10/2026) -->
    <HomeBolsa v-if="!isAuthenticated" />

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
          <NuFaqAccordion :items="MERCADO_FAQS" />
        </div>
      </div>
    </section>

    <HomeFecho v-if="!isAuthenticated" />
  </div>
</template>

<style scoped>
/* ——— FAQ (o mesmo da home anterior; o /benchmark-ia e a /teses copiam) ——— */
.mfq { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.mfq__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.mfq__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.mfq__copy { color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; margin-top: 22px; max-width: 420px; }
.mfq__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
