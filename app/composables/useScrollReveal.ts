/**
 * useScrollReveal — IntersectionObserver-based reveal-on-scroll.
 *
 * Aplica a classe `is-revealed` em qualquer elemento com a classe
 * `reveal-on-scroll` quando entra na viewport (threshold 0.15).
 *
 * Uma vez revelado, deixa a classe permanente (no re-trigger). Isso
 * mantém o efeito sutil — usuário scrolla, vê fade-in 1×, segue.
 *
 * Usage no template:
 *   <div class="reveal-on-scroll">...</div>
 *
 * No CSS da página:
 *   .reveal-on-scroll {
 *     opacity: 0;
 *     transform: translateY(28px);
 *     transition: opacity 700ms cubic-bezier(0.4, 0, 0.2, 1),
 *                 transform 700ms cubic-bezier(0.4, 0, 0.2, 1);
 *   }
 *   .reveal-on-scroll.is-revealed {
 *     opacity: 1;
 *     transform: translateY(0);
 *   }
 *
 * Variantes possíveis (o caller decide):
 *   .reveal-on-scroll--from-left  → translateX(-32px)
 *   .reveal-on-scroll--from-right → translateX(32px)
 *   .reveal-on-scroll--scale      → scale(0.96)
 *   .reveal-on-scroll--delay-1    → transition-delay: 100ms
 *   ...
 *
 * Roda só client-side (SSR retorna mock). IntersectionObserver
 * é nativo, sem polyfill (suportado em todo browser moderno).
 */
export function useScrollReveal(options: {
  threshold?: number
  rootMargin?: string
  once?: boolean
} = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', once = true } = options

  let observer: IntersectionObserver | null = null

  function init() {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            if (once && observer) observer.unobserve(entry.target)
          } else if (!once) {
            entry.target.classList.remove('is-revealed')
          }
        }
      },
      { threshold, rootMargin },
    )

    // Observe todos os elementos com .reveal-on-scroll que ja estao no DOM
    const elements = document.querySelectorAll('.reveal-on-scroll')
    elements.forEach((el) => observer!.observe(el))
  }

  function destroy() {
    observer?.disconnect()
    observer = null
  }

  onMounted(() => {
    // Espera o próximo tick pra garantir que o DOM tá pintado
    nextTick(() => init())
  })

  onBeforeUnmount(() => destroy())

  return { observer: () => observer }
}

/**
 * useAnimatedCounter — anima um número de `from` até `to` em
 * `duration` ms, easeOutCubic.
 *
 * Retorna `currentValue` (ref) que pode ser usado no template.
 * Inicia automaticamente quando `triggerEl` (ou window) fica visível.
 *
 * Usage:
 *   const total = ref<HTMLElement | null>(null)
 *   const { currentValue } = useAnimatedCounter({ to: 1247, trigger: total })
 *   ...
 *   <span ref="total">{{ currentValue.toLocaleString('pt-BR') }}</span>
 */
export function useAnimatedCounter(opts: {
  to: number
  from?: number
  duration?: number
  triggerEl?: Ref<HTMLElement | null>
  startImmediately?: boolean
}) {
  const { to, from = 0, duration = 1400, triggerEl, startImmediately = false } = opts

  const currentValue = ref(from)
  let started = false

  function start() {
    if (started) return
    started = true
    const startTime = performance.now()
    const range = to - from

    function step(now: number) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      currentValue.value = Math.round(from + range * eased)
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    if (startImmediately) {
      start()
      return
    }

    if (!triggerEl) {
      // Sem trigger, comeca depois de 200ms (boa pratica pra evitar
      // animacao no first paint).
      setTimeout(start, 200)
      return
    }

    // Espera o triggerEl entrar na viewport
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          start()
          obs.disconnect()
        }
      },
      { threshold: 0.4 },
    )

    nextTick(() => {
      if (triggerEl.value) obs.observe(triggerEl.value)
    })

    onBeforeUnmount(() => obs.disconnect())
  })

  return { currentValue }
}

/**
 * useScrollProgress — rastreia o progresso de scroll (0-1) DENTRO de
 * uma section especifica.
 *
 * 0   = topo da section acabou de bater no topo do viewport (entrada)
 * 1   = bottom da section bateu no bottom do viewport (saida)
 *
 * Util pra scroll-driven animations: o consumer atualiza CSS vars
 * (`element.style.setProperty('--p', progress)`) ou usa o ref
 * direto em :style.
 *
 * Usa rAF + passive scroll listener pra performance. So escuta
 * scroll quando a section esta visivel (IntersectionObserver gate).
 */
export function useScrollProgress(targetRef: Ref<HTMLElement | null>) {
  const progress = ref(0)
  let frame: number | null = null
  let visible = false
  let observer: IntersectionObserver | null = null

  function compute() {
    if (!targetRef.value) return
    const rect = targetRef.value.getBoundingClientRect()
    const sectionHeight = targetRef.value.offsetHeight
    const viewportHeight = window.innerHeight

    // Distancia "scrollavel": altura da section - altura viewport
    // Quando rect.top vai de 0 (entrada) ate -(sectionHeight - viewport),
    // a animacao percorre de 0 a 1.
    const scrollableDistance = Math.max(1, sectionHeight - viewportHeight)
    const scrolled = -rect.top
    const raw = scrolled / scrollableDistance
    progress.value = Math.max(0, Math.min(1, raw))
  }

  function onScroll() {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = null
      compute()
    })
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    // IntersectionObserver pra so escutar scroll quando a section
    // esta no viewport (otimizacao)
    observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false
        if (visible) {
          window.addEventListener('scroll', onScroll, { passive: true })
          compute()
        } else {
          window.removeEventListener('scroll', onScroll)
        }
      },
      { threshold: 0 },
    )

    nextTick(() => {
      if (targetRef.value) {
        observer!.observe(targetRef.value)
        compute()
      }
    })
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    window.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
  })

  return { progress }
}
