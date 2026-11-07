<script setup lang="ts">
/**
 * Landing do Wealth Intelligence Dinner.
 *
 * Nav e rodapé são os do site (NuHeader / NuFooter, com a política de
 * privacidade). O header fica o claro padrão: o contraste é cabeçalho claro
 * sobre a página navy. A faixa "Mercado agora" fica de fora, e o convite da
 * newsletter também. O rodapé padrão permanece.
 */
</script>

<template>
  <div class="jt-shell">
    <NuHeader />
    <ConsentBanner />
    <main>
      <slot />
    </main>
    <NuFooter />
  </div>
</template>

<style scoped>
/* overflow-x: clip (não hidden) — hidden vira scroll container e mata o
   sticky do header. Mesma lição do layout default. */
.jt-shell {
  min-height: 100vh;
  background: #0c1524;
  overflow-x: clip;
  display: flex;
  flex-direction: column;
}
main { flex: 1; }
</style>

<style>
body.pagina-jantar { background: #0c1524; }
</style>
