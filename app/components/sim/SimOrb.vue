<script setup lang="ts">
// PROTÓTIPO /simulacao — o orb, v2 (referência do dono, 24/08: loader estilo
// "luz líquida"): a esfera é formada por CAMADAS DE BOX-SHADOW INSET que
// GIRAM — branco (brilho) + azul-claro + azul profundo, com o meio do ciclo
// derivando pra verde/navy. Portado de um snippet React/Tailwind pra CSS puro
// com tokens da casa; os offsets escalam com o tamanho via --u (size/10).
// `state` muda o ritmo: idle gira lento (~9s), thinking acelera (~2s).
// prefers-reduced-motion congela via regra global do base.css.
withDefaults(defineProps<{ state?: 'idle' | 'thinking'; size?: number }>(), {
  state: 'idle',
  size: 320,
})
</script>

<template>
  <div
    class="orb" :class="{ 'orb--thinking': state === 'thinking' }"
    :style="{ width: `${size}px`, height: `${size}px`, '--u': `${size / 10}px` }"
    aria-hidden="true"
  >
    <div class="orb__core" />
    <svg class="orb__grain" width="100%" height="100%">
      <filter id="orb-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#orb-noise)" />
    </svg>
  </div>
</template>

<style scoped>
.orb {
  position: relative; border-radius: 50%;
  --orb-v: 1;
}
.orb--thinking { --orb-v: 0.24; }

.orb__core {
  position: absolute; inset: 0; border-radius: 50%;
  animation: orb-rotate calc(9s * var(--orb-v)) linear infinite;
}
@keyframes orb-rotate {
  0% {
    transform: rotate(90deg);
    box-shadow:
      0 var(--u) calc(var(--u) * 2) 0 var(--nu-white) inset,
      0 calc(var(--u) * 2) calc(var(--u) * 3) 0 var(--nu-blue-soft) inset,
      0 calc(var(--u) * 6) calc(var(--u) * 6) 0 var(--nu-blue-hover-3) inset;
  }
  50% {
    transform: rotate(270deg);
    box-shadow:
      0 var(--u) calc(var(--u) * 2) 0 var(--nu-white) inset,
      0 calc(var(--u) * 2) var(--u) 0 var(--nu-green-soft) inset,
      0 calc(var(--u) * 4) calc(var(--u) * 6) 0 var(--nu-navy-2) inset;
  }
  100% {
    transform: rotate(450deg);
    box-shadow:
      0 var(--u) calc(var(--u) * 2) 0 var(--nu-white) inset,
      0 calc(var(--u) * 2) calc(var(--u) * 3) 0 var(--nu-blue-soft) inset,
      0 calc(var(--u) * 6) calc(var(--u) * 6) 0 var(--nu-blue-hover-3) inset;
  }
}
.orb__grain {
  position: absolute; inset: 0; border-radius: 50%;
  opacity: 0.35; mix-blend-mode: overlay; pointer-events: none;
}
</style>
