<script setup lang="ts">
// Faixa contextual (PR-R6): páginas que declaram seções (useSectionRail) trocam
// o ticker "Mercado agora" por um rail de seções; todo o resto mantém o ticker,
// automático. Ver useSectionRail.ts p/ a nota de SSR (rail entra na hidratação).
const railSections = useState<RailState | null>('nu:section-rail', () => null)
</script>

<template>
  <div class="nu-shell">
    <NuHeader />
    <NuSectionRail v-if="railSections" />
    <NuMarketTicker v-else />
    <main>
      <slot />
    </main>
    <NuFooter />
  </div>
</template>

<style scoped>
/* overflow-x: CLIP (não hidden) — hidden transforma o shell em scroll
   container e mata o position:sticky do ticker; clip corta igual sem isso. */
.nu-shell { min-height: 100vh; background: var(--nu-white); overflow-x: clip; display: flex; flex-direction: column; }
main { flex: 1; }
</style>
