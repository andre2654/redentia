/**
 * useAporteChat — fluxo único dos atalhos de carteira que levam ao chat
 * (Redentia AI vive em /busca). Fonte ÚNICA das perguntas montadas + do
 * deep-link, pra "Novo aporte" e "Rebalancear carteira" terem a MESMA UX na
 * home (MercadoSuaCarteira) e na /carteira (CarteiraHero) — 1 implementação
 * por responsabilidade.
 *
 * Contrato do deep-link (PR9 /busca): ?chat=1 abre o modo chat, ?q= carrega a
 * pergunta e a página AUTO-ENVIA ao chegar (só logado; anônimo já é barrado
 * pro login no setup da /busca). Cada `useAporteChat()` traz seu próprio
 * estado de modal — as duas telas nunca coexistem (páginas distintas).
 *
 *  - Novo aporte      → abre o NuAmountModal (valor em R$) → confirma → chat
 *                       com a pergunta incluindo o valor.
 *  - Rebalancear      → link direto pro chat (sem modal), pergunta pronta.
 */

/** Pergunta fixa do rebalanceamento (a IA já tem as tools de carteira). */
const REBALANCE_QUESTION =
  'Analise a alocação da minha carteira e sugira um rebalanceamento entre os ativos.'

/** Monta o deep-link /busca?chat=1&q= com a pergunta já codificada. */
function chatHref(question: string): string {
  return `/busca?chat=1&q=${encodeURIComponent(question)}`
}

export function useAporteChat() {
  // estado do modal de aporte, local a cada uso (páginas distintas)
  const aporteOpen = ref(false)

  function openAporte() {
    aporteOpen.value = true
  }
  function closeAporte() {
    aporteOpen.value = false
  }

  /** valor em reais (inteiro, > 0) → fecha o modal e leva a pergunta pro chat. */
  function confirmAporte(valor: number) {
    aporteOpen.value = false
    const q = `Tenho R$ ${valor.toLocaleString('pt-BR')} para aportar. Como distribuo entre os ativos da minha carteira?`
    return navigateTo(chatHref(q))
  }

  /** href do "Rebalancear carteira" (NuxtLink :to) — chat direto, sem modal. */
  const rebalanceHref = chatHref(REBALANCE_QUESTION)

  return { aporteOpen, openAporte, closeAporte, confirmAporte, rebalanceHref }
}
