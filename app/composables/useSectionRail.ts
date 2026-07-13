/**
 * Banner contextual / "section rail" (PR-R6, André 2026-07-12).
 *
 * Cada página que TEM seções navegáveis declara-as no seu setup via
 * `useSectionRail([{ id, label }], { pageLabel })`. O layout lê o mesmo
 * `useState('nu:section-rail')`: se houver seções renderiza o `NuSectionRail`
 * (pílulas + scrollspy) no lugar da faixa "Mercado agora"; senão mantém o
 * `NuMarketTicker` — automático, sem tocar nas outras páginas.
 *
 * SSR / hidratação (nuance do Nuxt): o template do LAYOUT é avaliado ANTES do
 * setup da página-filho (slot), então no render SSR o estado ainda seria null
 * quando o layout decide ticker×rail — ou seja, o rail NUNCA sairia no HTML por
 * este caminho. Pior: se setássemos o estado no servidor, ele iria no payload e
 * o cliente hidrataria o RAIL sobre um HTML que tem o TICKER → mismatch de
 * hidratação. Por isso a MUTAÇÃO do estado é client-only: SSR e 1º render do
 * cliente batem no ticker (sem mismatch); a troca pro rail é um update reativo
 * pós-hidratação, no mesmo tick do setup da página. Faixa de mesma altura →
 * zero layout shift, flip de 1 frame. /carteira é noindex, então o conteúdo da
 * faixa no HTML SSR é irrelevante pra SEO. (Casa também com "rail só quando
 * conectado", que só se sabe depois do fetch. Upgrade p/ SSR imediato = mover a
 * decisão pro route meta — mas aí perde o "só quando conectado"; fora de escopo.)
 */
export interface RailSection {
  id: string
  label: string
}

export interface RailState {
  sections: RailSection[]
  pageLabel: string
  /** id da invocação — protege o clear no unmount de apagar o rail de outra rota */
  _owner: number
}

let _railSeq = 0

export function useSectionRail(
  sections: MaybeRefOrGetter<RailSection[]>,
  opts: { pageLabel?: string } = {},
) {
  const state = useState<RailState | null>('nu:section-rail', () => null)
  const owner = ++_railSeq

  const resolve = () => {
    const list = toValue(sections)
    state.value = list && list.length
      ? { sections: list, pageLabel: opts.pageLabel ?? '', _owner: owner }
      : (state.value?._owner === owner ? null : state.value)
  }

  // MUTAÇÃO client-only (ver nota de SSR acima): evita mismatch de hidratação.
  if (import.meta.client) {
    resolve()

    // acompanha seções reativas (ex.: carteira que só declara quando conectada)
    if (isRef(sections) || typeof sections === 'function') {
      watch(() => toValue(sections), resolve, { deep: true })
    }

    // limpa ao sair da rota — só se o rail ainda for NOSSO (a próxima página
    // pode já ter setado o dela no seu setup antes do nosso onUnmounted).
    onUnmounted(() => {
      if (state.value?._owner === owner) state.value = null
    })
  }

  return state
}

/**
 * Scroll suave até uma seção do rail. Usa `scrollIntoView` que respeita o
 * `scroll-margin-top` das seções (compensa header sticky + a faixa do rail),
 * então o cálculo de offset vive no CSS — 1 fonte de verdade.
 * prefers-reduced-motion → scroll instantâneo.
 */
export function scrollToRailSection(id: string) {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (!el) return
  const reduce = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
