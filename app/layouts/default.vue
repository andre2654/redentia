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
.nu-shell { min-height: 100vh; background: var(--nu-white); overflow-x: hidden; display: flex; flex-direction: column; }
main { flex: 1; }
</style>
