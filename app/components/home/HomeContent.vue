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
//  - logado: a resposta do dia, numa frase, como no app (HomeAgoraFrase); os
//    ativos que segue (SeguirFaixa, o uso mais comum entre os logados:
//    21% seguem um ativo, 4% têm carteira); o mercado; o que é grátis; o FAQ.
//    Sem carteira, vê também os três cartões: é o passo que falta.
//
// A ordem, de cima para baixo:
//   visitante  HomeHeroVisitante → HomeComoFunciona → HomeOQueNaoE → HomeBolsa → HomeRankings → HomeMais → FAQ → HomeFecho
//   logado     HomeAgoraFrase (o dia numa frase, o gráfico de 12 meses e três números) → SeguirFaixa → [HomeComoFunciona → HomeOQueNaoE, sem carteira ou sem assinatura] → HomeMais → FAQ
// SEO fica na página (index.vue): o head não varia por sessão.
//
// Aportou (11/11/2026): a mesma home, com a personalidade da marca nova. As
// seções alternam o fundo e nenhuma é branca de ponta a ponta:
//   herói (carvão ao preto do palco) → como funciona (creme da página) → o que
//   a Aportou não é (sálvia) → a bolsa (carvão) → rankings (faixa quente) →
//   de graça (creme) → FAQ (faixa quente) → o fecho (painel azul sobre o creme)
// Do quadro Home entrou uma peça só, o "O que a Aportou não é" com o cartão
// "SEUS DADOS" (HomeOQueNaoE), depois do "como funciona", para quem ainda vai
// conectar a carteira. Planos, fatos e o cartão "PERGUNTE À IA" do quadro
// trazem números de exemplo e não entraram.
//
// Robustez (11/11/2026, docs/aportou/robustez.md): toda seção abaixo da dobra
// entra com o v-revelar (dentro de cada peça; aqui, as duas colunas do FAQ),
// respira no ritmo de seção do sistema (72 a 128 px) e usa a coluna de 1.240
// (--nu-coluna), a mesma em todas.
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
// assinatura chega pelo cliente, carregado pelo HomeAgoraFrase)
const assinatura = useAssinatura()
const mostrarComoFunciona = computed(() =>
  semCarteira.value || (assinatura.carregado.value && !assinatura.assinante.value))
</script>

<template>
  <div>
    <HomeAgoraFrase v-if="isAuthenticated" :resumo="resumo" />
    <HomeHeroVisitante v-else />

    <!-- logado: os ativos que a pessoa segue (carga no cliente; sem ativo
         seguido e sem o gancho do primeiro uso, a faixa nem aparece) -->
    <SeguirFaixa v-if="isAuthenticated" />

    <HomeComoFunciona v-if="mostrarComoFunciona" />
    <!-- o que a Aportou não é e o que ela faz com os dados: a peça do quadro
         que responde a quem ainda vai conectar a carteira -->
    <HomeOQueNaoE v-if="mostrarComoFunciona" />

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
        <div v-revelar class="mfq__left">
          <NuSectionHeading eyebrow="Perguntas frequentes">Ficou com alguma <br>dúvida?</NuSectionHeading>
          <div class="mfq__copy">O que a assinatura inclui, quanto custa, de onde vêm os cenários e como fica o seu dinheiro.</div>
        </div>
        <div v-revelar class="mfq__right">
          <NuFaqAccordion :items="MERCADO_FAQS" surface="white" />
        </div>
      </div>
    </section>

    <HomeFecho v-if="!isAuthenticated" />

  </div>
</template>

<style scoped>
/* ——— FAQ (o mesmo da home anterior; o /benchmark-ia e a /teses copiam).
   Aportou: a faixa quente da marca, com os cartões brancos por cima, no
   contêiner de 1.240 px ——— */
.mfq { background: var(--nu-band); padding: clamp(72px, 8vw, 128px) var(--nu-coluna); }
.mfq__cols { display: flex; gap: clamp(32px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.mfq__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.mfq__copy { color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; margin-top: 20px; max-width: 420px; }
.mfq__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
</style>
