/**
 * A mecânica comum das três variações dos quatro passos da /business (05/11/2026,
 * ?passos=1|2|3 no dev). O BizPassos de hoje tem a dele, igual a esta; esta
 * existe para as variações não repetirem o mesmo código três vezes.
 *
 * O QUE ELA FAZ:
 *  - mede, a cada quadro de rolagem, qual passo está na linha de leitura e o
 *    quanto dele já passou; devolve `ativo` (reativo, muda só na troca) e chama
 *    `aoQuadro(t)` com o tempo contínuo t = passo + progresso, de -1 a 4. O
 *    desenho de cada variação lê esse t e escreve direto no estilo (sem passar
 *    pelo Vue a cada quadro);
 *  - SÓ ESCUTA A ROLAGEM COM A SEÇÃO PERTO DA TELA (IntersectionObserver com
 *    margem de meia tela). Fora disso nada roda;
 *  - a linha de leitura é null quando o palco não está preso (sem JS, com
 *    reduzir movimento ou empilhado): aí ninguém desenha nada, vale o SSR;
 *  - irPara (a régua e os botões da fila, pelo evento `bzj:ir`): rola até o
 *    passo ficar na linha de leitura e põe o foco nele;
 *  - não prende o teclado e não sequestra a rolagem: cada passo tem uma tela de
 *    altura, então Page Down anda um passo, e a régua é de links (Tab).
 *
 * `antesDaFila(i, id)` deixa a variação tratar o pedido da fila do jeito dela
 * (a câmera faz o FLIP do item da fila para a área); se devolver true, ela
 * cuidou de tudo.
 */
import type { Ref } from 'vue'
import { PASSOS, type IdDoPasso } from '~/content/business/landing'

export interface OpcoesPassos {
  /** o palco preso (sticky); a linha de leitura sai da altura dele no celular */
  palco: Ref<HTMLElement | null>
  /** a seção inteira, para o IntersectionObserver */
  secao: Ref<HTMLElement | null>
  aoQuadro?: (t: number) => void
  aoMedirLayout?: () => void
  antesDaFila?: (i: number, id: IdDoPasso) => boolean
}

const DESKTOP = '(min-width: 960px)'
export const alturaDoTopo = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nuh-h')) || 72

export function usePassosTravados(op: OpcoesPassos) {
  const ativo = ref(0)
  const progresso = ref(0)
  const preso = ref(false)
  const passos: HTMLElement[] = []
  let raf = 0
  let reduz = false
  let io: IntersectionObserver | null = null
  let ro: ResizeObserver | null = null
  let ouvindo = false

  /** A linha de leitura, em px da janela; null quando os passos estão empilhados. */
  function linhaDeFoco(): number | null {
    const p = op.palco.value
    if (!p || getComputedStyle(p).position !== 'sticky') return null
    if (window.matchMedia(DESKTOP).matches) return window.innerHeight / 2
    // no celular o palco fica em cima: a linha é o meio do que sobra embaixo
    return (alturaDoTopo() + p.offsetHeight + window.innerHeight) / 2
  }

  function medir() {
    raf = 0
    const y = linhaDeFoco()
    preso.value = y !== null
    if (y === null || !passos.length) return
    let i = 0
    passos.forEach((el, k) => { if (el.getBoundingClientRect().top <= y) i = k })
    const r = passos[i]!.getBoundingClientRect()
    const p = (y - r.top) / r.height
    if (ativo.value !== i) ativo.value = i
    progresso.value = Math.min(1, Math.max(0, p))
    // antes do primeiro passo o t fica negativo (a abertura); depois do último, para em 4
    const t = i === 0 && p < 0 ? Math.max(-1, p) : Math.min(passos.length, i + Math.min(1, p))
    op.aoQuadro?.(t)
  }
  const agendar = () => { if (!raf) raf = requestAnimationFrame(medir) }
  const remedir = () => { op.aoMedirLayout?.(); agendar() }

  function ligar() {
    if (ouvindo) return
    ouvindo = true
    window.addEventListener('scroll', agendar, { passive: true })
    agendar()
  }
  function desligar() {
    if (!ouvindo) return
    ouvindo = false
    window.removeEventListener('scroll', agendar)
    if (raf) { cancelAnimationFrame(raf); raf = 0 }
  }

  /** Rola até o passo `i` ficar na linha de leitura (empilhado: até o topo dele). */
  function irPara(i: number, foco = true, imediato = false) {
    const el = passos[i]
    if (!el) return
    const y = linhaDeFoco()
    const r = el.getBoundingClientRect()
    const alvo = y === null
      ? window.scrollY + r.top - alturaDoTopo() - 16
      : window.scrollY + r.top + r.height / 2 - y + 1
    window.scrollTo({ top: Math.max(0, alvo), behavior: reduz || imediato ? 'auto' : 'smooth' })
    if (foco) el.focus({ preventScroll: true })
    if (imediato) medir()
  }

  function naRegua(i: number, ev: MouseEvent) {
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return
    ev.preventDefault()
    irPara(i)
  }
  /** O Tab passa pela régua: o link que recebe o foco do teclado leva ao passo dele. */
  function focoNaRegua(i: number, ev: FocusEvent) {
    if ((ev.target as HTMLElement).matches(':focus-visible')) irPara(i, false)
  }
  function pedidoDaFila(ev: Event) {
    const id = (ev as CustomEvent<IdDoPasso>).detail
    const i = PASSOS.findIndex((p) => p.id === id)
    if (i < 0) return
    ev.preventDefault()
    if (op.antesDaFila?.(i, id)) return
    irPara(i)
  }

  onMounted(() => {
    reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.addEventListener('resize', remedir)
    window.addEventListener('bzj:ir', pedidoDaFila)
    if (op.palco.value && 'ResizeObserver' in window) {
      ro = new ResizeObserver(remedir)
      ro.observe(op.palco.value)
    }
    op.aoMedirLayout?.()
    if (op.secao.value && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((ents) => {
        for (const e of ents) (e.isIntersecting ? ligar : desligar)()
      }, { rootMargin: '50% 0px 50% 0px' })
      io.observe(op.secao.value)
    } else ligar()
    medir()
  })
  onBeforeUnmount(() => {
    desligar()
    io?.disconnect()
    ro?.disconnect()
    window.removeEventListener('resize', remedir)
    window.removeEventListener('bzj:ir', pedidoDaFila)
  })

  const registrar = (i: number) => (el: unknown) => { if (el) passos[i] = el as HTMLElement }
  return { ativo, progresso, preso, passos, registrar, irPara, naRegua, focoNaRegua, linhaDeFoco, medir: agendar, reduzMovimento: () => reduz }
}

/** "01", "02"… */
export const n2 = (i: number) => String(i + 1).padStart(2, '0')
