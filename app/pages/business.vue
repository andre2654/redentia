<script setup lang="ts">
/**
 * Redentia for Business — landing do produto B2B (MFO, gestora, consultoria).
 *
 * Ritmo das bandas, e ele é intencional: creme (a página) → branco (artefato)
 * → creme → NAVY (a proposta) → creme → navy (footer). O plano dá três pisos
 * e só, e a página gasta o navy uma vez no meio, na oferta, e uma no fim.
 *
 * ⚠️ NOINDEX ATÉ O PR5. A seção de segurança afirma "banco separado", que é o
 * `pg-biz` e ainda não existe. Ver a trava no topo de RbSeguranca.vue. Tirar o
 * noindex antes disso é publicar afirmação falsa.
 */
definePageMeta({ layout: 'business' })

usePageSeo({
  title: 'Redentia For Business',
  description: 'A infraestrutura de dados para escritórios que consolidam patrimônio de famílias.',
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
    <RbComoFunciona />
    <RbSeguranca />
    <RbProva />
    <RbContato />
  </div>
</template>
