<script setup lang="ts">
// O wordmark da Aportou (identidade de 11/11/2026): lettering próprio, com o
// corte azul no "t" como assinatura. As letras herdam a cor do texto
// (currentColor); o corte é cobalto sobre claro, o cobalto que lê sobre carvão
// e branco sobre o gradiente azul. Desenho exato do quadro "Identidade visual".
withDefaults(defineProps<{
  /** altura em px; a largura sai da proporção 681:178 */
  altura?: number
  /** onde ele está pousado: muda só a cor do corte */
  sobre?: 'claro' | 'escuro' | 'azul'
  /** texto para leitor de tela; vazio = decorativo (o link em volta já nomeia) */
  rotulo?: string
}>(), { altura: 36, sobre: 'claro', rotulo: '' })
</script>

<template>
  <svg
    class="mka" :class="`mka--${sobre}`" viewBox="-2 -40 681 178"
    :height.attr="altura" :width.attr="Math.round(altura * 681 / 178)"
    :role="rotulo ? 'img' : undefined" :aria-label="rotulo || undefined" :aria-hidden="rotulo ? undefined : 'true'"
  >
    <g fill="none" stroke="currentColor" stroke-width="25">
      <circle cx="50" cy="50" r="37.5" /><circle cx="173" cy="50" r="37.5" /><circle cx="280.5" cy="50" r="37.5" /><circle cx="520.5" cy="50" r="37.5" />
      <path d="M593.5 2 V54 A35.25 35.25 0 0 0 664 54" />
    </g>
    <g fill="currentColor">
      <rect x="83" y="2" width="25" height="98" />
      <path d="M121 2 H146 V124 A12 12 0 0 1 134 136 H121 Z" />
      <path d="M340 100 V26 A26 26 0 0 1 366 0 H399 V23 H372 Q365 23 365 31 V100 Z" />
      <path d="M408 -25 Q408 -38 421 -38 H433 V62 Q433 77 448 77 H463 V101 H440 Q408 101 408 69 Z" />
      <rect x="651.5" y="2" width="25" height="98" />
    </g>
    <path class="mka__corte" d="M408 44 V0 H444 C456 0 466 -2 472 -8 C474 8 466 23 448 23 H433 C419 23 410 31 408 44 Z" />
  </svg>
</template>

<style scoped>
.mka { display: block; flex: none; color: inherit; }
.mka__corte { fill: var(--nu-blue); transition: transform .5s var(--nu-ease-saida); transform-origin: 408px 20px; transform-box: view-box; }
.mka--escuro .mka__corte { fill: var(--nu-blue-on-dark); }
.mka--azul .mka__corte { fill: var(--nu-white); }
/* o corte dá um aceno quando o link em volta recebe o ponteiro */
:global(a:hover > .mka .mka__corte) { transform: translate(3px, -3px) rotate(-4deg); }
@media (prefers-reduced-motion: reduce) { .mka__corte { transition: none; } :global(a:hover > .mka .mka__corte) { transform: none; } }
</style>
