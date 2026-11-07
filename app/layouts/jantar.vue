<script setup lang="ts">
/**
 * Landing do Wealth Intelligence Dinner.
 *
 * Nav e rodapé são os do site (NuHeader / NuFooter, com a política de
 * privacidade). A faixa "Mercado agora" fica de fora, no mesmo espírito do
 * layout de /business: cotação é linguagem do app, e esta página abre com
 * a faixa da mesa. O convite da newsletter também fica de fora — o convite
 * da página é a fila no WhatsApp. O rodapé padrão, com a assinatura, permanece.
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
  background: #0A0D0C;
  overflow-x: clip;
  display: flex;
  flex-direction: column;
}
main { flex: 1; }
</style>
