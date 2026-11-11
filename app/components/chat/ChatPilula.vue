<script setup lang="ts">
// O anel do input mágico da Aportou (11/11/2026): cobalto, céu, sálvia e areia
// correndo na borda, com a mesma luz difusa atrás. É o único momento
// assinatura do chat; o resto do painel fica calmo.
//   aceso       = campo em foco ou com texto: o anel engrossa, a luz cresce e
//                 corre mais rápido (7s → 4s)
//   respondendo = a resposta está chegando: 3s
//   escuro      = o miolo vira carvão (a pílula de "respondendo")
// O anel é uma tira com o gradiente da marca duas vezes, que anda um período
// por volta: só `transform`, nada de repintura. A troca de ritmo acerta a
// velocidade da animação que já corre (sem pulo). Movimento reduzido: o anel
// fica parado.
const props = defineProps<{ aceso?: boolean; respondendo?: boolean; escuro?: boolean }>()

const raiz = ref<HTMLElement | null>(null)
const ritmo = computed(() => (props.respondendo ? 7 / 3 : props.aceso ? 7 / 4 : 1))

function acertarRitmo() {
  const el = raiz.value
  if (!el || typeof el.getAnimations !== 'function') return
  for (const a of el.getAnimations({ subtree: true })) {
    // só a corrida do anel: o conteúdo do slot tem as animações dele
    if (String((a as CSSAnimation).animationName ?? '').startsWith('cpi-corre')) a.updatePlaybackRate(ritmo.value)
  }
}
onMounted(acertarRitmo)
watch(ritmo, acertarRitmo)
</script>

<template>
  <div ref="raiz" class="cpi" :class="{ 'cpi--aceso': aceso || respondendo, 'cpi--escuro': escuro }">
    <span class="cpi__brilho" aria-hidden="true"><span class="cpi__clipe"><span class="cpi__tira" /></span></span>
    <span class="cpi__anel" aria-hidden="true"><span class="cpi__tira" /></span>
    <div class="cpi__fundo">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cpi {
  --cpi-fio: 2.5px;
  position: relative; isolation: isolate; padding: var(--cpi-fio); border-radius: var(--cpi-raio, 28px);
  transition: padding .25s cubic-bezier(.2, .8, .2, 1);
}
.cpi--aceso { --cpi-fio: 3px; }

/* a luz atrás: o mesmo gradiente, recortado na forma da pílula e desfocado */
.cpi__brilho {
  position: absolute; inset: -5px -7px; z-index: -1; border-radius: inherit; filter: blur(16px); opacity: .5;
  transition: opacity .3s ease; pointer-events: none;
}
.cpi__clipe, .cpi__anel { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; pointer-events: none; }
.cpi:hover .cpi__brilho { opacity: .62; }
.cpi--aceso .cpi__brilho, .cpi--aceso:hover .cpi__brilho { opacity: .78; }

/* a tira: dois períodos do anel (cada um com o dobro da largura da pílula);
   andar meio caminho devolve o desenho ao começo */
.cpi__tira {
  position: absolute; top: 0; bottom: 0; left: 0; width: 400%;
  background: var(--nu-anel); background-size: 50% 100%; background-repeat: repeat-x;
  animation: cpi-corre 7s linear infinite; will-change: transform;
}
.cpi__fundo {
  position: relative; border-radius: calc(var(--cpi-raio, 28px) - var(--cpi-fio));
  background: var(--nu-white); transition: background .3s ease;
}
.cpi--escuro .cpi__fundo { background: var(--nu-ink); }

@keyframes cpi-corre { to { transform: translateX(-50%); } }

@media (prefers-reduced-motion: reduce) {
  .cpi__tira { animation: none; }
  .cpi, .cpi__fundo { transition: none; }
}
</style>
