<script setup lang="ts">
// /carteira (PR8) — a página mais densa e pessoal do app. Contrato de UX:
// docs/redentia-nu/designs/Redentia Carteira Nu.dc.html.
//
// CORREÇÃO DE DIREÇÃO (dono, 2026-07-13): a carteira NÃO é a home logada —
// segue página separada; a home única `/` é o Mercado auth-aware (que mostra
// um resumo compacto da carteira pra logado). Esta página é um wrapper fino
// do CarteiraContent (o miolo extraído continua sendo 1 implementação só).
//
// AUTH OBRIGATÓRIA (diretriz do dono): anônimo → redirect /login?redirect=
// via middleware inline (mesmo padrão do /login); token morto detectado no
// fetch (401 no /portfolio) → limpa sessão + mesmo redirect (padrão useApi).
//
// TELA DINÂMICA POR CARD (diretriz nº1): sem Open Finance conectado a página
// VIRA a experiência de conexão (CarteiraHero state 'connect' + Pluggy
// Connect); cada seção decide cheio | parcial | vazio no useCarteira — o
// rail contextual de seções vive no CarteiraContent.
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
</script>

<template>
  <CarteiraContent
    v-if="payload"
    :payload="payload"
    @connected="carteira.refresh()"
  />
</template>
