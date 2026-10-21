<script setup lang="ts">
// Faixa contextual (PR-R6): páginas que declaram seções (useSectionRail) trocam
// o ticker "Mercado agora" por um rail de seções; todo o resto mantém o ticker,
// automático. Ver useSectionRail.ts p/ a nota de SSR (rail entra na hidratação).
const railSections = useState<RailState | null>('nu:section-rail', () => null)
</script>

<template>
  <div class="nu-shell">
    <NuHeader />
    <NuSectionRail v-if="railSections" />
    <NuMarketTicker v-else />
    <main>
      <slot />
    </main>
    <NuFooter />
    <!-- Sem modal de anúncio: o NuMcpPromo (o pop-up que abria 5 s depois de
         entrar) saiu de vez em 15/10/2026, a pedido do dono. Não remonte
         anúncio por cima da página sem decisão dele. -->
    <!-- O convite da newsletter foi decisão dele (21/10/2026): cartão pequeno
         no canto, aberto por interesse e nunca na chegada. As regras estão no
         componente. -->
    <NuNewsletterConvite />
    <!-- Onboarding obrigatório: logado sem investor_goal responde antes de
         seguir (decisão do dono, 24/08). -->
    <NuOnboardingModal />
  </div>
</template>

<style scoped>
/* overflow-x: CLIP (não hidden) — hidden transforma o shell em scroll
   container e mata o position:sticky do ticker; clip corta igual sem isso. */
.nu-shell { min-height: 100vh; background: var(--nu-white); overflow-x: clip; display: flex; flex-direction: column; }
main { flex: 1; }
</style>
