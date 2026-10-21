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
 * INDEXÁVEL DESDE 20/10/2026, POR DECISÃO DO DONO. O noindex nasceu como trava
 * de compliance enquanto a seção de segurança afirmava "banco separado" (o
 * `pg-biz`, que não existe). Essa afirmação saiu em 11/10, quando a página foi
 * reescrita para o que está no ar (ver o topo de RbSeguranca.vue). Em 20/10 o
 * texto foi relido antes de abrir: a conexão do cliente segue marcada "na
 * implantação" e cada frase de segurança está conferida no código. Frase nova
 * aqui precisa ser verdade hoje, porque agora o Google e as IAs leem a página.
 */
definePageMeta({ layout: 'business' })

usePageSeo({
  title: 'Redentia For Business',
  description: 'Consolide a carteira do seu cliente com 1 clique. O cliente autoriza pelo Open Finance, e a Redentia lê o mercado e deixa a conversa pronta, no Claude ou no ChatGPT da mesa. A partir de R$ 500 por pessoa.',
  path: '/business',
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
