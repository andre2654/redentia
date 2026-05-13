// Timeline driver for the Raio-X Highlights cinematic experience.
// Spotify-Wrapped-style story mode: auto-advance per slide, tap-to-skip,
// hold-to-pause, keyboard nav, swipe gestures, esc to close.
//
// Each slide declares its own duration; the composable orchestrates
// progress (0-1) inside the active slide, exposes navigation methods,
// and emits a `done` signal when the last slide finishes.

import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

export interface HighlightsSlideMeta {
  id: string
  durationMs: number
}

export interface UseHighlightsTimelineOptions {
  slides: HighlightsSlideMeta[]
  onDone?: () => void
  autoStart?: boolean
}

export function useHighlightsTimeline(opts: UseHighlightsTimelineOptions) {
  const currentIndex = ref(0)
  const progress = ref(0)           // 0..1 dentro do slide atual
  const paused = ref(false)
  const finished = ref(false)

  let rafId: number | null = null
  let slideStart = 0
  let pausedElapsed = 0
  let lastTick = 0

  const currentSlide = computed(() => opts.slides[currentIndex.value] ?? null)

  function reset() {
    currentIndex.value = 0
    progress.value = 0
    paused.value = false
    finished.value = false
    pausedElapsed = 0
    slideStart = performance.now()
    lastTick = slideStart
  }

  function tick(now: number) {
    if (finished.value) return
    if (paused.value) {
      lastTick = now
      rafId = requestAnimationFrame(tick)
      return
    }
    const slide = currentSlide.value
    if (!slide) return

    const elapsed = now - slideStart
    progress.value = Math.min(1, elapsed / slide.durationMs)

    if (progress.value >= 1) {
      advance()
    }
    lastTick = now
    rafId = requestAnimationFrame(tick)
  }

  function start() {
    if (rafId != null) cancelAnimationFrame(rafId)
    slideStart = performance.now()
    lastTick = slideStart
    rafId = requestAnimationFrame(tick)
  }

  function stop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function advance() {
    if (currentIndex.value >= opts.slides.length - 1) {
      // Already on the LAST slide. Stay put — the last slide is
      // user-controlled (share screen). Do NOT fire onDone here, or
      // a stray tap-next on mobile would close the modal before the
      // user can interact with the share cards. The user closes the
      // modal explicitly via the X button.
      finished.value = true
      progress.value = 1
      stop()
      return
    }
    currentIndex.value += 1
    progress.value = 0
    slideStart = performance.now()
  }

  function rewind() {
    if (currentIndex.value === 0) {
      progress.value = 0
      slideStart = performance.now()
      return
    }
    currentIndex.value -= 1
    progress.value = 0
    slideStart = performance.now()
  }

  function goTo(index: number) {
    const target = Math.max(0, Math.min(opts.slides.length - 1, index))
    currentIndex.value = target
    progress.value = 0
    slideStart = performance.now()
    finished.value = false
  }

  function pause() {
    if (paused.value) return
    paused.value = true
    pausedElapsed = performance.now() - slideStart
  }

  function resume() {
    if (!paused.value) return
    paused.value = false
    slideStart = performance.now() - pausedElapsed
  }

  // ============ Keyboard ============
  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      advance()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      rewind()
    } else if (e.key === 'Escape') {
      finished.value = true
      stop()
      opts.onDone?.()
    }
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('keydown', onKey)
    if (opts.autoStart !== false) start()
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', onKey)
    }
    stop()
  })

  // Restart timer whenever slide changes externally
  watch(currentIndex, () => {
    slideStart = performance.now()
    pausedElapsed = 0
    progress.value = 0
  })

  return {
    currentIndex,
    currentSlide,
    progress,
    paused,
    finished,
    advance,
    rewind,
    goTo,
    pause,
    resume,
    start,
    stop,
    reset,
  }
}
