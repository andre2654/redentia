/**
 * Entrada de um bloco quando ele chega na tela (gráficos do /benchmark-ia,
 * a banda do rodapé).
 *
 * Estados: 'idle' (SSR e sem JS: gráfico pronto, sem animação), 'pending'
 * (montou fora da tela: marcas recolhidas, esperando) e 'in' (entrou: as marcas
 * crescem por transição CSS). O componente só põe a classe; o movimento mora
 * no CSS de cada gráfico.
 *
 * Exceção pedida pelo dono em 15/10 ("crie micro transições e também o hover")
 * à regra 11 do design system (sem stagger): aqui as marcas entram com atraso
 * curto em cadeia (40ms por item). Quem pede menos movimento no sistema
 * (prefers-reduced-motion) fica sempre em 'idle'.
 *
 * Chame no setup, antes de qualquer await (onMounted depois de await some).
 *
 * REVEAL_SEM_ENTRADA (03/11/2026): quem dá `provide(REVEAL_SEM_ENTRADA, true)`
 * deixa os gráficos de dentro sempre prontos ('idle'). O /benchmark-ia "A
 * noite" usa: o estado 'pending' esconde as marcas até o IntersectionObserver
 * e um requestAnimationFrame dispararem, e numa aba em segundo plano (o preview
 * do dono) ou num print de página inteira eles não disparam, então o gráfico
 * ficava vazio (os cartões do "Inventa número?" altos e sem pontos, a faixa
 * creme vazia depois do Placar geral). Sem o provide, nada muda.
 *
 * `{ soEmbeleza: true }` (03/11/2026, a banda do rodapé): nunca há 'pending'.
 * O bloco sai pronto do servidor e fica pronto; a classe 'is-in' só entra
 * quando ele monta FORA da tela (e com a aba visível) e o observador avisa que
 * está chegando perto (uma folga embaixo da tela, para a animação começar
 * antes de aparecer). O CSS anima só sob 'is-in', com fill `backwards`: se o
 * observador nunca disparar (aba em segundo plano, print de página inteira), o
 * conteúdo continua lá, sem animação. Já na tela ao montar: fica pronto, sem
 * piscar de volta para o começo da animação.
 */
import type { InjectionKey } from 'vue'

export const REVEAL_SEM_ENTRADA: InjectionKey<boolean> = Symbol('reveal:sem-entrada')

export function useReveal(threshold = 0.25, opcoes: { soEmbeleza?: boolean } = {}) {
  const el = ref<HTMLElement | null>(null)
  const state = ref<'idle' | 'pending' | 'in'>('idle')
  const semEntrada = inject(REVEAL_SEM_ENTRADA, false)
  let io: IntersectionObserver | null = null

  // impresso ou salvo em PDF sem rolar: tudo volta ao estado pronto (sem isso,
  // os gráficos abaixo da dobra saíam vazios no papel)
  const ready = () => { state.value = 'idle'; io?.disconnect() }
  onMounted(() => {
    window.addEventListener('beforeprint', ready)
    if (semEntrada || !el.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (opcoes.soEmbeleza) {
      const r = el.value.getBoundingClientRect()
      if (document.visibilityState !== 'visible' || (r.top < window.innerHeight && r.bottom > 0)) return
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { state.value = 'in'; io?.disconnect() }
      }, { rootMargin: '0px 0px 12% 0px' })
      io.observe(el.value)
      return
    }
    state.value = 'pending'
    io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        // um quadro de folga para o navegador pintar o estado recolhido antes de crescer
        requestAnimationFrame(() => { state.value = 'in' })
        io?.disconnect()
      }
    }, { threshold })
    io.observe(el.value)
  })
  onBeforeUnmount(() => { io?.disconnect(); window.removeEventListener('beforeprint', ready) })

  const revealClass = computed(() => (state.value === 'idle' ? '' : `is-${state.value}`))
  return { el, state, revealClass }
}
