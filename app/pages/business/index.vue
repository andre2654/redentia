<script setup lang="ts">
/**
 * Redentia for Business — landing do produto B2B (assessoria vinculada,
 * family office, gestora, consultoria).
 *
 * Ritmo das bandas, e ele é intencional: trilho navy/azul (capacidade) →
 * creme (a página) → branco (artefato) → creme → branco (o assistente) →
 * NAVY (a proposta) → creme → branco (FAQ) → navy (footer). O plano dá três
 * pisos e só; o navy de banda continua gasto uma vez no meio, na oferta, e
 * uma no fim — o trilho do topo é régua fina, não banda.
 *
 * ⚠️ O NOINDEX FICA, POR DECISÃO DO DONO. Ele nasceu como trava de compliance
 * enquanto a seção de segurança afirmava "banco separado" (o `pg-biz`, que não
 * existe). Em 11/10/2026 a página foi reescrita para o que está no ar e essa
 * afirmação saiu (ver o topo de RbSeguranca.vue), mas tirar o noindex continua
 * sendo decisão do dono, não da copy. A página é destino de call de venda, não
 * de busca orgânica.
 */
definePageMeta({ layout: 'business' })

usePageSeo({
  title: 'Redentia For Business',
  description: 'O mercado de hoje, antes da sua reunião. A Redentia lê o mercado, testa a carteira do cliente e deixa a conversa pronta, no Claude ou no ChatGPT da mesa. A partir de R$ 500 por pessoa.',
  path: '/business',
  robots: 'noindex, follow',
})
// Opt-out do sufixo global (mesmo caso do /login): o título já traz a marca e
// "Redentia For Business · Redentia" repete a palavra duas vezes.
useHead({ titleTemplate: null })
</script>

<template>
  <div>
    <RbCapacidade />
    <RbHero />
    <RbDivisao />
    <RbJornada />
    <RbFilosofia />
    <RbRegras />
    <RbSeguranca />
    <RbProva />
    <RbContato />
    <RbFaq />
  </div>
</template>
