<script setup lang="ts">
// /carteira (PR8; redesenho e plano único em 31/10/2026). A página é um
// wrapper fino: auth, assinatura e SEO. O miolo é o CarteiraContent.
//
// AUTH OBRIGATÓRIA: anônimo → /login?redirect= via middleware inline; token
// morto no fetch (401) → limpa a sessão e volta ao login.
//
// PAGA INTEIRA (dono, 31/10/2026): "para acessar a tela de carteira em si tem
// que ser pago". O snapshot da assinatura (GET /me/entitlements) vem no SSR:
//  - assina (teste, ativa, carência) → a carteira, buscada no SSR como antes;
//  - não assina → AssinaturaPaywall, e a carteira NEM é buscada;
//  - cobrança pendente → o paywall leva ao portal (trocar o cartão);
//  - snapshot fora do ar → a carteira (fail-open); se o servidor responder
//    402/403 assinatura_necessaria, vira o paywall.
//
// VOLTA DO CHECKOUT (?assinatura=ok): o webhook pode chegar depois da pessoa.
// A tela de boas-vindas fica no lugar enquanto o /me/entitlements é relido
// (até ~20 s); liberou → busca a carteira e mostra a faixa "Seu teste de 3 dias
// começou." em cima dela.
import { voltouDoCheckout } from '~/utils/assinatura'

definePageMeta({
  middleware: [
    (to) => {
      const token = useCookie<string | null>('nu:token')
      if (token.value) return
      return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`, { replace: true })
    },
  ],
})

const route = useRoute()
const router = useRouter()
const { clearSession } = useAuthState()
const assinatura = useAssinatura()

// estado e hooks ANTES do 1º await (hook registrado depois do await some)
const voltou = voltouDoCheckout(route.query)
const fase = ref<'nenhuma' | 'confirmando' | 'demorando' | 'pronta'>('nenhuma')
let buscarCarteira: (() => Promise<void>) | null = null

async function confirmar() {
  fase.value = 'confirmando'
  const ok = await assinatura.aguardarConfirmacao()
  if (!ok) {
    fase.value = 'demorando'
    return
  }
  await buscarCarteira?.()
  fase.value = 'pronta'
}

onMounted(() => {
  if (!voltou) return
  // tira o ?assinatura=ok (e o session_id da Stripe) da URL: F5 não repete a chegada
  const query = { ...route.query }
  delete query.assinatura
  delete query.session_id
  void router.replace({ query, hash: route.hash })
  if (fase.value === 'confirmando') void confirmar()
})

const { sessaoMorta } = await useAssinaturaDaPagina()
if (sessaoMorta.value) {
  clearSession()
  await navigateTo('/login?redirect=%2Fcarteira', { replace: true })
}

const carteira = await useCarteira({ immediate: assinatura.assinante.value })
buscarCarteira = () => carteira.execute()
const payload = computed(() => carteira.data.value)

// token expirado/revogado no meio do caminho: limpa e volta pro login
// (o Set-Cookie de limpeza sai na própria resposta SSR).
if (payload.value?.unauthenticated) {
  clearSession()
  await navigateTo('/login?redirect=%2Fcarteira', { replace: true })
}
// o servidor barrou por assinatura (gate ligado): marca, sem abrir folha
if (payload.value?.semAssinatura) assinatura.recusado(null)

if (voltou) fase.value = assinatura.assinante.value && payload.value && !payload.value.semAssinatura ? 'pronta' : 'confirmando'

const mostraCarteira = computed(() =>
  assinatura.assinante.value && !!payload.value && !payload.value.semAssinatura && !payload.value.unauthenticated)
const esperando = computed(() => fase.value === 'confirmando' || fase.value === 'demorando')
// assinou e ainda não tem banco: a faixa de boas-vindas aponta o Open Finance
const semCarteira = computed(() => !!payload.value && !(payload.value.groups?.length && payload.value.hero?.patrimonio))

function tentarDeNovo() {
  void confirmar()
}

// Página pessoal: fora do índice (noindex) — o `private, no-store` já vem do
// routeRules do nuxt.config.
usePageSeo({
  title: 'Carteira',
  description: 'Seu patrimônio consolidado pelo Open Finance, testado em 2.000 cenários: posições, proventos, contas e a Redentia AI.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div>
    <AssinaturaBoasVindas
      v-if="fase !== 'nenhuma'"
      :fase="fase"
      :ent="assinatura.ent.value"
      :sem-carteira="semCarteira"
      @fechar="fase = 'nenhuma'"
      @tentar="tentarDeNovo"
    />
    <template v-if="!esperando">
      <CarteiraContent
        v-if="mostraCarteira && payload"
        :payload="payload"
        @connected="carteira.refresh()"
      />
      <AssinaturaPaywall v-else-if="!assinatura.assinante.value" :pendente="assinatura.situacao.value === 'pendente'" />
    </template>
  </div>
</template>
