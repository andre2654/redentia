<script setup lang="ts">
/**
 * Redentia for Business — landing do produto B2B (assessoria vinculada,
 * family office, gestora, consultoria).
 *
 * ENXUTA DESDE 15/10/2026, à noite. O dono achou a página com "MUITA
 * informação" e mandou olhar a home da Decade: sete blocos, uma ideia por
 * tela, cerca de 600 palavras fora do FAQ (eram ~1.330 em doze blocos). Saíram
 * o trilho do topo (RbCapacidade), a filosofia (RbFilosofia) e as regras da casa
 * (RbRegras); os dois perfis de comprador viraram os dois cards do plano.
 *
 * Ritmo das bandas: creme (hero) → branco (Venn) → creme com a foto fixa (o dia
 * da mesa) → branco (segurança) → creme com um card navy (o plano) → branco
 * (FAQ) → foto escura (o fecho) → navy (footer).
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
  description: 'Consolide a carteira do seu cliente com 1 clique. O cliente autoriza pelo Open Finance, e a Redentia lê o mercado e deixa a conversa pronta, no Claude ou no ChatGPT da mesa. A partir de R$ 500 por pessoa.',
  path: '/business',
  robots: 'noindex, follow',
})
// Opt-out do sufixo global (mesmo caso do /login): o título já traz a marca e
// "Redentia For Business · Redentia" repete a palavra duas vezes.
useHead({ titleTemplate: null })
</script>

<template>
  <div>
    <RbHero />
    <RbDivisao />
    <RbJornada />
    <RbSeguranca />
    <RbProva />
    <RbFaq />
    <RbContato />
  </div>
</template>
