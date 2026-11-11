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
.avt__r { margin: 0; color: var(--nu-ink); font-size: 13.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.avt__lista { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.avt__lista a {
  display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font-size: 14.5px; font-weight: 600;
  transition: background .2s ease, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.avt__lista a:hover { background: var(--nu-line-2); color: var(--nu-ink); }
.avt__lista a:active { transform: scale(.98); }
@media (prefers-reduced-motion: reduce) { .avt__lista a { transition: none; } .avt__lista a:active { transform: none; } }
</style>
