/**
 * Listener de scroll/resize rAF-throttled (padrão do runtime dos designs .dc:
 * flag `_tick` + requestAnimationFrame, passive, cleanup no unmount, 1ª medida
 * no mount). Compartilhado por NuScrollProgress, NuTocSidebar e
 * NuStepsTimeline (PR4) — 1 implementação por responsabilidade.
 */
export function useNuScrollFrame(update: () => void) {
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      update()
    })
  }
  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
}
