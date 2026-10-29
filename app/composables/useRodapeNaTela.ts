/**
 * O rodapé do site (NuFooter ou RbFooter) cruzou a tela. O convite da
 * newsletter e o aviso de cookies usam isto para sair de cima dele.
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
    const alvos = document.querySelectorAll('footer.nuf, footer.rbf')
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
