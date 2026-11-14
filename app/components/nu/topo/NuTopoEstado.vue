<script setup lang="ts">
// O estado da bolsa num ponto e numa etiqueta: o ponto verde respira devagar
// só com o pregão aberto; fora dele fica parado e cinza. `curto` tira o
// "Feriado · " no celular (fica "Finados").
// Robustez (11/11/2026, "nada infinito além do anel do input e do esqueleto"):
// o ponto respira três vezes quando a régua aparece e depois fica aceso, parado.
import type { MercadoDoTopo } from '~/utils/topo'
defineProps<{ mercado: MercadoDoTopo | null; curto?: boolean }>()
</script>

<template>
  <span v-if="mercado" class="nte" :class="`nte--${mercado.estado}`">
    <span class="nte__ponto" aria-hidden="true" />
    <span class="nte__rotulo"><span v-if="mercado.rotulo.startsWith('Feriado · ')" class="nte__pre" :class="{ 'nte__pre--curto': curto }">Feriado · </span>{{ mercado.rotulo.replace(/^Feriado · /, '') }}</span>
  </span>
</template>

<style scoped>
.nte { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; color: var(--nu-gray-2); font-weight: var(--nu-w-medio); }
.nte__ponto { position: relative; width: 7px; height: 7px; border-radius: 50%; background: var(--nu-sand); flex-shrink: 0; }
.nte--aberta { color: var(--nu-ink); }
.nte--aberta .nte__ponto { background: var(--nu-green); }
.nte--aberta .nte__ponto::after {
  content: ''; position: absolute; inset: -4px; border-radius: 50%; background: var(--nu-green);
  opacity: 0; animation: nte-respira calc(var(--nu-dur-respiro) * 2) var(--nu-ease-saida) 3;
}
@keyframes nte-respira { 0% { transform: scale(.5); opacity: .35; } 70%, 100% { transform: scale(1.5); opacity: 0; } }
@media (max-width: 760px) { .nte__pre--curto { display: none; } }
@media (prefers-reduced-motion: reduce) { .nte--aberta .nte__ponto::after { animation: none; } }
</style>
