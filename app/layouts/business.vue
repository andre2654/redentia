<script setup lang="ts">
/**
 * Layout da Redentia for Business.
 *
 * Deliberadamente MAIS MAGRO que o `default`: sem NuMarketTicker (a faixa de
 * cotações é linguagem do app de investidor, não de infraestrutura para
 * escritório).
 */
</script>

<template>
  <div class="rb-shell">
    <RbHeader />
    <main>
      <slot />
    </main>
    <RbFooter />
  </div>
</template>

<style scoped>
/* overflow-x: CLIP (não hidden) — hidden transforma o shell em scroll
   container e mata o position:sticky do header. Mesma lição do app. */
.rb-shell { min-height: 100vh; background: var(--nu-white); overflow-x: clip; display: flex; flex-direction: column; }
main { flex: 1; }
</style>
