<script setup lang="ts">
// Painel dark de brand das telas de auth (contrato: refresh 2026-07-12, PR-R1).
// Sai a orbe (canvas); entra a animação "Redentia lendo o mercado":
//   topo  → dot azul pulsante + título + "{doc} documentos analisados"
//   meio  → <NuMarketReading> (feed que acende → morph pro lockup da marca)
//   base  → tagline (via slot, mantendo o contrato do NuAuthLayout)
// Some inteiro <=1020px (breakpoint do design de login).
//
// docText nasce em '1.240' (estado inicial readN=0 → 1240+0, SSR-safe) e é
// espelhado pelo NuMarketReading via emit `doc` durante a animação (client).
const docText = ref('1.240')
</script>

<template>
  <aside class="nap" data-auth-side>
    <div class="nap__top">
      <div class="nap__label">
        <span class="nap__dot" aria-hidden="true" />
        <span class="nap__title">Redentia lendo o mercado</span>
      </div>
      <p class="nap__docs">{{ docText }} documentos analisados</p>
    </div>

    <div class="nap__mid">
      <NuMarketReading @doc="docText = $event" />
    </div>

    <div class="nap__base">
      <h2 class="nap__h2"><slot /></h2>
    </div>
  </aside>
</template>

<style scoped>
.nap {
  flex: 1 1 460px; min-width: 0; position: relative; overflow: hidden;
  background: radial-gradient(130% 130% at 72% 28%, var(--nu-orb-deep) 0%, var(--nu-orb-black) 72%);
  display: flex; flex-direction: column;
  padding: clamp(40px, 5.5vh, 68px) clamp(28px, 3.5vw, 56px);
  gap: clamp(24px, 3vh, 44px);
}

/* topo — dot pulsante + título + contador */
.nap__top { flex-shrink: 0; }
.nap__label { display: flex; align-items: center; gap: 12px; }
.nap__dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  background: var(--nu-blue);
  animation: nap-pulse 1.5s ease-in-out infinite;
}
.nap__title {
  color: var(--nu-cream-text);
  font-size: clamp(19px, 1.9vw, 25px); font-weight: 800;
  letter-spacing: -0.025em; line-height: 1.04;
}
.nap__docs {
  margin: 8px 0 0; padding-left: 24px;
  color: var(--nu-cream-text-50);
  font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums;
}
@keyframes nap-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: .5; }
}

/* meio — a animação de leitura, centralizada */
.nap__mid { flex: 1; display: flex; align-items: center; }

/* base — tagline ancorada no rodapé */
.nap__base { flex-shrink: 0; }
.nap__h2 {
  margin: 0; color: var(--nu-cream-text);
  font-size: clamp(22px, 2vw, 30px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.15;
}

@media (max-width: 1020px) {
  .nap { display: none; }
}
</style>
