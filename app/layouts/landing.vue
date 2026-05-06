<!--
  Layout MINIMO pra landing pages de conversao (anuncios Meta).

  Diferenca pra unauthenticated.vue: SEM nav com dropdowns, SEM sidebar,
  SEM footer pesado, SEM QuickSearch, SEM banner de install. So:
    - Header com logo + 1 botao "Entrar"
    - Slot do conteudo
    - Footer com 3 links legais

  POR QUE:
  /comece (e qualquer outra landing de ad) precisa carregar em <1s
  no Slow 4G. O layout `unauthenticated` traz dropdown nav que o user
  raramente usa nessa rota e infla o bundle. Esse layout enxuga ate
  o osso.

  EXTENSIVEL: usado por outras landings que vierem depois, basta
  setar `definePageMeta({ layout: 'landing' })`.
-->
<script setup lang="ts">
const brand = useBrand()
</script>

<template>
  <div
    class="landing-shell"
    :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
  >
    <!-- Header minimo. Logo Redent.IA esquerda + Entrar direita.
         Sem nav, sem dropdowns. -->
    <header class="landing-header">
      <NuxtLink to="/" aria-label="Home" class="landing-header__logo">
        <BrandLogo variant="full" mode="auto" class="h-7 w-auto md:h-8" />
      </NuxtLink>
      <NuxtLink to="/auth/login" class="landing-header__login">
        Entrar
      </NuxtLink>
    </header>

    <!-- Conteudo da page -->
    <main class="landing-main">
      <slot />
    </main>

    <!-- Footer enxuto. So o essencial legal. -->
    <footer class="landing-footer">
      <div class="landing-footer__inner">
        <p class="landing-footer__copy">
          {{ brand.name }} &copy; {{ new Date().getFullYear() }} &middot; {{ brand.tagline }}
        </p>
        <div class="landing-footer__links">
          <NuxtLink to="/institucional/terms">
            Termos
          </NuxtLink>
          <NuxtLink to="/institucional/privacy">
            Privacidade
          </NuxtLink>
          <NuxtLink to="/help">
            Suporte
          </NuxtLink>
        </div>
      </div>
      <p class="landing-footer__disclaimer">
        A Redent.IA oferece ferramentas de análise e educação financeira. As informações não constituem recomendação individual de investimento.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.landing-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: var(--brand-font);
}

/* ============ HEADER ============ */
/* IMPORTANTE: removi backdrop-filter blur(16px). Em pages com background
   complexo (gradients amber, mockups), backdrop-filter forca re-paint do
   layer "underneath" a cada frame de scroll → travamento. Trocado por
   background opaco com leve transparencia que e infinitamente mais barato
   pro compositor. */
.landing-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: color-mix(in srgb, var(--brand-background) 96%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  /* Cria camada propria, isola repaint */
  will-change: transform;
  transform: translateZ(0);
}

@media (min-width: 768px) {
  .landing-header {
    padding: 18px 40px;
  }
}

.landing-header__logo {
  display: inline-flex;
  align-items: center;
  transition: opacity 200ms;
}
.landing-header__logo:hover {
  opacity: 0.85;
}

.landing-header__login {
  display: inline-flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 65%, transparent);
  background: transparent;
  color: var(--brand-text);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
  text-decoration: none;
  transition: all 180ms;
}

@media (min-width: 768px) {
  .landing-header__login { padding: 9px 22px; font-size: 14px; }
}

.landing-header__login:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

/* ============ MAIN ============ */
.landing-main {
  flex: 1;
  width: 100%;
}

/* ============ FOOTER ============ */
.landing-footer {
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  padding: 32px 24px 28px;
}

@media (min-width: 768px) {
  .landing-footer { padding: 40px 40px 32px; }
}

.landing-footer__inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .landing-footer__inner {
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
  }
}

.landing-footer__copy {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  margin: 0;
  text-align: center;
}

.landing-footer__links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.landing-footer__links a {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  text-decoration: none;
  transition: color 150ms;
}
.landing-footer__links a:hover {
  color: var(--brand-primary);
}

.landing-footer__disclaimer {
  margin: 22px auto 0;
  max-width: 780px;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  text-align: center;
  font-size: 11px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
</style>
