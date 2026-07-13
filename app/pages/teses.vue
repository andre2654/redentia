<script setup lang="ts">
// STUB /teses — a tela completa existe no Claude Design (Redentia Teses
// Nu.dc.html, salva em docs/redentia-nu/designs-v2/) e será implementada num
// PR próprio. Até lá: hero na linguagem Nu + o conteúdo real que já temos
// (o strip de teses do /mercado), pra rota já ser útil e não 404ar no header.
usePageSeo({
  title: 'Teses de investimento',
  description: 'Carteiras temáticas com pesquisa profunda, revalidadas todos os dias por IA.',
  path: '/teses',
  robots: 'noindex, follow', // vira indexável quando a tela do design entrar
})
</script>

<template>
  <div>
    <NuPageHero eyebrow="Teses Redentia" subtitle="Carteiras temáticas com pesquisa profunda — estudadas e revalidadas todos os dias por IA.">
      Invista em ideias,<br>não em palpites.
    </NuPageHero>
    <NuTeseStrip />
  </div>
</template>
