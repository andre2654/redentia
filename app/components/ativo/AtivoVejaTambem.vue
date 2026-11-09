<script setup lang="ts">
// "Veja também" das direções do /asset: os links do resumo factual e os do fim
// da página (AcaoRelacionados) numa lista só, sem repetir destino. Todos
// continuam no HTML do servidor.
defineProps<{ links: { href: string; label: string }[] }>()
</script>

<template>
  <nav v-if="links.length" class="avt" aria-label="Veja também">
    <p class="avt__r">Veja também</p>
    <ul class="avt__lista">
      <li v-for="l in links" :key="l.href"><NuxtLink :to="l.href">{{ l.label }}</NuxtLink></li>
    </ul>
  </nav>
</template>

<style scoped>
.avt__r { margin: 0; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.avt__lista { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.avt__lista a {
  display: inline-flex; align-items: center; height: 36px; padding: 0 14px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 600;
  transition: background .2s ease, box-shadow .2s ease, transform .45s cubic-bezier(.34, 1.56, .64, 1);
}
.avt__lista a:hover { transform: translateY(-1px); }
.avt__lista a:active { transform: scale(.97); }
@media (prefers-reduced-motion: reduce) { .avt__lista a { transition: none; } .avt__lista a:hover, .avt__lista a:active { transform: none; } }
.avt__lista a:hover { background: var(--nu-cream-hover); box-shadow: inset 0 0 0 1px var(--nu-cream-line); color: var(--nu-ink); }
</style>
