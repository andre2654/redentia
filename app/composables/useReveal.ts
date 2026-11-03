/**
 * Entrada dos gráficos do /benchmark-ia quando chegam na tela.
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
 * deixa os gráficos de dentro sempre prontos ('idle'). As direções novas da
 * página usam: o estado 'pending' esconde as marcas até o IntersectionObserver
 * e um requestAnimationFrame dispararem, e numa aba em segundo plano (o preview
 * do dono) ou num print de página inteira eles não disparam, então o gráfico
 * ficava vazio (os cartões do "Inventa número?" altos e sem pontos, a faixa
 * creme vazia depois do Placar geral). Sem o provide, nada muda.
 */
import type { InjectionKey } from 'vue'

export const REVEAL_SEM_ENTRADA: InjectionKey<boolean> = Symbol('reveal:sem-entrada')

export function useReveal(threshold = 0.25) {
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
