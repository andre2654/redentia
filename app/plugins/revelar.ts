/**
 * `v-revelar`: a entrada ao rolar sem esconder nada (11/11/2026, robustez;
 * docs/aportou/robustez.md, seção 5).
 *
 *   <section v-revelar>…</section>
 *   <ul v-revelar="{ alvo: 'filhos', passo: 60 }">…</ul>
 *   <div v-revelar="{ y: 20 }">…</div>
 *
 * Universal: no servidor a diretiva só precisa existir (getSSRProps vazio),
 * e o HTML sai inteiro, visível (o print e o Google veem tudo). No cliente, ao
 * montar: se o elemento nasceu abaixo da dobra (e sem movimento reduzido, e com
 * IntersectionObserver), ele é observado; quando chega a 20% da altura da tela
 * abaixo da borda de baixo, roda UMA Web Animation: opacidade 0 → 1, 14px → 0
 * (a propriedade `translate`, que soma com o transform que o elemento já tiver)
 * e desfoque de 6px → 0, em 720ms na curva --nu-ease-saida, com fill
 * 'backwards' (antes de começar, ele não está escondido por CSS nenhum). Com
 * `alvo: 'filhos'` cada filho direto entra `passo` ms depois do anterior (a
 * cascata para no 8º; os outros entram com ele). Depois, o elemento sai do
 * observador. Na impressão, o que está entrando termina na hora.
 * As contas puras (e o teste delas) estão em utils/revelar.ts.
 */
import type { Directive } from 'vue'
import { atrasoDoFilho, deveRevelar, REVELACAO, type ValorRevelar } from '~/utils/revelar'

declare module 'vue' {
  interface GlobalDirectives {
    vRevelar: Directive<HTMLElement, ValorRevelar | undefined>
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const pedidos = new WeakMap<Element, ValorRevelar>()
  const rodando = new Set<Animation>()
  let observador: IntersectionObserver | null = null

  function revelar(el: HTMLElement, v: ValorRevelar) {
    const alvos = v.alvo === 'filhos' ? (Array.from(el.children) as HTMLElement[]) : [el]
    const y = Number.isFinite(v.y) ? v.y! : REVELACAO.y
    const passo = v.passo ?? REVELACAO.passo
    alvos.forEach((a, i) => {
      const css = getComputedStyle(a)
      // termina na opacidade e no filtro que o CSS já dá ao elemento (sem salto no fim)
      const opacidade = css.opacity || '1'
      const semFiltro = !css.filter || css.filter === 'none'
      const anim = a.animate([
        { opacity: 0, translate: `0 ${y}px`, ...(semFiltro ? { filter: `blur(${REVELACAO.desfoque}px)` } : {}) },
        { opacity: opacidade, translate: '0 0', ...(semFiltro ? { filter: 'none' } : {}) },
      ], { duration: REVELACAO.duracao, easing: REVELACAO.curva, delay: atrasoDoFilho(i, passo), fill: 'backwards' })
      rodando.add(anim)
      const solta = () => rodando.delete(anim)
      anim.addEventListener('finish', solta)
      anim.addEventListener('cancel', solta)
    })
  }

  function observar(): IntersectionObserver {
    observador ??= new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue
        observador!.unobserve(e.target)
        const v = pedidos.get(e.target)
        pedidos.delete(e.target)
        if (v) revelar(e.target as HTMLElement, v)
      }
    }, { rootMargin: REVELACAO.margem })
    return observador
  }

  if (import.meta.client) {
    // impresso ou salvo em PDF no meio da entrada: tudo no lugar
    window.addEventListener('beforeprint', () => { for (const a of rodando) a.finish() })
  }

  nuxtApp.vueApp.directive<HTMLElement, ValorRevelar | undefined>('revelar', {
    getSSRProps: () => ({}),
    mounted(el, b) {
      if (typeof IntersectionObserver === 'undefined' || typeof el.animate !== 'function') return
      const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (!deveRevelar(el.getBoundingClientRect().top, window.innerHeight, reduzido)) return
      pedidos.set(el, b.value ?? {})
      observar().observe(el)
    },
    unmounted(el) {
      if (pedidos.delete(el)) observador?.unobserve(el)
    },
  })
})
