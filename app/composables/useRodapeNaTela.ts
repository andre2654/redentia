/**
 * O rodapé (footer.nuf) cruzou a tela. O convite da newsletter e o aviso de
 * cookies usam isto para sair de cima dele.
 *
 * ATENÇÃO (12/11/2026): footer.nuf era o rodapé antigo, que desde a Aportou
 * (11/11) só existia na variante de escritório do NuFooter, que saiu com o B2B.
 * O rodapé do site é o footer.nfa (NuFooterAportou): aqui nada casa e o valor
 * fica sempre false, como já ficava no site de investidor desde 11/11. Trocar
 * o seletor muda o comportamento do aviso de cookies: é decisão do dono.
 */
export function useRodapeNaTela() {
  const visivel = ref(false)
  let io: IntersectionObserver | null = null
  const vistos = new Set<Element>()

  function observar() {
    io?.disconnect()
    io = null
    vistos.clear()
    visivel.value = false
    if (!import.meta.client || !('IntersectionObserver' in window)) return
    const alvos = document.querySelectorAll('footer.nuf')
    if (!alvos.length) return
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) vistos.add(e.target)
        else vistos.delete(e.target)
      }
      visivel.value = vistos.size > 0
    })
    alvos.forEach((el) => io!.observe(el))
  }

  onMounted(() => {
    // O banner de cookies monta antes do layout: o rodapé existe no próximo tick.
    nextTick(() => observar())
  })
  const route = useRoute()
  watch(() => route.path, () => {
    nextTick(() => observar())
  })
  onBeforeUnmount(() => {
    io?.disconnect()
    io = null
  })

  return visivel
}
