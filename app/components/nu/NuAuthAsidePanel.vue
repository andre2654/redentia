<script setup lang="ts">
// Painel dark de brand das telas de auth (contrato: refresh 2026-07-12, PR-R1).
// Desde 21/10/2026 (canvas "Cadastro sem muro", aprovado pelo dono), o meio
// mostra o que a conta abre: as quatro funções da folha de cadastro se
// revezando (NuAuthFuncoes), com dado de verdade. Antes era a animação
// "Redentia lendo o mercado" (NuMarketReading, que segue em uso no tema light).
//   meio  → <NuAuthFuncoes> (cena, legenda e pontos)
//   base  → tagline (via slot, mantendo o contrato do NuAuthLayout)
// Some inteiro <=1020px (breakpoint do design de login).
</script>

<template>
  <aside class="nap" data-auth-side>
    <div class="nap__mid">
      <NuAuthFuncoes />
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

/* meio — as funções, centralizadas */
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
