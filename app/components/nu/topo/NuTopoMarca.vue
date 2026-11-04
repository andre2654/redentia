<script setup lang="ts">
// A marca do header: o losango azul solto (sem o quadrado azul pesado)
// e o nome em Jakarta 800, o mesmo par do hero da home (HomeHeroVisitante).
// `business` (04/11/2026): a mesma marca com "For Business" em azul ao lado, e
// o link volta ao topo da /business, não à home de investidor.
defineProps<{ tamanho?: number; business?: boolean }>()
</script>

<template>
  <NuxtLink :to="business ? '/business' : '/'" class="ntm" :aria-label="business ? 'Redentia For Business, início' : 'Redentia, início'">
    <img src="/logo-azul.svg" alt="" class="ntm__marca" :width="tamanho ?? 26" :height="tamanho ?? 26">
    <span class="ntm__nome">Redentia<span v-if="business" class="ntm__biz"> For Business</span></span>
  </NuxtLink>
</template>

<style scoped>
.ntm {
  display: inline-flex; align-items: center; gap: 9px; flex-shrink: 0;
  color: var(--nu-ink); border-radius: var(--nu-r-chip); padding: 4px 6px 4px 2px; margin-left: -2px;
}
.ntm__marca { display: block; flex-shrink: 0; transition: transform .35s cubic-bezier(.2, .8, .2, 1); }
.ntm:hover .ntm__marca { transform: rotate(-8deg) scale(1.04); }
.ntm__nome { font-size: var(--nu-fs-lg); font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
.ntm__biz { color: var(--nu-blue-text); white-space: nowrap; }
.ntm:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .ntm__marca { transition: none; } }
</style>
