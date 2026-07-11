<template>
  <div class="nu-shell">
    <NuHeader />
    <NuMarketTicker />
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
