<script setup lang="ts">
/**
 * Layout da Redentia for Business (a landing /business e o painel logado:
 * /business/chaves e /business/clientes).
 *
 * DESDE 04/11/2026, O TOPO E O RODAPÉ DO SITE NOVO, na variante "business"
 * (o dono: "o header e o footer precisam ir para o nosso atual [...] com
 * pequenas alterações para ser mais voltado à identidade For Business"). Saíram
 * o RbHeader e o RbFooter. O que muda está no topo de NuHeader.vue e de
 * NuFooter.vue; o idioma visual é o mesmo do site.
 *
 * Continua MAIS MAGRO que o `default`: sem a faixa de cotações (é linguagem do
 * app de investidor) e sem a barra e o painel do chat da Redentia, que são do
 * investidor e da assinatura; quem atende a mesa do assessor é o assistente do
 * próprio escritório.
 *
 * Na landing (/business, desde 05/11/2026) entra a faixa do estudo Wealth
 * 2030 acima do topo, como no print do dono. O painel logado não tem a faixa.
 */
const route = useRoute()
// As telas de escritório seguem com a cara da Redentia: o tema devolve os
// tokens que a Aportou mudou (assets/css/tema-redentia.css).
useMarcaRedentia()
</script>

<template>
  <div class="rb-shell">
    <BizFaixaEstudo v-if="route.path === '/business'" />
    <NuHeader variante="business" />
    <ConsentBanner />
    <main>
      <slot />
    </main>
    <NuFooter variante="business" />
  </div>
</template>

<style scoped>
/* overflow-x: CLIP (não hidden) — hidden transforma o shell em scroll
   container e mata o position:sticky do header. Mesma lição do app. */
.rb-shell { min-height: 100vh; background: var(--nu-white); overflow-x: clip; display: flex; flex-direction: column; }
main { flex: 1; }
</style>
