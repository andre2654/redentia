/**
 * Fit-text do número-herói (UX do dono 2026-07-11, extraído do HomeHero no
 * PR8 — o hero da /carteira usa o MESMO padrão): o texto SEMPRE ocupa uma
 * linha só, no maior tamanho que couber — o clamp() do CSS é o teto, daqui
 * só encolhe (nunca estica além do design). Reage a resize e a mudanças do
 * texto (ex.: toggle da máscara de privacidade muda a largura).
 *
 * Uso: const { el } = useFitText(watchSource) + ref="el" no elemento com
 * white-space:nowrap/overflow:hidden (classe *--fit).
 */
export function useFitText(source?: Ref<unknown> | ComputedRef<unknown>) {
  const el = ref<HTMLElement | null>(null)

  function fit() {
    const node = el.value
    if (!node) return
    node.style.fontSize = ''
    const base = parseFloat(getComputedStyle(node).fontSize)
    if (node.scrollWidth > node.clientWidth) {
      node.style.fontSize = `${Math.max(30, Math.floor(base * (node.clientWidth / node.scrollWidth) * 0.985))}px`
    }
  }

  let ro: ResizeObserver | null = null
  onMounted(() => {
    fit()
    ro = new ResizeObserver(fit)
    if (el.value) ro.observe(el.value)
  })
  onBeforeUnmount(() => { ro?.disconnect() })
  if (source) watch(source, () => nextTick(fit))

  return { el, fit }
}
