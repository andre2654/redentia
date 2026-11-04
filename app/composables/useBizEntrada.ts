/**
 * A entrada das telas de produto da /business (04/11/2026): o produto
 * funcionando UMA vez, quando a tela chega (a carteira consolidando, a faixa
 * do cenário se abrindo, a resposta surgindo, o relatório saindo).
 *
 * A regra é a mesma do useReveal com `soEmbeleza`: a tela sai PRONTA do
 * servidor e fica pronta. `tocar` só vira true no navegador, com a aba
 * visível e sem pedido de menos movimento: na hora, se a tela já está à vista
 * ao montar (o hero), ou quando o observador vê a tela chegando. O CSS de cada
 * tela anima só sob a classe que `tocar` liga, com fill `backwards`: se nada
 * disparar (sem JS, aba em segundo plano, print de página inteira), o conteúdo
 * está lá, sem animação. Nada em laço.
 *
 * Chame no setup, antes de qualquer await.
 */
export function useBizEntrada(opcoes: { atraso?: number; limiar?: number } = {}) {
  const el = ref<HTMLElement | null>(null)
  const tocar = ref(false)
  let io: IntersectionObserver | null = null
  let t: ReturnType<typeof setTimeout> | null = null

  onMounted(() => {
    const alvo = el.value
    if (!alvo || document.visibilityState !== 'visible') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const disparar = () => {
      io?.disconnect(); io = null
      t = setTimeout(() => { tocar.value = true }, opcoes.atraso ?? 0)
    }
    if (!('IntersectionObserver' in window)) return
    io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) disparar()
    }, { threshold: opcoes.limiar ?? 0.35 })
    io.observe(alvo)
  })
  onBeforeUnmount(() => { io?.disconnect(); io = null; if (t) clearTimeout(t) })

  return { el, tocar }
}
