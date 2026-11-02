<script setup lang="ts">
// A pílula iridescente do chat (02/11/2026): o anel girando na borda e a luz
// difusa atrás, a linguagem do herói antigo da home (MercadoHeroPergunta, até
// 993d2369) e da cena da pergunta do login (CadastroHeroiPergunta). É o único
// momento assinatura do chat; o resto do painel fica calmo.
// `aceso` = campo em foco ou com texto: a luz cresce. Movimento reduzido: o
// anel fica parado e a luz não respira (o base.css corta a animação).
defineProps<{ aceso?: boolean }>()
</script>

<template>
  <div class="cpi" :class="{ 'cpi--aceso': aceso }">
    <span class="cpi__brilho" aria-hidden="true" />
    <span class="cpi__anel" aria-hidden="true" />
    <div class="cpi__fundo">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cpi { position: relative; isolation: isolate; padding: 2px; border-radius: var(--cpi-raio, 28px); }
.cpi__brilho {
  position: absolute; inset: -6px; z-index: -1; border-radius: inherit; filter: blur(18px); opacity: .32;
  background: linear-gradient(90deg, var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2));
  animation: cpi-respira 6s ease-in-out infinite; transition: opacity .3s ease;
  pointer-events: none;
}
.cpi__anel { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; pointer-events: none; }
.cpi__anel::before {
  content: ''; position: absolute; left: 50%; top: 50%; width: 140%; aspect-ratio: 1; transform: translate(-50%, -50%) rotate(0deg);
  background: conic-gradient(from 0deg, var(--nu-blue), var(--nu-serie-5), var(--nu-serie-4), var(--nu-serie-2), var(--nu-serie-6), var(--nu-blue));
  animation: cpi-gira 9s linear infinite;
}
.cpi__fundo { position: relative; border-radius: calc(var(--cpi-raio, 28px) - 2px); background: var(--nu-white); }
.cpi:hover .cpi__brilho { opacity: .48; }
.cpi--aceso .cpi__brilho { opacity: .62; }

@keyframes cpi-gira { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes cpi-respira { 50% { opacity: .18; } }

@media (prefers-reduced-motion: reduce) {
  .cpi__anel::before, .cpi__brilho { animation: none; }
}
</style>
