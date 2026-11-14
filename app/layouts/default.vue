<script setup lang="ts">
// Faixa contextual (PR-R6): páginas que declaram seções (useSectionRail) trocam
// o ticker "Mercado agora" por um rail de seções; todo o resto mantém o ticker,
// automático. Ver useSectionRail.ts p/ a nota de SSR (rail entra na hidratação).
const railSections = useState<RailState | null>('nu:section-rail', () => null)
const route = useRoute()
</script>

<template>
  <div class="nu-shell">
    <NuHeader />
    <!-- Aviso de cookies no fluxo, abaixo do header: não cobre a marca
         nem o hero do ativo. -->
    <ConsentBanner />
    <NuSectionRail v-if="railSections" />
    <NuMarketTicker v-else />
    <!-- A faixa do recado do André (26/10/2026, pedido do dono): abre a
         janela NuRecado e some sozinha na data do recado. -->
    <NuRecadoFaixa />
    <main>
      <slot />
    </main>
    <!-- Sem o convite da newsletter antes do rodapé (02/11/2026, dono: "remova
         isso, porque já tem no footer"): a assinatura semanal fica no rodapé. -->
    <NuFooter />
    <!-- Sem modal de anúncio: o NuMcpPromo (o pop-up que abria 5 s depois de
         entrar) saiu de vez em 15/10/2026, a pedido do dono. Não remonte
         anúncio por cima da página sem decisão dele. -->
    <!-- A folha de cadastro (21/10/2026): o que pedia conta abre esta folha em
         vez de mandar para o /login. Fechada até um gatilho chamar
         useCadastroFolha().abrir(). -->
    <CadastroFolha />
    <!-- O onboarding obrigatório ("O que te trouxe aqui?") saiu em 02/11/2026,
         a pedido do dono: o quiz da assinatura já pergunta o que importa. -->
    <!-- O recado do André (26/10/2026, o dia vermelho depois do 2º turno):
         decisão do dono. Abre sozinho uma vez para quem está logado, fora das
         páginas de busca; a faixa acima abre para todo mundo. Some sozinho na
         data de useRecado. -->
    <NuRecado />
    <!-- O chat em painel (02/11/2026, pedido do dono): a barra de pergunta no pé
       de toda página, o painel à direita e o cursor mágico que mostra pedaços
       da página à Redentia. Os três são position: fixed (o clip do shell não
       os prende); o shell encolhe ao lado do painel (ChatPainel). -->
    <ChatBarra />
    <ChatPainel />
    <ChatSeletor />
    <!-- A janelinha de espiar ativo (03/11/2026, pedido do dono): o clique num
         link para /asset/X abre um cartão no canto em vez da página
         (plugins/espiar-ativo.client.ts); maximizar leva à página. -->
    <EspiarAtivo />
    <!-- O quiz da assinatura, um só no site: abre da oferta (/assinar, paywall)
         e do chat, quando quem entrou e não assina pergunta (ChatPainel). -->
    <AssinaturaQuiz />
  </div>
</template>

<style scoped>
/* overflow-x: CLIP (não hidden) — hidden transforma o shell em scroll
   container e mata o position:sticky do ticker; clip corta igual sem isso. */
.nu-shell { min-height: 100vh; background: var(--nu-page); overflow-x: clip; display: flex; flex-direction: column; }
main { flex: 1; }
</style>
