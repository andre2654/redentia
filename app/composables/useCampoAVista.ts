// O campo e o botão à vista com o teclado aberto (protótipos do /login,
// 04/11/2026). No celular o teclado come metade da tela: quando um campo
// dentro de `bloco` ganha foco, ou quando a área visível encolhe com o campo
// já focado, a página rola o mínimo para o bloco inteiro (o campo e o botão
// que o segue) caber acima do teclado. Se não couber, o campo vence: fica no
// alto, com o botão logo abaixo. Só no cliente; no SSR não faz nada.
import type { Ref } from 'vue'

const FOLGA = 12

export function useCampoAVista(bloco: Ref<HTMLElement | null>) {
  let quadro = 0

  function ajustar() {
    cancelAnimationFrame(quadro)
    quadro = requestAnimationFrame(() => {
      const el = bloco.value
      const ativo = document.activeElement as HTMLElement | null
      if (!el || !ativo || !el.contains(ativo) || ativo.tagName !== 'INPUT') return
      const vv = window.visualViewport
      const alto = vv?.height ?? window.innerHeight
      const topoVisivel = vv?.offsetTop ?? 0
      const r = el.getBoundingClientRect()
      const campo = ativo.getBoundingClientRect()
      const fundo = topoVisivel + alto - FOLGA
      let delta = 0
      if (r.bottom > fundo) delta = r.bottom - fundo
      // o campo nunca sobe para fora do alto
      if (campo.top - delta < topoVisivel + FOLGA) delta = campo.top - topoVisivel - FOLGA
      if (campo.top < topoVisivel + FOLGA) delta = campo.top - topoVisivel - FOLGA
      if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'auto' })
    })
  }

  onMounted(() => {
    document.addEventListener('focusin', ajustar)
    window.visualViewport?.addEventListener('resize', ajustar)
    window.addEventListener('resize', ajustar)
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(quadro)
    document.removeEventListener('focusin', ajustar)
    window.visualViewport?.removeEventListener('resize', ajustar)
    window.removeEventListener('resize', ajustar)
  })

  return { ajustar }
}
