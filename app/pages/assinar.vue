<script setup lang="ts">
// /assinar — a página do plano único (decisão do dono, 31/10/2026): uma
// assinatura só (hoje da Aportou), R$ 19,99 por mês, com 3 dias grátis e cartão no
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
const quiz = useQuizAssinatura()

// estado e hooks ANTES do 1º await (hook depois do await some em silêncio)
const continuar = route.query.continuar === '1'
const cancelado = cancelouNoCheckout(route.query)
function abrirQuizPelaUrl(): boolean {
  if (route.query.quiz !== '1') return false
  const de = typeof route.query.de === 'string' ? route.query.de.slice(0, 24) : 'link'
  const query = { ...route.query }
  delete query.quiz
  delete query.de
  void router.replace({ query })
  void nextTick(() => { quiz.abrir(de) })
  return true
}
// o "Conectar carteira" do topo, clicado já nesta página, não remonta a página
watch(() => route.query.quiz, () => { abrirQuizPelaUrl() })

onMounted(() => {
  // ?dados=1: o botão de fora (a /conta) ouviu cpf_necessario e mandou para cá
  if (route.query.dados === '1' && isAuthenticated.value) {
    const query = { ...route.query }
    delete query.dados
    void router.replace({ query })
    void nextTick(() => { void quiz.abrirNosDados('conta') })
    return
  }
  // ?quiz=1: o "Conectar carteira" de fora (a home, a folha da IA) já abre o
  // quiz, sem pedir um segundo toque nesta página. A origem vai em ?de=.
  if (abrirQuizPelaUrl()) return
  if (!continuar) return
  // tira o ?continuar da URL (voltar para cá não reabre o Checkout) e segue
  const query = { ...route.query }
  delete query.continuar
  void router.replace({ query })
  const s = assinatura.situacao.value
  if (isAuthenticated.value && (s === 'sem' || s === 'desconhecido')) {
    void assinatura.comecar().then((r) => { if (r === 'dados') void quiz.abrirNosDados('continuar') })
  }
})

const { sessaoMorta } = await useAssinaturaDaPagina()

if (sessaoMorta.value) clearSession()
else if (['teste', 'ativa', 'atrasada'].includes(assinatura.situacao.value)) {
  await navigateTo('/carteira', { replace: true })
}

const pendente = computed(() => assinatura.situacao.value === 'pendente')

usePageSeo({
  title: 'Assinatura',
  description: 'Sua carteira de qualquer banco pelo Open Finance, testada em 2.000 cenários, com a IA que responde com os seus números. Só leitura, regulado pelo Banco Central.',
  path: '/assinar',
})
</script>

<template>
  <div class="asn">
    <AssinaturaVitrine
      :eyebrow="pendente ? 'Pagamento pendente' : 'Assinatura'"
      :modo="pendente ? 'pendente' : 'comecar'"
      :cancelado="cancelado"
    >
      <template #titulo>
        <template v-if="pendente">A cobrança <br>não passou.</template>
        <template v-else>Clareza sobre <br>todos os seus <br>investimentos.</template>
      </template>
      <template #dek>
        <template v-if="pendente">
          Atualize o cartão e a sua carteira, os cenários e a IA voltam na hora.
          Nada mais muda.
        </template>
        <template v-else>
          A Aportou junta os seus bancos, testa a sua carteira em 2.000 cenários
          e te avisa quando importa.
        </template>
      </template>
    </AssinaturaVitrine>

    <div class="asn__beneficios">
      <AssinaturaBeneficios :conectar="!pendente" />
    </div>

    <!-- as seções que prendem até conectar: cada uma termina no "Conectar carteira" (o quiz) -->
    <template v-if="!pendente">
      <AssinaturaBancos />
      <AssinaturaAntesDepois />
      <AssinaturaMcp />
      <AssinaturaPerguntas />
      <AssinaturaFecho />
    </template>
  </div>
</template>

<style scoped>
.asn__beneficios { background: var(--nu-page); padding: clamp(64px, 7vw, 100px) clamp(20px, 5.5vw, 80px); }
</style>
