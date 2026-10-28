<script setup lang="ts">
// Links de texto no fim do /asset: ranking do setor e dividendos do ticker.
// Server-rendered. O bloco de pares já leva ao setor quando há 3 pares ou
// mais; este existe em toda página em que o destino é um 200.
defineProps<{ links: { href: string; label: string }[] }>()
</script>

<template>
  <nav v-if="links.length" class="arl" aria-label="Veja também">
    <p class="arl__kicker">Veja também</p>
    <ul class="arl__list">
      <li v-for="link in links" :key="link.href">
        <NuxtLink :to="link.href">{{ link.label }}</NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.arl {
  background: var(--nu-white);
  padding: 8px clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 72px);
}
.arl__kicker {
  margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs, 12px); font-weight: 800;
  letter-spacing: .12em; text-transform: uppercase;
}
.arl__list {
  display: flex; flex-wrap: wrap; gap: 8px 22px;
  list-style: none; margin: 12px 0 0; padding: 0;
}
.arl__list a { color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: 800; }
.arl__list a:hover { color: var(--nu-blue-hover); }
</style>
