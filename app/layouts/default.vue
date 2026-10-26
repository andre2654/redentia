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
    <!-- A faixa do recado do André (26/10/2026, pedido do dono): abre a
         janela NuRecado e some sozinha na data do recado. -->
    <NuRecadoFaixa />
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
    <!-- A folha de cadastro (21/10/2026): o que pedia conta abre esta folha em
         vez de mandar para o /login. Fechada até um gatilho chamar
         useCadastroFolha().abrir(). -->
    <CadastroFolha />
    <!-- Onboarding obrigatório: logado sem investor_goal responde antes de
         seguir (decisão do dono, 24/08). -->
    <NuOnboardingModal />
    <!-- O recado do André (26/10/2026, o dia vermelho depois do 2º turno):
         decisão do dono. Abre sozinho uma vez para quem está logado, fora das
         páginas de busca; a faixa acima abre para todo mundo. Some sozinho na
         data de useRecado. -->
    <NuRecado />
  </div>
</template>

<style scoped>
/* overflow-x: CLIP (não hidden) — hidden transforma o shell em scroll
   container e mata o position:sticky do ticker; clip corta igual sem isso. */
.nu-shell { min-height: 100vh; background: var(--nu-white); overflow-x: clip; display: flex; flex-direction: column; }
main { flex: 1; }
</style>
