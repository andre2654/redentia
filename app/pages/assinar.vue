<script setup lang="ts">
// /assinar — a página do plano único (decisão do dono, 31/10/2026): uma
// assinatura só, "Redentia", R$ 19,99 por mês, com 3 dias grátis e cartão no
// Checkout da Stripe. É para cá que o resto do site aponta (o CTA da home, o
// paywall da /carteira, a folha da conversa).
//
// O que cada um vê:
//  - deslogado: a oferta; o botão leva ao /login e volta aqui com ?continuar=1,
//    que segue direto para o Checkout (um clique só, mesmo com o login no meio);
//  - logado sem assinatura: o botão abre o Checkout;
//  - logado com assinatura (teste, ativa, em carência): vai para a /carteira;
//  - logado com cobrança pendente: o botão leva ao portal da Stripe;
//  - ?cancelado=1 (voltou do Checkout sem assinar): uma nota gentil.
//
// SSR com o snapshot da assinatura (useAssinaturaDaPagina) para o assinante
// sair daqui sem ver a oferta piscar. A rota é private/no-store (nuxt.config).
import { cancelouNoCheckout } from '~/utils/assinatura'

const route = useRoute()
const router = useRouter()
const { clearSession, isAuthenticated } = useAuthState()
const assinatura = useAssinatura()

// estado e hooks ANTES do 1º await (hook depois do await some em silêncio)
const continuar = route.query.continuar === '1'
const cancelado = cancelouNoCheckout(route.query)
onMounted(() => {
  if (!continuar) return
  // tira o ?continuar da URL (voltar para cá não reabre o Checkout) e segue
  const query = { ...route.query }
  delete query.continuar
  void router.replace({ query })
  const s = assinatura.situacao.value
  if (isAuthenticated.value && (s === 'sem' || s === 'desconhecido')) void assinatura.comecar()
})

const { sessaoMorta } = await useAssinaturaDaPagina()

if (sessaoMorta.value) clearSession()
else if (['teste', 'ativa', 'atrasada'].includes(assinatura.situacao.value)) {
  await navigateTo('/carteira', { replace: true })
}

const pendente = computed(() => assinatura.situacao.value === 'pendente')

usePageSeo({
  title: 'Assinatura Redentia',
  description: 'Sua carteira de qualquer banco pelo Open Finance, testada em 2.000 cenários, com a IA que responde com os seus números. R$ 19,99 por mês, 3 dias grátis na primeira assinatura.',
  path: '/assinar',
})
</script>

<template>
  <div class="asn">
    <AssinaturaVitrine
      :eyebrow="pendente ? 'Pagamento pendente' : ''"
      :modo="pendente ? 'pendente' : 'comecar'"
      :cancelado="cancelado"
    >
      <template #titulo>
        <template v-if="pendente">A cobrança <br>não passou.</template>
        <template v-else>Um banco não <br>vê o outro.</template>
      </template>
      <template #dek>
        <template v-if="pendente">
          Atualize o cartão e a sua carteira, os cenários e a IA voltam na hora.
          Nada mais muda.
        </template>
        <template v-else>
          A Redentia vê todos, testa a sua carteira em 2.000 cenários e te avisa
          quando importa.
        </template>
      </template>
    </AssinaturaVitrine>

    <div class="asn__beneficios">
      <AssinaturaBeneficios />
    </div>

    <!-- o teste é só da primeira assinatura: quem já assinou não lê o passo a passo dele -->
    <AssinaturaComoFunciona v-if="!pendente && assinatura.primeiraAssinatura.value" />
  </div>
</template>

<style scoped>
.asn__beneficios { background: var(--nu-white); padding: clamp(56px, 7.5vw, 96px) clamp(22px, 5.5vw, 80px); }
</style>
