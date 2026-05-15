/**
 * useAiCursor
 *
 * Orquestra a feature "ask anywhere":
 *   - listener global de mousemove com debounce nativo (idle timer)
 *   - após `idleMs` parado: captura contexto via extractCursorContext
 *   - mostra overlay e enche o anel em `loadMs`
 *   - quando o usuário confirma: persiste contexto + emite onConfirm
 *
 * Cancela em scroll, wheel, keydown, troca de rota, mouseleave.
 *
 * Setado no escopo do componente que invoca (lab page hoje, plugin global
 * amanhã). Cleanup em onBeforeUnmount.
 */

import {
  extractCursorContext,
  isSuppressedZone,
  suggestQuestion,
  type CursorContext,
} from '~/utils/extractCursorContext'

export type CursorPhase = 'idle' | 'loading' | 'ready'

export interface UseAiCursorOptions {
  /** ms parado antes de mostrar overlay (aceita Ref pra hot-tuning) */
  idleMs?: number | Ref<number>
  /** ms pra encher o anel após overlay aparecer (aceita Ref) */
  loadMs?: number | Ref<number>
  /** Liga/desliga reativamente sem unmount (Ref ou ComputedRef) */
  enabled?: Ref<boolean> | ComputedRef<boolean>
  /** Callback no confirm. Recebe o contexto capturado. */
  onConfirm?: (ctx: CursorContext) => void
  /** Callback informativo a cada captura (debug/telemetria) */
  onCapture?: (ctx: CursorContext | null) => void
}

const STORAGE_KEY = 'aiCursorCtx'

function readMs(v: number | Ref<number> | undefined, fallback: number): number {
  const raw = unref(v)
  return typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? raw : fallback
}

export function useAiCursor(opts: UseAiCursorOptions = {}) {
  const idleMsGet = () => readMs(opts.idleMs, 1000)
  const loadMsGet = () => readMs(opts.loadMs, 2000)

  const phase = ref<CursorPhase>('idle')
  const visible = ref(false)
  const x = ref(0)
  const y = ref(0)
  const progress = ref(0)
  const lastContext = ref<CursorContext | null>(null)
  const teaser = ref('')
  const breadcrumb = ref('')

  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let rafId: number | null = null
  let phaseStart = 0
  let lastMoveTs = 0

  const route = useRoute()

  function clearTimers() {
    if (idleTimer) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function reset() {
    clearTimers()
    phase.value = 'idle'
    visible.value = false
    progress.value = 0
  }

  function startLoading() {
    if (opts.enabled && !opts.enabled.value) return

    const ctx = extractCursorContext(x.value, y.value, {
      routePath: route.path,
      routeParams: route.params,
      pageTitle: typeof document !== 'undefined' ? document.title : '',
    })

    opts.onCapture?.(ctx)
    if (!ctx) return

    lastContext.value = ctx
    teaser.value = suggestQuestion(ctx)
    breadcrumb.value = ctx.semanticBreadcrumb
    phase.value = 'loading'
    visible.value = true
    progress.value = 0
    phaseStart = performance.now()
    tick()
  }

  function tick() {
    if (phase.value !== 'loading') return
    const elapsed = performance.now() - phaseStart
    progress.value = Math.min(elapsed / loadMsGet(), 1)
    if (progress.value >= 1) {
      phase.value = 'ready'
      progress.value = 1
      return
    }
    rafId = requestAnimationFrame(tick)
  }

  function onMouseMove(e: MouseEvent) {
    if (opts.enabled && !opts.enabled.value) {
      reset()
      return
    }

    // Throttle leve: ignora movimentos < 16ms (60fps)
    const now = performance.now()
    if (now - lastMoveTs < 16) return
    lastMoveTs = now

    x.value = e.clientX
    y.value = e.clientY

    // Qualquer movimento durante loading/ready cancela
    if (phase.value !== 'idle') {
      reset()
    }

    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => startLoading(), idleMsGet())
  }

  function onMouseLeave() {
    reset()
  }

  function onScroll() {
    reset()
  }

  function onKeydown(e: KeyboardEvent) {
    if (!visible.value) return

    if (e.key === 'Escape') {
      e.preventDefault()
      reset()
      return
    }
    if (e.key === 'Enter' && phase.value === 'ready') {
      e.preventDefault()
      confirm()
    }
  }

  function confirm() {
    const ctx = lastContext.value
    if (!ctx) {
      reset()
      return
    }

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx))
      }
      catch {
        // sessionStorage cheio ou desabilitado, ignore
      }
    }

    opts.onConfirm?.(ctx)
    reset()
  }

  function dismiss() {
    reset()
  }

  // ---------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------
  onMounted(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('wheel', onScroll, { passive: true })
    window.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseleave', onMouseLeave)
    window.removeEventListener('scroll', onScroll, { capture: true } as any)
    window.removeEventListener('wheel', onScroll)
    window.removeEventListener('keydown', onKeydown)
    reset()
  })

  // Cancela ao trocar de rota
  watch(() => route.fullPath, () => reset())

  return {
    phase,
    visible,
    x,
    y,
    progress,
    lastContext,
    teaser,
    breadcrumb,
    confirm,
    dismiss,
    isSuppressedZone,
  }
}
