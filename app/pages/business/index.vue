<script setup lang="ts">
/**
 * Redentia for Business — landing do produto B2B (assessoria vinculada,
 * family office, gestora, consultoria).
 *
 * A PÁGINA DO PRINT DO DONO DESDE 05/11/2026. Ele mandou o print de uma
 * landing do Redentia For Business, viu três variações no dev (?biz=1|2|3) e
 * escolheu a 1, a Serifa, com o scroll travado depois da fila ("dedique
 * aqueles scrolls personalizados para explicar melhor esses pontos"). Tudo
 * mora em components/business/nova/ (BizLanding, BizFila, BizPassos) e o
 * texto em content/business/landing.ts, que tem no fim a lista do que falta o
 * dono confirmar. A página de antes (RbHero, RbDivisao, RbJornada, RbSeguranca,
 * RbProva) saiu; a regra de densidade dela continua: uma ideia por tela e
 * ~650 palavras fora do FAQ.
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
  <BizLanding />
</template>
