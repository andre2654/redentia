<script setup lang="ts">
// Rota dupla (decisão André 2026-07-11): deslogado vê o Mercado, logado vê a
// Home. Os conteúdos reais chegam no PR1 (Mercado) e PR7 (Home) — este arquivo
// hoje só prova o shell e a bifurcação.
const { isAuthenticated } = useAuthState()
usePageSeo({
  title: 'Redentia — invista com uma IA do seu lado',
  description: 'Análise fundamentalista pronta, alertas do que afeta a sua carteira e respostas na hora — sem planilha, sem economês.',
})
</script>

<template>
  <NuStubSection :title="isAuthenticated ? 'Home (PR7)' : 'Mercado (PR1)'" />
</template>
