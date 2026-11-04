<script setup lang="ts">
import type { Component } from 'vue'
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

// PROTÓTIPO (04/11/2026, o dono: "refazermos a tela do /business"): três
// direções, trocadas só no dev por ?biz=1 (a Decade modernizada: os mesmos
// gestos no idioma novo), ?biz=2 (a noite: uma carteira de exemplo
// atravessando um choque em 2.000 caminhos) e ?biz=3 (a grade: um cartão por
// coisa que a mesa recebe, filtrado pelo tipo de casa). Em produção
// import.meta.dev é false, o mapa fica vazio (os componentes nem entram no
// bundle) e segue a página de hoje até o dono escolher. As três têm o mesmo
// SEO (o usePageSeo acima), o mesmo H1, o FAQ inteiro no SSR com um FAQPage
// só e o mesmo #contato no fim (RbContato).
const route = useRoute()
const DIRECOES: Record<string, Component> = import.meta.dev
  ? {
      '1': defineAsyncComponent(() => import('~/components/business/direcoes/BizDecade.vue')),
      '2': defineAsyncComponent(() => import('~/components/business/direcoes/BizNoite.vue')),
      '3': defineAsyncComponent(() => import('~/components/business/direcoes/BizGrade.vue')),
    }
  : {}
const direcao = computed(() => DIRECOES[String(route.query.biz ?? '')] ?? null)
</script>

<template>
  <component :is="direcao" v-if="direcao" />
  <div v-else>
    <RbHero />
    <RbDivisao />
    <RbJornada />
    <RbSeguranca />
    <RbProva />
    <RbFaq />
    <RbContato />
  </div>
</template>
