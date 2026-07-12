<template>
  <!-- Painel dark de brand das telas de auth: radial navy→quase-preto com a
       orbe animada e a tagline ancorada no rodapé. Some inteiro <=1020px
       (breakpoint exato do design de login). -->
  <aside class="nap" data-auth-side>
    <NuAuthOrbCanvas />
    <div class="nap__tagline">
      <h2 class="nap__h2"><slot /></h2>
    </div>
  </aside>
</template>

<style scoped>
.nap {
  flex: 1 1 460px; min-width: 0; position: relative; overflow: hidden;
  background: radial-gradient(130% 130% at 72% 28%, var(--nu-orb-deep) 0%, var(--nu-orb-black) 72%);
}
.nap__tagline {
  position: absolute; z-index: 1;
  left: clamp(28px, 3.5vw, 52px); right: clamp(28px, 3.5vw, 52px);
  bottom: clamp(28px, 4vh, 48px);
}
.nap__h2 {
  margin: 0; color: var(--nu-cream-text);
  font-size: clamp(22px, 2vw, 30px); font-weight: 800;
  letter-spacing: -0.03em; line-height: 1.15;
}
@media (max-width: 1020px) {
  .nap { display: none; }
}
</style>
